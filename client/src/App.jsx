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
import TeleconsultPanel from './pages/teleconsult/TeleconsultPanel';
import AyurvedaModule from './pages/ayurveda/AyurvedaModule';
import FakeDetailsHandler from './components/FakeDetailsHandler';
import SecurePatientQrManager from './components/SecurePatientQrManager';
import HospitalAiChatbot from './components/HospitalAiChatbot';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [initialCaseId, setInitialCaseId] = useState(null);
  const [fakeDetailsOpen, setFakeDetailsOpen] = useState(false);
  const [syntheticPatientForIntake, setSyntheticPatientForIntake] = useState(null);
  const { t } = useLanguage();

  const handleLaunchDemoScenario = (caseId) => {
    setInitialCaseId(caseId);
    setActiveTab('doctor');
  };

  const handleCompleteConsultation = (newCaseId) => {
    setInitialCaseId(newCaseId);
    setActiveTab('doctor');
  };

  const handleAutofillIntake = (syntheticPatient) => {
    setSyntheticPatientForIntake(syntheticPatient);
    setActiveTab('kiosk');
  };

  const handleDirectQueueInject = (caseId) => {
    setInitialCaseId(caseId);
    setActiveTab('doctor');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFakeDetails={() => setFakeDetailsOpen(true)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onLaunchDemoScenario={handleLaunchDemoScenario}
            onOpenFakeDetails={() => setFakeDetailsOpen(true)}
            onOpenQrManager={() => setActiveTab('qr-pass')}
          />
        )}

        {activeTab === 'kiosk' && (
          <PatientIntakeFlow
            initialPatientData={syntheticPatientForIntake}
            onCompleteConsultation={handleCompleteConsultation}
            onGoHome={() => setActiveTab('home')}
            onOpenQrManager={(caseId) => {
              setInitialCaseId(caseId);
              setActiveTab('qr-pass');
            }}
          />
        )}

        {activeTab === 'doctor' && (
          <DoctorDashboard
            initialSelectedCaseId={initialCaseId}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onDemoResetSuccess={() => {
              // Refresh state
            }}
          />
        )}

        {/* Upgraded Secure Digital Patient Case QR Hub */}
        {activeTab === 'qr-pass' && (
          <SecurePatientQrManager
            initialCaseId={initialCaseId}
            onLaunchConsultation={(caseId) => {
              setInitialCaseId(caseId);
              setActiveTab('doctor');
            }}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'teleconsult' && (
          <TeleconsultPanel
            patientData={syntheticPatientForIntake}
            onEndCall={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'ayurveda' && (
          <AyurvedaModule
            onSyncToDoctor={(ayushData) => {
              setActiveTab('doctor');
            }}
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
      </main>

      {/* Global Patient Test Profiles Generator Modal */}
      <FakeDetailsHandler
        isOpen={fakeDetailsOpen}
        onClose={() => setFakeDetailsOpen(false)}
        onAutofillIntake={handleAutofillIntake}
        onDirectQueueInject={handleDirectQueueInject}
      />

      {/* 24/7 AI Hospital Assistant Floating Chatbot */}
      <HospitalAiChatbot
        onNavigate={(tab) => setActiveTab(tab)}
        currentTab={activeTab}
      />
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
