export type AppMode =
  | 'AUTO'
  | 'CHAT'
  | 'CODING'
  | 'APP BUILDER'
  | 'IMAGE'
  | 'VIDEO'
  | 'EDITOR'
  | 'STUDY'
  | 'RESEARCH'
  | 'CREATOR'
  | 'DATA'
  | 'WRITER'
  | 'TRANSLATOR';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // Base64
  previewUrl?: string;
}

export interface AppProjectFile {
  path: string;
  language: string;
  content: string;
}

export interface AppProject {
  appName: string;
  tagline?: string;
  platform: string;
  techStack: string;
  features: string[];
  previewHtml: string;
  files: AppProjectFile[];
  runInstructions?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
  keyTakeaway?: string;
}

export interface GroundingSource {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  mode?: AppMode;
  files?: FileAttachment[];
  grounding?: GroundingSource | null;
  appProject?: AppProject;
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
  generatedImage?: {
    url: string;
    prompt: string;
    aspectRatio?: string;
  };
  generatedVideo?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    prompt: string;
    title?: string;
    duration?: string;
    aspectRatio?: string;
  };
  ultraThinking?: boolean;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: AppMode;
  messages: ChatMessage[];
  isPinned?: boolean;
  projectContext?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'KICKED' | 'BANNED';
  joinedAt: number;
  lastActive: number;
  ip?: string;
  device?: string;
}
