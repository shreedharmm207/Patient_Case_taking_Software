// client/src/pages/HomePage.jsx
import React from 'react';
import {
  Stethoscope,
  Activity,
  UserCheck,
  BarChart3,
  Flame,
  Volume2,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Languages,
  ChevronRight,
  HeartPulse,
  BrainCircuit,
  ArrowRight,
  ShieldAlert,
  Hospital
} from 'lucide-react';

export default function HomePage({ setActiveTab, onLaunchDemoScenario }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Clinical Platform Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 1.1rem',
          borderRadius: '999px',
          background: 'rgba(0, 229, 163, 0.1)',
          border: '1px solid rgba(0, 229, 163, 0.35)',
          color: '#00e5a3',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Sparkles size={16} />
          <span>Intelligent Patient Pre-Consultation & Clinical Triage Platform</span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto 3.5rem auto' }}>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
          lineHeight: 1.15,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 45%, #00e5a3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI-Powered Patient Case-Taking Platform
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          Collect patient information intelligently before consultation and provide doctors with a structured clinical case summary. Built for PHCs, CHCs, and District Hospitals with Kannada & English voice interaction.
        </p>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('kiosk')}
            className="btn btn-primary btn-kiosk-large"
            style={{ minWidth: '240px' }}
          >
            <Activity size={22} />
            <span>Start Patient Intake</span>
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className="btn btn-secondary btn-kiosk-large"
            style={{ minWidth: '220px' }}
          >
            <UserCheck size={22} color="#60a5fa" />
            <span>Doctor Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('cross-verify')}
            className="btn btn-secondary btn-kiosk-large"
            style={{ minWidth: '240px', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          >
            <ShieldAlert size={20} color="#c084fc" />
            <span>Cross-Verification Engine</span>
          </button>
        </div>
      </div>

      {/* 4 Architectural Portals Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3.5rem'
      }}>
        {/* Patient Intake Card */}
        <div
          onClick={() => setActiveTab('kiosk')}
          className="glass-panel glass-panel-hover"
          style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00e5a3, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Activity size={24} color="#05131c" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            Patient Intake Kiosk
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, lineHeight: '1.5' }}>
            Adaptive questioning, voice input in English & Kannada, visual pain scale, and prescription / lab report digitization.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00e5a3', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>Launch Pre-Consultation</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Doctor Dashboard Card */}
        <div
          onClick={() => setActiveTab('doctor')}
          className="glass-panel glass-panel-hover"
          style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <UserCheck size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            Doctor Clinical Portal
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, lineHeight: '1.5' }}>
            Emergency triage queue, red-flag alert flags, structured SOAP case summaries, patient timeline, and physician sign-off.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>Open Clinical Queue</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Clinical Cross-Verification Card */}
        <div
          onClick={() => setActiveTab('cross-verify')}
          className="glass-panel glass-panel-hover"
          style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            Cross-Verification Engine
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, lineHeight: '1.5' }}>
            Reconciles presenting complaints with previous records to detect medication discrepancies, allergy conflicts, and escalations.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>Inspect Cross-Checks</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => setActiveTab('admin')}
          className="glass-panel glass-panel-hover"
          style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <BarChart3 size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            Hospital Admin Console
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, lineHeight: '1.5' }}>
            Hospital OPD throughput analytics, red-flag emergency statistics, language split, audit trail, and 1-click demo scenario reset.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>View Hospital Analytics</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* 4 Core Architectural Innovation Pillars */}
      <div style={{
        background: 'rgba(15, 25, 51, 0.7)',
        border: '1.5px solid rgba(0, 229, 163, 0.3)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '3.5rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-success">CORE SYSTEM ARCHITECTURE</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Flagship Clinical Pillars</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Innovation & Core Architectural Pillars
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '1.4rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <ShieldAlert size={22} color="#c084fc" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>1. Clinical Cross-Verification Engine</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Compares current patient input with historical consultations and OCR documents. Identifies medication discrepancies, allergy conflicts, and vital sign changes over time for physician verification.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '1.4rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Activity size={22} color="#00e5a3" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>2. Multimodal & Specialty-Adaptive</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Voice + Touch + OCR + AI. Dynamically adapts question complexity based on patient age, gender, and clinical specialty (Cardiology, Pulmonology, Gastroenterology, AYUSH).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '1.4rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <UserCheck size={22} color="#60a5fa" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>3. Human-in-the-Loop & Privacy-First</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              AI assists with intake documentation while physicians retain clinical authority. Built with ABDM consent architecture, DPDP Act 2023 compliance, and strict data confidentiality.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '1.4rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Hospital size={22} color="#fbbf24" />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>4. Scalable & Real-World Deployment</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Designed for rapid deployment in government Primary Health Centers (PHCs), CHCs, and district hospitals on existing tablets and low-cost touch kiosks.
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Interactive Benchmark Demo Scenarios */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Evaluator Benchmark Cases (1-Click Launch)
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select any scenario to inspect its intake questioning flow, red-flag triage, and physician summary:
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {/* Scenario 1 */}
          <div
            onClick={() => onLaunchDemoScenario('cons_demo_01')}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-pending">Standard Triage</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPD-101</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              1. Fever & Cough (Ravi Kumar, 34/M)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
              4-day pyrexia with productive yellowish sputum. Demonstrates duration tracking and penicillin allergy cross-verification alert.
            </p>
          </div>

          {/* Scenario 2 - RED FLAG */}
          <div
            onClick={() => onLaunchDemoScenario('cons_demo_02')}
            style={{
              background: 'rgba(255, 45, 85, 0.08)',
              border: '1.5px solid #ff2d55',
              borderRadius: '16px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-urgent">Priority Red Flag</span>
              <span style={{ fontSize: '0.75rem', color: '#ffb3c1' }}>OPD-102</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              2. Chest Pain (Gangamma, 58/F)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#ffccd5', lineHeight: '1.4' }}>
              Crushing chest pain radiating to left arm & jaw with sweating. Uploaded emergency lab report with elevated Troponin I (0.28 ng/mL).
            </p>
          </div>

          {/* Scenario 3 */}
          <div
            onClick={() => onLaunchDemoScenario('cons_demo_03')}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-urgent" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: '#f59e0b' }}>
                High Priority
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPD-103</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              3. Abdominal Pain (Karthik, 26/M)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Right lower quadrant acute pain with intractable vomiting. Alvarado risk alert for acute appendicitis.
            </p>
          </div>

          {/* Scenario 4 */}
          <div
            onClick={() => onLaunchDemoScenario('cons_demo_04')}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-success">Reviewed Case</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPD-104</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              4. Diabetes + Lab OCR (Sunita, 52/F)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
              HbA1c 9.2% high abnormal highlight, previous prescription OCR, and completed physician treatment plan.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
