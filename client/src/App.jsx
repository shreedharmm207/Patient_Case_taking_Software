// client/src/App.jsx
import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PatientIntakeFlow from './pages/patient/PatientIntakeFlow';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClinicalCrossVerificationView from './components/ClinicalCrossVerificationView';
import { ShieldCheck, HeartPulse } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [initialCaseId, setInitialCaseId] = useState(null);
  const { t } = useLanguage();

  const handleLaunchDemoScenario = (caseId) => {
    setInitialCaseId(caseId);
    setActiveTab('doctor');
  };

  const handleCompleteConsultation = (newCaseId) => {
    setInitialCaseId(newCaseId);
    setActiveTab('doctor');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onLaunchDemoScenario={handleLaunchDemoScenario}
          />
        )}

        {activeTab === 'kiosk' && (
          <PatientIntakeFlow
            onCompleteConsultation={handleCompleteConsultation}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'doctor' && (
          <DoctorDashboard
            initialSelectedCaseId={initialCaseId}
          />
        )}

        {activeTab === 'cross-verify' && (
          <ClinicalCrossVerificationView
            onOpenDoctorCase={(caseId) => {
              setInitialCaseId(caseId);
              setActiveTab('doctor');
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onDemoResetSuccess={() => {
              // Refresh state
            }}
          />
        )}
      </main>

      {/* Hospital Grade Safety Disclaimer Footer */}
      <footer style={{
        background: 'rgba(5, 10, 22, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.25rem 1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '850px' }}>
            <ShieldCheck size={18} color="#00e5a3" style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: '1.45', color: '#94a3b8' }}>
              <strong>MEDIKIOSK Advisory:</strong> {t('legalDisclaimer')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
            <span>Smart India Hackathon 2026 • PS 26047</span>
            <span>Team CureCoders</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
