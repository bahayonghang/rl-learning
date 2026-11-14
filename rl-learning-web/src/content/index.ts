import type { CourseModule } from '../types';
import { foundationChapters, foundationSources } from './foundations';
import { advancedChapters, advancedSources } from './advanced';
import { researchSources } from './research';

export const modules: CourseModule[] = [
  { id: 1, title: '交互、回报与探索', english: 'THE FIRST PRINCIPLES', description: '从一个选择开始，理解长期回报与探索的价值。', color: 'sage', icon: 'Compass', outcome: '把一个真实问题说清楚，并写出回报。' },
  { id: 2, title: 'MDP、价值与表格控制', english: 'THE MATHEMATICAL FOUNDATION', description: '用 Bellman 方程把未来的价值带回现在。', color: 'blue', icon: 'Network', outcome: '手算价值更新，实现一个表格控制算法。' },
  { id: 3, title: '从 Q 表到深度价值学习', english: 'LEARNING WITH NEURAL NETWORKS', description: '理解 DQN 的训练闭环，也理解它为什么会不稳定。', color: 'ochre', icon: 'BrainCircuit', outcome: '解释经验回放、目标网络与 Double DQN。' },
  { id: 4, title: '策略梯度、优势与 PPO', english: 'OPTIMIZING THE POLICY', description: '从 REINFORCE 出发，逐项拆开 PPO 的更新目标。', color: 'purple', icon: 'Route', outcome: '看懂概率比、GAE 与正负优势的裁剪。' },
  { id: 5, title: '连续动作与 SAC', english: 'DECISIONS IN CONTINUOUS SPACE', description: '从高斯策略到最大熵，理解连续决策的细节。', color: 'coral', icon: 'Waves', outcome: '算对动作变换，按任务特点选择算法。' },
  { id: 6, title: '独立建模与可信实验', english: 'FROM ALGORITHM TO EVIDENCE', description: '定义环境、建立基线，让每一条结论都有证据。', color: 'sage', icon: 'FlaskConical', outcome: '完成一份流程工业决策的模拟实验设计。' },
  { id: 7, title: '离线、模型与约束决策', english: 'BEYOND THE ONLINE SETTING', description: '在历史数据与模型中学习，识别边界与不确定性。', color: 'blue', icon: 'Telescope', outcome: '形成离线 RL、模型学习与安全约束研究路线。' },
];

export const chapters = [...foundationChapters, ...advancedChapters].sort((a, b) => a.number - b.number);
export const sources = [...new Map([...foundationSources, ...advancedSources, ...researchSources].map(s => [s.id, s])).values()];
export const getChapter = (id: string) => chapters.find(c => c.id === id);
export const getModule = (id: number) => modules.find(m => m.id === id)!;
export const moduleChapters = (id: number) => chapters.filter(c => c.module === id);
