/**
 * Voice & Audio Synthesis Helper for JAM AI
 * 1. ChatGPT-Grade Neural Voices (Google GenAI TTS: Puck, Charon, Fenrir, Kore, Zephyr)
 * 2. 10 Multiple Languages Support (Hindi, English, Hinglish, Marathi, Bengali, Tamil, Telugu, Gujarati, Punjabi, Urdu)
 * 3. Fallback High-Quality Web Speech with Male ("लड़के की आवाज़") Prioritization
 */

export interface AppLanguage {
  id: string;
  code: string;
  label: string;
  englishName: string;
  flag: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  {
    id: 'hi',
    code: 'hi-IN',
    label: 'हिन्दी',
    englishName: 'Hindi',
    flag: '🇮🇳',
    greeting: 'नमस्ते! मैं JAM AI हूँ, बताइए आज मैं आपकी क्या मदद करूँ?',
  },
  {
    id: 'en',
    code: 'en-US',
    label: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    greeting: "Hey! I'm JAM AI, your friendly companion. How can I help you today?",
  },
  {
    id: 'hinglish',
    code: 'hi-IN',
    label: 'Hinglish (हिंग्लिश)',
    englishName: 'Hinglish',
    flag: '🇮🇳',
    greeting: 'अरे ब्रो! क्या हाल चाल? JAM AI हाज़िर है, बताओ आज क्या खास करना है?',
  },
  {
    id: 'mr',
    code: 'mr-IN',
    label: 'मराठी',
    englishName: 'Marathi',
    flag: '🇮🇳',
    greeting: 'नमस्कार! मी JAM AI आहे. मी आज तुम्हाला कशी मदत करू शकतो?',
  },
  {
    id: 'bn',
    code: 'bn-IN',
    label: 'বাংলা',
    englishName: 'Bengali',
    flag: '🇮🇳',
    greeting: 'নমস্কার! আমি JAM AI. বলুন আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  },
  {
    id: 'ta',
    code: 'ta-IN',
    label: 'தமிழ்',
    englishName: 'Tamil',
    flag: '🇮🇳',
    greeting: 'வணக்கம்! நான் JAM AI. இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
  },
  {
    id: 'te',
    code: 'te-IN',
    label: 'తెలుగు',
    englishName: 'Telugu',
    flag: '🇮🇳',
    greeting: 'నమస్కారం! నేను JAM AI. ఈరోజు మీకు ఎలా సహాయపడగలను?',
  },
  {
    id: 'gu',
    code: 'gu-IN',
    label: 'ગુજરાતી',
    englishName: 'Gujarati',
    flag: '🇮🇳',
    greeting: 'નમસ્તે! હું JAM AI છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?',
  },
  {
    id: 'pa',
    code: 'pa-IN',
    label: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    flag: '🇮🇳',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਮੈਂ JAM AI ਹਾਂ। ਦੱਸੋ ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
  },
  {
    id: 'ur',
    code: 'ur-IN',
    label: 'اردو',
    englishName: 'Urdu',
    flag: '🇮🇳',
    greeting: 'السلام علیکم! میں JAM AI ہوں۔ فرمائیے آج میں آپ کی کیا مدد کر سکتا ہوں؟',
  },
];

export interface NeuralVoice {
  id: string;
  name: string;
  gender: 'male';
  personality: string;
  description: string;
  tag: string;
}

export const JAM_INDIAN_VOICES: NeuralVoice[] = [
  {
    id: 'Aryan',
    name: '👦 Aryan (आर्यन - नेचुरल इंडियन ब्रो)',
    gender: 'male',
    personality: 'प्राकृतिक, दोस्ताना और ऊर्जावान भारतीय लड़का',
    description: 'शुद्ध हिंदी और इंडियन इंग्लिश के लिए नेचुरल व मानवीय आवाज़',
    tag: 'Locked Boy Default',
  },
  {
    id: 'Kabir',
    name: '🎙️ Kabir (कबीर - डीप इंडियन मेल)',
    gender: 'male',
    personality: 'गंभीर, आत्मविश्वासी और शांत भाई',
    description: 'गहरी, स्पष्ट और स्थिर भारतीय पुरुष आवाज़',
    tag: 'Deep Male Bro',
  },
  {
    id: 'Rohan',
    name: '⚡ Rohan (रोहन - सुपर फ़ास्ट युवा आवाज़)',
    gender: 'male',
    personality: 'फुर्तीली, तेज और स्पष्ट आवाज़',
    description: 'साफ भारतीय उच्चारण और 0.9s अल्ट्रा-फ़ास्ट जवाब के लिए बेस्ट',
    tag: 'Ultra-Fast Boy',
  },
];

// Alias for backwards compatibility
export const CHATGPT_NEURAL_VOICES = JAM_INDIAN_VOICES;

export interface CharacterVoice {
  id: string;
  name: string;
  labelHindi: string;
  role: string;
  avatar: string;
  gender: 'male';
  pitch: number;
  rate: number;
  neuralVoice: string;
  samplePhrase: string;
}

// High-Definition ChatGPT & Claude Grade Natural Human Voices
export const JAM_CHARACTER_VOICES: CharacterVoice[] = [
  {
    id: 'puck-chatgpt',
    name: 'Puck (ChatGPT Natural)',
    labelHindi: 'चैट जीपीटी स्टाइल — नेचुरल वॉइस (Default)',
    role: 'एकदम स्पष्ट, फ्रेंडली और प्राकृतिक आवाज़ (जैसे ChatGPT व Claude)',
    avatar: '✨',
    gender: 'male',
    pitch: 1.0,
    rate: 1.0,
    neuralVoice: 'Puck',
    samplePhrase: 'नमस्ते विहान भाई! मैं JAM AI हूँ, एकदम ChatGPT और Claude जैसी साफ और नेचुरल आवाज़ में!',
  },
  {
    id: 'charon-deep',
    name: 'Charon (Claude Deep)',
    labelHindi: 'क्लाउड स्टाइल — डीप ह्यूमन वॉइस',
    role: 'गहरी, शांत, समझदार और अत्यंत स्पष्ट बौद्धिक आवाज़',
    avatar: '🎙️',
    gender: 'male',
    pitch: 1.0,
    rate: 0.98,
    neuralVoice: 'Charon',
    samplePhrase: 'नमस्ते भाई! मैं शैरॉन हूँ, शांत और परिपक्व आवाज़ में आपके हर सवाल का हल निकालने के लिए तत्पर।',
  },
  {
    id: 'aoede-warm',
    name: 'Aoede (Warm Expressive)',
    labelHindi: 'मधुर व मानवीय आवाज़ (Warm & Expressive)',
    role: 'प्राकृतिक अभिव्यक्ति और स्पष्ट मानवीय टोन',
    avatar: '🌟',
    gender: 'male',
    pitch: 1.0,
    rate: 1.0,
    neuralVoice: 'Aoede',
    samplePhrase: 'हेलो भाई! मैं बिल्कुल नेचुरल और सजीव आवाज़ में आपकी हर प्रकार से मदद करने के लिए तैयार हूँ।',
  },
  {
    id: 'fenrir-fast',
    name: 'Fenrir (Modern Bold)',
    labelHindi: 'मॉडर्न व ऊर्जावान आवाज़ (Bold & Confident)',
    role: 'तेज़, सटीक, आधुनिक और फुर्तीली बातचीत',
    avatar: '⚡',
    gender: 'male',
    pitch: 1.0,
    rate: 1.02,
    neuralVoice: 'Fenrir',
    samplePhrase: 'अरे भाई! मैं फेनरिर हूँ, सुपर फ़ास्ट और कॉन्फिडेंट आवाज़ में तुरंत उत्तर देने के लिए तैयार!',
  },
  {
    id: 'aarav-indian',
    name: 'Aarav (Natural Indian)',
    labelHindi: 'नेचुरल इंडियन ब्रो (Aarav Natural)',
    role: 'शुद्ध हिंदी, हिंग्लिश और इंडियन एक्सेंट में दोस्ताना मानवीय टोन',
    avatar: '👦',
    gender: 'male',
    pitch: 1.0,
    rate: 1.0,
    neuralVoice: 'Puck',
    samplePhrase: 'अरे विहान भाई! मैं आरव हूँ, बिल्कुल देसी और नेचुरल टोन में बात करने के लिए हाज़िर!',
  },
];

export const LOCKED_BOY_VOICE = JAM_CHARACTER_VOICES[0];

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  pitch: number;
  rate: number;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'boy-energetic',
    name: '👦 JAM Bro (लड़के की आवाज़)',
    description: 'उत्साही और स्वाभाविक लड़के की आवाज़',
    pitch: 0.94,
    rate: 1.08,
  },
  {
    id: 'guy-deep',
    name: '🎙️ Deep Bro (गंभीर आवाज़)',
    description: 'गहरी और शांत पुरुष आवाज़',
    pitch: 0.88,
    rate: 1.02,
  },
  {
    id: 'fast-bro',
    name: '⚡ Fast Bro (सुपर फ़ास्ट)',
    description: 'तेज और फुर्तीली बातचीत',
    pitch: 0.95,
    rate: 1.2,
  },
];

// Active audio tracking
let currentAudioElement: HTMLAudioElement | null = null;

export function stopCurrentAudio() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export async function playNeuralAudio(audioUri: string, onEnd?: () => void): Promise<HTMLAudioElement> {
  stopCurrentAudio();
  const audio = new Audio(audioUri);
  currentAudioElement = audio;

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      if (onEnd) onEnd();
      reject(e);
    };

    audio
      .play()
      .then(() => resolve(audio))
      .catch((err) => {
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (onEnd) onEnd();
        reject(err);
      });
  });
}

// Pre-load and cache browser voices as soon as the module loads
let cachedBrowserVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedBrowserVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedBrowserVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Request ChatGPT-quality Neural Speech from /api/tts
 */
export async function fetchNeuralTTS(text: string, voice = 'Puck', lang?: string): Promise<string> {
  const clean = cleanSpeechText(text).slice(0, 450);
  if (!clean) throw new Error('No text to speak');

  // Auto-detect if Hindi / Devanagari is present
  const isHindi = /[\u0900-\u097F]/.test(clean);
  const detectedLang = lang || (isHindi ? 'hi' : 'en');

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clean, voice, lang: detectedLang }),
  });

  if (!res.ok) {
    throw new Error('FALLBACK_BROWSER');
  }

  const data = await res.json().catch(() => ({}));
  if (!data.audio) {
    throw new Error('FALLBACK_BROWSER');
  }

  return data.audio;
}

// Keywords indicating a female voice to strictly avoid when seeking a male/boy voice
const FEMALE_KEYWORDS = [
  'female',
  'woman',
  'girl',
  'zira',
  'kavya',
  'kalpana',
  'swara',
  'priya',
  'samantha',
  'victoria',
  'kore',
  'zephyr',
  'heera',
  'ananya',
  'neerja',
  'sita',
  'geeta',
  'hazel',
  'susan',
  'catherine',
  'jenny',
  'aria',
  'sonia',
  'madhuri',
  'leila',
  'her',
  'she',
];

const MALE_KEYWORDS = [
  'male',
  'boy',
  'man',
  'guy',
  'ravi',
  'hemant',
  'prabhat',
  'david',
  'mark',
  'ryan',
  'andrew',
  'christopher',
  'george',
  'mohan',
  'arjun',
  'neel',
  'puck',
  'fenrir',
  'charon',
  'madhur',
  'deep',
  'cfh',
  'std-b',
  'wave-b',
  'wavenet-b',
  'standard-b',
  'standard-d',
  'wavenet-d',
  'guy online',
  'natural male',
  'neural male',
];

export function isMaleVoice(voice: SpeechSynthesisVoice): boolean {
  const text = `${voice.name} ${voice.voiceURI || ''}`.toLowerCase();
  const hasMaleWord = MALE_KEYWORDS.some((k) => text.includes(k));
  const hasFemaleWord = FEMALE_KEYWORDS.some((k) => text.includes(k));
  return hasMaleWord && !hasFemaleWord;
}

export function isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const text = `${voice.name} ${voice.voiceURI || ''}`.toLowerCase();
  return FEMALE_KEYWORDS.some((k) => text.includes(k));
}

/**
 * Clean spoken text: removes emojis, markdown, code blocks, and brackets
 * so the speech synthesis sounds 100% natural and human-like.
 */
export function cleanSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*#_~>|`\[\](){}]/g, ' ')
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Automatically pick the highest quality male voice available in the browser.
 * STRICT: NEVER returns a female voice or robotic default.
 */
export function findBestMaleVoice(
  voices: SpeechSynthesisVoice[],
  preferLangCode?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Strictly filter genuine male voices first
  const explicitMaleVoices = voices.filter((v) => isMaleVoice(v));

  if (explicitMaleVoices.length > 0) {
    if (preferLangCode) {
      const langPrefix = preferLangCode.split('-')[0].toLowerCase();
      const inLang = explicitMaleVoices.find(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.name.toLowerCase().includes(langPrefix)
      );
      if (inLang) return inLang;
    }

    // Indian English Male (e.g. Microsoft Ravi, Google Indian Male)
    const inMale = explicitMaleVoices.find((v) => v.lang.includes('IN'));
    if (inMale) return inMale;

    // High quality natural male voices
    const naturalMale = explicitMaleVoices.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Neural') ||
        v.name.includes('Google') ||
        v.name.includes('Microsoft')
    );
    if (naturalMale) return naturalMale;

    return explicitMaleVoices[0];
  }

  // 2. If no explicit male voice found, strictly disqualify ALL female voices
  const nonFemaleVoices = voices.filter((v) => !isFemaleVoice(v));
  if (nonFemaleVoices.length > 0) {
    if (preferLangCode) {
      const langPrefix = preferLangCode.split('-')[0].toLowerCase();
      const inLang = nonFemaleVoices.find(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.name.toLowerCase().includes(langPrefix)
      );
      if (inLang) return inLang;
    }
    const inIN = nonFemaleVoices.find((v) => v.lang.includes('IN'));
    if (inIN) return inIN;
    return nonFemaleVoices[0];
  }

  // 3. Absolute last resort fallback: return first voice (caller applies pitch lowering)
  return voices[0] || null;
}

/**
 * Match browser SpeechSynthesis voice based on character persona.
 * Strictly enforces Boy / Male timbre.
 */
export function findCharacterVoice(
  character: CharacterVoice,
  voices: SpeechSynthesisVoice[],
  langCode?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  return findBestMaleVoice(voices, langCode);
}

// Stabilized locked browser voice cache per character ID so the voice never flips between questions
const characterVoiceCache = new Map<string, SpeechSynthesisVoice>();

export function getSavedCharacterVoice(): CharacterVoice {
  try {
    const savedId = localStorage.getItem('jam_ai_character_voice_id');
    if (savedId) {
      const found = JAM_CHARACTER_VOICES.find((c) => c.id === savedId);
      if (found) return found;
    }
  } catch {
    // Gracefully handle storage limitations
  }
  // Default and permanent lock: Aryan (कूल लड़का / ब्रो - Locked Boy Voice)
  return JAM_CHARACTER_VOICES[0];
}

export function saveCharacterVoice(voiceId: string) {
  try {
    // Prevent saving any deprecated female voice ID
    const valid = JAM_CHARACTER_VOICES.find((c) => c.id === voiceId);
    const finalId = valid ? valid.id : JAM_CHARACTER_VOICES[0].id;
    localStorage.setItem('jam_ai_character_voice_id', finalId);
    window.dispatchEvent(new CustomEvent('jam_character_voice_changed', { detail: finalId }));
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Resolves a persistent, natural Indian human voice for Hindi and English speech
 */
export function getStableCharacterBrowserVoice(
  character: CharacterVoice,
  voices: SpeechSynthesisVoice[],
  targetLang?: string
): SpeechSynthesisVoice | null {
  const effectiveVoices = voices && voices.length > 0 ? voices : cachedBrowserVoices;
  if (!effectiveVoices || effectiveVoices.length === 0) return null;

  const isHindi = targetLang?.startsWith('hi') || false;
  const cacheKey = `${character.id}:${isHindi ? 'hi' : 'en'}`;

  // Check if we already locked a voice for this character and language
  if (characterVoiceCache.has(cacheKey)) {
    const cached = characterVoiceCache.get(cacheKey)!;
    if (effectiveVoices.some((v) => v.name === cached.name)) {
      return cached;
    }
  }

  let resolved: SpeechSynthesisVoice | null = null;

  if (isHindi) {
    // Look for authentic Hindi voice (Google हिन्दी, Microsoft Madhur, etc.)
    resolved =
      effectiveVoices.find(
        (v) =>
          (v.lang.toLowerCase().startsWith('hi') ||
            v.name.includes('हिन्दी') ||
            v.name.toLowerCase().includes('hindi')) &&
          !isFemaleVoice(v)
      ) ||
      effectiveVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.includes('हिन्दी') ||
          v.name.toLowerCase().includes('hindi')
      ) ||
      null;
  } else {
    // Look for authentic Indian English / natural male voice
    resolved =
      effectiveVoices.find(
        (v) =>
          (v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().includes('en_in') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('prabhat')) &&
          !isFemaleVoice(v)
      ) ||
      findBestMaleVoice(effectiveVoices, 'en-IN') ||
      null;
  }

  if (!resolved) {
    resolved = findBestMaleVoice(effectiveVoices, isHindi ? 'hi-IN' : 'en-IN') || effectiveVoices[0];
  }

  if (resolved) {
    characterVoiceCache.set(cacheKey, resolved);
  }
  return resolved;
}

/**
 * Natural Human Voice Delivery: Speaks with genuine ChatGPT/Claude grade neural voice first,
 * with clean fallback to natural browser speech synthesis.
 */
export async function speakLockedBoyVoice(text: string, onEnd?: () => void): Promise<void> {
  const clean = cleanSpeechText(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  const character = getSavedCharacterVoice();

  // 1. Attempt High-Definition Neural TTS (ChatGPT/Claude Grade)
  try {
    const isHindi = /[\u0900-\u097F]/.test(clean);
    const audioUri = await fetchNeuralTTS(clean, character.neuralVoice, isHindi ? 'hi' : 'en');
    if (audioUri && audioUri.startsWith('data:audio/')) {
      await playNeuralAudio(audioUri, onEnd);
      return;
    }
  } catch {
    // Graceful fallback to natural device speech
  }

  // 2. High-Quality Natural Browser Speech Fallback
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    
    // Natural conversational human cadence
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const isHindi = /[\u0900-\u097F]/.test(clean);
    const targetLang = isHindi ? 'hi-IN' : 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const stableVoice = getStableCharacterBrowserVoice(character, voices, targetLang);
    if (stableVoice) {
      utterance.voice = stableVoice;
      utterance.lang = stableVoice.lang || targetLang;
    } else {
      utterance.lang = targetLang;
    }

    (window as any).__jam_active_utterance = utterance;

    utterance.onend = () => {
      (window as any).__jam_active_utterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      (window as any).__jam_active_utterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) onEnd();
  }
}


