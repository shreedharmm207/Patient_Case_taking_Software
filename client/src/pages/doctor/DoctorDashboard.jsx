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
  ShieldCheck,
  Info,
  Leaf,
  ArrowLeftRight,
  Share2,
  ExternalLink,
  Activity,
  QrCode,
  Check
} from 'lucide-react';
import { getConsultations, getConsultationById, verifyConsultation, getPatientById } from '../../utils/api';
import { getPatientCases, generateQrDataUrl } from '../../utils/patientCaseQrService';
import { auditConsultationIntegrity } from '../../utils/fakeDetailsValidator';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import RedFlagAlertBanner from '../../components/RedFlagAlertBanner';

export default function DoctorDashboard({ initialSelectedCaseId = null }) {
  const { t, lang, isKannada } = useLanguage();
  const { user } = useAuth();

  // Practitioner Role: 'allopathic' | 'ayurveda'
  const [doctorRole, setDoctorRole] = useState('allopathic');

  // Main Doctor Portal View Switcher: 'queue' | 'longitudinal' | 'fake-detector'
  const [activeViewTab, setActiveViewTab] = useState('queue');
  const [patientCasesList, setPatientCasesList] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);
  const [historyQrUrl, setHistoryQrUrl] = useState('');
  const [searchHistoryText, setSearchHistoryText] = useState('');

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

  // Ayurveda Specific Doctor Form State
  const [ayurvedaDietAdvice, setAyurvedaDietAdvice] = useState('');
  const [ayurvedaRoutineAdvice, setAyurvedaRoutineAdvice] = useState('');
  const [ayurvedaFollowUp, setAyurvedaFollowUp] = useState('2 Weeks');

  // Interdisciplinary Referral State
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralTarget, setReferralTarget] = useState('Ayurveda Care (Kayachikitsa)');
  const [referralReason, setReferralReason] = useState('');
  const [referralConsentConfirmed, setReferralConsentConfirmed] = useState(true);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

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
    const list = getPatientCases();
    if (list && list.length > 0) {
      setPatientCasesList(list);
      generateQrDataUrl(list[0].caseId, list[0].qrToken).then(setHistoryQrUrl);
    }
  }, [initialSelectedCaseId]);

  const handleSelectHistoryPatient = (idx) => {
    setSelectedHistoryIndex(idx);
    const selected = patientCasesList[idx];
    if (selected) {
      generateQrDataUrl(selected.caseId, selected.qrToken).then(setHistoryQrUrl);
    }
  };

  // Mark Clinical Data Integrity / Fake Details Audit
  const handleMarkIntegrity = async (integrityStatus) => {
    if (!selectedCase) return;
    try {
      const payload = {
        ...selectedCase.doctorVerification,
        dataIntegrityStatus: integrityStatus,
        auditedAt: new Date().toISOString()
      };
      const res = await verifyConsultation(selectedCase.id, {
        status: selectedCase.status || 'REVIEWED',
        doctorVerification: payload
      });
      if (res.success) {
        setSelectedCase({ ...selectedCase, doctorVerification: payload });
        loadConsultations();
        alert(integrityStatus === 'VERIFIED_GENUINE' ? "Patient details verified authentic!" : "Flagged as synthetic / suspicious registration.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving integrity audit.");
    }
  };

  // Open Case Sheet Modal & Load Timeline
  const openCaseSheet = async (caseItem) => {
    setSelectedCase(caseItem);
    setDoctorNotes(caseItem.doctorVerification?.doctorNotes || '');
    setProvisionalDiagnosis(caseItem.doctorVerification?.provisionalDiagnosis || '');
    setPrescriptions(caseItem.doctorVerification?.prescriptions || []);
    setAyurvedaDietAdvice(caseItem.ayurvedaDoctorNotes?.dietAdvice || '');
    setAyurvedaRoutineAdvice(caseItem.ayurvedaDoctorNotes?.routineAdvice || '');
    setAyurvedaFollowUp(caseItem.ayurvedaFollowUp || '2 Weeks');

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
      const isAyur = doctorRole === 'ayurveda' || selectedCase.carePathway === 'ayurveda';
      const payload = {
        doctorName: isAyur
          ? "Dr. Vaidya Shreedhara Hegde, BAMS, MD (Ayurveda)"
          : (user?.name || "Dr. Ananya Sharma, MD"),
        doctorNotes,
        provisionalDiagnosis,
        prescriptions,
        status: "REVIEWED",
        ayurvedaDoctorNotes: isAyur ? {
          dietAdvice: ayurvedaDietAdvice,
          routineAdvice: ayurvedaRoutineAdvice,
          clinicalNotes: doctorNotes
        } : null,
        ayurvedaFollowUp: isAyur ? ayurvedaFollowUp : null
      };

      const res = await verifyConsultation(selectedCase.id, payload);
      if (res.success) {
        setSelectedCase(res.data);
        loadConsultations(); // refresh queue
        alert(isAyur ? "Ayurveda Case Sheet and lifestyle guidance saved successfully!" : "Case Sheet verified and clinical notes recorded successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit Interdisciplinary Cross-Referral
  const handleSendReferral = async () => {
    if (!selectedCase) return;
    setIsSubmittingReferral(true);
    try {
      const fromDoc = doctorRole === 'ayurveda'
        ? "Dr. Vaidya Shreedhara Hegde, BAMS, MD"
        : (user?.name || "Dr. Ananya Sharma, MD");
      const fromSpec = doctorRole === 'ayurveda' ? "Ayurveda Care (Kayachikitsa)" : "General Medicine & Diabetology";

      const res = await fetch(`http://localhost:5000/api/consultations/${selectedCase.id}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referringDoctor: fromDoc,
          fromSpecialty: fromSpec,
          toSpecialty: referralTarget,
          reason: referralReason || (doctorRole === 'ayurveda' ? "Emergency / surgical diagnostic evaluation" : "Integrative lifestyle and chronic disease management"),
          patientConsentConfirmed: referralConsentConfirmed,
          clinicalNotes: doctorNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.data);
        setReferralModalOpen(false);
        loadConsultations();
        alert(`Interdisciplinary referral to "${referralTarget}" recorded successfully with patient consent!`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to record referral.");
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  // Filter queue
  const filteredList = consultations.filter(c => {
    if (doctorRole === 'ayurveda') {
      const isAyur = c.carePathway === 'ayurveda' ||
        c.ayurvedaCareRequest ||
        c.interdisciplinaryReferral?.toSpecialty?.toLowerCase().includes('ayurveda') ||
        c.tokenNumber?.includes('AYUR');
      if (!isAyur && filterStatus !== 'ALL_HOSPITAL') return false;
    }

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
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {doctorRole === 'ayurveda' ? 'Ayurveda Physician Portal (BAMS / MD)' : t('doctorDashboardTitle')}
            </h1>
            {urgentCount > 0 && doctorRole === 'allopathic' && (
              <span className="badge badge-urgent" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
                🚨 {urgentCount} Priority Attention
              </span>
            )}
            {doctorRole === 'ayurveda' && (
              <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: '#0d9488' }}>
                🌿 AYUSH Practice
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.35rem', margin: 0 }}>
            {doctorRole === 'ayurveda'
              ? 'Attending: Dr. Vaidya Shreedhara Hegde, BAMS, MD (AYUSH-KA-11082) • Govt Ayurvedic Hospital'
              : `Attending: ${user?.name || 'Dr. Ananya Sharma, MD (KMC-48291)'} • Hospital OPD Unit 1`}
          </p>
        </div>

        {/* Practitioner Role Switcher & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Role Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '4px',
            borderRadius: '12px',
            gap: '4px'
          }}>
            <button
              onClick={() => {
                setDoctorRole('allopathic');
                setReferralTarget('Ayurveda Care (Kayachikitsa)');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: doctorRole === 'allopathic' ? '#2563eb' : 'transparent',
                color: doctorRole === 'allopathic' ? '#ffffff' : '#94a3b8',
                boxShadow: doctorRole === 'allopathic' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              <Stethoscope size={14} />
              <span>Allopathic MD</span>
            </button>

            <button
              onClick={() => {
                setDoctorRole('ayurveda');
                setReferralTarget('Allopathic Emergency / Cardiology');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: doctorRole === 'ayurveda' ? '#059669' : 'transparent',
                color: doctorRole === 'ayurveda' ? '#ffffff' : '#94a3b8',
                boxShadow: doctorRole === 'ayurveda' ? '0 2px 8px rgba(5, 150, 105, 0.4)' : 'none'
              }}
            >
              <Leaf size={14} />
              <span>Ayurveda BAMS/MD</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '0.5rem 0.85rem',
            minWidth: '220px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={doctorRole === 'ayurveda' ? 'Search Ayurveda cases...' : t('searchPlaceholder')}
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

      {/* Primary Doctor Portal View Switcher Navigation */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveViewTab('queue')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: activeViewTab === 'queue' ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
            background: activeViewTab === 'queue' ? 'rgba(59, 130, 246, 0.22)' : '#111c35',
            color: activeViewTab === 'queue' ? '#93c5fd' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Activity size={16} color={activeViewTab === 'queue' ? '#60a5fa' : '#94a3b8'} />
          <span>Patient Consultation Queue ({consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab('longitudinal')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: activeViewTab === 'longitudinal' ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
            background: activeViewTab === 'longitudinal' ? 'rgba(59, 130, 246, 0.22)' : '#111c35',
            color: activeViewTab === 'longitudinal' ? '#93c5fd' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Calendar size={16} color={activeViewTab === 'longitudinal' ? '#60a5fa' : '#94a3b8'} />
          <span>Patient Longitudinal Visit Records & QR Pass</span>
        </button>

        <button
          onClick={() => setActiveViewTab('fake-detector')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: activeViewTab === 'fake-detector' ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
            background: activeViewTab === 'fake-detector' ? 'rgba(239, 68, 68, 0.2)' : '#111c35',
            color: activeViewTab === 'fake-detector' ? '#fca5a5' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={16} color={activeViewTab === 'fake-detector' ? '#ef4444' : '#94a3b8'} />
          <span>Fake Details & Data Integrity Audit Hub</span>
        </button>
      </div>

      {/* 1. CLINICAL CONSULTATION QUEUE VIEW */}
      {activeViewTab === 'queue' && (
        <>
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
                    border: isUrgent ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isUrgent ? 'rgba(239, 68, 68, 0.1)' : '#111c35',
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
                        background: isUrgent ? '#ef4444' : isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isUrgent ? '#ffffff' : isDone ? '#6ee7b7' : '#fbbf24',
                        border: `1px solid ${isUrgent ? '#ef4444' : isDone ? '#10b981' : '#f59e0b'}`
                      }}>
                        {item.tokenNumber}
                      </span>
                    </div>
                  </div>

                  {/* Red Flag Alert Chip if present */}
                  {isUrgent && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.78rem',
                      color: '#fca5a5',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Flame size={14} color="#ef4444" />
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
                    <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {t('viewCaseBtn')}
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 2. PATIENT LONGITUDINAL VISIT RECORDS (Relocated from Homepage into Doctor Dashboard) */}
      {activeViewTab === 'longitudinal' && (
        <div style={{
          background: '#111c35',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-success">PORTABLE CLINICAL RECORD</span>
                <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: 600 }}>Doctor Review & Case QR Pass</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Patient Longitudinal Visit Records & Reusable QR Case History
              </h2>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem'
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search patient or Case ID..."
                value={searchHistoryText}
                onChange={(e) => setSearchHistoryText(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Patient Switcher Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {patientCasesList
              .filter(c => !searchHistoryText || c.patient.fullName.toLowerCase().includes(searchHistoryText.toLowerCase()) || c.caseId.toLowerCase().includes(searchHistoryText.toLowerCase()))
              .map((c, idx) => (
              <button
                key={c.caseId}
                onClick={() => handleSelectHistoryPatient(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: selectedHistoryIndex === idx ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedHistoryIndex === idx ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedHistoryIndex === idx ? '#93c5fd' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: selectedHistoryIndex === idx ? '#3b82f6' : '#64748b'
                }} />
                <span>{c.patient.fullName}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>({c.caseId})</span>
              </button>
            ))}
          </div>

          {/* Active Case Details: QR Card on Left, Longitudinal History on Right */}
          {patientCasesList[selectedHistoryIndex] && (() => {
            const activeCase = patientCasesList[selectedHistoryIndex];
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start'
              }}>
                {/* Left Column: Reusable QR Card */}
                <div style={{
                  background: '#0d1527',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                      SECURE CASE QR IDENTIFIER
                    </span>
                    <span className="badge badge-success">ACTIVE PASS</span>
                  </div>

                  {historyQrUrl && (
                    <div style={{
                      background: '#ffffff',
                      padding: '14px',
                      borderRadius: '16px',
                      display: 'inline-block',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      marginBottom: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                    }}>
                      <img src={historyQrUrl} alt="Patient Case QR" style={{ width: '170px', height: '170px', display: 'block' }} />
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Patient Case ID:</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.02em' }}>
                    {activeCase.caseId}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>
                    {activeCase.patient.fullName} ({activeCase.patient.age}Y/{activeCase.patient.gender}) • Blood: {activeCase.patient.bloodGroup}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    ABHA: {activeCase.patient.abhaId}
                  </div>

                  <div style={{
                    marginTop: '14px',
                    fontSize: '12px',
                    color: '#93c5fd',
                    background: 'rgba(59, 130, 246, 0.12)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontWeight: 600
                  }}>
                    “Reusable across future OPD visits. Authorizes clinical history retrieval.”
                  </div>
                </div>

                {/* Right Column: Longitudinal Clinical History */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Cumulative Clinical Consultations ({activeCase.consultationHistory.length})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Chronological Order
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {activeCase.consultationHistory.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        style={{
                          background: '#0d1527',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          borderLeft: v.specialty.includes('Ayurveda') ? '4px solid #10b981' : '4px solid #3b82f6'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                                {v.date}
                              </span>
                              <span className="badge badge-source" style={{ fontSize: '10.5px' }}>
                                {v.tokenNumber}
                              </span>
                            </div>
                            <div style={{ fontSize: '12.5px', color: v.specialty.includes('Ayurveda') ? '#6ee7b7' : '#93c5fd', fontWeight: 700, marginTop: '2px' }}>
                              {v.specialty} • {v.doctorName}
                            </div>
                          </div>

                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                            {v.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '8px', lineHeight: '1.5' }}>
                          <strong>Chief Complaint:</strong> {v.complaint}
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                          <strong>Doctor Findings:</strong> {v.diagnosis}
                        </div>

                        {v.vitals && (
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11.5px', color: '#94a3b8', marginBottom: '8px' }}>
                            <span>BP: <strong style={{ color: '#ffffff' }}>{v.vitals.bp}</strong></span>
                            <span>Pulse: <strong style={{ color: '#ffffff' }}>{v.vitals.pulse} bpm</strong></span>
                            <span>SpO2: <strong style={{ color: '#ffffff' }}>{v.vitals.spo2}%</strong></span>
                          </div>
                        )}

                        {v.prescriptions && v.prescriptions.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {v.prescriptions.map((rx, rxIdx) => (
                              <span key={rxIdx} style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                💊 {rx.drug} ({rx.dose})
                              </span>
                            ))}
                          </div>
                        )}

                        {v.crossReferralNotes && (
                          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            🔄 <strong>Referral Log:</strong> {v.crossReferralNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. FAKE DETAILS & DATA INTEGRITY AUDIT HUB */}
      {activeViewTab === 'fake-detector' && (
        <div style={{
          background: '#111c35',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-urgent">FRAUD & SYNTHETIC DATA AUDIT</span>
                <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: 600 }}>Clinical Integrity Engine</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Patient Data Authenticity & Fake Details Verification
              </h2>
            </div>
            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              Real-time pattern analysis of phone numbers, ABHA, names & physiological plausibility
            </span>
          </div>

          {/* Audit Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>TOTAL CASES AUDITED</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                {consultations.length}
              </div>
              <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '2px' }}>Intake & Registration Records</div>
            </div>

            <div style={{ background: '#0d1527', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#6ee7b7', fontWeight: 600 }}>AUTHENTIC PATIENTS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                {consultations.filter(c => auditConsultationIntegrity(c).status === 'AUTHENTIC').length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Verified High Clinical Integrity</div>
            </div>

            <div style={{ background: '#0d1527', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>FLAGGED SYNTHETIC / SUSPICIOUS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>
                {consultations.filter(c => auditConsultationIntegrity(c).status !== 'AUTHENTIC').length}
              </div>
              <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '2px' }}>Requires ID Check at Registration</div>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {consultations.map((c) => {
              const audit = auditConsultationIntegrity(c);
              const isVerified = c.doctorVerification?.dataIntegrityStatus === 'VERIFIED_GENUINE';
              const isFlagged = c.doctorVerification?.dataIntegrityStatus === 'FLAGGED_FAKE';

              return (
                <div
                  key={c.id}
                  style={{
                    background: '#0d1527',
                    border: `1.5px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : isFlagged ? 'rgba(239, 68, 68, 0.6)' : audit.badgeColor}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{c.patientName}</strong>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>({c.patientAge}y / {c.patientGender})</span>
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                        {c.tokenNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isVerified ? 'rgba(16, 185, 129, 0.2)' : `${audit.badgeColor}22`,
                          color: isVerified ? '#6ee7b7' : audit.badgeColor,
                          border: `1px solid ${isVerified ? '#10b981' : audit.badgeColor}`
                        }}
                      >
                        {isVerified ? '✓ Verified Genuine Identity' : isFlagged ? '❌ Flagged Fake / Synthetic' : `${audit.integrityScore}% ${audit.badgeText}`}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Phone: <strong style={{ color: '#ffffff' }}>{c.phone || c.patient?.phone || 'Not recorded'}</strong> • ABHA: <strong style={{ color: '#ffffff' }}>{c.abhaId || 'None'}</strong>
                    </div>

                    {audit.anomalies.length > 0 ? (
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {audit.anomalies.map((anom, aIdx) => (
                          <div key={aIdx} style={{ fontSize: '12px', color: anom.severity === 'CRITICAL' ? '#fca5a5' : '#fcd34d' }}>
                            • <strong>{anom.field}:</strong> {anom.issue} ({anom.suggestion})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '4px' }}>
                        ✓ All demographic and vital parameters conform to standard clinical bounds.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openCaseSheet(c)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      <FileText size={14} />
                      <span>Inspect Sheet</span>
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedCase(c);
                        await handleMarkIntegrity('VERIFIED_GENUINE');
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Confirm Genuine</span>
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedCase(c);
                        await handleMarkIntegrity('FLAGGED_FAKE');
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                    >
                      <AlertTriangle size={14} />
                      <span>Flag as Fake</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

            {/* Fake Details & Synthetic Identity Verification Banner */}
            {(() => {
              const audit = auditConsultationIntegrity(selectedCase);
              const isFlagged = selectedCase.doctorVerification?.dataIntegrityStatus === 'FLAGGED_FAKE' || audit.status === 'HIGH_RISK_FAKE';
              const isVerified = selectedCase.doctorVerification?.dataIntegrityStatus === 'VERIFIED_GENUINE';

              return (
                <div style={{
                  background: isFlagged ? 'rgba(239, 68, 68, 0.08)' : isVerified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.6)',
                  border: `1px solid ${isFlagged ? '#ef4444' : isVerified ? '#10b981' : '#334155'}`,
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {audit.status === 'HIGH_RISK_FAKE' ? (
                        <ShieldAlert size={22} color="#ef4444" />
                      ) : audit.status === 'SUSPICIOUS' ? (
                        <AlertTriangle size={22} color="#f59e0b" />
                      ) : (
                        <ShieldCheck size={22} color="#10b981" />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isFlagged ? '#fca5a5' : isVerified ? '#6ee7b7' : '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Demographic &amp; Physiological Authenticity Audit
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.6rem',
                            borderRadius: '999px',
                            fontWeight: 800,
                            background: audit.status === 'AUTHENTIC' ? 'rgba(16, 185, 129, 0.2)' : audit.status === 'SUSPICIOUS' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: audit.status === 'AUTHENTIC' ? '#34d399' : audit.status === 'SUSPICIOUS' ? '#fbbf24' : '#f87171',
                            border: `1px solid ${audit.status === 'AUTHENTIC' ? 'rgba(16, 185, 129, 0.4)' : audit.status === 'SUSPICIOUS' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                          }}>
                            {audit.integrityScore}% Match ({audit.status.replace(/_/g, ' ')})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                          Automated cross-check of patient identity strings, cellular prefix validity, and physiological vitals bounds.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkIntegrity('VERIFIED_GENUINE')}
                        style={{
                          background: isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <ShieldCheck size={14} /> Confirm Genuine
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkIntegrity('FLAGGED_FAKE')}
                        style={{
                          background: isFlagged ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #ef4444',
                          color: '#f87171',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <ShieldAlert size={14} /> Flag as Fake / Synthetic
                      </button>
                    </div>
                  </div>

                  {audit.issues.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px'
                    }}>
                      {audit.issues.map((iss, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={12} color="#ef4444" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

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

                {/* Relevant Ayurveda Lifestyle Information (Diet, Sleep, Routine, Prior Care) */}
                {(selectedCase.ayurvedaSpecificInfo || selectedCase.carePathway === 'ayurveda' || doctorRole === 'ayurveda') && (
                  <div style={{
                    background: 'rgba(13, 148, 136, 0.12)',
                    border: '1.5px solid #0d9488',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Leaf size={18} color="#2dd4bf" />
                        <strong style={{ fontSize: '0.95rem', color: '#2dd4bf' }}>
                          Relevant Lifestyle Information (Ayurveda Intake)
                        </strong>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '11px', background: '#0f766e' }}>
                        PATIENT REPORTED
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.84rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Activity / Lifestyle:</span>
                        <strong style={{ color: '#ffffff' }}>{selectedCase.ayurvedaSpecificInfo?.lifestyle || 'Moderate daily physical activity'}</strong>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Diet Habits (Ahara):</span>
                        <strong style={{ color: '#ffffff' }}>{selectedCase.ayurvedaSpecificInfo?.diet || 'Vegetarian, standard meal timings'}</strong>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Sleep Quality (Nidra):</span>
                        <strong style={{ color: '#ffffff' }}>{selectedCase.ayurvedaSpecificInfo?.sleep || 'Normal (6-8 hours)'}</strong>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Routine (Dinacharya):</span>
                        <strong style={{ color: '#ffffff' }}>{selectedCase.ayurvedaSpecificInfo?.dailyRoutine || 'Regular work & waking routine'}</strong>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', gridColumn: 'span 2' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>General Symptoms & Digestion:</span>
                        <span style={{ color: '#f1f5f9' }}>{selectedCase.ayurvedaSpecificInfo?.generalSymptoms || selectedCase.chiefComplaint}</span>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', gridColumn: 'span 2' }}>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Previous Treatments:</span>
                        <span style={{ color: '#f1f5f9' }}>{selectedCase.ayurvedaSpecificInfo?.previousTreatments || 'No prior classical therapies recorded'}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#99f6e4', fontStyle: 'italic' }}>
                      * Regulatory Note: Prakriti, Vikriti, and Doshas must be evaluated and confirmed by the attending qualified practitioner.
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

            {/* EXISTING REFERRAL NOTICE IF PRESENT */}
            {selectedCase.interdisciplinaryReferral && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1.5px solid #3b82f6',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 800, fontSize: '0.85rem' }}>
                    <ArrowLeftRight size={16} />
                    <span>INTERDISCIPLINARY REFERRAL ON FILE</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '2px' }}>
                    From: <strong>{selectedCase.interdisciplinaryReferral.fromDoctor}</strong> ({selectedCase.interdisciplinaryReferral.fromSpecialty}) ➔ To: <strong>{selectedCase.interdisciplinaryReferral.toSpecialty}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Reason: {selectedCase.interdisciplinaryReferral.reason} • Patient Consent Confirmed
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>REFERRAL ACTIVE</span>
              </div>
            )}

            {/* ATTENDING PHYSICIAN NOTES & VERIFICATION SECTION */}
            <div style={{
              background: 'rgba(15, 25, 51, 0.9)',
              border: doctorRole === 'ayurveda' ? '2px solid #0d9488' : '2px solid rgba(0, 229, 163, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {doctorRole === 'ayurveda' ? <Leaf size={20} color="#2dd4bf" /> : <Edit3 size={20} color="#00e5a3" />}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {doctorRole === 'ayurveda' ? 'Ayurveda Physician Notes & Verified Clinical Protocol' : t('doctorNotesHeading')}
                  </h3>
                </div>

                {/* Interdisciplinary Referral Launch Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (doctorRole === 'ayurveda') {
                      setReferralTarget('Allopathic Emergency / Cardiology');
                    } else {
                      setReferralTarget('Ayurveda Care (Kayachikitsa)');
                    }
                    setReferralReason('');
                    setReferralConsentConfirmed(true);
                    setReferralModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#93c5fd',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeftRight size={14} />
                  <span>
                    {doctorRole === 'ayurveda' ? 'Refer to Allopathic Specialty' : 'Refer to Ayurveda Care'}
                  </span>
                </button>
              </div>

              {/* Diagnosis and Medicines inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    {doctorRole === 'ayurveda' ? 'Classical Assessment / Verified Diagnosis:' : `${t('provisionalDiagnosisLabel')}:`}
                  </label>
                  <input
                    type="text"
                    value={provisionalDiagnosis}
                    onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                    placeholder={doctorRole === 'ayurveda' ? 'e.g. Amlapitta (Pitta-Vata imbalance) / Sandhigata Vata / Deepana-Pachana' : 'e.g. Acute Coronary Syndrome (NSTEMI) / Acute Appendicitis / Acute Viral Bronchitis'}
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
                    {doctorRole === 'ayurveda' ? 'Prescribe Classical Formulation / Medicine:' : 'Prescribe Medication:'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newRxDrug}
                      onChange={(e) => setNewRxDrug(e.target.value)}
                      placeholder={doctorRole === 'ayurveda' ? 'e.g. Avipattikar Churna 3g BD' : 'e.g. Tab. Paracetamol 650mg'}
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
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: doctorRole === 'ayurveda' ? '#2dd4bf' : '#00e5a3', marginBottom: '0.35rem' }}>
                    {doctorRole === 'ayurveda' ? 'Prescribed Formulations (Confirmed by Vaidya):' : 'Prescribed Medicines:'}
                  </div>
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                      <span>{doctorRole === 'ayurveda' ? '🌿' : '💊'} {rx.drug} — {rx.dose}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rx.timing || rx.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Ayurveda Specific Lifestyle Guidance Inputs */}
              {doctorRole === 'ayurveda' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      🥗 Dietary Guidance (Pathya & Apathya):
                    </label>
                    <input
                      type="text"
                      value={ayurvedaDietAdvice}
                      onChange={(e) => setAyurvedaDietAdvice(e.target.value)}
                      placeholder="e.g. Pathya: warm mung soup, buttermilk; Apathya: avoid deep-fried, curd at night"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      🧘 Daily Routine Guidance (Dinacharya & Vihara):
                    </label>
                    <input
                      type="text"
                      value={ayurvedaRoutineAdvice}
                      onChange={(e) => setAyurvedaRoutineAdvice(e.target.value)}
                      placeholder="e.g. Gentle pranayama, early light dinner by 7:30 PM, warm water sips"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Clinical Notes Textarea */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  {doctorRole === 'ayurveda' ? 'Ayurveda Doctor Clinical Notes & Follow-Up Plan:' : "Doctor's Clinical Notes & Treatment Plan:"}
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder={doctorRole === 'ayurveda' ? 'Record Ayurvedic clinical observations, doshic assessment, treatment response, and lifestyle directions...' : t('doctorNotesPlaceholder')}
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

              {/* Follow-Up Schedule Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                  🗓️ Scheduled Follow-Up:
                </span>
                {['1 Week', '2 Weeks', '1 Month', '3 Months', 'SOS / As Needed'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setAyurvedaFollowUp(dur)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: ayurvedaFollowUp === dur ? '1.5px solid #00e5a3' : '1px solid rgba(255,255,255,0.2)',
                      background: ayurvedaFollowUp === dur ? 'rgba(0, 229, 163, 0.2)' : 'transparent',
                      color: ayurvedaFollowUp === dur ? '#00e5a3' : '#cbd5e1'
                    }}
                  >
                    {dur}
                  </button>
                ))}
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

      {/* INTERDISCIPLINARY REFERRAL MODAL */}
      {referralModalOpen && selectedCase && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(4, 9, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-success">INTERDISCIPLINARY REFERRAL</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {doctorRole === 'ayurveda' ? 'Refer to Allopathic Specialty' : 'Refer to Ayurveda Care'}
                </h3>
              </div>
              <button
                onClick={() => setReferralModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Facilitate collaborative patient care between modern medicine and classical Ayurveda. The referral and clinical summary are shared subject to patient consent.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Referred To Department / Specialty:
              </label>
              <select
                value={referralTarget}
                onChange={(e) => setReferralTarget(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }}
              >
                {doctorRole === 'ayurveda' ? (
                  <>
                    <option value="Allopathic Emergency / Resuscitation">Allopathic Emergency / Resuscitation</option>
                    <option value="General Surgery (Acute Abdomen Evaluation)">General Surgery (Acute Abdomen Evaluation)</option>
                    <option value="Cardiology & Resuscitation (Chest Pain Triage)">Cardiology & Resuscitation (Chest Pain Triage)</option>
                    <option value="Internal Medicine & Diabetology">Internal Medicine & Diabetology</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                  </>
                ) : (
                  <>
                    <option value="Ayurveda Care (Kayachikitsa - Internal Medicine)">Ayurveda Care (Kayachikitsa - Internal Medicine)</option>
                    <option value="Ayurveda Care (Panchakarma & Pain Rehabilitation)">Ayurveda Care (Panchakarma & Pain Rehabilitation)</option>
                    <option value="Ayurveda Care (Swasthavritta - Lifestyle & Dietetics)">Ayurveda Care (Swasthavritta - Lifestyle & Dietetics)</option>
                    <option value="Ayurveda Care (Shalya Tantra - Integrative Wound Care)">Ayurveda Care (Shalya Tantra - Integrative Wound Care)</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Clinical Reason & Notes for Referral:
              </label>
              <textarea
                rows={3}
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                placeholder={doctorRole === 'ayurveda' ? 'e.g. Acute abdominal guarding, surgical ultrasound evaluation advised' : 'e.g. Refractory hyperacidity and chronic lifestyle stress, dietary and lifestyle rehabilitation requested'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            {/* Consent confirmation */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="referralConsent"
                checked={referralConsentConfirmed}
                onChange={(e) => setReferralConsentConfirmed(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <label htmlFor="referralConsent" style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                Patient Consent Verified: The patient has granted consent for interdisciplinary referral and medical summary sharing.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReferral || !referralConsentConfirmed}
                onClick={handleSendReferral}
                className="btn btn-primary"
              >
                <Share2 size={16} />
                <span>{isSubmittingReferral ? 'Recording Referral...' : 'Confirm Interdisciplinary Referral'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
