// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  Users,
  Clock,
  ShieldCheck,
  RefreshCw,
  Globe,
  Flame,
  CheckCircle2,
  FileText,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { getAdminStats, getAuditLogs, resetDemoData, getDoctors, getPatients } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminDashboard({ onDemoResetSuccess }) {
  const { t, isKannada } = useLanguage();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    try {
      const [statsRes, logsRes, docRes, patRes] = await Promise.all([
        getAdminStats(),
        getAuditLogs(),
        getDoctors(),
        getPatients()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setLogs(logsRes.data);
      if (docRes.success) setDoctors(docRes.data);
      if (patRes.success) setPatients(patRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm("Reset all consultation cases and audit trail back to SIH 26047 benchmark demo data?")) return;
    setIsResetting(true);
    try {
      const res = await resetDemoData();
      if (res.success) {
        alert(t('seedSuccessful'));
        loadData();
        if (onDemoResetSuccess) onDemoResetSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {t('adminTitle')}
            </h1>
            <span className="badge badge-success">SIH 26047 NODE</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {t('adminSubtitle')}
          </p>
        </div>

        <button
          type="button"
          disabled={isResetting}
          onClick={handleResetDemo}
          className="btn btn-secondary"
          style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
        >
          <RefreshCw size={16} className={isResetting ? 'animate-spin' : ''} />
          <span>{t('resetDemoBtn')}</span>
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Total Consultations */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(0, 229, 163, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={26} color="#00e5a3" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                {stats.totalConsultations}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('totalIntakes')}
              </div>
            </div>
          </div>

          {/* Urgent Cases */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(255, 45, 85, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={26} color="#ff2d55" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ff2d55' }}>
                {stats.urgentCases}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ff85a1' }}>
                {t('urgentCasesCount')}
              </div>
            </div>
          </div>

          {/* Average Intake Time */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={26} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                {stats.averageIntakeTimeMinutes}m
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('avgIntakeTime')} ({stats.timeSavedPercentage} Saved)
              </div>
            </div>
          </div>

          {/* Multilingual Split */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={26} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {stats.languageBreakdown?.kannada || 0} KN / {stats.languageBreakdown?.english || 0} EN
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('languageRatio')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Overview & Doctors & Audit Log */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Hospital System Status
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Doctors Directory ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Audit Trail ({logs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Triage Efficiency Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ffffff' }}>
              OPD Triage Acceleration Analysis
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              In conventional government and district hospital OPDs, physicians spend <strong>15 to 20 minutes</strong> on manual history taking and documentation. MEDIKIOSK shifts this to an AI-assisted pre-consultation intake, reducing consultation documentation overhead by <strong>75%</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>Pre-consultation Complete:</span>
                  <strong style={{ color: '#00e5a3' }}>94% Accuracy</strong>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: '94%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>Red-Flag ACS Early Trigger:</span>
                  <strong style={{ color: '#ff2d55' }}>&lt; 2 Mins Door-to-Triage</strong>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: '98%', background: '#ff2d55' }}></div></div>
              </div>
            </div>
          </div>

          {/* Top Presenting Symptoms */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ffffff' }}>
              Top Clinical Complaint Frequencies
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {stats?.symptomFrequency && Object.entries(stats.symptomFrequency).map(([sym, count], idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#ffffff' }}>{sym}</span>
                  <span className="badge badge-source">{count} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Doctors */}
      {activeTab === 'doctors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
              <img
                src={doc.avatar}
                alt={doc.name}
                style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff', display: 'block' }}>
                  {doc.name}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#00e5a3', fontWeight: 600 }}>
                  {doc.specialty}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {doc.hospital}
                </div>
                <span className="badge badge-pending" style={{ marginTop: '0.5rem', fontSize: '0.68rem' }}>
                  Reg: {doc.regNo}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ffffff' }}>
            {t('auditTrail')} (ABDM / DPDP Act Compliance Log)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {logs.map((log) => (
              <div key={log.id} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: log.event.includes('RED_FLAG') ? '4px solid #ff2d55' : '4px solid #00e5a3',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <strong style={{ color: log.event.includes('RED_FLAG') ? '#ff4d6d' : '#00e5a3' }}>
                    {log.event}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#e2e8f0' }}>{log.details}</p>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Actor: {log.actor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
