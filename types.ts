
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  optionExplanations?: string[]; // Specific explanation for each option
}

export interface KeyConcept {
  title: string;
  description: string;
  icon: string; // Lucide icon name suggestion
}

export interface LessonPlan {
  topic: string;
  summary: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  visualPrompt: string; // Prompt to generate an image
  analogy: string;
  keyConcepts: KeyConcept[];
  quiz: QuizQuestion[];
}

export enum ViewMode {
  THEORY = 'THEORY',
  VISUAL = 'VISUAL',
  QUIZ = 'QUIZ',
  LAB = 'LAB',
  CHAT = 'CHAT',
  VIDEO = 'VIDEO',
  PRACTICE = 'PRACTICE',
  NOTES = 'NOTES',
  RESEARCH = 'RESEARCH',
  DASHBOARD = 'DASHBOARD'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  state: 'Solid' | 'Liquid' | 'Gas' | 'Solution';
  defaultAmount?: number;
  defaultUnit?: string;
}

export interface Reactant extends Chemical {
  amount: number;
  unit: string;
}

export interface ExperimentResult {
  observation: string;
  explanation: string;
  safetyNote?: string;
  visualPrompt: string;
  stoichiometry?: string; // New field for chemical calculations
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // base64
  videoUrl?: string; // for display
  videoData?: string; // base64 for api
  isThinking?: boolean;
  groundingUrls?: {title: string; uri: string}[];
}

export interface PracticeQuestion {
  id: string;
  type: 'MCQ' | 'Short' | 'Long' | 'PYQ';
  question: string;
  answer: string; // The model answer or explanation
  marks: number;
  year?: string; // For PYQs (e.g., "CBSE 2023")
  isImportant: boolean;
  subject?: string;
}

export interface GradingResult {
  score: number;
  maxMarks: number;
  feedback: string;
  improvements: string[];
}

export interface NoteSection {
  heading: string;
  content: string;
}

export interface StudyNote {
  title: string;
  subject: string;
  targetClass: string;
  sourcesUsed: string[];
  sections: NoteSection[];
  importantFormulas: string[];
}

export interface VisualContent {
  images: string[];
  videoUrl: string | null;
  notes: string[];
}

export interface ImageAnalysisElement {
  label: string;
  description: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax]
}

export interface ImageAnalysisResult {
  overallAnalysis: string;
  elements: ImageAnalysisElement[];
}

export interface UserHistory {
  id: string;
  topic: string;
  date: string;
  type: 'LESSON' | 'QUIZ' | 'PRACTICE';
  score?: number;
  details?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  class: string;
  xp: number;
  streak: number;
  history: UserHistory[];
  joinedDate: string;
}