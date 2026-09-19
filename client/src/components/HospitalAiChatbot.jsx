// client/src/components/HospitalAiChatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  PhoneCall,
  Stethoscope,
  Activity,
  ChevronRight,
  ShieldCheck,
  Video,
  Leaf,
  ExternalLink
} from 'lucide-react';

export default function HospitalAiChatbot({ onNavigate, currentTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' | 'kn'
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialMessages = [
    {
      id: 'welcome',
      sender: 'bot',
      textEn: "Hello! Welcome to our Smart Hospital Desk. I am your 24/7 AI Assistant. How can I assist you today? You can ask about OPD timings, emergency care, specialist departments, or start your digital patient check-in.",
      textKn: "ನಮಸ್ಕಾರ! ನಮ್ಮ ಸ್ಮಾರ್ಟ್ ಆಸ್ಪತ್ರೆಗೆ ಸುಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ 24/7 AI ಸಹಾಯಕ. OPD ಸಮಯ, ತುರ್ತು ಸೇವೆಗಳು, ಅಥವಾ ತಜ್ಞ ವೈದ್ಯರ ಬಗ್ಗೆ ನೀವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.",
      action: null,
      time: 'Just now'
    }
  ];

  const [messages, setMessages] = useState(initialMessages);

  const quickPrompts = [
    { en: "Book OPD Pre-Triage", kn: "OPD ಚೆಕ್-ಇನ್ ಪ್ರಾರಂಭಿಸಿ", action: 'kiosk' },
    { en: "24/7 Emergency Services", kn: "ತುರ್ತು ಚಿಕಿತ್ಸಾ ಮಾಹಿತಿ", query: 'emergency' },
    { en: "Specialist Departments", kn: "ವಿಭಾಗಗಳು ಮತ್ತು ತಜ್ಞರು", query: 'specialties' },
    { en: "Video Consultation", kn: "ವೀಡಿಯೊ ಕನ್ಸಲ್ಟೇಶನ್", action: 'teleconsult' },
    { en: "Ayurveda Care", kn: "ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆ", action: 'ayurveda' }
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateBotResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('emerg') || q.includes('urgent') || q.includes('trauma') || q.includes('accident') || q.includes('ambulance') || q.includes('ತುರ್ತು')) {
      return {
        textEn: "🚨 Emergency & Trauma Services are active 24/7. Immediate casualty desk phone: 08182-405505. For critical emergencies (severe chest pain, difficulty breathing, or trauma), proceed directly to the Emergency Casualty Wing.",
        textKn: "🚨 ತುರ್ತು ಮತ್ತು ಟ್ರಾಮಾ ಆರೈಕೆ 24/7 ಲಭ್ಯವಿದೆ. ತುರ್ತು ಸಹಾಯವಾಣಿ: 08182-405505. ಗಂಭೀರ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ನೇರವಾಗಿ ತುರ್ತು ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
        action: null
      };
    }

    if (q.includes('opd') || q.includes('time') || q.includes('timing') || q.includes('hour') || q.includes('ಸಮಯ')) {
      return {
        textEn: "🕒 Outpatient Department (OPD) Consultation Hours: Monday to Saturday: 8:00 AM – 8:00 PM. Emergency and Inpatient admissions are open 24 hours. You can pre-register your symptoms right now via Patient Check-In.",
        textKn: "🕒 OPD ಸಮಾಲೋಚನೆ ಸಮಯ: ಸೋಮವಾರದಿಂದ ಶನಿವಾರದವರೆಗೆ ಬೆಳಿಗ್ಗೆ 8:00 ರಿಂದ ರಾತ್ರಿ 8:00 ರವರೆಗೆ. ತುರ್ತು ಸೇವೆಗಳು 24 ಗಂಟೆಗಳ ಕಾಲ ಲಭ್ಯವಿದೆ.",
        action: { labelEn: "Start Patient Check-In", labelKn: "ರೋಗಿ ಚೆಕ್-ಇನ್", tab: 'kiosk' }
      };
    }

    if (q.includes('doctor') || q.includes('special') || q.includes('department') || q.includes('cardio') || q.includes('neuro') || q.includes('ortho') || q.includes('pediatric') || q.includes('ವೈದ್ಯರು')) {
      return {
        textEn: "🩺 Our Hospital Departments include: Cardiology (Cath Lab & CCU), Neurology & Neurosurgery, Orthopaedics & Joint Replacement, Pediatrics & NICU, Gastroenterology, Nephrology & Dialysis, and AYUSH Ayurveda Care.",
        textKn: "🩺 ನಮ್ಮ ಆಸ್ಪತ್ರೆಯ ವಿಭಾಗಗಳು: ಕಾರ್ಡಿಯಾಲಜಿ, ನ್ಯೂರಾಲಜಿ, ಮೂಳೆ ಮತ್ತು ಕೀಲು ವಿಭಾಗ, ಮಕ್ಕಳ ವಿಭಾಗ ಮತ್ತು NICU, ಗ್ಯಾಸ್ಟ್ರೋಎಂಟರಾಲಜಿ, ಹಾಗೂ ಆಯುರ್ವೇದ ಆರೈಕೆ.",
        action: { labelEn: "Open Doctor Portal", labelKn: "ವೈದ್ಯರ ಪೋರ್ಟಲ್", tab: 'doctor' }
      };
    }

    if (q.includes('video') || q.includes('call') || q.includes('tele') || q.includes('remote') || q.includes('ವೀಡಿಯೊ')) {
      return {
        textEn: "📹 Tele-Consultation Video Suite is ready. Connect remotely with specialist physicians from home, share your symptoms, and receive verified digital e-prescriptions instantly.",
        textKn: "📹 ಟೆಲಿಕನ್ಸಲ್ಟೇಶನ್ ವೀಡಿಯೊ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ. ಮನೆಯಿಂದಲೇ ತಜ್ಞ ವೈದ್ಯರೊಂದಿಗೆ ವೀಡಿಯೊ ಕರೆ ಮೂಲಕ ಸಮಾಲೋಚನೆ ನಡೆಸಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಪಡೆಯಿರಿ.",
        action: { labelEn: "Launch Video Consult", labelKn: "ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ", tab: 'teleconsult' }
      };
    }

    if (q.includes('ayurved') || q.includes('ayush') || q.includes('herb') || q.includes('panchakarma') || q.includes('ಆಯುರ್ವೇದ')) {
      return {
        textEn: "🌿 Our Integrative Ayurveda Care stream offers holistic lifestyle guidance, Prakriti constitution analysis, and accredited AYUSH specialist physician consultations alongside modern hospital care.",
        textKn: "🌿 ನಮ್ಮ ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸಾ ವಿಭಾಗದಲ್ಲಿ ಪ್ರಕೃತಿ ಪರೀಕ್ಷೆ, ಸಮಗ್ರ ಜೀವನಶೈಲಿ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ನುರಿತ ಆಯುಷ್ ತಜ್ಞ ವೈದ್ಯರ ಸಮಾಲೋಚನೆ ಲಭ್ಯವಿದೆ.",
        action: { labelEn: "Explore Ayurveda Care", labelKn: "ಆಯುರ್ವೇದ ವಿಭಾಗ", tab: 'ayurveda' }
      };
    }

    if (q.includes('check') || q.includes('intake') || q.includes('token') || q.includes('register') || q.includes('patient') || q.includes('ನೋಂದಣಿ')) {
      return {
        textEn: "📋 You can begin your digital intake now. It collects your presenting complaints, asks disease-specific follow-up questions, and generates a secure reusable Digital Case QR pass.",
        textKn: "📋 ನೀವು ಈಗಲೇ ಡಿಜಿಟಲ್ ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಬಹುದು. ಇದು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ದಾಖಲಿಸಿ, ವೈದ್ಯರಿಗಾಗಿ ಪೂರ್ವ ಸಮಾಲೋಚನಾ ವರದಿ ಮತ್ತು QR ಪಾಸ್ ನೀಡುತ್ತದೆ.",
        action: { labelEn: "Launch Patient Intake", labelKn: "ಚೆಕ್-ಇನ್ ಪ್ರಾರಂಭಿಸಿ", tab: 'kiosk' }
      };
    }

    return {
      textEn: "Thank you for reaching out. I can assist you with OPD timings, department guides, telemedicine video calls, or directing you to our Patient and Doctor portals.",
      textKn: "ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. OPD ಸಮಯ, ವಿಭಾಗಗಳ ಮಾಹಿತಿ, ಟೆಲಿಮೆಡಿಸಿನ್ ವೀಡಿಯೊ ಕರೆ ಅಥವಾ ರೋಗಿ ಮತ್ತು ವೈದ್ಯರ ಪೋರ್ಟಲ್‌ಗಳಿಗೆ ನಾನು ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ.",
      action: { labelEn: "Go to Patient Check-In", labelKn: "ರೋಗಿ ಚೆಕ್-ಇನ್‌ಗೆ ಹೋಗಿ", tab: 'kiosk' }
    };
  };

  const handleSend = (userText = null, actionTab = null) => {
    const text = userText || inputVal;
    if (!text.trim() && !actionTab) return;

    if (actionTab && onNavigate) {
      onNavigate(actionTab);
      setIsOpen(false);
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      textEn: text,
      textKn: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          textEn: response.textEn,
          textKn: response.textKn,
          action: response.action,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Hospital AI Assistant"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '999px',
              padding: '12px 20px',
              boxShadow: '0 8px 30px rgba(29, 78, 216, 0.45)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14.5px',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.01em',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(2, 132, 199, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(29, 78, 216, 0.45)';
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <span>Hospital AI Desk</span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              24/7
            </span>
          </button>
        </div>
      )}

      {/* Expanded Chatbot Modal / Side Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 48px)',
          background: '#0d162d',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            padding: '16px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <Bot size={22} />
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)'
                }}>
                  Hospital AI Assistant
                </div>
                <div style={{ fontSize: '11px', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                  24/7 Smart Virtual Triage Desk
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Toggle Language"
              >
                {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(15, 23, 42, 0.85)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (p.action && onNavigate) {
                    onNavigate(p.action);
                    setIsOpen(false);
                  } else {
                    handleSend(lang === 'kn' ? p.kn : p.en);
                  }
                }}
                style={{
                  background: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.35)',
                  color: '#93c5fd',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {lang === 'kn' ? p.kn : p.en}
              </button>
            ))}
          </div>

          {/* Chat Messages Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(8, 14, 30, 0.9)'
          }}>
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    maxWidth: '88%',
                    padding: '12px 14px',
                    borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    background: isBot ? '#132145' : '#2563eb',
                    border: isBot ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    lineHeight: '1.55',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                  }}>
                    {lang === 'kn' ? (m.textKn || m.textEn) : (m.textEn || m.textKn)}

                    {/* Interactive Action Button if linked */}
                    {m.action && onNavigate && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate(m.action.tab);
                            setIsOpen(false);
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{lang === 'kn' ? (m.action.labelKn || m.action.labelEn) : m.action.labelEn}</span>
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', padding: '0 4px' }}>
                    {m.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontStyle: 'italic' }}>
                <Sparkles size={14} className="animate-spin" />
                <span>AI Assistant is drafting response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              background: '#0c152a',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={lang === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ (OPD, ತುರ್ತು, ವಿಭಾಗಗಳು)..." : "Ask about OPD, doctors, emergency, or symptoms..."}
              style={{
                flex: 1,
                background: '#070d1e',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: inputVal.trim() ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputVal.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
