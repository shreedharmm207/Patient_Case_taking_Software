// server/routes/patients.js
import express from "express";
import { getPatients, getPatientById, savePatient, getConsultations } from "../services/dataStore.js";

const router = express.Router();

// Get all patients
router.get("/", (req, res) => {
  const patients = getPatients();
  res.json({ success: true, data: patients });
});

// Get patient by ID with full consultation history timeline
router.get("/:id", (req, res) => {
  const patient = getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  // Find all past and current consultations for this patient
  const allConsultations = getConsultations();
  const patientConsultations = allConsultations.filter(c => c.patientId === patient.id || c.abhaId === patient.abhaId);

  // Merge static history and recorded consultations for a unified timeline
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

  res.json({
    success: true,
    data: {
      ...patient,
      unifiedTimeline: timeline
    }
  });
});

// Update or register patient
router.post("/", (req, res) => {
  const patient = savePatient(req.body);
  res.json({ success: true, data: patient });
});

export default router;
