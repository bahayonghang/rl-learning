import { formulationPages } from './formulation';
import { optimizationPages } from './optimization';
import { reinforcementPages } from './reinforcement';
import { outlookPages } from './outlook';
import type { ResearchPage } from './types';

export { reviewSources } from './sources';
export type { BiText, ResearchPage, ReviewSource } from './types';

export const researchPages: ResearchPage[] = [
  ...formulationPages,
  ...optimizationPages,
  ...reinforcementPages,
  ...outlookPages,
].sort((a, b) => a.order - b.order);
