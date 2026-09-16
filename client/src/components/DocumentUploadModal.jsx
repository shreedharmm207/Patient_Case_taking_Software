// client/src/components/DocumentUploadModal.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, X, Eye } from 'lucide-react';
import { getOcrSamples, processOcr } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function DocumentUploadModal({ onDocumentExtracted, onClose }) {
  const { t, isKannada } = useLanguage();
  const [samples, setSamples] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [customText, setCustomText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);

  useEffect(() => {
    getOcrSamples().then(res => {
      if (res.success) {
        setSamples(res.data);
      }
    }).catch(console.error);
  }, []);

  const handleRunOcr = async (presetId = selectedPresetId) => {
    setIsScanning(true);
    try {
      // Simulate visual OCR scanning delay
      await new Promise(r => setTimeout(r, 900));
      const res = await processOcr(presetId, customText);
      if (res.success) {
        setExtractedResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (id) => {
    setSelectedPresetId(id);
    handleRunOcr(id);
  };

  const handleConfirmAndAttach = () => {
    if (extractedResult && onDocumentExtracted) {
      onDocumentExtracted(extractedResult);
    }
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(5, 10, 24, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {t('uploadTitle')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('uploadDesc')}
            </p>
          </div>
        </div>

        {/* Presets Grid */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
            {t('chooseSamplePreset')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {samples.map((s) => {
              const isSelected = selectedPresetId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectPreset(s.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #00e5a3' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(0, 229, 163, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: s.documentType === 'LAB_REPORT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                      color: s.documentType === 'LAB_REPORT' ? '#60a5fa' : '#c084fc'
                    }}>
                      {s.documentType}
                    </span>
                    {isSelected && <CheckCircle2 size={16} color="#00e5a3" />}
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{s.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.hospitalName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Text / Upload Box */}
        <div style={{
          border: '1.5px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.2)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
              Or paste / type prescription details to simulate OCR extraction:
            </span>
            <button
              type="button"
              onClick={() => handleRunOcr()}
              disabled={isScanning || (!customText && !selectedPresetId)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            >
              {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isScanning ? t('ocrProcessing') : 'Scan with Clinical OCR'}
            </button>
          </div>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Rx: Tab Metformin 500mg BD x 30 days. Tab Telmisartan 40mg OD. Fasting Blood Glucose: 190 mg/dL (High)..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* OCR Result View */}
        {extractedResult && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(0, 229, 163, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#00e5a3" />
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                  OCR Extraction Completed ({(extractedResult.confidenceScore * 100).toFixed(0)}% Confidence)
                </strong>
              </div>
              <span className="badge badge-success">DIGITIZED</span>
            </div>

            {/* Abnormal Values Highlight if any */}
            {extractedResult.abnormalValues && extractedResult.abnormalValues.length > 0 && (
              <div style={{
                background: 'rgba(255, 45, 85, 0.15)',
                border: '1px solid #ff2d55',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d6d', fontWeight: 700, fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} />
                  <span>{t('abnormalFlag')}</span>
                </div>
                <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {extractedResult.abnormalValues.map((abn, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#ffb3c1' }}>
                      • <strong>{abn.parameter}:</strong> Observed <span style={{ color: '#ffffff', fontWeight: 800 }}>{abn.observed}</span> (Ref: {abn.reference}) — {abn.clinicalNote}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
                Extracted Clinical Records:
              </div>
              {extractedResult.extractedItems?.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <strong style={{ color: '#ffffff' }}>{item.name || item.test}</strong>
                    {item.dosage && <span style={{ color: '#00e5a3', marginLeft: '0.5rem' }}>{item.dosage}</span>}
                    {item.frequency && <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({item.frequency})</span>}
                  </div>
                  {item.value && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: item.isAbnormal ? '#ff2d55' : '#ffffff' }}>
                        {item.value}
                      </span>
                      {item.flag && (
                        <span style={{
                          marginLeft: '0.4rem',
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: item.isAbnormal ? 'rgba(255, 45, 85, 0.3)' : 'rgba(0, 229, 163, 0.2)',
                          color: item.isAbnormal ? '#ff4d6d' : '#00e5a3'
                        }}>
                          {item.flag}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              {t('noDocSkip')}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirmAndAttach}
            disabled={!extractedResult}
            className="btn btn-primary"
          >
            <CheckCircle2 size={18} />
            Attach Document & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
