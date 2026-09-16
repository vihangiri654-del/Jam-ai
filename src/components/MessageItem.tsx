import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  Layers,
  HelpCircle,
  FileCode,
  Image as ImageIcon,
  Download,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ChatMessage, QuizQuestion, Flashcard, AppProject } from '../types';
import {
  findBestMaleVoice,
  cleanSpeechText,
  fetchNeuralTTS,
  playNeuralAudio,
  stopCurrentAudio,
  getSavedCharacterVoice,
  getStableCharacterBrowserVoice,
} from '../utils/voiceHelper';

interface MessageItemProps {
  message: ChatMessage;
  onOpenAppBuilder?: (project: AppProject) => void;
  onEditImage?: (imageUrl: string, prompt: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenAppBuilder,
  onEditImage,
}) => {
  const isAssistant = message.role === 'assistant';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ChatGPT-Grade Neural Male Voice ("लड़के की आवाज़") Text-to-speech with natural cadence
  const handleSpeak = async () => {
    if (isSpeaking || isAudioLoading) {
      stopCurrentAudio();
      setIsSpeaking(false);
      setIsAudioLoading(false);
      return;
    }

    const cleanText = cleanSpeechText(message.text);
    if (!cleanText) return;

    setIsAudioLoading(true);
    const character = getSavedCharacterVoice();

    try {
      // 1. Try ChatGPT-Quality Neural AI Voice matching selected character
      const audioUri = await fetchNeuralTTS(cleanText.slice(0, 350), character.neuralVoice);
      setIsAudioLoading(false);
      setIsSpeaking(true);

      await playNeuralAudio(audioUri, () => {
        setIsSpeaking(false);
      });
    } catch {
      // 2. High-quality consistent Speech Synthesis fallback locked to this character
      setIsAudioLoading(false);
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = character.pitch;
      utterance.rate = character.rate;

      const voices = window.speechSynthesis.getVoices();
      const stableVoice = getStableCharacterBrowserVoice(character, voices);
      if (stableVoice) {
        utterance.voice = stableVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`group relative py-4 sm:py-5 px-3.5 sm:px-5 rounded-2xl transition-all ${
        isAssistant
          ? 'bg-white/[0.03] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm'
          : 'bg-gradient-to-r from-indigo-950/30 to-blue-950/20 border border-indigo-500/25'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {isAssistant ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 via-indigo-600 to-blue-700 text-white font-black text-xs shadow-[0_0_12px_rgba(99,102,241,0.3)] ring-1 ring-white/20">
              JAM
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-slate-200 ring-1 ring-white/10">
              <User className="h-4 w-4" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight">
              {isAssistant ? 'JAM AI' : 'You'}
            </span>
            {message.mode && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-indigo-300 border border-white/[0.1]">
                {message.mode}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {isAssistant && (
            <div className="flex items-center gap-1.5">
              {isAudioLoading && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 animate-pulse">
                  <RotateCw className="h-2.5 w-2.5 animate-spin text-indigo-400" />
                  <span>ChatGPT Voice...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="flex gap-0.5 h-2.5 items-end">
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2"></span>
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-3 [animation-delay:0.15s]"></span>
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-1.5 [animation-delay:0.3s]"></span>
                  </span>
                  <span>Speaking</span>
                </div>
              )}
              <button
                onClick={handleSpeak}
                title={isSpeaking ? 'Stop speaking' : isAudioLoading ? 'Loading voice...' : 'Read aloud (ChatGPT Neural Voice)'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-all"
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : isAudioLoading ? (
                  <RotateCw className="h-4 w-4 animate-spin text-indigo-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-indigo-300 hover:text-white" />
                )}
              </button>
            </div>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.text);
              setCopiedCode('msg-' + message.id);
              setTimeout(() => setCopiedCode(null), 2000);
            }}
            title="Copy message"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-all"
          >
            {copiedCode === 'msg-' + message.id ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Attached Files */}
      {message.files && message.files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {message.files.map((file, fIdx) => (
            <div
              key={`${file.id || file.name || 'file'}-${fIdx}`}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-300"
            >
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.previewUrl || `data:${file.mimeType};base64,${file.data}`}
                  alt={file.name}
                  className="h-8 w-8 rounded object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FileCode className="h-4 w-4 text-indigo-400" />
              )}
              <span className="font-medium max-w-[140px] truncate">{file.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Generated Video display */}
      {message.generatedVideo && (
        <div className="my-3 rounded-2xl overflow-hidden border border-white/15 bg-slate-950/80 p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="relative group/vid overflow-hidden rounded-xl bg-black flex items-center justify-center">
            <video
              src={message.generatedVideo.url}
              poster={message.generatedVideo.thumbnailUrl}
              controls
              loop
              playsInline
              className="w-full max-h-[460px] object-contain rounded-xl"
            />
            {/* Liquid Watermark */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white/95 shadow-lg pointer-events-none">
              Created by Jam AI
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 px-1">
            <p className="text-xs text-slate-300 italic max-w-[65%] truncate">
              "{message.generatedVideo.prompt || message.generatedVideo.title}"
            </p>
            <div className="flex items-center gap-2">
              <a
                href={message.generatedVideo.url}
                download="jam-ai-video.mp4"
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </a>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 shrink-0 shadow-sm">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                <span>60fps MP4</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Image display */}
      {message.generatedImage && (
        <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2">
          <div className="relative group/img overflow-hidden rounded-lg">
            <img
              src={message.generatedImage.url}
              alt={message.generatedImage.prompt}
              className="w-full max-h-[440px] object-contain rounded-lg bg-black/40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/70 backdrop-blur-md rounded-lg p-1">
              <a
                href={message.generatedImage.url}
                download="jam-ai-image.png"
                className="p-1.5 text-white hover:text-cyan-400 rounded"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
              {onEditImage && (
                <button
                  onClick={() =>
                    onEditImage(
                      message.generatedImage!.url,
                      message.generatedImage!.prompt
                    )
                  }
                  className="p-1.5 text-white hover:text-pink-400 rounded"
                  title="Edit in Image Studio"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 px-1">
            <p className="text-xs text-slate-400 italic max-w-[65%] truncate">
              "{message.generatedImage.prompt}"
            </p>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 shrink-0 shadow-sm">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Created by Jam AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Message Text / Markdown */}
      <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto">
        <ReactMarkdown
          components={{
            pre({ children }: any) {
              const codeProps = React.isValidElement(children) ? (children.props as any) : null;
              const rawCode = codeProps?.children != null ? String(codeProps.children) : String(children || '');
              const codeString = rawCode.replace(/\n$/, '');
              const className = codeProps?.className || '';
              const match = /language-(\w+)/.exec(className);
              const lang = match ? match[1] : 'code';
              const blockId = 'block-' + Math.random().toString(36).substring(2, 7);

              return (
                <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 not-prose">
                  <div className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400 border-b border-slate-800">
                    <span className="font-mono text-[11px] text-indigo-400 font-semibold uppercase">
                      {lang}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeString, blockId)}
                      className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCode === blockId ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto selection:bg-indigo-500/40 m-0">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            },
            code({ node, className, children, ...props }: any) {
              return (
                <code
                  className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-xs text-cyan-300"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>

      {/* Grounding & Search Citations (Research Mode) */}
      {message.grounding && (
        <div className="mt-3 rounded-xl border border-violet-900/40 bg-violet-950/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 mb-2">
            <Search className="h-3.5 w-3.5 text-violet-400" />
            <span>Research Grounding Sources</span>
          </div>

          {message.grounding.webSearchQueries && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {message.grounding.webSearchQueries.map((q, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-800/90 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300 font-mono"
                >
                  🔍 {q}
                </span>
              ))}
            </div>
          )}

          {message.grounding.groundingChunks && (
            <div className="flex flex-wrap gap-2">
              {message.grounding.groundingChunks.map((chunk, idx) => {
                if (!chunk.web?.uri) return null;
                return (
                  <a
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 underline bg-slate-900/60 px-2 py-1 rounded border border-slate-800"
                  >
                    <span>{chunk.web.title || chunk.web.uri}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* App Project Card */}
      {message.appProject && onOpenAppBuilder && (
        <div className="mt-3 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                {message.appProject.appName}
              </h4>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                {message.appProject.platform}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {message.appProject.tagline || 'Fully generated runnable application'}
            </p>
          </div>
          <button
            onClick={() => onOpenAppBuilder(message.appProject!)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <span>Launch Live Sandbox</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Embedded Interactive Quiz */}
      {message.quiz && message.quiz.length > 0 && (
        <div className="mt-4">
          <InteractiveQuiz questions={message.quiz} />
        </div>
      )}

      {/* Embedded Flashcard Deck */}
      {message.flashcards && message.flashcards.length > 0 && (
        <div className="mt-4">
          <FlashcardDeck cards={message.flashcards} />
        </div>
      )}
    </div>
  );
};

// Interactive Quiz Component
const InteractiveQuiz: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = questions.reduce((acc, q, idx) => {
    return answers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Study Mode: Interactive Quiz
          </h4>
        </div>
        {showResults && (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
            Score: {score} / {questions.length}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selected = answers[qIdx];
          const isSubmitted = showResults;

          return (
            <div key={qIdx} className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
              <p className="text-xs font-semibold text-slate-100 mb-2">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'border-slate-800 hover:bg-slate-800 text-slate-300';
                  if (selected === optIdx) {
                    optStyle = 'border-indigo-500 bg-indigo-950/40 text-white';
                  }
                  if (isSubmitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                    } else if (selected === optIdx && optIdx !== q.correctIndex) {
                      optStyle = 'border-rose-500 bg-rose-950/40 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full text-left rounded-md border p-2 text-xs transition-colors flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && optIdx === q.correctIndex && (
                        <Check className="h-3.5 w-3.5 text-emerald-400 ml-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <p className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="font-semibold text-amber-400">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-400">
          {Object.keys(answers).length} of {questions.length} answered
        </span>
        <button
          onClick={() => setShowResults(!showResults)}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
        >
          {showResults ? 'Hide Explanations' : 'Check Answers & Grade'}
        </button>
      </div>
    </div>
  );
};

// Flashcard Deck Component
const FlashcardDeck: React.FC<{ cards: Flashcard[] }> = ({ cards }) => {
  const [currIdx, setCurrIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[currIdx];

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          Study Mode: Flashcards ({currIdx + 1} / {cards.length})
        </span>
        <span className="text-[11px] text-slate-400">Click card to flip</span>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[140px] cursor-pointer rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-center items-center text-center transition-all hover:border-emerald-500/50 shadow-inner"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
          {isFlipped ? 'Answer / Explanation' : 'Question / Concept'}
        </span>
        <p className="text-sm font-medium text-white px-2">
          {isFlipped ? card.back : card.front}
        </p>
        {isFlipped && card.keyTakeaway && (
          <p className="mt-2 text-xs text-amber-300 font-semibold">
            Key: {card.keyTakeaway}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrIdx((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs text-emerald-400 hover:underline"
        >
          Flip Card
        </button>
        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrIdx((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
