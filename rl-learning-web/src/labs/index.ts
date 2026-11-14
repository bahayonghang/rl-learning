import type { LabDefinition } from '../types';
import { getLocale } from '../i18n';
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

/** Stable IDs and numerical renderers; metadata is selected at render time. */
const englishMetadata: Readonly<Record<string, readonly [string, string]>> = {
  return: ['Return and Probability', 'Calculate discounting and expectations'],
  bandit: ['Multi-Armed Bandits', 'Exploration, exploitation, and cumulative pseudo-regret'],
  bellman: ['Bellman Backups', 'Propagate future value into the present'],
  gridworld: ['Gridworld', 'Watch values propagate through value iteration'],
  td: ['MC, TD, and n-Step Returns', 'Different targets from the same trajectory'],
  cliff: ['SARSA and Q-Learning', 'Train two cliff-walking policies'],
  replay: ['Replay and Target Networks', 'Separate sample reuse from delayed targets'],
  overestimation: ['Maximization Bias', 'Test double estimation with Monte Carlo samples'],
  'policy-gradient': ['Policy Gradients', 'How rewards change action probabilities'],
  gae: ['Generalized Advantage Estimation', 'Expand gamma, lambda, and boundary masks'],
  ppo: ['PPO-Clip Workbench', 'Clipped objectives for signed advantages'],
  gaussian: ['Continuous Policies and Entropy', 'Gaussians, tanh, and correct log densities'],
  seeds: ['Multiple-Seed Experiments', 'Distinguish attractive curves from credible evidence'],
  safety: ['Industrial Gate Simulation', 'Candidate increments, constraint costs, and fallback'],
};
export function getLabs(): LabDefinition[] {
  return getLocale() === 'en' ? labs.map(lab => ({ ...lab, title: englishMetadata[lab.id]![0], subtitle: englishMetadata[lab.id]![1] })) : labs;
}

export const labAliases: Readonly<Record<string, string>> = { expectation: 'return', sac: 'gaussian' };
export function findLab(id: string): LabDefinition | undefined {
  return getLabs().find(lab => lab.id === (labAliases[id] ?? id));
}
