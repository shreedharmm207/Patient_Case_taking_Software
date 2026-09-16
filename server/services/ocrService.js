// server/services/ocrService.js
// Medical Document Digitization & OCR Simulation Engine

export const SAMPLE_DOCUMENTS = [
  {
    id: "sample_rx_1",
    name: "Dr. Sharma Clinic - Previous Prescription (Cardio-Metabolic)",
    documentType: "PRESCRIPTION",
    date: "2026-06-14",
    hospitalName: "Apollo Clinics / District Hospital OPD",
    extractedDoctor: "Dr. A. Sharma, MD (General Medicine)",
    imagePlaceholder: "rx_sample.png",
    rawText: `DR. A. SHARMA, MD
GENERAL PHYSICIAN - REG NO: KMC-44819
APOLLO CLINICS, BENGALURU
DATE: 14/06/2026
PATIENT: Sunita Devi, 52/F
Rx:
1. TAB. METFORMIN 500mg -- 1 tab twice daily after meals (BD)
2. TAB. TELMISARTAN 40mg -- 1 tab once daily in morning (OD)
3. TAB. ATORVASTATIN 10mg -- 1 tab once daily at bedtime (HS)
Advice: Low salt, diabetic diet, repeat HbA1c in 3 months.`,
    extractedItems: [
      { type: "Medication", name: "Metformin", dosage: "500mg", frequency: "1 tab twice daily after meals (BD)", purpose: "Type 2 Diabetes" },
      { type: "Medication", name: "Telmisartan", dosage: "40mg", frequency: "1 tab once daily in morning (OD)", purpose: "Hypertension" },
      { type: "Medication", name: "Atorvastatin", dosage: "10mg", frequency: "1 tab at bedtime (HS)", purpose: "Dyslipidemia" }
    ],
    abnormalValues: [],
    confidenceScore: 0.96
  },
  {
    id: "sample_lab_1",
    name: "Diagnostic Lab Report - Blood Glucose & Lipid Panel",
    documentType: "LAB_REPORT",
    date: "2026-08-20",
    hospitalName: "Anand Diagnostic Laboratory / NABL Accredited",
    extractedDoctor: "Dr. K. V. Rao, Pathologist",
    imagePlaceholder: "lab_report.png",
    rawText: `ANAND DIAGNOSTIC LABORATORY
NABL ACCREDITED LAB #MC-2018
BIOCHEMISTRY TEST REPORT
PATIENT: Smt. Sunita Devi | AGE: 52 | GENDER: Female
DATE: 20-Aug-2026

TEST NAME                  OBSERVED VALUE    REFERENCE RANGE     STATUS
Fasting Blood Sugar (FBS)  188 mg/dL         70 - 100 mg/dL      HIGH
HbA1c (Glycated Hb)        9.2 %             < 5.7 % (Good)      HIGH
Serum Creatinine           1.10 mg/dL        0.5 - 1.2 mg/dL     NORMAL
Total Cholesterol          242 mg/dL         < 200 mg/dL         HIGH
Serum Triglycerides        210 mg/dL         < 150 mg/dL         HIGH
WBC Total Count            7,800 /uL         4,000 - 11,000 /uL  NORMAL`,
    extractedItems: [
      { test: "Fasting Blood Sugar", value: "188 mg/dL", reference: "70 - 100 mg/dL", isAbnormal: true, flag: "HIGH" },
      { test: "HbA1c (Glycated Hemoglobin)", value: "9.2 %", reference: "< 5.7 %", isAbnormal: true, flag: "CRITICALLY HIGH" },
      { test: "Total Cholesterol", value: "242 mg/dL", reference: "< 200 mg/dL", isAbnormal: true, flag: "HIGH" },
      { test: "Serum Triglycerides", value: "210 mg/dL", reference: "< 150 mg/dL", isAbnormal: true, flag: "HIGH" },
      { test: "Serum Creatinine", value: "1.10 mg/dL", reference: "0.5 - 1.2 mg/dL", isAbnormal: false, flag: "NORMAL" }
    ],
    abnormalValues: [
      { parameter: "HbA1c", observed: "9.2 %", reference: "< 5.7 %", clinicalNote: "Indicates uncontrolled glycemic control over the past 90 days." },
      { parameter: "Fasting Blood Sugar", observed: "188 mg/dL", reference: "70-100 mg/dL", clinicalNote: "Elevated fasting hyperglycemia." },
      { parameter: "Lipid Profile", observed: "Cholesterol 242 mg/dL", reference: "<200 mg/dL", clinicalNote: "Mixed dyslipidemia detected." }
    ],
    confidenceScore: 0.98
  },
  {
    id: "sample_cardiac_1",
    name: "Emergency Cardiac Biomarker Report - Troponin I",
    documentType: "LAB_REPORT",
    date: "2026-09-16",
    hospitalName: "Emergency Care Unit / Fortis Hospital",
    extractedDoctor: "Dr. S. Reddy, Emergency Medicine",
    imagePlaceholder: "cardiac_lab.png",
    rawText: `EMERGENCY CARE TRIAGE LAB
STAT REPORT
PATIENT: Gangamma Gowda | AGE: 58 | GENDER: F
DATE: 16-Sep-2026 18:30 IST

TEST NAME                  OBSERVED VALUE    REFERENCE RANGE     STATUS
High Sensitivity Troponin I 0.28 ng/mL        < 0.04 ng/mL        CRITICAL HIGH
ECG Interpretation         ST-segment Elevation in V2-V4         ACUTE INJURY
Serum Potassium            4.2 mEq/L         3.5 - 5.0 mEq/L     NORMAL`,
    extractedItems: [
      { test: "High Sensitivity Troponin I", value: "0.28 ng/mL", reference: "< 0.04 ng/mL", isAbnormal: true, flag: "CRITICAL HIGH" },
      { test: "ECG Finding", value: "ST-Elevation in V2-V4", reference: "Normal Sinus", isAbnormal: true, flag: "ANTERIOR STEMI" }
    ],
    abnormalValues: [
      { parameter: "Cardiac Troponin I", observed: "0.28 ng/mL", reference: "< 0.04 ng/mL", clinicalNote: "CRITICAL ALERT: Strongly indicative of acute myocardial infarction. Immediate Cath Lab triage required." }
    ],
    confidenceScore: 0.99
  }
];

/**
 * Process an uploaded document or sample ID
 */
export function processMedicalDocument(fileOrPresetId, customText = "") {
  // If matching sample preset
  const foundSample = SAMPLE_DOCUMENTS.find(s => s.id === fileOrPresetId);
  if (foundSample) {
    return {
      success: true,
      ...foundSample,
      ocrEngine: "Clinical OCR Engine v2.4 (Simulated Indic/NABL Pipeline)",
      processedTimestamp: new Date().toISOString()
    };
  }

  // If custom text or uploaded file simulation
  const lines = (customText || "Scanned Medical Prescription: Paracetamol 650mg TDS x 3 days. Cetirizine 10mg HS.").split("\n");
  const extractedMeds = [];
  const abnormal = [];

  for (const line of lines) {
    if (/(paracetamol|amoxicillin|pantoprazole|metformin|azithromycin|atorvastatin|telmisartan|insulin)/i.test(line)) {
      extractedMeds.push({
        type: "Extracted Medication",
        name: line.trim(),
        dosage: "As prescribed",
        frequency: "Extracted via OCR",
        purpose: "Therapeutic"
      });
    }
    if (/(high|elevated|positive|critical)/i.test(line)) {
      abnormal.push({
        parameter: "Clinical finding",
        observed: line.trim(),
        reference: "Normal",
        clinicalNote: "Flagged during document character recognition."
      });
    }
  }

  return {
    success: true,
    id: `custom_${Date.now()}`,
    name: "Uploaded Medical Document",
    documentType: customText.includes("TEST") || customText.includes("LAB") ? "LAB_REPORT" : "PRESCRIPTION",
    date: new Date().toISOString().split("T")[0],
    hospitalName: "Scanned Clinical Facility",
    rawText: customText || "Uploaded document text scanned successfully.",
    extractedItems: extractedMeds.length > 0 ? extractedMeds : [
      { type: "Note", name: "Document text digitized and attached to patient timeline", dosage: "-", frequency: "-" }
    ],
    abnormalValues: abnormal,
    confidenceScore: 0.92,
    ocrEngine: "Clinical OCR Engine v2.4",
    processedTimestamp: new Date().toISOString()
  };
}
