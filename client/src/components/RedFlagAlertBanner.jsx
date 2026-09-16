// client/src/components/RedFlagAlertBanner.jsx
import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, HeartPulse, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function RedFlagAlertBanner({ redFlagReport, showActions = true, isCompact = false }) {
  const { lang, t } = useLanguage();

  if (!redFlagReport || !redFlagReport.isRedFlag) {
    return null;
  }

  const flags = redFlagReport.flags || [];

  if (isCompact) {
    return (
      <div style={{
        background: 'rgba(255, 45, 85, 0.15)',
        border: '1.5px solid #ff2d55',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#ff6b8b'
      }}>
        <AlertOctagon size={22} color="#ff2d55" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>
            {t('urgentAlertTitle')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#ffb3c1' }}>
            {flags.map(f => f.title).join(' • ')}
          </div>
        </div>
        <span style={{
          background: '#ff2d55',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '0.25rem 0.6rem',
          borderRadius: '6px'
        }}>
          TRIAGE PRIORITY 1
        </span>
      </div>
    );
  }

  return (
    <div className="emergency-card-alert" style={{
      background: 'rgba(255, 45, 85, 0.08)',
      border: '1.5px solid #ff2d55',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 20px rgba(255, 45, 85, 0.15)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff2d55, #c9184a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 45, 85, 0.4)'
          }}>
            <ShieldAlert size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>
                {t('urgentAlertTitle')}
              </h3>
              <span style={{
                background: '#ff2d55',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.7rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                letterSpacing: '0.05em'
              }}>
                STAT / IMMEDIATE ATTENTION
              </span>
            </div>
            <p style={{ color: '#ffccd5', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {t('urgentAlertDesc')}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 45, 85, 0.4)',
          color: '#ff85a1',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          <Clock size={15} />
          <span>Door-to-Doctor Target: &lt;10 Mins</span>
        </div>
      </div>

      {/* Flag List */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {flags.map((flag, idx) => (
          <div key={idx} style={{
            background: 'rgba(0, 0, 0, 0.35)',
            borderLeft: '4px solid #ff2d55',
            borderRadius: '8px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={18} color="#ff2d55" />
                <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                  {flag.title}
                </strong>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255, 45, 85, 0.3)',
                color: '#ff99ad'
              }}>
                SEVERITY: {flag.severity || 'CRITICAL'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '0.4rem', lineHeight: '1.4' }}>
              {lang === 'kn' && flag.rationaleKn ? flag.rationaleKn : flag.rationale}
            </p>

            {flag.triggerEvidence && (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>Detected Trigger:</span> <span style={{ color: '#ffb3c1' }}>"{flag.triggerEvidence}"</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Safety Notice */}
      <div style={{
        marginTop: '1rem',
        padding: '0.65rem 0.9rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.75rem',
        color: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <HeartPulse size={16} color="#00e5a3" style={{ flexShrink: 0 }} />
        <span>
          <strong>Clinical Decision Support Disclaimer:</strong> This system assists with early triage identification. It is NOT an autonomous doctor and does NOT provide a final diagnosis. Immediate bedside clinical examination is required.
        </span>
      </div>
    </div>
  );
}
