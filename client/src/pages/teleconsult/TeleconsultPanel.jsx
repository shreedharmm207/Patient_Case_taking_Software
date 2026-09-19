// client/src/pages/teleconsult/TeleconsultPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Activity,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Send,
  Sparkles,
  QrCode,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TeleconsultPanel({ patientData, onEndCall }) {
  const { lang, speak } = useLanguage();

  // Media states
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [callDuration, setCallDuration] = useState(145);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'rx', 'chat'

  // Prescription builder
  const [diagnosis, setDiagnosis] = useState('Suspected Angina / Acute Coronary Syndrome (Stabilized)');
  const [medsList, setMedsList] = useState([
    { name: 'Tab. Aspirin 75mg', dosage: '1 tablet once daily after lunch', duration: '14 days' },
    { name: 'Tab. Atorvastatin 20mg', dosage: '1 tablet at bedtime', duration: '30 days' },
    { name: 'Tab. Sorbitrate 5mg', dosage: 'Sublingual strictly SOS for chest tightness', duration: 'As needed' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [rxIssued, setRxIssued] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: 'Good morning! I am Dr. Arvind. I have reviewed your MEDIKIOSK pre-consultation intake.', time: '10:02 AM' },
    { sender: 'patient', text: 'Hello doctor, feeling chest tightness since morning and mild nausea.', time: '10:03 AM' },
    { sender: 'system', text: 'Translation: Patient reported chest heaviness since morning. Cross-checked with Troponin I test report.', time: '10:03 AM' },
    { sender: 'doctor', text: 'Understood. Your SpO2 is 98% and heart rate is 82. Let me examine your breathing right now on video.', time: '10:04 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Real-time speech transcription
  const [liveTranscript, setLiveTranscript] = useState([
    { speaker: 'Doctor', en: 'Can you take a deep breath and tell me if the pain increases?', kn: 'ದೀರ್ಘವಾಗಿ ಉಸಿರಾಡಿ, ನೋವು ಹೆಚ್ಚಾಗುತ್ತಿದೆಯೇ ಎಂದು ಹೇಳಿ?' },
    { speaker: 'Patient', en: 'No, it stays like a heavy pressure across my mid chest.', kn: 'ಇಲ್ಲ, ಎದೆಯ ಮಧ್ಯದಲ್ಲಿ ಭಾರವಾದ ಒತ್ತಡದಂತೆ ಹಾಗೆಯೇ ಇರುತ್ತದೆ.' }
  ]);

  const localVideoRef = useRef(null);
  const [cameraStreamAvailable, setCameraStreamAvailable] = useState(false);

  useEffect(() => {
    let streamObj = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamObj = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setCameraStreamAvailable(true);
        })
        .catch(() => {
          setCameraStreamAvailable(false);
        });
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (streamObj) {
        streamObj.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'doctor',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setMedsList((prev) => [
      ...prev,
      { name: newMedName, dosage: newMedDosage || 'As directed by physician', duration: '7 days' }
    ]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleIssueRx = () => {
    setRxIssued(true);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
      
      {/* Top Banner Header: Dark Hospital Aesthetic */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '16px 22px',
        background: '#111c35',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '18px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
          }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Tele-Health | Video Consultation Suite
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                background: 'rgba(37, 99, 235, 0.2)',
                color: '#93c5fd',
                border: '1px solid rgba(37, 99, 235, 0.4)'
              }}>
                HD 1080P • ABDM ENCRYPTED
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Patient: <strong style={{ color: '#ffffff' }}>{patientData?.fullName || 'Gangamma B. (58/F)'}</strong> · Live Duration: <span style={{ color: '#34d399', fontWeight: 700 }}>{formatTime(callDuration)}</span>
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          fontSize: '12.5px',
          fontWeight: 700,
          border: '1px solid rgba(16, 185, 129, 0.35)'
        }}>
          <ShieldCheck size={16} />
          <span>End-to-End Encrypted ABDM Stream</span>
        </div>
      </div>

      {/* Main Grid: Left Video Window + Right Teleconsult Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>

        {/* LEFT: Video Conference Window */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/10',
            background: '#0a1226',
            borderRadius: '20px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Screen Share or Doctor Feed */}
            {screenShareActive ? (
              <div style={{
                width: '100%',
                height: '100%',
                background: '#0d1730',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: '#ffffff'
              }}>
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  maxWidth: '480px',
                  textAlign: 'center'
                }}>
                  <Activity size={36} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: '#ffffff' }}>Live ECG & Troponin I Telemetry Screen</h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                    Physician is sharing hospital diagnostic monitor: Troponin I 0.28 ng/mL (High Alert).
                  </p>
                  <div style={{ marginTop: '1rem', display: 'inline-flex', padding: '4px 12px', borderRadius: '999px', background: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.4)', fontSize: '0.78rem', fontWeight: 700 }}>
                    Immediate Assessment Active
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #0f1c3f 0%, #070e20 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    boxShadow: '0 0 35px rgba(37, 99, 235, 0.45)',
                    border: '3px solid rgba(255, 255, 255, 0.25)'
                  }}>
                    <Stethoscope size={48} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Dr. Arvind N. (MD, General Medicine)
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                    Attending Physician · Victoria Hospital OPD
                  </div>
                </div>

                {/* Patient Picture-in-Picture Viewport */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  width: '140px',
                  height: '95px',
                  borderRadius: '12px',
                  background: '#0b1329',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {videoActive ? (
                    cameraStreamAvailable ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
                        <User size={26} color="#38bdf8" style={{ margin: '0 auto 2px auto' }} />
                        <div>Patient Camera</div>
                      </div>
                    )
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '10px' }}>Video Off</div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    You
                  </div>
                </div>

                {/* Top Video Overlays */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <Clock size={13} color="#34d399" />
                    <span>{formatTime(callDuration)}</span>
                  </div>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    color: '#34d399',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    Signal: Excellent (48ms)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Control Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#111c35',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: micActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: micActive ? '#93c5fd' : '#fda4af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setVideoActive(!videoActive)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: videoActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: videoActive ? '#93c5fd' : '#fda4af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title={videoActive ? 'Stop Video' : 'Start Video'}
            >
              {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setScreenShareActive(!screenShareActive)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: screenShareActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: screenShareActive ? '#34d399' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Share Medical Telemetry Screen"
            >
              <Share2 size={18} />
            </button>

            {/* Clean, Elegant End Call Button (Not a harsh red block) */}
            <button
              type="button"
              onClick={onEndCall}
              style={{
                padding: '0 20px',
                height: '44px',
                borderRadius: '999px',
                border: '1.5px solid rgba(244, 63, 94, 0.45)',
                background: 'rgba(244, 63, 94, 0.18)',
                color: '#fda4af',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.3)';
                e.currentTarget.style.borderColor = '#f43f5e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.45)';
              }}
            >
              <PhoneOff size={16} />
              <span>End Consultation</span>
            </button>
          </div>

          {/* Bilingual Speech Transcription Box */}
          <div style={{
            background: '#111c35',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <strong style={{ fontSize: '13.5px', color: '#ffffff' }}>Real-time Speech Transcription (EN & KN)</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {liveTranscript.map((t, idx) => (
                <div key={idx} style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '13px'
                }}>
                  <div style={{ color: t.speaker === 'Doctor' ? '#60a5fa' : '#34d399', fontWeight: 700, marginBottom: '2px' }}>
                    {t.speaker}:
                  </div>
                  <div style={{ color: '#f1f5f9' }}>{t.en}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>
                    ಕನ್ನಡ: {t.kn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Workspace Tabs (Intake Summary, Digital Rx, Chat) */}
        <div style={{
          background: '#111c35',
          borderRadius: '20px',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              style={{
                flex: 1,
                padding: '14px 10px',
                border: 'none',
                background: activeTab === 'summary' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: activeTab === 'summary' ? '#93c5fd' : '#94a3b8',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: activeTab === 'summary' ? '2.5px solid #3b82f6' : 'none'
              }}
            >
              Symptoms & Vitals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rx')}
              style={{
                flex: 1,
                padding: '14px 10px',
                border: 'none',
                background: activeTab === 'rx' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: activeTab === 'rx' ? '#93c5fd' : '#94a3b8',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: activeTab === 'rx' ? '2.5px solid #3b82f6' : 'none'
              }}
            >
              Digital Prescription
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '14px 10px',
                border: 'none',
                background: activeTab === 'chat' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: activeTab === 'chat' ? '#93c5fd' : '#94a3b8',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: activeTab === 'chat' ? '2.5px solid #3b82f6' : 'none'
              }}
            >
              In-Call Chat
            </button>
          </div>

          {/* TAB 1: Intake Summary */}
          {activeTab === 'summary' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge badge-urgent">PRIORITY ALERT</span>
                  <strong style={{ fontSize: '13px', color: '#fda4af' }}>Red-Flag ACS Risk Detected</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#fecdd3', margin: 0, lineHeight: '1.45' }}>
                  Crushing retrosternal chest tightness radiating to left arm. Uploaded lab OCR indicates elevated Troponin I (0.28 ng/mL).
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                  SOCRATES Symptom Decomposition:
                </span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  marginTop: '8px',
                  fontSize: '12.5px'
                }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Site:</span> <strong style={{ color: '#ffffff' }}>Retrosternal</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Onset:</span> <strong style={{ color: '#ffffff' }}>Sudden (3h ago)</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Character:</span> <strong style={{ color: '#ffffff' }}>Crushing ache</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Radiation:</span> <strong style={{ color: '#ffffff' }}>Left arm & jaw</strong>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '12.5px'
              }}>
                <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '3px' }}>
                  Safety Cross-Verification:
                </div>
                <div style={{ color: '#a7f3d0', lineHeight: '1.45' }}>
                  Allergy Cross-Check: Verified <strong>No Penicillin Allergy conflict</strong> for this patient. Blood pressure elevated at home (154/98).
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Prescription Pad */}
          {activeTab === 'rx' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Physician Diagnosis:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#091124',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Prescribed Medications:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {medsList.map((m, idx) => (
                    <div key={idx} style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12.5px'
                    }}>
                      <div>
                        <strong style={{ color: '#ffffff' }}>{m.name}</strong>
                        <div style={{ color: '#94a3b8', fontSize: '11.5px' }}>{m.dosage} · {m.duration}</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Active Rx</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini add form */}
              <form onSubmit={handleAddMed} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  style={{ flex: 1.2, padding: '8px 10px', borderRadius: '6px', background: '#091124', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', fontSize: '12px' }}
                />
                <input
                  type="text"
                  placeholder="Dosage..."
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', background: '#091124', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0 12px', fontSize: '12px' }}>
                  + Add
                </button>
              </form>

              {rxIssued ? (
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <QrCode size={30} color="#34d399" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '13px' }}>
                      ABDM Digital Prescription Signed & Dispatched!
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Signed by Dr. Arvind (Reg: KMC-72910) · QR Sync Verified
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleIssueRx}
                  className="btn btn-primary"
                  style={{ marginTop: '6px', width: '100%', padding: '0.65rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Issue Signed Digital ABDM Prescription</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: In-Call Chat */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '380px' }}>
              <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.25)' }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'doctor' ? 'flex-end' : msg.sender === 'system' ? 'center' : 'flex-start',
                      maxWidth: msg.sender === 'system' ? '92%' : '80%',
                      background: msg.sender === 'doctor' ? '#2563eb' : msg.sender === 'system' ? 'rgba(16, 185, 129, 0.15)' : '#18284c',
                      color: '#ffffff',
                      border: msg.sender === 'system' ? '1px dashed rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12.5px'
                    }}
                  >
                    <div style={{ color: msg.sender === 'doctor' ? '#bfdbfe' : msg.sender === 'system' ? '#34d399' : '#94a3b8', fontWeight: 700, fontSize: '10.5px', marginBottom: '2px' }}>
                      {msg.sender.toUpperCase()} · {msg.time}
                    </div>
                    <div style={{ lineHeight: '1.45' }}>{msg.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '8px', background: '#0e172e' }}>
                <input
                  type="text"
                  placeholder="Type advice or message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#070d1e', border: '1px solid rgba(255, 255, 255, 0.14)', color: '#ffffff', fontSize: '12.5px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 14px' }}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
