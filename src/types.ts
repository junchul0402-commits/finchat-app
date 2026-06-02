/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Choice {
  text: string;
  scores: {
    A?: number;
    B?: number;
    C?: number;
  };
}

export interface Question {
  q: string;
  choices: Choice[];
}

export type UserType = 'A' | 'B' | 'C';

export interface TypeDetail {
  icon: string;
  name: string;
  tagline: string;
  desc: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  feedback?: 'like' | 'dislike' | null;
}

export interface AppState {
  currentPage: 'main' | 'diagnosis' | 'chat';
  diagnosisStep: 'intro' | 'question' | 'loading' | 'result';
  currentQuestion: number;
  answers: number[]; // Index of choices selected
  scores: { A: number; B: number; C: number };
  userType: UserType | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}
