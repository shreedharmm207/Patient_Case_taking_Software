// client/src/pages/patient/PatientIntakeFlow.jsx
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Mic,
  Volume2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  User,
  HeartPulse,
  Send,
  Upload,
  Plus
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAdaptiveQuestion,
  extractNlp,
  scanRedFlags,
  createConsultation,
  getAyushOptions
} from '../../utils/api';
import { speechController } from '../../utils/speech';
import AudioPromptPlayer from '../../components/AudioPromptPlayer';
import VoiceVisualizer from '../../components/VoiceVisualizer';
import ExplainableTooltip from '../../components/ExplainableTooltip';
import PainScaleSelector from '../../components/PainScaleSelector';
import RedFlagAlertBanner from '../../components/RedFlagAlertBanner';
import DocumentUploadModal from '../../components/DocumentUploadModal';

export default function PatientIntakeFlow({ onCompleteConsultation, onGoHome }) {
  const { lang, setLang, t, speak, stopSpeaking, isKannada } = useLanguage();
  const { user } = useAuth();

  // Wizard Steps:
  // 1: Language & Consent
  // 2: Patient Identification & ABHA
  // 3: Chief Complaint (Voice / Touch / Text)
  // 4: Adaptive AI Questioning
  // 5: Medical History & AYUSH Mode
  // 6: Document Scan / OCR
  // 7: Review & Submit
  // 8: Submitted Success
  const [currentStep, setCurrentStep] = useState(1);

  // Patient Identity
  const [patientData, setPatientData] = useState({
    name: 'Smt. Gangamma Gowda',
    nameKn: 'ಗಂಗಮ್ಮ ಗೌಡ',
    age: 58,
    gender: 'Female',
    phone: '+91 94481 77290',
    abhaId: '91-3829-5721-8932',
    address: 'Mandya Rural, Karnataka'
  });

  // Consent
  const [hasConsent, setHasConsent] = useState(false);

  // Chief Complaint
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [isListeningComplaint, setIsListeningComplaint] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Live Extracted NLP Entities
  const [nlpEntities, setNlpEntities] = useState({ symptoms: [], duration: null, severity: null });

  // Adaptive Questioning State
  const [adaptiveFlow, setAdaptiveFlow] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');
  const [selectedPainNum, setSelectedPainNum] = useState(null);
  const [isListeningQuestion, setIsListeningQuestion] = useState(false);

  // Medical History
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: 'Hypertension (5 years)',
    medications: 'Tab. Amlodipine 5mg OD',
    allergies: 'NKDA (No Known Drug Allergies)',
    surgeries: 'None',
    familyHistory: 'Brother had heart attack at age 54',
    smoking: 'Non-smoker',
    alcohol: 'Non-drinker'
  });

  // AYUSH Assessment
  const [ayushEnabled, setAyushEnabled] = useState(false);
  const [ayushData, setAyushData] = useState({
    prakriti: 'Pitta Predominant',
    agni: 'Tikshna Agni',
    koshtha: 'Madhyama Koshtha',
    aharaVihara: 'Vegetarian'
  });

  // Document Uploads
  const [showDocModal, setShowDocModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Red Flag Status
  const [redFlagStatus, setRedFlagStatus] = useState({ isRedFlag: false, flags: [] });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdConsultation, setCreatedConsultation] = useState(null);

  // Auto-speak on step entry
  useEffect(() => {
    if (currentStep === 1) {
      speak(isKannada ? "ಮೆಡಿಕಿಯೋಸ್ಕ್ ರೋಗಿ ಪೂರ್ವ-ತಪಾಸಣೆಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ಒಪ್ಪಿಗೆ ನೀಡಿ ಮುಂದುವರಿಯಿರಿ." : "Welcome to MEDIKIOSK patient intake. Please grant consent to begin.");
    } else if (currentStep === 3) {
      speak(isKannada ? "ಇಂದು ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಲು ನಿಮ್ಮ ಮುಖ್ಯ ಕಾರಣವೇನು? ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಒತ್ತಿ." : "What brings you to the hospital today? You can speak or tap an option.");
    }
  }, [currentStep, isKannada]);

  // Handle Speech Recognition for Chief Complaint
  const handleStartListeningComplaint = () => {
    setIsListeningComplaint(true);
    speechController.startListening({
      lang: isKannada ? 'kn' : 'en',
      onInterim: (text) => setInterimTranscript(text),
      onResult: async (finalText) => {
        setChiefComplaint(finalText);
        setInterimTranscript('');
        setIsListeningComplaint(false);

        // Run live NLP extraction
        try {
          const res = await extractNlp(finalText);
          if (res.success) setNlpEntities(res.data);
          const rfRes = await scanRedFlags(finalText, '', []);
          if (rfRes.success) setRedFlagStatus(rfRes.data);
        } catch (e) {
          console.error(e);
        }
      },
      onError: (err) => {
        console.warn("Speech error:", err);
        setIsListeningComplaint(false);
      },
      onEnd: () => setIsListeningComplaint(false)
    });
  };

  const handleStopListeningComplaint = () => {
    speechController.stopListening();
    setIsListeningComplaint(false);
  };

  // Quick select common symptom chip
  const handleSelectCommonSymptom = async (symptomText, symptomKn) => {
    const text = isKannada ? symptomKn : symptomText;
    setChiefComplaint(text);

    try {
      const res = await extractNlp(text);
      if (res.success) setNlpEntities(res.data);
      const rfRes = await scanRedFlags(text, '', []);
      if (rfRes.success) setRedFlagStatus(rfRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-fill demo patient
  const handleFillDemoPatient = (preset) => {
    if (preset === 'chest_pain') {
      setPatientData({
        name: 'Smt. Gangamma Gowda',
        nameKn: 'ಗಂಗಮ್ಮ ಗೌಡ',
        age: 58,
        gender: 'Female',
        phone: '+91 94481 77290',
        abhaId: '91-3829-5721-8932',
        address: 'Mandya Rural, Karnataka'
      });
      setChiefComplaint('Severe crushing chest pain radiating to left arm and jaw since 2 hours with cold sweating');
    } else if (preset === 'fever') {
      setPatientData({
        name: 'Ravi Kumar',
        nameKn: 'ರವಿ ಕುಮಾರ್',
        age: 34,
        gender: 'Male',
        phone: '+91 98450 11234',
        abhaId: '91-8472-1029-4401',
        address: 'Jayanagar, Bengaluru'
      });
      setChiefComplaint('Fever and severe productive cough for 4 days with chills');
    } else {
      setPatientData({
        name: 'Karthik Bhat',
        nameKn: 'ಕಾರ್ತಿಕ್ ಭಟ್',
        age: 26,
        gender: 'Male',
        phone: '+91 99002 44510',
        abhaId: '91-5521-9832-1104',
        address: 'Shivamogga, Karnataka'
      });
      setChiefComplaint('Sharp right lower abdomen pain since midnight, vomiting and fever');
    }
  };

  // Proceed from Chief Complaint to Adaptive Questions
  const handleStartAdaptiveQuestions = async () => {
    if (!chiefComplaint.trim()) {
      alert("Please enter or speak your chief complaint before proceeding.");
      return;
    }

    try {
      // Trigger NLP entity extraction
      const nlpRes = await extractNlp(chiefComplaint);
      if (nlpRes.success) setNlpEntities(nlpRes.data);

      // Fetch first adaptive question
      const res = await getAdaptiveQuestion(chiefComplaint, []);
      if (res.success && res.data) {
        setAdaptiveFlow(res.data);
        setCurrentQuestion(res.data.nextQuestion);
        setCurrentStep(4);

        // Speak the first question
        if (res.data.nextQuestion) {
          const qText = isKannada ? res.data.nextQuestion.questionKn : res.data.nextQuestion.questionEn;
          speak(qText);
        }
      }
    } catch (err) {
      console.error(err);
      setCurrentStep(4);
    }
  };

  // Record answer to current adaptive question
  const handleAnswerCurrentQuestion = async (answerValue, isAlertOption = false) => {
    if (!currentQuestion) return;

    const recordedAnswer = {
      id: currentQuestion.id,
      question: isKannada ? currentQuestion.questionKn : currentQuestion.questionEn,
      answer: answerValue,
      rationale: currentQuestion.explainabilityEn,
      rationaleKn: currentQuestion.explainabilityKn,
      isAlert: isAlertOption,
      source: "Patient Touch / Voice"
    };

    const nextAnswered = [...answeredQuestions, recordedAnswer];
    setAnsweredQuestions(nextAnswered);
    setCurrentAnswerInput('');
    setSelectedPainNum(null);

    // Re-scan red-flags with this new answer
    try {
      const rfScan = await scanRedFlags(chiefComplaint, '', nextAnswered);
      if (rfScan.success) setRedFlagStatus(rfScan.data);
    } catch (e) {
      console.error(e);
    }

    // Request next question
    const answeredIds = nextAnswered.map(a => a.id);
    const res = await getAdaptiveQuestion(chiefComplaint, answeredIds);

    if (res.success && res.data) {
      setAdaptiveFlow(res.data);
      if (res.data.isComplete || !res.data.nextQuestion) {
        // Questions completed, proceed to medical history
        setCurrentQuestion(null);
        setCurrentStep(5);
        speak(isKannada ? "ಪ್ರಶ್ನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ಪರಿಶೀಲಿಸಿ." : "Clinical questions completed. Please review your past medical history.");
      } else {
        setCurrentQuestion(res.data.nextQuestion);
        const nextQText = isKannada ? res.data.nextQuestion.questionKn : res.data.nextQuestion.questionEn;
        speak(nextQText);
      }
    }
  };

  // Final Submit to Doctor Queue
  const handleSubmitConsultation = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        patient: {
          id: `pat_${Date.now()}`,
          abhaId: patientData.abhaId,
          name: patientData.name,
          nameKn: patientData.nameKn,
          age: Number(patientData.age),
          gender: patientData.gender,
          phone: patientData.phone,
          preferredLanguage: lang,
          address: patientData.address
        },
        chiefComplaint,
        language: lang,
        extractedEntities: nlpEntities,
        adaptiveAnswers: answeredQuestions,
        medicalHistory: {
          conditions: medicalHistory.conditions.split(',').map(s => s.trim()).filter(Boolean),
          medications: medicalHistory.medications.split(',').map(s => s.trim()).filter(Boolean),
          allergies: medicalHistory.allergies.split(',').map(s => s.trim()).filter(Boolean),
          surgeries: medicalHistory.surgeries.split(',').map(s => s.trim()).filter(Boolean),
          familyHistory: medicalHistory.familyHistory.split(',').map(s => s.trim()).filter(Boolean),
          smoking: medicalHistory.smoking,
          alcohol: medicalHistory.alcohol
        },
        documentExtractions: uploadedDocs,
        ayushData: ayushEnabled ? ayushData : null
      };

      const res = await createConsultation(payload);
      if (res.success) {
        setCreatedConsultation(res.data);
        setCurrentStep(8); // Success step
        speak(isKannada ? `ನಿಮ್ಮ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ${res.data.tokenNumber}.` : `Intake completed. Your token number is ${res.data.tokenNumber}.`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem 5rem 1rem' }}>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-success">
              {t('step')} {currentStep} {t('of')} 7
            </span>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
              {currentStep === 1 && (isKannada ? 'ಭಾಷೆ ಮತ್ತು ಒಪ್ಪಿಗೆ' : 'Language & Consent')}
              {currentStep === 2 && (isKannada ? 'ರೋಗಿಯ ಗುರುತು (ABHA)' : 'Patient ID & ABHA')}
              {currentStep === 3 && (isKannada ? 'ಪ್ರಮುಖ ಕಾರಣ / ಲಕ್ಷಣಗಳು' : 'Chief Complaint')}
              {currentStep === 4 && (isKannada ? 'AI ಹೊಂದಾಣಿಕೆಯ ಪ್ರಶ್ನೆಗಳು' : 'Adaptive Clinical Questions')}
              {currentStep === 5 && (isKannada ? 'ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ & ಆಯುಷ್' : 'Medical History & AYUSH')}
              {currentStep === 6 && (isKannada ? 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ / OCR' : 'Document Scan & OCR')}
              {currentStep === 7 && (isKannada ? 'ಪರಿಶೀಲನೆ ಮತ್ತು ಸಲ್ಲಿಕೆ' : 'Review & Submit')}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#00e5a3', fontWeight: 700 }}>
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(currentStep / 7) * 100}%` }}></div>
        </div>
      </div>

      {/* STEP 1: CONSENT & MULTILINGUAL INTAKE SETUP */}
      {currentStep === 1 && (
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00e5a3, #00b4d8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <ShieldCheck size={32} color="#05131c" />
            </div>
            <h2 style={{ fontSize: '1.7rem', marginBottom: '0.4rem', fontWeight: 800 }}>
              Digital Health Consent & ABDM Verification
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
              Multilingual AI-Assisted Clinical History Taking. Questions and spoken responses are supported in both <strong>English</strong> and <strong>Kannada (ಕನ್ನಡ)</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ padding: '0.4rem 0.85rem' }}>
                ✓ Multimodal: Voice + Touch + OCR
              </span>
              <span className="badge badge-source" style={{ padding: '0.4rem 0.85rem' }}>
                🔒 Privacy-First: DPDP Act 2023 & ABDM Compliant
              </span>
              <span className="badge badge-pending" style={{ padding: '0.4rem 0.85rem' }}>
                🩺 Clinical Cross-Verification Active
              </span>
            </div>
          </div>

          {/* ABDM Consent Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 229, 163, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#00e5a3" />
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                  {t('consentTitle')}
                </strong>
              </div>
              <AudioPromptPlayer
                textEn="By tapping I Agree, you allow MEDIKIOSK to collect your symptoms, convert speech into clinical text, and provide a pre-consultation summary for your doctor."
                textKn="ನಾನು ಒಪ್ಪುತ್ತೇನೆ ಗುಂಡಿಯನ್ನು ಒತ್ತುವ ಮೂಲಕ, ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಸಂಗ್ರಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ಪೂರ್ವ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶವನ್ನು ನೀಡಲು ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಅನುಮತಿ ನೀಡುತ್ತೀರಿ."
              />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.55', marginBottom: '1rem' }}>
              {t('consentNotice')}
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#00e5a3' }}
              />
              <span style={{ fontWeight: 600, color: '#ffffff' }}>
                {isKannada ? 'ನಾನು ವಿವರಣೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಸಮ್ಮತಿಸುತ್ತೇನೆ (I Consent)' : 'I have understood the explanation and grant explicit digital consent'}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={!hasConsent}
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary btn-kiosk-large"
              style={{ opacity: hasConsent ? 1 : 0.5, cursor: hasConsent ? 'pointer' : 'not-allowed' }}
            >
              <span>{t('consentButton')}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PATIENT IDENTIFICATION & ABHA */}
      {currentStep === 2 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('patientDetailsTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('patientDetailsDesc')}</p>
            </div>
            {/* Quick Demo Pre-fill */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemoPatient('chest_pain')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                Preset: Gangamma (Chest Pain)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoPatient('fever')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                Preset: Ravi (Fever/Cough)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('fullName')} *
              </label>
              <input
                type="text"
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('abhaIdLabel')}
              </label>
              <input
                type="text"
                value={patientData.abhaId}
                onChange={(e) => setPatientData({ ...patientData, abhaId: e.target.value })}
                placeholder="91-XXXX-XXXX-XXXX"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('age')} *
              </label>
              <input
                type="number"
                value={patientData.age}
                onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('gender')} *
              </label>
              <select
                value={patientData.gender}
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#0f1933',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              >
                <option value="Male">{t('genderMale')}</option>
                <option value="Female">{t('genderFemale')}</option>
                <option value="Other">{t('genderOther')}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('phoneNumber')}
              </label>
              <input
                type="text"
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn btn-primary btn-kiosk-large"
            >
              <span>{t('startIntakeBtn')}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHIEF COMPLAINT (Voice, Touch Chips, Text) */}
      {currentStep === 3 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('chiefComplaintTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('chiefComplaintSubtitle')}</p>
            </div>
            <AudioPromptPlayer
              textEn="What brings you to the hospital today? You can tap the microphone to speak, or select a common symptom below."
              textKn="ಇಂದು ಆಸ್ಪತ್ರೆಗೆ ಬರಲು ನಿಮ್ಮ ಪ್ರಮುಖ ಕಾರಣವೇನು? ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ."
            />
          </div>

          {/* Voice Visualizer Box */}
          <div style={{ marginBottom: '1.5rem' }}>
            <VoiceVisualizer
              isListening={isListeningComplaint}
              transcript={interimTranscript || chiefComplaint}
              onStart={handleStartListeningComplaint}
              onStop={handleStopListeningComplaint}
            />
          </div>

          {/* Touch-Friendly Common Symptom Chips */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              {t('commonSymptoms')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { en: "Severe Chest Pain", kn: "ತೀವ್ರ ಎದೆ ನೋವು", isAlert: true },
                { en: "High Fever & Cough", kn: "ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು" },
                { en: "Acute Abdominal Pain", kn: "ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು", isAlert: true },
                { en: "Difficulty Breathing", kn: "ಉಸಿರಾಟದ ತೊಂದರೆ", isAlert: true },
                { en: "Severe Headache / Dizziness", kn: "ತೀವ್ರ ತಲೆನೋವು / ತಲೆಸುತ್ತು" },
                { en: "Diabetes Routine Review", kn: "ಮಧುಮೇಹ ನಿಯಮಿತ ತಪಾಸಣೆ" }
              ].map((sym, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectCommonSymptom(sym.en, sym.kn)}
                  className={`touch-chip ${sym.isAlert ? 'touch-chip-alert' : ''} ${chiefComplaint.includes(sym.en) || chiefComplaint.includes(sym.kn) ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '1.2rem' }}>{sym.isAlert ? '⚠️' : '🩺'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {isKannada ? sym.kn : sym.en}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isKannada ? sym.en : sym.kn}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Text Edit */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Recorded Chief Complaint (Verify or Edit):
            </label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. I have had severe crushing chest pain since 2 hours with cold sweating..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(0, 229, 163, 0.3)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Live NLP Extraction Preview */}
          {nlpEntities.symptoms && nlpEntities.symptoms.length > 0 && (
            <div style={{
              background: 'rgba(0, 229, 163, 0.08)',
              border: '1px solid rgba(0, 229, 163, 0.25)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Sparkles size={16} color="#00e5a3" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00e5a3', textTransform: 'uppercase' }}>
                  Natural Language Processing → Structured Clinical Variables
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {nlpEntities.symptoms.map((s, i) => (
                  <span key={i} className="badge badge-source">
                    Symptom: {s.canonicalName || s}
                  </span>
                ))}
                {nlpEntities.duration && (
                  <span className="badge badge-pending">
                    Duration: {nlpEntities.duration}
                  </span>
                )}
                {nlpEntities.severity && (
                  <span className="badge badge-urgent">
                    Severity: {nlpEntities.severity}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Red Flag Alert if triggered */}
          {redFlagStatus.isRedFlag && (
            <RedFlagAlertBanner redFlagReport={redFlagStatus} />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleStartAdaptiveQuestions}
              disabled={!chiefComplaint.trim()}
              className="btn btn-primary btn-kiosk-large"
              style={{ opacity: chiefComplaint.trim() ? 1 : 0.5 }}
            >
              <span>{isKannada ? 'AI ಪ್ರಶ್ನೆಗಳಿಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Start Adaptive AI Questions'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ADAPTIVE AI QUESTIONING */}
      {currentStep === 4 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 229, 163, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="#00e5a3" />
              </div>
              <div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {adaptiveFlow?.category || 'Clinical Adaptive Assessment'}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '0.2rem' }}>
                  {t('adaptiveQuestionHeader')} {adaptiveFlow?.currentStep && `(${adaptiveFlow.currentStep}/${adaptiveFlow.totalSteps})`}
                </h3>
              </div>
            </div>

            {currentQuestion && (
              <AudioPromptPlayer
                textEn={currentQuestion.questionEn}
                textKn={currentQuestion.questionKn}
              />
            )}
          </div>

          {currentQuestion ? (
            <div>
              {/* Question Text Box */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderLeft: '4px solid #00e5a3',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.4' }}>
                  {currentQuestion.questionEn}
                </div>
                {currentQuestion.questionKn && (
                  <div style={{ fontSize: '1rem', color: '#c084fc', marginTop: '0.45rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.25)', color: '#e9d5ff' }}>
                      ಕನ್ನಡ
                    </span>
                    <span>{currentQuestion.questionKn}</span>
                  </div>
                )}

                {/* Explainable AI Component ("Why are we asking this?") */}
                <ExplainableTooltip
                  rationaleEn={currentQuestion.explainabilityEn}
                  rationaleKn={currentQuestion.explainabilityKn}
                />
              </div>

              {/* Input: If Pain Scale */}
              {currentQuestion.inputType === 'pain_scale' ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <PainScaleSelector
                    value={selectedPainNum}
                    onChange={(num, text) => {
                      setSelectedPainNum(num);
                      handleAnswerCurrentQuestion(text, num >= 7);
                    }}
                  />
                </div>
              ) : (
                /* Input: Touch Chips Options */
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                    Tap an option or speak your response:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                    {currentQuestion.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerCurrentQuestion(opt.en, opt.isAlert)}
                        className={`touch-chip ${opt.isAlert ? 'touch-chip-alert' : ''}`}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{opt.isAlert ? '⚠️' : '👉'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                            {opt.en}
                          </div>
                          {opt.kn && (
                            <div style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: '0.15rem' }}>
                              {opt.kn}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Input Alternative */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={currentAnswerInput}
                  onChange={(e) => setCurrentAnswerInput(e.target.value)}
                  placeholder={t('typeOrSpeakPlaceholder')}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentAnswerInput.trim()) {
                      handleAnswerCurrentQuestion(currentAnswerInput);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (currentAnswerInput.trim()) handleAnswerCurrentQuestion(currentAnswerInput);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.25rem' }}
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Red Flag Alert check */}
              {redFlagStatus.isRedFlag && (
                <RedFlagAlertBanner redFlagReport={redFlagStatus} isCompact={true} />
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color="#00e5a3" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem' }}>Adaptive Questions Completed</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                All relevant symptom details have been captured and structured.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                {t('finishQuestionsBtn')}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="btn btn-secondary"
            >
              <span>Skip Remaining Questions</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MEDICAL HISTORY & AYUSH MODE */}
      {currentStep === 5 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('historyTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Past conditions, medications, allergies, and lifestyle habits.
              </p>
            </div>
            
            {/* AYUSH Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setAyushEnabled(!ayushEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: ayushEnabled ? '1.5px solid #00e5a3' : '1px solid rgba(255, 255, 255, 0.15)',
                background: ayushEnabled ? 'rgba(0, 229, 163, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: ayushEnabled ? '#00e5a3' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <HeartPulse size={16} />
              <span>{t('ayushModeToggle')}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('conditionsLabel')}
              </label>
              <input
                type="text"
                value={medicalHistory.conditions}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, conditions: e.target.value })}
                placeholder="e.g. Hypertension, Diabetes, Asthma"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('medicationsLabel')}
              </label>
              <input
                type="text"
                value={medicalHistory.medications}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, medications: e.target.value })}
                placeholder="e.g. Tab Amlodipine 5mg OD, Metformin 500mg"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ff6b8b', marginBottom: '0.4rem' }}>
                ⚠️ {t('allergiesLabel')}
              </label>
              <input
                type="text"
                value={medicalHistory.allergies}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 45, 85, 0.08)',
                  border: '1px solid rgba(255, 45, 85, 0.3)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                {t('familyHistoryLabel')}
              </label>
              <input
                type="text"
                value={medicalHistory.familyHistory}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, familyHistory: e.target.value })}
                placeholder="e.g. Father had heart attack, Mother had diabetes"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* AYUSH Form if enabled */}
          {ayushEnabled && (
            <div style={{
              background: 'rgba(0, 229, 163, 0.08)',
              border: '1.5px solid #00e5a3',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <HeartPulse size={20} color="#00e5a3" />
                <strong style={{ fontSize: '1.05rem', color: '#00e5a3' }}>
                  AYUSH Dashavidha Pariksha Intake (Ministry of Ayush Protocol)
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    {t('ayushPrakriti')}
                  </label>
                  <select
                    value={ayushData.prakriti}
                    onChange={(e) => setAyushData({ ...ayushData, prakriti: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0b132b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Vata Predominant">Vata (Thin frame, dry, restless)</option>
                    <option value="Pitta Predominant">Pitta (Warm, acidity-prone, medium build)</option>
                    <option value="Kapha Predominant">Kapha (Heavy build, calm, slow digestion)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    {t('ayushAgni')}
                  </label>
                  <select
                    value={ayushData.agni}
                    onChange={(e) => setAyushData({ ...ayushData, agni: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0b132b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Sama Agni">Sama Agni (Balanced normal appetite)</option>
                    <option value="Tikshna Agni">Tikshna Agni (Intense hunger, excess thirst)</option>
                    <option value="Manda Agni">Manda Agni (Sluggish appetite, heaviness)</option>
                    <option value="Vishama Agni">Vishama Agni (Irregular hunger/bloating)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    {t('ayushKoshtha')}
                  </label>
                  <select
                    value={ayushData.koshtha}
                    onChange={(e) => setAyushData({ ...ayushData, koshtha: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0b132b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Mridu Koshtha">Mridu Koshtha (Soft, easily purged)</option>
                    <option value="Madhyama Koshtha">Madhyama Koshtha (Normal regular bowel)</option>
                    <option value="Krura Koshtha">Krura Koshtha (Hard, chronic constipation)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="btn btn-primary btn-kiosk-large"
            >
              <span>{isKannada ? 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Proceed to Document Scan'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: DOCUMENT SCAN / OCR */}
      {currentStep === 6 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('uploadTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('uploadDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDocModal(true)}
              className="btn btn-primary"
            >
              <Upload size={18} />
              <span>{isKannada ? 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (OCR)' : 'Scan / Upload Medical Document'}</span>
            </button>
          </div>

          {/* List of Attached Documents */}
          {uploadedDocs.length === 0 ? (
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              marginBottom: '1.75rem',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <FileText size={42} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>No Medical Documents Attached Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0.35rem auto 1.25rem auto' }}>
                You can attach an old prescription or diagnostic lab report for AI automated medication & abnormal parameter extraction.
              </p>
              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="btn btn-secondary"
              >
                <Plus size={16} />
                <span>Pick a Sample Prescription or Lab Report</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              {uploadedDocs.map((doc, idx) => (
                <div key={idx} style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1.5px solid rgba(0, 229, 163, 0.4)',
                  borderRadius: '14px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={18} color="#00e5a3" />
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{doc.name}</strong>
                    </div>
                    <span className="badge badge-success">OCR EXTRACTED</span>
                  </div>

                  {/* Abnormal Flags */}
                  {doc.abnormalValues && doc.abnormalValues.length > 0 && (
                    <div style={{ background: 'rgba(255, 45, 85, 0.15)', border: '1px solid #ff2d55', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#ff4d6d', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={15} /> Abnormal Lab Values Highlighted:
                      </strong>
                      {doc.abnormalValues.map((abn, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: '#ffb3c1', marginTop: '0.2rem' }}>
                          • <strong>{abn.parameter}:</strong> {abn.observed} (Ref: {abn.reference})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extracted items */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {doc.extractedItems?.map((item, i) => (
                      <span key={i} className="badge badge-source">
                        {item.name || item.test}: {item.dosage || item.value || ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(7)}
              className="btn btn-primary btn-kiosk-large"
            >
              <span>{isKannada ? 'ಸಾರಾಂಶ ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Review & Final Triage'}</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Document Upload Modal */}
          {showDocModal && (
            <DocumentUploadModal
              onDocumentExtracted={(extracted) => {
                setUploadedDocs([...uploadedDocs, extracted]);
                setShowDocModal(false);
              }}
              onClose={() => setShowDocModal(false)}
            />
          )}
        </div>
      )}

      {/* STEP 7: REVIEW & SUBMIT */}
      {currentStep === 7 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t('reviewTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('reviewSubtitle')}</p>
          </div>

          {/* Red Flag Alert if Present */}
          {redFlagStatus.isRedFlag && (
            <RedFlagAlertBanner redFlagReport={redFlagStatus} />
          )}

          {/* Summary Card */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Patient Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.85rem' }}>
              <div>
                <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>{patientData.name}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                  ({patientData.age}y / {patientData.gender})
                </span>
              </div>
              <span className="badge badge-source">ABHA: {patientData.abhaId}</span>
            </div>

            {/* Chief Complaint */}
            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Chief Complaint:
              </span>
              <p style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>
                "{chiefComplaint}"
              </p>
            </div>

            {/* Adaptive Answers */}
            {answeredQuestions.length > 0 && (
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Clinical Follow-Up Responses:
                </span>
                <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {answeredQuestions.map((ans, i) => (
                    <div key={i} style={{ fontSize: '0.88rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <strong>Q:</strong> {ans.question} <br />
                      <strong style={{ color: '#00e5a3' }}>A:</strong> {ans.answer}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical History */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Past Conditions:</span>
                <div style={{ fontSize: '0.85rem', color: '#ffffff' }}>{medicalHistory.conditions || 'None'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Medications:</span>
                <div style={{ fontSize: '0.85rem', color: '#ffffff' }}>{medicalHistory.medications || 'None'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#ff6b8b', fontWeight: 700 }}>Allergies:</span>
                <div style={{ fontSize: '0.85rem', color: '#ffffff' }}>{medicalHistory.allergies || 'NKDA'}</div>
              </div>
            </div>

            {/* Attached Documents */}
            {uploadedDocs.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Attached Documents:</span>
                <div style={{ fontSize: '0.85rem', color: '#00e5a3' }}>
                  {uploadedDocs.map(d => d.name).join(', ')}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitConsultation}
              className="btn btn-primary btn-kiosk-large"
              style={{ minWidth: '240px' }}
            >
              <Send size={20} />
              <span>{isSubmitting ? 'Queueing Case...' : t('submitToDoctorBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: SUCCESS / SUBMITTED */}
      {currentStep === 8 && createdConsultation && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e5a3, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 30px rgba(0, 229, 163, 0.4)'
          }}>
            <CheckCircle2 size={40} color="#05131c" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isKannada ? 'ಪೂರ್ವ-ತಪಾಸಣೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!' : 'Pre-Consultation Intake Completed!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '550px', margin: '0 auto 1.5rem auto' }}>
            {t('intakeCompleteMsg')}
          </p>

          <div style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            borderRadius: '16px',
            background: createdConsultation.isRedFlag ? 'rgba(255, 45, 85, 0.2)' : 'rgba(0, 229, 163, 0.2)',
            border: `2px solid ${createdConsultation.isRedFlag ? '#ff2d55' : '#00e5a3'}`,
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Your OPD Token Number
            </span>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: createdConsultation.isRedFlag ? '#ff2d55' : '#00e5a3' }}>
              {createdConsultation.tokenNumber}
            </span>
            {createdConsultation.isRedFlag && (
              <div style={{ color: '#ff4d6d', fontWeight: 800, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                🚨 IMMEDIATE CLINICAL ATTENTION REQUIRED
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onCompleteConsultation(createdConsultation.id)}
              className="btn btn-primary btn-kiosk-large"
            >
              <span>View Case in Doctor Dashboard</span>
              <ArrowRight size={20} />
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="btn btn-secondary btn-kiosk-large"
            >
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
