import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Settings2,
  RotateCcw,
  Radio,
  X,
  Send,
  Play,
  Languages,
  Check,
  Zap,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  CHATGPT_NEURAL_VOICES,
  VOICE_PRESETS,
  JAM_CHARACTER_VOICES,
  LOCKED_BOY_VOICE,
  CharacterVoice,
  getSavedCharacterVoice,
  saveCharacterVoice,
  getStableCharacterBrowserVoice,
  findBestMaleVoice,
  cleanSpeechText,
  isMaleVoice,
  isFemaleVoice,
  speakLockedBoyVoice,
  fetchNeuralTTS,
  playNeuralAudio,
  stopCurrentAudio,
  AppLanguage,
  NeuralVoice,
} from '../utils/voiceHelper';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VoiceMessage {
  id: string;
  sender: 'user' | 'jam';
  text: string;
  timestamp: string;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [userTranscript, setUserTranscript] = useState('');

  // 10 Supported Languages: Default to Hindi
  const [activeLanguage, setActiveLanguage] = useState<AppLanguage>(SUPPORTED_LANGUAGES[0]);

  // Voice Engine: 'neural' (ChatGPT High-Definition Studio Voice) vs 'fast-boy' (Local Fallback)
  const [voiceEngine, setVoiceEngine] = useState<'neural' | 'fast-boy'>(() => {
    return (localStorage.getItem('jam_ai_voice_engine') as any) || 'neural';
  });
  // Selected ChatGPT Neural Voice (Default: Puck - energetic young guy / brother voice)
  const [selectedNeuralVoice, setSelectedNeuralVoice] = useState<string>(() => {
    return localStorage.getItem('jam_ai_neural_voice') || 'Puck';
  });

  useEffect(() => {
    localStorage.setItem('jam_ai_voice_engine', voiceEngine);
  }, [voiceEngine]);

  useEffect(() => {
    localStorage.setItem('jam_ai_neural_voice', selectedNeuralVoice);
  }, [selectedNeuralVoice]);

  // Browser Fallback voice parameters
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<string>('');
  const [voiceRate, setVoiceRate] = useState<number>(1.12);
  const [voicePitch, setVoicePitch] = useState<number>(0.95);
  const [activePreset, setActivePreset] = useState<string>('boy-energetic');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const [aiSpeech, setAiSpeech] = useState<string>(SUPPORTED_LANGUAGES[0].greeting);
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'jam',
      text: SUPPORTED_LANGUAGES[0].greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioTesting, setAudioTesting] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceDebounceTimerRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);

  // Play subtle synth audio cues for interaction feedback
  const playSoundEffect = (type: 'connect' | 'ping' | 'end') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'connect') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'ping') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'end') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // ignore
    }
  };

  // Find best available browser voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const bestMale = findBestMaleVoice(voices, activeLanguage.code);
        if (bestMale && !selectedBrowserVoice) {
          setSelectedBrowserVoice(bestMale.name);
        }
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [activeLanguage, selectedBrowserVoice]);

  // Canvas visualizer rendering glowing orb and dynamic voice waves
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Sphere base radius & glow based on current state
      let baseRadius = 45;
      let pulse = Math.sin(phase * 2) * 4;

      if (callStatus === 'speaking') {
        baseRadius = 55;
        pulse = Math.sin(phase * 4) * 10;
      } else if (callStatus === 'listening') {
        baseRadius = 50;
        pulse = Math.sin(phase * 6) * 6;
      } else if (callStatus === 'thinking') {
        baseRadius = 46;
        pulse = Math.sin(phase * 8) * 3;
      }

      const radius = baseRadius + pulse;

      // Radiant Background Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.4,
        centerX,
        centerY,
        radius * 2.2
      );

      if (callStatus === 'speaking') {
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
        glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else if (callStatus === 'listening') {
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.2)');
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else if (callStatus === 'thinking') {
        glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
        glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Core Solid Sphere Gradient
      const sphereGrad = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
      );

      if (callStatus === 'speaking') {
        sphereGrad.addColorStop(0, '#818cf8');
        sphereGrad.addColorStop(0.5, '#4f46e5');
        sphereGrad.addColorStop(1, '#06b6d4');
      } else if (callStatus === 'listening') {
        sphereGrad.addColorStop(0, '#34d399');
        sphereGrad.addColorStop(0.5, '#059669');
        sphereGrad.addColorStop(1, '#047857');
      } else if (callStatus === 'thinking') {
        sphereGrad.addColorStop(0, '#fbbf24');
        sphereGrad.addColorStop(0.5, '#d97706');
        sphereGrad.addColorStop(1, '#b45309');
      } else {
        sphereGrad.addColorStop(0, '#6366f1');
        sphereGrad.addColorStop(1, '#3b82f6');
      }

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Multi-layer Soundwave Orbit Rings
      const ringCount = callStatus === 'speaking' ? 4 : callStatus === 'listening' ? 3 : 2;
      for (let i = 1; i <= ringCount; i++) {
        const ringRadius = radius + i * 16 + Math.sin(phase * 3 + i) * 8;
        ctx.strokeStyle =
          callStatus === 'speaking'
            ? `rgba(165, 180, 252, ${0.45 / i})`
            : callStatus === 'listening'
            ? `rgba(110, 231, 183, ${0.45 / i})`
            : `rgba(148, 163, 184, ${0.25 / i})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      phase += 0.035;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, callStatus]);

  // Main Speech Delivery function: Instant locked boy voice delivery (<30ms start)
  const speakText = async (text: string, onEndCallback?: () => void) => {
    stopCurrentAudio();
    setCallStatus('speaking');
    isSpeakingRef.current = true;

    const clean = cleanSpeechText(text);
    if (!clean) {
      isSpeakingRef.current = false;
      setCallStatus('idle');
      if (onEndCallback) onEndCallback();
      return;
    }

    // Finished speech handler
    const handlePlaybackFinished = () => {
      isSpeakingRef.current = false;
      setCallStatus('idle');
      if (onEndCallback) onEndCallback();
      else if (handsFree && !isMuted) {
        // Continuous conversational loop
        setTimeout(() => startListening(), 200);
      }
    };

    const character = getSavedCharacterVoice();

    // 1. ChatGPT Neural Voice Mode (High-Definition Studio Quality Audio - Never Robotic)
    if (voiceEngine === 'neural') {
      try {
        const audioUri = await fetchNeuralTTS(clean, character.neuralVoice || selectedNeuralVoice, activeLanguage.id);
        if (audioUri) {
          await playNeuralAudio(audioUri, handlePlaybackFinished);
          return;
        }
      } catch (neuralErr) {
        console.warn('Neural audio fallback:', neuralErr);
      }
    }

    // 2. Fast boy voice fallback
    speakLockedBoyVoice(clean, handlePlaybackFinished);
  };

  // Preview Voice Function
  const handleTestVoice = async () => {
    if (audioTesting) return;
    setAudioTesting(true);
    stopCurrentAudio();

    const sampleText = `${activeLanguage.greeting} मैं JAM AI की प्राकृतिक भारतीय आवाज़ में बात कर रहा हूँ!`;

    if (voiceEngine === 'neural') {
      try {
        const audioUri = await fetchNeuralTTS(sampleText, selectedNeuralVoice, activeLanguage.id);
        await playNeuralAudio(audioUri, () => setAudioTesting(false));
        return;
      } catch {
        // Fall back to device synthesis for test preview
      }
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      const voices = window.speechSynthesis.getVoices();
      const bestMale = findBestMaleVoice(voices, activeLanguage.code);
      if (bestMale) utterance.voice = bestMale;
      utterance.onend = () => setAudioTesting(false);
      utterance.onerror = () => setAudioTesting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioTesting(false);
    }
  };

  // Switch Active Language among the 10 supported languages
  const handleSelectLanguage = (lang: AppLanguage) => {
    setActiveLanguage(lang);
    stopCurrentAudio();

    // Update speech recognition language immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const greeting = lang.greeting;
    setAiSpeech(greeting);
    const newMsg: VoiceMessage = {
      id: Math.random().toString(),
      sender: 'jam',
      text: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Speak greeting in selected language
    speakText(greeting);
  };

  // Start Speech Recognition (STT) configured for the active language
  const startListening = () => {
    if (isMuted || isSpeakingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      // Configure to listen strictly in the chosen language code
      recognition.lang = activeLanguage.code;

      recognition.onstart = () => {
        setCallStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        setUserTranscript(currentText);

        if (final && final.trim()) {
          if (silenceDebounceTimerRef.current) clearTimeout(silenceDebounceTimerRef.current);
          handleUserVoiceSubmit(final.trim());
        } else if (interim && interim.trim().length > 1) {
          if (silenceDebounceTimerRef.current) clearTimeout(silenceDebounceTimerRef.current);
          // 380ms silence debounce: rapid instant answer triggering under 0.9s
          silenceDebounceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.abort();
              } catch {}
            }
            handleUserVoiceSubmit(interim.trim());
          }, 380);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition status:', event.error);
        }
        setCallStatus('idle');
      };

      recognition.onend = () => {
        if (callStatus === 'listening') {
          setCallStatus('idle');
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setCallStatus('idle');
    }
  };

  // Submit user query to /api/voice-chat with sub-0.9s turnaround
  const handleUserVoiceSubmit = async (queryText: string) => {
    if (!queryText.trim() || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (silenceDebounceTimerRef.current) clearTimeout(silenceDebounceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    setCallStatus('thinking');
    playSoundEffect('ping');
    const startTime = performance.now();

    const newMsg: VoiceMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setUserTranscript('');

    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: queryText,
          history: messages.slice(-3),
          language: `${activeLanguage.label} (${activeLanguage.englishName})`,
        }),
      });

      if (!res.ok) throw new Error('Voice server response error');
      const data = await res.json();
      const answer = data.reply || 'हाँ भाई, मैं आपकी बात समझ गया।';

      const durationMs = Math.round(performance.now() - startTime);
      setLatencyMs(durationMs);

      const aiMsg: VoiceMessage = {
        id: Math.random().toString(),
        sender: 'jam',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAiSpeech(answer);

      // Instant locked boy voice playback
      speakText(answer);
    } catch {
      const fallback = 'हाँ भाई, बताइए मैं आपकी क्या मदद करूँ?';
      setAiSpeech(fallback);
      speakText(fallback);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // When call opens, play chime and say greeting
  useEffect(() => {
    if (isOpen) {
      playSoundEffect('connect');
      const timer = setTimeout(() => {
        speakText(activeLanguage.greeting);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      stopCurrentAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setCallStatus('idle');
    }
  }, [isOpen]);

  const handleEndCall = () => {
    playSoundEffect('end');
    stopCurrentAudio();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    onClose();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setCallStatus('idle');
    }
  };

  const handleInterrupt = () => {
    stopCurrentAudio();
    isSpeakingRef.current = false;
    setCallStatus('idle');
    startListening();
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-call-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-3 sm:p-4 transition-all"
    >
      <div className="relative flex flex-col w-full max-w-xl h-[90vh] max-h-[780px] rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Top App Bar with Creator Signature */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white font-black text-sm shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              JAM
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">JAM AI Live Voice</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                  आवाज़ें Unlocked (Ultra HD)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-sm">
                  <Zap className="h-2.5 w-2.5 text-cyan-400" />
                  {latencyMs ? `${(latencyMs / 1000).toFixed(2)}s Speed` : '< 0.9s Lightning'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">«Created by Vihaan Giri»</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="voice-change-top-btn"
              onClick={() => setShowSettings(!showSettings)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
              title="आवाज़ बदलें या अनलॉक करें"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>आवाज़ बदलें</span>
            </button>
            <button
              id="voice-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-colors ${
                showSettings
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Voice & Language Settings"
              aria-label="Voice & Language Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <button
              id="close-voice-call-btn"
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Voice Call"
              aria-label="Close Voice Call"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 10 Multiple Languages Bar */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
            <Languages className="h-3.5 w-3.5 text-indigo-400" />
            <span>10 Languages:</span>
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleSelectLanguage(lang)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeLanguage.id === lang.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {activeLanguage.id === lang.id && <Check className="h-3 w-3 text-indigo-200" />}
            </button>
          ))}
        </div>

        {/* Voice Settings Flyout */}
        {showSettings && (
          <div className="px-5 py-4 bg-slate-900/95 border-b border-slate-800 text-xs text-slate-300 animate-in slide-in-from-top-2 backdrop-blur-md max-h-[340px] overflow-y-auto">
            {/* Engine Toggle */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  आवाज़ मोड (Voice Speed & Engine)
                </span>
                <p className="text-[11px] text-slate-400">
                  डिफ़ॉल्ट वॉइस पूर्णतः बंद है। केवल असली लड़के की आवाज़ (Locked Boy Voice)
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setVoiceEngine('fast-boy')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    voiceEngine === 'fast-boy'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  ⚡ 0.9s Ultra-Fast (Locked Boy)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceEngine('neural')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    voiceEngine === 'neural'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎙️ JAM AI Natural HD
                </button>
              </div>
            </div>

            {/* All Unlocked Voices Grid */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    प्राकृतिक भारतीय आवाज़ें (Natural Indian Timbre - 100% मानवीय आवाज़)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    अपनी पसंद की आवाज़ चुनें — यह तुरंत लागू होगी और सेव रहेगी
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={audioTesting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{audioTesting ? 'आवाज़ बज रही है...' : '▶️ आवाज़ सुनें (Test)'}</span>
                </button>
              </div>

              {/* Character Voice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {JAM_CHARACTER_VOICES.map((char) => {
                  const isSelected = selectedNeuralVoice === (char.neuralVoice || char.id);
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        saveCharacterVoice(char.id);
                        setSelectedNeuralVoice(char.neuralVoice || 'Aryan');
                        setVoiceEngine('neural');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{char.avatar}</span>
                          <span>{char.name}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            सक्रिय
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-indigo-300/90 mt-0.5">{char.labelHindi}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{char.role}</div>
                    </button>
                  );
                })}
              </div>

              {/* JAM AI Studio Voices */}
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                विशेष भारतीय न्यूरल प्रोफाइल (Indian Neural Profiles):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CHATGPT_NEURAL_VOICES.map((v) => {
                  const isSelected = selectedNeuralVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedNeuralVoice(v.id);
                        setVoiceEngine('neural');
                      }}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{v.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{v.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calibrated Pitch and Speed Controls */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    सिस्टम आवाज़ (लड़के की केवल)
                  </label>
                  <select
                    value={selectedBrowserVoice}
                    onChange={(e) => setSelectedBrowserVoice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {typeof window !== 'undefined' &&
                      'speechSynthesis' in window &&
                      window.speechSynthesis
                        .getVoices()
                        .filter((v) => !isFemaleVoice(v))
                        .map((v) => (
                          <option key={v.name} value={v.name}>
                            {isMaleVoice(v) ? '👦 ' : ''}
                            {v.name} ({v.lang})
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    पिच (आवाज़ की भारीपन): {voicePitch.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.80"
                    max="1.15"
                    step="0.02"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    रफ़्तार: {voiceRate.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.85"
                    max="1.35"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Interactive Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-5 relative overflow-hidden">
          {/* Animated Glowing Canvas Visualizer */}
          <div className="relative w-full max-w-[270px] h-[220px] flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Center Status Badge */}
            <div className="absolute bottom-1 inset-x-0 flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-lg backdrop-blur-md transition-all ${
                  callStatus === 'speaking'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/20'
                    : callStatus === 'listening'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 ring-2 ring-emerald-500/20 animate-pulse'
                    : callStatus === 'thinking'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 ring-2 ring-amber-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                {callStatus === 'speaking' && `🔊 JAM AI बोल रहा है (${activeLanguage.label})...`}
                {callStatus === 'listening' &&
                  `🎙️ ${activeLanguage.label} में सुन रहा है... (बोलिए)`}
                {callStatus === 'thinking' && '⚡ सोच रहा है...'}
                {callStatus === 'idle' &&
                  `बात करने के लिए माइक दबाएँ (${activeLanguage.label})`}
              </span>
            </div>
          </div>

          {/* Active Voice Indicator & Quick Switcher */}
          <div className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-xs mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                आवाज़:
              </span>
              <span className="font-bold text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px]">
                {selectedNeuralVoice} (Ultra HD Neural)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              <span>आवाज़ बदलें / अनलॉक</span>
            </button>
          </div>

          {/* Real-Time Dialogue Subtitle Card */}
          <div className="w-full mt-2.5 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm max-h-[130px] overflow-y-auto">
            {userTranscript ? (
              <p className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1.5">
                <span className="text-slate-500">आप:</span> "{userTranscript}"
              </p>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                <span className="text-indigo-400 font-semibold mr-1.5">JAM AI:</span>
                {aiSpeech}
              </p>
            )}
          </div>

          {/* Quick Fallback Text Input if User Prefers Typing in Call */}
          <div className="w-full mt-3 flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textInput.trim()) {
                  handleUserVoiceSubmit(textInput.trim());
                  setTextInput('');
                }
              }}
              placeholder={`${activeLanguage.label} में लिखें या बोलें (उदा: हेलो ब्रो!)...`}
              className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              id="voice-send-btn"
              onClick={() => {
                if (textInput.trim()) {
                  handleUserVoiceSubmit(textInput.trim());
                  setTextInput('');
                }
              }}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              title="Send"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Call Action Controls */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          {/* Hands-Free Conversation Toggle */}
          <button
            id="hands-free-toggle"
            onClick={() => setHandsFree(!handsFree)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              handsFree
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Continuous Conversation Mode"
          >
            <Radio
              className={`h-3.5 w-3.5 ${
                handsFree ? 'text-indigo-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className="hidden sm:inline">हैंड्स-फ्री ऑटो</span>
          </button>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Interrupt / Stop Speaking Button */}
            {callStatus === 'speaking' && (
              <button
                id="voice-interrupt-btn"
                onClick={handleInterrupt}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold active:scale-95 transition-all"
                title="रोकें और खुद बोलें"
              >
                <span>रोकें</span>
              </button>
            )}

            {/* Mute / Unmute Microphone Button */}
            <button
              id="voice-mute-btn"
              onClick={handleToggleMute}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all active:scale-95 ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : callStatus === 'listening'
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'अनम्यूट करें' : 'माइक म्यूट करें'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* End Call Button */}
            <button
              id="end-call-btn"
              onClick={handleEndCall}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              title="कॉल समाप्त करें (End Call)"
              aria-label="End Call"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>

          {/* Re-listen / Talk Button */}
          <button
            id="speak-again-btn"
            onClick={() => {
              if (callStatus === 'speaking') handleInterrupt();
              else startListening();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="दोबारा बोलें"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">बोलें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
