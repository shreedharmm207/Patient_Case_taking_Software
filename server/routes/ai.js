// server/routes/ai.js
import express from "express";
import {
  getNextAdaptiveQuestion,
  extractClinicalEntities,
  scanRedFlags,
  generatePhysicianCaseSummary,
  AYUSH_PARAMETERS,
  CLINICAL_QUESTION_FLOWS
} from "../services/clinicalEngine.js";
import { processMedicalDocument, SAMPLE_DOCUMENTS } from "../services/ocrService.js";
import { addAuditLog } from "../services/dataStore.js";

const router = express.Router();

// 1. Adaptive Questioning
router.post("/adaptive-question", (req, res) => {
  const { chiefComplaint, answeredQuestionIds = [] } = req.body;
  const result = getNextAdaptiveQuestion(chiefComplaint, answeredQuestionIds);
  res.json({ success: true, data: result });
});

// 2. Natural Language Processing / Entity Extraction
router.post("/extract-nlp", (req, res) => {
  const { text } = req.body;
  const extracted = extractClinicalEntities(text);
  res.json({ success: true, data: extracted });
});

// 3. Red Flag Scanner
router.post("/red-flag-scan", (req, res) => {
  const { chiefComplaint, patientInput, answers = [] } = req.body;
  const scan = scanRedFlags(patientInput, chiefComplaint, answers);

  if (scan.isRedFlag) {
    addAuditLog("EMERGENCY_RED_FLAG_TRIGGERED", `Clinical Red Flag Triggered: ${scan.flags.map(f => f.title).join(", ")}`, "Clinical Rule Engine");
  }

  res.json({ success: true, data: scan });
});

// 4. Medical Document OCR Processor
router.post("/ocr-process", (req, res) => {
  const { presetId, customText } = req.body;
  const result = processMedicalDocument(presetId, customText);

  addAuditLog("DOCUMENT_OCR_PROCESSED", `Digitized ${result.documentType || 'document'}: ${result.name} (${(result.confidenceScore * 100).toFixed(0)}% confidence)`, "Clinical OCR Pipeline");

  res.json({ success: true, data: result });
});

// 5. Get OCR preset sample documents
router.get("/ocr-samples", (req, res) => {
  res.json({ success: true, data: SAMPLE_DOCUMENTS });
});

// 6. AYUSH Parameters
router.get("/ayush-options", (req, res) => {
  res.json({ success: true, data: AYUSH_PARAMETERS });
});

// 7. Generate Clinical Case Summary
router.post("/generate-summary", (req, res) => {
  const consultationData = req.body;
  const summary = generatePhysicianCaseSummary(consultationData);

  addAuditLog("SUMMARY_GENERATED", `AI Case Summary synthesized for ${consultationData.patient?.name || 'Patient'}`, "AI Summarizer");

  res.json({ success: true, data: summary });
});

// 8. Available Flow Catalog
router.get("/question-flows", (req, res) => {
  res.json({ success: true, data: CLINICAL_QUESTION_FLOWS });
});

export default router;
