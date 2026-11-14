/** Structured teaching data shared by the interactive reader and book exporter. */
export interface DerivationStep {
  title: string;
  formula?: string;
  explanation: string;
  example: string;
  why: string;
}

export interface LearningCheckpoint {
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string[];
}

export interface ChapterGuide {
  chapterId: string;
  scenario: string;
  decisionQuestion: string;
  intuition: string;
  symbols: { symbol: string; name: string; meaning: string }[];
  steps: DerivationStep[];
  checkpoint: LearningCheckpoint;
  takeaway: string;
}
