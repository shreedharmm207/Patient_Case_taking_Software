// client/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope,
  Activity,
  Globe,
  ShieldAlert,
  BarChart3,
  UserCheck,
  LogOut,
  Volume2
} from 'lucide-react';
import { getConsultations } from '../utils/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { lang, setLang, t, speak, isKannada } = useLanguage();
  const { user, signOut } = useAuth();
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    const checkUrgent = async () => {
      try {
        const res = await getConsultations();
        if (res.success) {
          const count = res.data.filter(c => c.isRedFlag || c.status === 'IMMEDIATE_ATTENTION').length;
          setUrgentCount(count);
        }
      } catch (e) {
        // ignore in background
      }
    };
    checkUrgent();
    const interval = setInterval(checkUrgent, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageToggle = () => {
    const next = lang === 'en' ? 'kn' : 'en';
    setLang(next);
    if (next === 'kn') {
      speak("ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಸ್ವಾಗತ.");
    } else {
      speak("English language selected. Welcome.");
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 13, 30, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.75rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo & Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00e5a3, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 229, 163, 0.35)'
          }}>
            <Stethoscope size={24} color="#05131c" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff, #00e5a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MEDIKIOSK
              </span>
              <span style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: 'rgba(0, 229, 163, 0.15)',
                color: '#00e5a3',
                border: '1px solid rgba(0, 229, 163, 0.3)',
                fontWeight: 700
              }}>
                CLINICAL INTAKE
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Intelligent Patient Pre-Consultation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'home' ? 'rgba(0, 229, 163, 0.15)' : 'transparent',
              color: activeTab === 'home' ? '#00e5a3' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            {t('navHome')}
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'kiosk' ? '1px solid rgba(0, 229, 163, 0.4)' : '1px solid transparent',
              background: activeTab === 'kiosk' ? 'rgba(0, 229, 163, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'kiosk' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={16} color="#00e5a3" />
            {t('navKiosk')}
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'doctor' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              background: activeTab === 'doctor' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'doctor' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <UserCheck size={16} color="#60a5fa" />
            Doctor Portal
            {urgentCount > 0 && (
              <span className="badge badge-urgent" style={{ marginLeft: '0.3rem', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                {urgentCount} Urgent
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cross-verify')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'cross-verify' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
              background: activeTab === 'cross-verify' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'cross-verify' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <ShieldAlert size={16} color="#c084fc" />
            Cross-Verification Engine
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'admin' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: activeTab === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'admin' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={16} color="#fbbf24" />
            Admin Analytics
          </button>
        </nav>

        {/* Right Info: Voice & Safety status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            background: 'rgba(0, 229, 163, 0.1)',
            border: '1px solid rgba(0, 229, 163, 0.25)',
            color: '#00e5a3',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            <Volume2 size={14} />
            <span>Voice & Audio: English + ಕನ್ನಡ</span>
          </div>

          {user && (
            <button
              onClick={signOut}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                padding: '0.4rem'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
