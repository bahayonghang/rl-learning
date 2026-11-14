/** Numerical kernels for the browser teaching experiments. No production control. */
export type RNG = () => number;
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
export const mean = (xs: number[]): number => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
export const standardDeviation = (xs: number[]): number => xs.length < 2 ? 0 : Math.sqrt(xs.reduce((s, x) => s + (x - mean(xs)) ** 2, 0) / (xs.length - 1));

export function seededRandom(seed: number): RNG {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal(rng: RNG): number {
  return Math.sqrt(-2 * Math.log(Math.max(1e-12, rng()))) * Math.cos(2 * Math.PI * rng());
}

export function discountedReturns(rewards: number[], gamma: number, bootstrap = 0): number[] {
  const result = new Array<number>(rewards.length);
  let next = bootstrap;
  for (let t = rewards.length - 1; t >= 0; t--) {
    next = rewards[t]! + gamma * next;
    result[t] = next;
  }
  return result;
}

export function tdTarget(reward: number, gamma: number, nextValue: number, terminated: boolean): number {
  return reward + gamma * (terminated ? 0 : nextValue);
}

export function nStepTarget(rewards: number[], values: number[], t: number, n: number, gamma: number, terminal = true): number {
  const end = Math.min(t + n, rewards.length);
  let value = 0;
  for (let k = t; k < end; k++) value += gamma ** (k - t) * rewards[k]!;
  if (end < rewards.length || !terminal) value += gamma ** (end - t) * values[end]!;
  return value;
}

export function generalizedAdvantage(rewards: number[], values: number[], gamma: number, lambda: number, terminated: boolean[], episodeEnds = terminated): number[] {
  const advantages = new Array<number>(rewards.length).fill(0);
  let next = 0;
  for (let t = rewards.length - 1; t >= 0; t--) {
    const delta = tdTarget(rewards[t]!, gamma, values[t + 1]!, terminated[t]!) - values[t]!;
    next = delta + gamma * lambda * (episodeEnds[t] ? 0 : next);
    advantages[t] = next;
  }
  return advantages;
}

export function ppoObjective(ratio: number, advantage: number, epsilon: number): number {
  return Math.min(ratio * advantage, clamp(ratio, 1 - epsilon, 1 + epsilon) * advantage);
}

export function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const exp = logits.map(x => Math.exp(x - m));
  const z = exp.reduce((a, b) => a + b, 0);
  return exp.map(x => x / z);
}

export function reinforceUpdate(logits: number[], action: number, advantage: number, alpha: number): number[] {
  const probabilities = softmax(logits);
  return logits.map((v, i) => v + alpha * advantage * ((i === action ? 1 : 0) - probabilities[i]!));
}

export function sampleCategorical(probabilities: number[], rng: RNG): number {
  let u = rng();
  for (let i = 0; i < probabilities.length; i++) {
    u -= probabilities[i]!;
    if (u <= 0) return i;
  }
  return probabilities.length - 1;
}

export function randomArgmax(values: number[], rng: RNG): number {
  const max = Math.max(...values);
  const candidates = values.map((v, i) => v === max ? i : -1).filter(i => i >= 0);
  return candidates[Math.floor(rng() * candidates.length)]!;
}

export interface BanditResult { counts: number[]; estimates: number[]; reward: number; regret: number[]; choices: number[]; }
export function runBandit(steps: number, seed: number, epsilon: number, strategy: 'epsilon' | 'ucb' = 'epsilon', means = [0.25, 0.45, 0.65, 0.55]): BanditResult {
  const rng = seededRandom(seed);
  const counts = means.map(() => 0);
  const estimates = means.map(() => 0);
  const regret: number[] = [];
  const choices: number[] = [];
  let cumulativeReward = 0;
  let cumulativeRegret = 0;
  for (let t = 0; t < steps; t++) {
    let action: number;
    if (strategy === 'ucb') {
      const unseen = counts.indexOf(0);
      action = unseen >= 0 ? unseen : randomArgmax(estimates.map((q, a) => q + Math.sqrt(2 * Math.log(t + 1) / counts[a]!)), rng);
    } else {
      action = rng() < epsilon ? Math.floor(rng() * means.length) : randomArgmax(estimates, rng);
    }
    const reward = rng() < means[action]! ? 1 : 0;
    counts[action] = counts[action]! + 1;
    estimates[action] = estimates[action]! + (reward - estimates[action]!) / counts[action]!;
    cumulativeReward += reward;
    cumulativeRegret += Math.max(...means) - means[action]!;
    regret.push(cumulativeRegret);
    choices.push(action);
  }
  return { counts, estimates, reward: cumulativeReward, regret, choices };
}

export const GRID_SIDE = 4;
export const GRID_WALL = 5;
export const GRID_GOAL = 15;
const MOVES = [[-1, 0], [0, 1], [1, 0], [0, -1]] as const;
export function gridTransition(state: number, action: number): { next: number; reward: number; terminated: boolean } {
  if (state === GRID_GOAL) return { next: state, reward: 0, terminated: true };
  const row = Math.floor(state / GRID_SIDE);
  const col = state % GRID_SIDE;
  const [dr, dc] = MOVES[action]!;
  const r = clamp(row + dr, 0, GRID_SIDE - 1);
  const c = clamp(col + dc, 0, GRID_SIDE - 1);
  const candidate = r * GRID_SIDE + c;
  const next = candidate === GRID_WALL ? state : candidate;
  return { next, reward: next === GRID_GOAL ? 10 : -1, terminated: next === GRID_GOAL };
}
export function gridSweep(values: number[], gamma: number): number[] {
  return values.map((_, s) => {
    if (s === GRID_WALL || s === GRID_GOAL) return 0;
    return Math.max(...MOVES.map((__, a) => {
      const tr = gridTransition(s, a);
      return tdTarget(tr.reward, gamma, values[tr.next]!, tr.terminated);
    }));
  });
}
export function gridBestAction(values: number[], state: number, gamma: number): number {
  const qs = MOVES.map((_, a) => {
    const tr = gridTransition(state, a);
    return tdTarget(tr.reward, gamma, values[tr.next]!, tr.terminated);
  });
  return qs.indexOf(Math.max(...qs));
}

export interface CliffResult { returns: number[]; falls: number; path: number[]; reachedGoal: boolean; }
export function trainCliff(algorithm: 'sarsa' | 'q', episodes: number, seed: number, epsilon = 0.1): CliffResult {
  const rng = seededRandom(seed);
  const q = Array.from({ length: 48 }, () => [0, 0, 0, 0]);
  const choose = (s: number) => rng() < epsilon ? Math.floor(rng() * 4) : randomArgmax(q[s]!, rng);
  const step = (s: number, a: number) => {
    const [dr, dc] = MOVES[a]!;
    const r = clamp(Math.floor(s / 12) + dr, 0, 3);
    const c = clamp(s % 12 + dc, 0, 11);
    const next = r * 12 + c;
    const fall = next > 36 && next < 47;
    return { next: fall ? 36 : next, reward: fall ? -100 : -1, terminal: next === 47, fall };
  };
  const returns: number[] = [];
  let falls = 0;
  for (let episode = 0; episode < episodes; episode++) {
    let state = 36;
    let action = choose(state);
    let total = 0;
    for (let t = 0; t < 600; t++) {
      const tr = step(state, action);
      const nextAction = choose(tr.next);
      const bootstrap = algorithm === 'sarsa' ? q[tr.next]![nextAction]! : Math.max(...q[tr.next]!);
      const target = tdTarget(tr.reward, 1, bootstrap, tr.terminal);
      q[state]![action] = q[state]![action]! + 0.5 * (target - q[state]![action]!);
      total += tr.reward;
      falls += Number(tr.fall);
      state = tr.next;
      action = nextAction;
      if (tr.terminal) break;
    }
    returns.push(total);
  }
  const path = [36];
  let s = 36;
  for (let t = 0; t < 50 && s !== 47; t++) {
    const a = q[s]!.indexOf(Math.max(...q[s]!));
    s = step(s, a).next;
    path.push(s);
    if (path.slice(0, -1).includes(s)) break;
  }
  return { returns, falls, path, reachedGoal: s === 47 };
}

export function squashedLogProbability(u: number, mu: number, sigma: number): number {
  const logNormal = -0.5 * ((u - mu) / sigma) ** 2 - Math.log(sigma) - 0.5 * Math.log(2 * Math.PI);
  // log(1-tanh(u)^2) = 2(log(2)-u-softplus(-2u)), stable at large |u|.
  const softplus = (x: number) => Math.max(x, 0) + Math.log1p(Math.exp(-Math.abs(x)));
  const logJacobian = 2 * (Math.log(2) - u - softplus(-2 * u));
  return logNormal - logJacobian;
}

export function bootstrapMeanInterval(values: number[], seed: number, replicates = 1000): [number, number] {
  const rng = seededRandom(seed);
  const estimates = Array.from({ length: replicates }, () => {
    let sum = 0;
    for (let j = 0; j < values.length; j++) sum += values[Math.floor(rng() * values.length)]!;
    return sum / values.length;
  }).sort((a, b) => a - b);
  return [estimates[Math.floor(0.025 * replicates)]!, estimates[Math.min(replicates - 1, Math.floor(0.975 * replicates))]!];
}

export interface SafetyInput { dataValid: boolean; stateValid: boolean; oxygen: number; z: number; action: number; previousAction: number; setpoint: number; apc: boolean; }
export interface SafetyResult { gates: ('pass' | 'fail' | 'pending')[]; output: number; candidate: number; failedGate: number | null; }
export function evaluateSafety(input: SafetyInput): SafetyResult {
  const finite = [input.oxygen, input.z, input.action, input.previousAction, input.setpoint].every(Number.isFinite);
  const candidate = input.setpoint + 0.05 * input.action;
  const checks = [
    input.dataValid && finite,
    input.stateValid && input.oxygen >= 1.2,
    input.z <= 4,
    Math.abs(input.action - input.previousAction) <= 1.5 && Math.abs(input.action) <= 1,
    input.apc && candidate >= 0 && candidate <= 1,
  ];
  const failed = checks.indexOf(false);
  return {
    gates: checks.map((ok, i) => failed >= 0 && i > failed ? 'pending' : ok ? 'pass' : 'fail'),
    output: failed >= 0 ? 0 : input.action,
    candidate,
    failedGate: failed >= 0 ? failed + 1 : null,
  };
}
