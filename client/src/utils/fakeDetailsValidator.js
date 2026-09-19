// client/src/utils/fakeDetailsValidator.js

/**
 * Intelligent Fake Details & Clinical Data Integrity Verification Engine
 * Analyzes patient registration identity and physiological vitals for synthetic,
 * fraudulent, or clinically implausible patterns.
 */

const BOGUS_NAME_PATTERNS = [
  /^(test|demo|dummy|fake|sample|temp|asdf|qwerty|xyz|abc|foo|bar|unknown|noname|na|null|none)$/i,
  /^(batman|superman|spiderman|mickey|donald|shaktiman|ironman|hulk)$/i,
  /^[a-z]$/i, // single letter
  /^[0-9\W]+$/, // purely numbers or symbols
  /(.)\1{4,}/ // 5+ repeating characters like "aaaaa" or "zzzzz"
];

const BOGUS_PHONE_SEQUENCES = [
  '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
  '1234567890', '9876543210', '0123456789', '9988776655', '1122334455'
];

/**
 * Audit patient identity and demographic data
 */
export function validatePatientIdentity(patient = {}) {
  const anomalies = [];
  let deduction = 0;

  const rawName = (patient.fullName || patient.name || '').trim();
  const rawPhone = (patient.phone || '').replace(/[\s\-\+\(\)]/g, '');
  const rawAbha = (patient.abhaId || '').replace(/[\s\-]/g, '');
  const age = Number(patient.age);

  // 1. Name Analysis
  if (!rawName) {
    anomalies.push({
      field: 'fullName',
      issue: 'Patient name is missing',
      severity: 'CRITICAL',
      suggestion: 'Collect full legal name as per government photo ID'
    });
    deduction += 35;
  } else {
    for (const pattern of BOGUS_NAME_PATTERNS) {
      if (pattern.test(rawName)) {
        anomalies.push({
          field: 'fullName',
          issue: `Suspicious or placeholder name detected: "${rawName}"`,
          severity: 'CRITICAL',
          suggestion: 'Verify real name using Aadhaar / Voter ID / Official Card'
        });
        deduction += 40;
        break;
      }
    }
  }

  // 2. Phone Number Analysis (Indian Mobile Standards)
  if (!rawPhone) {
    anomalies.push({
      field: 'phone',
      issue: 'Phone number missing',
      severity: 'WARNING',
      suggestion: 'Provide valid 10-digit mobile number for appointment SMS and digital QR'
    });
    deduction += 20;
  } else {
    // Check clean 10-digit mobile
    const cleanPhone = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;

    if (cleanPhone.length !== 10) {
      anomalies.push({
        field: 'phone',
        issue: `Invalid phone length (${cleanPhone.length} digits). Standard is 10 digits`,
        severity: 'CRITICAL',
        suggestion: 'Ensure exact 10-digit Indian mobile number'
      });
      deduction += 30;
    } else if (BOGUS_PHONE_SEQUENCES.includes(cleanPhone)) {
      anomalies.push({
        field: 'phone',
        issue: `Trivial/Fake repeating phone sequence detected: ${cleanPhone}`,
        severity: 'CRITICAL',
        suggestion: 'Enter actual personal mobile number'
      });
      deduction += 45;
    } else if (!/^[6-9]/.test(cleanPhone)) {
      anomalies.push({
        field: 'phone',
        issue: `Mobile number starts with '${cleanPhone[0]}'. Valid Indian cellular prefixes begin with 6, 7, 8, or 9`,
        severity: 'WARNING',
        suggestion: 'Recheck mobile number operator prefix'
      });
      deduction += 25;
    }
  }

  // 3. ABHA ID Analysis
  if (rawAbha) {
    if (rawAbha.length !== 14 || !/^\d{14}$/.test(rawAbha)) {
      anomalies.push({
        field: 'abhaId',
        issue: `ABHA ID does not conform to 14-digit ABDM standard`,
        severity: 'WARNING',
        suggestion: 'Verify 14-digit Ayushman Bharat Health Account number (XX-XXXX-XXXX-XXXX)'
      });
      deduction += 15;
    } else if (/^(\d)\1{13}$/.test(rawAbha) || rawAbha === '12345678901234') {
      anomalies.push({
        field: 'abhaId',
        issue: `Dummy repetitive ABHA sequence detected`,
        severity: 'CRITICAL',
        suggestion: 'Authenticate ABHA using official ABDM OTP verification'
      });
      deduction += 35;
    }
  }

  // 4. Age Plausibility
  if (isNaN(age) || age <= 0 || age > 115) {
    anomalies.push({
      field: 'age',
      issue: `Implausible age entered: ${patient.age}`,
      severity: 'WARNING',
      suggestion: 'Confirm patient date of birth / age'
    });
    deduction += 20;
  }

  return {
    anomalies,
    deduction
  };
}

/**
 * Audit clinical vitals for physiological plausibility
 */
export function validateClinicalVitals(vitals = {}) {
  const anomalies = [];
  let deduction = 0;

  const hr = Number(vitals.heartRate || vitals.pulse);
  const sys = Number(vitals.bloodPressureSystolic || (vitals.bp ? vitals.bp.split('/')[0] : null));
  const dia = Number(vitals.bloodPressureDiastolic || (vitals.bp ? vitals.bp.split('/')[1] : null));
  const spo2 = Number(vitals.spo2 || vitals.oxygenSaturation);
  const temp = Number(vitals.temperature);
  const rr = Number(vitals.respiratoryRate);

  // 1. Heart Rate
  if (hr) {
    if (hr < 30 || hr > 250) {
      anomalies.push({
        field: 'heartRate',
        issue: `Heart rate (${hr} bpm) is outside human survivable or ambulatory threshold`,
        severity: 'CRITICAL',
        suggestion: 'Re-measure pulse immediately with pulse oximeter or manual palpation'
      });
      deduction += 35;
    } else if (hr > 160 || hr < 42) {
      anomalies.push({
        field: 'heartRate',
        issue: `Extreme heart rate detected (${hr} bpm). Severe tachycardia/bradycardia`,
        severity: 'WARNING',
        suggestion: 'Verify if patient is in distress or if sensor had motion artifact'
      });
      deduction += 15;
    }
  }

  // 2. Blood Pressure
  if (sys && dia) {
    if (dia >= sys) {
      anomalies.push({
        field: 'bloodPressure',
        issue: `Diastolic BP (${dia}) cannot be equal to or greater than Systolic BP (${sys})`,
        severity: 'CRITICAL',
        suggestion: 'Recalibrate sphygmomanometer and re-take reading'
      });
      deduction += 40;
    } else if (sys > 260 || sys < 50 || dia > 160 || dia < 30) {
      anomalies.push({
        field: 'bloodPressure',
        issue: `Blood pressure reading (${sys}/${dia} mmHg) is physiologically extreme or implausible`,
        severity: 'CRITICAL',
        suggestion: 'Urgent manual cuff verification required'
      });
      deduction += 30;
    }
  }

  // 3. SpO2
  if (spo2) {
    if (spo2 > 100) {
      anomalies.push({
        field: 'spo2',
        issue: `SpO2 reading (${spo2}%) exceeds maximum 100% saturation limit`,
        severity: 'CRITICAL',
        suggestion: 'Check oximeter sensor calibration'
      });
      deduction += 30;
    } else if (spo2 < 55) {
      anomalies.push({
        field: 'spo2',
        issue: `SpO2 reading (${spo2}%) indicates profound life-threatening hypoxia or sensor detachment`,
        severity: 'CRITICAL',
        suggestion: 'Check patient consciousness; confirm sensor placement on warm finger'
      });
      deduction += 25;
    }
  }

  // 4. Temperature
  if (temp) {
    if (temp > 110 || temp < 88) {
      anomalies.push({
        field: 'temperature',
        issue: `Body temperature (${temp}°F) is outside physiological limits`,
        severity: 'CRITICAL',
        suggestion: 'Re-check temperature with clinical thermometer'
      });
      deduction += 25;
    }
  }

  // 5. Respiratory Rate
  if (rr) {
    if (rr > 65 || rr < 6) {
      anomalies.push({
        field: 'respiratoryRate',
        issue: `Respiratory rate (${rr} /min) is clinically implausible without mechanical arrest`,
        severity: 'CRITICAL',
        suggestion: 'Count chest excursions for 60 full seconds'
      });
      deduction += 25;
    }
  }

  return {
    anomalies,
    deduction
  };
}

/**
 * Full Comprehensive Patient Case Verification Audit
 */
export function auditConsultationIntegrity(consultation = {}) {
  const patient = consultation.patient || {};
  const vitals = consultation.vitals || {};

  const idAudit = validatePatientIdentity(patient);
  const vitalsAudit = validateClinicalVitals(vitals);

  const allAnomalies = [...idAudit.anomalies, ...vitalsAudit.anomalies];
  const totalDeduction = idAudit.deduction + vitalsAudit.deduction;

  let integrityScore = Math.max(0, 100 - totalDeduction);

  // If already officially verified by a clinician
  if (consultation.doctorVerification?.dataIntegrityStatus === 'VERIFIED_GENUINE') {
    integrityScore = Math.max(integrityScore, 95);
  }

  let status = 'AUTHENTIC';
  let badgeColor = '#10b981';
  let badgeText = 'Verified Authentic';

  if (allAnomalies.some(a => a.severity === 'CRITICAL') || integrityScore < 60) {
    status = 'HIGH_RISK_FAKE';
    badgeColor = '#ef4444';
    badgeText = 'Fake / Implausible Data Flagged';
  } else if (allAnomalies.length > 0 || integrityScore < 85) {
    status = 'SUSPICIOUS';
    badgeColor = '#f59e0b';
    badgeText = 'Suspicious Data Flagged';
  }

  return {
    integrityScore,
    status,
    badgeColor,
    badgeText,
    anomalies: allAnomalies,
    anomalyCount: allAnomalies.length,
    summary: allAnomalies.length === 0
      ? 'All demographic details and physiological vitals pass authenticity and clinical plausibility criteria.'
      : `${allAnomalies.length} anomaly detected requiring physician or counter identity audit.`
  };
}
