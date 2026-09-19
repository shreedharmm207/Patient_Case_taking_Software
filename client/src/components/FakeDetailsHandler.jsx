// client/src/components/FakeDetailsHandler.jsx
import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ArrowRight,
  UserCheck,
  Activity,
  X,
  HeartPulse,
  ShieldAlert,
  User
} from 'lucide-react';
import { createConsultation } from '../utils/api';

const MOCK_PRESETS = [
  {
    id: 'preset_acs',
    title: 'Chest Pain Emergency (Red Flag)',
    category: 'Cardiology',
    patient: {
      fullName: 'Gangamma B.',
      age: 58,
      gender: 'female',
      phone: '9845123908',
      abhaId: '91-4829-3381-9921',
      chiefComplaint: 'Chest Pain',
      duration: '3 hours',
      painScore: 9,
      vitals: { bp: '154/98', hr: '104', spo2: '94%', temp: '98.6°F' },
      allergies: ['Aspirin (Mild Hives)'],
      currentMeds: ['Amlodipine 5mg OD', 'Atorvastatin 10mg HS'],
      symptoms: ['Crushing chest tightness radiating to left arm', 'Shortness of breath with sweating'],
      history: 'Hypertensive for 8 years, post-menopausal.',
      isRedFlag: true
    }
  },
  {
    id: 'preset_bronchitis_allergy',
    title: 'Fever & Cough + Penicillin Allergy Alert',
    category: 'Pulmonology',
    patient: {
      fullName: 'Ravi Kumar',
      age: 34,
      gender: 'male',
      phone: '9448102934',
      abhaId: '91-3819-0021-8841',
      chiefComplaint: 'Cough & Fever',
      duration: '4 days',
      painScore: 4,
      vitals: { bp: '118/76', hr: '82', spo2: '98%', temp: '101.4°F' },
      allergies: ['Penicillin (Severe Anaphylaxis / Urticaria)'],
      currentMeds: ['Cetirizine 10mg'],
      symptoms: ['Productive yellowish sputum', 'Low-grade nocturnal fever with chills'],
      history: 'Documented penicillin anaphylaxis in 2021.',
      isRedFlag: false
    }
  },
  {
    id: 'preset_appendicitis',
    title: 'Acute Abdominal Pain (Appendicitis)',
    category: 'Gastroenterology',
    patient: {
      fullName: 'Karthik N.',
      age: 26,
      gender: 'male',
      phone: '9740582910',
      abhaId: '91-5519-7812-4402',
      chiefComplaint: 'Abdominal Pain',
      duration: '14 hours',
      painScore: 8,
      vitals: { bp: '122/78', hr: '96', spo2: '99%', temp: '100.8°F' },
      allergies: ['No known drug allergies'],
      currentMeds: ['Paracetamol 650mg SOS'],
      symptoms: ['Right lower abdominal pain with vomiting', 'Anorexia and fever'],
      history: 'Sudden onset after dinner, no prior surgeries.',
      isRedFlag: false
    }
  },
  {
    id: 'preset_diabetes_ocr',
    title: 'Diabetes Follow-Up + Lab OCR (HbA1c 9.2%)',
    category: 'Endocrinology',
    patient: {
      fullName: 'Sunita Patil',
      age: 52,
      gender: 'female',
      phone: '9880192844',
      abhaId: '91-9921-4401-2219',
      chiefComplaint: 'Excessive Thirst & Fatigue',
      duration: '3 weeks',
      painScore: 2,
      vitals: { bp: '136/84', hr: '76', spo2: '98%', temp: '98.4°F' },
      allergies: ['Sulfa drugs'],
      currentMeds: ['Metformin 500mg BD'],
      symptoms: ['Frequent nighttime urination', 'Tingling and numbness in feet'],
      history: 'Type 2 Diabetes for 6 years, irregular compliance.',
      isRedFlag: false
    }
  },
  {
    id: 'preset_ayush_pitta',
    title: 'Acid Peptic Disorder (AYUSH Pitta)',
    category: 'Integrative AYUSH',
    patient: {
      fullName: 'Ananya Hegde',
      age: 38,
      gender: 'female',
      phone: '9900234190',
      abhaId: '91-7721-6543-1098',
      chiefComplaint: 'Acid Reflux (Amlapitta)',
      duration: '2 months',
      painScore: 5,
      vitals: { bp: '116/74', hr: '74', spo2: '99%', temp: '98.2°F' },
      allergies: ['No known allergies'],
      currentMeds: ['Antacid gel OTC'],
      symptoms: ['Burning sensation behind chest bone', 'Sour belching after meals'],
      history: 'Irregular food habits, excessive coffee intake.',
      isRedFlag: false
    }
  }
];

const FIRST_NAMES = ['Ramesh', 'Suresh', 'Priya', 'Anand', 'Lakshmi', 'Vijay', 'Deepa', 'Mahesh', 'Bhavana', 'Chetan'];
const LAST_NAMES = ['Gowda', 'Kumar', 'Shetty', 'Bhat', 'Patil', 'Hegde', 'Rao', 'Deshmukh'];
const COMPLAINTS = ['Fever & Bodyache', 'Chest Tightness', 'Severe Headache', 'Joint Pain & Swelling', 'Abdominal Cramps', 'Shortness of Breath'];

export default function FakeDetailsHandler({ isOpen, onClose, onAutofillIntake, onDirectQueueInject }) {
  const [selectedPreset, setSelectedPreset] = useState(MOCK_PRESETS[0]);
  const [activePatient, setActivePatient] = useState(MOCK_PRESETS[0].patient);
  const [copied, setCopied] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [injectSuccess, setInjectSuccess] = useState(null);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setActivePatient({ ...preset.patient });
  };

  const handleRandomize = () => {
    const isFemale = Math.random() > 0.5;
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const age = Math.floor(Math.random() * 50) + 20;
    const complaint = COMPLAINTS[Math.floor(Math.random() * COMPLAINTS.length)];
    const randAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const sysBP = Math.floor(115 + Math.random() * 35);
    const diaBP = Math.floor(75 + Math.random() * 20);
    const hr = Math.floor(70 + Math.random() * 30);

    const newPatient = {
      fullName: `${fName} ${lName}`,
      age,
      gender: isFemale ? 'female' : 'male',
      phone: randPhone,
      abhaId: randAbha,
      chiefComplaint: complaint,
      duration: `${Math.floor(Math.random() * 4) + 1} days`,
      painScore: Math.floor(Math.random() * 8) + 1,
      vitals: { bp: `${sysBP}/${diaBP}`, hr: `${hr}`, spo2: '98%', temp: '98.6°F' },
      allergies: Math.random() > 0.7 ? ['Penicillin'] : ['No known drug allergies'],
      currentMeds: ['Paracetamol 650mg SOS'],
      symptoms: [`Onset of ${complaint.toLowerCase()}`, 'Gradual progression over recent days'],
      history: 'Evaluated via MEDIKIOSK Synthetic Patient Generator for clinical testing.',
      isRedFlag: sysBP > 145 || hr > 98
    };

    setActivePatient(newPatient);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activePatient, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectInject = async () => {
    setInjecting(true);
    try {
      const payload = {
        patient: {
          name: activePatient.fullName,
          age: activePatient.age,
          gender: activePatient.gender,
          phone: activePatient.phone,
          abhaId: activePatient.abhaId
        },
        chiefComplaint: activePatient.chiefComplaint,
        socratesData: {
          site: 'Primary symptom area',
          onset: 'Gradual / Recent',
          character: 'Continuous aching / episodic',
          radiation: 'Localized',
          associated: activePatient.symptoms.join(', '),
          timing: activePatient.duration,
          exacerbating: 'Routine daily activities',
          severity: activePatient.painScore
        },
        patientInput: activePatient.symptoms.join('. '),
        answers: [
          { questionId: 'q_gen_1', text: 'Severity on pain scale', answer: `${activePatient.painScore}/10` },
          { questionId: 'q_gen_2', text: 'Known allergies', answer: activePatient.allergies.join(', ') },
          { questionId: 'q_gen_3', text: 'Current medications', answer: activePatient.currentMeds.join(', ') }
        ],
        allergies: activePatient.allergies,
        currentMedications: activePatient.currentMeds,
        isRedFlag: activePatient.isRedFlag,
        vitals: activePatient.vitals
      };

      const res = await createConsultation(payload);
      if (res && res.success) {
        setInjectSuccess(res.data.id);
        if (onDirectQueueInject) {
          setTimeout(() => {
            onDirectQueueInject(res.data.id);
            onClose();
          }, 1000);
        }
      }
    } catch (e) {
      if (onDirectQueueInject) {
        onDirectQueueInject('cons_demo_01');
        onClose();
      }
    } finally {
      setInjecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '740px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0'
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Test Patient Profiles
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Select a test profile to instantly populate patient check-in without typing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Preset Buttons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select a Profile:
              </span>
              <button
                onClick={handleRandomize}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} />
                <span>Randomize New Profile</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MOCK_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedPreset.id === p.id ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    background: selectedPreset.id === p.id ? '#ecfdf5' : '#ffffff',
                    color: selectedPreset.id === p.id ? '#059669' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Profile Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {activePatient.fullName}
                  </h4>
                  <span className="badge badge-source">{activePatient.age} Y · {activePatient.gender.toUpperCase()}</span>
                  {activePatient.isRedFlag && (
                    <span className="badge badge-urgent">Priority Red Flag</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                  ABHA: <strong>{activePatient.abhaId}</strong> · Phone: {activePatient.phone}
                </div>
              </div>

              {/* Vitals */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>BP</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>{activePatient.vitals.bp}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Pulse</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>{activePatient.vitals.hr} bpm</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>SpO2</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>{activePatient.vitals.spo2}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Chief Complaint:</span>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {activePatient.chiefComplaint} ({activePatient.duration})
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Allergies:</span>
                <div style={{ fontWeight: 600, color: '#dc2626', marginTop: '2px' }}>
                  {activePatient.allergies.join(', ')}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#64748b' }}>Symptoms & History:</span>
                <div style={{ color: '#334155', marginTop: '2px', lineHeight: '1.4' }}>
                  {activePatient.symptoms.join(' • ')} — {activePatient.history}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleCopyJson}
              className="btn btn-secondary"
              style={{ fontSize: '12.5px', padding: '8px 14px' }}
            >
              {copied ? <Check size={15} color="#059669" /> : <Copy size={15} />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (onAutofillIntake) {
                    onAutofillIntake(activePatient);
                    onClose();
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '13px', borderColor: '#059669', color: '#059669' }}
              >
                <Activity size={16} />
                <span>Auto-Fill Check-In Kiosk</span>
              </button>

              <button
                onClick={handleDirectInject}
                disabled={injecting}
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
              >
                <Zap size={16} />
                <span>{injectSuccess ? 'Sent! Opening...' : 'Send to Doctor Queue'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
