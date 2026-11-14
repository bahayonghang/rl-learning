/**
 * Dimensioned but deliberately simplified kiln TEACHING simulator.
 * Project action/boundary conventions are retained; dynamics are invented for
 * explanatory experiments, not identified from a plant or suitable for control.
 */
import { clamp, seededRandom, normal, mean } from '../labs/math';

export type Vec3 = readonly [number, number, number];
export type Scenario = 'normal' | 'raw-meal' | 'low-oxygen' | 'ood' | 'no-apc';
export type ActionMode = 'manual' | 'hold' | 'feedback';
export const STEP_MINUTES = 5;
export const MAX_STEPS = 72;
export const RATE: Vec3 = [2, 5, 5];
export const SP_LOW: Vec3 = [860, 1000, -120];
export const SP_HIGH: Vec3 = [900, 1200, -40];
export const INITIAL_SP: Vec3 = [880, 1100, -80];
export const TRACKING: Vec3 = [.28, .18, .45];
export const MATERIAL_DELAY = 6;
export const LAB_INTERVAL = 12;
export const LAB_DELAY = 12;
export const OOD_MEAN: Vec3 = [880, 1100, -80];
export const OOD_SD: Vec3 = [5, 15, 10];
export const REWARD_REFERENCE = { coal: 134, coalScale: 4, electric: 25, electricScale: 1, coalWeight: .6, electricWeight: .4, smoothWeight: .05 } as const;
export const SCENARIOS: { id: Scenario; title: string; description: string }[] = [
  { id: 'normal', title: '稳定工况 · 先观察一次动作', description: '从 880°C / 1100°C / −80Pa 开始。先施加一次小增量，再保持，观察 PV、热惯性和化验分别何时变化。' },
  { id: 'raw-meal', title: '原料变化 · 观察迟滞与反馈', description: '第 30 分钟起，教学 KH 从 0.95 上移约 0.018。原料测量先变化，熟料质量经过物料与热过程后再变化，化验更晚发布。' },
  { id: 'low-oxygen', title: '低氧工况 · Gate 2', description: '初始 O₂ 为 1.05%，并有持续低氧扰动。门控会拒绝候选，但保持设定值不会瞬间消除已存在的异常。' },
  { id: 'ood', title: '分布外状态 · Gate 3', description: 'T₂ 初始为 1180°C，仍在展示的状态范围内，但偏离教学校准分布超过 4σ。后续自然回落时，门控结果可能改变。' },
  { id: 'no-apc', title: '无执行授权 · Gate 5', description: '观测正常但模拟 APC 授权关闭。算法可以提出建议，工作台始终采用零增量，设备代理仍按原设定值继续演化。' },
];

export interface Assay {
  sampleStep: number;
  releaseStep: number;
  value: number;
}
export interface RewardParts {
  coalZ: number;
  electricZ: number;
  energyTerm: number;
  actionSquare: number;
  changeSquare: number;
  smoothTerm: number;
  reward: number;
}
export interface ConstraintCosts { quality: number; oxygen: number; }
export interface GateResult {
  checks: ('pass' | 'fail' | 'pending')[];
  failed: number | null;
  reasons: string[];
  maxZ: number;
  actionChange: number;
  candidateSetpoints: Vec3;
  executed: Vec3;
}
export interface KilnObservation {
  step: number;
  minutes: number;
  pv: Vec3;
  setpoints: Vec3;
  coal: number;
  electric: number;
  oxygen: number;
  kh: number;
  softQuality: number;
  lab: Assay;
  labAgeMinutes: number;
  /** Existing SimpleKilnEnv order; lab age is in hours. No hidden truth. */
  vector: readonly [number, number, number, number, number, number, number, number, number, number, number, number, number];
}
export interface KilnPoint {
  step: number;
  minutes: number;
  pv: Vec3;
  setpoints: Vec3;
  coal: number;
  electric: number;
  oxygen: number;
  kh: number;
  softQuality: number;
  trueQuality: number;
  lab: Assay;
  reward: number;
  qualityCost: number;
  oxygenCost: number;
  executed: Vec3;
  gateFailed: number | null;
}
export interface TransitionExplanation {
  before: KilnObservation;
  proposed: Vec3;
  gate: GateResult;
  physicalIncrement: Vec3;
  trackingIncrement: Vec3;
  disturbances: Vec3;
  previousExecuted: Vec3;
  rewardParts: RewardParts;
  costs: ConstraintCosts;
  published: Assay[];
  sampled: Assay | null;
}
export interface KilnState {
  seed: number;
  scenario: Scenario;
  step: number;
  pv: Vec3;
  setpoints: Vec3;
  previousExecuted: Vec3;
  coal: number;
  electric: number;
  oxygen: number;
  kh: number;
  softQuality: number;
  /** Hidden simulator state: never supplied to the observation-policy interface. */
  thermal: number;
  trueQuality: number;
  materialQueue: { thermal: number; kh: number }[];
  latestAssay: Assay;
  pendingAssays: Assay[];
  publishedAssays: Assay[];
  history: KilnPoint[];
  lastTransition: TransitionExplanation | null;
  terminated: false;
  truncated: boolean;
}

const triple = (xs: readonly number[]): Vec3 => [xs[0]!, xs[1]!, xs[2]!];
const squareSum = (xs: readonly number[]) => xs.reduce((sum, x) => sum + x * x, 0);

/** Only observable inputs go into this illustrative soft sensor. It is not a trained network. */
export function softSensor(pv: Vec3, kh: number, step: number): number {
  return clamp(1.10 - .025 * (pv[0] - 880) - .002 * (pv[1] - 1100) + 14 * (kh - .95) + .02 * Math.sin(step / 5), .2, 2.5);
}
export function rewardDecomposition(coal: number, electric: number, action: Vec3, previous: Vec3): RewardParts {
  const coalZ = (coal - REWARD_REFERENCE.coal) / REWARD_REFERENCE.coalScale;
  const electricZ = (electric - REWARD_REFERENCE.electric) / REWARD_REFERENCE.electricScale;
  const actionSquare = squareSum(action);
  const changeSquare = squareSum(action.map((v, i) => v - previous[i]!));
  const energyTerm = -REWARD_REFERENCE.coalWeight * coalZ - REWARD_REFERENCE.electricWeight * electricZ;
  const smoothTerm = -REWARD_REFERENCE.smoothWeight * (actionSquare + changeSquare);
  return { coalZ, electricZ, energyTerm, actionSquare, changeSquare, smoothTerm, reward: energyTerm + smoothTerm };
}
export function constraintCosts(quality: number, oxygen: number): ConstraintCosts {
  return { quality: Math.max(0, .5 - quality) + Math.max(0, quality - 1.5), oxygen: Math.max(0, 1.2 - oxygen) };
}
export function observeKiln(state: KilnState): KilnObservation {
  const labAgeMinutes = (state.step - state.latestAssay.sampleStep) * STEP_MINUTES;
  return {
    step: state.step, minutes: state.step * STEP_MINUTES, pv: [...state.pv] as Vec3, setpoints: [...state.setpoints] as Vec3,
    coal: state.coal, electric: state.electric, oxygen: state.oxygen, kh: state.kh, softQuality: state.softQuality,
    lab: { ...state.latestAssay }, labAgeMinutes,
    vector: [state.pv[0], state.pv[1], state.pv[2], state.setpoints[0], state.setpoints[1], state.setpoints[2], state.coal, state.electric, state.oxygen, state.kh, state.latestAssay.value, labAgeMinutes / 60, state.softQuality],
  };
}
function toPoint(state: KilnState, reward = 0, costs: ConstraintCosts = constraintCosts(state.trueQuality, state.oxygen), executed: Vec3 = [0, 0, 0], gateFailed: number | null = null): KilnPoint {
  return {
    step: state.step, minutes: state.step * STEP_MINUTES, pv: [...state.pv] as Vec3, setpoints: [...state.setpoints] as Vec3,
    coal: state.coal, electric: state.electric, oxygen: state.oxygen, kh: state.kh, softQuality: state.softQuality,
    trueQuality: state.trueQuality, lab: { ...state.latestAssay }, reward, qualityCost: costs.quality, oxygenCost: costs.oxygen, executed, gateFailed,
  };
}
export function createKiln(seed = 42, scenario: Scenario = 'normal'): KilnState {
  if (!Number.isInteger(seed) || seed < 0 || seed > 999999) throw new RangeError('seed must be an integer from 0 to 999999');
  if (!SCENARIOS.some(item => item.id === scenario)) throw new RangeError('Unknown teaching scenario');
  const pv: Vec3 = scenario === 'ood' ? [895, 1180, -80] : [...INITIAL_SP] as Vec3;
  const initialLab: Assay = { sampleStep: -12, releaseStep: 0, value: 1.10 };
  const state: KilnState = {
    seed, scenario, step: 0, pv, setpoints: [...INITIAL_SP] as Vec3, previousExecuted: [0, 0, 0],
    coal: 134, electric: 25, oxygen: scenario === 'low-oxygen' ? 1.05 : 1.65, kh: .95,
    softQuality: softSensor(pv, .95, 0), thermal: 880, trueQuality: 1.10,
    materialQueue: Array.from({ length: MATERIAL_DELAY }, () => ({ thermal: 880, kh: .95 })),
    latestAssay: initialLab, pendingAssays: [{ sampleStep: 0, releaseStep: LAB_DELAY, value: 1.10 }], publishedAssays: [initialLab],
    history: [], lastTransition: null, terminated: false, truncated: false,
  };
  state.history = [toPoint(state)];
  return state;
}

export function checkKilnGates(state: KilnState, proposed: Vec3): GateResult {
  const obs = observeKiln(state);
  const candidateSetpoints = triple(state.setpoints.map((sp, i) => sp + RATE[i]! * proposed[i]!));
  const maxZ = Math.max(...state.pv.map((x, i) => Math.abs((x - OOD_MEAN[i]!) / OOD_SD[i]!)));
  const actionChange = Math.max(...proposed.map((x, i) => Math.abs(x - state.previousExecuted[i]!)));
  const tests = [
    proposed.length === 3 && [...obs.vector, ...proposed].every(Number.isFinite),
    state.oxygen >= 1.2 && state.pv.every((x, i) => x >= SP_LOW[i]! - 20 && x <= SP_HIGH[i]! + 20),
    maxZ <= 4,
    proposed.every(x => Math.abs(x) <= 1) && actionChange <= 1.5,
    state.scenario !== 'no-apc' && candidateSetpoints.every((sp, i) => sp >= SP_LOW[i]! && sp <= SP_HIGH[i]!),
  ];
  const failedIndex = tests.indexOf(false);
  return {
    checks: tests.map((pass, i) => failedIndex >= 0 && i > failedIndex ? 'pending' : pass ? 'pass' : 'fail'),
    failed: failedIndex >= 0 ? failedIndex + 1 : null,
    reasons: [
      '要求 13 维观测与 3 维候选均为有限数值',
      `O₂ ≥ 1.2%；PV 在展示的核心状态范围内`,
      `三维 PV 子空间 max |z| = ${maxZ.toFixed(2)}，要求 ≤ 4.0`,
      `max |a − 上次实际 a| = ${actionChange.toFixed(2)}，要求 ≤ 1.5 且 a∈[−1,1]`,
      state.scenario === 'no-apc' ? '模拟 APC 授权关闭' : 'APC 已授权，候选 SP 必须逐维位于项目范围',
    ],
    maxZ, actionChange, candidateSetpoints, executed: failedIndex < 0 ? [...proposed] as Vec3 : [0, 0, 0],
  };
}

/** Heuristic only. Its input type deliberately excludes hidden quality and thermal state. */
export function conservativeFeedback(obs: KilnObservation): Vec3 {
  return [
    clamp(2 * (obs.softQuality - 1.15), -.2, .35),
    clamp(.2 * (1100 - obs.setpoints[1]) / RATE[1], -.25, .25),
    clamp(.2 * (-80 - obs.setpoints[2]) / RATE[2], -.25, .25),
  ];
}
export function actionForMode(state: KilnState, mode: ActionMode, manual: Vec3): Vec3 {
  if (mode === 'hold') return [0, 0, 0];
  if (mode === 'feedback') return conservativeFeedback(observeKiln(state));
  return [...manual] as Vec3;
}

/** Pure state transition; random disturbances are indexed by seed and time, not by action. */
export function stepKiln(state: KilnState, proposed: Vec3): KilnState {
  if (state.truncated || state.step >= MAX_STEPS) throw new RangeError('Teaching horizon reached; reset before stepping again');
  const gate = checkKilnGates(state, proposed);
  const before = observeKiln(state);
  const action = gate.executed;
  const physicalIncrement = triple(action.map((x, i) => RATE[i]! * x));
  const setpoints = triple(state.setpoints.map((x, i) => x + physicalIncrement[i]!));
  const step = state.step + 1;
  const rng = seededRandom((state.seed + Math.imul(step, 104729)) >>> 0);
  const disturbances: Vec3 = [.12 * normal(rng), .3 * normal(rng), .15 * normal(rng)];
  const trackingIncrement = triple(state.pv.map((x, i) => TRACKING[i]! * (setpoints[i]! - x)));
  const pv = triple(state.pv.map((x, i) => x + trackingIncrement[i]! + disturbances[i]!));
  const kh = .95 + (state.scenario === 'raw-meal' && step >= 6 ? .018 : 0) + .0015 * Math.sin(step / 4) + .0004 * normal(rng);
  const thermal = .88 * state.thermal + .12 * (pv[0] + .08 * (pv[1] - 1100));
  const delayedMaterial = state.materialQueue[0]!;
  const targetQuality = 1.10 - .035 * (delayedMaterial.thermal - 880) + 12 * (delayedMaterial.kh - .95);
  const trueQuality = clamp(.75 * state.trueQuality + .25 * targetQuality + .008 * normal(rng), .1, 3);
  const oxygenTarget = 1.65 - .008 * (pv[0] - 880) - .009 * (pv[2] + 80) - (state.scenario === 'low-oxygen' ? .75 : 0);
  const oxygen = clamp(.7 * state.oxygen + .3 * oxygenTarget + .012 * normal(rng), .4, 4);
  const coal = 134 + .18 * (pv[0] - 880) - .025 * (pv[1] - 1100) + 20 * (kh - .95) + .12 * normal(rng);
  const electric = 25 + .009 * (pv[1] - 1100) + .020 * (-pv[2] - 80) + .025 * normal(rng);
  const softQuality = softSensor(pv, kh, step);
  const sampled: Assay | null = step % LAB_INTERVAL === 0 ? { sampleStep: step, releaseStep: step + LAB_DELAY, value: trueQuality + .005 * normal(rng) } : null;
  const pending = sampled ? [...state.pendingAssays, sampled] : [...state.pendingAssays];
  const published = pending.filter(lab => lab.releaseStep <= step);
  const latestAssay = published.length ? published.at(-1)! : state.latestAssay;
  const parts = rewardDecomposition(coal, electric, action, state.previousExecuted);
  const costs = constraintCosts(trueQuality, oxygen);
  const result: KilnState = {
    ...state, step, pv, setpoints, previousExecuted: [...action] as Vec3, coal, electric, oxygen, kh, softQuality, thermal, trueQuality,
    materialQueue: [...state.materialQueue.slice(1), { thermal, kh }], latestAssay: { ...latestAssay },
    pendingAssays: pending.filter(lab => lab.releaseStep > step), publishedAssays: [...state.publishedAssays, ...published],
    terminated: false, truncated: step >= MAX_STEPS,
    lastTransition: { before, proposed: [...proposed] as Vec3, gate, physicalIncrement, trackingIncrement, disturbances, previousExecuted: [...state.previousExecuted] as Vec3, rewardParts: parts, costs, published, sampled },
  };
  result.history = [...state.history, toPoint(result, parts.reward, costs, [...action] as Vec3, gate.failed)];
  return result;
}

export function advanceKiln(state: KilnState, count: number, mode: ActionMode, manual: Vec3): KilnState {
  if (!Number.isInteger(count) || count < 0) throw new RangeError('count must be a nonnegative integer');
  let next = state;
  const allowed = Math.min(count, MAX_STEPS - state.step);
  for (let i = 0; i < allowed; i++) next = stepKiln(next, actionForMode(next, mode, manual));
  return next;
}
export interface BranchComparison {
  mode: ActionMode;
  title: string;
  fromStep: number;
  points: KilnPoint[];
  meanCoal: number;
  meanElectric: number;
  totalReward: number;
  qualityCost: number;
  oxygenCost: number;
  blocked: number;
  state: KilnState;
}
export function compareKilnBranches(state: KilnState, count: number, manual: Vec3): BranchComparison[] {
  const titles: Record<ActionMode, string> = { hold: '保持当前设定值', feedback: '保守反馈规则', manual: '当前手动增量（重复）' };
  return (['hold', 'feedback', 'manual'] as ActionMode[]).map(mode => {
    const final = advanceKiln(state, count, mode, manual);
    const points = final.history.slice(state.step + 1);
    return { mode, title: titles[mode], fromStep: state.step, points, meanCoal: mean(points.map(p => p.coal)), meanElectric: mean(points.map(p => p.electric)), totalReward: points.reduce((sum, p) => sum + p.reward, 0), qualityCost: points.reduce((sum, p) => sum + p.qualityCost, 0), oxygenCost: points.reduce((sum, p) => sum + p.oxygenCost, 0), blocked: points.filter(p => p.gateFailed !== null).length, state: final };
  });
}
