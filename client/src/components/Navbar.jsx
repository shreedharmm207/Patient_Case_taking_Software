// client/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  UserCheck, 
  Users, 
  QrCode, 
  Video, 
  Leaf, 
  ShieldAlert, 
  LogOut, 
  Hospital,
  Sparkles,
  LayoutDashboard,
  UserPlus,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiRequest } from '../utils/api';

export default function Navbar({ activeTab, setActiveTab, onOpenFakeDetails }) {
  const { user, signOut } = useAuth();
  const { lang, setLang } = useLanguage();
  const [urgentCount, setUrgentCount] = useState(0);

  // Poll for urgent consultations to show live triage counter
  useEffect(() => {
    const checkUrgent = async () => {
      try {
        const res = await apiRequest('/consultations');
        if (res.success && res.data) {
          const redFlags = res.data.filter(c => c.redFlags && c.redFlags.length > 0 && c.status !== 'COMPLETED');
          setUrgentCount(redFlags.length);
        }
      } catch (err) {
        // silent fallback
      }
    };

    checkUrgent();
    const interval = setInterval(checkUrgent, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(13, 21, 39, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Header: Clean, Ultra-Crisp, No "Hospital OS", No small subtitles */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            color: '#ffffff'
          }}>
            <Hospital size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.025em'
            }}>
              MEDIKIOSK
            </span>
          </div>
        </div>

        {/* Professional Standard Navigation Tabs with Aesthetic Icons */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'home' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
              background: activeTab === 'home' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
              color: activeTab === 'home' ? '#93c5fd' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={16} color={activeTab === 'home' ? '#60a5fa' : '#94a3b8'} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'kiosk' ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid transparent',
              background: activeTab === 'kiosk' ? 'rgba(6, 182, 212, 0.18)' : 'transparent',
              color: activeTab === 'kiosk' ? '#67e8f9' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={16} color={activeTab === 'kiosk' ? '#22d3ee' : '#94a3b8'} />
            <span>Patient Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'doctor' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
              background: activeTab === 'doctor' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
              color: activeTab === 'doctor' ? '#93c5fd' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={16} color={activeTab === 'doctor' ? '#60a5fa' : '#94a3b8'} />
            <span>Doctor Portal</span>
            {urgentCount > 0 && (
              <span className="badge badge-urgent" style={{ marginLeft: '0.2rem', fontSize: '0.65rem' }}>
                {urgentCount} Priority
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'admin' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              background: activeTab === 'admin' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: activeTab === 'admin' ? '#fcd34d' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} color={activeTab === 'admin' ? '#fbbf24' : '#94a3b8'} />
            <span>Doctor & Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('qr-pass')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'qr-pass' ? '1.5px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.12)',
              background: activeTab === 'qr-pass' ? '#2563eb' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'qr-pass' ? '#ffffff' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <QrCode size={16} />
            <span>Patient Digital QR</span>
          </button>

          <button
            onClick={() => setActiveTab('teleconsult')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'teleconsult' ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid transparent',
              background: activeTab === 'teleconsult' ? 'rgba(236, 72, 153, 0.18)' : 'transparent',
              color: activeTab === 'teleconsult' ? '#f472b6' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Video size={16} color={activeTab === 'teleconsult' ? '#f472b6' : '#94a3b8'} />
            <span>Telehealth</span>
          </button>

          <button
            onClick={() => setActiveTab('ayurveda')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: activeTab === 'ayurveda' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
              background: activeTab === 'ayurveda' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'ayurveda' ? '#6ee7b7' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Leaf size={16} color={activeTab === 'ayurveda' ? '#34d399' : '#94a3b8'} />
            <span>AYUSH</span>
          </button>
        </nav>

        {/* Right Tools: Test Profiles & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onOpenFakeDetails}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '8px',
              gap: '0.4rem',
              background: '#131f3b',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
            title="Open Test Profiles Generator"
          >
            <Users size={14} color="#60a5fa" />
            <span>Test Profiles</span>
          </button>

          {user && (
            <button
              onClick={signOut}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
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
