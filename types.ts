
export interface VisualOption {
  text: string;
  icon: string; // Name of the lucide icon
  color: string; // Tailwind color class (e.g. 'bg-red-500')
}

export interface Question {
  id: number;
  text: string;
  options: string[] | VisualOption[];
}

export interface CreatureConcept {
  name: string;
  description: string;
  imagePrompt: string;
}

export interface CreatureData extends CreatureConcept {
  imageUrl: string;
}

export interface ExternalConfig {
  endpoint: string;
  apiKey?: string;
}

export enum AppState {
  WELCOME,
  QUIZ,
  GENERATING,
  RESULT,
  ERROR
}

export type AnswerMap = Record<number, string>;
