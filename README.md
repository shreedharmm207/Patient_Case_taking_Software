# MEDIKIOSK – Patient Case-Taking Software (SIH 2026 PS 26047)

**Smart India Hackathon 2026** | **Problem Statement ID: 26047**  
**Team: CureCoders** | **Category: MedTech / HealthTech**

---

## 🏥 Overview

**MEDIKIOSK** is an AI-powered clinical pre-consultation and history-taking platform that collects patient information before doctor consultation, intelligently asks adaptive follow-up questions, converts patient responses into structured clinical entities, and provides a concise case summary to the doctor.

Designed for deployment in Primary Health Centers (PHCs), Community Health Centers (CHCs), and District Hospitals, MEDIKIOSK reduces doctor documentation time by **up to 75%** while maintaining strict **human-in-the-loop clinical safety**.

---

## 🚀 Key Innovations

1. **AI Adaptive Questioning**: Dynamic clinical follow-up tree evaluating presenting complaints (SOCRATES pain criteria, onset, radiation, associated symptoms) rather than a fixed questionnaire.
2. **Clinical Cross-Verification Engine**: Compares current patient input with historical consultations and OCR documents. Detects medication discrepancies, allergy conflicts (e.g., Penicillin contraindication), and vital escalations with evidence sources.
3. **Multimodal & Specialty-Adaptive**: Integrates **Voice + Touch + OCR + AI**. Dynamically adapts based on patient age, gender, and clinical specialty (Cardiology, Pulmonology, Gastroenterology, AYUSH).
4. **Multilingual Dual-Voice Interaction**: English medical interface with dual audio playback buttons (**Audio in English** and **ಧ್ವನಿ in Kannada**) and speech-to-text recognition supporting regional Indian accents.
5. **Human-in-the-Loop & Privacy-First**: Explicit digital consent adhering to **ABDM framework** and **DPDP Act 2023**. AI acts strictly as an intake assistant; physicians retain final clinical and diagnostic authority.
6. **Medical Document Digitization & OCR**: Scans prescriptions and diagnostic lab reports, extracting medications and highlighting abnormal values (e.g. HbA1c 9.2%, Troponin I 0.28 ng/mL).
7. **Red-Flag Early Triage Alerts**: Real-time rule-based detection of Acute Coronary Syndrome (ACS), acute respiratory distress, stroke warning signs, and surgical abdomen emergencies.
8. **Unified Patient History Timeline**: Chronological view integrating historical OPD visits with current presentation to eliminate repetitive questioning.
9. **Explainable AI ("Why are we asking this?")**: Plain-language clinical rationale displayed on every follow-up question to educate patients.
10. **AYUSH Support**: Dedicated intake workflow capturing **Dashavidha Pariksha** parameters (Prakriti, Agni, Koshtha, Ahara-Vihara).

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Custom Modern Clinical Design System, Lucide Icons, Web Speech API (STT/TTS).
- **Backend**: Node.js, Express.js REST APIs.
- **Clinical Engine**: SOCRATES Adaptive Questioning, Red-Flag Emergency Classifier, Clinical Cross-Verification Engine, Indic NLP Parser.
- **OCR Engine**: Prescription & Lab Report Parameter Extractor with abnormal value highlighting.
- **Data Persistence**: File-backed atomic JSON database with realistic benchmark clinical cases pre-seeded.

---

## ⚡ Quick Start (Local Setup)

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Run the Application
```bash
# Start backend server (Port 5000)
npm run server

# In another terminal, start frontend client (Port 3000)
npm run client
```

Open your browser at `http://localhost:3000`.

---

## 🌐 Deployment (Vercel)

The repository is pre-configured with `vercel.json` and `api/index.js` for one-click deployment on [Vercel](https://vercel.com).

```bash
npx vercel --prod
```

---

## ⚖️ Medical & Ethical Disclaimer

**MEDIKIOSK is an AI-assisted clinical information collection and documentation tool.** It does **NOT** formulate autonomous diagnoses or replace a licensed medical practitioner. The attending physician retains full clinical and legal authority over patient care.
