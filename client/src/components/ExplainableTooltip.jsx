// client/src/components/ExplainableTooltip.jsx
import React, { useState } from 'react';
import { HelpCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ExplainableTooltip({ rationaleEn, rationaleKn }) {
  const [isOpen, setIsOpen] = useState(true);
  const { lang, t, isKannada } = useLanguage();

  const explanationText = (isKannada && rationaleKn) ? rationaleKn : (rationaleEn || "This question helps the clinical engine assess the exact duration and severity to guide physician triage.");

  return (
    <div style={{
      marginTop: '0.85rem',
      background: 'rgba(99, 102, 241, 0.12)',
      border: '1px solid rgba(99, 102, 241, 0.35)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.25s ease'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          background: 'transparent',
          border: 'none',
          color: '#a5b4fc',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ color: '#c7d2fe' }}>
            {t('whyAsking')}
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            background: 'rgba(99, 102, 241, 0.25)',
            color: '#e0e7ff',
            fontWeight: 700
          }}>
            EXPLAINABLE AI
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{
          padding: '0.5rem 1rem 0.85rem 1rem',
          borderTop: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.85rem',
          color: '#e0e7ff',
          lineHeight: '1.45',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem'
        }}>
          <HelpCircle size={17} color="#a5b4fc" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0 }}>
              {explanationText}
            </p>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              💡 Clinical rationale shared for patient transparency & health literacy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
