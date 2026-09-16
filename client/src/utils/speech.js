// client/src/utils/speech.js
// Robust Multilingual Speech Synthesis & Recognition Helper (English & Kannada)

class SpeechController {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.voices = [];
    this.watchdogTimer = null;
    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = this.synth.getVoices() || [];
      };
    }
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  /**
   * Play an audible acoustic chime using Web Audio API for guaranteed feedback
   */
  playChime(type = 'start') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      } else {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      // AudioContext might require user interaction, safe to ignore
    }
  }

  /**
   * Speak text in either English or Kannada
   */
  speak(text, lang = 'en', onEnd = null) {
    if (!this.synth || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();
    this.playChime('start');

    if (this.synth.paused) {
      this.synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const availableVoices = this.voices.length > 0 ? this.voices : (this.synth.getVoices() || []);
    this.voices = availableVoices;

    if (lang === 'kn') {
      utterance.lang = 'kn-IN';
      utterance.rate = 0.90; // natural pacing for Kannada
      utterance.pitch = 1.0;

      // Find Kannada voice
      const knVoice = availableVoices.find(v => 
        v.lang.toLowerCase().includes('kn') || 
        v.name.toLowerCase().includes('kannada')
      );

      const indianVoice = availableVoices.find(v => 
        v.lang.toLowerCase().includes('en-in') || 
        v.lang.toLowerCase().includes('hi-in') || 
        v.name.toLowerCase().includes('india')
      );

      if (knVoice) {
        utterance.voice = knVoice;
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const inVoice = availableVoices.find(v => 
        v.lang === 'en-IN' || 
        v.name.toLowerCase().includes('india')
      );
      if (inVoice) utterance.voice = inVoice;
    }

    let finished = false;
    const cleanUp = () => {
      if (finished) return;
      finished = true;
      if (this.watchdogTimer) {
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = null;
      }
      if (onEnd) onEnd();
    };

    utterance.onend = cleanUp;
    utterance.onerror = (err) => {
      console.warn("Speech synthesis notice:", err);
      cleanUp();
    };

    // Watchdog timer in case speech synthesis engine drops without event (max 15s)
    this.watchdogTimer = setTimeout(cleanUp, 15000);

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.error("Failed to speak utterance:", e);
      cleanUp();
    }
  }

  stopSpeaking() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  /**
   * Start listening using SpeechRecognition
   */
  startListening({ lang = 'en', onResult, onInterim, onError, onEnd }) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onError) onError(new Error("Speech recognition is not supported in this browser. Please use text input or touch options."));
      return false;
    }

    try {
      this.recognition.abort();
    } catch (e) {}

    this.playChime('start');
    this.recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
    this.isListening = true;

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (onInterim && interim) onInterim(interim);
      if (onResult && final) onResult(final);
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      this.isListening = false;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      this.isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {}
      this.isListening = false;
      this.playChime('stop');
    }
  }
}

export const speechController = new SpeechController();
