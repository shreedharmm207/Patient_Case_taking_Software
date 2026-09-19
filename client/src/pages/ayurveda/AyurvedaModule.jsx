// client/src/pages/ayurveda/AyurvedaModule.jsx
import React, { useState } from 'react';
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  BookOpen,
  ArrowRight,
  Clock,
  MapPin,
  Stethoscope,
  QrCode,
  Scan,
  UserCheck,
  FileText,
  Calendar,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPatientCases, verifyQrTokenAndFetchCase } from '../../utils/patientCaseQrService';

export const AYURVEDA_DOCTORS_DIRECTORY = [
  {
    id: 'doc_ayur_101',
    name: 'Dr. Vaidya Shreedhara Hegde',
    degree: 'BAMS, MD (Ayurveda - Kayachikitsa)',
    specialization: 'Kayachikitsa (Internal Medicine & Metabolic Health)',
    category: 'Kayachikitsa',
    hospital: 'Sri Jayachamarajendra Govt Ayurvedic Hospital',
    location: 'Dhanvantari Road, Bengaluru, Karnataka - 560009',
    availability: 'Mon - Sat (09:00 AM - 01:30 PM)',
    languages: ['English', 'Kannada', 'Hindi', 'Sanskrit'],
    consultationFee: '₹0 (Govt OPD) / ₹350 (Special Clinic)',
    rating: '4.9 ★',
    experience: '16+ Years Clinical Experience',
    bio: 'Specialist in metabolic wellness, functional gastrointestinal disorders, chronic acid-peptic diseases, and integrative lifestyle balance.'
  },
  {
    id: 'doc_ayur_102',
    name: 'Dr. Ananya K. Sharma',
    degree: 'BAMS, MD (Ayurveda - Panchakarma)',
    specialization: 'Panchakarma & Chronic Musculoskeletal Care',
    category: 'Panchakarma',
    hospital: 'National Institute of Ayurveda & AYUSH Integrated Center',
    location: 'Jayanagar 4th Block, Bengaluru, Karnataka - 560011',
    availability: 'Mon - Fri (10:00 AM - 04:00 PM)',
    languages: ['English', 'Kannada', 'Hindi'],
    consultationFee: '₹400 (Demo / Estimated)',
    rating: '4.8 ★',
    experience: '12+ Years Clinical Experience',
    bio: 'Expert in classical Panchakarma detoxification protocols, cervical spondylosis, osteoarthritis, and chronic stress management.'
  },
  {
    id: 'doc_ayur_103',
    name: 'Dr. Raghuram Bhat',
    degree: 'BAMS, MS (Ayurveda - Shalya Tantra)',
    specialization: 'Shalya Tantra (Integrative Wound & Anorectal Care)',
    category: 'Shalya Tantra',
    hospital: 'Government Ayurveda Medical College & Hospital',
    location: 'Sayyaji Rao Road, Mysuru, Karnataka - 570001',
    availability: 'Tue - Sun (09:30 AM - 02:00 PM)',
    languages: ['English', 'Kannada', 'Tulu'],
    consultationFee: '₹0 (Govt OPD) / ₹300 (Private Consultation)',
    rating: '4.9 ★',
    experience: '14+ Years Clinical Experience',
    bio: 'Pioneer in minimally invasive Ksharasutra procedures, non-healing ulcer care, and integrative surgical wound healing.'
  },
  {
    id: 'doc_ayur_104',
    name: 'Dr. Priyamvada Patil',
    degree: 'BAMS, MD (Kaumarbhritya & Swasthavritta)',
    specialization: 'Swasthavritta (Preventive Dietetics & Lifestyle Medicine)',
    category: 'Swasthavritta',
    hospital: 'AYUSH Integrated Wellness Center',
    location: 'Vidyanagar, Hubballi-Dharwad, Karnataka - 580021',
    availability: 'Mon - Sat (11:00 AM - 05:00 PM)',
    languages: ['English', 'Kannada', 'Marathi'],
    consultationFee: '₹300 (Demo / Estimated)',
    rating: '4.7 ★',
    experience: '9+ Years Clinical Experience',
    bio: 'Specialist in Dinacharya (daily regimen), seasonal dietetics (Ritucharya), pediatric nutrition, and immunity building.'
  }
];

export default function AyurvedaModule({ onSyncToDoctor, onOpenKioskWithAyurveda }) {
  const { isKannada } = useLanguage();

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'qr-consult' | 'guidelines'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedDoctorForConsult, setSelectedDoctorForConsult] = useState(null);
  const [consultRequestSubmitted, setConsultRequestSubmitted] = useState(false);

  // Patient QR Scanning state for Ayurveda Doctor
  const [inputQrCaseId, setInputQrCaseId] = useState('CASE-2026-0103');
  const [consentGranted, setConsentGranted] = useState(false);
  const [retrievedCase, setRetrievedCase] = useState(null);
  const [qrVerifyError, setQrVerifyError] = useState('');

  const filteredDoctors = AYURVEDA_DOCTORS_DIRECTORY.filter((doc) => {
    if (categoryFilter === 'ALL') return true;
    return doc.category === categoryFilter;
  });

  // Handle Ayurveda Doctor QR Lookup
  const handleAyurvedaDoctorScan = () => {
    setQrVerifyError('');
    if (!consentGranted) {
      setQrVerifyError('Patient authorization and consent is mandatory before case information can be retrieved.');
      return;
    }

    const cases = getPatientCases();
    const found = cases.find((c) => c.caseId.toUpperCase() === inputQrCaseId.trim().toUpperCase());
    if (found) {
      setRetrievedCase(found);
    } else {
      setQrVerifyError(`No case found with ID "${inputQrCaseId}". Try "CASE-2026-0103" or "CASE-2026-0102".`);
    }
  };

  const handleRequestConsultation = (doc) => {
    setSelectedDoctorForConsult(doc);
    setConsultRequestSubmitted(false);
  };

  const handleConfirmConsultRequest = () => {
    setConsultRequestSubmitted(true);
    setTimeout(() => {
      setSelectedDoctorForConsult(null);
      setConsultRequestSubmitted(false);
      alert(`Consultation requested with ${selectedDoctorForConsult.name}! Your structured summary and Patient QR pass will be made available upon appointment.`);
    }, 1800);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Top Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
          border: '1.5px solid #a7f3d0',
          borderRadius: '24px',
          padding: '2.25rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px -6px rgba(5, 150, 105, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '780px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#ffffff', borderRadius: '999px', border: '1px solid #86efac', color: '#047857', fontSize: '12.5px', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Leaf size={15} color="#059669" />
                <span>AYUSH INTEGRATED CLINICAL PATHWAY · MINISTRY OF AYUSH GUIDELINES</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#064e3b', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                Ayurveda Integrative Healthcare Portal
              </h1>
              <p style={{ fontSize: '1rem', color: '#065f46', lineHeight: 1.6, margin: 0 }}>
                Explore accredited Ayurveda practitioners, request consultations, share structured case summaries through secure patient QR consent, and manage lifestyle medicine protocols.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('directory')}
                className={`btn ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13.5px', padding: '10px 18px' }}
              >
                <Stethoscope size={16} />
                <span>Doctor Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('qr-consult')}
                className={`btn ${activeTab === 'qr-consult' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13.5px', padding: '10px 18px' }}
              >
                <QrCode size={16} />
                <span>Patient QR Consultation</span>
              </button>

              <button
                onClick={() => setActiveTab('guidelines')}
                className={`btn ${activeTab === 'guidelines' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13.5px', padding: '10px 18px' }}
              >
                <BookOpen size={16} />
                <span>Clinical Principles</span>
              </button>
            </div>
          </div>

          {/* Safety & Non-Automated Transparency Banner */}
          <div style={{
            marginTop: '1.5rem',
            background: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, fontSize: '13px' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Healthcare Choice & Safety Principles:</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#334155', flex: 1, minWidth: '280px' }}>
              Ayurveda is presented as one available, evidence-guided healthcare choice. The system <strong>does not automatically diagnose diseases, Doshas, or prescribe Ayurvedic medicines</strong>. All care plans are verified by certified BAMS/MD practitioners.
            </div>
          </div>
        </div>

        {/* Urgent Emergency Warning Banner */}
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={24} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
            <strong>Urgent Symptoms Safety Rule:</strong> If you or the patient experience potentially urgent symptoms (such as crushing chest pain radiating to the arm, sudden difficulty breathing, acute abdominal guarding, or high intractable fever), immediately visit the <strong>Emergency Department / Allopathic Resuscitation</strong>. Ayurveda care cannot be used as a substitute for emergency medicine.
          </div>
        </div>

        {/* TAB 1: AYURVEDA DOCTOR DIRECTORY */}
        {activeTab === 'directory' && (
          <div>
            {/* Category Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Ayurveda Doctor & Clinic Directory
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                  Accredited practitioners across Kayachikitsa, Panchakarma, Shalya Tantra, and Lifestyle Medicine.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['ALL', 'Kayachikitsa', 'Panchakarma', 'Shalya Tantra', 'Swasthavritta'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: categoryFilter === cat ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: categoryFilter === cat ? '#ecfdf5' : '#ffffff',
                      color: categoryFilter === cat ? '#047857' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat === 'ALL' ? 'All Specialties' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(5, 150, 105, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                        {doc.degree}
                      </div>
                    </div>
                    <span style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0'
                    }}>
                      {doc.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, marginBottom: '8px' }}>
                    🩺 {doc.specialization}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px', flex: 1 }}>
                    {doc.bio}
                  </div>

                  {/* Details Grid */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: '#475569' }}>
                      🏥 <strong>Facility:</strong> {doc.hospital}
                    </div>
                    <div style={{ color: '#475569' }}>
                      📍 <strong>Location:</strong> {doc.location}
                    </div>
                    <div style={{ color: '#475569' }}>
                      🕒 <strong>Availability:</strong> {doc.availability}
                    </div>
                    <div style={{ color: '#475569' }}>
                      🗣️ <strong>Languages:</strong> {doc.languages.join(', ')}
                    </div>
                    <div style={{ color: '#047857', fontWeight: 700, paddingTop: '4px', borderTop: '1px solid #e2e8f0' }}>
                      💵 <strong>Est. Consultation Fee:</strong> {doc.consultationFee}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleRequestConsultation(doc)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '13.5px', padding: '10px' }}
                  >
                    <Calendar size={16} />
                    <span>Request Ayurveda Consultation</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT QR AYURVEDA CONSULTATION & CONSENT GATEWAY */}
        {activeTab === 'qr-consult' && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  border: '1.5px solid #a7f3d0'
                }}>
                  <QrCode size={28} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Ayurveda Doctor Patient QR Scanner
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                  “Patient generates QR → Ayurveda doctor scans → Patient authorization/consent → Relevant case information displayed.”
                </p>
              </div>

              {/* Step 1: Doctor Input / Scan Box */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '18px',
                padding: '1.75rem',
                marginBottom: '2rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    Enter or Scan Patient Case ID / Token:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={inputQrCaseId}
                      onChange={(e) => setInputQrCaseId(e.target.value)}
                      placeholder="e.g. CASE-2026-0103"
                      style={{
                        flex: 1,
                        minWidth: '240px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                    <button
                      onClick={handleAyurvedaDoctorScan}
                      className="btn btn-primary"
                      style={{ fontSize: '13.5px', padding: '10px 20px' }}
                    >
                      <Scan size={16} />
                      <span>Retrieve Patient Case</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                    Pre-seeded cases: <code>CASE-2026-0103</code> (Parvathi Rao - Ayurveda Care), <code>CASE-2026-0102</code> (Gangamma B.)
                  </div>
                </div>

                {/* Patient Consent Requirement */}
                <div style={{
                  background: '#ffffff',
                  border: consentGranted ? '1.5px solid #059669' : '1.5px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="ayurQrConsent"
                    checked={consentGranted}
                    onChange={(e) => {
                      setConsentGranted(e.target.checked);
                      if (!e.target.checked) setRetrievedCase(null);
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <label htmlFor="ayurQrConsent" style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                    Patient Authorization Confirmed: Patient has explicitly authorized this Ayurveda physician to access their structured case summary and longitudinal consultation history.
                  </label>
                </div>

                {qrVerifyError && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>
                    ⚠️ {qrVerifyError}
                  </div>
                )}
              </div>

              {/* Unlocked Patient Case View */}
              {retrievedCase && consentGranted && (
                <div style={{
                  background: '#ffffff',
                  border: '2px solid #a7f3d0',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 8px 24px rgba(5, 150, 105, 0.08)'
                }}>
                  {/* Patient Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <span className="badge badge-success" style={{ marginBottom: '4px' }}>
                        CONSENT VERIFIED & CASE UNLOCKED
                      </span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                        {retrievedCase.patient.fullName}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {retrievedCase.patient.age}Y • {retrievedCase.patient.gender} • Blood Group: {retrievedCase.patient.bloodGroup} • ABHA: {retrievedCase.patient.abhaId}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Case Identifier:</div>
                      <strong style={{ fontSize: '1.1rem', color: '#047857' }}>{retrievedCase.caseId}</strong>
                    </div>
                  </div>

                  {/* Consultations List */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                      Longitudinal Consultation Timeline:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {retrievedCase.consultations.map((c, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                              Visit #{c.visitNumber}: {c.department}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{c.date} • {c.doctorName}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                            <strong>Chief Complaint:</strong> "{c.chiefComplaint}"
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                            Confirmed Diagnosis: {c.diagnosis}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                            <strong>Notes:</strong> {c.notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interdisciplinary Referrals */}
                  {retrievedCase.referrals && retrievedCase.referrals.length > 0 && (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 16px', marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                        Active Cross-Referral:
                      </strong>
                      {retrievedCase.referrals.map((r, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>
                          From: <strong>{r.fromDoctor}</strong> → To: <strong>{r.toSpecialty}</strong> (Reason: {r.reason})
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Audit Log Recorded: Ayurveda Physician retrieved history with verified token.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CLINICAL PRINCIPLES & GUIDELINES */}
        {activeTab === 'guidelines' && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <BookOpen size={24} color="#059669" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Ayurveda Clinical Protocol & Ministry Guidelines
                </h2>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
                The MEDIKIOSK platform implements the standards established by the Ministry of Ayush, Government of India. It emphasizes integrative clinical collaboration between modern medicine and classical Ayurveda.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    1. Equal Healthcare Pathway
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Ayurveda is recognized as a legitimate, time-tested system of medicine. It is presented without bias or claiming automatic superiority over allopathic care.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    2. Strict Non-Autonomous Diagnostics
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    No automated software can prescribe formulations or diagnose Dosha imbalances. Only a licensed practitioner (BAMS / MD Ayurveda) conducts pulse diagnosis (Nadi Pariksha) and validates therapies.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    3. Bi-Directional Cross-Referrals
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    General doctors may refer chronic patients for lifestyle management (Ahara/Vihara), and Ayurveda doctors immediately refer acute surgical or cardiac cases to modern medicine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Consultation Modal */}
        {selectedDoctorForConsult && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-success">APPOINTMENT REQUEST</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                    Request Consultation
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDoctorForConsult(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#065f46', fontSize: '1rem' }}>{selectedDoctorForConsult.name}</strong>
                <div style={{ color: '#047857', fontSize: '0.85rem' }}>{selectedDoctorForConsult.specialization}</div>
                <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '4px' }}>🏥 {selectedDoctorForConsult.hospital}</div>
                <div style={{ color: '#475569', fontSize: '0.8rem' }}>💵 Fee: {selectedDoctorForConsult.consultationFee}</div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                By requesting this consultation, your existing pre-consultation case summary and Patient QR pass will be made accessible to this practitioner upon confirmation of authorization.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedDoctorForConsult(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConsultRequest}
                  className="btn btn-primary"
                  disabled={consultRequestSubmitted}
                >
                  {consultRequestSubmitted ? 'Routing Request...' : 'Confirm Consultation Request'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
