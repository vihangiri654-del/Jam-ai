import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Layers,
  Play,
  RotateCw,
  Code,
  Eye,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  FolderTree,
  Send,
  Mic,
  MicOff,
  Columns,
  Maximize2,
  Share2,
  CheckCircle2,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { AppProject, AppProjectFile } from '../types';

interface AppBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: AppProject | null;
  onSaveToChat?: (project: AppProject) => void;
}

const SAMPLE_TEMPLATES = [
  {
    title: 'Modern Task Kanban',
    desc: 'Columns, drag-drop feel, tags, priority badges & localStorage',
    prompt: 'Build a Modern Task Kanban Board with Todo, In-Progress, and Done columns, color tags, task counters, and local persistence.',
  },
  {
    title: 'Neon Scientific Calculator',
    desc: 'Trigonometry, tape history, dark mode & sound clicks',
    prompt: 'Build a sleek Neon Scientific Calculator with trigonometric functions, history tape, interactive sound effects, and clean responsive keys.',
  },
  {
    title: 'Pomodoro Productivity Flow',
    desc: 'Customizable work/break timer, progress circle & audio chime',
    prompt: 'Build a Pomodoro Productivity Timer with 25/5 min cycles, circular SVG progress, sound chime, and completed session stats.',
  },
  {
    title: 'Retro 2D Space Arcade Game',
    desc: 'Canvas 2D, player spaceship, laser blaster & high score',
    prompt: 'Build a complete playable HTML5 Canvas Retro 2D Space Arcade Game with arrow key controls, alien waves, laser blasters, particles, and score tracking.',
  },
  {
    title: 'Expense & Budget Tracker',
    desc: 'Category breakdown, budget progress bar & recent logs',
    prompt: 'Build a clean Expense & Budget Tracker with income vs expense metrics, category breakdown charts, and transaction history.',
  },
];

export const AppBuilderModal: React.FC<AppBuilderModalProps> = ({
  isOpen,
  onClose,
  initialProject,
  onSaveToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Web Application');
  const [techStack, setTechStack] = useState('HTML5 / Modern JS / Tailwind CSS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [project, setProject] = useState<AppProject | null>(initialProject || null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Iteration / Co-Pilot State
  const [iterationInput, setIterationInput] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialProject) {
      setProject(initialProject);
    }
  }, [initialProject]);

  if (!isOpen) return null;

  // Speech to Text for voice instructions
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your instruction.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Supports Hindi + English mixed
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setIterationInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Generate Brand New App
  const handleGenerateApp = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('JAM AI आर्किटेक्ट कोड बना रहा है...');

    try {
      const response = await fetch('/api/build-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          platform,
          techStack,
        }),
      });

      if (!response.ok) throw new Error('App generation failed');
      const data: AppProject = await response.json();
      setProject(data);
      setActiveFileIndex(0);
      setRefreshKey((k) => k + 1);
      setStatusMessage('✨ ऐप्लिकेशन सफलतापूर्वक लाइव हो चुका है!');
      setTimeout(() => setStatusMessage(null), 3000);

      if (onSaveToChat) {
        onSaveToChat(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate app. Please try again.');
      setStatusMessage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Live Iteration / Modify Code on the Fly
  const handleIterateApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!project || !iterationInput.trim() || isIterating) return;

    const instruction = iterationInput.trim();
    setIsIterating(true);
    setStatusMessage(`कोड अपडेट किया जा रहा है: "${instruction}"...`);

    try {
      const response = await fetch('/api/iterate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentProject: project,
          instruction,
        }),
      });

      if (!response.ok) throw new Error('Failed to update app');
      const updatedProject: AppProject = await response.json();

      setProject(updatedProject);
      setIterationInput('');
      setRefreshKey((k) => k + 1);
      setStatusMessage('🎉 बदलाव लाइव हो चुके हैं!');
      setTimeout(() => setStatusMessage(null), 3500);

      if (onSaveToChat) {
        onSaveToChat(updatedProject);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to apply change.');
      setStatusMessage(null);
    } finally {
      setIsIterating(false);
    }
  };

  // Open Preview in Full Window / New Tab
  const handleOpenInNewWindow = () => {
    if (!project?.previewHtml) return;
    const blob = new Blob([project.previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Download Single-File Runnable Web App
  const handleDownloadZip = () => {
    if (!project) return;
    const element = document.createElement('a');
    const file = new Blob([project.previewHtml || ''], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${(project.appName || 'jam-ai-app').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyCode = () => {
    if (!project || !project.files[activeFileIndex]) return;
    navigator.clipboard.writeText(project.files[activeFileIndex].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFile: AppProjectFile | undefined = project?.files[activeFileIndex];

  return (
    <div
      id="jam-app-builder-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md transition-all"
    >
      <div className="flex h-[95vh] w-full max-w-7xl flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  JAM AI — Live App & Web Studio
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Code & Preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                बोल के या लिख के कुछ भी जोड़ें • कोड और लाइव वेबसाइट सामने काम करते हुए देखें
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project && (
              <>
                <button
                  onClick={handleOpenInNewWindow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all active:scale-95"
                  title="Open live app in a full new browser tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">फुल स्क्रीन लाइव देखें</span>
                </button>

                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                  title="Download runnable HTML"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">डाउनलोड</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          
          {/* LEFT SIDEBAR: App Generator & Starter Templates */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-4 overflow-y-auto space-y-4">
            
            {/* Create or Switch App */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                <span>नया ऐप बनाएं (Describe App)</span>
                {project && (
                  <span className="text-[10px] text-indigo-400 font-semibold font-mono">
                    {project.appName}
                  </span>
                )}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="उदाहरण: एक एक्सपेंस ट्रैकर बनाएं जिसमें पाई चार्ट, कैटेगरी बजट और एक्सपोर्ट बटन हो..."
                rows={3}
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={() => handleGenerateApp()}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>JAM AI कोडिंग कर रहा है...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>लाइव ऐप जनरेट करें (Generate App)</span>
                </>
              )}
            </button>

            {/* Quick Starter Templates */}
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                रेडी-टू-रन स्टार्टर टेम्प्लेट्स (Instant Starters)
              </span>
              <div className="space-y-2">
                {SAMPLE_TEMPLATES.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setPrompt(t.prompt);
                      handleGenerateApp(t.prompt);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {t.title}
                      </span>
                      <Play className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Specifications */}
            {project && (
              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{project.appName}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                    READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{project.tagline}</p>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Features Built:</span>
                  <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                    {project.features?.slice(0, 4).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT WORKSPACE: Split / Preview / Code View + Live Co-Pilot Modifier */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            
            {/* Top Workspace Controls */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60 gap-2">
              
              {/* View Switchers */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Side-by-side Live Preview and Code"
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Split (Preview + Code)</span>
                </button>

                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>लाइव प्रीव्यू</span>
                </button>

                <button
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>सोर्स कोड ({project?.files?.length || 0})</span>
                </button>
              </div>

              {/* Device Frame Switchers (For Preview) */}
              {project && (viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDeviceFrame('desktop')}
                    className={`p-1.5 rounded-lg ${deviceFrame === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Desktop View"
                  >
                    <Laptop className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceFrame('tablet')}
                    className={`p-1.5 rounded-lg ${deviceFrame === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Tablet View (768px)"
                  >
                    <Tablet className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceFrame('mobile')}
                    className={`p-1.5 rounded-lg ${deviceFrame === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Mobile View (375px)"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                    title="Reload Sandbox"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Stage View Area */}
            <div className="flex-1 overflow-hidden relative flex">
              {project ? (
                <>
                  {/* CODE PANEL (Shown in split or code mode) */}
                  {(viewMode === 'code' || viewMode === 'split') && (
                    <div
                      className={`flex flex-col bg-slate-950 border-r border-slate-800 transition-all ${
                        viewMode === 'split' ? 'w-1/2' : 'w-full'
                      }`}
                    >
                      {/* File Tabs */}
                      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-3 py-2 text-xs">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {project.files.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveFileIndex(idx)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shrink-0 transition-colors ${
                                activeFileIndex === idx
                                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <FolderTree className="h-3 w-3" />
                              <span>{file.path}</span>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 text-xs shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Viewer */}
                      <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 bg-slate-950 selection:bg-indigo-500/40">
                        <code>{activeFile?.content || 'No file selected'}</code>
                      </pre>
                    </div>
                  )}

                  {/* PREVIEW PANEL (Shown in split or preview mode) */}
                  {(viewMode === 'preview' || viewMode === 'split') && (
                    <div
                      className={`flex flex-col bg-slate-900/90 items-center justify-center overflow-hidden transition-all ${
                        viewMode === 'split' ? 'w-1/2' : 'w-full'
                      }`}
                    >
                      <div
                        className={`h-full w-full transition-all flex flex-col bg-slate-950 ${
                          deviceFrame === 'mobile'
                            ? 'max-w-[375px] my-auto h-[92%] rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden'
                            : deviceFrame === 'tablet'
                            ? 'max-w-[768px] my-auto h-[95%] rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden'
                            : 'w-full h-full'
                        }`}
                      >
                        <iframe
                          key={refreshKey}
                          srcDoc={project.previewHtml}
                          title="JAM AI Live Sandbox"
                          className="h-full w-full border-0 bg-white"
                          sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty Project State */
                <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4">
                    <Layers className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2">
                    तैयार है JAM AI का लाइव ऐप इंजन
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                    बाईं ओर कोई भी ऐप का विचार लिखें या स्टार्टर टेम्प्लेट पर क्लिक करें — तुरंत आपके सामने कोड और 100% काम करने वाली लाइव वेबसाइट तैयार हो जाएगी!
                  </p>
                </div>
              )}
            </div>

            {/* BOTTOM BAR: Interactive AI Live Architect Co-Pilot (बोल के या लिख के कुछ भी ऐड करवाएं) */}
            {project && (
              <div className="border-t border-slate-800 bg-slate-950/90 p-3">
                {statusMessage && (
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <form onSubmit={handleIterateApp} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={iterationInput}
                      onChange={(e) => setIterationInput(e.target.value)}
                      placeholder="बोल के या लिख के कुछ भी ऐड करवाएं (e.g. 'डार्क मोड बटन जोड़ो', 'बैकग्राउंड बैंगनी करो', 'साउंड इफ़ेक्ट डालो')..."
                      disabled={isIterating}
                      className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all pr-10"
                    />

                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={isListening ? 'Listening... Speak now' : 'Click to speak instruction'}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isIterating || !iterationInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {isIterating ? (
                      <>
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                        <span>अपडेट हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>लाइव अपडेट करें</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
