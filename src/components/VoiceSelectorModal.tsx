import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Check,
  Play,
  Square,
  Sparkles,
  Lock,
  X,
  User,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  JAM_CHARACTER_VOICES,
  CharacterVoice,
  getSavedCharacterVoice,
  saveCharacterVoice,
  fetchNeuralTTS,
  playNeuralAudio,
  stopCurrentAudio,
  getStableCharacterBrowserVoice,
} from '../utils/voiceHelper';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelected?: (voice: CharacterVoice) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  onVoiceSelected,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<CharacterVoice>(getSavedCharacterVoice);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVoice(getSavedCharacterVoice());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (voice: CharacterVoice) => {
    setSelectedVoice(voice);
    saveCharacterVoice(voice.id);
    if (onVoiceSelected) {
      onVoiceSelected(voice);
    }
  };

  const handleTestAudio = async (voice: CharacterVoice) => {
    if (playingVoiceId === voice.id) {
      stopCurrentAudio();
      setPlayingVoiceId(null);
      return;
    }

    stopCurrentAudio();
    setPlayingVoiceId(voice.id);

    try {
      // 1. Try neural voice first
      const sample = voice.samplePhrase;
      const audioUri = await fetchNeuralTTS(sample, voice.neuralVoice);
      await playNeuralAudio(audioUri, () => setPlayingVoiceId(null));
    } catch {
      // 2. Stable device speech synthesis fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voice.samplePhrase);
        utterance.pitch = voice.pitch;
        utterance.rate = voice.rate;

        const voices = window.speechSynthesis.getVoices();
        const matched = getStableCharacterBrowserVoice(voice, voices);
        if (matched) utterance.voice = matched;

        utterance.onend = () => setPlayingVoiceId(null);
        utterance.onerror = () => setPlayingVoiceId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingVoiceId(null);
      }
    }
  };

  const handleClose = () => {
    stopCurrentAudio();
    setPlayingVoiceId(null);
    onClose();
  };

  return (
    <div
      id="voice-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all"
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                नेचुरल आवाज़ चुनें (ChatGPT & Claude Grade Voices)
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Ultra-Clear Human Tone
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                पुराने रोबोटिक आवाज़ को हटा दिया गया है — अब ChatGPT व Claude जैसी शुद्ध और स्पष्ट मानवीय आवाज़ें!
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Active Voice Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedVoice.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{selectedVoice.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                    Active Voice
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{selectedVoice.labelHindi}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Locked & Consistent</span>
            </div>
          </div>

          {/* Voice Character Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {JAM_CHARACTER_VOICES.map((voice) => {
              const isSelected = selectedVoice.id === voice.id;
              const isPlaying = playingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => handleSelect(voice)}
                  className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          {voice.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm">{voice.name}</h4>
                            {isSelected && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-indigo-300">
                            {voice.labelHindi}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {voice.gender === 'male' ? 'Male (लड़का)' : 'Female (लड़की)'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {voice.role}
                    </p>
                  </div>

                  {/* Audio Audition Preview Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestAudio(voice);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current text-indigo-400" />
                          <span>आवाज़ सुनें (Preview)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect(voice)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 group-hover:text-indigo-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Voice'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">स्थिरता की गारंटी (Zero Voice Shift Guarantee):</strong> जब आप अपनी पसंदीदा आवाज़ चुनते हैं, तो चाहे आप चैट में ऑडियो सुनें या वॉइस कॉल पर बात करें, JAM AI हमेशा इसी आवाज़ का उपयोग करेगा।
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/70">
          <span className="text-xs text-slate-400">
            Current: <strong className="text-white">{selectedVoice.name}</strong>
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950 transition-all active:scale-95"
          >
            आवाज़ सेव करें (Save & Done)
          </button>
        </div>

      </div>
    </div>
  );
};
