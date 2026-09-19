// server/routes/consultations.js
import express from "express";
import {
  getConsultations,
  getConsultationById,
  saveConsultation,
  addAuditLog,
  getPatients
} from "../services/dataStore.js";
import {
  scanRedFlags,
  generatePhysicianCaseSummary
} from "../services/clinicalEngine.js";

const router = express.Router();

// Get all consultations with optional filtering
router.get("/", (req, res) => {
  const { status, isRedFlag, search } = req.query;
  let list = getConsultations();

  if (status && status !== "ALL") {
    list = list.filter(c => c.status === status);
  }

  if (isRedFlag !== undefined && isRedFlag !== "") {
    const flagBool = isRedFlag === "true";
    list = list.filter(c => Boolean(c.isRedFlag) === flagBool);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      (c.patientName && c.patientName.toLowerCase().includes(q)) ||
      (c.abhaId && c.abhaId.toLowerCase().includes(q)) ||
      (c.tokenNumber && c.tokenNumber.toLowerCase().includes(q)) ||
      (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q))
    );
  }

  // Sort so red-flags and urgent cases are always at the top!
  list.sort((a, b) => {
    if (a.isRedFlag && !b.isRedFlag) return -1;
    if (!a.isRedFlag && b.isRedFlag) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  res.json({ success: true, count: list.length, data: list });
});

// Get consultation by ID
router.get("/:id", (req, res) => {
  const consultation = getConsultationById(req.params.id);
  if (!consultation) {
    return res.status(404).json({ success: false, message: "Consultation not found" });
  }
  res.json({ success: true, data: consultation });
});

// Create new consultation from patient intake
router.post("/", (req, res) => {
  const {
    patient,
    chiefComplaint,
    chiefComplaintKn,
    language = "en",
    extractedEntities = {},
    adaptiveAnswers = [],
    medicalHistory = {},
    documentExtractions = [],
    ayushData = null,
    carePathway = "general",
    ayurvedaCareRequest = null,
    ayurvedaSpecificInfo = null,
    interdisciplinaryReferral = null
  } = req.body;

  const redFlagScan = scanRedFlags(chiefComplaint, "", adaptiveAnswers);
  const isRedFlag = redFlagScan.isRedFlag;
  const tokenCount = getConsultations().length + 101;
  const tokenNumber = isRedFlag ? `OPD-${tokenCount} [URGENT]` : `OPD-${tokenCount}`;

  const summary = generatePhysicianCaseSummary({
    patient,
    chiefComplaint,
    adaptiveAnswers,
    extractedEntities,
    medicalHistory,
    documentExtractions,
    ayushData
  });

  const newConsultation = {
    id: `cons_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tokenNumber,
    patientId: patient?.id || `pat_${Date.now()}`,
    patientName: patient?.name || "Anonymous Patient",
    patientAge: patient?.age || 30,
    patientGender: patient?.gender || "Other",
    abhaId: patient?.abhaId || "91-0000-0000-0000",
    language,
    chiefComplaint: chiefComplaint || "General medical consultation",
    chiefComplaintKn: chiefComplaintKn || "",
    carePathway: carePathway || "general",
    ayurvedaCareRequest,
    ayurvedaSpecificInfo,
    interdisciplinaryReferral,
    status: isRedFlag ? "IMMEDIATE_ATTENTION" : "PENDING_REVIEW",
    isRedFlag,
    urgencyLevel: redFlagScan.urgencyLevel,
    redFlagReport: redFlagScan,
    createdAt: new Date().toISOString(),
    extractedEntities,
    adaptiveAnswers,
    medicalHistory,
    documentExtractions,
    ayushData,
    summary,
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

  saveConsultation(newConsultation);

  addAuditLog(
    isRedFlag ? "EMERGENCY_INTAKE_COMPLETED" : "PATIENT_INTAKE_COMPLETED",
    `Consultation ${tokenNumber} registered for ${patient?.name || 'Patient'}. Care pathway: ${carePathway}. Red flag status: ${isRedFlag}`,
    "Patient Kiosk Terminal"
  );

  res.status(201).json({
    success: true,
    message: "Patient intake successfully processed and queued for doctor review.",
    data: newConsultation
  });
});

// Doctor Verification & Notes update
router.put("/:id/doctor-verify", (req, res) => {
  const consultation = getConsultationById(req.params.id);
  if (!consultation) {
    return res.status(404).json({ success: false, message: "Consultation not found" });
  }

  const {
    doctorName,
    doctorNotes,
    provisionalDiagnosis,
    suggestedInvestigations = [],
    prescriptions = [],
    amendedSummary,
    status = "REVIEWED",
    carePathway,
    ayurvedaDoctorNotes,
    ayurvedaFollowUp,
    interdisciplinaryReferral
  } = req.body;

  consultation.status = status;
  if (carePathway) consultation.carePathway = carePathway;
  if (ayurvedaDoctorNotes) consultation.ayurvedaDoctorNotes = ayurvedaDoctorNotes;
  if (ayurvedaFollowUp) consultation.ayurvedaFollowUp = ayurvedaFollowUp;
  if (interdisciplinaryReferral) consultation.interdisciplinaryReferral = interdisciplinaryReferral;

  consultation.doctorVerification = {
    verified: true,
    verifiedBy: doctorName || "Attending Physician",
    verificationTimestamp: new Date().toISOString(),
    doctorNotes: doctorNotes || consultation.doctorVerification?.doctorNotes || "",
    provisionalDiagnosis: provisionalDiagnosis || "",
    suggestedInvestigations,
    prescriptions
  };

  if (amendedSummary) {
    consultation.summary = {
      ...consultation.summary,
      ...amendedSummary
    };
  }

  saveConsultation(consultation);

  addAuditLog(
    "DOCTOR_VERIFIED_CASE",
    `Case ${consultation.tokenNumber} verified by ${doctorName || 'Doctor'}. Status: ${status}`,
    doctorName || "Attending Physician"
  );

  res.json({
    success: true,
    message: "Doctor verification and clinical notes saved successfully.",
    data: consultation
  });
});

// Interdisciplinary Referral Endpoint (General -> Ayurveda or Ayurveda -> Allopathy)
router.post("/:id/referral", (req, res) => {
  const consultation = getConsultationById(req.params.id);
  if (!consultation) {
    return res.status(404).json({ success: false, message: "Consultation not found" });
  }

  const {
    referringDoctor,
    fromSpecialty,
    toSpecialty,
    reason,
    patientConsentConfirmed,
    clinicalNotes
  } = req.body;

  const referralRecord = {
    referralId: `REF-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    fromDoctor: referringDoctor || "Attending Physician",
    fromSpecialty: fromSpecialty || "General Medicine",
    toSpecialty: toSpecialty || "Ayurveda Care",
    reason: reason || "Integrative evaluation",
    clinicalNotes: clinicalNotes || "",
    patientConsentConfirmed: Boolean(patientConsentConfirmed),
    status: "ACTIVE_REFERRAL",
    timestamp: new Date().toISOString()
  };

  consultation.interdisciplinaryReferral = referralRecord;
  if (toSpecialty?.toLowerCase().includes("ayurveda")) {
    consultation.carePathway = "ayurveda";
  }

  saveConsultation(consultation);

  addAuditLog(
    "INTERDISCIPLINARY_REFERRAL",
    `Referral from ${fromSpecialty} to ${toSpecialty} for case ${consultation.tokenNumber} with patient consent.`,
    referringDoctor || "Attending Physician"
  );

  res.json({
    success: true,
    message: "Referral recorded successfully with patient consent.",
    data: consultation
  });
});

export default router;
