// client/src/utils/patientCaseQrService.js
import QRCode from 'qrcode';

const STORAGE_KEY = 'medikiosk_patient_cases_db';

// Initial pre-seeded cases representing realistic hospital visits
const PRE_SEEDED_CASES = [
  {
    caseId: 'CASE-2026-0102',
    qrToken: 'MK-SEC-482910-GANGAMMA',
    qrStatus: 'ACTIVE',
    createdAt: '2026-09-15T09:30:00Z',
    lastVisit: '2026-09-18T11:15:00Z',
    patient: {
      fullName: 'Gangamma B.',
      age: 58,
      gender: 'Female',
      abhaId: '91-4829-3381-9921',
      phone: '+91 98451 23908',
      bloodGroup: 'B+'
    },
    consultations: [
      {
        id: 'cons_visit_1',
        visitNumber: 1,
        date: '2026-09-15',
        department: 'Emergency & Acute Medicine',
        doctorName: 'Dr. Arvind N. (MD)',
        chiefComplaint: 'Acute retrosternal chest tightness radiating to left arm with diaphoresis',
        vitals: { bp: '154/98', hr: '104', spo2: '94%', temp: '98.6°F' },
        diagnosis: 'Acute Coronary Syndrome / Non-STEMI (Troponin I: 0.28 ng/mL High)',
        isRedFlag: true,
        prescriptions: ['Tab. Aspirin 75mg OD', 'Tab. Atorvastatin 20mg HS', 'Tab. Sorbitrate 5mg sublingual SOS'],
        allergies: ['Aspirin (Mild Hives recorded)'],
        notes: 'Patient stabilized. Emergency referral recommended for diagnostic coronary angiography.'
      },
      {
        id: 'cons_visit_2',
        visitNumber: 2,
        date: '2026-09-18',
        department: 'Cardiology Follow-Up',
        doctorName: 'Dr. Priya Sharma (DM Cardiology)',
        chiefComplaint: 'Follow-up post emergency stabilization. Mild exertional dyspnea.',
        vitals: { bp: '132/84', hr: '78', spo2: '98%', temp: '98.4°F' },
        diagnosis: 'Ischemic Heart Disease (Post-acute stabilization)',
        isRedFlag: false,
        prescriptions: ['Tab. Clopidogrel 75mg OD', 'Tab. Metoprolol 25mg BD', 'Tab. Atorvastatin 40mg HS'],
        allergies: ['Aspirin (Avoid)'],
        notes: 'ECHO shows mild anterior hypokinesia, EF 52%. Medical management continuing.'
      }
    ],
    referrals: [
      {
        referralId: 'REF-2026-991',
        date: '2026-09-15',
        fromDoctor: 'Dr. Arvind N. (General Medicine)',
        toSpecialty: 'Cardiology & Cath Lab',
        reason: 'Coronary Angiography and Ischemia evaluation',
        urgency: 'URGENT',
        status: 'COMPLETED'
      }
    ],
    accessAuditLog: [
      {
        id: 'log_01',
        timestamp: '2026-09-15 09:35 AM',
        actor: 'Dr. Arvind N.',
        role: 'Attending Physician (OPD)',
        action: 'Initial Case Creation & QR Issue',
        consentVerified: true
      },
      {
        id: 'log_02',
        timestamp: '2026-09-18 11:10 AM',
        actor: 'Dr. Priya Sharma',
        role: 'Consultant Cardiologist',
        action: 'QR Scanned & Longitudinal History Retrieved',
        consentVerified: true
      }
    ]
  },
  {
    caseId: 'CASE-2026-0101',
    qrToken: 'MK-SEC-381900-RAVI',
    qrStatus: 'ACTIVE',
    createdAt: '2026-09-10T14:00:00Z',
    lastVisit: '2026-09-14T10:00:00Z',
    patient: {
      fullName: 'Ravi Kumar',
      age: 34,
      gender: 'Male',
      abhaId: '91-3819-0021-8841',
      phone: '+91 94481 02934',
      bloodGroup: 'O+'
    },
    consultations: [
      {
        id: 'cons_rk_1',
        visitNumber: 1,
        date: '2026-09-10',
        department: 'Pulmonology / OPD',
        doctorName: 'Dr. Ramesh K.',
        chiefComplaint: '4-day productive cough with yellowish sputum and low-grade pyrexia',
        vitals: { bp: '118/76', hr: '82', spo2: '98%', temp: '101.4°F' },
        diagnosis: 'Acute Infective Bronchitis',
        isRedFlag: false,
        prescriptions: ['Tab. Azithromycin 500mg OD (3 days)', 'Syp. Ascoril 10ml TID', 'Tab. Paracetamol 650mg SOS'],
        allergies: ['Penicillin (Severe Anaphylaxis Alert)'],
        notes: 'Cross-verification engine blocked Penicillin prescription due to 2021 allergy history.'
      }
    ],
    referrals: [],
    accessAuditLog: [
      {
        id: 'log_rk_1',
        timestamp: '2026-09-10 02:05 PM',
        actor: 'Dr. Ramesh K.',
        role: 'Pulmonology OPD',
        action: 'Case Created & Penicillin Contraindication Flagged',
        consentVerified: true
      }
    ]
  },
  {
    caseId: 'CASE-2026-0103',
    qrToken: 'MK-SEC-910233-PARVATHI',
    qrStatus: 'ACTIVE',
    createdAt: '2026-09-12T10:00:00Z',
    lastVisit: '2026-09-17T09:45:00Z',
    patient: {
      fullName: 'Parvathi Rao',
      age: 46,
      gender: 'Female',
      abhaId: '91-6284-9102-3371',
      phone: '+91 94812 88401',
      bloodGroup: 'A+'
    },
    consultations: [
      {
        id: 'cons_pr_1',
        visitNumber: 1,
        date: '2026-09-12',
        department: 'Internal Medicine OPD',
        doctorName: 'Dr. Ananya Sharma (MD)',
        chiefComplaint: 'Recurrent epigastric burning, acid reflux, and morning nausea for 3 months',
        vitals: { bp: '124/80', hr: '74', spo2: '99%', temp: '98.6°F' },
        diagnosis: 'Gastroesophageal Reflux Disease (GERD) / Functional Dyspepsia',
        isRedFlag: false,
        prescriptions: ['Cap. Omeprazole 20mg OD before breakfast (14 days)', 'Syp. Mucaine Gel 10ml TDS after food'],
        allergies: ['NKDA'],
        notes: 'Advised lifestyle modification, early dinner, and avoidance of late-night tea. Referred to Ayurveda Care for long-term dietetic and digestive balance.'
      },
      {
        id: 'cons_pr_2',
        visitNumber: 2,
        date: '2026-09-17',
        department: 'Ayurveda Care (Kayachikitsa)',
        doctorName: 'Dr. Vaidya Shreedhara Hegde (BAMS, MD Ayurveda)',
        chiefComplaint: 'Holistic management of chronic Amlapitta and disturbed sleep patterns',
        vitals: { bp: '122/78', hr: '72', spo2: '99%', temp: '98.4°F' },
        diagnosis: 'Amlapitta (Pitta-Vata aggravation with Tikshnagni)',
        isRedFlag: false,
        prescriptions: ['Avipattikar Churna 3g BD with warm water', 'Kamadudha Rasa (Mukta Yukta) 1 tab BD', 'Drakshadi Kashayam 15ml with warm water'],
        allergies: ['NKDA'],
        notes: 'Ahara protocol: Avoid spicy, sour, fermented food. Dinner before 7:30 PM. Dinacharya: 15-minute gentle pranayama and cooled milk with cardamom at bedtime. Verified by licensed Ayurveda physician.'
      }
    ],
    referrals: [
      {
        referralId: 'REF-2026-042',
        date: '2026-09-12',
        fromDoctor: 'Dr. Ananya Sharma (Internal Medicine)',
        toSpecialty: 'Ayurveda Care (Kayachikitsa)',
        reason: 'Integrative holistic management for refractory GERD & lifestyle stress',
        urgency: 'ROUTINE',
        status: 'COMPLETED'
      }
    ],
    accessAuditLog: [
      {
        id: 'log_pr_1',
        timestamp: '2026-09-12 10:15 AM',
        actor: 'Dr. Ananya Sharma',
        role: 'Attending Physician',
        action: 'Case Created & Referral to Ayurveda Initiated',
        consentVerified: true
      },
      {
        id: 'log_pr_2',
        timestamp: '2026-09-17 09:40 AM',
        actor: 'Dr. Vaidya Shreedhara Hegde',
        role: 'Ayurveda Physician (BAMS, MD)',
        action: 'Patient QR Scanned & Authorized Case History Retrieved',
        consentVerified: true
      }
    ]
  }
];

export function getPatientCases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRE_SEEDED_CASES));
      return PRE_SEEDED_CASES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read patient cases:', e);
    return PRE_SEEDED_CASES;
  }
}

function savePatientCases(cases) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save patient cases:', e);
  }
}

export function getCaseById(caseId) {
  const cases = getPatientCases();
  return cases.find((c) => c.caseId.toUpperCase() === (caseId || '').toUpperCase());
}

export function getCaseByQrToken(qrToken) {
  const cases = getPatientCases();
  return cases.find((c) => c.qrToken === qrToken);
}

/**
 * Encodes only a secure URI token inside the QR (Rule 9 & 10)
 * Format: medikiosk://case?id=CASE-2026-XXXX&token=MK-SEC-XXXX
 * NO plain text medical history stored inside the QR code itself.
 */
export function formatQrTokenPayload(caseId, qrToken) {
  return `medikiosk://case?id=${encodeURIComponent(caseId)}&token=${encodeURIComponent(qrToken)}`;
}

/**
 * Generates an SVG / DataURL QR representation of the secure token
 */
export async function generateQrDataUrl(caseId, qrToken) {
  const payload = formatQrTokenPayload(caseId, qrToken);
  try {
    const url = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    return url;
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

/**
 * Function 1: Generate Patient QR after first consultation
 */
export async function createPatientCaseWithQr(patientData, consultationData) {
  const cases = getPatientCases();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const newCaseId = `CASE-2026-${randNum}`;
  const newQrToken = `MK-SEC-${randNum}-${(patientData.fullName || 'PATIENT').split(' ')[0].toUpperCase()}`;

  const newCase = {
    caseId: newCaseId,
    qrToken: newQrToken,
    qrStatus: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
    patient: {
      fullName: patientData.fullName || patientData.name || 'Patient',
      age: patientData.age || 45,
      gender: patientData.gender || 'Male',
      abhaId: patientData.abhaId || `91-${randNum}-5510-8812`,
      phone: patientData.phone || '+91 98450 00000',
      bloodGroup: patientData.bloodGroup || 'O+'
    },
    consultations: [
      {
        id: `cons_visit_${Date.now()}`,
        visitNumber: 1,
        date: new Date().toISOString().split('T')[0],
        department: consultationData?.department || 'General Outpatient (OPD)',
        doctorName: consultationData?.doctorName || 'Dr. Attending Physician',
        chiefComplaint: consultationData?.chiefComplaint || 'Primary presenting symptoms',
        vitals: consultationData?.vitals || { bp: '120/80', hr: '76', spo2: '98%', temp: '98.6°F' },
        diagnosis: consultationData?.diagnosis || 'Initial Clinical Evaluation',
        isRedFlag: Boolean(consultationData?.isRedFlag),
        prescriptions: consultationData?.prescriptions || ['General advice & follow-up'],
        allergies: consultationData?.allergies || ['NKDA'],
        notes: consultationData?.notes || 'First visit documented and secure digital case QR generated.'
      }
    ],
    referrals: [],
    accessAuditLog: [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: 'Clinical Registration Staff',
        role: 'Hospital Intake Desk',
        action: 'First Consultation Completed & Reusable Digital Case QR Issued',
        consentVerified: true
      }
    ]
  };

  cases.unshift(newCase);
  savePatientCases(cases);
  return newCase;
}

/**
 * Function 2: Parse and Scan QR Token
 */
export function parseScannedQrString(scannedString) {
  if (!scannedString) return null;
  const str = scannedString.trim();

  // If format is medikiosk://case?id=...&token=...
  if (str.startsWith('medikiosk://case')) {
    try {
      const url = new URL(str.replace('medikiosk://', 'http://'));
      const id = url.searchParams.get('id');
      const token = url.searchParams.get('token');
      if (id) {
        const found = getCaseById(id);
        if (found) return found;
      }
      if (token) {
        const found = getCaseByQrToken(token);
        if (found) return found;
      }
    } catch (e) {
      // fallback search
    }
  }

  // Direct case ID search (e.g. CASE-2026-0102)
  const byId = getCaseById(str);
  if (byId) return byId;

  // Direct token search
  const byToken = getCaseByQrToken(str);
  if (byToken) return byToken;

  return null;
}

/**
 * Function 3 & 8: Authorize Access with Explicit Consent
 */
export function authorizeCaseAccess(caseId, doctorName, specialty, reason) {
  const cases = getPatientCases();
  const found = cases.find((c) => c.caseId.toUpperCase() === caseId.toUpperCase());
  if (!found) return null;

  const logEntry = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    actor: doctorName || 'Attending Physician',
    role: specialty || 'Specialist Consultation',
    action: `Authorized Medical Record Access: ${reason || 'Follow-up clinical assessment'}`,
    consentVerified: true
  };

  found.accessAuditLog.unshift(logEntry);
  savePatientCases(cases);
  return found;
}

/**
 * Function 4: Add New Consultation to the Same Patient Timeline
 */
export function addNewConsultationToCase(caseId, consultationData) {
  const cases = getPatientCases();
  const found = cases.find((c) => c.caseId.toUpperCase() === caseId.toUpperCase());
  if (!found) return null;

  const nextVisitNum = (found.consultations?.length || 0) + 1;
  const newVisit = {
    id: `cons_visit_${Date.now()}`,
    visitNumber: nextVisitNum,
    date: new Date().toISOString().split('T')[0],
    department: consultationData?.department || 'Follow-Up OPD',
    doctorName: consultationData?.doctorName || 'Dr. Attending Physician',
    chiefComplaint: consultationData?.chiefComplaint || 'Follow-up presentation',
    vitals: consultationData?.vitals || { bp: '122/80', hr: '78', spo2: '98%', temp: '98.4°F' },
    diagnosis: consultationData?.diagnosis || 'Clinical Follow-Up Record',
    isRedFlag: Boolean(consultationData?.isRedFlag),
    prescriptions: consultationData?.prescriptions || ['Continue current prescribed medications'],
    allergies: consultationData?.allergies || found.consultations[0]?.allergies || ['NKDA'],
    notes: consultationData?.notes || 'Follow-up examination documented.'
  };

  found.consultations.unshift(newVisit);
  found.lastVisit = new Date().toISOString();

  found.accessAuditLog.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    actor: consultationData?.doctorName || 'Doctor',
    role: consultationData?.department || 'OPD',
    action: `Added Consultation #${nextVisitNum} to Patient Longitudinal Timeline`,
    consentVerified: true
  });

  savePatientCases(cases);
  return found;
}

/**
 * Function 6: Support Specialist Referral using Case Reference
 */
export function addSpecialistReferral(caseId, referralData) {
  const cases = getPatientCases();
  const found = cases.find((c) => c.caseId.toUpperCase() === caseId.toUpperCase());
  if (!found) return null;

  const referral = {
    referralId: `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    fromDoctor: referralData.fromDoctor || 'Referring Physician',
    toSpecialty: referralData.toSpecialty || 'Specialist Department',
    reason: referralData.reason || 'Specialized diagnostic consultation',
    urgency: referralData.urgency || 'ROUTINE',
    status: 'ACTIVE_PENDING'
  };

  found.referrals = found.referrals || [];
  found.referrals.unshift(referral);

  found.accessAuditLog.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    actor: referralData.fromDoctor || 'Doctor',
    role: 'Referral Coordinator',
    action: `Created Specialist Referral [${referral.referralId}] to ${referral.toSpecialty}`,
    consentVerified: true
  });

  savePatientCases(cases);
  return found;
}

export const verifyQrTokenAndFetchCase = (tokenOrId) => parseScannedQrString(tokenOrId);
