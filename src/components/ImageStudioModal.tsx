import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Download,
  RotateCw,
  Send,
  Upload,
  Sliders,
  Wand2,
  Camera,
  Layers,
} from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  initialPrompt?: string;
  onSendToChat?: (imageUrl: string, prompt: string) => void;
}

const STYLE_PRESETS = [
  'Photorealistic 8K with natural cinematic lighting',
  '3D Pixar style digital render with soft shadows',
  'Cyberpunk neon aesthetics with futuristic reflections',
  'Minimalist modern vector flat design',
  'Japanese anime watercolor aesthetic',
  'Moody vintage film photography, 35mm grain',
];

const AI_EDIT_PRESETS = [
  { label: 'Cyberpunk Glow', prompt: 'Transform scene with futuristic cyberpunk neon glows and reflections' },
  { label: 'Anime Style', prompt: 'Convert this photo into Japanese anime Makoto Shinkai studio art style' },
  { label: 'Enhance & 8K', prompt: 'Enhance photo sharpness, natural cinematic lighting, and 8k details' },
  { label: '3D Pixar Cartoon', prompt: 'Turn the subject into a friendly 3D Pixar character with warm studio lighting' },
  { label: 'Vintage 35mm', prompt: 'Apply warm retro 35mm film grain, analog color grade, and soft vignette' },
  { label: 'Remove BG', prompt: 'Remove background completely and replace with clean minimalist studio glow' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '9:16', label: '9:16 Portrait/Reel' },
  { id: '4:3', label: '4:3 Classic' },
  { id: '3:4', label: '3:4 Portrait' },
];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  initialPrompt = '',
  onSendToChat,
}) => {
  const [mode, setMode] = useState<'generate' | 'edit'>(initialImageUrl ? 'edit' : 'generate');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(initialImageUrl || null);
  const [base64Upload, setBase64Upload] = useState<string | null>(initialImageUrl || null);
  const [history, setHistory] = useState<Array<{ url: string; prompt: string }>>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Manual image adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() && mode === 'generate') return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      if (mode === 'generate') {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            aspectRatio,
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setGeneratedUrl(data.imageUrl);
          setHistory((prev) => [{ url: data.imageUrl, prompt }, ...prev]);
        } else if (data.error) {
          setStatusMessage({ text: data.error, isError: true });
        }
      } else {
        // Edit mode
        if (!base64Upload) {
          setStatusMessage({ text: 'Please upload an image or photo to edit first.', isError: true });
          setIsGenerating(false);
          return;
        }

        const res = await fetch('/api/edit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Image: base64Upload,
            prompt: prompt || 'Enhance quality, cinematic lighting, masterpiece',
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setGeneratedUrl(data.imageUrl);
          setHistory((prev) => [{ url: data.imageUrl, prompt }, ...prev]);
        } else if (data.error) {
          setStatusMessage({ text: data.error, isError: true });
        }
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Operation failed', isError: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64Upload(result);
      setGeneratedUrl(result);
      setMode('edit');
      setStatusMessage({ text: 'Photo uploaded! Choose an AI preset below or type your edit prompt.', isError: false });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const a = document.createElement('a');
    a.href = generatedUrl;
    a.download = `jam-ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSend = () => {
    if (!generatedUrl || !onSendToChat) return;
    onSendToChat(generatedUrl, prompt || 'Edited Photo with Jam AI');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0b0f19]/95 to-slate-950/95 border border-white/15 shadow-[0_16px_64px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden text-slate-100">
        
        {/* Liquid Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">AI Photo Studio & Editor</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Created by Jam AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Add files, upload photos, and edit with next-generation AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-white/[0.06] p-0.5 border border-white/10">
              <button
                onClick={() => setMode('generate')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'generate'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Generate Art
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'edit'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Edit Photo (फ़ोटो एडिट करें)
              </button>
            </div>

            <button
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Controls Column */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            
            {/* Dedicated Photo / File Upload Card */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Add Your Photo / File (फ़ोटो जोड़ें)</span>
                <span className="text-[10px] text-pink-400 font-medium">PNG • JPG • WebP</span>
              </label>
              
              <div className="border border-dashed border-white/20 hover:border-pink-500/60 transition-all rounded-2xl p-3 text-center bg-white/[0.02]">
                {base64Upload ? (
                  <div className="relative group">
                    <img
                      src={base64Upload}
                      alt="Uploaded"
                      className="h-28 w-full object-contain rounded-xl bg-black/40"
                    />
                    <label className="mt-2 block text-xs font-medium text-pink-400 cursor-pointer hover:underline">
                      Change Photo (फ़ोटो बदलें)
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-3">
                    <Upload className="h-6 w-6 text-pink-400 mb-1.5 animate-bounce" />
                    <span className="text-xs text-white font-medium">Click to upload photo / file</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Edit this photo with Jam AI</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Quick 1-Click AI Editing Presets */}
            {mode === 'edit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-pink-400" />
                  <span>1-Click AI Transformations</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AI_EDIT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(p.prompt);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-left text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-pink-400 flex-shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {mode === 'generate' ? 'Image Description (प्रॉम्प्ट)' : 'AI Edit Instructions (क्या बदलना है?)'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'generate'
                    ? 'e.g. A futuristic neon sports car racing in rain, 8k cinematic lighting...'
                    : 'e.g. Change background to a mountain sunset, add sunglasses, make it anime style...'
                }
                rows={3}
                className="w-full rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none resize-none transition-all"
              />
              {statusMessage && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-xs ${
                    statusMessage.isError
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}
            </div>

            {/* Aspect Ratio Selector (for generate mode) */}
            {mode === 'generate' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                        aspectRatio === ratio.id
                          ? 'bg-pink-600/30 text-pink-300 border-pink-500/50 shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Photo Adjustments */}
            {generatedUrl && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-pink-400" />
                  <span>Manual Adjustments</span>
                </span>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Saturation</span>
                    <span>{saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturate}
                    onChange={(e) => setSaturate(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (mode === 'generate' && !prompt.trim()) || (mode === 'edit' && !base64Upload)}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Processing with Jam AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{mode === 'generate' ? 'Generate Image (इमेज बनाएं)' : 'Apply AI Edit (एडिट लागू करें)'}</span>
                </>
              )}
            </button>
          </div>

          {/* Canvas / Image Display Column */}
          <div className="flex-1 flex flex-col justify-between p-5 bg-black/40 relative overflow-hidden">
            {generatedUrl ? (
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex-1 flex items-center justify-center p-2 relative">
                  <div className="relative max-h-[55vh] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/15">
                    <img
                      src={generatedUrl}
                      alt="Generated"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
                      }}
                      className="max-h-[55vh] max-w-full object-contain rounded-2xl"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white/90 shadow-md">
                      Created by Jam AI
                    </div>
                  </div>
                </div>

                {/* Bottom Toolbar */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="text-xs text-slate-400 truncate max-w-sm">
                    {prompt || 'Custom AI Artwork'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>

                    {onSendToChat && (
                      <button
                        onClick={handleSend}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Chat में भेजें</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 text-slate-500 mb-3">
                  <ImageIcon className="h-8 w-8 text-pink-400/60" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Ready to Create & Edit</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Upload a photo to edit with AI, or enter a prompt to generate high-resolution artwork from scratch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
