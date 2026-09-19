// client/src/components/SecurePatientQrManager.jsx
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Scan,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  ArrowRight,
  Share2,
  AlertCircle,
  Hospital,
  Stethoscope,
  Download,
  Lock,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  Activity
} from 'lucide-react';
import {
  getPatientCases,
  generateQrDataUrl,
  createPatientCaseWithQr,
  parseScannedQrString,
  authorizeCaseAccess,
  addNewConsultationToCase,
  addSpecialistReferral
} from '../utils/patientCaseQrService';

export default function SecurePatientQrManager({ initialCaseId, onLaunchConsultation, onClose }) {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState('qr-pass'); // 'qr-pass', 'scan', 'history', 'add-consultation', 'referral', 'audit'

  // Scanner state
  const [scanInput, setScanInput] = useState('');
  const [scannedCase, setScannedCase] = useState(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [scanError, setScanError] = useState('');

  // Add consultation form state
  const [newDepartment, setNewDepartment] = useState('Internal Medicine OPD');
  const [newDoctor, setNewDoctor] = useState('Dr. Arvind N.');
  const [newComplaint, setNewComplaint] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newMeds, setNewMeds] = useState('');
  const [newBp, setNewBp] = useState('120/80');
  const [newHr, setNewHr] = useState('76');

  // Referral form state
  const [refSpecialty, setRefSpecialty] = useState('Cardiology');
  const [refReason, setRefReason] = useState('Secondary evaluation of exertional symptoms');
  const [refUrgency, setRefUrgency] = useState('PRIORITY');

  // Load cases on mount
  useEffect(() => {
    refreshCases();
  }, [initialCaseId]);

  const refreshCases = async () => {
    const list = getPatientCases();
    setCases(list);
    let target = list[0];
    if (initialCaseId) {
      const match = list.find((c) => c.caseId === initialCaseId);
      if (match) target = match;
    }
    if (target) {
      setSelectedCase(target);
      const url = await generateQrDataUrl(target.caseId, target.qrToken);
      setQrDataUrl(url);
    }
  };

  const handleSelectCase = async (c) => {
    setSelectedCase(c);
    const url = await generateQrDataUrl(c.caseId, c.qrToken);
    setQrDataUrl(url);
  };

  // Generate new case with QR
  const handleGenerateNewQr = async () => {
    const dummyPatient = {
      fullName: 'Vijay M. Hegde',
      age: 46,
      gender: 'Male',
      phone: '+91 97412 88401',
      abhaId: `91-2291-${Math.floor(1000 + Math.random() * 9000)}-4412`,
      bloodGroup: 'A+'
    };
    const dummyConsultation = {
      department: 'General OPD',
      doctorName: 'Dr. Arvind N.',
      chiefComplaint: 'Mild headache and periodic fatigue',
      vitals: { bp: '130/84', hr: '74', spo2: '99%', temp: '98.4°F' },
      diagnosis: 'Tension Headache / Work-Related Stress',
      prescriptions: ['Tab. Paracetamol 650mg SOS', 'Stress management & lifestyle counseling']
    };

    const created = await createPatientCaseWithQr(dummyPatient, dummyConsultation);
    refreshCases();
    handleSelectCase(created);
    setActiveTab('qr-pass');
  };

  // Scan handler
  const handleScanSubmit = (e) => {
    e.preventDefault();
    setScanError('');
    const result = parseScannedQrString(scanInput);
    if (result) {
      setScannedCase(result);
      setConsentGranted(false); // require consent step
    } else {
      setScanError('Invalid or unrecognized Patient QR Token. Please verify code.');
    }
  };

  const handleGrantConsent = () => {
    if (scannedCase) {
      const authorized = authorizeCaseAccess(
        scannedCase.caseId,
        'Dr. Priya Sharma',
        'Cardiology & OPD',
        'Follow-up visit examination'
      );
      setScannedCase(authorized);
      setSelectedCase(authorized);
      setConsentGranted(true);
    }
  };

  // Add new consultation to the same timeline
  const handleAddConsultation = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    const consultData = {
      department: newDepartment,
      doctorName: newDoctor,
      chiefComplaint: newComplaint || 'Routine medical follow-up visit',
      vitals: { bp: newBp, hr: newHr, spo2: '98%', temp: '98.6°F' },
      diagnosis: newDiagnosis || 'Clinical Assessment Documented',
      prescriptions: newMeds ? newMeds.split(',').map((s) => s.trim()) : ['Continue current prescribed medications']
    };

    const updated = addNewConsultationToCase(selectedCase.caseId, consultData);
    if (updated) {
      setSelectedCase(updated);
      refreshCases();
      setActiveTab('history');
      setNewComplaint('');
      setNewDiagnosis('');
      setNewMeds('');
    }
  };

  // Create specialist referral
  const handleCreateReferral = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    const refData = {
      fromDoctor: 'Dr. Arvind N. (General Medicine)',
      toSpecialty: refSpecialty,
      reason: refReason,
      urgency: refUrgency
    };

    const updated = addSpecialistReferral(selectedCase.caseId, refData);
    if (updated) {
      setSelectedCase(updated);
      refreshCases();
      setActiveTab('referral');
      alert(`Specialist Referral generated with Patient Case Reference: ${selectedCase.caseId}`);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
      
      {/* Key Concept Banner (Hospital Theme) */}
      <div style={{
        background: 'linear-gradient(90deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1.5px solid #a7f3d0',
        borderRadius: '16px',
        padding: '16px 22px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
          }}>
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Secure Digital Patient Case Identifier (Reusable QR)
            </div>
            <div style={{ fontSize: '13px', color: '#047857', fontWeight: 600 }}>
              “One secure QR → Portable digital patient case → Reusable across future authorized consultations.”
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('scan')}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <Scan size={15} color="#2563eb" />
            <span>Scan QR for Visit</span>
          </button>
          <button
            onClick={handleGenerateNewQr}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <PlusCircle size={15} />
            <span>Generate Patient QR</span>
          </button>
        </div>
      </div>

      {/* Case Selector Quick Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Registered Patient Cases:
          </span>
          {cases.map((c) => {
            const isSelected = selectedCase?.caseId === c.caseId;
            return (
              <button
                key={c.caseId}
                onClick={() => handleSelectCase(c)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: isSelected ? '#ecfdf5' : '#ffffff',
                  color: isSelected ? '#059669' : '#334155'
                }}
              >
                {c.patient.fullName} ({c.caseId})
              </button>
            );
          })}
        </div>

        {selectedCase && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
            <span style={{ color: '#64748b' }}>QR Status:</span>
            <span className="badge badge-success">
              {selectedCase.qrStatus} · ABDM SECURE
            </span>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'qr-pass', label: 'Patient QR Pass', icon: QrCode },
          { id: 'scan', label: 'Scan QR at Check-In', icon: Scan },
          { id: 'history', label: `Previous History (${selectedCase?.consultations?.length || 0})`, icon: Clock },
          { id: 'add-consultation', label: 'Add New Consultation', icon: PlusCircle },
          { id: 'referral', label: `Specialist Referral (${selectedCase?.referrals?.length || 0})`, icon: Share2 },
          { id: 'audit', label: 'Access Audit History', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #059669' : '1px solid #e2e8f0',
                background: isActive ? '#ecfdf5' : '#ffffff',
                color: isActive ? '#059669' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Patient QR Pass Card (Reusable Digital Identifier) */}
      {activeTab === 'qr-pass' && selectedCase && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* QR Pass View */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hospital size={18} color="#059669" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  HOSPITAL DIGITAL HEALTH PASS
                </span>
              </div>
              <span className="badge badge-success">Reusable Identifier</span>
            </div>

            {/* Generated QR Image */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px',
              display: 'inline-block',
              margin: '0 auto 16px auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Patient Case QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Generating QR...
                </div>
              )}
            </div>

            {/* Case Identifiers */}
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secure Patient Case ID:
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 6px 0', letterSpacing: '0.02em' }}>
                {selectedCase.caseId}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Token: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{selectedCase.qrToken}</code>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569',
              lineHeight: '1.5'
            }}>
              <strong>Security Protocol:</strong> Contains only an authorized token reference. No raw medical notes are stored in the QR code.
            </div>
          </div>

          {/* Associated Case Summary & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
                Patient Demographic Identity
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Full Name:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCase.patient.fullName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Age / Gender:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCase.patient.age} Y / {selectedCase.patient.gender}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>ABHA ID:</span>
                  <div style={{ fontWeight: 600, color: '#059669' }}>{selectedCase.patient.abhaId}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Contact Phone:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCase.patient.phone}</div>
                </div>
              </div>
            </div>

            {/* Reusability Information Card */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <strong style={{ fontSize: '13.5px', color: '#065f46' }}>
                  Reusable Across Future Consultations
                </strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#166534', lineHeight: '1.5', margin: 0 }}>
                This patient can present this identical QR at future OPD visits, emergency admissions, or specialist referrals. Authorizing doctors will see the full accumulated medical timeline without repeating basic questioning.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={() => setActiveTab('history')}
                  className="btn btn-primary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  <Clock size={14} />
                  <span>View Timeline ({selectedCase.consultations.length} Visits)</span>
                </button>
                <button
                  onClick={() => setActiveTab('add-consultation')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  <PlusCircle size={14} />
                  <span>Add New Visit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Scan QR During Future Visits */}
      {activeTab === 'scan' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          maxWidth: '780px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto'
            }}>
              <Scan size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Scan Patient QR at Check-In Desk
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Enter scanned QR token or select a registered hospital patient to simulate optical kiosk scanning
            </p>
          </div>

          <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="e.g. medikiosk://case?id=CASE-2026-0102 or CASE-2026-0102"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
              <span>Lookup Case</span>
            </button>
          </form>

          {/* Quick preset scan chips for evaluators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Quick Scan Test:</span>
            {cases.map((c) => (
              <button
                key={c.caseId}
                type="button"
                onClick={() => {
                  setScanInput(`medikiosk://case?id=${c.caseId}&token=${c.qrToken}`);
                  const match = getPatientCases().find(x => x.caseId === c.caseId);
                  setScannedCase(match);
                  setConsentGranted(false);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: '#2563eb',
                  cursor: 'pointer'
                }}
              >
                Scan {c.patient.fullName}
              </button>
            ))}
          </div>

          {scanError && (
            <div style={{ padding: '10px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', marginBottom: '16px' }}>
              {scanError}
            </div>
          )}

          {/* Scanned Case Found - Consent Gateway (Rule 8) */}
          {scannedCase && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '14px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Identified: {scannedCase.patient.fullName} ({scannedCase.caseId})
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    ABHA: {scannedCase.patient.abhaId} · Previous Visits: {scannedCase.consultations.length}
                  </div>
                </div>
                <span className="badge badge-pending">Authorization Required</span>
              </div>

              {!consentGranted ? (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                    <Lock size={15} />
                    <span>Patient Consent & Authorization Gateway</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                    As per ABDM and DPDP Act 2023 regulations, patient authorization is required to unlock previous clinical records and medications for Dr. Priya Sharma.
                  </p>
                  <button
                    onClick={handleGrantConsent}
                    className="btn btn-primary"
                    style={{ background: '#059669', fontSize: '13px' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Grant Patient Consent & Unlock Case History</span>
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                    <ShieldCheck size={16} />
                    <span>Consent Verified · Clinical History Unlocked!</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 10px 0' }}>
                    Access logged into immutable audit trail. Attending physician can now view past visits, ECG/lab findings, and add follow-up notes.
                  </p>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="btn btn-primary"
                    style={{ fontSize: '12.5px' }}
                  >
                    <span>View Patient Case History</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Longitudinal Patient History Timeline */}
      {activeTab === 'history' && selectedCase && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Longitudinal Case Timeline: {selectedCase.patient.fullName}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Case Reference: <strong>{selectedCase.caseId}</strong> · All consultations accumulated in single record
              </div>
            </div>

            <button
              onClick={() => setActiveTab('add-consultation')}
              className="btn btn-primary"
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              <PlusCircle size={14} />
              <span>Add Consultation to Timeline</span>
            </button>
          </div>

          {/* Visits Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedCase.consultations.map((visit, index) => (
              <div
                key={visit.id || index}
                style={{
                  background: '#ffffff',
                  border: visit.isRedFlag ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: visit.isRedFlag ? '#dc2626' : '#059669',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      VISIT #{visit.visitNumber || (selectedCase.consultations.length - index)}
                    </span>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                      {visit.department}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      ({visit.date})
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Attending: <strong>{visit.doctorName}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Chief Complaint:</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{visit.chiefComplaint}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Diagnosis:</span>
                    <div style={{ fontWeight: 600, color: visit.isRedFlag ? '#dc2626' : '#059669', marginTop: '2px' }}>
                      {visit.diagnosis}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Recorded Vitals:</span>
                    <div style={{ color: '#0f172a', marginTop: '2px' }}>
                      BP: <strong>{visit.vitals?.bp}</strong> · HR: <strong>{visit.vitals?.hr} bpm</strong> · SpO2: <strong>{visit.vitals?.spo2}</strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Documented Allergies:</span>
                    <div style={{ color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                      {visit.allergies?.join(', ') || 'NKDA'}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Prescriptions & Action: </span>
                  <span style={{ color: '#475569' }}>{visit.prescriptions?.join(' • ')}</span>
                  {visit.notes && <div style={{ color: '#64748b', fontSize: '11.5px', marginTop: '3px' }}>Note: {visit.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Add New Consultation (Appends to same case timeline) */}
      {activeTab === 'add-consultation' && selectedCase && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          maxWidth: '760px',
          margin: '0 auto'
        }}>
          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>CONTINUITY OF CARE</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2px 0 4px 0', color: '#0f172a' }}>
              Add Consultation for {selectedCase.patient.fullName}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              This visit will be appended to Patient Case <strong>{selectedCase.caseId}</strong> and immediately accessible via the patient's existing QR.
            </p>
          </div>

          <form onSubmit={handleAddConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Department:</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Attending Doctor:</label>
                <input
                  type="text"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Presenting Complaints / Progress:</label>
              <textarea
                rows={3}
                placeholder="e.g. Chest pain relieved with medication, mild dyspnea on exertion remains..."
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Clinical Diagnosis:</label>
                <input
                  type="text"
                  placeholder="e.g. Stable Angina / Post-ACS"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Blood Pressure:</label>
                <input
                  type="text"
                  value={newBp}
                  onChange={(e) => setNewBp(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Heart Rate (bpm):</label>
                <input
                  type="text"
                  value={newHr}
                  onChange={(e) => setNewHr(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Prescriptions (comma separated):</label>
              <input
                type="text"
                placeholder="Tab. Metoprolol 25mg BD, Tab. Atorvastatin 40mg HS"
                value={newMeds}
                onChange={(e) => setNewMeds(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '10px' }}>
              <PlusCircle size={16} />
              <span>Save & Append to Patient Timeline</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Specialist Referral with Case Reference */}
      {activeTab === 'referral' && selectedCase && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Create Referral */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
              Create Specialist Referral
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Links referral to Case Reference <strong>{selectedCase.caseId}</strong> so receiving specialist receives immediate history access.
            </p>

            <form onSubmit={handleCreateReferral} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Target Specialty:</label>
                <select
                  value={refSpecialty}
                  onChange={(e) => setRefSpecialty(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Cardiology & Cath Lab">Cardiology & Cath Lab</option>
                  <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                  <option value="Gastroenterology / GI Surgery">Gastroenterology / GI Surgery</option>
                  <option value="AYUSH Integrative Medicine">AYUSH Integrative Medicine</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Clinical Referral Reason:</label>
                <textarea
                  rows={3}
                  value={refReason}
                  onChange={(e) => setRefReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Urgency Level:</label>
                <select
                  value={refUrgency}
                  onChange={(e) => setRefUrgency(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="ROUTINE">ROUTINE (Within 7 days)</option>
                  <option value="PRIORITY">PRIORITY (Within 48 hours)</option>
                  <option value="STAT EMERGENCY">STAT EMERGENCY (Immediate)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '9px' }}>
                <Share2 size={15} />
                <span>Issue Specialist Referral</span>
              </button>
            </form>
          </div>

          {/* Active Referrals List */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
              Active Case Referrals ({selectedCase.referrals?.length || 0})
            </h4>

            {(!selectedCase.referrals || selectedCase.referrals.length === 0) ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No active specialist referrals issued for this patient case yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedCase.referrals.map((r, i) => (
                  <div key={r.referralId || i} style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>{r.toSpecialty}</strong>
                      <span className="badge badge-pending" style={{ fontSize: '10px' }}>{r.urgency}</span>
                    </div>
                    <div style={{ color: '#475569' }}>{r.reason}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Ref ID: {r.referralId} · From: {r.fromDoctor} ({r.date})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Access & Consent Audit History */}
      {activeTab === 'audit' && selectedCase && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
              Transparent Patient Access History & Consent Logs
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              ABDM and DPDP compliance requires immutable logging of every practitioner who scans, accesses, or modifies this patient's digital case.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedCase.accessAuditLog?.map((log, i) => (
              <div key={log.id || i} style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.action}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    By: {log.actor} ({log.role}) · {log.timestamp}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '11px', fontWeight: 700 }}>
                  <ShieldCheck size={14} />
                  <span>Consent Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
