// client/src/components/AiChatbotDrawer.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Activity,
  HeartPulse,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

const QUICK_PROMPTS = [
  'What are red-flag chest pain symptoms?',
  'Explain high Troponin I lab test',
  'What is normal blood pressure for adults?',
  'AYUSH dietary recommendations for acidity',
  'How do I prepare for my doctor consultation?'
];

const KNOWLEDGE_RESPONSES = {
  'chest pain': `🚨 **Clinical Urgency Assessment**:
Chest pain is considered a high-priority red flag if accompanied by:
- Crushing pressure or tightness radiating to left arm, shoulder, or jaw.
- Shortness of breath, dizziness, cold sweating (diaphoresis).
- Nausea or sudden fatigue.

**Immediate Guidance**: If experiencing these symptoms, proceed immediately to the Emergency Room or notify the hospital triage nurse. MEDIKIOSK will alert the attending doctor in the priority queue.`,
  
  'troponin': `📊 **Troponin I Lab Biomarker**:
- **Normal Range**: Typically < 0.04 ng/mL.
- **Elevated Levels (> 0.10 ng/mL)** indicate myocardial muscle stress or cellular injury (e.g. Acute Coronary Syndrome).
- If your uploaded lab shows **0.28 ng/mL**, the attending physician will prioritize your ECG and immediate clinical evaluation.`,
  
  'blood pressure': `🩺 **Blood Pressure Standards (AHA/ACC)**:
- **Normal**: Systolic < 120 and Diastolic < 80 mmHg.
- **Elevated**: Systolic 120-129 and Diastolic < 80 mmHg.
- **Stage 1 Hypertension**: Systolic 130-139 or Diastolic 80-89 mmHg.
- **Stage 2 Hypertension**: Systolic ≥ 140 or Diastolic ≥ 90 mmHg.
- **Hypertensive Crisis (> 180/120)**: Requires emergency attention.`,
  
  'acidity': `🌿 **AYUSH Integrative Guidance for Amlapitta (Hyperacidity)**:
- **Prakriti Association**: Usually involves aggravation of **Pitta Dosha** and **Tikshnagni**.
- **Pathya (Beneficial)**: Coconut water, soaked raisins, barley, cumin coriander water, ghee in moderation.
- **Apathya (Avoid)**: Deep-fried snacks, vinegar, excessive red chili, irregular late-night meals.
- Classical formulations like **Amlaki Rasayana** and **Kamadudha Rasa** can be discussed with your AYUSH physician.`,
  
  'consultation': `📋 **Preparing for Your Doctor Consultation**:
1. **Have your vitals ready**: Blood pressure, temperature, and recent weight.
2. **List all medications**: Include dosages and over-the-counter supplements.
3. **Detail chief complaint**: When it started, exact location, and what makes it better or worse.
4. **Digitize reports**: Upload prescriptions and lab tests via the MEDIKIOSK scanner for instant doctor review.`
};

export default function AiChatbotDrawer({ onTransferToIntake }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am the **MEDIKIOSK Clinical AI Assistant**. How can I assist you with your symptoms, pre-consultation intake, or medical report questions today?',
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // AI response simulation with clinical logic
    setTimeout(() => {
      let aiText = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('chest') || qLower.includes('heart') || qLower.includes('angina')) {
        aiText = KNOWLEDGE_RESPONSES['chest pain'];
      } else if (qLower.includes('troponin') || qLower.includes('lab') || qLower.includes('report')) {
        aiText = KNOWLEDGE_RESPONSES['troponin'];
      } else if (qLower.includes('pressure') || qLower.includes('bp') || qLower.includes('hypertension')) {
        aiText = KNOWLEDGE_RESPONSES['blood pressure'];
      } else if (qLower.includes('acid') || qLower.includes('ayush') || qLower.includes('pitta') || qLower.includes('ayurveda')) {
        aiText = KNOWLEDGE_RESPONSES['acidity'];
      } else if (qLower.includes('prepare') || qLower.includes('doctor') || qLower.includes('intake')) {
        aiText = KNOWLEDGE_RESPONSES['consultation'];
      } else {
        aiText = `Thank you for detailing that: "${query}".

In a standard clinical intake, we analyze:
1. **Onset and duration**: How long this has been progressing.
2. **Associated symptoms**: Any fever, nausea, or radiating pain.
3. **Previous history**: Ongoing medications or known allergies.

Would you like to auto-populate this symptom directly into your **Patient Check-In Kiosk** for the doctor?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '999px',
            background: '#059669',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.92rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#a7f3d0',
            boxShadow: '0 0 8px #a7f3d0'
          }} />
          <Bot size={20} />
          <span>AI Health Assistant</span>
        </button>
      )}

      {/* Slide-out Chat Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '390px',
          maxWidth: '92vw',
          height: '620px',
          maxHeight: '84vh',
          zIndex: 100,
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '14px 18px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  MEDIKIOSK Assistant
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Clinical Intake Copilot · Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#f8fafc'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: m.sender === 'user' ? '#059669' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}
                </div>
                <span style={{
                  fontSize: '10px',
                  color: '#94a3b8',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {m.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '8px 14px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} color="#059669" />
                <span>Assistant analyzing clinical context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          <div style={{
            padding: '8px 12px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            overflowX: 'auto',
            display: 'flex',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '12px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Ask a medical or triage question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>

          {/* Disclaimer Footer */}
          <div style={{
            padding: '6px 12px',
            background: '#f1f5f9',
            fontSize: '10px',
            color: '#64748b',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0'
          }}>
            Triage Assistant only. For medical emergencies, visit hospital casualty immediately.
          </div>
        </div>
      )}
    </>
  );
}
