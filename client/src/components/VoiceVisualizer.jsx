// client/src/components/VoiceVisualizer.jsx
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function VoiceVisualizer({ isListening, transcript, onStop, onStart }) {
  const { isKannada, t } = useLanguage();

  return (
    <div style={{
      background: isListening ? 'rgba(0, 229, 163, 0.12)' : 'rgba(255, 255, 255, 0.04)',
      border: isListening ? '2px solid #00e5a3' : '1px dashed rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.85rem',
      transition: 'all 0.3s ease',
      boxShadow: isListening ? '0 0 25px rgba(0, 229, 163, 0.2)' : 'none'
    }}>
      {/* Mic Button & Waves */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '30px' }}>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
          </div>
        )}

        <button
          type="button"
          onClick={isListening ? onStop : onStart}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isListening ? 'linear-gradient(135deg, #0284c7, #00b4d8)' : 'linear-gradient(135deg, #00e5a3, #00b4d8)',
            border: 'none',
            color: '#04151f',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isListening ? '0 0 20px rgba(0, 180, 216, 0.5)' : '0 4px 18px rgba(0, 229, 163, 0.35)',
            transform: isListening ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Mic size={28} />
        </button>

        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '30px' }}>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
          </div>
        )}
      </div>

      {/* Status Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: isListening ? '#00e5a3' : 'var(--text-main)'
        }}>
          {isListening ? (
            isKannada ? 'ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ' : 'Listening... Speak in English or Kannada'
          ) : (
            t('tapToSpeak')
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {isListening ? (
            isKannada ? 'ಮಾತನಾಡುವುದು ಮುಗಿದಾಗ ನಿಲ್ಲಿಸಲು ಗುಂಡಿಯನ್ನು ಒತ್ತಿ' : 'Tap microphone button again to finish recording'
          ) : (
            isKannada ? 'ಕನ್ನಡ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿದೆ (kn-IN)' : 'Supports regional Indian accents & Kannada speech (kn-IN)'
          )}
        </p>
      </div>

      {/* Live Transcript Display */}
      {transcript && (
        <div style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(0, 229, 163, 0.3)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontSize: '0.95rem',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#00e5a3', fontWeight: 700, textTransform: 'uppercase' }}>
              ✓ Recognized Voice Input:
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live Transcribed</span>
          </div>
          <p style={{ margin: 0, fontStyle: 'italic' }}>"{transcript}"</p>
        </div>
      )}
    </div>
  );
}
