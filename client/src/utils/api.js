// client/src/utils/api.js
const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API request failed [${endpoint}]:`, err);
    throw err;
  }
}

// Consultations
export const getConsultations = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/consultations${query ? `?${query}` : ''}`);
};

export const getConsultationById = (id) => apiRequest(`/consultations/${id}`);

export const createConsultation = (payload) =>
  apiRequest('/consultations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const verifyConsultation = (id, verificationData) =>
  apiRequest(`/consultations/${id}/doctor-verify`, {
    method: 'PUT',
    body: JSON.stringify(verificationData)
  });

// AI & Clinical Engine
export const getAdaptiveQuestion = (chiefComplaint, answeredQuestionIds) =>
  apiRequest('/ai/adaptive-question', {
    method: 'POST',
    body: JSON.stringify({ chiefComplaint, answeredQuestionIds })
  });

export const extractNlp = (text) =>
  apiRequest('/ai/extract-nlp', {
    method: 'POST',
    body: JSON.stringify({ text })
  });

export const scanRedFlags = (chiefComplaint, patientInput, answers) =>
  apiRequest('/ai/red-flag-scan', {
    method: 'POST',
    body: JSON.stringify({ chiefComplaint, patientInput, answers })
  });

export const processOcr = (presetId, customText) =>
  apiRequest('/ai/ocr-process', {
    method: 'POST',
    body: JSON.stringify({ presetId, customText })
  });

export const getOcrSamples = () => apiRequest('/ai/ocr-samples');

export const getAyushOptions = () => apiRequest('/ai/ayush-options');

// Patients
export const getPatients = () => apiRequest('/patients');

export const getPatientById = (id) => apiRequest(`/patients/${id}`);

// Admin
export const getAdminStats = () => apiRequest('/admin/stats');

export const getAuditLogs = () => apiRequest('/admin/audit-logs');

export const getDoctors = () => apiRequest('/admin/doctors');

export const resetDemoData = () =>
  apiRequest('/admin/reset-demo', {
    method: 'POST'
  });

// Auth
export const loginPatient = (payload) =>
  apiRequest('/auth/patient/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const loginDoctor = (doctorId) =>
  apiRequest('/auth/doctor/login', {
    method: 'POST',
    body: JSON.stringify({ doctorId })
  });

export const loginAdmin = (credentials) =>
  apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
