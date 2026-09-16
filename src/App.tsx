import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Code2,
  BookOpen,
  Image as ImageIcon,
  Search,
  Youtube,
  Languages,
  RotateCw,
  Terminal,
  Zap,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModeBar } from './components/ModeBar';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { AppBuilderModal } from './components/AppBuilderModal';
import { ImageStudioModal } from './components/ImageStudioModal';
import { StudyLabModal } from './components/StudyLabModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { VoiceSelectorModal } from './components/VoiceSelectorModal';
import { AdminModal } from './components/AdminModal';
import { PublishModal } from './components/PublishModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { getSavedCharacterVoice, CharacterVoice } from './utils/voiceHelper';
import { generateUniqueMessageId, generateUniqueSessionId } from './utils/id';
import {
  AppMode,
  ChatMessage,
  ChatSession,
  FileAttachment,
  AppProject,
  QuizQuestion,
  Flashcard,
} from './types';

const INITIAL_WELCOME_PROMPTS = [
  {
    icon: Layers,
    title: 'App Creation Engine',
    desc: 'Build me an interactive Pomodoro Focus Timer with ambient sounds and stats',
    mode: 'APP BUILDER' as AppMode,
  },
  {
    icon: Code2,
    title: 'Coding Superpower',
    desc: 'Write an optimized Rust or TypeScript rate limiter with token bucket algorithm',
    mode: 'CODING' as AppMode,
  },
  {
    icon: ImageIcon,
    title: 'Image Studio',
    desc: 'Generate a photorealistic cyberpunk neon laboratory with holographic displays',
    mode: 'IMAGE' as AppMode,
  },
  {
    icon: BookOpen,
    title: 'Personal Study Tutor',
    desc: 'Explain quantum entanglement simply and generate a 4-question test',
    mode: 'STUDY' as AppMode,
  },
  {
    icon: Search,
    title: 'Live Research',
    desc: 'Research the latest breakthroughs in solid-state battery technology with citations',
    mode: 'RESEARCH' as AppMode,
  },
  {
    icon: Languages,
    title: 'Multilingual & Hinglish',
    desc: 'Explain General Relativity in conversational Hinglish with relatable analogies',
    mode: 'TRANSLATOR' as AppMode,
  },
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('jam_ai_sessions');
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize messages so any legacy duplicate keys from past sessions are repaired
          return parsed.map((s) => {
            const seenIds = new Set<string>();
            return {
              ...s,
              id: s.id || generateUniqueSessionId(),
              messages: (s.messages || []).map((m) => {
                let mId = m.id;
                if (!mId || seenIds.has(mId)) {
                  mId = generateUniqueMessageId(m.role === 'user' ? 'user' : 'assistant');
                }
                seenIds.add(mId);
                return { ...m, id: mId };
              }),
            };
          });
        }
      }
    } catch {
      // safe fallback
    }
    const defaultId = generateUniqueSessionId();
    return [
      {
        id: defaultId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: 'AUTO',
        messages: [],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || generateUniqueSessionId();
  });

  const [currentMode, setCurrentMode] = useState<AppMode>('AUTO');
  const [useSearch, setUseSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [appBuilderOpen, setAppBuilderOpen] = useState(false);
  const [activeAppProject, setActiveAppProject] = useState<AppProject | null>(null);

  const [imageStudioOpen, setImageStudioOpen] = useState(false);
  const [activeStudioImage, setActiveStudioImage] = useState<string | undefined>(undefined);
  const [activeStudioPrompt, setActiveStudioPrompt] = useState<string | undefined>(undefined);

  const [studyLabOpen, setStudyLabOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);
  const [voiceSelectorOpen, setVoiceSelectorOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const [videoStudioOpen, setVideoStudioOpen] = useState(false);
  const [ultraThinking, setUltraThinking] = useState(false);

  // Admin authentication state strictly for vihangiri654@gmail.com
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jam_ai_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.email === 'vihangiri654@gmail.com';
      }
    } catch {
      // ignore
    }
    return false;
  });

  // Selected character voice state
  const [selectedVoice, setSelectedVoice] = useState<CharacterVoice>(getSavedCharacterVoice);

  useEffect(() => {
    const handleVoiceChange = () => {
      setSelectedVoice(getSavedCharacterVoice());
    };
    window.addEventListener('jam_character_voice_changed', handleVoiceChange);
    return () => window.removeEventListener('jam_character_voice_changed', handleVoiceChange);
  }, []);

  // Project Memory Context
  const [projectContext, setProjectContext] = useState<string>(() => {
    return localStorage.getItem('jam_ai_project_context') || '';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jam_ai_sessions', JSON.stringify(sessions));
    } catch {
      // safe fallback
    }
  }, [sessions]);

  // Sync project context
  useEffect(() => {
    try {
      localStorage.setItem('jam_ai_project_context', projectContext);
    } catch {
      // safe fallback
    }
  }, [projectContext]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // When session changes, set mode to that session's mode
  useEffect(() => {
    if (activeSession) {
      setCurrentMode(activeSession.mode || 'AUTO');
    }
  }, [activeSessionId]);

  const updateActiveSessionMessages = (
    newMessages: ChatMessage[],
    updatedTitle?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: newMessages,
            title: updatedTitle || s.title,
            updatedAt: Date.now(),
            mode: currentMode,
          };
        }
        return s;
      })
    );
  };

  const handleNewChat = () => {
    const newId = generateUniqueSessionId();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: currentMode,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      handleNewChat();
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleExportSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    let md = `# JAM AI Conversation: ${target.title}\n`;
    md += `*Created by Vihaan Giri | Date: ${new Date(target.createdAt).toLocaleString()}*\n\n`;
    target.messages.forEach((m) => {
      md += `### ${m.role === 'user' ? 'User' : 'JAM AI'} (${m.mode || 'AUTO'}):\n${m.text}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${target.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Main Send Message handler
  const handleSendMessage = async (
    text: string,
    files: FileAttachment[],
    searchToggle: boolean
  ) => {
    const userMessage: ChatMessage = {
      id: generateUniqueMessageId('user'),
      role: 'user',
      text,
      timestamp: Date.now(),
      mode: currentMode,
      files,
    };

    const currentMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage];
    const isFirstMessage = activeSession?.messages.length === 0;
    const sessionTitle = isFirstMessage
      ? text.slice(0, 36) + (text.length > 36 ? '...' : '')
      : activeSession.title;

    updateActiveSessionMessages(currentMessages, sessionTitle);
    setIsLoading(true);

    try {
      const lowerText = text.toLowerCase().trim();
      const hasQuestionWords = /(का|की|के|कितने|कैसे|क्यों|क्या|कब|कहाँ|who|what|why|how|when|where|tell me about|explain|meaning)/i.test(text);

      // Check if this is an explicit image request
      const isExplicitImageCommand =
        /^(generate|create|draw|paint|make|render)\s+(an?\s+)?(image|picture|photo|portrait|art|wallpaper)/i.test(lowerText) ||
        /(की|का|के)?\s*(फोटो|इमेज|तस्वीर|चित्र)\s*(बनाओ|बना\s*दो|दिखाओ|जनरेट)/i.test(text) ||
        /(image|photo|picture)\s*(banao|bana do|generate|create)/i.test(lowerText);

      const isImageRequest = (currentMode === 'IMAGE' || (isExplicitImageCommand && !hasQuestionWords));

      if (isImageRequest && !files.some((f) => f.mimeType.startsWith('image/'))) {
        const cleanPrompt = text
          .replace(/^(generate an image of|generate image of|create an image of|draw a|generate image|banao|bana do|chahiye)\s*/i, '')
          .replace(/(ki\s*(image|photo|picture)|image\s*banao|photo\s*banao|picture\s*banao|tasveer\s*banao|chitra\s*banao)/gi, '')
          .trim();

        const imgRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleanPrompt || text }),
        });

        if (!imgRes.ok) throw new Error('Image generation failed.');
        const imgData = await imgRes.json();
        const assistantMessage: ChatMessage = {
          id: generateUniqueMessageId('assistant'),
          role: 'assistant',
          text: `मैंने आपके लिए **"${cleanPrompt || text}"** की सुंदर इमेज तैयार कर दी है — **Created by Jam AI**`,
          timestamp: Date.now(),
          mode: 'IMAGE',
          generatedImage: {
            url: imgData.imageUrl,
            prompt: cleanPrompt || text,
            aspectRatio: imgData.aspectRatio || '1:1',
          },
        };

        updateActiveSessionMessages([...currentMessages, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Check if this is an App Builder request
      const isAppRequest =
        currentMode === 'APP BUILDER' ||
        lowerText.startsWith('build me an app') ||
        lowerText.startsWith('create an app') ||
        lowerText.includes('build an app for') ||
        lowerText.includes('create a web app');

      if (isAppRequest) {
        const appRes = await fetch('/api/build-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            platform: 'Web Application',
            techStack: 'HTML5 / Modern JS / Tailwind CSS',
          }),
        });

        if (appRes.ok) {
          const appData: AppProject = await appRes.json();
          const assistantMessage: ChatMessage = {
            id: generateUniqueMessageId('assistant'),
            role: 'assistant',
            text: `### 🚀 Application Created: **${appData.appName}**\n\n${appData.tagline || ''}\n\n- **Platform:** ${appData.platform}\n- **Tech Stack:** ${appData.techStack}\n- **Key Features:**\n${appData.features?.map((f) => `  - ${f}`).join('\n')}\n\nI have generated the complete multi-file project files and runnable sandbox environment. You can launch the interactive live preview below!`,
            timestamp: Date.now(),
            mode: 'APP BUILDER',
            appProject: appData,
          };

          updateActiveSessionMessages([...currentMessages, assistantMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Check if user is requesting APK / App installer
      const isExplicitApkRequest =
        /\b(download|install|get)\b.*\b(apk|app)\b/i.test(lowerText) ||
        /(apk.*download|ऐप.*डाउनलोड|एपीके.*डाउनलोड)/i.test(text);

      if (isExplicitApkRequest) {
        setApkModalOpen(true);
        const assistantMessage: ChatMessage = {
          id: generateUniqueMessageId('assistant'),
          role: 'assistant',
          text: `📱 **JAM AI Android APK / WebAPK तैयार है!**\n\nमैंने आपके लिए Android APK डाउनलोड और इंस्टॉलेशन विंडो खोल दी है। आप **1-क्लिक "Instant Install"** पर टैप करके इसे अपने फ़ोन पर असली नेटिव ऐप की तरह इंस्टॉल कर सकते हैं, या ऊपर हेडर में दिए गए **APK** बटन से कभी भी एक्सेस कर सकते हैं!`,
          timestamp: Date.now(),
          mode: currentMode,
        };
        updateActiveSessionMessages([...currentMessages, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Ultra-Fast Streaming Chat (< 0.9s Initial Token Time via SSE)
      const assistantId = generateUniqueMessageId('assistant');
      let streamedContent = '';
      let streamedImageUrl: string | undefined;
      let streamedVideo: any | undefined;

      try {
        const streamRes = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: currentMessages.map((m) => ({
              role: m.role,
              text: m.text,
            })),
            mode: currentMode,
            useSearch: searchToggle || currentMode === 'RESEARCH',
            ultraThinking,
            files: files.map((f) => ({
              name: f.name,
              mimeType: f.mimeType,
              data: f.data,
            })),
            customInstruction: projectContext ? `Project context: ${projectContext}` : '',
          }),
        });

        if (streamRes.ok && streamRes.body) {
          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let firstChunkReceived = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  if (data.imageUrl) {
                    streamedImageUrl = data.imageUrl;
                  }
                  if (data.generatedVideo) {
                    streamedVideo = data.generatedVideo;
                  }
                  if (data.text) {
                    streamedContent += data.text;
                    if (!firstChunkReceived) {
                      firstChunkReceived = true;
                      setIsLoading(false);
                    }
                    const activeAssistantMsg: ChatMessage = {
                      id: assistantId,
                      role: 'assistant',
                      text: streamedContent,
                      timestamp: Date.now(),
                      mode: currentMode,
                      generatedVideo: streamedVideo,
                      generatedImage: streamedImageUrl
                        ? {
                            url: streamedImageUrl,
                            prompt: text,
                            aspectRatio: '1:1',
                          }
                        : undefined,
                    };
                    updateActiveSessionMessages([...currentMessages, activeAssistantMsg]);
                  }
                  if (data.done) {
                    break;
                  }
                } catch {
                  // ignore
                }
              }
            }
          }

          if (streamedContent.trim().length > 0) {
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // stream fallback to standard /api/chat
      }

      // Default: Universal chat through /api/chat with full context & grounding
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          mode: currentMode,
          useSearch: searchToggle || currentMode === 'RESEARCH',
          ultraThinking,
          files: files.map((f) => ({
            name: f.name,
            mimeType: f.mimeType,
            data: f.data,
          })),
          customInstruction: projectContext ? `Project context: ${projectContext}` : '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: generateUniqueMessageId('assistant'),
        role: 'assistant',
        text: data.reply,
        timestamp: Date.now(),
        mode: data.mode || currentMode,
        grounding: data.grounding,
        generatedVideo: data.generatedVideo || undefined,
        generatedImage: data.imageUrl
          ? {
              url: data.imageUrl,
              prompt: text,
              aspectRatio: data.aspectRatio || '1:1',
            }
          : undefined,
      };

      updateActiveSessionMessages([...currentMessages, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: generateUniqueMessageId('assistant'),
        role: 'assistant',
        text: `**JAM AI:** ${err.message || 'उत्तर तैयार नहीं हो सका। कृपया पुनः प्रयास करें।'}`,
        timestamp: Date.now(),
        mode: currentMode,
        isError: true,
      };
      updateActiveSessionMessages([...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* History Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onExportSession={handleExportSession}
        projectContext={projectContext}
        onUpdateProjectContext={setProjectContext}
        onOpenApkModal={() => setApkModalOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative ambient-liquid-bg">
        {/* Top Header */}
        <Header
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAppBuilder={() => {
            setActiveAppProject(null);
            setAppBuilderOpen(true);
          }}
          onOpenImageStudio={() => {
            setActiveStudioImage(undefined);
            setActiveStudioPrompt(undefined);
            setImageStudioOpen(true);
          }}
          onOpenVideoStudio={() => setVideoStudioOpen(true)}
          onOpenStudyLab={() => setStudyLabOpen(true)}
          onOpenVoiceCall={() => setVoiceCallOpen(true)}
          onOpenVoiceSelector={() => setVoiceSelectorOpen(true)}
          onOpenPublishModal={() => setPublishModalOpen(true)}
          onOpenAdminModal={() => setAdminModalOpen(true)}
          onOpenApkModal={() => setApkModalOpen(true)}
          isAdmin={isAdmin}
          selectedVoiceName={selectedVoice.name}
        />

        {/* Mode Bar */}
        <ModeBar currentMode={currentMode} onSelectMode={setCurrentMode} />

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeSession?.messages.length === 0 ? (
              /* Welcome Landing State - $1 Trillion Company Tier */
              <div className="py-8 sm:py-12 text-center relative">
                {/* Background Ambient Aura */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-blue-700 text-white font-black text-2xl sm:text-3xl shadow-[0_0_35px_rgba(99,102,241,0.4)] ring-1 ring-white/20 mb-4 transition-transform hover:scale-105">
                  JAM
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Universal AI v3.8
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Neural Active
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
                  JAM AI Universal Studio
                </h2>

                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-5 leading-relaxed font-normal">
                  Universal Intelligence • Full-Stack App Creation • Photorealistic Imagery • Personal Study Tutor • ChatGPT-Grade Neural Voice
                </p>

                {/* Creator Credit Badge + Admin Status Gateway */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                  <button
                    onClick={() => setAdminModalOpen(true)}
                    className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-slate-200 shadow-sm transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                    <span>Architected by <strong className="text-white">Vihaan Giri</strong></span>
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={() => setAdminModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-110 transition-all"
                    >
                      <Zap className="h-3 w-3 text-amber-400" />
                      <span>Super Admin Command Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setAdminModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 transition-all"
                    >
                      <span>Admin Access</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Quick Action Hub Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto mb-10">
                  <button
                    onClick={() => setVoiceCallOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 border border-emerald-400/40 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5 animate-pulse text-emerald-200" />
                    <span>बात करें (Live Voice Call)</span>
                  </button>
                  <button
                    onClick={() => setApkModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-teal-500/15 hover:from-teal-500/25 hover:to-emerald-500/25 border border-emerald-500/35 text-emerald-300 hover:text-emerald-100 text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    <span>📱 Android APK डाउनलोड</span>
                  </button>
                  <button
                    onClick={() => setVoiceSelectorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>🎙️ आवाज़: {selectedVoice.name.split(' ')[0]}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveAppProject(null);
                      setAppBuilderOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>⚡ App Studio</span>
                  </button>
                  <button
                    onClick={() => setImageStudioOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>🎨 Image Lab</span>
                  </button>
                  <button
                    onClick={() => setPublishModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>🚀 Publish Website</span>
                  </button>
                </div>

                {/* Quick Capability Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-left max-w-4xl mx-auto">
                  {INITIAL_WELCOME_PROMPTS.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentMode(p.mode);
                          handleSendMessage(p.desc, [], p.mode === 'RESEARCH');
                        }}
                        className="group flex flex-col justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-indigo-500/40 transition-all text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:-translate-y-0.5"
                      >
                        <div>
                          <div className="flex items-center gap-2.5 mb-2.5 text-indigo-400 group-hover:text-indigo-300">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-tight">
                              {p.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                            {p.desc}
                          </p>
                        </div>
                        <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          <span>Execute Prompt</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message List */
              <>
                {activeSession.messages.map((message, idx) => (
                  <MessageItem
                    key={`${message.id || 'msg'}-${idx}`}
                    message={message}
                    onOpenAppBuilder={(proj) => {
                      setActiveAppProject(proj);
                      setAppBuilderOpen(true);
                    }}
                    onEditImage={(url, p) => {
                      setActiveStudioImage(url);
                      setActiveStudioPrompt(p);
                      setImageStudioOpen(true);
                    }}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-bold text-xs">
                      JAM
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 animate-spin text-indigo-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        JAM AI is thinking and orchestrating capabilities...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          useSearch={useSearch}
          onToggleSearch={() => setUseSearch(!useSearch)}
          onOpenVoiceCall={() => setVoiceCallOpen(true)}
          ultraThinking={ultraThinking}
          onToggleUltraThinking={() => setUltraThinking(!ultraThinking)}
          onOpenImageEditor={(imgUrl) => {
            setActiveStudioImage(imgUrl);
            setImageStudioOpen(true);
          }}
          onOpenVideoStudio={() => setVideoStudioOpen(true)}
        />

        {/* Subtle Signature in bottom corner as requested in prompt */}
        <div className="absolute bottom-1 right-3 hidden sm:flex items-center gap-1 text-[10px] text-slate-500 pointer-events-none font-mono">
          <span>«Created by Vihaan Giri»</span>
        </div>
      </div>

      {/* App Creation Engine Modal */}
      <AppBuilderModal
        isOpen={appBuilderOpen}
        onClose={() => setAppBuilderOpen(false)}
        initialProject={activeAppProject}
        onSaveToChat={(proj) => {
          const newMsg: ChatMessage = {
            id: generateUniqueMessageId('assistant'),
            role: 'assistant',
            text: `### 🚀 App Builder: **${proj.appName}**\n\n${proj.tagline || ''}\n\n- **Platform:** ${proj.platform}\n- **Tech Stack:** ${proj.techStack}`,
            timestamp: Date.now(),
            mode: 'APP BUILDER',
            appProject: proj,
          };
          updateActiveSessionMessages([...activeSession.messages, newMsg]);
        }}
      />

      {/* Image Studio Modal */}
      <ImageStudioModal
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        initialImageUrl={activeStudioImage}
        initialPrompt={activeStudioPrompt}
        onSendToChat={(url, p) => {
          const newMsg: ChatMessage = {
            id: generateUniqueMessageId('assistant'),
            role: 'assistant',
            text: `Generated visual artwork for: **"${p}"**`,
            timestamp: Date.now(),
            mode: 'IMAGE',
            generatedImage: { url, prompt: p },
          };
          updateActiveSessionMessages([...activeSession.messages, newMsg]);
        }}
      />

      {/* Video Studio Modal */}
      <VideoStudioModal
        isOpen={videoStudioOpen}
        onClose={() => setVideoStudioOpen(false)}
        onSendToChat={(videoData) => {
          const newMsg: ChatMessage = {
            id: generateUniqueMessageId('assistant'),
            role: 'assistant',
            text: `### 🎬 AI Video: **${videoData.title || videoData.prompt || 'Generated Video'}**\n\n▶️ **Created by Jam AI** — ${videoData.duration} • 60fps MP4`,
            timestamp: Date.now(),
            mode: 'VIDEO',
            generatedVideo: videoData,
          };
          updateActiveSessionMessages([...activeSession.messages, newMsg]);
        }}
      />

      {/* Study Lab Modal */}
      <StudyLabModal
        isOpen={studyLabOpen}
        onClose={() => setStudyLabOpen(false)}
        onSendStudySetToChat={(topic, quiz, flashcards) => {
          const newMsg: ChatMessage = {
            id: generateUniqueMessageId('assistant'),
            role: 'assistant',
            text: `### 📚 Study Set: **${topic}**\n\nI have prepared an interactive practice quiz and revision flashcards for you below:`,
            timestamp: Date.now(),
            mode: 'STUDY',
            quiz,
            flashcards,
          };
          updateActiveSessionMessages([...activeSession.messages, newMsg]);
        }}
      />

      {/* Live Voice Call / Conversation Modal ("बात भी कर सके bro") */}
      <VoiceCallModal
        isOpen={voiceCallOpen}
        onClose={() => setVoiceCallOpen(false)}
      />

      {/* Voice Character Persona Selector Modal */}
      <VoiceSelectorModal
        isOpen={voiceSelectorOpen}
        onClose={() => setVoiceSelectorOpen(false)}
        onVoiceSelected={(voice) => setSelectedVoice(voice)}
      />

      {/* Admin Authentication & Control Panel Modal strictly for vihangiri654@gmail.com */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isAdminAuthenticated={isAdmin}
        onAdminLoginSuccess={() => {
          setIsAdmin(true);
        }}
        onAdminLogout={() => {
          setIsAdmin(false);
        }}
        onNavigateToDashboard={() => {
          setAdminModalOpen(false);
        }}
      />

      {/* Publish Website Guide Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
      />

      {/* Android APK / WebAPK Direct Installer Modal */}
      <ApkDownloadModal
        isOpen={apkModalOpen}
        onClose={() => setApkModalOpen(false)}
      />
    </div>
  );
}
