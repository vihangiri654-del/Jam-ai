import React, { useState } from 'react';
import {
  X,
  BookOpen,
  HelpCircle,
  Sparkles,
  RotateCw,
  Send,
  Check,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QuizQuestion, Flashcard } from '../types';

interface StudyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendStudySetToChat?: (topic: string, quiz: QuizQuestion[], flashcards: Flashcard[]) => void;
}

export const StudyLabModal: React.FC<StudyLabModalProps> = ({
  isOpen,
  onClose,
  onSendStudySetToChat,
}) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards'>('quiz');

  // Quiz interactive state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Flashcard state
  const [cardIdx, setCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateStudySet = async (customTopic?: string) => {
    const finalTopic = customTopic || topic;
    if (!finalTopic.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setCardIdx(0);
    setIsCardFlipped(false);

    try {
      const res = await fetch('/api/study-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.quiz) setQuizQuestions(data.quiz);
      if (data.flashcards) setFlashcards(data.flashcards);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate study materials.');
    } finally {
      setIsGenerating(false);
    }
  };

  const score = quizQuestions.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const POPULAR_TOPICS = [
    'Machine Learning & Transformers',
    'Calculus: Derivatives and Integrals',
    'Quantum Physics: Double Slit & Superposition',
    'Organic Chemistry: Reaction Mechanisms',
    'World War II: Turning Points & Geopolitics',
    'Data Structures: Binary Trees & Graphs',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">JAM AI — Study Lab & Tutor</h2>
              <p className="text-xs text-slate-400">
                Generate tailored diagnostic quizzes, flashcards, and conceptual deep-dives
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Controls */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-4 bg-slate-950/40 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject or Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Neural Networks..."
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                      difficulty === lvl
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <button
              onClick={() => handleGenerateStudySet()}
              disabled={isGenerating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Curating Study Pack...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Quiz & Flashcards</span>
                </>
              )}
            </button>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Curated Topics
              </label>
              <div className="space-y-1.5">
                {POPULAR_TOPICS.map((top, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(top);
                      handleGenerateStudySet(top);
                    }}
                    className="w-full text-left rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 p-2 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Workspace */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {quizQuestions.length > 0 || flashcards.length > 0 ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeTab === 'quiz'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Practice Quiz ({quizQuestions.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeTab === 'flashcards'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Flashcards ({flashcards.length})
                    </button>
                  </div>

                  {onSendStudySetToChat && (
                    <button
                      onClick={() => {
                        onSendStudySetToChat(topic, quizQuestions, flashcards);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Post to Chat</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === 'quiz' ? (
                    <div className="max-w-2xl mx-auto space-y-4">
                      {isSubmitted && (
                        <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-emerald-200">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-emerald-400" />
                            <span className="text-xs font-bold">
                              Quiz Complete! Score: {score} out of {quizQuestions.length}
                            </span>
                          </div>
                          <span className="text-xs font-semibold">
                            {Math.round((score / quizQuestions.length) * 100)}%
                          </span>
                        </div>
                      )}

                      {quizQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-100">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const selected = userAnswers[qIdx] === optIdx;
                              let btnClass = 'border-slate-800 hover:bg-slate-800 text-slate-300';
                              if (selected) btnClass = 'border-indigo-500 bg-indigo-950/40 text-white';
                              if (isSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  btnClass =
                                    'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                                } else if (selected && optIdx !== q.correctIndex) {
                                  btnClass = 'border-rose-500 bg-rose-950/40 text-rose-300';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => {
                                    if (!isSubmitted) {
                                      setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                    }
                                  }}
                                  className={`w-full text-left rounded-lg border p-2.5 text-xs transition-colors flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {isSubmitted && optIdx === q.correctIndex && (
                                    <Check className="h-3.5 w-3.5 text-emerald-400 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {isSubmitted && (
                            <p className="mt-2 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                              <strong className="text-amber-400">Teacher's Explanation: </strong>
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setIsSubmitted(!isSubmitted)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          {isSubmitted ? 'Reset Answers' : 'Submit & Check Answers'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Flashcards */
                    <div className="max-w-md mx-auto py-8 flex flex-col items-center">
                      {flashcards.length > 0 && (
                        <>
                          <div
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className="w-full min-h-[200px] cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-center items-center text-center hover:border-emerald-500/50 shadow-xl transition-all"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">
                              {isCardFlipped ? 'Key Explanation' : 'Concept / Question'}
                            </span>
                            <p className="text-sm font-semibold text-white leading-relaxed">
                              {isCardFlipped ? flashcards[cardIdx].back : flashcards[cardIdx].front}
                            </p>
                            {isCardFlipped && flashcards[cardIdx].keyTakeaway && (
                              <p className="mt-3 text-xs text-amber-300 font-medium">
                                Takeaway: {flashcards[cardIdx].keyTakeaway}
                              </p>
                            )}
                            <span className="mt-4 text-[10px] text-slate-500">
                              (Click card to flip)
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between w-full px-2">
                            <button
                              onClick={() => {
                                setIsCardFlipped(false);
                                setCardIdx((p) => (p > 0 ? p - 1 : flashcards.length - 1));
                              }}
                              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-xs text-slate-400 font-mono">
                              {cardIdx + 1} / {flashcards.length}
                            </span>
                            <button
                              onClick={() => {
                                setIsCardFlipped(false);
                                setCardIdx((p) => (p < flashcards.length - 1 ? p + 1 : 0));
                              }}
                              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mb-3">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">JAM AI Personal Tutor</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Enter any subject or choose a curated topic on the left to generate comprehensive
                  practice quizzes and revision flashcards.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
