// server/routes/auth.js
import express from "express";
import { getDoctors, getPatients, savePatient, addAuditLog } from "../services/dataStore.js";

const router = express.Router();

// Patient login / demo selector
router.post("/patient/login", (req, res) => {
  const { abhaId, name, phone, language = "en" } = req.body;
  const patients = getPatients();
  
  let patient = patients.find(p => p.abhaId === abhaId || p.phone === phone);
  
  if (!patient && name) {
    // Register new patient
    const newId = `pat_${Date.now()}`;
    patient = {
      id: newId,
      abhaId: abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      nameKn: req.body.nameKn || name,
      age: req.body.age || 30,
      gender: req.body.gender || "Other",
      phone: phone || "+91 99000 00000",
      preferredLanguage: language,
      address: req.body.address || "Karnataka, India",
      pastConsultations: []
    };
    savePatient(patient);
    addAuditLog("PATIENT_REGISTERED", `New patient ${name} registered with ABHA ${patient.abhaId}`, "Patient Kiosk");
  }

  if (!patient) {
    // Default to first demo patient if none matched
    patient = patients[0];
  }

  res.json({
    success: true,
    user: {
      role: "PATIENT",
      ...patient
    }
  });
});

// Doctor login
router.post("/doctor/login", (req, res) => {
  const { doctorId = "doc_101" } = req.body;
  const doctors = getDoctors();
  const doctor = doctors.find(d => d.id === doctorId) || doctors[0];

  addAuditLog("DOCTOR_LOGGED_IN", `${doctor.name} logged into Doctor Dashboard`, doctor.name);

  res.json({
    success: true,
    user: {
      role: "DOCTOR",
      ...doctor
    }
  });
});

// Admin login
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  // Demo mode: accept admin or demo
  addAuditLog("ADMIN_LOGGED_IN", "Administrator accessed hospital analytics console", "Admin Portal");

  res.json({
    success: true,
    user: {
      role: "ADMIN",
      name: "Hospital Administrator",
      hospital: "Bangalore Medical College & Research Institute",
      email: "admin@medikiosk.gov.in"
    }
  });
});

export default router;
