// client/src/pages/HomePage.jsx
import React from 'react';
import {
  Activity,
  UserCheck,
  Users,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Leaf,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  PhoneCall
} from 'lucide-react';

export default function HomePage({ setActiveTab }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '2.5rem 1.25rem 4.5rem 1.25rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Super Speciality Hospital Header: Big, Bold, Crystal-Clear */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 20px',
            borderRadius: '999px',
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1.5px solid rgba(37, 99, 235, 0.4)',
            color: '#93c5fd',
            fontSize: '13.5px',
            fontWeight: 800,
            marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
            letterSpacing: '0.02em'
          }}>
            <ShieldCheck size={17} color="#60a5fa" />
            <span>MEDIKIOSK • Smart Hospital Platform</span>
          </div>

          <h1 className="text-title-large" style={{ margin: 0 }}>
            Hospital Patient Intake & Pre-Triage
          </h1>
        </div>

        {/* 3 Core Primary Action Cards with Aesthetic Framed Standard Icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3rem'
        }}>
          {/* 1. Patient Check-In */}
          <div
            onClick={() => setActiveTab('kiosk')}
            style={{
              background: '#111c35',
              border: '1.5px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#06b6d4';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(6, 182, 212, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1.5px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)'
            }}>
              <Activity size={32} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.6rem 0' }}>
              Patient Check-In
            </h2>

            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', flex: 1, margin: 0 }}>
              Start bilingual pre-consultation intake, record disease-specific complaints, or authenticate your secure reusable Case QR.
            </p>

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              <span>Launch Patient Intake</span>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* 2. Physician Clinical Portal */}
          <div
            onClick={() => setActiveTab('doctor')}
            style={{
              background: '#111c35',
              border: '1.5px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1.5px solid rgba(59, 130, 246, 0.35)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)'
            }}>
              <Stethoscope size={32} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.6rem 0' }}>
              Doctor Portal
            </h2>

            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', flex: 1, margin: 0 }}>
              Real-time consultation queue, comprehensive case sheets, data integrity verification audit, and longitudinal visit timelines.
            </p>

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#60a5fa',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              <span>Open Doctor Dashboard</span>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* 3. Hospital Staff Operations */}
          <div
            onClick={() => setActiveTab('admin')}
            style={{
              background: '#111c35',
              border: '1.5px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)'
            }}>
              <Users size={32} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.6rem 0' }}>
              Hospital Staff Operations
            </h2>

            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', flex: 1, margin: 0 }}>
              Hospital OPD throughput metrics, triage monitoring, staff specialist referrals, and verified data integrity logs.
            </p>

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              <span>Open Staff Operations</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* Enterprise Hospital Throughput & Quality Indicators Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          background: 'rgba(13, 21, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '1.75rem 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>4.2 min</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Avg Pre-Triage Time</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>99.4%</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Data Integrity & Fraud Detection</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={22} color="#22d3ee" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>100%</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Portable Digital Case QR</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>Bi-directional</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Cross-Specialty Referral Engine</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
