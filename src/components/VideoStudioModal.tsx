import React, { useState, useRef } from 'react';
import {
  X,
  Video,
  Play,
  Pause,
  Download,
  Send,
  Upload,
  Sparkles,
  RotateCcw,
  Film,
  Camera,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialImage?: string;
  onSendToChat?: (videoData: any) => void;
}

const VIDEO_PRESETS = [
  {
    label: '🔥 Supercar Speed Edit',
    prompt: 'Porsche 911 GT3 RS roaring through neon city tunnel, spitting exhaust flames, hyperrealistic 8k cinematic',
    banner: 'PORSCHE 911 GT3 RS',
  },
  {
    label: '🏎️ BMW M-Power Reel',
    prompt: 'Aggressive BMW M4 twin-turbo drift with glowing laser headlights, wet night city street asphalt, tire smoke, and speed blur',
    banner: 'BMW M PERFORMANCE',
  },
  {
    label: '⚡ Lamborghini Flames',
    prompt: 'Lamborghini Aventador spitting blue exhaust flames night city drift speed hypercar',
    banner: 'LAMBORGHINI V12',
  },
  {
    label: '😂 Viral Meme Reel',
    prompt: 'Hilarious comedy surprise reaction meme, funny shocked face expression with unexpected plot twist',
    banner: 'WAIT FOR IT 😂',
  },
  {
    label: 'Cyber City Drone',
    prompt: 'Cinematic drone shot flying through futuristic cyberpunk city with vibrant neon reflections at night, 8k cinematic',
    banner: 'NEON CYBER CITY',
  },
  {
    label: 'Ocean Sunset Waves',
    prompt: 'Slow motion hyper-realistic ocean waves crashing on golden sand beach during majestic purple sunset',
    banner: 'OCEAN SUNSET',
  },
];

export const VideoStudioModal: React.FC<VideoStudioModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialImage,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'Porsche 911 GT3 RS roaring through neon city tunnel, spitting exhaust flames, hyperrealistic 8k cinematic'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [motion, setMotion] = useState<'seedance-living' | 'google-omni' | 'zoom-in' | 'pan-right' | 'zoom-out' | 'pro-edit'>('pro-edit');
  const [style, setStyle] = useState('Cinematic');
  const [isProEdit, setIsProEdit] = useState(true);
  const [customText, setCustomText] = useState('PORSCHE 911 GT3 RS');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{
    id: string;
    url: string;
    thumbnailUrl: string;
    prompt: string;
    title: string;
    aspectRatio: string;
    duration: string;
    creator: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() && !sourceImage) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          motion: isProEdit ? 'pro-edit' : motion,
          style,
          sourceImage: sourceImage || undefined,
          isProEdit,
          customText: customText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Video generation request failed');
      }

      const data = await res.json();
      setCurrentVideo(data);
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 300);
    } catch (err: any) {
      console.warn('[VideoStudio error]:', err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSourceImage(result);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!currentVideo?.url) return;
    const a = document.createElement('a');
    a.href = currentVideo.url;
    a.download = `jam-ai-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSend = () => {
    if (!currentVideo || !onSendToChat) return;
    onSendToChat(currentVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
      {/* Liquid Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-[#0b0f19]/95 to-slate-950/95 shadow-[0_16px_64px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI Video Studio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Created by Jam AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate high-definition cinematic MP4 video from text prompts or animate photos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Video Prompt (वीडियो विवरण)</span>
                <span className="text-[10px] text-slate-500 font-mono">60fps AI Animation</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video in detail... (e.g. A cyber drone flying over neon skyscraper city)"
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all shadow-inner"
              />
            </div>

            {/* Inspiration Presets */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">Preset Inspirations:</span>
              <div className="flex flex-wrap gap-1.5">
                {VIDEO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setCustomText(p.banner);
                      setIsProEdit(true);
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image-to-Video Uploader */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>Animate Photo into Video (फोटो को वीडियो बनाएं)</span>
                </span>
                {sourceImage && (
                  <button
                    onClick={() => setSourceImage(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {sourceImage ? (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden h-28 w-full border border-amber-500/30">
                    <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40">
                          ✨ Seedance 2.0 & Omni AI Motion Ready
                        </span>
                        <span className="text-[10px] text-slate-300">4.2s HD Video</span>
                      </div>
                    </div>
                  </div>
                  {/* Photo animation quick style suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setPrompt('Living portrait with gentle natural movement, wind in hair, soft cinematic lighting, Seedance 2.0 style')}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      🌟 Living Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt('Cinematic 3D parallax dolly camera orbit, photorealistic depth, Google Omni style')}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    >
                      🎥 Omni 3D Orbit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt('Dramatic golden hour sunlight sweep, vibrant breathing motion, 8k cinematic masterpiece')}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                    >
                      🌅 Golden Sunlight Sweep
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center gap-2 text-xs transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload any photo or selfie to turn into a video</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Pro Reel & Multi-Cut Edit Switch */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏎️</span>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Pro Multi-Cut Reel & Car Edit Engine</span>
                    <span className="text-[10px] text-slate-400">Multi-angle cuts, speed ramps, 808 beat drop & kinetic titles</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProEdit(!isProEdit)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    isProEdit
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-white/[0.05] text-slate-400 border-white/10'
                  }`}
                >
                  {isProEdit ? 'ON (सक्रिय)' : 'OFF'}
                </button>
              </div>

              {isProEdit && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium text-slate-300">
                      Kinetic Title Banner (वीडियो पर टेक्स्ट व इमोजी लिखें)
                    </label>
                    <span className="text-[10px] text-amber-400/80">ऑटोमैटिक 4K मोशन कट</span>
                  </div>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. PORSCHE 911 GT3 RS or WAIT FOR IT 😂"
                    className="w-full py-1.5 px-3 rounded-xl text-xs bg-black/50 border border-white/10 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {/* Quick Title Chips */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {[
                      'PORSCHE 911 GT3 RS',
                      'BMW M PERFORMANCE',
                      'LAMBORGHINI V12',
                      'SUPERCAR APEX',
                      'WAIT FOR IT 😂',
                      'BEAST UNLEASHED 🔥',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setCustomText(tag)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] transition-all border ${
                          customText === tag
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10 hover:bg-white/[0.08]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aspect Ratio & Motion Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">AI Engine & Motion</label>
                <select
                  value={motion}
                  onChange={(e: any) => setMotion(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="pro-edit">🏎️ Pro Multi-Cut Reel (Car / Meme)</option>
                  <option value="seedance-living">🌟 Seedance 2.0 (Living Motion)</option>
                  <option value="google-omni">🎥 Google Omni (3D Dolly Orbit)</option>
                  <option value="zoom-in">🎬 Cinematic Focus Push In</option>
                  <option value="pan-right">🚁 Majestic Drone Flyby</option>
                  <option value="zoom-out">🌌 Horizon Pull Back</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && !sourceImage)}
              className="mt-1 w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Generating MP4 Video with Jam AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Video (वीडियो बनाएं)</span>
                </>
              )}
            </button>
          </div>

          {/* Video Preview Column */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 p-4 relative overflow-hidden min-h-[320px]">
            {currentVideo ? (
              <div className="relative flex flex-col h-full justify-between">
                {/* Responsive Video Player */}
                <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[380px] w-full">
                  <video
                    ref={videoRef}
                    src={currentVideo.url}
                    poster={currentVideo.thumbnailUrl}
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-contain max-h-[360px]"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Watermark badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white/90 shadow-md">
                    Created by Jam AI
                  </div>

                  {/* Center Play Overlay when paused */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
                    >
                      <Play className="h-7 w-7 fill-white ml-1" />
                    </button>
                  )}
                </div>

                {/* Player Toolbar */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      4s • 60fps MP4
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                      title="Download MP4 Video"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download MP4</span>
                    </button>
                    {onSendToChat && (
                      <button
                        onClick={handleSend}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all font-bold"
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
                  <Video className="h-8 w-8 text-amber-400/60" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Ready to Generate</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Type a prompt or upload a photo, then click "Generate Video" to create an ultra-smooth MP4 video.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
