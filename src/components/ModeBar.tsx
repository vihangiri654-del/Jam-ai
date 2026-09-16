import React from 'react';
import {
  Wand2,
  MessageSquare,
  Code2,
  Layers,
  Image as ImageIcon,
  Video,
  PenTool,
  BookOpen,
  Search,
  Youtube,
  Database,
  Feather,
  Languages,
} from 'lucide-react';
import { AppMode } from '../types';

interface ModeBarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

const MODES: { id: AppMode; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'AUTO', label: 'Auto', icon: Wand2, color: 'text-cyan-400', desc: 'Automatic intent orchestration' },
  { id: 'CHAT', label: 'Chat', icon: MessageSquare, color: 'text-blue-400', desc: 'Conversational assistant' },
  { id: 'CODING', label: 'Coding', icon: Code2, color: 'text-emerald-400', desc: 'Full projects & debugging' },
  { id: 'APP BUILDER', label: 'App Builder', icon: Layers, color: 'text-indigo-400', desc: 'Create runnable applications' },
  { id: 'IMAGE', label: 'Image Gen', icon: ImageIcon, color: 'text-pink-400', desc: 'High-res image synthesis' },
  { id: 'STUDY', label: 'Study & Tutor', icon: BookOpen, color: 'text-amber-400', desc: 'Quizzes, explanations & revision' },
  { id: 'RESEARCH', label: 'Research', icon: Search, color: 'text-violet-400', desc: 'Live web grounding & citations' },
  { id: 'CREATOR', label: 'Creator Mode', icon: Youtube, color: 'text-red-400', desc: 'Hooks, scripts, SEO & Reels' },
  { id: 'TRANSLATOR', label: 'Translator', icon: Languages, color: 'text-teal-400', desc: 'Multilingual & Hinglish' },
  { id: 'VIDEO', label: 'Video Story', icon: Video, color: 'text-orange-400', desc: 'Storyboards & video prompts' },
  { id: 'DATA', label: 'Data & Math', icon: Database, color: 'text-blue-300', desc: 'Stats, logic & calculations' },
  { id: 'WRITER', label: 'Writer', icon: Feather, color: 'text-fuchsia-400', desc: 'Articles, essays & copy' },
  { id: 'EDITOR', label: 'Editor', icon: PenTool, color: 'text-lime-400', desc: 'Refactoring & polishing' },
];

export const ModeBar: React.FC<ModeBarProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="w-full border-b border-slate-800/60 bg-slate-900/40 px-3 py-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max mx-auto max-w-7xl">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
          Mode:
        </span>
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              id={`mode-btn-${m.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectMode(m.id)}
              title={`${m.label}: ${m.desc}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-300' : m.color}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
