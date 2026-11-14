import type { LabDefinition } from '../types';
import { renderReturn, renderBandit, renderBellman, renderGridworld, renderTD, renderCliff } from './foundations';
import { renderReplay, renderOverestimation, renderPolicyGradient, renderGAE, renderPPO, renderGaussian } from './deep';
import { renderSeeds, renderSafety } from './applied';
import './labs.css';

export const labs: LabDefinition[] = [
  { id: 'return', number: 1, title: '回报与概率直觉', subtitle: '把折扣和期望变成可计算的数', chapter: '01', icon: 'Timer', render: renderReturn },
  { id: 'bandit', number: 2, title: '多臂老虎机', subtitle: '探索、利用与累计伪遗憾', chapter: '02', icon: 'SlidersHorizontal', render: renderBandit },
  { id: 'bellman', number: 3, title: 'Bellman 备份', subtitle: '从未来估计推回当前价值', chapter: '05', icon: 'GitBranch', render: renderBellman },
  { id: 'gridworld', number: 4, title: '网格世界', subtitle: '亲手观察价值迭代的传播过程', chapter: '06', icon: 'Grid3X3', render: renderGridworld },
  { id: 'td', number: 5, title: 'MC、TD 与 n-step', subtitle: '同一轨迹，不同的学习目标', chapter: '07', icon: 'Layers', render: renderTD },
  { id: 'cliff', number: 6, title: 'SARSA 与 Q-learning', subtitle: '训练两种悬崖行走策略', chapter: '08', icon: 'Route', render: renderCliff },
  { id: 'replay', number: 7, title: '回放与目标网络', subtitle: '分别理解抽样复用和目标滞后', chapter: '10', icon: 'Database', render: renderReplay },
  { id: 'overestimation', number: 8, title: '最大化偏差', subtitle: '用 Monte Carlo 检验 Double 思路', chapter: '11', icon: 'TrendingUp', render: renderOverestimation },
  { id: 'policy-gradient', number: 9, title: '策略梯度', subtitle: '奖励如何改变动作概率', chapter: '12', icon: 'Workflow', render: renderPolicyGradient },
  { id: 'gae', number: 10, title: 'GAE 优势估计', subtitle: '逐项展开 γ、λ 和边界遮罩', chapter: '13', icon: 'Waves', render: renderGAE },
  { id: 'ppo', number: 11, title: 'PPO-Clip 实验台', subtitle: '正负优势下的裁剪目标', chapter: '15', icon: 'Scissors', render: renderPPO },
  { id: 'gaussian', number: 12, title: '连续策略与最大熵', subtitle: '高斯、tanh 与正确的 log 概率', chapter: '16', icon: 'Activity', render: renderGaussian },
  { id: 'seeds', number: 13, title: '多种子实验', subtitle: '区分漂亮曲线与可信证据', chapter: '20', icon: 'ChartNoAxesCombined', render: renderSeeds },
  { id: 'safety', number: 14, title: '工业安全门推演', subtitle: '候选增量、约束成本与回退', chapter: '21', icon: 'ShieldCheck', render: renderSafety },
];

export const labAliases: Readonly<Record<string, string>> = { expectation: 'return', sac: 'gaussian' };
export function findLab(id: string): LabDefinition | undefined {
  return labs.find(lab => lab.id === (labAliases[id] ?? id));
}
