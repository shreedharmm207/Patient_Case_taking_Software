// client/src/components/PainScaleSelector.jsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PainScaleSelector({ value, onChange }) {
  const { t, isKannada } = useLanguage();

  const scales = [
    { num: 1, label: isKannada ? 'ಕನಿಷ್ಠ' : 'Very Mild', emoji: '😊', category: 'mild', color: '#10b981' },
    { num: 2, label: isKannada ? 'ಸ್ವಲ್ಪ' : 'Mild', emoji: '🙂', category: 'mild', color: '#10b981' },
    { num: 3, label: isKannada ? 'ಸಾಧಾರಣ' : 'Noticeable', emoji: '😐', category: 'mild', color: '#10b981' },
    { num: 4, label: isKannada ? 'ಮಧ್ಯಮ' : 'Moderate', emoji: '🙁', category: 'moderate', color: '#f59e0b' },
    { num: 5, label: isKannada ? 'ಅಸ್ವಸ್ಥತೆ' : 'Distracting', emoji: '😟', category: 'moderate', color: '#f59e0b' },
    { num: 6, label: isKannada ? 'ಕಷ್ಟಕರ' : 'Distressing', emoji: '😣', category: 'moderate', color: '#f59e0b' },
    { num: 7, label: isKannada ? 'ತೀವ್ರ' : 'Severe', emoji: '😖', category: 'severe', color: '#ef4444' },
    { num: 8, label: isKannada ? 'ಅತಿ ತೀವ್ರ' : 'Very Severe', emoji: '😫', category: 'severe', color: '#ef4444' },
    { num: 9, label: isKannada ? 'ಅಸಹನೀಯ' : 'Excruciating', emoji: '😭', category: 'critical', color: '#ff2d55' },
    { num: 10, label: isKannada ? 'ಉಗ್ರ ನೋವು' : 'Worst Pain', emoji: '🛑', category: 'critical', color: '#ff2d55' }
  ];

  return (
    <div style={{ marginTop: '1rem', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
          {t('painScaleQuestion')}
        </span>
        {value && (
          <span style={{
            fontSize: '1rem',
            fontWeight: 800,
            padding: '0.2rem 0.75rem',
            borderRadius: '999px',
            background: value >= 7 ? 'rgba(255, 45, 85, 0.25)' : value >= 4 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            color: value >= 7 ? '#ff5277' : value >= 4 ? '#fbbf24' : '#34d399',
            border: `1px solid ${value >= 7 ? '#ff2d55' : value >= 4 ? '#f59e0b' : '#10b981'}`
          }}>
            Level {value}/10 {value >= 7 ? '⚠️ Urgent' : ''}
          </span>
        )}
      </div>

      {/* Grid of 10 Large Touch Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
        gap: '0.5rem'
      }}>
        {scales.map((item) => {
          const isSelected = value === item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => onChange(item.num, `${item.num}/10 (${item.label})`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.35rem',
                borderRadius: '12px',
                border: isSelected ? `2.5px solid ${item.color}` : '1.5px solid rgba(255, 255, 255, 0.1)',
                background: isSelected ? `${item.color}25` : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? `0 0 16px ${item.color}50` : 'none'
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: '1.2' }}>{item.emoji}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>{item.num}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.6rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        padding: '0 0.25rem'
      }}>
        <span style={{ color: '#10b981' }}>🟢 1-3: {t('painMild')}</span>
        <span style={{ color: '#f59e0b' }}>🟡 4-6: {t('painModerate')}</span>
        <span style={{ color: '#ff2d55' }}>🔴 7-10: {t('painSevere')}</span>
      </div>
    </div>
  );
}
