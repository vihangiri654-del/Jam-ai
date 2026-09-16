import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Download,
  FolderCode,
  Search,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Smartphone,
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onExportSession: (id: string) => void;
  projectContext: string;
  onUpdateProjectContext: (ctx: string) => void;
  onOpenApkModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
  onExportSession,
  projectContext,
  onUpdateProjectContext,
  onOpenApkModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [contextDraft, setContextDraft] = useState(projectContext);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const handleSaveContext = () => {
    onUpdateProjectContext(contextDraft);
    setShowMemoryModal(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 border-r border-slate-800/80 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={onClose}
            className="ml-2 p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-2.5 border-b border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              id="sidebar-search-input"
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Project Memory & Context button */}
        <div className="px-2.5 pt-2">
          <button
            id="sidebar-project-memory-btn"
            onClick={() => {
              setContextDraft(projectContext);
              setShowMemoryModal(true);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-slate-300 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-indigo-400" />
              <div className="text-left">
                <span className="font-semibold block text-slate-200">Conversational Memory</span>
                <span className="text-[10px] text-slate-500">
                  {projectContext ? 'Custom context active' : 'Set project context'}
                </span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Pinned */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                <Pin className="h-3 w-3 rotate-45" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onDelete={() => onDeleteSession(session.id)}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onExport={() => onExportSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Recent Chats
            </div>
            <div className="space-y-0.5 mt-1">
              {recentSessions.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-slate-600">No chats found</p>
              ) : (
                recentSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onDelete={() => onDeleteSession(session.id)}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onExport={() => onExportSession(session.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Signature & APK button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-center space-y-2">
          {onOpenApkModal && (
            <button
              onClick={() => {
                onOpenApkModal();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-indigo-600/20 hover:from-emerald-600/30 hover:to-indigo-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>📱 Android APK इंस्टॉल करें</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium shadow-sm">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span className="text-slate-300">Created by Vihaan Giri</span>
          </div>
        </div>
      </aside>

      {/* Memory & Project Context Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Project Memory & Context</h3>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Information defined here will be automatically provided to JAM AI across all messages
              (e.g., tech stack, project goals, brand voice, developer preferences).
            </p>
            <textarea
              value={contextDraft}
              onChange={(e) => setContextDraft(e.target.value)}
              placeholder="e.g. Current Project: E-commerce dashboard in React & TypeScript. Target users: Creators. Tone: Crisp, modern, no emojis."
              rows={5}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContext}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Context
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onExport: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onExport,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
          : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
        <span className="truncate">{session.title || 'Untitled Session'}</span>
      </div>

      <div className="hidden group-hover:flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={session.isPinned ? 'Unpin' : 'Pin'}
          className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
        >
          <Pin className={`h-3 w-3 ${session.isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          title="Export markdown"
          className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
        >
          <Download className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete chat"
          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
