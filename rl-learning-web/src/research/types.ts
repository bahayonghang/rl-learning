import type { Source } from '../types';

export type BiText = { 'zh-CN': string; en: string };

export interface ResearchPage {
  id: string;
  order: number;
  group: 'formulation' | 'optimization' | 'reinforcement' | 'outlook';
  title: BiText;
  summary: BiText;
  minutes: number;
  body: BiText;
  sources: string[];
  figure?: 'operations-stack' | 'evolution-search' | 'safe-agent' | 'world-model';
}

export interface ReviewSource extends Source {
  noteEn: string;
  topic: 'process' | 'optimization' | 'reinforcement' | 'safety' | 'evaluation';
  evidence: 'theory' | 'review' | 'simulation' | 'deployment' | 'documentation';
  venue: string;
  keywords: string[];
}
