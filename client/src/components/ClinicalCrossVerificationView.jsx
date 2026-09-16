// client/src/components/ClinicalCrossVerificationView.jsx
import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  User,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { getConsultations } from '../utils/api';

export default function ClinicalCrossVerificationView({ onOpenDoctorCase }) {
  const [consultations, setConsultations] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    getConsultations().then(res => {
      if (res.success && res.data.length > 0) {
        setConsultations(res.data);
        setSelectedCaseId(res.data[0].id);
      }
    }).catch(console.error);
  }, []);

  const activeCase = consultations.find(c => c.id === selectedCaseId) || consultations[0];
  const crossReport = activeCase?.crossVerificationReport || activeCase?.summary?.crossVerificationReport;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Clinical Cross-Verification Engine
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Compares current patient information with historical medical records to flag medication discrepancies, allergy conflicts, and diagnostic correlations.
            </p>
          </div>
        </div>
      </div>

      {/* Case Selector Chips */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Select Patient to Cross-Verify:
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {consultations.map((c) => {
            const isSelected = selectedCaseId === c.id;
            const isUrgent = c.isRedFlag || c.status === 'IMMEDIATE_ATTENTION';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCaseId(c.id)}
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <span>{isUrgent ? '🚨' : '👤'}</span>
                <span>{c.patientName}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({c.tokenNumber})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Cross-Verification Report Card */}
      {activeCase && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          
          {/* Patient Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeCase.patientName}</h2>
                <span className="badge badge-source">ABHA: {activeCase.abhaId}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeCase.patientAge} Years / {activeCase.patientGender}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '0.3rem' }}>
                <strong>Current Complaint:</strong> "{activeCase.chiefComplaint}"
              </div>
            </div>

            {onOpenDoctorCase && (
              <button
                type="button"
                onClick={() => onOpenDoctorCase(activeCase.id)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                <Stethoscope size={16} />
                <span>Open in Doctor Portal</span>
              </button>
            )}
          </div>

          {/* Cross-Verification Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Flagged Cross-Checks
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: crossReport?.totalAlerts > 0 ? '#ff5277' : '#00e5a3' }}>
                {crossReport?.totalAlerts || 0} Alert{crossReport?.totalAlerts === 1 ? '' : 's'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Data Provenance Sources
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.3rem' }}>
                Intake + History + OCR Labs
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Human-in-the-Loop Status
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.3rem' }}>
                Pending Physician Action
              </div>
            </div>
          </div>

          {/* Evidence-Linked Cross-Verification Alerts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#a855f7" />
              <span>Evidence-Linked Clinical Alerts</span>
            </h3>

            {crossReport?.alerts && crossReport.alerts.map((item, idx) => {
              const isCritical = item.severity === 'CRITICAL';
              const isHigh = item.severity === 'HIGH';

              return (
                <div
                  key={idx}
                  style={{
                    background: isCritical ? 'rgba(255, 45, 85, 0.08)' : isHigh ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 229, 163, 0.06)',
                    borderLeft: `4px solid ${isCritical ? '#ff2d55' : isHigh ? '#f59e0b' : '#00e5a3'}`,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCritical ? (
                        <AlertTriangle size={18} color="#ff2d55" />
                      ) : (
                        <Info size={18} color={isHigh ? '#f59e0b' : '#00e5a3'} />
                      )}
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                        {item.title}
                      </strong>
                    </div>

                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: isCritical ? 'rgba(255, 45, 85, 0.25)' : isHigh ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0, 229, 163, 0.2)',
                      color: isCritical ? '#ff5277' : isHigh ? '#fbbf24' : '#00e5a3'
                    }}>
                      {item.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {item.finding}
                  </p>

                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '0.5rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <strong>Evidence Source:</strong> <span style={{ color: '#c7d2fe' }}>{item.evidenceSource}</span>
                    </span>

                    <span style={{ color: '#00e5a3', fontWeight: 600 }}>
                      Action: Physician Verification Mandatory
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 4 Pillars Grid from Presentation Slide 2 */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>
          Core Architectural Innovation & Safety Pillars
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={20} color="#a855f7" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>1. Clinical Cross-Verification</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Compares current patient input with historical consultations and OCR documents. Flags medication discrepancies, allergy conflicts, and history progression for physician sign-off.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Activity size={20} color="#00e5a3" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>2. Multimodal & Specialty-Adaptive</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Combines voice, touch, and medical document OCR. Dynamically adapts question complexity based on patient age, gender, and clinical specialty (Cardiology, Pulmonology, AYUSH).
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={20} color="#60a5fa" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>3. Human-in-the-Loop & Privacy-First</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              AI assists with structured intake and early triaging while the physician retains full diagnosis authority. Explicit consent under ABDM guidelines and DPDP Act 2023 compliance.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={20} color="#fbbf24" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>4. Scalable & Real-World Ready</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Engineered for deployment on standard low-cost tablets and kiosks in Primary Health Centers (PHCs), CHCs, and government district hospitals with minimal staff training.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
