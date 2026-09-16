import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  X,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Code2,
  BookOpen,
  PhoneCall,
  Brain,
  Video,
  Wand2,
} from 'lucide-react';
import { AppMode, FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, files: FileAttachment[], useSearch: boolean) => void;
  isLoading: boolean;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  onOpenVoiceCall?: () => void;
  ultraThinking?: boolean;
  onToggleUltraThinking?: () => void;
  onOpenImageEditor?: (imageUrl?: string) => void;
  onOpenVideoStudio?: () => void;
}

const PROMPT_SUGGESTIONS = [
  { icon: Layers, text: 'Build me a full-stack Task Tracker web app with modern UI' },
  { icon: Code2, text: 'Write a clean Python script for async web scraping with rate limiting' },
  { icon: ImageIcon, text: 'Generate a futuristic cyberpunk city with neon reflections, 16:9' },
  { icon: Video, text: 'Generate a cinematic drone video flying over neon Tokyo city' },
  { icon: Sparkles, text: 'Explain Quantum Computing in Hinglish simply' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  currentMode,
  onSelectMode,
  useSearch,
  onToggleSearch,
  onOpenVoiceCall,
  ultraThinking = false,
  onToggleUltraThinking,
  onOpenImageEditor,
  onOpenVideoStudio,
}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  // Web Speech Recognition for voice dictation
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setText((prev) => (prev ? prev : '') + ' [Mic not supported on this browser]');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Handle File Uploads (images, code files, text, pdfs, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Data = result.split(',')[1];

        const attachment: FileAttachment = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          mimeType: file.type || 'text/plain',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? result : undefined,
        };

        setFiles((prev) => [...prev, attachment]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if ((!text.trim() && files.length === 0) || isLoading) return;
    onSendMessage(text.trim(), files, useSearch);
    setText('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-3xl px-3 sm:px-6 pt-3 pb-4 max-w-4xl mx-auto w-full transition-all">
      {/* Liquid Header Actions: Ultra Thinking, Photo Editor, Video Studio */}
      <div className="mb-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Ultra Thinking Mode Switch */}
          {onToggleUltraThinking && (
            <button
              onClick={onToggleUltraThinking}
              title="Ultra Thinking: High-depth reasoning & architectural breakdown"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-sm ${
                ultraThinking
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-violet-300 border border-violet-500/50 ring-1 ring-violet-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10'
              }`}
            >
              <Brain className={`h-3.5 w-3.5 ${ultraThinking ? 'text-violet-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Ultra Thinking {ultraThinking ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* AI Photo Studio / Upload Photo for Edit */}
          {onOpenImageEditor && (
            <button
              onClick={() => onOpenImageEditor()}
              title="Upload photo or file to edit with AI (फोटो एडिट करें)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition-all shadow-sm"
            >
              <Wand2 className="h-3.5 w-3.5 text-pink-400" />
              <span>फ़ोटो जोड़ें / एडिट</span>
            </button>
          )}

          {/* AI Video Studio Button */}
          {onOpenVideoStudio && (
            <button
              onClick={onOpenVideoStudio}
              title="Generate cinematic MP4 AI video (वीडियो बनाएं)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
            >
              <Video className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Video Studio</span>
            </button>
          )}
        </div>

        {/* Live Voice Call Button */}
        {onOpenVoiceCall && (
          <button
            type="button"
            onClick={onOpenVoiceCall}
            title="Start Live Voice Call (आवाज़ में बात करें)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex-shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>लाइव बात करें</span>
          </button>
        )}
      </div>

      {/* Prompt Suggestion Chips (when input is empty) */}
      {!text && files.length === 0 && (
        <div className="mb-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {PROMPT_SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setText(item.text)}
                className="flex items-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-1 text-[11px] text-slate-300 transition-all hover:text-white flex-shrink-0 shadow-sm"
              >
                <Icon className="h-3 w-3 text-indigo-400" />
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* File Attachments Preview with 1-Click AI Edit Button */}
      {files.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/[0.12] px-3 py-1.5 text-xs text-slate-200 shadow-sm backdrop-blur-md"
            >
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="h-7 w-7 rounded-xl object-cover ring-1 ring-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FileCode className="h-4 w-4 text-indigo-400" />
              )}
              <span className="max-w-[120px] truncate font-medium">{file.name}</span>

              {/* 1-Click Quick Edit Photo Button */}
              {file.previewUrl && onOpenImageEditor && (
                <button
                  onClick={() => onOpenImageEditor(file.previewUrl)}
                  title="Open this photo in AI Photo Studio"
                  className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 transition-all flex items-center gap-1"
                >
                  <Wand2 className="h-2.5 w-2.5" />
                  <span>एडिट</span>
                </button>
              )}

              <button
                onClick={() => removeFile(file.id)}
                className="p-0.5 text-slate-400 hover:text-red-400 transition-colors ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Liquid Input Box */}
      <div className="relative rounded-3xl border border-white/[0.12] bg-slate-900/60 backdrop-blur-2xl focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-slate-900/90 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <textarea
          ref={textareaRef}
          id="chat-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            ultraThinking
              ? `[🧠 Ultra Thinking Active] Ask complex tasks, code architecture, video scripts, deep analysis...`
              : `Ask JAM AI anything, build apps, generate videos, edit photos, solve math, code...`
          }
          rows={1}
          className="w-full bg-transparent px-4 pt-3.5 pb-11 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
        />

        {/* Bottom Toolbar inside input */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* File & Photo Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Add photos or files (फोटो या फ़ाइल जोड़ें)"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] rounded-xl transition-all flex items-center gap-1"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400">फ़ाइल जोड़ें</span>
            </button>

            {/* Voice Dictation */}
            <button
              onClick={handleToggleVoice}
              title={isListening ? 'Stop listening' : 'Voice dictation'}
              className={`p-1.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Google Search Grounding Toggle */}
            <button
              onClick={onToggleSearch}
              title={useSearch ? 'Web Search Grounding: ON' : 'Web Search Grounding: OFF'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                useSearch
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-transparent'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-violet-400" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[10px] text-slate-500 font-mono tracking-tight">
              Return ↵ to send
            </span>
            <button
              id="send-message-btn"
              onClick={handleSend}
              disabled={(!text.trim() && files.length === 0) || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
