// client/src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Printer,
  ChevronRight,
  Stethoscope,
  X,
  Edit3,
  Calendar,
  Save,
  Plus,
  ShieldAlert,
  Info
} from 'lucide-react';
import { getConsultations, getConsultationById, verifyConsultation, getPatientById } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import RedFlagAlertBanner from '../../components/RedFlagAlertBanner';

export default function DoctorDashboard({ initialSelectedCaseId = null }) {
  const { t, lang, isKannada } = useLanguage();
  const { user } = useAuth();

  const [consultations, setConsultations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Case for Modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [patientTimeline, setPatientTimeline] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Doctor Edit Form State
  const [doctorNotes, setDoctorNotes] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [newRxDrug, setNewRxDrug] = useState('');
  const [newRxDose, setNewRxDose] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);

  // Fetch Consultations
  const loadConsultations = async () => {
    setLoading(true);
    try {
      const res = await getConsultations();
      if (res.success) {
        setConsultations(res.data);

        // If an initial case was requested (e.g. from Home demo click)
        if (initialSelectedCaseId) {
          const match = res.data.find(c => c.id === initialSelectedCaseId);
          if (match) openCaseSheet(match);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, [initialSelectedCaseId]);

  // Open Case Sheet Modal & Load Timeline
  const openCaseSheet = async (caseItem) => {
    setSelectedCase(caseItem);
    setDoctorNotes(caseItem.doctorVerification?.doctorNotes || '');
    setProvisionalDiagnosis(caseItem.doctorVerification?.provisionalDiagnosis || '');
    setPrescriptions(caseItem.doctorVerification?.prescriptions || []);

    // Fetch unified patient history timeline
    if (caseItem.patientId || caseItem.abhaId) {
      try {
        const pRes = await getPatientById(caseItem.patientId || caseItem.abhaId);
        if (pRes.success && pRes.data.unifiedTimeline) {
          setPatientTimeline(pRes.data.unifiedTimeline);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add prescription item
  const handleAddRx = () => {
    if (!newRxDrug) return;
    setPrescriptions([...prescriptions, { drug: newRxDrug, dose: newRxDose || 'As directed', timing: 'Oral after food' }]);
    setNewRxDrug('');
    setNewRxDose('');
  };

  // Save / Verify Case Sheet
  const handleVerifyCase = async () => {
    if (!selectedCase) return;
    setIsVerifying(true);
    try {
      const payload = {
        doctorName: user?.name || "Dr. Ananya Sharma, MD",
        doctorNotes,
        provisionalDiagnosis,
        prescriptions,
        status: "REVIEWED"
      };

      const res = await verifyConsultation(selectedCase.id, payload);
      if (res.success) {
        setSelectedCase(res.data);
        loadConsultations(); // refresh queue
        alert("Case Sheet verified and clinical notes recorded successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter queue
  const filteredList = consultations.filter(c => {
    if (filterStatus === 'URGENT' && !c.isRedFlag && c.status !== 'IMMEDIATE_ATTENTION') return false;
    if (filterStatus === 'PENDING' && c.status !== 'PENDING_REVIEW') return false;
    if (filterStatus === 'REVIEWED' && c.status !== 'REVIEWED' && c.status !== 'COMPLETED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.patientName && c.patientName.toLowerCase().includes(q)) ||
        (c.abhaId && c.abhaId.toLowerCase().includes(q)) ||
        (c.tokenNumber && c.tokenNumber.toLowerCase().includes(q)) ||
        (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const urgentCount = consultations.filter(c => c.isRedFlag || c.status === 'IMMEDIATE_ATTENTION').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {t('doctorDashboardTitle')}
            </h1>
            {urgentCount > 0 && (
              <span className="badge badge-urgent" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
                🚨 {urgentCount} Urgent Red Flags
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Attending: {user?.name || "Dr. Ananya Sharma, MD (KMC-48291)"} • Victoria Hospital OPD Unit 1
          </p>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '0.5rem 0.85rem',
            minWidth: '280px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          All ({consultations.length})
        </button>

        <button
          onClick={() => setFilterStatus('URGENT')}
          className={`btn ${filterStatus === 'URGENT' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: filterStatus === 'URGENT' ? '#ff2d55' : undefined }}
        >
          Priority Queue ({urgentCount})
        </button>

        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`btn ${filterStatus === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Pending Review ({consultations.filter(c => c.status === 'PENDING_REVIEW').length})
        </button>

        <button
          onClick={() => setFilterStatus('REVIEWED')}
          className={`btn ${filterStatus === 'REVIEWED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Completed / Reviewed ({consultations.filter(c => c.status === 'REVIEWED' || c.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Queue Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredList.map((item) => {
          const isUrgent = item.isRedFlag || item.status === 'IMMEDIATE_ATTENTION';
          const isDone = item.status === 'REVIEWED' || item.status === 'COMPLETED';

          return (
            <div
              key={item.id}
              onClick={() => openCaseSheet(item)}
              className={`glass-panel glass-panel-hover ${isUrgent ? 'emergency-card-alert' : ''}`}
              style={{
                padding: '1.4rem',
                cursor: 'pointer',
                border: isUrgent ? '1.5px solid #ff2d55' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isUrgent ? 'rgba(255, 45, 85, 0.08)' : 'rgba(18, 30, 60, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.patientName}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ({item.patientAge}y / {item.patientGender})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    ABHA: {item.abhaId}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: isUrgent ? '#ff2d55' : isDone ? 'rgba(0, 229, 163, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: isUrgent ? '#ffffff' : isDone ? '#00e5a3' : '#fbbf24',
                    border: `1px solid ${isUrgent ? '#ff2d55' : isDone ? '#00e5a3' : '#f59e0b'}`
                  }}>
                    {item.tokenNumber}
                  </span>
                </div>
              </div>

              {/* Red Flag Alert Chip if present */}
              {isUrgent && (
                <div style={{
                  background: 'rgba(255, 45, 85, 0.2)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.78rem',
                  color: '#ff85a1',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Flame size={14} color="#ff2d55" />
                  <span>NEEDS IMMEDIATE CLINICAL ATTENTION</span>
                </div>
              )}

              {/* Chief Complaint */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Chief Complaint:
                </span>
                <p style={{ fontSize: '0.88rem', color: '#f1f5f9', marginTop: '0.15rem', lineHeight: '1.4' }}>
                  "{item.chiefComplaint}"
                </p>
              </div>

              {/* Quick Tags: Symptoms & Meds */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {item.summary?.presentingSymptoms?.slice(0, 3).map((sym, i) => (
                  <span key={i} className="badge badge-source" style={{ fontSize: '0.68rem' }}>
                    {sym}
                  </span>
                ))}
                {item.documentExtractions && item.documentExtractions.length > 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                    📄 {item.documentExtractions.length} Doc Attached
                  </span>
                )}
                {item.language === 'kn' && (
                  <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>
                    ಕನ್ನಡ Intake
                  </span>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '0.6rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} />
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                </span>
                <span style={{ color: '#00e5a3', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {t('viewCaseBtn')}
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CASE SHEET MODAL */}
      {selectedCase && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(4, 9, 20, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '1060px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedCase(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            {/* Case Sheet Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                    {t('caseSheetTitle')}
                  </h2>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: selectedCase.isRedFlag ? '#ff2d55' : '#00e5a3',
                    color: selectedCase.isRedFlag ? '#ffffff' : '#05131c',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    {selectedCase.tokenNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.35rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <strong>{selectedCase.patientName}</strong> • {selectedCase.patientAge} Years / {selectedCase.patientGender} • ABHA: {selectedCase.abhaId}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <Printer size={15} />
                  <span>Print Case Sheet</span>
                </button>
              </div>
            </div>

            {/* RED-FLAG ALERT BANNER IF APPLICABLE */}
            {selectedCase.isRedFlag && (
              <RedFlagAlertBanner redFlagReport={selectedCase.redFlagReport} />
            )}

            {/* AI Case Summary Badge Notice */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              fontSize: '0.78rem',
              color: '#c7d2fe',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={16} color="#818cf8" />
                <span>{t('physicianSummaryBadge')}</span>
              </div>
              <span style={{ color: '#94a3b8' }}>ABDM & HL7 FHIR Compatible</span>
            </div>

            {/* Clinical Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Left Column: HPI & Adaptive Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* HPI Card */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#00e5a3' }}>
                      {t('socratesHpi')}
                    </strong>
                    <span className="badge badge-source">[AI Structured + Voice Transcript]</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: '1.55' }}>
                    {selectedCase.summary?.historyOfPresentingIllness || selectedCase.chiefComplaint}
                  </p>
                </div>

                {/* Adaptive Follow-up QA Log */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#60a5fa' }}>
                      AI Adaptive Questioning History
                    </strong>
                    <span className="badge badge-source">[Patient Verified]</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCase.adaptiveAnswers?.map((ans, idx) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 600 }}>• {ans.question}</div>
                        <div style={{ color: ans.isAlert ? '#ff4d6d' : '#00e5a3', fontWeight: 700, marginTop: '0.15rem' }}>
                          ➜ {ans.answer}
                        </div>
                        {ans.rationale && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', fontStyle: 'italic' }}>
                            Clinical intent: {ans.rationale}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AYUSH parameters if collected */}
                {selectedCase.ayushData && (
                  <div style={{ background: 'rgba(0, 229, 163, 0.06)', border: '1px solid rgba(0, 229, 163, 0.3)', borderRadius: '12px', padding: '1rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#00e5a3', display: 'block', marginBottom: '0.4rem' }}>
                      AYUSH Dashavidha Pariksha Intake:
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div>Prakriti: <strong style={{ color: '#ffffff' }}>{selectedCase.ayushData.prakriti}</strong></div>
                      <div>Agni: <strong style={{ color: '#ffffff' }}>{selectedCase.ayushData.agni}</strong></div>
                      <div>Koshtha: <strong style={{ color: '#ffffff' }}>{selectedCase.ayushData.koshtha}</strong></div>
                      <div>Ahara-Vihara: <strong style={{ color: '#ffffff' }}>{selectedCase.ayushData.aharaVihara}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Medical History, Abnormal Labs, Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Past History & Meds */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#fbbf24', display: 'block', marginBottom: '0.6rem' }}>
                    Baseline Clinical Background
                  </strong>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Past Conditions:</span>{' '}
                      <span style={{ color: '#ffffff' }}>
                        {Array.isArray(selectedCase.summary?.pastMedicalHistory) ? selectedCase.summary.pastMedicalHistory.join(', ') : selectedCase.medicalHistory?.conditions || 'None'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Current Medications:</span>{' '}
                      <span style={{ color: '#ffffff' }}>
                        {Array.isArray(selectedCase.summary?.currentMedications) ? selectedCase.summary.currentMedications.join(', ') : selectedCase.medicalHistory?.medications || 'None'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: '#ff6b8b', fontWeight: 700 }}>⚠️ Known Allergies:</span>{' '}
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>
                        {Array.isArray(selectedCase.summary?.allergies) ? selectedCase.summary.allergies.join(', ') : selectedCase.medicalHistory?.allergies || 'NKDA'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents & Abnormal Lab Values */}
                {selectedCase.documentExtractions && selectedCase.documentExtractions.length > 0 && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1.5px solid rgba(59, 130, 246, 0.35)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#60a5fa' }}>
                        Digitized Documents & Investigations (OCR)
                      </strong>
                      <span className="badge badge-source">[OCR Digitized]</span>
                    </div>

                    {selectedCase.documentExtractions.map((doc, i) => (
                      <div key={i} style={{ marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                          📄 {doc.name}
                        </div>

                        {/* Abnormal lab value highlights */}
                        {doc.abnormalValues && doc.abnormalValues.length > 0 && (
                          <div style={{ marginTop: '0.35rem', background: 'rgba(255, 45, 85, 0.15)', border: '1px solid #ff2d55', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                            <span style={{ color: '#ff4d6d', fontWeight: 700, fontSize: '0.78rem' }}>
                              ⚠️ {t('abnormalFindings')}:
                            </span>
                            {doc.abnormalValues.map((abn, j) => (
                              <div key={j} style={{ fontSize: '0.78rem', color: '#ffccd5', marginTop: '0.15rem' }}>
                                • <strong>{abn.parameter}:</strong> {abn.observed} (Ref: {abn.reference}) — {abn.clinicalNote}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Patient History Timeline */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Calendar size={16} color="#00e5a3" />
                    <strong style={{ fontSize: '0.95rem', color: '#00e5a3' }}>
                      {t('patientTimelineTitle')}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patientTimeline.length > 0 ? (
                      patientTimeline.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          fontSize: '0.82rem',
                          borderLeft: '2px solid rgba(0, 229, 163, 0.4)',
                          paddingLeft: '0.6rem'
                        }}>
                          <span style={{ color: '#94a3b8', fontWeight: 700, minWidth: '85px' }}>{item.date}</span>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.complaint}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {item.outcome || item.doctorNotes || 'Consultation record'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        First visit recorded in MEDIKIOSK network.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* CLINICAL CROSS-VERIFICATION ENGINE FINDINGS */}
            {selectedCase.crossVerificationReport && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1.5px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldAlert size={22} color="#c084fc" />
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                        Clinical Cross-Verification Engine Findings
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        Automated reconciliation of current symptoms against past history, medications & allergies
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-source" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                    {selectedCase.crossVerificationReport.totalAlerts || 0} Flagged Issue{selectedCase.crossVerificationReport.totalAlerts === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedCase.crossVerificationReport.alerts?.map((alert, aIdx) => (
                    <div key={aIdx} style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#ff2d55' : alert.severity === 'HIGH' ? '#f59e0b' : '#00e5a3'}`,
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#ffffff' }}>{alert.title}</strong>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: alert.severity === 'CRITICAL' ? 'rgba(255, 45, 85, 0.3)' : alert.severity === 'HIGH' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 229, 163, 0.2)',
                          color: alert.severity === 'CRITICAL' ? '#ff85a1' : alert.severity === 'HIGH' ? '#fbbf24' : '#00e5a3'
                        }}>
                          {alert.severity}
                        </span>
                      </div>
                      <p style={{ color: '#e2e8f0', margin: '0.15rem 0' }}>{alert.finding}</p>
                      <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                        Evidence Source: <span style={{ color: '#c7d2fe' }}>{alert.evidenceSource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATTENDING PHYSICIAN NOTES & VERIFICATION SECTION */}
            <div style={{
              background: 'rgba(15, 25, 51, 0.9)',
              border: '2px solid rgba(0, 229, 163, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Edit3 size={20} color="#00e5a3" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {t('doctorNotesHeading')}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    {t('provisionalDiagnosisLabel')}:
                  </label>
                  <input
                    type="text"
                    value={provisionalDiagnosis}
                    onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Coronary Syndrome (NSTEMI) / Acute Appendicitis / Acute Viral Bronchitis"
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Prescribe Medication:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newRxDrug}
                      onChange={(e) => setNewRxDrug(e.target.value)}
                      placeholder="e.g. Tab. Paracetamol 650mg"
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddRx}
                      className="btn btn-secondary"
                      style={{ padding: '0.75rem 1rem' }}
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Prescriptions List */}
              {prescriptions.length > 0 && (
                <div style={{ marginBottom: '1.25rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00e5a3', marginBottom: '0.35rem' }}>
                    Prescribed Medicines:
                  </div>
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                      <span>💊 {rx.drug} — {rx.dose}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rx.timing || rx.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Clinical Notes Textarea */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Doctor's Clinical Notes & Treatment Plan:
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder={t('doctorNotesPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedCase.doctorVerification?.verified ? (
                    <span style={{ color: '#00e5a3' }}>
                      ✓ Verified by {selectedCase.doctorVerification.verifiedBy} on {new Date(selectedCase.doctorVerification.verificationTimestamp).toLocaleString()}
                    </span>
                  ) : (
                    <span>Status: Pending Physician Sign-off</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="btn btn-secondary"
                  >
                    {t('closeModal')}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyCase}
                    className="btn btn-primary"
                    style={{ minWidth: '220px' }}
                  >
                    <Save size={18} />
                    <span>{isVerifying ? 'Saving Verification...' : t('verifyAndApproveBtn')}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
