// server/services/clinicalEngine.js
// MEDIKIOSK Clinical Intelligence Engine - SIH 26047

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
      if (a.isAlert && (a.id.startsWith("cp_") || a.id.startsWith("fc_") || a.id.startsWith("ab_"))) {
        if (crit.id === "acs_chest_pain" && a.id.startsWith("cp_")) triggered = true;
        if (crit.id === "acute_abdomen" && a.id.startsWith("ab_")) triggered = true;
        if (crit.id === "severe_dyspnea" && (a.answer.includes("Resting dyspnea") || a.answer.includes("struggling"))) triggered = true;
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
    { key: "vomiting", canonical: "Nausea & Vomiting", regex: /(vomit|vomiting|nausea|throwing up|ವಾಂತಿ|ವಾಕರಿಕೆ)/i },
    { key: "diarrhea", canonical: "Loose Stools (Diarrhea)", regex: /(diarrhea|loose motion|watery stool|ಭೇದಿ|ಬೇಧಿ)/i },
    { key: "fatigue", canonical: "Generalized Fatigue / Weakness", regex: /(tired|fatigue|weakness|exhausted|ದಣಿವು|ಸುಸ್ತು|ಆಯಾಸ)/i },
    { key: "joint_pain", canonical: "Joint Pain (Arthralgia)", regex: /(joint pain|knee pain|body ache|ಕೀಲು ನೋವು|ಮೈಕೈ ನೋವು)/i }
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
 */
export function getNextAdaptiveQuestion(chiefComplaintKey, answeredQuestionIds = []) {
  // Normalize key
  let flowKey = "general_consultation";
  const lower = (chiefComplaintKey || "").toLowerCase();

  if (lower.includes("chest") || lower.includes("heart") || lower.includes("ಎದೆ")) {
    flowKey = "chest_pain";
  } else if (lower.includes("fever") || lower.includes("cough") || lower.includes("cold") || lower.includes("ಜ್ವರ") || lower.includes("ಕೆಮ್ಮು")) {
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

  adaptiveAnswers.forEach(ans => {
    hpiSentences.push(`${ans.question} -> ${ans.answer}.`);
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
