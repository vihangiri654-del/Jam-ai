import React from 'react';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  BookOpen,
  Menu,
  Plus,
  PhoneCall,
  Volume2,
  Rocket,
  Shield,
  ShieldCheck,
  Lock,
  Smartphone,
} from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenAppBuilder: () => void;
  onOpenImageStudio: () => void;
  onOpenVideoStudio?: () => void;
  onOpenStudyLab: () => void;
  onOpenVoiceCall: () => void;
  onOpenVoiceSelector: () => void;
  onOpenPublishModal: () => void;
  onOpenAdminModal: () => void;
  onOpenApkModal: () => void;
  isAdmin: boolean;
  selectedVoiceName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onNewChat,
  onToggleSidebar,
  onOpenAppBuilder,
  onOpenImageStudio,
  onOpenVideoStudio,
  onOpenStudyLab,
  onOpenVoiceCall,
  onOpenVoiceSelector,
  onOpenPublishModal,
  onOpenAdminModal,
  onOpenApkModal,
  isAdmin,
  selectedVoiceName = 'Aryan (आर्यन)',
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.1] bg-slate-950/75 backdrop-blur-2xl px-3 sm:px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="rounded-2xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all border border-transparent hover:border-white/[0.1]"
          title="Toggle History Sidebar"
          aria-label="Toggle History Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-600 text-white font-black text-sm shadow-[0_0_24px_rgba(99,102,241,0.45)] ring-1 ring-white/30">
            <span className="tracking-tight">JAM</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 ring-2 ring-slate-950"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                JAM AI
                <span className="text-[9px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/30">
                  LIQUID 3.8
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Vihaan Giri Universal Intelligence</p>
          </div>
        </div>
      </div>

      {/* Quick Launchers for Key Engines */}
      <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] shadow-inner backdrop-blur-md">
        <button
          id="header-app-builder-btn"
          onClick={onOpenAppBuilder}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>App Studio</span>
        </button>
        <button
          id="header-image-studio-btn"
          onClick={onOpenImageStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
          <span>Image Lab</span>
        </button>
        {onOpenVideoStudio && (
          <button
            id="header-video-studio-btn"
            onClick={onOpenVideoStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Video Lab</span>
          </button>
        )}
        <button
          id="header-study-lab-btn"
          onClick={onOpenStudyLab}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <span>Study Lab</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Voice Selector button */}
        <button
          id="header-voice-selector-btn"
          onClick={onOpenVoiceSelector}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all"
          title="आवाज़ बदलें या टेस्ट करें (Voice Personas)"
        >
          <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline truncate max-w-[100px]">{selectedVoiceName.split(' ')[0]}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Voice</span>
        </button>

        {/* Live Voice Call launcher */}
        <button
          id="header-voice-call-btn"
          onClick={onOpenVoiceCall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_18px_rgba(16,185,129,0.3)] border border-emerald-400/30 active:scale-95 transition-all"
          title="Start Live Voice Conversation with JAM AI"
        >
          <PhoneCall className="h-3.5 w-3.5 animate-pulse text-emerald-100" />
          <span className="hidden md:inline">बात करें</span>
          <span className="md:hidden">Call</span>
        </button>

        {/* APK / Mobile Install Button */}
        <button
          id="header-apk-btn"
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 hover:text-emerald-200 text-xs font-semibold border border-emerald-500/30 transition-all shadow-sm active:scale-95"
          title="Android APK डाउनलोड करें या फ़ोन पर इंस्टॉल करें"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">APK</span>
          <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">App</span>
        </button>

        {/* Publish Button */}
        <button
          id="header-publish-btn"
          onClick={onOpenPublishModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all"
          title="वेबसाइट पब्लिश कैसे करें (Publish Website Guide)"
        >
          <Rocket className="h-3.5 w-3.5 text-amber-400" />
          <span>Publish</span>
        </button>

        {/* Admin Portal Button & Creator Gateway */}
        {isAdmin ? (
          <button
            id="header-admin-portal-btn"
            onClick={onOpenAdminModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
            title="Open Super Admin Control Hub"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Vihaan Giri (Admin)</span>
            <span className="md:hidden">Admin</span>
          </button>
        ) : (
          <button
            id="header-creator-credit-btn"
            onClick={onOpenAdminModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white font-medium transition-all"
            title="Admin Sign In • Vihaan Giri"
          >
            <Lock className="h-3 w-3 text-amber-400" />
            <span className="hidden xl:inline">Vihaan Giri (Admin)</span>
            <span className="xl:hidden">Admin</span>
          </button>
        )}

        {/* New Chat Button */}
        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
