// client/src/components/AudioPromptPlayer.jsx
import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechController } from '../utils/speech';

export default function AudioPromptPlayer({ textEn, textKn }) {
  const [activeLang, setActiveLang] = useState(null); // 'en' | 'kn' | null

  const handlePlay = (lang) => {
    if (activeLang === lang) {
      speechController.stopSpeaking();
      setActiveLang(null);
      return;
    }

    speechController.stopSpeaking();
    setActiveLang(lang);
    const text = lang === 'kn' ? (textKn || textEn) : textEn;
    
    speechController.speak(text, lang, () => {
      setActiveLang(null);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
      {/* English Audio Button */}
      {textEn && (
        <button
          type="button"
          onClick={() => handlePlay('en')}
          title="Listen to question in English"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            border: activeLang === 'en' ? '1.5px solid #00e5a3' : '1px solid rgba(0, 229, 163, 0.3)',
            background: activeLang === 'en' ? 'rgba(0, 229, 163, 0.25)' : 'rgba(0, 229, 163, 0.08)',
            color: '#00e5a3',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.78rem',
            transition: 'all 0.2s ease'
          }}
        >
          {activeLang === 'en' ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>Audio (English)</span>
        </button>
      )}

      {/* Kannada Audio Button */}
      {textKn && (
        <button
          type="button"
          onClick={() => handlePlay('kn')}
          title="ಪ್ರಶ್ನೆಯನ್ನು ಕನ್ನಡ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            border: activeLang === 'kn' ? '1.5px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.35)',
            background: activeLang === 'kn' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.08)',
            color: '#c084fc',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.78rem',
            transition: 'all 0.2s ease'
          }}
        >
          {activeLang === 'kn' ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>ಧ್ವನಿ (Kannada)</span>
        </button>
      )}
    </div>
  );
}
