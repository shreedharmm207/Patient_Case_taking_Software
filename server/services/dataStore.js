// server/services/dataStore.js
// Persistent JSON database for MEDIKIOSK SIH 26047

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SAMPLE_DOCUMENTS } from "./ocrService.js";
import { runClinicalCrossVerification } from "./clinicalEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");
const CONSULTATIONS_FILE = path.join(DATA_DIR, "consultations.json");
const DOCTORS_FILE = path.join(DATA_DIR, "doctors.json");
const AUDIT_FILE = path.join(DATA_DIR, "auditLogs.json");

// Helper to read JSON
function readJSON(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial Seed Data
const INITIAL_DOCTORS = [
  {
    id: "doc_101",
    name: "Dr. Ananya Sharma",
    degree: "MBBS, MD (General Medicine)",
    specialty: "Internal Medicine & Diabetology",
    regNo: "KMC-48291",
    hospital: "Victoria Hospital / Bowring Medical College",
    department: "OPD Unit 1",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    email: "doctor@medikiosk.gov.in"
  },
  {
    id: "doc_102",
    name: "Dr. Ramesh Patil",
    degree: "MBBS, MS (General Surgery)",
    specialty: "General Surgery & Triage",
    regNo: "KMC-31804",
    hospital: "District Civil Hospital, Dharwad",
    department: "Emergency & Surgical Triage",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    email: "patil@medikiosk.gov.in"
  },
  {
    id: "doc_103",
    name: "Dr. Priya Nair",
    degree: "MBBS, MD (Emergency Medicine)",
    specialty: "Cardiology & Resuscitation",
    regNo: "KMC-59201",
    hospital: "Jayadeva Institute of Cardiovascular Sciences",
    department: "Cardiac Emergency Triage",
    avatar: "https://images.unsplash.com/photo-1594824813583-b9f1d07c08a9?w=150&auto=format&fit=crop&q=80",
    email: "priya@medikiosk.gov.in"
  },
  {
    id: "doc_ayur_101",
    name: "Dr. Vaidya Shreedhara Hegde",
    degree: "BAMS, MD (Ayurveda - Kayachikitsa)",
    specialty: "Kayachikitsa & Metabolic Health",
    regNo: "AYUSH-KA-11082",
    hospital: "Sri Jayachamarajendra Govt Ayurvedic Hospital",
    department: "Ayurveda Kayachikitsa OPD",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
    email: "vaidya.shreedhara@medikiosk.gov.in"
  },
  {
    id: "doc_ayur_102",
    name: "Dr. Ananya K. Sharma",
    degree: "BAMS, MD (Ayurveda - Panchakarma)",
    specialty: "Panchakarma & Musculoskeletal Care",
    regNo: "AYUSH-KA-09481",
    hospital: "National Institute of Ayurveda & AYUSH Center",
    department: "Ayurveda Panchakarma Wing",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    email: "ananya.ayur@medikiosk.gov.in"
  }
];

const INITIAL_PATIENTS = [
  {
    id: "pat_001",
    abhaId: "91-8472-1029-4401",
    name: "Ravi Kumar",
    nameKn: "ರವಿ ಕುಮಾರ್",
    age: 34,
    gender: "Male",
    phone: "+91 98450 11234",
    preferredLanguage: "en",
    address: "Jayanagar, Bengaluru",
    pastConsultations: [
      { date: "2026-07-12", complaint: "Seasonal Allergic Rhinitis", doctor: "Dr. Ananya Sharma", outcome: "Antihistamines prescribed, resolved" },
      { date: "2026-03-05", complaint: "Mild Gastritis", doctor: "Dr. Ramesh Patil", outcome: "Antacid therapy" }
    ]
  },
  {
    id: "pat_002",
    abhaId: "91-3829-5721-8932",
    name: "Smt. Gangamma Gowda",
    nameKn: "ಗಂಗಮ್ಮ ಗೌಡ",
    age: 58,
    gender: "Female",
    phone: "+91 94481 77290",
    preferredLanguage: "kn",
    address: "Mandya Rural, Karnataka",
    pastConsultations: [
      { date: "2026-05-18", complaint: "Essential Hypertension Regular Review", doctor: "Dr. Priya Nair", outcome: "Amlodipine 5mg continued, BP 142/90" },
      { date: "2025-11-20", complaint: "Bilateral Knee Osteoarthritis", doctor: "Dr. Ramesh Patil", outcome: "Analgesic and physiotherapy" }
    ]
  },
  {
    id: "pat_003",
    abhaId: "91-5521-9832-1104",
    name: "Karthik Bhat",
    nameKn: "ಕಾರ್ತಿಕ್ ಭಟ್",
    age: 26,
    gender: "Male",
    phone: "+91 99002 44510",
    preferredLanguage: "kn",
    address: "Shivamogga, Karnataka",
    pastConsultations: [
      { date: "2026-01-14", complaint: "Routine Health Checkup", doctor: "Dr. Ananya Sharma", outcome: "All vitals normal" }
    ]
  },
  {
    id: "pat_004",
    abhaId: "91-7742-3091-6623",
    name: "Sunita Devi",
    nameKn: "ಸುನೀತಾ ದೇವಿ",
    age: 52,
    gender: "Female",
    phone: "+91 98860 33901",
    preferredLanguage: "en",
    address: "Malleswaram, Bengaluru",
    pastConsultations: [
      { date: "2026-06-14", complaint: "Type 2 Diabetes & Dyslipidemia Review", doctor: "Dr. Ananya Sharma", outcome: "Metformin 500mg BD, Telmisartan 40mg OD prescribed" },
      { date: "2026-02-10", complaint: "Lumbago / Back Pain", doctor: "Dr. Ramesh Patil", outcome: "Muscle relaxant and core exercises" }
    ]
  }
];

const INITIAL_CONSULTATIONS = [
  // Demo Case 1: Fever + Cough
  {
    id: "cons_demo_01",
    tokenNumber: "OPD-101",
    patientId: "pat_001",
    patientName: "Ravi Kumar",
    patientAge: 34,
    patientGender: "Male",
    abhaId: "91-8472-1029-4401",
    language: "en",
    chiefComplaint: "High Fever and persistent productive cough for 4 days with chills",
    chiefComplaintKn: "4 ದಿನಗಳಿಂದ ಚಳಿಯೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಕಫದ ಕೆಮ್ಮು",
    status: "PENDING_REVIEW",
    isRedFlag: false,
    urgencyLevel: "STANDARD",
    redFlagReport: { isRedFlag: false, flags: [] },
    createdAt: "2026-09-16T09:30:00.000Z",
    assignedDoctorId: "doc_101",
    extractedEntities: {
      symptoms: [
        { canonicalName: "Fever (Pyrexia)", detectedWord: "fever", duration: "4 days", source: "Patient Voice" },
        { canonicalName: "Cough (Productive)", detectedWord: "cough", duration: "4 days", source: "Patient Voice" },
        { canonicalName: "Chills / Rigors", detectedWord: "chills", duration: "4 days", source: "Patient Voice" }
      ],
      duration: "4 days",
      severity: "Moderate (Grade 2)",
      modifiers: ["Productive yellowish phlegm", "Associated with body aches"]
    },
    adaptiveAnswers: [
      {
        id: "fc_duration_temp",
        question: "How many days have you had the fever?",
        answer: "3 to 5 days (High fever >101°F)",
        rationale: "Assessing acute duration to differentiate uncomplicated viral vs bacterial illness.",
        source: "Touch Chip"
      },
      {
        id: "fc_cough_character",
        question: "Is your cough dry, or are you bringing up phlegm/mucus?",
        answer: "Productive with yellow or greenish thick phlegm",
        rationale: "Purulent sputum indicates lower respiratory tract involvement.",
        source: "Patient Voice"
      },
      {
        id: "fc_breathing",
        question: "Are you feeling breathless or hearing any wheezing?",
        answer: "Only when walking fast or coughing a lot (Mild)",
        rationale: "Excluding resting hypoxia or acute severe bronchospasm.",
        source: "Touch Chip"
      }
    ],
    medicalHistory: {
      conditions: ["Seasonal Bronchitis (2024)"],
      medications: ["Paracetamol 650mg SOS taken yesterday"],
      allergies: ["Penicillin (Mild skin rash in childhood)"],
      surgeries: ["None"],
      familyHistory: ["Father has Type 2 Diabetes"],
      smoking: "Non-smoker",
      alcohol: "Occasional social"
    },
    documentExtractions: [],
    summary: {
      chiefComplaint: "High Fever and persistent productive cough for 4 days with chills",
      presentingSymptoms: ["Fever (Pyrexia)", "Cough (Productive)", "Chills / Rigors"],
      duration: "4 days",
      severity: "Moderate (Grade 2)",
      historyOfPresentingIllness: "Patient presented with a 4-day history of moderate-to-high grade fever with chills and productive cough bringing up yellowish sputum. Symptoms worsen with physical exertion. No resting breathlessness or chest tightness reported.",
      pastMedicalHistory: ["Seasonal Bronchitis (2024)"],
      currentMedications: ["Paracetamol 650mg SOS"],
      allergies: ["Penicillin (Allergy alert)"],
      previousSurgeries: ["None"],
      familyHistory: ["Father has Type 2 Diabetes"],
      lifestyleInformation: { smoking: "Non-smoker", alcohol: "Occasional social", diet: "Regular", activity: "Moderate" },
      clinicalObservations: [
        "Productive purulent cough suggests secondary bacterial lower respiratory tract infection.",
        "Check vitals: SpO2, Temperature, Respiratory Rate.",
        "Penicillin allergy noted - avoid Beta-lactam / Amoxicillin class antibiotics."
      ]
    },
    doctorVerification: {
      verified: false,
      doctorNotes: "",
      provisionalDiagnosis: "",
      prescriptions: []
    }
  },

  // Demo Case 2: RED-FLAG CHEST PAIN
  {
    id: "cons_demo_02",
    tokenNumber: "OPD-102 [URGENT]",
    patientId: "pat_002",
    patientName: "Smt. Gangamma Gowda",
    patientAge: 58,
    patientGender: "Female",
    abhaId: "91-3829-5721-8932",
    language: "kn",
    chiefComplaint: "Severe crushing retrosternal chest pain radiating to left arm and jaw with profuse cold sweating since 2 hours",
    chiefComplaintKn: "ಕಳೆದ 2 ಗಂಟೆಗಳಿಂದ ಎಡಗೈ ಮತ್ತು ದವಡೆಗೆ ಹರಡುತ್ತಿರುವ ತೀವ್ರ ಎದೆ ನೋವು ಮತ್ತು ತಣ್ಣನೆಯ ಬೆವರು",
    status: "IMMEDIATE_ATTENTION",
    isRedFlag: true,
    urgencyLevel: "CRITICAL",
    redFlagReport: {
      isRedFlag: true,
      flags: [
        {
          id: "acs_chest_pain",
          title: "Suspected Acute Coronary Syndrome (ACS) / Cardiac Emergency",
          severity: "CRITICAL",
          triggerEvidence: "Severe crushing chest pain radiating to left arm & jaw with sweating",
          rationale: "Crushing retrosternal chest pain radiating to the left arm and jaw with diaphoresis is a classic hallmark of acute myocardial infarction.",
          actionRequired: "Immediate ECG (12-Lead) within 10 minutes, STAT Troponin I, Vitals & Immediate Cardiac Resuscitation Bed"
        },
        {
          id: "severe_dyspnea",
          title: "Associated Acute Breathlessness",
          severity: "HIGH",
          triggerEvidence: "Dyspnea on minimal movement",
          rationale: "Secondary respiratory compromise due to acute cardiac pump strain.",
          actionRequired: "High flow oxygen and continuous pulse oximetry monitoring."
        }
      ]
    },
    createdAt: "2026-09-16T10:15:00.000Z",
    assignedDoctorId: "doc_103",
    extractedEntities: {
      symptoms: [
        { canonicalName: "Chest Pain (Crushing retrosternal)", detectedWord: "chest pain", duration: "2 hours", source: "Patient Voice (Kannada)" },
        { canonicalName: "Pain Radiation to Left Arm & Jaw", detectedWord: "radiating left arm", duration: "2 hours", source: "Patient Voice" },
        { canonicalName: "Cold Sweating (Diaphoresis)", detectedWord: "sweating", duration: "2 hours", source: "Patient Voice" },
        { canonicalName: "Shortness of Breath", detectedWord: "dyspnea", duration: "2 hours", source: "Patient Touch Input" }
      ],
      duration: "2 hours (Acute sudden onset)",
      severity: "Extreme (9 / 10 Pain Scale)",
      modifiers: ["Worse on walking", "Crushing sensation", "Accompanied by nausea"]
    },
    adaptiveAnswers: [
      {
        id: "cp_onset_duration",
        question: "When did the chest pain start, and was it sudden?",
        answer: "Sudden onset 2 hours ago while sitting at home",
        rationale: "Acute onset indicates vascular event (ACS) rather than gradual musculoskeletal pain.",
        source: "Patient Voice (Kannada)"
      },
      {
        id: "cp_character",
        question: "How would you describe the feeling of the pain?",
        answer: "Heavy pressure / Crushing weight like a stone on chest (ಭಾರವಾದ ಒತ್ತಡ / ಎದೆ ಹಿಂಡಿದಂತೆ)",
        rationale: "Crushing pressure is classic for ischemic myocardial necrosis.",
        source: "Touch Chip"
      },
      {
        id: "cp_radiation",
        question: "Does the pain travel anywhere else?",
        answer: "Yes, radiates intensely into left arm and jaw",
        rationale: "Dermatomal C8-T1 nerve root referral characteristic of cardiac origin.",
        source: "Touch Chip"
      },
      {
        id: "cp_exertion",
        question: "Does the pain increase with physical movement?",
        answer: "Gets much worse with any movement; patient cannot walk",
        rationale: "Ischemia exacerbated by increased myocardial oxygen demand.",
        source: "Patient Voice"
      },
      {
        id: "cp_associated_symptoms",
        question: "Are you experiencing sweating or breathlessness?",
        answer: "Profuse cold sweat, shortness of breath, and feeling faint",
        rationale: "Sympathetic surge and hemodynamic instability warning sign.",
        source: "Touch Chip"
      }
    ],
    medicalHistory: {
      conditions: ["Essential Hypertension (5 years)", "Borderline Dyslipidemia"],
      medications: ["Tab. Amlodipine 5mg OD (Irregular adherence)"],
      allergies: ["NKDA (No Known Drug Allergies)"],
      surgeries: ["Tubectomy (1998)"],
      familyHistory: ["Elder brother had Myocardial Infarction at age 54"],
      smoking: "Non-smoker",
      alcohol: "Non-drinker"
    },
    documentExtractions: [
      SAMPLE_DOCUMENTS[2] // Cardiac lab report with elevated Troponin 0.28
    ],
    summary: {
      chiefComplaint: "Severe crushing retrosternal chest pain radiating to left arm and jaw with profuse cold sweating since 2 hours",
      presentingSymptoms: ["Severe Chest Pain", "Radiation to Left Arm & Jaw", "Diaphoresis (Cold Sweating)", "Dyspnea"],
      duration: "2 hours",
      severity: "Critical (9 / 10 Pain Scale)",
      historyOfPresentingIllness: "58-year-old female with known history of hypertension presenting with sudden onset acute crushing retrosternal chest pain since 2 hours. Radiating to left arm and angle of jaw. Accompanied by marked diaphoresis, nausea, and shortness of breath. Pain is unremitting and severe (9/10).",
      pastMedicalHistory: ["Essential Hypertension (5 years)"],
      currentMedications: ["Tab Amlodipine 5mg OD"],
      allergies: ["NKDA"],
      previousSurgeries: ["Tubectomy (1998)"],
      familyHistory: ["Brother suffered MI at age 54"],
      lifestyleInformation: { smoking: "Non-smoker", alcohol: "Non-drinker", diet: "South Indian Vegetarian", activity: "Sedentary" },
      clinicalObservations: [
        "RED FLAG: HIGH PROBABILITY OF ACUTE CORONARY SYNDROME (STEMI/NSTEMI).",
        "Uploaded Emergency Biomarker indicates High Sensitivity Troponin I = 0.28 ng/mL (Reference < 0.04 ng/mL).",
        "IMMEDIATE ACTION: 12-lead ECG, Sublingual Nitrate, Aspirin 300mg + Clopidogrel 300mg loading dose per physician protocol, transfer to ICU/Cath Lab."
      ]
    },
    doctorVerification: {
      verified: false,
      doctorNotes: "",
      provisionalDiagnosis: "",
      prescriptions: []
    }
  },

  // Demo Case 3: Acute Abdominal Pain (Suspected Appendicitis)
  {
    id: "cons_demo_03",
    tokenNumber: "OPD-103 [URGENT]",
    patientId: "pat_003",
    patientName: "Karthik Bhat",
    patientAge: 26,
    patientGender: "Male",
    abhaId: "91-5521-9832-1104",
    language: "kn",
    chiefComplaint: "Sharp right lower abdomen pain since midnight, persistent nausea and low-grade fever",
    chiefComplaintKn: "ಮಧ್ಯರಾತ್ರಿಯಿಂದ ಹೊಟ್ಟೆಯ ಬಲ ಕೆಳಭಾಗದಲ್ಲಿ ತೀಕ್ಷ್ಣ ನೋವು ಮತ್ತು ವಾಕರಿಕೆ",
    status: "IMMEDIATE_ATTENTION",
    isRedFlag: true,
    urgencyLevel: "HIGH",
    redFlagReport: {
      isRedFlag: true,
      flags: [
        {
          id: "acute_abdomen",
          title: "Acute Surgical Abdomen / Suspected Acute Appendicitis",
          severity: "HIGH",
          triggerEvidence: "Right lower quadrant abdominal pain with fever and intractable vomiting",
          rationale: "Peritoneal irritation in right iliac fossa (McBurney's point) with systemic inflammatory markers requires surgical assessment to rule out appendicular perforation.",
          actionRequired: "Surgical consultation, Abdominal Ultrasonography (USG), Complete Blood Count (CBC) STAT"
        }
      ]
    },
    createdAt: "2026-09-16T11:00:00.000Z",
    assignedDoctorId: "doc_102",
    extractedEntities: {
      symptoms: [
        { canonicalName: "Abdominal Pain (Right Lower Quadrant)", detectedWord: "stomach pain right side", duration: "12 hours", source: "Patient Voice" },
        { canonicalName: "Nausea & Vomiting", detectedWord: "vomiting", duration: "12 hours", source: "Patient Voice" },
        { canonicalName: "Low Grade Fever", detectedWord: "fever", duration: "8 hours", source: "Patient Input" }
      ],
      duration: "12 hours",
      severity: "Severe (8 / 10 Pain Scale)",
      modifiers: ["Worse on coughing and walking", "Started around navel, migrated to right lower quadrant"]
    },
    adaptiveAnswers: [
      {
        id: "ab_location",
        question: "Where in your abdomen is the pain strongest?",
        answer: "Right lower side of belly (ಬಲ ಕೆಳಭಾಗದಲ್ಲಿ)",
        rationale: "Classic migration of visceral periumbilical pain to somatic parietal peritoneum at McBurney's point.",
        source: "Touch Chip"
      },
      {
        id: "ab_duration_type",
        question: "Is the pain continuous and steady?",
        answer: "Severe, continuous, and worsening with every hour",
        rationale: "Continuous severe pain indicates progressive localized peritonitis.",
        source: "Touch Chip"
      },
      {
        id: "ab_associated",
        question: "Do you have vomiting or fever?",
        answer: "Repeated vomiting twice this morning, cannot eat food",
        rationale: "Reflex autonomic vomiting associated with acute visceral inflammation.",
        source: "Patient Voice"
      }
    ],
    medicalHistory: {
      conditions: ["None"],
      medications: ["None"],
      allergies: ["NKDA"],
      surgeries: ["None"],
      familyHistory: ["Nil significant"],
      smoking: "Non-smoker",
      alcohol: "Non-drinker"
    },
    documentExtractions: [],
    summary: {
      chiefComplaint: "Sharp right lower abdomen pain since midnight, persistent nausea and low-grade fever",
      presentingSymptoms: ["Right Lower Quadrant Pain", "Nausea", "Vomiting", "Low Grade Pyrexia"],
      duration: "12 hours",
      severity: "Severe (8/10)",
      historyOfPresentingIllness: "26-year-old previously healthy male presenting with acute abdominal pain starting periumbilically last night and localized to the right lower quadrant over the past 8 hours. Accompanied by anorexia, nausea, 2 episodes of non-bilious vomitus, and mild fever. Aggravated by coughing and walking.",
      pastMedicalHistory: ["No chronic medical history"],
      currentMedications: ["None"],
      allergies: ["NKDA"],
      previousSurgeries: ["None"],
      familyHistory: ["Non-contributory"],
      lifestyleInformation: { smoking: "Non-smoker", alcohol: "Non-drinker", diet: "Regular", activity: "Active" },
      clinicalObservations: [
        "RED FLAG: High clinical likelihood of Acute Appendicitis (Alvarado Score estimated 7-8).",
        "Keep patient NPO (nil per os) pending surgical evaluation.",
        "STAT Ultrasound abdomen and pelvis, CBC, CRP, and Serum Electrolytes."
      ]
    },
    doctorVerification: {
      verified: false,
      doctorNotes: "",
      provisionalDiagnosis: "",
      prescriptions: []
    }
  },

  // Demo Case 4: Type 2 Diabetes Follow-up with Lab Report OCR (Abnormal values flagged)
  {
    id: "cons_demo_04",
    tokenNumber: "OPD-104",
    patientId: "pat_004",
    patientName: "Sunita Devi",
    patientAge: 52,
    patientGender: "Female",
    abhaId: "91-7742-3091-6623",
    language: "en",
    chiefComplaint: "Routine 3-month diabetes follow-up, generalized weakness and burning sensation in feet",
    chiefComplaintKn: "3 ತಿಂಗಳ ಮಧುಮೇಹ ತಪಾಸಣೆ, ಕಾಲುಗಳಲ್ಲಿ ಉರಿ ಮತ್ತು ನಿಶ್ಯಕ್ತಿ",
    status: "REVIEWED",
    isRedFlag: false,
    urgencyLevel: "STANDARD",
    redFlagReport: { isRedFlag: false, flags: [] },
    createdAt: "2026-09-15T14:20:00.000Z",
    assignedDoctorId: "doc_101",
    extractedEntities: {
      symptoms: [
        { canonicalName: "Peripheral Neuropathy / Tingling in feet", detectedWord: "burning feet", duration: "1 month", source: "Patient Voice" },
        { canonicalName: "Fatigue & Malaise", detectedWord: "weakness", duration: "3 weeks", source: "Patient Voice" }
      ],
      duration: "1 month",
      severity: "Moderate",
      modifiers: ["Night-time foot burning", "Dry mouth in mornings"]
    },
    adaptiveAnswers: [
      {
        id: "gen_onset",
        question: "How long have you been experiencing this main symptom?",
        answer: "A few weeks to a month",
        rationale: "Subacute onset of peripheral neuropathy symptoms in diabetic patient.",
        source: "Touch Chip"
      },
      {
        id: "gen_severity",
        question: "Severity of discomfort?",
        answer: "4-6: Moderate (interferes with sleep)",
        rationale: "Assessing impact on quality of life.",
        source: "Touch Chip"
      }
    ],
    medicalHistory: {
      conditions: ["Type 2 Diabetes Mellitus (6 years)", "Essential Hypertension (4 years)"],
      medications: ["Tab. Metformin 500mg BD", "Tab. Telmisartan 40mg OD"],
      allergies: ["NKDA"],
      surgeries: ["None"],
      familyHistory: ["Mother had Diabetes and Chronic Kidney Disease"],
      smoking: "Non-smoker",
      alcohol: "Non-drinker"
    },
    documentExtractions: [
      SAMPLE_DOCUMENTS[1] // Lab report showing Fasting Sugar 188, HbA1c 9.2%
    ],
    summary: {
      chiefComplaint: "Routine 3-month diabetes follow-up, generalized weakness and burning sensation in feet",
      presentingSymptoms: ["Peripheral Neuropathy (Burning feet)", "Generalized Fatigue"],
      duration: "1 month",
      severity: "Moderate",
      historyOfPresentingIllness: "52-year-old female with long-standing Type 2 Diabetes presenting for routine quarterly metabolic review. Reports bilateral distal tingling and burning sensation in toes and soles for 4 weeks. Reports compliance with oral hypoglycemic agents.",
      pastMedicalHistory: ["Type 2 Diabetes (6 years)", "Hypertension (4 years)"],
      currentMedications: ["Tab. Metformin 500mg BD", "Tab. Telmisartan 40mg OD"],
      allergies: ["NKDA"],
      previousSurgeries: ["None"],
      familyHistory: ["Maternal history of diabetic nephropathy"],
      lifestyleInformation: { smoking: "Non-smoker", alcohol: "Non-drinker", diet: "Vegetarian diabetic diet", activity: "Sedentary" },
      documentFindings: [
        {
          documentType: "LAB_REPORT",
          uploadedAt: "2026-08-20",
          keyFindings: [
            { test: "Fasting Blood Sugar", value: "188 mg/dL", reference: "70 - 100 mg/dL", isAbnormal: true, flag: "HIGH" },
            { test: "HbA1c (Glycated Hemoglobin)", value: "9.2 %", reference: "< 5.7 %", isAbnormal: true, flag: "CRITICALLY HIGH" },
            { test: "Total Cholesterol", value: "242 mg/dL", reference: "< 200 mg/dL", isAbnormal: true, flag: "HIGH" }
          ],
          abnormalFlags: [
            { parameter: "HbA1c", observed: "9.2 %", reference: "< 5.7 %", clinicalNote: "Suboptimal glycemic control. High risk of microvascular complications." }
          ]
        }
      ],
      clinicalObservations: [
        "Uncontrolled glycemic status with HbA1c 9.2% and Fasting Blood Sugar 188 mg/dL.",
        "Symptoms consistent with early Diabetic Peripheral Neuropathy.",
        "Serum Creatinine is normal (1.10 mg/dL), indicating preserved gross renal function."
      ]
    },
    doctorVerification: {
      verified: true,
      verifiedBy: "Dr. Ananya Sharma",
      verificationTimestamp: "2026-09-15T15:00:00.000Z",
      doctorNotes: "Reviewed lab investigations. Intensified oral hypoglycemics. Added Dapagliflozin 10mg OD. Prescribed Methylcobalamin / Pregabalin for peripheral burning. Advised funduscopy and urine microalbumin.",
      provisionalDiagnosis: "Type 2 Diabetes Mellitus with Suboptimal Glycemic Control & Early Diabetic Sensory Neuropathy",
      suggestedInvestigations: ["Urine Albumin Creatinine Ratio (UACR)", "Dilated Fundoscopy", "Lipid Profile repeat in 3 months"],
      prescriptions: [
        { drug: "Tab. Metformin", dose: "1000mg", timing: "Twice daily after meals (BD)", duration: "90 days" },
        { drug: "Tab. Dapagliflozin", dose: "10mg", timing: "Once daily in morning (OD)", duration: "90 days" },
        { drug: "Tab. Pregabalin + Methylcobalamin", dose: "75mg/1500mcg", timing: "Once daily at bedtime (HS)", duration: "30 days" }
      ]
    }
  },

  // Demo Case 5: Ayurveda Care Pathway Case (Chronic Hyperacidity & Lifestyle Intake)
  {
    id: "cons_demo_05",
    tokenNumber: "AYUR-105",
    patientId: "pat_005",
    patientName: "Smt. Parvathi Rao",
    patientAge: 46,
    patientGender: "Female",
    abhaId: "91-6284-9102-3371",
    language: "en",
    chiefComplaint: "Chronic burning sensation in chest and throat (hyperacidity), bloating after meals, disturbed sleep since 3 months",
    chiefComplaintKn: "ಎದೆಯಲ್ಲಿ ಉರಿ, ಊಟದ ನಂತರ ಹೊಟ್ಟೆ ಉಬ್ಬರ ಮತ್ತು ನಿದ್ರಾಹೀನತೆ",
    status: "PENDING_REVIEW",
    carePathway: "ayurveda",
    isRedFlag: false,
    urgencyLevel: "STANDARD",
    redFlagReport: { isRedFlag: false, flags: [] },
    createdAt: "2026-09-17T09:40:00.000Z",
    assignedDoctorId: "doc_ayur_101",
    extractedEntities: {
      symptoms: [
        { canonicalName: "Amlapitta / Hyperacidity", detectedWord: "burning chest and throat", duration: "3 months", source: "Patient Intake" },
        { canonicalName: "Adhmana / Abdominal Distension", detectedWord: "bloating", duration: "3 months", source: "Patient Intake" },
        { canonicalName: "Anidra / Disturbed Sleep", detectedWord: "sleep disturbance", duration: "2 months", source: "Patient Intake" }
      ],
      duration: "3 months (Chronic progressive)",
      severity: "Moderate (Grade 2)",
      modifiers: ["Worse after spicy/late-night meals", "Relieved temporarily by cool water"]
    },
    adaptiveAnswers: [
      {
        id: "ayur_digestion",
        question: "Describe your digestive comfort and appetite timing",
        answer: "Tikshnagni (intense erratic hunger, severe sour burping if meal delayed by 1 hour)",
        rationale: "Classic Pitta aggravation manifesting as Amlapitta.",
        source: "Patient Intake Flow"
      },
      {
        id: "ayur_sleep",
        question: "How is your sleep quality?",
        answer: "Broken sleep, wake up at 2:00 AM with chest warmth",
        rationale: "Pitta peak time (10 PM - 2 AM) aggravation impacting restfulness.",
        source: "Patient Intake Flow"
      }
    ],
    medicalHistory: {
      conditions: ["Mild Dyslipidemia", "GERD"],
      medications: ["Cap. Omeprazole 20mg PRN"],
      allergies: ["NKDA"],
      surgeries: ["None"],
      familyHistory: ["Mother had chronic acid peptic disease"],
      smoking: "Non-smoker",
      alcohol: "Non-drinker"
    },
    ayurvedaSpecificInfo: {
      lifestyle: "Sedentary software desk job with prolonged sitting (8-10 hours/day)",
      diet: "Vegetarian with frequent tea/coffee (3-4 cups), irregular meal hours, occasional deep-fried evening snacks",
      sleep: "Disturbed, 5-6 hours average, difficulties staying asleep during Pitta kala (midnight-2 AM)",
      dailyRoutine: "Late morning waking (07:30 AM), minimal physical exercise, high cognitive work-related stress",
      generalSymptoms: "Substernal heartburn, sour belching, epigastric heaviness after meals, morning fatigue",
      previousTreatments: "Antacids and Proton Pump Inhibitors (Omeprazole) with temporary relief and recurrence on cessation",
      patientConsentConfirmed: true,
      clinicalReviewStatus: "PENDING_AYURVEDA_PHYSICIAN_EVALUATION"
    },
    ayurvedaCareRequest: {
      requestedDoctorId: "doc_ayur_101",
      requestedDoctorName: "Dr. Vaidya Shreedhara Hegde",
      specialization: "Kayachikitsa & Metabolic Health",
      hospital: "Sri Jayachamarajendra Govt Ayurvedic Hospital, Bangalore",
      patientConsentForAyurveda: true,
      requestedAt: "2026-09-17T09:42:00.000Z"
    },
    documentExtractions: [],
    summary: {
      chiefComplaint: "Chronic burning sensation in chest and throat (hyperacidity), bloating after meals, disturbed sleep since 3 months",
      presentingSymptoms: ["Retrosternal Burning", "Sour Eructation", "Postprandial Bloating", "Interrupted Sleep"],
      duration: "3 months",
      severity: "Moderate",
      historyOfPresentingIllness: "46-year-old female presenting for holistic Ayurvedic consultation regarding 3-month history of burning in epigastrium and throat, aggravated by irregular eating hours and excessive caffeine. Temporary relief with PPIs followed by rebound symptoms.",
      pastMedicalHistory: ["GERD (1 year)", "Borderline Cholesterol"],
      currentMedications: ["Omeprazole 20mg PRN"],
      allergies: ["NKDA"],
      previousSurgeries: ["None"],
      familyHistory: ["Maternal history of peptic symptoms"],
      lifestyleInformation: { smoking: "Non-smoker", alcohol: "Non-drinker", diet: "High caffeine, irregular timings", activity: "Sedentary" },
      clinicalObservations: [
        "Presenting symptoms clinically consistent with classical Amlapitta / Vidagdha Jeerna.",
        "Patient consented to holistic Ayurveda lifestyle and dietetic protocol (Ahara-Vihara).",
        "Clinical diagnosis and therapeutic prescription pending evaluation by licensed BAMS/MD Ayurvedic practitioner."
      ]
    },
    doctorVerification: {
      verified: false,
      doctorNotes: "",
      provisionalDiagnosis: "",
      prescriptions: []
    }
  }
];

const INITIAL_AUDIT_LOGS = [
  { id: "log_01", timestamp: "2026-09-16T10:15:00.000Z", event: "EMERGENCY_RED_FLAG_TRIGGERED", details: "Red-flag ACS chest pain alert triggered for patient Smt. Gangamma Gowda (Token OPD-102)", actor: "MEDIKIOSK Clinical Scanner" },
  { id: "log_02", timestamp: "2026-09-16T10:14:00.000Z", event: "PATIENT_CONSENT_RECORDED", details: "Explicit digital informed consent granted by Smt. Gangamma Gowda under ABDM Guidelines", actor: "Patient Kiosk Terminal 01" },
  { id: "log_03", timestamp: "2026-09-15T15:00:00.000Z", event: "DOCTOR_VERIFICATION_ACCEPTED", details: "Dr. Ananya Sharma verified and amended case summary for patient Sunita Devi", actor: "Dr. Ananya Sharma (doc_101)" },
  { id: "log_04", timestamp: "2026-09-15T14:22:00.000Z", event: "OCR_EXTRACTION_COMPLETED", details: "Extracted 5 lab parameters from Diagnostic Report with 98% confidence score", actor: "Clinical OCR Engine" }
];

// Initialize Files if they don't exist
export function initStore() {
  if (!fs.existsSync(DOCTORS_FILE)) writeJSON(DOCTORS_FILE, INITIAL_DOCTORS);
  if (!fs.existsSync(PATIENTS_FILE)) writeJSON(PATIENTS_FILE, INITIAL_PATIENTS);
  if (!fs.existsSync(CONSULTATIONS_FILE)) writeJSON(CONSULTATIONS_FILE, INITIAL_CONSULTATIONS);
  if (!fs.existsSync(AUDIT_FILE)) writeJSON(AUDIT_FILE, INITIAL_AUDIT_LOGS);
}

// Reset data to initial demo state
export function resetDemoData() {
  writeJSON(DOCTORS_FILE, INITIAL_DOCTORS);
  writeJSON(PATIENTS_FILE, INITIAL_PATIENTS);
  writeJSON(CONSULTATIONS_FILE, INITIAL_CONSULTATIONS);
  writeJSON(AUDIT_FILE, INITIAL_AUDIT_LOGS);
  return { success: true, message: "Demo data reset successfully to SIH 26047 benchmark cases." };
}

// Getters & Setters
export function getDoctors() {
  return readJSON(DOCTORS_FILE, INITIAL_DOCTORS);
}

export function getPatients() {
  return readJSON(PATIENTS_FILE, INITIAL_PATIENTS);
}

export function getPatientById(id) {
  const patients = getPatients();
  return patients.find(p => p.id === id || p.abhaId === id);
}

export function savePatient(patientData) {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patientData.id || p.abhaId === patientData.abhaId);
  if (index >= 0) {
    patients[index] = { ...patients[index], ...patientData };
  } else {
    patients.unshift(patientData);
  }
  writeJSON(PATIENTS_FILE, patients);
  return patientData;
}

export function getConsultations() {
  const consultations = readJSON(CONSULTATIONS_FILE, INITIAL_CONSULTATIONS);
  return consultations.map(c => {
    if (!c.crossVerificationReport) {
      c.crossVerificationReport = runClinicalCrossVerification(c);
    }
    return c;
  });
}

export function getConsultationById(id) {
  const consultations = getConsultations();
  const c = consultations.find(item => item.id === id);
  if (c && !c.crossVerificationReport) {
    c.crossVerificationReport = runClinicalCrossVerification(c);
  }
  return c;
}

export function saveConsultation(consultation) {
  const consultations = getConsultations();
  const index = consultations.findIndex(c => c.id === consultation.id);
  if (index >= 0) {
    consultations[index] = { ...consultations[index], ...consultation };
  } else {
    consultations.unshift(consultation);
  }
  writeJSON(CONSULTATIONS_FILE, consultations);
  return consultation;
}

export function addAuditLog(event, details, actor = "MEDIKIOSK System") {
  const logs = readJSON(AUDIT_FILE, INITIAL_AUDIT_LOGS);
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    event,
    details,
    actor
  };
  logs.unshift(newLog);
  writeJSON(AUDIT_FILE, logs.slice(0, 100)); // keep last 100
  return newLog;
}

export function getAuditLogs() {
  return readJSON(AUDIT_FILE, INITIAL_AUDIT_LOGS);
}

export function getPatientTimeline(patientId) {
  const patient = getPatientById(patientId);
  if (!patient) return null;

  const allConsultations = getConsultations();
  const patientConsultations = allConsultations.filter(
    c => c.patientId === patient.id || c.abhaId === patient.abhaId
  );

  const timeline = [
    ...(patient.pastConsultations || []).map(p => ({
      date: p.date,
      type: "HISTORICAL_RECORD",
      complaint: p.complaint,
      doctor: p.doctor,
      outcome: p.outcome
    })),
    ...patientConsultations.map(c => ({
      date: c.createdAt ? c.createdAt.split("T")[0] : "2026-09-16",
      type: "MEDIKIOSK_INTAKE",
      consultationId: c.id,
      tokenNumber: c.tokenNumber,
      complaint: c.chiefComplaint,
      status: c.status,
      isRedFlag: c.isRedFlag,
      doctorNotes: c.doctorVerification?.doctorNotes || "Pending Doctor Review"
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    patient,
    unifiedTimeline: timeline
  };
}
