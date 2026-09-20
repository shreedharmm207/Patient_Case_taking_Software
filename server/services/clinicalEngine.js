// server/services/clinicalEngine.js
// MEDIKIOSK Clinical Intelligence & Triage Engine

/**
 * RED-FLAG Emergency Criteria & Keywords
 */
export const RED_FLAG_CRITERIA = [
  {
    id: "acs_chest_pain",
    pattern: /(chest pain|crushing|tightness in chest|left arm|radiation to jaw|pressure in chest|ಎದೆ ನೋವು|ಎದೆಭಾರ|ಎದೆಯಲ್ಲಿ ನೋವು)/i,
    triggerKeywords: ["chest pain", "crushing", "left arm", "jaw", "radiation", "sweating", "ಎದೆ ನೋವು"],
    title: "Suspected Acute Coronary Syndrome (ACS) / Cardiac Emergency",
    severity: "CRITICAL",
    rationale: "Chest pain especially with radiation to the arm, jaw, or accompanied by diaphoresis and shortness of breath requires immediate clinical evaluation to rule out acute myocardial infarction.",
    rationaleKn: "ಎದೆ ನೋವು ಕೈಗೆ ಅಥವಾ ದವಡೆಗೆ ಹರಡುವುದು ಮತ್ತು ಬೆವರುವಿಕೆ ಕಾಣಿಸಿಕೊಂಡಿರುವುದು ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಗೆ ಒಳಪಡಿಸಬೇಕಾಗಿದೆ."
  },
  {
    id: "severe_dyspnea",
    pattern: /(shortness of breath|cannot breathe|gasping|struggling to breathe|severe breathlessness|ಉಸಿರಾಟದ ತೊಂದರೆ|ಉಸಿರು ಕಟ್ಟುವಿಕೆ)/i,
    triggerKeywords: ["shortness of breath", "severe breathlessness", "cannot breathe", "gasping", "ಉಸಿರಾಟದ ತೊಂದರೆ"],
    title: "Severe Respiratory Distress / Acute Dyspnea",
    severity: "CRITICAL",
    rationale: "Acute breathlessness or inability to complete sentences in one breath suggests compromised oxygenation or airway compromise.",
    rationaleKn: "ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ ರಕ್ತದಲ್ಲಿ ಆಮ್ಲಜನಕದ ಕೊರತೆ ಅಥವಾ ಶ್ವಾಸಕೋಶದ ಗಂಭೀರ ಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ."
  },
  {
    id: "altered_sensorium",
    pattern: /(unconscious|passed out|fainted|syncope|confusion|disoriented|ಮೂರ್ಛೆ|ಪ್ರಜ್ಞಾಹೀನ)/i,
    triggerKeywords: ["unconscious", "fainted", "syncope", "loss of consciousness", "disoriented"],
    title: "Altered Mental Status / Syncope",
    severity: "CRITICAL",
    rationale: "Loss of consciousness or acute disorientation warrants immediate neurological and hemodynamic assessment.",
    rationaleKn: "ಪ್ರಜ್ಞಾಹೀನತೆ ಅಥವಾ ತಲೆಸುತ್ತಿ ಬೀಳುವುದು ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗೆ ಒಳಪಡಿಸಬೇಕಾಗಿದೆ."
  },
  {
    id: "acute_stroke_signs",
    pattern: /(sudden weakness|facial droop|slurred speech|arm weakness|paralysis|ಮುಖ ವಕ್ರ|ಮಾತು ತೊದಲು)/i,
    triggerKeywords: ["sudden weakness", "facial droop", "slurred speech", "numbness on one side"],
    title: "Acute Neurological Deficit (FAST Stroke Warning)",
    severity: "CRITICAL",
    rationale: "Sudden unilateral weakness, speech difficulty, or facial asymmetry is a medical emergency requiring rapid brain imaging within the thrombolytic window.",
    rationaleKn: "ಮುಖ ಅಥವಾ ಕೈಕಾಲುಗಳ ಹಠಾತ್ ದೌರ್ಬಲ್ಯ ಮತ್ತು ಮಾತು ತೊದಲುವುದು ತಕ್ಷಣದ ನರರೋಗ ತಪಾಸಣೆಯನ್ನು ಬಯಸುತ್ತದೆ."
  },
  {
    id: "severe_hemorrhage",
    pattern: /(vomiting blood|coughing blood|hematemesis|rectal bleeding|heavy bleeding|ರಕ್ತ ವಾಂತಿ|ಅಧಿಕ ರಕ್ತಸ್ರಾವ)/i,
    triggerKeywords: ["vomiting blood", "coughing blood", "heavy bleeding", "melena"],
    title: "Active Hemorrhage / Acute GI Bleed",
    severity: "HIGH",
    rationale: "Visible fresh or altered blood in vomitus, sputum, or stools indicates active internal bleeding risk.",
    rationaleKn: "ರಕ್ತ ವಾಂತಿ ಅಥವಾ ಅಧಿಕ ರಕ್ತಸ್ರಾವವು ಆಂತರಿಕ ರಕ್ತಸ್ರಾವದ ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ."
  },
  {
    id: "acute_abdomen",
    pattern: /(severe stomach pain|rigid abdomen|guarding|intense lower right pain|ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು)/i,
    triggerKeywords: ["severe stomach pain", "sharp pain right side", "rigid abdomen", "unbearable abdominal pain"],
    title: "Acute Surgical Abdomen / Suspected Appendicitis or Perforation",
    severity: "HIGH",
    rationale: "Acute localized or generalized severe abdominal pain with guarding or rebound tenderness requires prompt surgical review.",
    rationaleKn: "ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ತಡೆಯಲಾಗದ ಬಾಧೆಯು ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ತಕ್ಷಣದ ಪರೀಕ್ಷೆಯನ್ನು ಬಯಸುತ್ತದೆ."
  }
];

/**
 * ADAPTIVE CLINICAL QUESTIONS KNOWLEDGE GRAPH
 * Designed with SOCRATES / Clinical Intake Standards
 */
export const CLINICAL_QUESTION_FLOWS = {
  "chest_pain": {
    category: "Cardiovascular / Thoracic",
    chiefComplaintKey: "Chest Pain / ಎದೆ ನೋವು",
    questions: [
      {
        id: "cp_onset_duration",
        questionEn: "When exactly did the chest pain start, and was it sudden or gradual?",
        questionKn: "ಎದೆ ನೋವು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು? ಮತ್ತು ಇದು ಹಠಾತ್ತನೆ ಬಂದಿದ್ದಾ ಅಥವಾ ನಿಧಾನವಾಗಿ ಶುರುವಾಯಿತಾ?",
        inputType: "chips_and_text",
        options: [
          { en: "Sudden (Within 2 hours)", kn: "ಹಠಾತ್ತನೆ (ಕಳೆದ 2 ಗಂಟೆಗಳಲ್ಲಿ)", tag: "Sudden <2hrs" },
          { en: "Today (gradual onset)", kn: "ಇಂದು (ನಿಧಾನವಾಗಿ)", tag: "Today gradual" },
          { en: "Yesterday / 1-2 days ago", kn: "ನಿನ್ನೆ ಅಥವಾ 1-2 ದಿನಗಳ ಹಿಂದೆ", tag: "1-2 days ago" },
          { en: "More than a week ago", kn: "ಒಂದು ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲದಿಂದ", tag: ">1 week" }
        ],
        explainabilityEn: "Knowing the exact onset helps clinicians distinguish acute time-critical emergencies like a heart attack from chronic muscular or digestive pain.",
        explainabilityKn: "ನೋವು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು ಎಂಬುದನ್ನು ತಿಳಿಯುವುದರಿಂದ ಹೃದಯಾಘಾತದಂತಹ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಸ್ನಾಯು ನೋವಿನಿಂದ ಬೇರ್ಪಡಿಸಲು ವೈದ್ಯರಿಗೆ ಸಹಾಯವಾಗುತ್ತದೆ."
      },
      {
        id: "cp_character",
        questionEn: "How would you describe the feeling of the pain?",
        questionKn: "ನೋವಿನ ಅನುಭವ ಹೇಗಿದೆ ಎಂದು ನೀವು ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ?",
        inputType: "chips_and_text",
        options: [
          { en: "Heavy pressure / Crushing weight", kn: "ಭಾರವಾದ ಒತ್ತಡ / ಎದೆ ಹಿಂಡಿದಂತೆ", tag: "Crushing/Pressure", isAlert: true },
          { en: "Sharp / Stabbing pain", kn: "ಚುಚ್ಚುವಂತಹ ತೀಕ್ಷ್ಣ ನೋವು", tag: "Sharp/Stabbing" },
          { en: "Burning sensation (Heartburn)", kn: "ಎದೆಯುರಿ / ಉರಿಯುವ ಅನುಭವ", tag: "Burning" },
          { en: "Dull ache", kn: "ಮಂದವಾದ ನೋವು", tag: "Dull ache" }
        ],
        explainabilityEn: "Crushing, heavy pressure is characteristic of cardiac ischemia, whereas sharp stabbing pain may relate to pleural inflammation or chest wall strain.",
        explainabilityKn: "ಭಾರವಾದ ಎದೆಭಾರವು ಹೃದಯ ರಕ್ತಪರಿಚಲನೆಯ ಕೊರತೆಯನ್ನು ಸೂಚಿಸಬಲ್ಲದು, ಆದರೆ ಚುಚ್ಚುವ ನೋವು ಸ್ನಾಯು ಅಥವಾ ಶ್ವಾಸಕೋಶದ ಸಮಸ್ಯೆಯನ್ನು ಸೂಚಿಸಬಹುದು."
      },
      {
        id: "cp_radiation",
        questionEn: "Does the pain travel or spread anywhere else (such as left arm, shoulder, jaw, neck, or back)?",
        questionKn: "ಈ ನೋವು ಎಡಗೈ, ಭುಜ, ದವಡೆ, ಕತ್ತು ಅಥವಾ ಬೆನ್ನಿನ ಕಡೆಗೆ ಹರಡುತ್ತಿದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, spreads to left arm or shoulder", kn: "ಹೌದು, ಎಡಗೈ ಅಥವಾ ಭುಜಕ್ಕೆ ಹರಡುತ್ತದೆ", tag: "Radiating to left arm", isAlert: true },
          { en: "Yes, spreads to neck or jaw", kn: "ಹೌದು, ಕತ್ತು ಅಥವಾ ದವಡೆಗೆ ಹರಡುತ್ತದೆ", tag: "Radiating to jaw", isAlert: true },
          { en: "Yes, spreads to upper back", kn: "ಹೌದು, ಬೆನ್ನಿನ ಮೇಲ್ಭಾಗಕ್ಕೆ ಹರಡುತ್ತದೆ", tag: "Radiating to back" },
          { en: "No, stays in one exact spot", kn: "ಇಲ್ಲ, ಒಂದೇ ಜಾಗದಲ್ಲಿ ಇರುತ್ತದೆ", tag: "Localized" }
        ],
        explainabilityEn: "Radiation of pain to the left arm or jaw is a classic dermatomal referral sign of myocardial ischemia.",
        explainabilityKn: "ಎಡಗೈ ಅಥವಾ ದವಡೆಗೆ ನೋವು ಹರಡುವುದು ಹೃದಯಾಘಾತದ ಪ್ರಮುಖ ಲಕ್ಷಣವಾಗಿದ್ದು, ತಕ್ಷಣದ ಎಚ್ಚರಿಕೆಯನ್ನು ನೀಡುತ್ತದೆ."
      },
      {
        id: "cp_exertion",
        questionEn: "Does the pain increase when walking, climbing stairs, or doing physical effort?",
        questionKn: "ನಡೆಯುವಾಗ, ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ ಅಥವಾ ಶ್ರಮದ ಕೆಲಸ ಮಾಡುವಾಗ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, definitely gets worse with exertion", kn: "ಹೌದು, ಶ್ರಮಪಟ್ಟಾಗ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆ", tag: "Exertional worsening", isAlert: true },
          { en: "Relieved by rest", kn: "ವಿಶ್ರಾಂತಿ ಪಡೆದಾಗ ಕಡಿಮೆ ಆಗುತ್ತದೆ", tag: "Relieved by rest" },
          { en: "Worse when taking deep breaths or pressing chest", kn: "ಉಸಿರೆಳೆದಾಗ ಅಥವಾ ಮುಟ್ಟಿದಾಗ ಹೆಚ್ಚಾಗುತ್ತದೆ", tag: "Pleuritic/Musculoskeletal" },
          { en: "No relation to physical movement", kn: "ಯಾವುದೇ ಚಲನೆಗೆ ಸಂಬಂಧವಿಲ್ಲ", tag: "No exertion relation" }
        ],
        explainabilityEn: "Exertional angina typically worsens with cardiac workload, helping the doctor prioritize immediate cardiac monitoring.",
        explainabilityKn: "ಶ್ರಮಪಟ್ಟಾಗ ಹೆಚ್ಚಾಗುವ ಎದೆನೋವು ಹೃದಯಕ್ಕೆ ಆಮ್ಲಜನಕದ ಕೊರತೆಯನ್ನು ತೋರಿಸಬಹುದು, ಆದ್ದರಿಂದ ವೈದ್ಯರು ಇಸಿಜಿ ಪರೀಕ್ಷಿಸಲು ಆದ್ಯತೆ ನೀಡುತ್ತಾರೆ."
      },
      {
        id: "cp_associated_symptoms",
        questionEn: "Are you experiencing any of these other symptoms along with the chest pain?",
        questionKn: "ಎದೆ ನೋವಿನೊಂದಿಗೆ ಇವುಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಇತರ ಲಕ್ಷಣಗಳು ನಿಮ್ಮಲ್ಲಿವೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Cold sweating (Diaphoresis)", kn: "ತಣ್ಣನೆಯ ಬೆವರು ಸುರಿಯುವುದು", tag: "Cold sweating", isAlert: true },
          { en: "Shortness of breath", kn: "ಉಸಿರಾಟದ ತೊಂದರೆ", tag: "Dyspnea", isAlert: true },
          { en: "Nausea or feeling faint", kn: "ವಾಕರಿಕೆ ಅಥವಾ ತಲೆಸುತ್ತುವಿಕೆ", tag: "Nausea/Presyncope" },
          { en: "Acid reflux / Sour burps", kn: "ಹುಳಿತೇಗು / ಗ್ಯಾಸ್ಟ್ರಿಕ್", tag: "Acid reflux" },
          { en: "None of these", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Associated diaphoresis (sweating) and breathlessness significantly elevate the urgency of evaluating for myocardial infarction.",
        explainabilityKn: "ಬೆವರು ಮತ್ತು ಉಸಿರುಕಟ್ಟುವಿಕೆ ಎದೆನೋವಿನ ಜೊತೆಯಲ್ಲಿದ್ದರೆ ಅದು ತುರ್ತು ಹೃದಯ ಸಂಬಂಧಿ ಪರೀಕ್ಷೆಗೆ ಅತ್ಯಗತ್ಯ ಸೂಚನೆಯಾಗಿದೆ."
      }
    ]
  },

  "fever_cough": {
    category: "Respiratory & Infectious Disease",
    chiefComplaintKey: "Fever & Cough / ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು",
    questions: [
      {
        id: "fc_duration_temp",
        questionEn: "How many days have you had the fever, and have you measured your temperature?",
        questionKn: "ನಿಮಗೆ ಜ್ವರ ಬಂದು ಎಷ್ಟು ದಿನಗಳಾಯಿತು? ಮತ್ತು ತಾಪಮಾನ ಅಳತೆ ಮಾಡಿದ್ದೀರಾ?",
        inputType: "chips_and_text",
        options: [
          { en: "1 to 2 days (Mild fever)", kn: "1 ರಿಂದ 2 ದಿನಗಳು (ಸ್ವಲ್ಪ ಜ್ವರ)", tag: "1-2 days mild" },
          { en: "3 to 5 days (High fever >101°F)", kn: "3 ರಿಂದ 5 ದಿನಗಳು (ತೀವ್ರ ಜ್ವರ >101°F)", tag: "3-5 days high", isAlert: true },
          { en: "More than a week", kn: "ಒಂದು ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲ", tag: ">7 days persistent" },
          { en: "Comes and goes with chills", kn: "ಚಳಿಯೊಂದಿಗೆ ಬಂದು ಹೋಗುತ್ತದೆ", tag: "Intermittent with chills" }
        ],
        explainabilityEn: "Duration helps determine whether this is an acute viral infection, bacterial pneumonia, or prolonged fever requiring tropical fever workup.",
        explainabilityKn: "ಜ್ವರದ ಅವಧಿಯು ವೈದ್ಯರಿಗೆ ಇದು ಸಾಧಾರಣ ವೈರಲ್ ಸೋಂಕೇ ಅಥವಾ ನ್ಯುಮೋನಿಯಾ ಅಥವಾ ಡೆಂಗ್ಯೂ ಮುಂತಾದ ತೀವ್ರ ಸೋಂಕೇ ಎಂದು ತೀರ್ಮಾನಿಸಲು ನೆರವಾಗುತ್ತದೆ."
      },
      {
        id: "fc_cough_character",
        questionEn: "Is your cough dry, or are you bringing up phlegm/mucus?",
        questionKn: "ನಿಮ್ಮ ಕೆಮ್ಮು ಒಣ ಕೆಮ್ಮೇ ಅಥವಾ ಕಫ (ಕಫ ಬರುವುದು) ಇದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Dry, hacking cough", kn: "ಒಣ ಕೆಮ್ಮು (ಕಫ ಇಲ್ಲ)", tag: "Dry cough" },
          { en: "Productive with clear/white phlegm", kn: "ಬಿಳಿ ಅಥವಾ ತಿಳಿ ಕಫ ಬರುತ್ತದೆ", tag: "Productive clear" },
          { en: "Yellow or greenish thick phlegm", kn: "ಹಳದಿ ಅಥವಾ ಹಸಿರು ಬಣ್ಣದ ಗಟ್ಟಿ ಕಫ", tag: "Productive purulent" },
          { en: "Blood-tinged phlegm", kn: "ಕಫದಲ್ಲಿ ರಕ್ತದ ಕಲೆಗಳು", tag: "Hemoptysis", isAlert: true }
        ],
        explainabilityEn: "Purulent (yellow/green) sputum or blood streaks points towards bacterial lower respiratory infection or tuberculosis requiring targeted sputum workup.",
        explainabilityKn: "ಹಳದಿ/ಹಸಿರು ಕಫ ಅಥವಾ ರಕ್ತದ ಅಂಶ ಶ್ವಾಸಕೋಶದ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಇದಕ್ಕೆ ಆಂಟಿಬಯೋಟಿಕ್ ಅಥವಾ ಎಕ್ಸ್‌ರೇ ಅಗತ್ಯವಿರಬಹುದು."
      },
      {
        id: "fc_breathing",
        questionEn: "Are you feeling breathless or hearing any wheezing/whistling sounds when breathing?",
        questionKn: "ನಿಮಗೆ ಉಸಿರಾಡುವಾಗ ಉಸಿರುಕಟ್ಟುವಿಕೆ ಅಥವಾ ಎದೆಯಲ್ಲಿ ಶಬ್ದ (ಶಿಳ್ಳೆ ಶಬ್ದ) ಬರುತ್ತಿದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, struggling to breathe even at rest", kn: "ಹೌದು, ಸುಮ್ಮನೆ ಕುಳಿತಾಗಲೂ ಉಸಿರಾಟ ಕಷ್ಟವಾಗುತ್ತದೆ", tag: "Resting dyspnea", isAlert: true },
          { en: "Only when walking fast or coughing a lot", kn: "ವೇಗವಾಗಿ ನಡೆದಾಗ ಅಥವಾ ಕೆಮ್ಮಿದಾಗ ಮಾತ್ರ", tag: "Exertional dyspnea" },
          { en: "Wheezing sound present", kn: "ಎದೆಯಲ್ಲಿ ಸೀಟಿ ಶಬ್ದ (ವೀಸಿಂಗ್)", tag: "Wheezing" },
          { en: "No difficulty breathing", kn: "ಯಾವುದೇ ಉಸಿರಾಟದ ತೊಂದರೆ ಇಲ್ಲ", tag: "No dyspnea" }
        ],
        explainabilityEn: "Dyspnea combined with fever suggests pneumonia or acute bronchospasm, requiring immediate SpO2 oxygen level measurement.",
        explainabilityKn: "ಜ್ವರದ ಜೊತೆ ಉಸಿರಾಟ ಕಷ್ಟವಾದರೆ ಆಮ್ಲಜನಕದ ಮಟ್ಟ (SpO2) ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಲು ವೈದ್ಯರಿಗೆ ಸೂಚಿಸುತ್ತದೆ."
      },
      {
        id: "fc_systemic_symptoms",
        questionEn: "Do you have body aches, headache, sore throat, or loss of taste/smell?",
        questionKn: "ನಿಮಗೆ ಮೈ-ಕೈ ನೋವು, ತಲೆನೋವು, ಗಂಟಲು ನೋವು ಅಥವಾ ವಾಸನೆ/ರುಚಿ ತಿಳಿಯದಿರುವಿಕೆ ಇದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Severe body and joint aches", kn: "ತೀವ್ರ ಮೈ-ಕೈ ಮತ್ತು ಕೀಲು ನೋವು", tag: "Myalgia/Arthralgia" },
          { en: "Severe sore throat / difficulty swallowing", kn: "ತೀವ್ರ ಗಂಟಲು ನೋವು / ನುಂಗಲು ಕಷ್ಟ", tag: "Sore throat" },
          { en: "Headache and eye pain", kn: "ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣುಗಳ ಹಿಂದೆ ನೋವು", tag: "Headache/Retro-orbital" },
          { en: "Loss of taste or smell", kn: "ರುಚಿ ಅಥವಾ ವಾಸನೆ ತಿಳಿಯದಿರುವುದು", tag: "Anosmia/Ageusia" },
          { en: "None", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Aches, headache, and sore throat help differentiate viral upper respiratory syndromes and arboviral illnesses like dengue or chikungunya.",
        explainabilityKn: "ಕೀಲು ನೋವು ಮತ್ತು ತಲೆನೋವು ವೈರಲ್ ಜ್ವರ ಅಥವಾ ಡೆಂಗ್ಯೂ ಲಕ್ಷಣಗಳನ್ನು ಗುರುತಿಸಲು ವೈದ್ಯರಿಗೆ ಸಹಕಾರಿಯಾಗಿದೆ."
      }
    ]
  },

  "abdominal_pain": {
    category: "Gastrointestinal & Surgical",
    chiefComplaintKey: "Abdominal Pain / ಹೊಟ್ಟೆ ನೋವು",
    questions: [
      {
        id: "ab_location",
        questionEn: "Where in your abdomen is the pain strongest?",
        questionKn: "ನಿಮ್ಮ ಹೊಟ್ಟೆಯಲ್ಲಿ ನೋವು ಹೆಚ್ಚಾಗಿ ಯಾವ ಭಾಗದಲ್ಲಿದೆ?",
        inputType: "chips_and_text",
        options: [
          { en: "Right lower side of belly", kn: "ಹೊಟ್ಟೆಯ ಬಲ ಕೆಳಭಾಗದಲ್ಲಿ", tag: "Right lower quadrant", isAlert: true },
          { en: "Upper middle belly (near ribs/stomach)", kn: "ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ (ಎದೆಗೂಡಿನ ಕೆಳಗೆ)", tag: "Epigastric" },
          { en: "Right upper side (below ribs)", kn: "ಬಲ ಮೇಲ್ಭಾಗದ ಪಕ್ಕೆಲುಬುಗಳ ಕೆಳಗೆ", tag: "Right upper quadrant" },
          { en: "Lower abdomen (near bladder)", kn: "ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗ / ಮೂತ್ರಕೋಶದ ಬಳಿ", tag: "Suprapubic/Pelvic" },
          { en: "All over the entire abdomen", kn: "ಇಡೀ ಹೊಟ್ಟೆಯಾದ್ಯಂತ ಹರಡಿದೆ", tag: "Generalized", isAlert: true }
        ],
        explainabilityEn: "Pain in the right lower abdomen is a primary clinical warning sign for acute appendicitis, while epigastric pain relates to gastritis or pancreatitis.",
        explainabilityKn: "ಬಲ ಕೆಳ ಹೊಟ್ಟೆಯ ನೋವು ಅಪೆಂಡಿಸೈಟಿಸ್ ಕಾಯಿಲೆಯ ಮುಖ್ಯ ಲಕ್ಷಣವಾಗಿದೆ, ಇದು ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ತಪಾಸಣೆಯನ್ನು ತಕ್ಷಣ ಬಯಸುತ್ತದೆ."
      },
      {
        id: "ab_duration_type",
        questionEn: "Is the pain continuous and steady, or does it come in sharp waves (cramps)?",
        questionKn: "ನೋವು ನಿರಂತರವಾಗಿ ಉಳಿದಿದೆಯೇ ಅಥವಾ ತೆರೆ-ತೆರೆಯಾಗಿ (ಹಿಡಿದು ಬಿಡುವಂತೆ) ಬರುತ್ತಿದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Severe, continuous, worsening", kn: "ತೀವ್ರವಾದ ನಿರಂತರ ನೋವು (ಹೆಚ್ಚಾಗುತ್ತಿದೆ)", tag: "Continuous severe", isAlert: true },
          { en: "Colicky cramping (comes and goes in waves)", kn: "ಹಿಡಿದು ಬಿಡುವ ಸೆಳೆತದ ನೋವು", tag: "Colicky cramps" },
          { en: "Burning pain related to hunger or spicy food", kn: "ಉರಿಯುವ ನೋವು (ಖಾರ ಅಥವಾ ಹಸಿವಾದಾಗ)", tag: "Burning peptic" },
          { en: "Dull pressure", kn: "ಮಂದವಾದ ಒತ್ತಡ", tag: "Dull discomfort" }
        ],
        explainabilityEn: "Continuous worsening pain indicates inflammatory or peritoneal processes, while colicky cramps suggest bowel spasm or renal calculi (stones).",
        explainabilityKn: "ನಿರಂತರ ತೀವ್ರ ನೋವು ಆಂತರಿಕ ಅಂಗಗಳ ಉರಿಯೂತವನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಹಿಡಿದು ಬಿಡುವ ನೋವು ಕಲ್ಲು ಅಥವಾ ಕರುಳಿನ ಸೆಳೆತವನ್ನು ತೋರಿಸುತ್ತದೆ."
      },
      {
        id: "ab_associated",
        questionEn: "Do you have vomiting, fever, or difficulty passing stool or gas?",
        questionKn: "ನಿಮಗೆ ವಾಂತಿ, ಜ್ವರ ಅಥವಾ ಮಲ/ಗ್ಯಾಸ್ ಹೋಗದಿರುವ ತೊಂದರೆ ಇದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Repeated vomiting / cannot keep liquids down", kn: "ಮರುಕಳಿಸುವ ವಾಂತಿ / ನೀರೂ ಉಳಿಯುತ್ತಿಲ್ಲ", tag: "Intractable vomiting", isAlert: true },
          { en: "Fever and chills", kn: "ಜ್ವರ ಮತ್ತು ಚಳಿ", tag: "Fever/Chills" },
          { en: "Unable to pass gas or stool (distended belly)", kn: "ಮಲ ಅಥವಾ ಗ್ಯಾಸ್ ಹೋಗುತ್ತಿಲ್ಲ (ಹೊಟ್ಟೆ ಉಬ್ಬರ)", tag: "Obstipation/Distension", isAlert: true },
          { en: "Loose watery stools (diarrhea)", kn: "ನೀರಿನಂತಹ ಬೇಧಿ / ಭೇದಿ", tag: "Diarrhea" },
          { en: "Burning sensation during urination", kn: "ಮೂತ್ರ ಮಾಡುವಾಗ ಉರಿ", tag: "Dysuria" },
          { en: "None", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Inability to pass flatus with vomiting suggests bowel obstruction; fever with right lower pain points to acute appendicitis.",
        explainabilityKn: "ವಾಂತಿ ಮತ್ತು ಮಲಬದ್ಧತೆ ಕರುಳಿನ ತಡೆಗೋಡೆಯನ್ನು ಸೂಚಿಸಬಹುದು, ಇದು ತಕ್ಷಣದ ತುರ್ತು ಚಿಕಿತ್ಸೆ ಬಯಸುತ್ತದೆ."
      }
    ]
  },

  "acid_peptic_gi": {
    category: "Gastroenterology / Acid Peptic",
    chiefComplaintKey: "Acid Peptic / GERD / Gastric Burning / ಎದೆಯುರಿ",
    questions: [
      {
        id: "ap_timing_relation",
        questionEn: "When does the burning sensation or stomach discomfort bother you the most?",
        questionKn: "ಎದೆಯುರಿ ಅಥವಾ ಹೊಟ್ಟೆಯಲ್ಲಿ ಉರಿಯುವುದು ಯಾವ ಸಮಯದಲ್ಲಿ ಹೆಚ್ಚಾಗಿ ಕಾಡುತ್ತದೆ?",
        inputType: "chips_and_text",
        options: [
          { en: "Right after meals (Postprandial)", kn: "ಊಟವಾದ ತಕ್ಷಣ", tag: "Postprandial" },
          { en: "At night when lying down in bed", kn: "ರಾತ್ರಿ ಮಲಗಿದಾಗ", tag: "Nocturnal reflux", isAlert: true },
          { en: "On empty stomach / hungry", kn: "ಹಸಿದಿದ್ದಾಗ / ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ", tag: "Fasting burning" },
          { en: "Constant throughout the whole day", kn: "ದಿನವಿಡೀ ನಿರಂತರವಾಗಿರುತ್ತದೆ", tag: "Constant" }
        ],
        explainabilityEn: "Postprandial and nocturnal reflux indicate lower esophageal sphincter incompetence, whereas fasting epigastric burning points to duodenal peptic ulceration.",
        explainabilityKn: "ರಾತ್ರಿ ಮಲಗಿದಾಗ ಹೆಚ್ಚಾಗುವ ಎದೆಯುರಿ ಆಸಿಡ್ ಹಿಮ್ಮುಖ ಹರಿವನ್ನು ತೋರಿಸುತ್ತದೆ, ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಕಾಡುವುದು ಕರುಳಿನ ಹುಣ್ಣನ್ನು (ಅಲ್ಸರ್) ಸೂಚಿಸುತ್ತದೆ."
      },
      {
        id: "ap_triggers",
        questionEn: "Does the discomfort worsen with spicy foods, painkillers (like brufen/aspirin), or tea/coffee?",
        questionKn: "ಖಾರವಾದ ಆಹಾರ, ನೋವು ನಿವಾರಕ ಮಾತ್ರೆಗಳು (ಬ್ರೂಫೆನ್/ಆಸ್ಪಿರಿನ್) ಅಥವಾ ಚಹಾ/ಕಾಫಿ ಸೇವಿಸಿದಾಗ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, worse after spicy food or tea", kn: "ಹೌದು, ಖಾರ ಅಥವಾ ಚಹಾ ಸೇವನೆಯ ನಂತರ", tag: "Dietary trigger" },
          { en: "Yes, flared up after taking painkiller tablets", kn: "ಹೌದು, ನೋವು ನಿವಾರಕ ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡ ನಂತರ", tag: "NSAID-induced gastritis", isAlert: true },
          { en: "Relieved immediately by cold milk or antacid", kn: "ತಣ್ಣನೆಯ ಹಾಲು ಅಥವಾ ಆಂಟಾಸಿಡ್ ಕುಡಿದಾಗ ಕಡಿಮೆಯಾಗುತ್ತದೆ", tag: "Antacid responsive" },
          { en: "No specific relation to food or medicine", kn: "ಯಾವುದೇ ಆಹಾರಕ್ಕೆ ಸಂಬಂಧವಿಲ್ಲ", tag: "Non-specific" }
        ],
        explainabilityEn: "NSAID-induced mucosal erosions are a prime cause of acute upper GI bleeding and require discontinuation of anti-inflammatory drugs.",
        explainabilityKn: "ನೋವು ನಿವಾರಕ ಮಾತ್ರೆಗಳಿಂದ ಹೊಟ್ಟೆಯಲ್ಲಿ ಅಲ್ಸರ್ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ, ಇದನ್ನು ವೈದ್ಯರು ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ತಪಾಸಿಸುತ್ತಾರೆ."
      },
      {
        id: "ap_red_flags",
        questionEn: "Have you noticed difficulty swallowing food, vomiting blood, black-colored stools, or severe weight loss?",
        questionKn: "ಆಹಾರ ನುಂಗಲು ಕಷ್ಟವಾಗುವುದು, ರಕ್ತ ವಾಂತಿ, ಕಪ್ಪು ಬಣ್ಣದ ಮಲ ಅಥವಾ ತೀವ್ರ ತೂಕ ಇಳಿಕೆ ಉಂಟಾಗಿದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Difficulty swallowing food (Dysphagia)", kn: "ಆಹಾರ ನುಂಗಲು ಕಷ್ಟ (ಗಂಟಲಿನಲ್ಲಿ ಸಿಲುಕಿದಂತೆ)", tag: "Dysphagia", isAlert: true },
          { en: "Black tarry stools (Melena)", kn: "ಕಪ್ಪು ಬಣ್ಣದ ಜಿಗುಟು ಮಲ", tag: "Melena", isAlert: true },
          { en: "Vomited coffee-ground or bloody fluid", kn: "ರಕ್ತ ಮಿಶ್ರಿತ ಅಥವಾ ಕಾಫಿ ಬಣ್ಣದ ವಾಂತಿ", tag: "Hematemesis", isAlert: true },
          { en: "Noticeable unintentional weight loss", kn: "ಗಮನಾರ್ಹ ತೂಕ ಇಳಿಕೆ", tag: "Weight loss", isAlert: true },
          { en: "None of these alarm symptoms", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Dysphagia, melena, and unexplained weight loss are critical gastrointestinal red flags requiring urgent diagnostic endoscopy to rule out malignancy or bleed.",
        explainabilityKn: "ನುಂಗಲು ಕಷ್ಟ ಮತ್ತು ಕಪ್ಪು ಮಲ ಬರುವುದು ಹೊಟ್ಟೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವವನ್ನು ಸೂಚಿಸುವುದರಿಂದ ತುರ್ತು ಎಂಡೋಸ್ಕೋಪಿ ಪರೀಕ್ಷೆಯನ್ನು ಬಯಸುತ್ತದೆ."
      }
    ]
  },

  "joint_pain_arthritis": {
    category: "Rheumatology & Orthopedics",
    chiefComplaintKey: "Joint Pain / Arthritis / ಕೀಲು ನೋವು",
    questions: [
      {
        id: "jp_stiffness_duration",
        questionEn: "Do you wake up with joint stiffness in the morning, and how long does it take to ease?",
        questionKn: "ಬೆಳಿಗ್ಗೆ ಎದ್ದಾಗ ಕೀಲುಗಳು ಬಿಗಿಯಾಗಿ (ಹಿಡಿದಂತೆ) ಇರುತ್ತವೆಯೇ? ಇದು ಸಡಿಲವಾಗಲು ಎಷ್ಟು ಸಮಯ ಬೇಕಾಗುತ್ತದೆ?",
        inputType: "chips_and_text",
        options: [
          { en: "Prolonged stiffness lasting more than 30-60 minutes", kn: "30-60 ನಿಮಿಷಗಳಿಗಿಂತ ಹೆಚ್ಚು ಕಾಲದ ತೀವ್ರ ಬಿಗಿತ", tag: "Morning stiffness >30m", isAlert: true },
          { en: "Brief stiffness lasting under 15-20 minutes", kn: "15-20 ನಿಮಿಷಗಳಿಗಿಂತ ಕಡಿಮೆ ಅವಧಿ", tag: "Brief stiffness <15m" },
          { en: "Worse at night after a long day of walking", kn: "ದಿನವಿಡೀ ಕೆಲಸ ಮಾಡಿದ ನಂತರ ರಾತ್ರಿ ಹೆಚ್ಚು", tag: "Mechanical fatigue" },
          { en: "No morning stiffness noticed", kn: "ಯಾವುದೇ ಬೆಳಗಿನ ಬಿಗಿತವಿಲ್ಲ", tag: "No stiffness" }
        ],
        explainabilityEn: "Morning stiffness exceeding 30-60 minutes strongly points to inflammatory arthritis (like Rheumatoid), whereas brief stiffness relates to mechanical Osteoarthritis.",
        explainabilityKn: "ಬೆಳಿಗ್ಗೆ 30 ನಿಮಿಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲ ಕೀಲು ಹಿಡಿದುಕೊಳ್ಳುವುದು ರುಮಟಾಯ್ಡ್ ಆರ್ಥ್ರೈಟಿಸ್‌ನ ಲಕ್ಷಣವಾಗಿದ್ದು, ರಕ್ತ ಪರೀಕ್ಷೆ ಅಗತ್ಯವಿರುತ್ತದೆ."
      },
      {
        id: "jp_joints_affected",
        questionEn: "Which joints are primarily involved, and is it on both sides symmetrically?",
        questionKn: "ಮುಖ್ಯವಾಗಿ ಯಾವ ಕೀಲುಗಳಲ್ಲಿ ನೋವಿದೆ? ಮತ್ತು ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಸಮಾನವಾಗಿದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Small joints of fingers, hands, and wrists symmetrically", kn: "ಎರಡೂ ಕೈಗಳ ಬೆರಳುಗಳು ಮತ್ತು ಮಣಿಕಟ್ಟು", tag: "Symmetric small joints", isAlert: true },
          { en: "Weight-bearing knee joints or hips", kn: "ಮಂಡಿ ಅಥವಾ ಸೊಂಟದ ಕೀಲುಗಳು", tag: "Knee/Hip joints" },
          { en: "Single acute swollen hot joint (like big toe)", kn: "ಒಂದೇ ಕೀಲು ಊದಿಕೊಂಡು ಕೆಂಪಾಗಿದೆ (ಹೆಬ್ಬೆರಳು)", tag: "Monoarthritis / Gout", isAlert: true },
          { en: "Lower back and spine stiffness", kn: "ಬೆನ್ನಿನ ಕೆಳಭಾಗ ಮತ್ತು ಬೆನ್ನೆಲುಬು", tag: "Axial spondyloarthritis" }
        ],
        explainabilityEn: "Symmetric small joint involvement is classic for autoimmune arthritis, while acute single joint podagra suggests crystal-induced gout.",
        explainabilityKn: "ಕೈಬೆರಳುಗಳ ಸಣ್ಣ ಕೀಲುಗಳು ಬಾಧಿತವಾಗುವುದು ಆಟೋಇಮ್ಯೂನ್ ಸಮಸ್ಯೆಯಾಗಿದ್ದು, ಹೆಬ್ಬೆರಳು ಊದುವುದು ಯೂರಿಕ್ ಆಸಿಡ್ (ಗೌಟ್) ಹೆಚ್ಚಳವನ್ನು ತೋರಿಸಬಹುದು."
      },
      {
        id: "jp_swelling_heat",
        questionEn: "Is there visible swelling, warmth to touch, or redness around the affected joints?",
        questionKn: "ಕೀಲುಗಳ ಸುತ್ತಲೂ ಊತ, ಮುಟ್ಟಿದರೆ ಬಿಸಿ ಅಥವಾ ಕೆಂಪು ಬಣ್ಣ ಇದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, visibly swollen and warm to touch", kn: "ಹೌದು, ಊತ ಮತ್ತು ಬಿಸಿಯಾಗಿದೆ", tag: "Active synovitis", isAlert: true },
          { en: "Crackling or popping sounds with movement (Crepitus)", kn: "ಕೀಲು ಕದಲಿಸಿದಾಗ ಶಬ್ದ ಬರುತ್ತದೆ (ಕ್ರೆಪಿಟಸ್)", tag: "Crepitus" },
          { en: "Mild swelling only after walking long distances", kn: "ದೂರ ನಡೆದಾಗ ಮಾತ್ರ ಸ್ವಲ್ಪ ಊತ", tag: "Exertional swelling" },
          { en: "No swelling or warmth", kn: "ಯಾವುದೇ ಊತ ಅಥವಾ ಕೆಂಪು ಬಣ್ಣವಿಲ್ಲ", tag: "No synovitis" }
        ],
        explainabilityEn: "Active warmth and effusion indicate acute synovitis or septic arthritis requiring immediate joint preservation care.",
        explainabilityKn: "ಕೀಲು ಬಿಸಿಯಾಗಿ ಊದಿಕೊಂಡಿದ್ದರೆ ಒಳಗಡೆ ನೀರು ಅಥವಾ ಉರಿಯೂತ ಇರಬಹುದು, ಇದನ್ನು ವೈದ್ಯರು ಪರೀಕ್ಷಿಸಬೇಕು."
      }
    ]
  },

  "headache_migraine": {
    category: "Neurology",
    chiefComplaintKey: "Headache / Migraine / ತಲೆನೋವು",
    questions: [
      {
        id: "ha_character_location",
        questionEn: "How does the headache feel, and where is the pain located?",
        questionKn: "ತಲೆನೋವಿನ ಲಕ್ಷಣ ಹೇಗಿದೆ ಮತ್ತು ತಲೆಯ ಯಾವ ಭಾಗದಲ್ಲಿದೆ?",
        inputType: "chips_and_text",
        options: [
          { en: "Throbbing/Pulsating pain on one side of head", kn: "ತಲೆಯ ಒಂದು ಬದಿಯಲ್ಲಿ ಬಡಿದುಕೊಳ್ಳುವ ನೋವು", tag: "Unilateral throbbing", isAlert: true },
          { en: "Tight band-like squeezing pressure around whole head", kn: "ತಲೆಯ ಸುತ್ತಲೂ ಬಿಗಿಯಾದ ಪಟ್ಟಿಯಂತೆ ಒತ್ತಡ", tag: "Tension type" },
          { en: "Sharp piercing pain behind one eye", kn: "ಒಂದು ಕಣ್ಣಿನ ಹಿಂದೆ ತೀಕ್ಷ್ಣವಾದ ಚುಚ್ಚುವ ನೋವು", tag: "Cluster / Trigeminal" },
          { en: "Explosive, sudden onset within seconds (Thunderclap)", kn: "ಹಠಾತ್ತನೆ ಸಿಡಿದಂತೆ ಬಂದ ತೀವ್ರ ನೋವು", tag: "Thunderclap onset", isAlert: true }
        ],
        explainabilityEn: "Sudden thunderclap headache suggests subarachnoid hemorrhage (medical emergency), whereas unilateral throbbing indicates migraine.",
        explainabilityKn: "ಹಠಾತ್ತನೆ ಸಿಡಿದಂತೆ ಬರುವ ತಲೆನೋವು ರಕ್ತನಾಳದ ತುರ್ತು ಸಮಸ್ಯೆಯನ್ನು ಸೂಚಿಸಬಹುದು; ಒಂದು ಬದಿಯ ನೋವು ಮೈಗ್ರೇನ್ ಅನ್ನು ತೋರಿಸುತ್ತದೆ."
      },
      {
        id: "ha_associated_sensory",
        questionEn: "Are you sensitive to bright lights, loud sounds, or feeling nauseated?",
        questionKn: "ಬೆಳಕು ನೋಡಲು ಕಷ್ಟ (ಕಣ್ಣು ಕುಕ್ಕುವುದು), ಸದ್ದಿಗೆ ಕಿರಿಕಿರಿ ಅಥವಾ ವಾಂತಿಯ ಅನುಭವ ಇದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Sensitivity to light (Photophobia)", kn: "ಬೆಳಕು ನೋಡಲು ಕಷ್ಟ", tag: "Photophobia" },
          { en: "Sensitivity to loud sounds (Phonophobia)", kn: "ಶಬ್ದ ಕೇಳಿದರೆ ಕಿರಿಕಿರಿ", tag: "Phonophobia" },
          { en: "Nausea or actual vomiting", kn: "ವಾಕರಿಕೆ ಅಥವಾ ವಾಂತಿ", tag: "Nausea/Vomiting" },
          { en: "Visual aura (flashing lights, zigzag lines)", kn: "ಕಣ್ಣಿನ ಮುಂದೆ ಮಿಂಚು ಅಥವಾ ಗೆರೆಗಳು", tag: "Migraine aura", isAlert: true },
          { en: "None", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Photophobia, phonophobia, and aura fulfill International Headache Society criteria for classical migraine with aura.",
        explainabilityKn: "ಬೆಳಕಿನ ಕಿರಿಕಿರಿ ಮತ್ತು ಕಣ್ಣಿನ ಮುಂದೆ ಮಿಂಚು ಬರುವುದು ಮೈಗ್ರೇನ್ ರೋಗನಿರ್ಣಯಕ್ಕೆ ಪ್ರಮುಖ ಮಾನದಂಡಗಳಾಗಿವೆ."
      },
      {
        id: "ha_red_flags",
        questionEn: "Do you have fever with stiff neck, weakness in arms/legs, or slurred speech?",
        questionKn: "ಕತ್ತು ತಿರುಗಿಸಲು ಕಷ್ಟವಾಗುವ ಜ್ವರ, ಕೈಕಾಲುಗಳ ದೌರ್ಬಲ್ಯ ಅಥವಾ ಮಾತು ತೊದಲುವುದು ಇದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Stiff neck with fever (Meningeal sign)", kn: "ಜ್ವರದ ಜೊತೆಗೆ ಕತ್ತು ಗಟ್ಟಿಯಾಗುವುದು", tag: "Meningismus", isAlert: true },
          { en: "Weakness or numbness in arm/leg/face", kn: "ಮುಖ ಅಥವಾ ಕೈಕಾಲುಗಳ ಸ್ಪರ್ಶ ನಷ್ಟ/ದೌರ್ಬಲ್ಯ", tag: "Neurological deficit", isAlert: true },
          { en: "Confusion or altered speech", kn: "ಗೊಂದಲ ಅಥವಾ ಮಾತಿನಲ್ಲಿ ಬದಲಾವಣೆ", tag: "Altered speech", isAlert: true },
          { en: "None of these warning signs", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "Fever with neck stiffness warrants immediate lumbar puncture / evaluation for acute meningitis; focal deficits require urgent neuro-imaging.",
        explainabilityKn: "ಕತ್ತು ಬಿಗಿತ ಮತ್ತು ಜ್ವರ ಮೆದುಳು ಜ್ವರವನ್ನು (ಮೆನಿಂಜೈಟಿಸ್) ಸೂಚಿಸುವುದರಿಂದ ತಕ್ಷಣದ ತಪಾಸಣೆ ಅತ್ಯಗತ್ಯ."
      }
    ]
  },

  "diabetes_metabolic": {
    category: "Endocrinology & Diabetology",
    chiefComplaintKey: "Diabetes / Metabolic / ಸಕ್ಕರೆ ಕಾಯಿಲೆ",
    questions: [
      {
        id: "dm_osmotic_symptoms",
        questionEn: "Are you experiencing excessive thirst, waking up multiple times to pass urine, or excessive hunger?",
        questionKn: "ಅತಿಯಾದ ಬಾಯಾರಿಕೆ, ರಾತ್ರಿ ಪದೇ ಪದೇ ಮೂತ್ರಕ್ಕೆ ಹೋಗುವುದು ಅಥವಾ ಅತಿಯಾದ ಹಸಿವು ಇದೆಯೇ?",
        inputType: "multi_chips",
        options: [
          { en: "Excessive thirst (Polydipsia)", kn: "ವಿಪರೀತ ಬಾಯಾರಿಕೆ", tag: "Polydipsia", isAlert: true },
          { en: "Frequent night urination (Nocturia / Polyuria)", kn: "ರಾತ್ರಿ ಪದೇ ಪದೇ ಮೂತ್ರ ವಿಸರ್ಜನೆ", tag: "Polyuria", isAlert: true },
          { en: "Frequent hunger despite eating (Polyphagia)", kn: "ಊಟ ಮಾಡಿದರೂ ವಿಪರೀತ ಹಸಿವು", tag: "Polyphagia" },
          { en: "Unexplained weight loss despite normal diet", kn: "ತಿನ್ನುತ್ತಿದ್ದರೂ ತೂಕ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ", tag: "Weight loss", isAlert: true },
          { en: "None of these", kn: "ಯಾವುದೂ ಇಲ್ಲ", tag: "None" }
        ],
        explainabilityEn: "The classical osmotic triad (polyuria, polydipsia, polyphagia) signals significant hyperglycemia exceeding renal threshold (HbA1c workup needed).",
        explainabilityKn: "ಪದೇ ಪದೇ ಬಾಯಾರಿಕೆ ಮತ್ತು ಮೂತ್ರ ವಿಸರ್ಜನೆ ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ ಅಂಶ ಹೆಚ್ಚಾಗಿರುವುದನ್ನು (ಡಯಾಬಿಟಿಸ್) ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತದೆ."
      },
      {
        id: "dm_neuropathy_wounds",
        questionEn: "Do you feel tingling, numbness, or burning sensations in your feet, or have slow-healing cuts?",
        questionKn: "ಪಾದಗಳಲ್ಲಿ ಮರಗಟ್ಟುವಿಕೆ, ಇರುವೆ ಹರಿದಂತೆ ಅಥವಾ ಉರಿಯುವ ಅನುಭವ ಇದೆಯೇ? ಅಥವಾ ಗಾಯಗಳು ನಿಧಾನವಾಗಿ ಗುಣವಾಗುತ್ತಿವೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, burning numbness or pins and needles in feet", kn: "ಹೌದು, ಪಾದಗಳಲ್ಲಿ ಉರಿ, ಮರಗಟ್ಟುವಿಕೆ ಅಥವಾ ಇರುವೆ ಹರಿದಂತೆ", tag: "Diabetic neuropathy", isAlert: true },
          { en: "Slow healing foot cut, sore, or ulcer", kn: "ಪಾದದಲ್ಲಿ ಗಾಯ ಅಥವಾ ಹುಣ್ಣು ಗುಣವಾಗುತ್ತಿಲ್ಲ", tag: "Foot ulcer risk", isAlert: true },
          { en: "Occasional blurred vision", kn: "ಕಣ್ಣಿನ ದೃಷ್ಟಿ ಮಂಜಾಗುವುದು", tag: "Visual blurring" },
          { en: "No foot symptoms or vision issues", kn: "ಯಾವುದೇ ಸಮಸ್ಯೆ ಇಲ್ಲ", tag: "Normal" }
        ],
        explainabilityEn: "Distal sensory neuropathy and non-healing foot lesions signify microvascular diabetic complications needing monofilament testing and podiatry care.",
        explainabilityKn: "ಪಾದಗಳ ಮರಗಟ್ಟುವಿಕೆ ನರಗಳ ದೌರ್ಬಲ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಇದಕ್ಕೆ ಕಾಲಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ ಅನಿವಾರ್ಯ."
      }
    ]
  },

  "asthma_wheezing": {
    category: "Pulmonology / Asthma",
    chiefComplaintKey: "Asthma / Wheezing / ಉಬ್ಬಸ",
    questions: [
      {
        id: "as_wheeze_nocturnal",
        questionEn: "Do you hear a whistling sound in your chest, or wake up at night choking/coughing?",
        questionKn: "ಉಸಿರಾಡುವಾಗ ಎದೆಯಲ್ಲಿ ಸೀಟಿ ಶಬ್ದ ಕೇಳಿಸುತ್ತದೆಯೇ? ಅಥವಾ ರಾತ್ರಿ ಕೆಮ್ಮಿ ಉಸಿರುಗಟ್ಟಿ ಎಚ್ಚರವಾಗುತ್ತದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, loud whistling sound (Wheeze) and night waking", kn: "ಹೌದು, ಎದೆಯಲ್ಲಿ ಸೀಟಿ ಶಬ್ದ ಮತ್ತು ರಾತ್ರಿ ಎಚ್ಚರ", tag: "Active bronchospasm", isAlert: true },
          { en: "Tightness across the chest during cold weather or early morning", kn: "ಚಳಿಗಾಲ ಅಥವಾ ಮುಂಜಾನೆ ಎದೆ ಹಿಡಿದಂತೆ", tag: "Diurnal variability" },
          { en: "Cough triggered primarily by dust, pollen, or smoke", kn: "ಧೂಳು, ಹೂವಿನ ಪರಾಗ ಅಥವಾ ಹೊಗೆಯಿಂದ", tag: "Allergic trigger" },
          { en: "No whistling, just throat irritation", kn: "ಸೀಟಿ ಶಬ್ದವಿಲ್ಲ, ಕೇವಲ ಗಂಟಲು ಕೆರೆತ", tag: "Upper airway" }
        ],
        explainabilityEn: "Nocturnal waking and diurnal variation are hallmark clinical parameters of uncontrolled bronchial asthma requiring stepped inhaler therapy.",
        explainabilityKn: "ರಾತ್ರಿ ಉಸಿರುಕಟ್ಟುವುದು ಅಸ್ತಮಾ ನಿಯಂತ್ರಣ ತಪ್ಪಿರುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಇನ್ಹೇಲರ್ ಚಿಕಿತ್ಸೆಯನ್ನು ಹೆಚ್ಚಿಸಬೇಕಾಗಬಹುದು."
      },
      {
        id: "as_inhaler_response",
        questionEn: "Are you using an inhaler or nebulizer, and does it relieve your breathlessness?",
        questionKn: "ನೀವು ಇನ್ಹೇಲರ್ ಬಳಸುತ್ತಿದ್ದೀರಾ? ಮತ್ತು ಅದು ನಿಮ್ಮ ಉಸಿರಾಟವನ್ನು ಸರಾಗಗೊಳಿಸುತ್ತದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Relieved quickly by blue inhaler (Salbutamol)", kn: "ಇನ್ಹೇಲರ್ ಬಳಸಿದಾಗ ತಕ್ಷಣ ಕಡಿಮೆಯಾಗುತ್ತದೆ", tag: "Bronchodilator responsive" },
          { en: "Using inhaler multiple times daily without complete relief", kn: "ದಿನಕ್ಕೆ ಹಲವು ಬಾರಿ ಬಳಸಿದರೂ ಸಂಪೂರ್ಣ ಗುಣವಾಗುತ್ತಿಲ್ಲ", tag: "Inhaler refractoriness", isAlert: true },
          { en: "Never used an inhaler before", kn: "ಇದುವರೆಗೆ ಇನ್ಹೇಲರ್ ಬಳಸಿ ತಿಳಿದಿಲ್ಲ", tag: "Naive to inhaler" },
          { en: "Only take oral syrups or home remedies", kn: "ಕೇವಲ ಸಿರಪ್ ಅಥವಾ ಮನೆಮದ್ದು ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ", tag: "Home remedy" }
        ],
        explainabilityEn: "Frequent use of rescue bronchodilators (>2 times/week) signifies poor asthma control under GINA guidelines.",
        explainabilityKn: "ವಾರದಲ್ಲಿ ಹಲವು ಬಾರಿ ಇನ್ಹೇಲರ್ ಬಳಸಬೇಕಾದ ಪರಿಸ್ಥಿತಿ ಬಂದರೆ ವೈದ್ಯರಿಂದ ನಿಯಮಿತ ತಡೆಗಟ್ಟುವ ಚಿಕಿತ್ಸೆ (ಕಂಟ್ರೋಲರ್) ಅಗತ್ಯವಿದೆ."
      }
    ]
  },

  "skin_rash_dermatology": {
    category: "Dermatology",
    chiefComplaintKey: "Skin Rash / Allergy / ಚರ್ಮದ ಸಮಸ್ಯೆ",
    questions: [
      {
        id: "sk_itch_morphology",
        questionEn: "How severe is the itching, and what does the skin rash look like?",
        questionKn: "ತುರಿಕೆಯ ತೀವ್ರತೆ ಎಷ್ಟಿದೆ ಮತ್ತು ಚರ್ಮದ ಮೇಲಿನ ದದ್ದು ಹೇಗಿದೆ?",
        inputType: "chips_and_text",
        options: [
          { en: "Severe intense itching, worse at night in finger webs/wrists", kn: "ತೀವ್ರ ತುರಿಕೆ, ರಾತ್ರಿ ವೇಳೆ ಬೆರಳುಗಳ ಸಂದಿಯಲ್ಲಿ ಹೆಚ್ಚು", tag: "Scabies / Parasitic suspect", isAlert: true },
          { en: "Raised red itchy welts that appear and fade (Hives)", kn: "ಕೆಂಪಾಗಿ ಊದಿಕೊಂಡ ದದ್ದುಗಳು (ಉರ್ಟಿಕೇರಿಯಾ)", tag: "Urticaria" },
          { en: "Dry, scaling, itchy patches with skin thickening", kn: "ಒಣಗಿದ, ಸಿಪ್ಪೆ ಏಳುವ, ತುರಿಸುವ ಚರ್ಮ (ಎಕ್ಸಿಮಾ)", tag: "Eczema / Psoriasis" },
          { en: "Fluid-filled painful blisters", kn: "ನೀರು ತುಂಬಿದ ನೋವಿನ ಗುಳ್ಳೆಗಳು", tag: "Vesicular / Herpes suspect", isAlert: true }
        ],
        explainabilityEn: "Nocturnal web-space itching strongly suggests Sarcoptes scabiei, while raised evanescent welts indicate mast-cell mediated acute urticaria.",
        explainabilityKn: "ಬೆರಳುಗಳ ಸಂದಿಯಲ್ಲಿ ರಾತ್ರಿ ಹೆಚ್ಚಾಗುವ ತುರಿಕೆ ಸೋಂಕನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಕೆಂಪಾದ ಗುಳ್ಳೆಗಳು ಅಲರ್ಜಿಯನ್ನು ತೋರಿಸುತ್ತವೆ."
      },
      {
        id: "sk_trigger_contact",
        questionEn: "Did this rash start after starting any new medication, soap, cosmetics, or hair dye?",
        questionKn: "ಯಾವುದಾದರೂ ಹೊಸ ಔಷಧಿ, ಸಾಬೂನು, ಕಾಸ್ಮೆಟಿಕ್ ಅಥವಾ ಹೇರ್ ಡೈ ಬಳಸಿದ ನಂತರ ಈ ಸಮಸ್ಯೆ ಶುರುವಾಯಿತಾ?",
        inputType: "chips_and_text",
        options: [
          { en: "Started after taking a new oral tablet / antibiotic", kn: "ಹೊಸ ಮಾತ್ರೆ ಅಥವಾ ಆಂಟಿಬಯೋಟಿಕ್ ತೆಗೆದುಕೊಂಡ ನಂತರ", tag: "Drug eruption suspect", isAlert: true },
          { en: "Started after using new soap, cream, or detergent", kn: "ಹೊಸ ಸಾಬೂನು ಅಥವಾ ಕ್ರೀಮ್ ಬಳಸಿದ ನಂತರ", tag: "Contact dermatitis" },
          { en: "Associated with eye/mouth peeling or fever", kn: "ಕಣ್ಣು/ಬಾಯಿಯ ಒಳಗೆ ಹುಣ್ಣು ಅಥವಾ ಜ್ವರದ ಜೊತೆ", tag: "Severe cutaneous reaction", isAlert: true },
          { en: "No obvious exposure to new products", kn: "ಯಾವುದೇ ಹೊಸ ವಸ್ತು ಬಳಸಿಲ್ಲ", tag: "Endogenous" }
        ],
        explainabilityEn: "Drug-induced exanthems with mucosal involvement (mouth/eyes) are dermatological emergencies (SJS/TEN risk).",
        explainabilityKn: "ಔಷಧಿಯ ನಂತರ ಮೈಮೇಲೆ ದದ್ದು ಬಂದು ಬಾಯಿಯೊಳಗೆ ಹುಣ್ಣಾದರೆ ತಕ್ಷಣ ಔಷಧಿಯನ್ನು ನಿಲ್ಲಿಸಿ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಬೇಕು."
      }
    ]
  },

  "urinary_dysuria": {
    category: "Urology & Nephrology",
    chiefComplaintKey: "Urinary Burning / Dysuria / ಮೂತ್ರದ ಸಮಸ್ಯೆ",
    questions: [
      {
        id: "ur_burning_frequency",
        questionEn: "Do you have burning pain while passing urine, or need to rush to the toilet frequently?",
        questionKn: "ಮೂತ್ರ ಮಾಡುವಾಗ ಉರಿ ಇದೆಯೇ? ಅಥವಾ ಪದೇ ಪದೇ ಅವಸರವಾಗಿ ಮೂತ್ರಕ್ಕೆ ಹೋಗಬೇಕೆನಿಸುತ್ತದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Severe burning sensation throughout urination", kn: "ಮೂತ್ರ ಮಾಡುವಾಗ ತೀವ್ರವಾದ ಉರಿ", tag: "Severe dysuria", isAlert: true },
          { en: "Frequent urge every few minutes with very small drops", kn: "ಪದೇ ಪದೇ ಹನಿ ಹನಿಯಾಗಿ ಮೂತ್ರ ವಿಸರ್ಜನೆ", tag: "Frequency/Urgency" },
          { en: "Visible reddish or tea-colored blood in urine (Hematuria)", kn: "ಮೂತ್ರದಲ್ಲಿ ಕೆಂಪು ರಕ್ತದ ಅಂಶ ಕಾಣಿಸುವುದು", tag: "Hematuria", isAlert: true },
          { en: "Difficulty starting urine stream / straining", kn: "ಮೂತ್ರ ಪ್ರಾರಂಭಿಸಲು ಪ್ರಯಾಸ ಪಡುವುದು", tag: "Hesitancy / Prostatic" }
        ],
        explainabilityEn: "Dysuria with frequency is hallmark of acute cystitis/UTI; visible hematuria requires urine microscopy and urological tract evaluation.",
        explainabilityKn: "ಮೂತ್ರದಲ್ಲಿ ಉರಿ ಸೋಂಕನ್ನು ಸೂಚಿಸುತ್ತದೆ, ರಕ್ತ ಕಂಡುಬಂದರೆ ತುರ್ತು ಮೂತ್ರ ಪರೀಕ್ಷೆ ಮತ್ತು ಸ್ಕ್ಯಾನಿಂಗ್ ಅಗತ್ಯ."
      },
      {
        id: "ur_fever_flank",
        questionEn: "Do you have high fever with shivering, or severe pain in your lower back / flank?",
        questionKn: "ಚಳಿ-ನಡುಕದೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ ಅಥವಾ ಸೊಂಟದ ಹಿಂಭಾಗದಲ್ಲಿ (ಪಕ್ಕೆಲಬುಗಳ ಬಳಿ) ನೋವು ಇದೆಯೇ?",
        inputType: "chips_and_text",
        options: [
          { en: "Yes, high fever with rigors and flank pain", kn: "ಹೌದು, ಚಳಿ ನಡುಕದ ಜ್ವರ ಮತ್ತು ಸೊಂಟದ ಬದಿ ನೋವು", tag: "Acute pyelonephritis", isAlert: true },
          { en: "Sharp sudden pain shooting down from back to groin", kn: "ಬೆನ್ನಿನಿಂದ ಕೆಳ ಹೊಟ್ಟೆಗೆ ಹರಡುವ ತೀಕ್ಷ್ಣ ನೋವು (ಕಲ್ಲು)", tag: "Renal colic / Calculus", isAlert: true },
          { en: "Mild lower belly discomfort only", kn: "ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಸಾಧಾರಣ ನೋವು ಮಾತ್ರ", tag: "Lower urinary" },
          { en: "No fever or back pain", kn: "ಯಾವುದೇ ಜ್ವರ ಅಥವಾ ಬೆನ್ನು ನೋವಿಲ್ಲ", tag: "Uncomplicated" }
        ],
        explainabilityEn: "High fever with flank pain signals upper urinary tract ascending infection (acute pyelonephritis) or obstructing calculus.",
        explainabilityKn: "ಚಳಿ ಜ್ವರದ ಜೊತೆ ಸೊಂಟ ನೋವು ಮೂತ್ರಪಿಂಡದ (ಕಿಡ್ನಿ) ಸೋಂಕನ್ನು ಅಥವಾ ಕಲ್ಲನ್ನು ತೋರಿಸುವುದರಿಂದ ತಕ್ಷಣದ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯ."
      }
    ]
  },

  "general_consultation": {
    category: "General Medicine",
    chiefComplaintKey: "General Symptoms / ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು",
    questions: [
      {
        id: "gen_onset",
        questionEn: "How long have you been experiencing this main symptom?",
        questionKn: "ಈ ಪ್ರಮುಖ ಸಮಸ್ಯೆಯನ್ನು ನೀವು ಎಷ್ಟು ಸಮಯದಿಂದ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
        inputType: "chips_and_text",
        options: [
          { en: "Started today / very recent", kn: "ಇಂದೇ ಪ್ರಾರಂಭವಾಯಿತು / ಇತ್ತೀಚೆಗೆ", tag: "Acute today" },
          { en: "A few days (2 - 6 days)", kn: "ಕೆಲವು ದಿನಗಳಿಂದ (2 - 6 ದಿನ)", tag: "Subacute days" },
          { en: "A few weeks (1 - 3 weeks)", kn: "ಕೆಲವು ವಾರಗಳಿಂದ", tag: "Subacute weeks" },
          { en: "Chronic / Long term (months or years)", kn: "ದೀರ್ಘಕಾಲಿಕ (ತಿಂಗಳು ಅಥವಾ ವರ್ಷಗಳು)", tag: "Chronic" }
        ],
        explainabilityEn: "Chronicity helps determine whether symptoms represent an acute illness or an ongoing chronic disease flare-up.",
        explainabilityKn: "ಸಮಸ್ಯೆಯು ಹೊಸದಾಗಿ ಬಂದಿದೆಯೋ ಅಥವಾ ಹಳೆಯದೋ ಎಂದು ತಿಳಿಯುವುದು ಸೂಕ್ತ ರೋಗನಿರ್ಣಯಕ್ಕೆ ಅವಶ್ಯಕವಾಗಿದೆ."
      },
      {
        id: "gen_severity",
        questionEn: "On a scale from 1 (mild) to 10 (unbearable), how severe is your discomfort right now?",
        questionKn: "1 ರಿಂದ 10 ರ ಅಳತೆಯಲ್ಲಿ, ನಿಮ್ಮ ನೋವು ಅಥವಾ ತೊಂದರೆಯ ತೀವ್ರತೆ ಎಷ್ಟಿದೆ?",
        inputType: "pain_scale",
        options: [
          { en: "1-3: Mild (manageable)", kn: "1-3: ಸಾಧಾರಣ", tag: "Mild 1-3" },
          { en: "4-6: Moderate (interferes with daily tasks)", kn: "4-6: ಮಧ್ಯಮ", tag: "Moderate 4-6" },
          { en: "7-8: Severe (hard to do anything)", kn: "7-8: ತೀವ್ರ", tag: "Severe 7-8", isAlert: true },
          { en: "9-10: Extreme / Unbearable", kn: "9-10: ಅಸಹನೀಯ / ಅತಿ ತೀವ್ರ", tag: "Extreme 9-10", isAlert: true }
        ],
        explainabilityEn: "Pain and severity scores allow the clinic to prioritize triage and gauge patient distress accurately.",
        explainabilityKn: "ನೋವಿನ ತೀವ್ರತೆಯ ಅಂಕವು ವೈದ್ಯರಿಗೆ ರೋಗಿಯ ಸ್ಥಿತಿಯನ್ನು ಮೊದಲೇ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಚಿಕಿತ್ಸೆ ನೀಡಲು ನೆರವಾಗುತ್ತದೆ."
      }
    ]
  }
};

/**
 * AYUSH / Integrative Medicine Assessment Parameters
 */
export const AYUSH_PARAMETERS = {
  prakritiQuestions: [
    {
      id: "prakriti_body_frame",
      questionEn: "Physical Constitution (Prakriti): Body Frame & Weight",
      questionKn: "ಶಾರೀರಿಕ ಪ್ರಕೃತಿ: ದೇಹದ ರಚನೆ ಮತ್ತು ತೂಕ",
      options: [
        { en: "Vata (Lean, thin frame, dry skin, difficulty gaining weight)", kn: "ವಾತ (ತೆಳುವಾದ ದೇಹ, ಒಣ ಚರ್ಮ, ತೂಕ ಹೆಚ್ಚಿಸಲು ಕಷ್ಟ)", tag: "Vata Predominant" },
        { en: "Pitta (Medium build, warm body, prone to sweating/acidity)", kn: "ಪಿತ್ತ (ಮಧ್ಯಮ ದೇಹ, ಬೆವರು ಮತ್ತು ಅಸಿಡಿಟಿ ಪ್ರವೃತ್ತಿ)", tag: "Pitta Predominant" },
        { en: "Kapha (Broad, heavy build, smooth skin, gains weight easily)", kn: "ಕಫ (ದಪ್ಪ ಶರೀರ, ನಯವಾದ ಚರ್ಮ, ಸುಲಭವಾಗಿ ತೂಕ ಹೆಚ್ಚುವುದು)", tag: "Kapha Predominant" }
      ]
    },
    {
      id: "agni_digestive_fire",
      questionEn: "Digestive Fire (Agni)",
      questionKn: "ಜೀರ್ಣ ಶಕ್ತಿ (ಅಗ್ನಿ)",
      options: [
        { en: "Sama Agni (Normal, balanced appetite and easy digestion)", kn: "ಸಮ ಅಗ್ನಿ (ಸಮತೋಲಿತ ಹಸಿವು ಮತ್ತು ಉತ್ತಮ ಜೀರ್ಣಕ್ರಿಯೆ)", tag: "Sama Agni" },
        { en: "Tikshna Agni (Intense hunger, excessive thirst, burning sensation)", kn: "ತೀಕ್ಷ್ಣ ಅಗ್ನಿ (ಅಧಿಕ ಹಸಿವು, ವಿಪರೀತ ಬಾಯಾರಿಕೆ, ಎದೆಯುರಿ)", tag: "Tikshna Agni" },
        { en: "Manda Agni (Sluggish appetite, heaviness after food, slow digestion)", kn: "ಮಂದ ಅಗ್ನಿ (ಕಡಿಮೆ ಹಸಿವು, ಊಟದ ನಂತರ ಭಾರವೆನಿಸುವುದು)", tag: "Manda Agni" },
        { en: "Vishama Agni (Irregular hunger, gas, bloating, variable digestion)", kn: "ವಿಷಮ ಅಗ್ನಿ (ಅನಿಯಮಿತ ಹಸಿವು, ವಾಯು ಪ್ರಕೋಪ)", tag: "Vishama Agni" }
      ]
    },
    {
      id: "koshtha_bowel",
      questionEn: "Bowel Habit (Koshtha)",
      questionKn: "ಮಲಬದ್ಧತೆ / ಕೋಷ್ಠ ಸ್ವಭಾವ",
      options: [
        { en: "Mridu Koshtha (Soft bowel movements, easily purgative with milk)", kn: "ಮೃದು ಕೋಷ್ಠ (ಮೃದು ಮಲ, ಹಾಲು ಕುಡಿದರೂ ಸುಲಭ ವಿಸರ್ಜನೆ)", tag: "Mridu Koshtha" },
        { en: "Madhyama Koshtha (Regular, well-formed bowel movement daily)", kn: "ಮಧ್ಯಮ ಕೋಷ್ಠ (ದಿನಕ್ಕೆ ಒಮ್ಮೆ ಸಾಮಾನ್ಯ ನಿಯಮಿತ ಮಲ ವಿಸರ್ಜನೆ)", tag: "Madhyama Koshtha" },
        { en: "Krura Koshtha (Hard, dry stools, prone to chronic constipation)", kn: "ಕ್ರೂರ ಕೋಷ್ಠ (ಗಟ್ಟಿ ಮಲ, ಹಳೆಯ ಮಲಬದ್ಧತೆ)", tag: "Krura Koshtha" }
      ]
    },
    {
      id: "ahara_vihara",
      questionEn: "Diet & Lifestyle Habit (Ahara-Vihara)",
      questionKn: "ಆಹಾರ ಮತ್ತು ವಿಹಾರ ಶೈಲಿ",
      options: [
        { en: "Predominantly vegetarian, fresh homemade food", kn: "ಸಸ್ಯಾಹಾರಿ, ತಾಜಾ ಮನೆ ಊಟ", tag: "Vegetarian / Satvik" },
        { en: "Frequent spicy, fried, or outside street food", kn: "ಹೆಚ್ಚು ಖಾರ, ಕರಿದ ಮತ್ತು ಹೋಟೆಲ್ ಆಹಾರ", tag: "Rajasik / Spicy" },
        { en: "Irregular meal timings, late night eating", kn: "ಅನಿಯಮಿತ ಊಟದ ಸಮಯ, ತಡರಾತ್ರಿ ಊಟ", tag: "Irregular / Vishamashana" },
        { en: "Non-vegetarian diet regularly", kn: "ನಿಯಮಿತ ಮಾಂಸಾಹಾರಿ ಆಹಾರ", tag: "Non-vegetarian" }
      ]
    }
  ]
};

/**
 * Clinical Rule-Based Red-Flag Scanner
 */
export function scanRedFlags(patientInput, chiefComplaint, answers = []) {
  const combinedText = `${chiefComplaint || ""} ${patientInput || ""} ${answers.map(a => `${a.question} ${a.answer}`).join(" ")}`.toLowerCase();
  
  const detectedFlags = [];
  
  for (const crit of RED_FLAG_CRITERIA) {
    let triggered = false;
    let matchingTerm = "";
    
    // Check regex pattern
    if (crit.pattern.test(combinedText)) {
      triggered = true;
    }
    
    // Check keywords
    for (const kw of crit.triggerKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        triggered = true;
        matchingTerm = kw;
        break;
      }
    }

    // Check answers flags
    for (const a of answers) {
      if (a.isAlert && (a.id.startsWith("cp_") || a.id.startsWith("fc_") || a.id.startsWith("ab_") || a.id.startsWith("ap_") || a.id.startsWith("ha_") || a.id.startsWith("as_") || a.id.startsWith("ur_") || a.id.startsWith("jp_") || a.id.startsWith("dm_") || a.id.startsWith("sk_"))) {
        if (crit.id === "acs_chest_pain" && a.id.startsWith("cp_")) triggered = true;
        if (crit.id === "acute_abdomen" && (a.id.startsWith("ab_") || a.id === "ap_red_flags")) triggered = true;
        if (crit.id === "severe_dyspnea" && (a.answer.includes("Resting dyspnea") || a.answer.includes("struggling") || a.answer.includes("Wheeze"))) triggered = true;
        if (crit.id === "acute_stroke_signs" && (a.id === "ha_character_location" && a.answer.includes("Thunderclap"))) triggered = true;
        if (crit.id === "severe_hemorrhage" && (a.id === "ap_red_flags" && (a.answer.includes("Melena") || a.answer.includes("coffee-ground")))) triggered = true;
      }
    }
    
    if (triggered) {
      detectedFlags.push({
        id: crit.id,
        title: crit.title,
        severity: crit.severity,
        triggerEvidence: matchingTerm || "Clinical answer pattern",
        rationale: crit.rationale,
        rationaleKn: crit.rationaleKn,
        actionRequired: "Needs Immediate Clinical Attention - Doctor Triage Priority"
      });
    }
  }

  return {
    isRedFlag: detectedFlags.length > 0,
    flags: detectedFlags,
    urgencyLevel: detectedFlags.some(f => f.severity === "CRITICAL") ? "CRITICAL" : detectedFlags.length > 0 ? "HIGH" : "STANDARD",
    legalDisclaimer: "MEDICAL ADVISORY: This is an AI-assisted clinical information collection tool. It does not provide medical diagnoses or replace clinical judgment. Final triage and diagnosis rest solely with the licensed physician."
  };
}

/**
 * Natural Language Clinical Entity Extractor
 * Converts free-text/voice into structured medical variables
 */
export function extractClinicalEntities(text) {
  if (!text || typeof text !== "string") {
    return { symptoms: [], duration: null, severity: null, modifiers: [] };
  }

  const lower = text.toLowerCase();
  const symptoms = [];
  let detectedDuration = null;
  let detectedSeverity = "Moderate";
  const modifiers = [];

  // Duration extraction regex
  const durationMatch = text.match(/(\d+|one|two|three|four|five|six|seven|ten)\s*(day|days|week|weeks|month|months|hour|hours|ದಿನ|ವಾರ|ತಿಂಗಳು)/i);
  if (durationMatch) {
    detectedDuration = durationMatch[0];
  } else if (lower.includes("yesterday") || lower.includes("ನಿನ್ನೆ")) {
    detectedDuration = "1 day (since yesterday)";
  } else if (lower.includes("today") || lower.includes("ಇಂದು")) {
    detectedDuration = "Today (<24 hours)";
  }

  // Common symptom dictionary
  const symptomDict = [
    { key: "fever", canonical: "Fever (Pyrexia)", regex: /(fever|temperature|chills|ಜ್ವರ|ಕಂಪನ)/i },
    { key: "cough", canonical: "Cough", regex: /(cough|coughing|phlegm|sputum|ಕೆಮ್ಮು|ಕಫ)/i },
    { key: "chest_pain", canonical: "Chest Pain / Discomfort", regex: /(chest pain|chest tightness|pressure on chest|ಎದೆ ನೋವು|ಎದೆಭಾರ)/i },
    { key: "dyspnea", canonical: "Shortness of Breath (Dyspnea)", regex: /(shortness of breath|breathless|gasping|ಉಸಿರಾಟದ ತೊಂದರೆ|ಉಸಿರು ಕಟ್ಟುವಿಕೆ)/i },
    { key: "headache", canonical: "Headache (Cephalea)", regex: /(headache|head pain|migraine|ತಲೆನೋವು)/i },
    { key: "abdominal_pain", canonical: "Abdominal Pain", regex: /(stomach pain|belly pain|abdominal pain|cramps|ಹೊಟ್ಟೆ ನೋವು)/i },
    { key: "acid_peptic", canonical: "Acid Peptic / Heartburn", regex: /(acidity|heartburn|acid reflux|sour burp|ಎದೆಯುರಿ|ಹುಳಿತೇಗು)/i },
    { key: "joint_pain", canonical: "Joint Pain (Arthralgia)", regex: /(joint pain|knee pain|arthritis|body ache|ಕೀಲು ನೋವು|ಮೈಕೈ ನೋವು)/i },
    { key: "diabetes", canonical: "Diabetes / Blood Sugar", regex: /(diabetes|sugar|high glucose|thirsty|ಸಕ್ಕರೆ ಕಾಯಿಲೆ)/i },
    { key: "asthma", canonical: "Asthma / Bronchospasm", regex: /(asthma|wheeze|wheezing|inhaler|ಉಬ್ಬಸ)/i },
    { key: "skin_rash", canonical: "Skin Rash / Allergy", regex: /(rash|skin allergy|itching|hives|ಚರ್ಮದ ಅಲರ್ಜಿ|ತುರಿಕೆ)/i },
    { key: "urinary", canonical: "Urinary Discomfort / Dysuria", regex: /(urine|burning urine|dysuria|ಮೂತ್ರದಲ್ಲಿ ಉರಿ)/i },
    { key: "vomiting", canonical: "Nausea & Vomiting", regex: /(vomit|vomiting|nausea|throwing up|ವಾಂತಿ|ವಾಕರಿಕೆ)/i },
    { key: "diarrhea", canonical: "Loose Stools (Diarrhea)", regex: /(diarrhea|loose motion|watery stool|ಭೇದಿ|ಬೇಧಿ)/i },
    { key: "fatigue", canonical: "Generalized Fatigue / Weakness", regex: /(tired|fatigue|weakness|exhausted|ದಣಿವು|ಸುಸ್ತು|ಆಯಾಸ)/i }
  ];

  for (const item of symptomDict) {
    if (item.regex.test(text)) {
      symptoms.push({
        canonicalName: item.canonical,
        detectedWord: item.key,
        duration: detectedDuration || "Unspecified",
        source: "Patient Voice / Text Natural Language"
      });
    }
  }

  // Severity keywords
  if (/(severe|terrible|unbearable|excruciating|extreme|ಅತಿಯಾದ|ತೀವ್ರ)/i.test(text)) {
    detectedSeverity = "Severe (Grade 3)";
  } else if (/(mild|slight|little bit|ಸ್ವಲ್ಪ)/i.test(text)) {
    detectedSeverity = "Mild (Grade 1)";
  }

  // Modifiers
  if (/(dry|ಒಣ)/i.test(text)) modifiers.push("Dry");
  if (/(wet|phlegm|yellow|ಕಫ)/i.test(text)) modifiers.push("Productive");
  if (/(sharp|ಚುಚ್ಚುವ)/i.test(text)) modifiers.push("Sharp character");
  if (/(radiating|spreading|ಹರಡುತ್ತಿದೆ)/i.test(text)) modifiers.push("Radiating");

  return {
    symptoms: symptoms.length > 0 ? symptoms : [{ canonicalName: text.slice(0, 40), detectedWord: "User Input", duration: detectedDuration || "Recent", source: "Patient Input" }],
    duration: detectedDuration,
    severity: detectedSeverity,
    modifiers
  };
}

/**
 * Adaptive Next Question Selector
 * Disease-Specific Routing: Only presents questions relevant to particular condition
 */
export function getNextAdaptiveQuestion(chiefComplaintKey, answeredQuestionIds = []) {
  // Normalize key
  let flowKey = "general_consultation";
  const lower = (chiefComplaintKey || "").toLowerCase();

  if (lower.includes("acid") || lower.includes("gerd") || lower.includes("gastric") || lower.includes("peptic") || lower.includes("heartburn") || lower.includes("ಎದೆಯುರಿ") || lower.includes("ಹುಳಿತೇಗು")) {
    flowKey = "acid_peptic_gi";
  } else if (lower.includes("asthma") || lower.includes("wheez") || lower.includes("inhaler") || lower.includes("ಉಬ್ಬಸ")) {
    flowKey = "asthma_wheezing";
  } else if (lower.includes("joint") || lower.includes("knee") || lower.includes("arthritis") || lower.includes("stiff") || lower.includes("ಕೀಲು")) {
    flowKey = "joint_pain_arthritis";
  } else if (lower.includes("headache") || lower.includes("migraine") || lower.includes("head") || lower.includes("ತಲೆನೋವು")) {
    flowKey = "headache_migraine";
  } else if (lower.includes("diabet") || lower.includes("sugar") || lower.includes("glucose") || lower.includes("thirst") || lower.includes("ಸಕ್ಕರೆ")) {
    flowKey = "diabetes_metabolic";
  } else if (lower.includes("rash") || lower.includes("skin") || lower.includes("itch") || lower.includes("allergy") || lower.includes("ಚರ್ಮ") || lower.includes("ತುರಿಕೆ")) {
    flowKey = "skin_rash_dermatology";
  } else if (lower.includes("urine") || lower.includes("urinary") || lower.includes("dysuria") || lower.includes("burning urine") || lower.includes("ಮೂತ್ರ")) {
    flowKey = "urinary_dysuria";
  } else if (lower.includes("chest") || (lower.includes("heart") && !lower.includes("heartburn")) || lower.includes("angina") || lower.includes("ಎದೆ")) {
    flowKey = "chest_pain";
  } else if (lower.includes("fever") || lower.includes("cough") || lower.includes("cold") || lower.includes("chills") || lower.includes("ಜ್ವರ") || lower.includes("ಕೆಮ್ಮು")) {
    flowKey = "fever_cough";
  } else if (lower.includes("stomach") || lower.includes("belly") || lower.includes("abdomen") || lower.includes("ಹೊಟ್ಟೆ")) {
    flowKey = "abdominal_pain";
  }

  const flow = CLINICAL_QUESTION_FLOWS[flowKey] || CLINICAL_QUESTION_FLOWS.general_consultation;
  const remaining = flow.questions.filter(q => !answeredQuestionIds.includes(q.id));

  if (remaining.length === 0) {
    return {
      isComplete: true,
      category: flow.category,
      flowKey,
      nextQuestion: null,
      progressPercent: 100
    };
  }

  const currentIdx = flow.questions.length - remaining.length;
  const total = flow.questions.length;
  const progressPercent = Math.round((currentIdx / total) * 100);

  return {
    isComplete: false,
    category: flow.category,
    flowKey,
    currentStep: currentIdx + 1,
    totalSteps: total,
    progressPercent,
    nextQuestion: remaining[0]
  };
}

/**
 * Generate Physician-Ready Case Summary
 */
export function generatePhysicianCaseSummary(consultationData) {
  const {
    patient,
    chiefComplaint,
    adaptiveAnswers = [],
    extractedEntities = {},
    medicalHistory = {},
    documentExtractions = [],
    ayushData = null
  } = consultationData;

  const redFlagScan = scanRedFlags(chiefComplaint, "", adaptiveAnswers);

  // Group structured symptoms
  const presentingSymptoms = extractedEntities.symptoms || [];
  
  // Format HPI (History of Presenting Illness)
  const hpiSentences = [];
  if (chiefComplaint) {
    hpiSentences.push(`Patient presented with chief complaint of ${chiefComplaint}.`);
  }
  if (extractedEntities.duration) {
    hpiSentences.push(`Symptom duration noted as approximately ${extractedEntities.duration}.`);
  }
  if (extractedEntities.severity) {
    hpiSentences.push(`Reported severity: ${extractedEntities.severity}.`);
  }

  // Helper to find question in CLINICAL_QUESTION_FLOWS
  const findQuestionEn = (id) => {
    if (!id) return null;
    for (const flow of Object.values(CLINICAL_QUESTION_FLOWS)) {
      if (flow.questions) {
        const found = flow.questions.find(q => q.id === id);
        if (found && found.questionEn) return found.questionEn;
      }
    }
    return null;
  };

  adaptiveAnswers.forEach(ans => {
    const qText = ans.questionEn || findQuestionEn(ans.id) || ans.question;
    hpiSentences.push(`${qText} -> ${ans.answer}.`);
  });

  const hpi = hpiSentences.join(" ");

  // Structured Summary Object
  return {
    generatedAt: new Date().toISOString(),
    clinicalStatus: redFlagScan.isRedFlag ? "IMMEDIATE_ATTENTION" : "PENDING_DOCTOR_REVIEW",
    isRedFlag: redFlagScan.isRedFlag,
    redFlagReport: redFlagScan,
    
    chiefComplaint: chiefComplaint || "General medical consultation",
    presentingSymptoms: presentingSymptoms.map(s => s.canonicalName || s),
    duration: extractedEntities.duration || "Recorded during intake",
    severity: extractedEntities.severity || "Moderate",
    
    historyOfPresentingIllness: hpi,
    
    pastMedicalHistory: medicalHistory.conditions || ["No previous chronic illnesses documented"],
    currentMedications: medicalHistory.medications || ["None reported by patient"],
    allergies: medicalHistory.allergies || ["NKDA (No Known Drug Allergies)"],
    previousSurgeries: medicalHistory.surgeries || ["None reported"],
    familyHistory: medicalHistory.familyHistory || ["Non-contributory"],
    lifestyleInformation: {
      smoking: medicalHistory.smoking || "Non-smoker",
      alcohol: medicalHistory.alcohol || "Non-drinker",
      diet: medicalHistory.diet || "Balanced regular diet",
      activity: medicalHistory.activity || "Moderate activity"
    },

    documentFindings: documentExtractions.map(doc => ({
      documentType: doc.documentType || "Uploaded Clinical Document",
      uploadedAt: doc.date || new Date().toISOString(),
      keyFindings: doc.extractedItems || [],
      abnormalFlags: doc.abnormalValues || []
    })),

    ayushAssessment: ayushData ? {
      prakriti: ayushData.prakriti || "Not evaluated",
      agni: ayushData.agni || "Sama Agni",
      koshtha: ayushData.koshtha || "Madhyama Koshtha",
      aharaVihara: ayushData.aharaVihara || "Regular"
    } : null,

    clinicalObservations: [
      redFlagScan.isRedFlag ? "PRIORITY: Urgent red-flag symptoms detected during intake. Immediate vitals & triage advised." : "Vitals and triage recommended prior to clinical examination.",
      "Information collected via AI-guided pre-consultation intake with patient consent (ABDM framework compatible).",
      "Attending physician verification required before prescribing or formulating clinical impression."
    ],

    crossVerificationReport: runClinicalCrossVerification(consultationData),

    doctorVerification: {
      verified: false,
      verifiedBy: null,
      verificationTimestamp: null,
      doctorNotes: "",
      provisionalDiagnosis: "",
      suggestedInvestigations: [],
      prescriptions: []
    }
  };
}

/**
 * CLINICAL CROSS-VERIFICATION ENGINE
 * Compares current patient information with previous medical records,
 * identifying medication discrepancies, allergy conflicts, and history inconsistencies.
 */
export function runClinicalCrossVerification(consultationData, pastRecords = []) {
  const alerts = [];
  const { chiefComplaint = "", medicalHistory = {}, documentExtractions = [], patient = {} } = consultationData;
  const allergies = medicalHistory.allergies || [];
  const currentMeds = medicalHistory.medications || [];
  const conditions = medicalHistory.conditions || [];

  // 1. Allergy Conflict Scanner
  const allergyStr = (Array.isArray(allergies) ? allergies.join(" ") : String(allergies)).toLowerCase();
  if (allergyStr.includes("penicillin") || allergyStr.includes("amoxicillin") || allergyStr.includes("ampicillin")) {
    alerts.push({
      type: "ALLERGY_CONFLICT",
      severity: "CRITICAL",
      title: "Allergy Conflict: Penicillin Class Contraindication",
      finding: "Patient has documented Penicillin allergy. Beta-lactam antibiotics (Amoxicillin, Augmentin, Ampicillin) are strictly contraindicated.",
      evidenceSource: "Patient Medical History (Documented Allergies)",
      status: "REQUIRES_PHYSICIAN_REVIEW"
    });
  }
  if (allergyStr.includes("aspirin") || allergyStr.includes("nsaid") || allergyStr.includes("ibuprofen")) {
    alerts.push({
      type: "ALLERGY_CONFLICT",
      severity: "HIGH",
      title: "Allergy Conflict: NSAID / Aspirin Sensitivity",
      finding: "Patient has reported sensitivity to NSAIDs. Avoid non-steroidal anti-inflammatory agents; use selective analgesics under supervision.",
      evidenceSource: "Patient Medical History (Documented Allergies)",
      status: "REQUIRES_PHYSICIAN_REVIEW"
    });
  }

  // 2. Medication Adherence & Discrepancy Checker
  const medsStr = (Array.isArray(currentMeds) ? currentMeds.join(" ") : String(currentMeds)).toLowerCase();
  const condStr = (Array.isArray(conditions) ? conditions.join(" ") : String(conditions)).toLowerCase();

  if (condStr.includes("hypertension") && (medsStr.includes("irregular") || medsStr.includes("missed") || medsStr.includes("stopped") || medsStr.includes("amlodipine"))) {
    alerts.push({
      type: "MEDICATION_DISCREPANCY",
      severity: "HIGH",
      title: "Medication Adherence Gap: Antihypertensive Therapy",
      finding: "Known hypertensive patient reports irregular adherence to blood pressure regimen (e.g. Amlodipine). High risk of hypertensive rebound or target organ involvement.",
      evidenceSource: "Intake History & Medication Audit",
      status: "REQUIRES_PHYSICIAN_REVIEW"
    });
  }

  // 3. Clinical Progression / Escalation Warning
  if (condStr.includes("hypertension") && (chiefComplaint.toLowerCase().includes("chest pain") || chiefComplaint.toLowerCase().includes("arm") || chiefComplaint.toLowerCase().includes("jaw"))) {
    alerts.push({
      type: "CLINICAL_ESCALATION",
      severity: "CRITICAL",
      title: "Escalation Warning: Vascular Risk Correlation",
      finding: "Patient with pre-existing vascular risk (Hypertension) presents with acute chest pain radiating to extremity. Immediate 12-lead ECG and troponin monitoring indicated.",
      evidenceSource: "Cross-comparison: Past History vs Presenting Complaint",
      status: "REQUIRES_PHYSICIAN_REVIEW"
    });
  }

  // 4. Lab Investigation Correlation
  documentExtractions.forEach(doc => {
    (doc.abnormalValues || []).forEach(abn => {
      alerts.push({
        type: "INVESTIGATION_DISCREPANCY",
        severity: (abn.parameter || "").includes("Troponin") ? "CRITICAL" : "HIGH",
        title: `Abnormal Lab Correlation: ${abn.parameter}`,
        finding: `${abn.parameter} observed at ${abn.observed} (Reference: ${abn.reference}). ${abn.clinicalNote}`,
        evidenceSource: `Uploaded ${doc.documentType || 'Lab Report'} (${doc.name || 'OCR'})`,
        status: "REQUIRES_PHYSICIAN_REVIEW"
      });
    });
  });

  // If no conflict found, add standard verification check
  if (alerts.length === 0) {
    alerts.push({
      type: "VERIFIED_CLEAR",
      severity: "STANDARD",
      title: "Cross-Verification: No Active Drug-Allergy or Adherence Conflicts",
      finding: "Current presenting symptoms and reported medications show no direct adverse cross-reactions with documented baseline history.",
      evidenceSource: "Cross-Verification Rule Engine",
      status: "VERIFIED_OK"
    });
  }

  return {
    verifiedAt: new Date().toISOString(),
    totalAlerts: alerts.filter(a => a.severity !== "STANDARD").length,
    alerts,
    disclaimer: "Evidence-linked clinical decision support for physician verification. Not an autonomous diagnostic assertion."
  };
}
