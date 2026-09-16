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
