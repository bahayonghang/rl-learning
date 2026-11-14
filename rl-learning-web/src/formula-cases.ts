/** Authored bilingual worked cases. The same calculations serve the web and exports. */
import { getLocale, type Locale, type Localized } from './i18n';
import { bellmanCase, cqlCase, energyCase, gaeCase, lagrangianCase, ppoCase, returnCase, sacCase, setpointCase, tdCase, type TDMethod } from './formula-case-math';
import { RATE, REWARD_REFERENCE, TRACKING } from './kiln/math';

export const formulaCaseIds = ['return-bootstrap', 'bellman-expectation', 'td-update', 'gae', 'ppo-clip', 'sac-target', 'cql-regularizer', 'setpoint-response', 'energy-reward', 'constraint-lagrangian'] as const;
export type FormulaCaseId = typeof formulaCaseIds[number];
export type FormulaValues = Record<string, number>;
type Bi = Localized<string>;
export interface FormulaField {
  key: string; label: Bi; symbol: string; value: number; min: number; max: number;
  step: number; unit: Bi; help: Bi; options?: { value: number; label: Bi }[];
}
export interface FormulaPreset { id: string; title: Bi; description: Bi; values: FormulaValues; }
export interface FormulaSource { title: string; url: string; }
export interface FormulaStep { title: string; equation: string; explanation: string; }
export interface FormulaMetric { label: string; value: number | string; unit?: string; warning?: boolean; }
export interface FormulaPresentation {
  metrics: FormulaMetric[]; steps: FormulaStep[]; interpretation: string[];
  table?: { caption: string; headers: string[]; rows: (string | number)[][] };
}
export interface FormulaCaseDefinition {
  id: FormulaCaseId; topic: Bi; title: Bi; description: Bi; scenario: Bi;
  chapterIds: string[]; researchIds: string[]; tags: string[];
  fields: FormulaField[]; presets: FormulaPreset[]; formulas: string[]; sources: FormulaSource[];
  present: (values: FormulaValues, locale: Locale) => FormulaPresentation;
}
const b = (zh: string, en: string): Bi => ({ 'zh-CN': zh, en });
const tr = (locale: Locale) => (zh: string, en: string) => locale === 'zh-CN' ? zh : en;
export const formatFormulaNumber = (value: number): string => {
  if (!Number.isFinite(value)) throw new RangeError('Non-finite result.');
  if (Object.is(value, -0) || value === 0) return '0';
  if (Math.abs(value) < .000001 || Math.abs(value) >= 1e8) return value.toExponential(5);
  return Number(value.toFixed(6)).toString();
};
const n = (value: number) => {
  const text = formatFormulaNumber(value);
  // Treat scientific notation as one factor, including when a caller adds a power.
  // Without parentheses, 1e-7 followed by ^2 becomes an invalid double superscript.
  return /e[+-]?\d+$/.test(text)
    ? String.raw`\left(${text.replace(/e([+-]?\d+)$/, (_, exponent: string) => String.raw`\times10^{${Number(exponent)}}`)}\right)`
    : text;
};
const f = (key: string, label: Bi, symbol: string, value: number, min = -10000, max = 10000, help: Bi = b('可直接输入数值。', 'Enter a numerical value.'), unit: Bi = b('无量纲', 'dimensionless'), step = .01): FormulaField => ({ key, label, symbol, value, min, max, step, help, unit });
const select = (key: string, label: Bi, value: number, options: { value: number; label: Bi }[], help: Bi): FormulaField => ({ key, label, value, options, symbol: '', min: Math.min(...options.map(o => o.value)), max: Math.max(...options.map(o => o.value)), step: 1, unit: b('', ''), help });
const preset = (id: string, title: Bi, description: Bi, values: FormulaValues): FormulaPreset => ({ id, title, description, values });
const endField = () => select('terminal', b('片段结束的原因', 'Why does the segment end?'), 0, [{ value: 0, label: b('外部时间截断：保留尾部价值', 'External cutoff: keep tail value') }, { value: 1, label: b('真正任务终止：尾部价值为零', 'True termination: zero tail value') }], b('有限时域任务本身的终点也是真正终止；这里的“截断”专指任务外部的采样上限。', 'An intrinsic finite-horizon endpoint is also termination; cutoff here means an external collection limit.'));
const gammaField = (value = .9) => f('gamma', b('折扣因子', 'Discount factor'), '\\gamma', value, 0, 1, b('有限片段允许 γ=1；本例不据此声称无穷回报收敛。', 'A finite segment permits γ=1; this does not establish convergence of an infinite return.'));
const book: FormulaSource = { title: 'Sutton & Barto · Reinforcement Learning: An Introduction (2nd ed.), Chapters 3, 6, 7', url: 'https://incompleteideas.net/book/the-book-2nd.html' };
const timeLimits: FormulaSource = { title: 'Gymnasium · Handling Time Limits', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/' };
const kilnSource: FormulaSource = { title: 'RL Atlas · Teaching kiln model and its assumptions', url: 'https://github.com/bahayonghang/rl-learning/blob/main/rl-learning-web/docs/kiln-workbench.en.md' };
const basic = b('回报与价值', 'Returns & values'), policy = b('策略与价值学习', 'Policy & value learning'), industrial = b('运行指标决策', 'Operational decisions');

export const formulaCases: readonly FormulaCaseDefinition[] = [
  {
    id: 'return-bootstrap', topic: basic,
    title: b('三步回报：截断后还值多少？', 'Three-step return: what remains after a cutoff?'),
    description: b('逐项折扣三次奖励，再比较真正终止与时间截断时的尾部价值。', 'Discount three rewards and compare tail value at true termination versus a time cutoff.'),
    scenario: b('一次教学推演记录了三个 5 分钟决策步，奖励为 −1、2、3，末状态估值为 4。先预测：结束记录是否意味着未来价值消失？奖励均为示例单位。', 'A teaching rollout records three five-minute decisions with rewards −1, 2 and 3; the final state is valued at 4. Predict whether stopping collection erases future value. Rewards use example units.'),
    chapterIds: ['01', '02', '04', '07', '19'], researchIds: ['sequential'], tags: ['return', 'bootstrap', 'n-step', '回报', '自举', '截断'],
    fields: [f('r1', b('第一步奖励', 'First reward'), 'R_1', -1), f('r2', b('第二步奖励', 'Second reward'), 'R_2', 2), f('r3', b('第三步奖励', 'Third reward'), 'R_3', 3), gammaField(), f('tail', b('末状态价值估计', 'Final-state value estimate'), 'V(S_3)', 4), endField()],
    presets: [preset('cutoff', b('继续运行，只停止记录', 'Continuing task; collection stops'), b('三步之后仍有未来价值。', 'Value remains beyond the three observed steps.'), {}), preset('terminal', b('真正结束任务', 'The task truly terminates'), b('使用相同奖励，去掉自举项。', 'Keep the rewards but remove the bootstrap term.'), { terminal: 1 }), preset('myopic', b('只看眼前', 'Immediate reward only'), b('把 γ 设为 0，观察后两步的权重。', 'Set γ to zero and inspect the later weights.'), { gamma: 0 })],
    formulas: [String.raw`G_0^{(3)}=R_1+\gamma R_2+\gamma^2R_3+\gamma^3(1-d)V(S_3)`], sources: [book, timeLimits],
    present(v, locale) { const t = tr(locale), r = returnCase([v.r1, v.r2, v.r3], v.gamma, v.tail, v.terminal === 1); return {
      metrics: [{ label: t('已观察奖励的折扣和', 'Observed discounted rewards'), value: r.observed }, { label: t('尾部价值贡献', 'Tail contribution'), value: r.tail }, { label: t('三步目标', 'Three-step target'), value: r.target }],
      steps: [
        { title: t('先给奖励加权', 'Weight the observed rewards'), equation: String.raw`${n(v.r1)}+${n(v.gamma)}\cdot(${n(v.r2)})+${n(v.gamma)}^2\cdot(${n(v.r3)})\approx ${n(r.observed)}`, explanation: t('第一条奖励的指数为 0，第三条奖励的指数为 2。', 'The first reward has exponent 0; the third has exponent 2.') },
        { title: t('单独计算尾部', 'Compute the tail separately'), equation: String.raw`${n(v.gamma)}^3(1-${v.terminal})\cdot(${n(v.tail)})\approx ${n(r.tail)}`, explanation: t('尾部价值从第三步之后开始，所以系数是 γ³。', 'The tail begins after the third step, so its coefficient is γ³.') },
        { title: t('合并得到学习目标', 'Combine the learning target'), equation: String.raw`G_0^{(3)}\approx ${n(r.observed)}+(${n(r.tail)})\approx ${n(r.target)}`, explanation: t('计算使用完整精度；显示值最多保留六位小数。', 'Calculations retain full precision; displayed values have up to six decimal places.') },
      ], interpretation: [v.terminal === 1 ? t('真正终止使尾部贡献为零；修改末状态估值不会改变本次目标。', 'True termination removes the tail; changing its estimated value leaves this target unchanged.') : t('时间截断只结束采样，保留末状态自举。它仍是估计量，依赖末状态价值的可信度。', 'A collection cutoff retains the final-state bootstrap. This remains an estimate and depends on the value estimate.'), t('这是一段轨迹的目标，不是对策略长期绩效的独立估计。', 'This is one trajectory target, not independent evidence of long-term policy performance.')],
      table: { caption: t('每一项对目标的贡献', 'Contribution of each term'), headers: [t('项', 'Term'), t('系数', 'Weight'), t('贡献', 'Contribution')], rows: [['R₁', 1, r.terms[0]!], ['R₂', v.gamma, r.terms[1]!], ['R₃', v.gamma ** 2, r.terms[2]!], ['V(S₃)', v.terminal ? 0 : v.gamma ** 3, r.tail]] },
    }; },
  },
  {
    id: 'bellman-expectation', topic: basic,
    title: b('Bellman 期望：两种未来如何加权？', 'Bellman expectation: weight two possible futures'),
    description: b('把“奖励 + 后继价值”按转移概率加权，分清一个样本与条件期望。', 'Weight reward plus successor value by transition probability; distinguish a sample from an expectation.'),
    scenario: b('固定当前工况与一个候选动作。教学模型假设下一步可能“回稳”或“未回稳”。这里计算该状态动作对的 Q 目标，不对动作取最大值。', 'Fix a regime and one candidate action. A teaching model predicts recovery or no recovery at the next step. Compute this state-action Q backup without maximizing over actions.'),
    chapterIds: ['02', '05', '06'], researchIds: ['sequential'], tags: ['Bellman', 'expectation', 'transition', '期望', '概率'],
    fields: [f('p', b('回稳概率', 'Recovery probability'), 'p', .7, 0, 1, b('未回稳概率自动等于 1−p。', 'The other branch has probability 1−p.')), f('ra', b('回稳时奖励', 'Reward after recovery'), 'r_A', 3), f('rb', b('未回稳时奖励', 'Reward without recovery'), 'r_B', -2), f('va', b('回稳后价值', 'Value after recovery'), 'V_A', 5), f('vb', b('未回稳后价值', 'Value without recovery'), 'V_B', 1), gammaField()],
    presets: [preset('mixed', b('两种后果', 'Two possible outcomes'), b('逐项计算概率加权贡献。', 'Calculate both weighted contributions.'), {}), preset('certain', b('模型认为一定回稳', 'Certain recovery in the model'), b('p=1 时另一分支贡献为零。', 'At p=1, the other branch contributes zero.'), { p: 1 }), preset('no-future', b('只比较即时后果', 'Compare immediate outcomes'), b('γ=0 时退化为即时奖励期望。', 'At γ=0, only expected immediate reward remains.'), { gamma: 0 })],
    formulas: [String.raw`Q(s,a)=p[r_A+\gamma V_A]+(1-p)[r_B+\gamma V_B]`], sources: [book],
    present(v, locale) { const t = tr(locale), r = bellmanCase(v.p, v.ra, v.rb, v.va, v.vb, v.gamma); return {
      metrics: [{ label: t('回稳分支贡献', 'Recovery contribution'), value: r.contributionA }, { label: t('未回稳分支贡献', 'No-recovery contribution'), value: r.contributionB }, { label: t('动作价值目标', 'Action-value target'), value: r.target }],
      steps: [
        { title: t('算两条分支各自的价值', 'Calculate each branch value'), equation: String.raw`B_A=${n(v.ra)}+${n(v.gamma)}\cdot(${n(v.va)})\approx${n(r.branchA)},\quad B_B=${n(v.rb)}+${n(v.gamma)}\cdot(${n(v.vb)})\approx${n(r.branchB)}`, explanation: t('每个分支都先包含即时奖励与后继价值。', 'Each branch includes immediate reward and successor value.') },
        { title: t('再对未来求期望', 'Take the expectation over futures'), equation: String.raw`Q\approx${n(v.p)}\cdot(${n(r.branchA)})+(1-${n(v.p)})\cdot(${n(r.branchB)})\approx${n(r.target)}`, explanation: t('两个分支概率之和始终是 1。', 'The two probabilities always sum to 1.') },
      ], interpretation: [t('该结果是给定教学模型和后继估值的一次 Bellman 备份，不保证已经得到 Bellman 方程的不动点。', 'This is one Bellman backup under the teaching model and supplied values, not necessarily a Bellman fixed point.'), t('一次实际转移只会观察一个分支；正的期望也不能保证每次质量合格。', 'One transition observes one branch; positive expectation does not guarantee acceptable quality on every step.')],
    }; },
  },
  {
    id: 'td-update', topic: basic,
    title: b('一次 TD 更新：目标、误差与新估值', 'One TD update: target, error and new estimate'),
    description: b('用同一条样本比较 TD(0)、SARSA 和 Q-learning 的自举选择。', 'Use one sample to compare bootstrap selection in TD(0), SARSA and Q-learning.'),
    scenario: b('当前估值为 2，这一步收到奖励 −1。后继状态中两个动作的 Q 估计分别为 4 和 1，已采到的下一动作为 B。切换更新方法，观察目标为何改变。', 'The current estimate is 2 and the reward is −1. The successor has Q estimates 4 and 1; the sampled next action is B. Switch methods and explain the target change.'),
    chapterIds: ['07', '08', '10', '11'], researchIds: [], tags: ['TD', 'SARSA', 'Q-learning', 'DQN', '自举', '更新'],
    fields: [select('method', b('更新方法', 'Update method'), 1, [{ value: 0, label: b('TD(0)：V 值', 'TD(0): state value') }, { value: 1, label: b('SARSA：实际下一动作', 'SARSA: sampled next action') }, { value: 2, label: b('Q-learning：最大下一 Q', 'Q-learning: maximum next Q') }], b('TD(0) 模式把下一值 A 解释为 V(s′)，不使用 B；其余模式把 A/B 解释为两个动作值。', 'TD(0) interprets next value A as V(s′) and ignores B; the other modes use two action values.')), f('reward', b('当前奖励', 'Observed reward'), 'r', -1), f('current', b('更新前估值', 'Estimate before update'), String.raw`V\text{ or }Q`, 2), f('nextA', b('下一值 A', 'Next value A'), String.raw`V(s^\prime)\text{ or }Q_A`, 4), f('nextB', b('下一动作 B 的 Q', 'Next-action B value'), 'Q_B', 1), select('nextAction', b('SARSA 采到的下一动作', 'Next action sampled by SARSA'), 1, [{ value: 0, label: b('动作 A', 'Action A') }, { value: 1, label: b('动作 B', 'Action B') }], b('仅 SARSA 使用此选择；Q-learning 对 A/B 取最大值。', 'Only SARSA uses this choice; Q-learning takes the maximum.')), gammaField(), f('rate', b('学习率', 'Learning rate'), '\\eta', .2, 0, 1), endField()],
    presets: [preset('sarsa', b('SARSA 跟随下一动作', 'SARSA follows the next action'), b('下一动作 B 的估值低于 A。', 'The next sampled action B has the lower value.'), {}), preset('q', b('改用 Q-learning', 'Switch to Q-learning'), b('用同一条样本对后继动作取最大。', 'Maximize over successor actions for the same transition.'), { method: 2 }), preset('terminal', b('终止后没有自举', 'No bootstrap after termination'), b('所有方法的目标都只剩当前奖励。', 'Every method targets only the immediate reward.'), { terminal: 1 })],
    formulas: [String.raw`y=r+\gamma(1-d)B,\quad\delta=y-\hat v,\quad\hat v_{\rm new}=\hat v+\eta\delta`, String.raw`B_{\rm TD}=V(s'),\quad B_{\rm SARSA}=Q(s',a'),\quad B_{\rm Q}=\max_a Q(s',a)`], sources: [book, timeLimits],
    present(v, locale) { const t = tr(locale), method = (['td', 'sarsa', 'q-learning'] as TDMethod[])[v.method]!, r = tdCase({ reward: v.reward, gamma: v.gamma, current: v.current, nextA: v.nextA, nextB: v.nextB, rate: v.rate, method, selectedNext: v.nextAction, terminated: v.terminal === 1 }); return {
      metrics: [{ label: t('学习目标', 'Learning target'), value: r.target }, { label: t('TD 误差', 'TD error'), value: r.error }, { label: t('更新后估值', 'Updated estimate'), value: r.updated }],
      steps: [
        { title: t('按方法选自举项', 'Select the bootstrap'), equation: String.raw`B=${n(r.next)}`, explanation: method === 'q-learning' ? t('取两个后继动作估值的最大值。', 'Take the largest successor action value.') : method === 'sarsa' ? t('使用已采到的下一动作对应的 Q。', 'Use Q for the sampled next action.') : t('使用后继状态的 V 估计；动作 B 不参与。', 'Use the successor state value; action B is unused.') },
        { title: t('从目标减去原估值', 'Subtract the old estimate from the target'), equation: String.raw`y=${n(v.reward)}+${n(v.gamma)}(1-${v.terminal})\cdot(${n(r.next)})\approx${n(r.target)},\quad\delta\approx${n(r.target)}-(${n(v.current)})\approx${n(r.error)}`, explanation: t('误差符号决定估值提高还是降低。', 'The error sign determines whether the estimate rises or falls.') },
        { title: t('只走学习率指定的一部分', 'Move by the learning-rate fraction'), equation: String.raw`\hat v_{\rm new}\approx${n(v.current)}+${n(v.rate)}\cdot(${n(r.error)})\approx${n(r.updated)}`, explanation: t('这是一张表中的单次更新；神经网络还需通过参数梯度实现。', 'This is a single tabular update; a neural network instead updates parameters through gradients.') },
      ], interpretation: [t('SARSA 与 Q-learning 的区别在目标策略，不能靠它们这一次数值的大小判断哪个算法更好。', 'SARSA and Q-learning differ in target policy; one update cannot establish which algorithm is better.'), t('外部时间截断仍保留自举；真正终止才将该项置零。', 'External truncation retains bootstrapping; genuine termination removes it.')],
    }; },
  },
  {
    id: 'gae', topic: policy,
    title: b('GAE：把三个 TD 残差向前传', 'GAE: carry three TD residuals backward'),
    description: b('先计算每步残差，再按 γλ 递推优势，观察 λ=0 与 λ=1。', 'Calculate TD residuals, then recurse with γλ; compare λ=0 and λ=1.'),
    scenario: b('三步教学片段的奖励为 1、0、2，四个状态估值为 0.5、1、1.5、2。片段末尾总会停止优势递推；是否保留末状态 V 由终止原因决定。', 'A three-step teaching segment has rewards 1, 0 and 2, with state values 0.5, 1, 1.5 and 2. The trace ends at the segment boundary; its final V bootstrap depends on termination semantics.'),
    chapterIds: ['13', '14', '15'], researchIds: [], tags: ['GAE', 'lambda', 'advantage', '优势', '残差'],
    fields: [f('r1', b('奖励 1', 'Reward 1'), 'R_1', 1), f('r2', b('奖励 2', 'Reward 2'), 'R_2', 0), f('r3', b('奖励 3', 'Reward 3'), 'R_3', 2), f('v0', b('初始状态价值', 'Initial-state value'), 'V_0', .5), f('v1', b('状态 1 价值', 'State 1 value'), 'V_1', 1), f('v2', b('状态 2 价值', 'State 2 value'), 'V_2', 1.5), f('v3', b('末状态价值', 'Final-state value'), 'V_3', 2), gammaField(), f('lambda', b('迹参数', 'Trace parameter'), '\\lambda', .8, 0, 1), endField()],
    presets: [preset('blend', b('混合多步信息', 'Blend multiple steps'), b('γλ 决定后续残差传回来的权重。', 'γλ weights later residuals.'), {}), preset('td', b('λ=0：只看一步', 'λ=0: one-step residual'), b('每个优势估计等于该步 TD 残差。', 'Each advantage equals its own TD residual.'), { lambda: 0 }), preset('full', b('λ=1：完整片段', 'λ=1: the full segment'), b('对该有限片段得到带尾部的回报减当前 V。', 'For this finite segment, obtain bootstrapped return minus the current V.'), { lambda: 1 })],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma(1-d_t)V_{t+1}-V_t`, String.raw`\hat A_t=\delta_t+\gamma\lambda(1-e_t)\hat A_{t+1},\quad \hat A_3=0`], sources: [{ title: 'Schulman et al. · Generalized Advantage Estimation, §3, Eqs. 11–16', url: 'https://arxiv.org/html/1506.02438v6' }, timeLimits],
    present(v, locale) { const t = tr(locale), r = gaeCase([v.r1, v.r2, v.r3], [v.v0, v.v1, v.v2, v.v3], v.gamma, v.lambda, v.terminal === 1); return {
      metrics: r.advantages.map((a, i) => ({ label: `${t('优势', 'Advantage')} Â${i}`, value: a })),
      steps: [
        { title: t('分别计算三个残差', 'Compute the three residuals'), equation: String.raw`\begin{aligned}\delta_0&=${n(v.r1)}+${n(v.gamma)}\cdot(${n(v.v1)})-(${n(v.v0)})\approx${n(r.deltas[0]!)}\\\delta_1&=${n(v.r2)}+${n(v.gamma)}\cdot(${n(v.v2)})-(${n(v.v1)})\approx${n(r.deltas[1]!)}\\\delta_2&=${n(v.r3)}+${n(v.gamma)}(1-${v.terminal})\cdot(${n(v.v3)})-(${n(v.v2)})\approx${n(r.deltas[2]!)}\end{aligned}`, explanation: t('前两步未终止；末步根据终止标记决定是否使用 V₃。', 'The first two steps continue; the terminal flag determines whether the last uses V₃.') },
        { title: t('从片段末端向前递推', 'Recurse backward from the boundary'), equation: String.raw`\hat A_2=\delta_2\approx${n(r.advantages[2]!)},\quad \hat A_1\approx${n(r.deltas[1]!)}+${n(v.gamma * v.lambda)}\cdot(${n(r.advantages[2]!)})\approx${n(r.advantages[1]!)}`, explanation: t('e₂=1 截断优势迹，避免跨到重置后的另一条轨迹。', 'e₂=1 stops the advantage trace and prevents leakage into a reset trajectory.') },
        { title: t('得到第一个动作的优势', 'Obtain the first action advantage'), equation: String.raw`\hat A_0\approx${n(r.deltas[0]!)}+${n(v.gamma * v.lambda)}\cdot(${n(r.deltas[1]!)})+${n(v.gamma * v.lambda)}^2\cdot(${n(r.deltas[2]!)})\approx${n(r.advantages[0]!)}`, explanation: t('这三项是 δ₀、γλδ₁ 和 (γλ)²δ₂。价值回归目标可写为 V₀+Â₀，但优势不会自动变成无偏或低方差。', 'The terms are δ₀, γλδ₁ and (γλ)²δ₂. A value target can be V₀+Â₀; this does not establish unbiasedness or low variance.') },
      ], interpretation: [t('d 是真正终止标记，e 是轨迹边界标记。时间截断时 d=0、e=1：保留 V 的自举，同时停止跨轨迹传递。', 'd marks true termination; e marks a trace boundary. At a timeout, d=0 and e=1: retain the V bootstrap while stopping cross-trajectory recursion.'), t('改变 λ 会改变偏差与方差的取舍；一段确定性例子只能展示权重，不能测量统计方差。', 'Changing λ trades bias and variance. One deterministic example shows weights, not statistical variance.')],
      table: { caption: t('残差、优势与价值目标', 'Residuals, advantages and value targets'), headers: ['t', 'δₜ', 'Âₜ', 'Vₜ + Âₜ'], rows: r.deltas.map((d, i) => [i, d, r.advantages[i]!, r.valueTargets[i]!]) },
    }; },
  },
  {
    id: 'ppo-clip', topic: policy,
    title: b('PPO：正负优势下到底裁哪一边？', 'PPO: which side clips for each advantage sign?'),
    description: b('用一个已采到的动作计算概率比、两个候选项和最终 surrogate。', 'For one sampled action, calculate the probability ratio, both candidate terms and the surrogate.'),
    scenario: b('同一个离散动作的旧概率为 0.2、新概率为 0.3，优势估计为 2。先计算两个乘积，再取较小值；不要先把所有概率比强行裁剪。', 'The same discrete action has old probability 0.2, new probability 0.3 and estimated advantage 2. Calculate both products before taking the minimum.'),
    chapterIds: ['12', '14', '15'], researchIds: [], tags: ['PPO', 'clip', 'ratio', 'advantage', '裁剪', '优势', '概率比'],
    fields: [f('old', b('旧策略动作概率', 'Old-policy action probability'), 'p_{old}', .2, .000001, 1, b('分母必须大于 0；这里使用离散动作的概率。', 'The denominator must be positive; this case uses discrete-action probabilities.')), f('next', b('新策略动作概率', 'New-policy action probability'), 'p_{new}', .3, 0, 1), f('advantage', b('固定的优势估计', 'Fixed advantage estimate'), '\\hat A', 2), f('epsilon', b('裁剪幅度', 'Clip width'), '\\epsilon', .2, 0, 1)],
    presets: [preset('positive', b('正优势：增加得太多', 'Positive advantage: too much increase'), b('ρ=1.5 超过 1+ε。', 'ρ=1.5 exceeds 1+ε.'), {}), preset('negative', b('负优势：降低得太多', 'Negative advantage: too much decrease'), b('负优势改变裁剪生效的一侧。', 'Negative advantage changes the active clipping side.'), { advantage: -2, next: .1 }), preset('unhelpful', b('正优势：反而降低概率', 'Positive advantage: probability falls'), b('ρ 低于下界不代表最终一定采用裁剪项。', 'A ratio below the lower bound need not select the clipped term.'), { next: .1 })],
    formulas: [String.raw`\rho=\frac{\pi_{new}(a|s)}{\pi_{old}(a|s)},\quad L^{clip}=\min\bigl(\rho\hat A,\operatorname{clip}(\rho,1-\epsilon,1+\epsilon)\hat A\bigr)`],
    sources: [{ title: 'Schulman et al. · Proximal Policy Optimization Algorithms, Eq. 7', url: 'https://arxiv.org/abs/1707.06347' }, { title: 'OpenAI Spinning Up · PPO-Clip key equations', url: 'https://spinningup.openai.com/en/latest/algorithms/ppo.html' }],
    present(v, locale) { const t = tr(locale), r = ppoCase(v.old, v.next, v.advantage, v.epsilon); return {
      metrics: [{ label: t('概率比', 'Probability ratio'), value: r.ratio }, { label: t('最大化目标', 'Maximized surrogate'), value: r.objective }, { label: t('最小化时使用的负目标', 'Negative surrogate for minimization'), value: r.loss }],
      steps: [
        { title: t('先算概率比与裁剪区间', 'Calculate ratio and clip interval'), equation: String.raw`\rho=\frac{${n(v.next)}}{${n(v.old)}}\approx${n(r.ratio)},\quad[1-\epsilon,1+\epsilon]=[${n(1-v.epsilon)},${n(1+v.epsilon)}]`, explanation: t('比较的是同一个动作的选择概率，不是动作幅度。', 'The ratio compares probabilities of the same action, not its magnitude.') },
        { title: t('两个候选项分别乘优势', 'Multiply both candidates by the advantage'), equation: String.raw`u\approx${n(r.ratio)}\cdot(${n(v.advantage)})\approx${n(r.raw)},\quad c\approx${n(r.clippedRatio)}\cdot(${n(v.advantage)})\approx${n(r.clipped)}`, explanation: t('负优势会反转数值大小关系，不能沿用正优势的直觉。', 'A negative advantage reverses numerical order; the positive-advantage intuition no longer applies.') },
        { title: t('取较小目标，而不是较小概率比', 'Minimize the two terms, not the ratios'), equation: String.raw`L^{clip}=\min(${n(r.raw)},${n(r.clipped)})\approx${n(r.objective)}`, explanation: r.clippingActive ? t('本例选择了裁剪项；有利方向上的进一步改变不会继续增加这一单样本目标。', 'The clipped term is selected; further change in the helpful direction does not increase this sample objective.') : t('本例选择原始项，或两项相等；区间外的概率比不一定使裁剪项生效。', 'The raw term is selected, or the terms tie; being outside the interval does not always activate the clipped term.') },
      ], interpretation: [t('这是一个样本的目标项。实际 PPO 对批量样本求平均，并通常加入价值损失、熵项和其他训练控制。', 'This is one sample contribution. PPO averages a batch and usually adds value loss, entropy and other training controls.'), t('裁剪不是把策略参数或所有概率比硬限制在区间内，也不是工业动作的安全保证。', 'Clipping does not hard-bound policy parameters or all probability ratios, and is not an industrial action-safety guarantee.')],
    }; },
  },
  {
    id: 'sac-target', topic: policy,
    title: b('SAC 目标：双 Critic 与熵项怎样组合？', 'SAC target: combine twin critics and entropy'),
    description: b('先取较小目标 Q，再加入 −α log π，最后按终止语义自举。', 'Take the smaller target Q, include −α log π, then bootstrap according to termination semantics.'),
    scenario: b('固定一个从当前策略采样的下一动作，两个目标 Critic 给出 5 与 6，修正后的 log 密度为 −1.2。本例只展开一个样本的目标，不运行训练。', 'Fix one next action sampled from the current policy. Target critics return 5 and 6, and its corrected log density is −1.2. Expand one sample target without training.'),
    chapterIds: ['16', '17', '18'], researchIds: ['architecture'], tags: ['SAC', 'entropy', 'critic', 'target', '熵', '双Q'],
    fields: [f('reward', b('环境奖励', 'Environment reward'), 'r', 1), gammaField(.99), f('q1', b('目标 Critic 1', 'Target critic 1'), 'Q_1', 5), f('q2', b('目标 Critic 2', 'Target critic 2'), 'Q_2', 6), f('logp', b('下一动作的 log 密度', 'Next-action log density'), '\\log\\pi(a^\\prime|s^\\prime)', -1.2, -30, 10, b('连续动作的密度可大于 1，因此 log 密度也可为正；输入应已包含 tanh 与尺度修正。', 'Continuous densities may exceed 1, so log density can be positive; supply any tanh and scale corrections.')), f('alpha', b('熵温度', 'Entropy temperature'), '\\alpha', .2, 0, 10), endField()],
    presets: [preset('entropy', b('带熵的连续策略', 'Entropy-regularized policy'), b('观察 log 密度为负时熵项的符号。', 'Inspect the entropy term when log density is negative.'), {}), preset('no-entropy', b('把 α 设为 0', 'Set α to zero'), b('目标仅保留较小 Q。', 'The target retains only the smaller Q.'), { alpha: 0 }), preset('density', b('密度大于 1', 'Density above one'), b('连续密度不是事件概率。', 'Continuous density is not event probability.'), { logp: .5 })],
    formulas: [String.raw`y=r+\gamma(1-d)\left[\min(Q_1,Q_2)-\alpha\log\pi(a'|s')\right]`],
    sources: [{ title: 'OpenAI Spinning Up · Soft Actor-Critic, target Q equation', url: 'https://spinningup.openai.com/en/latest/algorithms/sac.html' }, timeLimits],
    present(v, locale) { const t = tr(locale), r = sacCase(v.reward, v.gamma, v.q1, v.q2, v.logp, v.alpha, v.terminal === 1); return {
      metrics: [{ label: t('较小目标 Q', 'Smaller target Q'), value: r.minimumQ }, { label: t('熵项 −α log π', 'Entropy term −α log π'), value: r.entropyTerm }, { label: t('SAC 回归目标', 'SAC regression target'), value: r.target }],
      steps: [
        { title: t('对同一个下一动作取较小 Q', 'Take the smaller Q for the same next action'), equation: String.raw`Q_{min}=\min(${n(v.q1)},${n(v.q2)})=${n(r.minimumQ)}`, explanation: t('两个值来自目标 Critic；下一动作来自当前策略。', 'The values come from target critics; the next action comes from the current policy.') },
        { title: t('单独核对熵项的符号', 'Check the sign of the entropy term'), equation: String.raw`-\alpha\log\pi=-${n(v.alpha)}\cdot(${n(v.logp)})\approx${n(r.entropyTerm)}`, explanation: t('这一项在密度不同的样本上可能为正也可能为负。', 'This term can be positive or negative depending on the sampled density.') },
        { title: t('计算有终止掩码的目标', 'Apply the termination mask'), equation: String.raw`y=${n(v.reward)}+${n(v.gamma)}(1-${v.terminal})[${n(r.minimumQ)}+(${n(r.entropyTerm)})]\approx${n(r.target)}`, explanation: t('真正终止同时去掉 Q 与熵的未来贡献。', 'True termination removes both future Q and entropy contributions.') },
      ], interpretation: [t('双 Critic 取最小有助于减轻过估计，但不证明策略安全或模型可信。', 'The minimum of twin critics helps counter overestimation; it does not establish safety or model validity.'), t('不要再把同一个未来熵项加到 r 上；这里采用所列 SAC 目标的奖励约定。', 'Do not add the same future entropy term to r again; this case follows the displayed SAC reward convention.')],
    }; },
  },
  {
    id: 'cql-regularizer', topic: policy,
    title: b('离散 CQL：为什么压低未记录动作的估值？', 'Discrete CQL: why penalize unsupported values?'),
    description: b('稳定计算 log-sum-exp 与数据动作 Q 的差，并与固定 TD 目标比较。', 'Stably calculate log-sum-exp minus the recorded-action Q and combine it with a fixed TD target.'),
    scenario: b('教学动作表只有 A、B、C；日志记录了 A，但网络给 B 更大的 Q。本例为一个状态、一个数据动作的离散 CQL(H) 项，连续工业动作需要另外的采样近似。', 'A teaching action table contains A, B and C. The log recorded A, but the network assigns B a larger Q. This is one discrete CQL(H) term; continuous industrial actions require sampling approximations.'),
    chapterIds: ['22'], researchIds: ['architecture', 'open-problems'], tags: ['CQL', 'offline', 'logsumexp', '离线', '保守估值'],
    fields: [f('qa', b('动作 A 的 Q', 'Q for action A'), 'Q_A', 1), f('qb', b('动作 B 的 Q', 'Q for action B'), 'Q_B', 4), f('qc', b('动作 C 的 Q', 'Q for action C'), 'Q_C', 0), select('observed', b('日志中的动作', 'Recorded action'), 0, [{ value: 0, label: b('动作 A', 'Action A') }, { value: 1, label: b('动作 B', 'Action B') }, { value: 2, label: b('动作 C', 'Action C') }], b('这里只评价一个数据动作，不宣称该日志代表完整行为分布。', 'This evaluates one recorded action, not an entire behavior distribution.')), f('alpha', b('保守项权重', 'Conservative-term weight'), '\\alpha', 1, 0, 20), f('target', b('固定 TD 目标', 'Fixed TD target'), 'y', 1.5)],
    presets: [preset('unsupported', b('未记录动作估值偏高', 'Unrecorded action has high value'), b('看 B 的相对高估如何增加保守项。', 'Inspect how B’s high relative value increases regularization.'), {}), preset('shift', b('所有 Q 同加 1000', 'Shift every Q by 1000'), b('同步平移 TD 目标；相对差与损失应保持不变。', 'Shift the TD target too; the gap and losses remain unchanged.'), { qa: 1001, qb: 1004, qc: 1000, target: 1001.5 }), preset('no-cql', b('移除保守项', 'Remove conservative regularization'), b('α=0 时只剩固定目标的平方误差。', 'At α=0, only the fixed-target squared error remains.'), { alpha: 0 })],
    formulas: [String.raw`L=\alpha\left[\log\sum_a e^{Q_a}-Q_{data}\right]+\tfrac12(Q_{data}-y)^2`, String.raw`\log\sum_a e^{Q_a}=m+\log\sum_a e^{Q_a-m},\quad m=\max_a Q_a`],
    sources: [{ title: 'Kumar et al. · Conservative Q-Learning, CQL(H), Eq. 4', url: 'https://arxiv.org/html/2006.04779v3' }],
    present(v, locale) { const t = tr(locale), r = cqlCase([v.qa, v.qb, v.qc], v.observed, v.alpha, v.target); return {
      metrics: [{ label: t('保守间隙', 'Conservative gap'), value: r.gap }, { label: t('加权保守项', 'Weighted regularizer'), value: r.conservativeTerm }, { label: t('总教学损失', 'Total teaching loss'), value: r.total }],
      steps: [
        { title: t('先减最大值，避免指数溢出', 'Subtract the maximum before exponentiating'), equation: String.raw`m=${n(r.maximum)},\quad\log\sum_a e^{Q_a}=m+\log\left(${r.shifted.map(n).join('+')}\right)\approx${n(r.logSumExp)}`, explanation: t('即使 Q≈1000，也不直接计算 exp(1000)。', 'Even for Q≈1000, never evaluate exp(1000) directly.') },
        { title: t('与数据动作的 Q 比较', 'Compare against the recorded-action Q'), equation: String.raw`C\approx${n(v.alpha)}\cdot[${n(r.logSumExp)}-(${n(r.observedQ)})]\approx${n(v.alpha)}\cdot(${n(r.gap)})\approx${n(r.conservativeTerm)}`, explanation: t('某未记录动作的 Q 单独变高，会增大该项并推动其下调。计算内核直接用移位后的差值，避免大数相减损失精度。', 'Raising an unrecorded action’s Q increases this term and pushes it downward. The kernel calculates the shifted difference directly to avoid cancellation.') },
        { title: t('加上固定目标的 TD 损失', 'Add the fixed-target TD loss'), equation: String.raw`L\approx${n(r.conservativeTerm)}+\tfrac12(${n(r.observedQ)}-${n(v.target)})^2\approx${n(r.total)}`, explanation: t('保守项与 TD 项可能给同一 Q 不同方向的梯度。', 'Regularization and the TD term can push a Q estimate in different directions.') },
      ], interpretation: [t('这里展示的是损失项，不是完整训练或离线策略评估；小损失不等于可安全执行。', 'This illustrates a loss term, not full training or offline policy evaluation; small loss does not imply safe execution.'), t('CQL 的理论下界依赖相应假设；不能把这张三动作表视作本工业项目的安全证明。', 'CQL lower-bound results have assumptions; this three-action table is not a safety proof for the industrial project.')],
      table: { caption: t('仅保守项对每个 Q 的偏导', 'Derivative of the conservative term only'), headers: [t('动作', 'Action'), 'Q', '∂C/∂Q'], rows: [v.qa, v.qb, v.qc].map((q, i) => [['A', 'B', 'C'][i]!, q, r.regularizerGradient[i]!]) },
    }; },
  },
  {
    id: 'setpoint-response', topic: industrial,
    title: b('从动作到温度：SP 与 PV 为什么不同？', 'From action to temperature: why SP differs from PV'),
    description: b('把归一化动作换算为设定值增量，再计算一阶跟踪的单步响应。', 'Convert a normalized action into a setpoint increment and calculate one tracking step.'),
    scenario: b('沿用水泥工作台的第一项教学 CV：当前 SP=880°C、PV=879°C，每步 5 分钟，RATE=2°C，一阶跟踪系数为 0.28。其余 CV 和扰动固定，本例不模拟完整热过程。', 'Use the teaching workbench’s first CV: SP=880°C, PV=879°C, a five-minute step, RATE=2°C and tracking factor 0.28. Other CVs and disturbances are fixed; this is not the complete thermal model.'),
    chapterIds: ['01', '04', '19', '21'], researchIds: ['history', 'indicators', 'architecture'], tags: ['SP', 'PV', 'setpoint', 'RATE', '设定值', '惯性'],
    fields: [f('action', b('请求的归一化增量', 'Requested normalized increment'), 'a_{req}', .5, -1, 1), f('sp', b('当前设定温度', 'Current temperature setpoint'), 'T^{sp}', 880, 860, 900, b('教学绝对设定值边界保持 860–900°C。', 'The teaching setpoint limits remain 860–900°C.'), b('°C', '°C'), .1), f('pv', b('当前测量温度', 'Current measured temperature'), 'T', 879, 840, 920, b('实际测量不会随着 SP 的改变瞬间跳变。', 'The measurement does not jump instantaneously when SP changes.'), b('°C', '°C'), .1), select('accepted', b('外部给定的门控结果', 'Externally supplied gate result'), 1, [{ value: 1, label: b('假设完整五层检查通过', 'Assume all five checks passed') }, { value: 0, label: b('任一检查拒绝', 'A check rejected the request') }], b('此处仅切换教学条件；完整五层检查在水泥工作台。候选温度超界时仍拒绝。', 'This is a teaching condition; use the kiln workbench for all five checks. An out-of-bounds candidate is still rejected.'))],
    presets: [preset('accepted', b('小幅提高设定值', 'Raise the setpoint slightly'), b('观察请求增量与实际 PV 变化。', 'Compare the requested increment with the PV response.'), {}), preset('reject', b('门控拒绝，过程继续', 'Gate rejects; process continues'), b('SP 保持，但 PV 继续追踪原 SP。', 'SP holds while PV continues tracking the old SP.'), { accepted: 0 }), preset('bound', b('设定值触及上界', 'At the upper setpoint bound'), b('请求超过 900°C 时执行增量为零。', 'A request above 900°C executes zero increment.'), { sp: 900, pv: 899, action: 1 })],
    formulas: [String.raw`\Delta T^{sp}_{req}=2a_{req},\quad T^{sp}_{new}=T^{sp}+2a_{exec}`, String.raw`T_{new}=T+0.28(T^{sp}_{new}-T)`], sources: [kilnSource],
    present(v, locale) { const t = tr(locale), r = setpointCase(v.action, v.sp, v.pv, v.accepted === 1); return {
      metrics: [{ label: t('实际执行增量', 'Executed increment'), value: r.delta, unit: '°C' }, { label: t('新设定值 SP', 'New setpoint SP'), value: r.nextSetpoint, unit: '°C' }, { label: t('5 分钟后的教学 PV', 'Teaching PV after five minutes'), value: r.nextMeasured, unit: '°C' }],
      steps: [
        { title: t('把归一化请求换成物理增量', 'Scale the normalized request'), equation: String.raw`\Delta T^{sp}_{req}=${RATE[0]}\cdot(${n(v.action)})\approx${n(r.requestedDelta)},\quad T^{sp}_{candidate}\approx${n(r.candidate)}`, explanation: t('输出上层运行指标的目标增量，不是直接操纵燃料阀门。', 'The output changes a supervisory target; it does not directly actuate a fuel valve.') },
        { title: t('区分请求与实际执行', 'Distinguish request from execution'), equation: String.raw`a_{exec}\approx${n(r.executedAction)},\quad T^{sp}_{new}=${n(v.sp)}+${RATE[0]}\cdot(${n(r.executedAction)})\approx${n(r.nextSetpoint)}`, explanation: !r.withinBounds ? t('候选设定值越界，因此实际执行零增量。', 'The candidate exceeds the setpoint limits; the executed increment is zero.') : r.accepted ? t('在给定的通过条件下执行请求。', 'The request executes under the supplied acceptance assumption.') : t('门控拒绝后保持 SP，但不冻结过程时钟。', 'Rejection holds SP but does not freeze process time.') },
        { title: t('推进一阶教学响应', 'Advance the teaching tracking response'), equation: String.raw`T_{new}=${n(v.pv)}+${TRACKING[0]}(${n(r.nextSetpoint)}-${n(v.pv)})\approx${n(r.nextMeasured)}`, explanation: t('0.28 是既有工作台的教学系数，不是现场辨识结果。', '0.28 is the existing teaching coefficient, not an identified plant parameter.') },
      ], interpretation: [t('即使执行增量为零，只要 PV 与当前 SP 不同，下一步 PV 仍可能变化。', 'Even with zero executed increment, PV may change whenever it differs from the current SP.'), t('该一维切片不计算完整门控、时滞或其他 CV，也不能用于现场控制。', 'This one-dimensional slice omits full gates, delays and other CVs and cannot be used for plant control.')],
    }; },
  },
  {
    id: 'energy-reward', topic: industrial,
    title: b('工业奖励：能耗收益与约束成本分开算', 'Industrial reward: keep energy and constraint costs separate'),
    description: b('标准化煤耗、电耗，计算动作平滑项，再独立报告质量和氧含量越界成本。', 'Normalize coal and electricity, calculate action regularity, and report independent quality and oxygen costs.'),
    scenario: b('沿用教学参考值：煤耗均值 134、尺度 4 kg/t；电耗均值 25、尺度 1 kWh/t。只改变第一维已执行动作，其余两维为零。质量样本用于离线评价，不输入当前在线策略。', 'Use teaching references: coal mean 134 and scale 4 kg/t; electricity mean 25 and scale 1 kWh/t. Only the first executed action varies; two other components are zero. The quality sample is for offline evaluation, not the current online policy.'),
    chapterIds: ['21', '24'], researchIds: ['indicators', 'objectives'], tags: ['reward', 'energy', 'CMDP', '目标函数', '能耗', '约束'],
    fields: [f('coal', b('煤耗', 'Specific coal consumption'), 'F', 130, 0, 300, b('教学输入，不是实测节能数据。', 'Teaching input, not measured savings.'), b('kg/t', 'kg/t'), .1), f('electric', b('电耗', 'Specific electricity'), 'E', 25.5, 0, 100, b('使用与固定参考尺度一致的单位。', 'Use the same units as the fixed reference scale.'), b('kWh/t', 'kWh/t'), .1), f('action', b('当前已执行动作', 'Current executed action'), 'a_t', .5, -1, 1), f('previous', b('上一已执行动作', 'Previous executed action'), 'a_{t-1}', 0, -1, 1), f('wf', b('煤耗权重', 'Coal weight'), 'w_f', REWARD_REFERENCE.coalWeight, 0, 10), f('we', b('电耗权重', 'Electricity weight'), 'w_e', REWARD_REFERENCE.electricWeight, 0, 10), f('ws', b('平滑权重', 'Regularity weight'), 'w_s', REWARD_REFERENCE.smoothWeight, 0, 10), f('quality', b('评价用质量样本 f-CaO', 'Evaluation quality sample f-CaO'), 'q', 1, 0, 5, b('界限为本项目教学约定的 0.5–1.5%，不是通用工艺规范。', 'The 0.5–1.5% range is this project’s teaching convention, not a universal process standard.'), b('%', '%')), f('oxygen', b('评价用氧含量', 'Evaluation oxygen content'), 'O_2', 1.8, 0, 10, b('保持本项目教学下界 1.2%。', 'Retain this project’s 1.2% teaching lower bound.'), b('%', '%'))],
    presets: [preset('normal', b('能耗降低且样本合格', 'Lower energy with acceptable samples'), b('先分解奖励的三个来源。', 'Decompose the three reward contributions.'), {}), preset('violation', b('奖励好看，但约束越界', 'Attractive reward, violated constraints'), b('保持能耗不变，只改变质量和氧含量。', 'Keep energy unchanged and change only quality and oxygen.'), { quality: 1.8, oxygen: 1.05 }), preset('oscillation', b('方向反转带来平滑代价', 'Reversal increases the regularity cost'), b('当前动作 1、上一步 −1；这里只分析代价，不授予门控通过。', 'Current action 1, previous −1; this analyzes cost and does not grant gate acceptance.'), { action: 1, previous: -1 })],
    formulas: [String.raw`z_F=\frac{F-134}{4},\quad z_E=\frac{E-25}{1}`, String.raw`r=-w_fz_F-w_ez_E-w_s[a_t^2+(a_t-a_{t-1})^2]`, String.raw`c_q=\max(0,0.5-q)+\max(0,q-1.5),\quad c_O=\max(0,1.2-O_2)`], sources: [kilnSource],
    present(v, locale) { const t = tr(locale), r = energyCase({ coal: v.coal, electric: v.electric, action: v.action, previousAction: v.previous, coalWeight: v.wf, electricWeight: v.we, smoothWeight: v.ws, quality: v.quality, oxygen: v.oxygen }); return {
      metrics: [{ label: t('奖励', 'Reward'), value: r.reward }, { label: t('质量越界成本', 'Quality violation cost'), value: r.quality, unit: t('百分点', 'percentage points'), warning: r.quality > 0 }, { label: t('氧含量越界成本', 'Oxygen violation cost'), value: r.oxygen, unit: t('百分点', 'percentage points'), warning: r.oxygen > 0 }],
      steps: [
        { title: t('先消除量纲', 'Normalize the physical quantities'), equation: String.raw`z_F=\frac{${n(v.coal)}-134}{4}\approx${n(r.coalZ)},\quad z_E=\frac{${n(v.electric)}-25}{1}\approx${n(r.electricZ)}`, explanation: t('参考均值和尺度固定为教学约定，实际研究应只用训练数据拟合。', 'References are fixed teaching values; research must fit them on training data only.') },
        { title: t('展开已执行动作的平滑项', 'Expand executed-action regularity'), equation: String.raw`s=-${n(v.ws)}\left[(${n(v.action)})^2+(${n(v.action)}-(${n(v.previous)}))^2\right]\approx${n(r.smoothTerm)}`, explanation: t(`平滑项内部为 a²=${formatFormulaNumber(r.actionSquare)}，变化平方=${formatFormulaNumber(r.changeSquare)}。`, `Inside regularity: a²=${formatFormulaNumber(r.actionSquare)}, squared change=${formatFormulaNumber(r.changeSquare)}.`) },
        { title: t('加总能耗与平滑项', 'Combine energy and action regularity'), equation: String.raw`r\approx-${n(v.wf)}\cdot(${n(r.coalZ)})-${n(v.we)}\cdot(${n(r.electricZ)})+(${n(r.smoothTerm)})\approx${n(r.reward)}`, explanation: t('权重不强制和为 1；它们表达选择的偏好与尺度。煤耗或电耗低于教学参考值时，对应奖励项为正。', 'Weights need not sum to one; they encode preferences and scale. Energy below a teaching reference contributes positively to reward.') },
        { title: t('独立报告约束成本', 'Report constraint costs independently'), equation: String.raw`\begin{aligned}c_q&=\max(0,0.5-${n(v.quality)})+\max(0,${n(v.quality)}-1.5)\approx${n(r.quality)}\\c_O&=\max(0,1.2-${n(v.oxygen)})\approx${n(r.oxygen)}\end{aligned}`, explanation: t('这两项不被任意合并进上述奖励；仍需独立约束和执行门控。', 'These costs are not arbitrarily folded into the reward; separate constraints and execution gates remain necessary.') },
      ], interpretation: [(r.quality > 0 || r.oxygen > 0) ? t('当前评价样本存在约束越界。即使奖励为正，也不能把它判定为可执行方案。', 'This evaluation sample violates a constraint. Positive reward would not make the suggestion executable.') : t('两个评价样本均未越界，但单步零成本不能证明整条轨迹或真实系统安全。', 'Neither evaluation sample violates its bound, but zero single-step cost does not prove trajectory or plant safety.'), t('动作反转也可能被变化率/曲率门控拒绝；此处只展开目标函数，实际奖励需使用真正执行的动作。', 'Action reversal may also fail rate/curvature gates. This case decomposes the objective; actual reward must use the executed action.')],
    }; },
  },
  {
    id: 'constraint-lagrangian', topic: industrial,
    title: b('拉格朗日权衡：高得分为何仍会不可行？', 'Lagrangian trade-offs: why a high score can be infeasible'),
    description: b('比较两个策略的收益、成本预算和松弛目标，再更新一次非负乘子。', 'Compare two policies by return, cost budget and relaxed score, then update a nonnegative multiplier.'),
    scenario: b('教学候选 A 的预期折扣收益/成本为 10/0.3，B 为 9/0.05，成本预算为 0.1。这里的 J 是对同一时域与折扣约定的估计值，不是单步传感器值。', 'Teaching candidate A has estimated discounted return/cost 10/0.3; B has 9/0.05, with budget 0.1. These J values use the same horizon and discount convention; they are not single sensor readings.'),
    chapterIds: ['24'], researchIds: ['objectives', 'sequential', 'agenda'], tags: ['CMDP', 'Lagrangian', 'dual', 'constraint', '拉格朗日', '乘子', '成本预算'],
    fields: [f('rewardA', b('A 的收益估计', 'Estimated return of A'), 'J_r^A', 10), f('rewardB', b('B 的收益估计', 'Estimated return of B'), 'J_r^B', 9), f('costA', b('A 的成本估计', 'Estimated cost of A'), 'J_c^A', .3, 0, 100), f('costB', b('B 的成本估计', 'Estimated cost of B'), 'J_c^B', .05, 0, 100), f('budget', b('成本预算', 'Cost budget'), 'd', .1, 0, 100), f('lambda', b('当前乘子', 'Current multiplier'), '\\lambda', 2, 0, 100), f('rate', b('乘子更新步长', 'Multiplier step size'), '\\eta_\\lambda', .5, 0, 10), select('current', b('本次已评价的当前策略', 'Current policy evaluated for this update'), 0, [{ value: 0, label: b('策略 A', 'Policy A') }, { value: 1, label: b('策略 B', 'Policy B') }], b('乘子更新使用这个策略的成本，不把排名结果当作已执行动作。', 'Update the multiplier using this policy’s cost; the ranking is not an executed action.'))],
    presets: [preset('weak', b('乘子较小，可能偏爱违规候选', 'Small multiplier can prefer a violation'), b('比较松弛排序与硬预算筛选。', 'Compare relaxed ranking with budget filtering.'), {}), preset('strong', b('增大乘子', 'Increase the multiplier'), b('将 λ 从 2 改为 10。', 'Change λ from 2 to 10.'), { lambda: 10 }), preset('none', b('两个候选都超过预算', 'Both candidates exceed the budget'), b('没有可行候选时应明确显示，而不是挑较不差者冒充可行。', 'Report no feasible candidate rather than labeling the less-bad one feasible.'), { costB: .2 })],
    formulas: [String.raw`L(\pi,\lambda)=J_r(\pi)-\lambda[J_c(\pi)-d]`, String.raw`\lambda_{new}=\operatorname{clip}\left(\lambda+\eta_\lambda[J_c(\pi_{current})-d],0,100\right)`],
    sources: [{ title: 'Achiam et al. · Constrained Policy Optimization, §4 and primal-dual baseline Eq. 16', url: 'https://arxiv.org/html/1705.10528v1' }, kilnSource],
    present(v, locale) { const t = tr(locale), r = lagrangianCase({ rewardA: v.rewardA, rewardB: v.rewardB, costA: v.costA, costB: v.costB, budget: v.budget, multiplier: v.lambda, rate: v.rate, currentPolicy: v.current }); const winner = (s: string) => s === 'tie' ? t('A 与 B 同分', 'A and B tie') : s === 'none' ? t('无可行候选', 'No feasible candidate') : s; return {
      metrics: [{ label: t('松弛目标的首选', 'Preferred relaxed score'), value: winner(r.relaxedWinner) }, { label: t('预算筛选后的首选', 'Preferred within the budget'), value: winner(r.feasibleWinner), warning: r.feasibleWinner === 'none' }, { label: t('更新后乘子', 'Updated multiplier'), value: r.nextMultiplier }],
      steps: [
        { title: t('给两个候选计算松弛分数', 'Calculate both relaxed scores'), equation: String.raw`\begin{aligned}L_A&=${n(v.rewardA)}-${n(v.lambda)}(${n(v.costA)}-${n(v.budget)})\approx${n(r.scoreA)}\\L_B&=${n(v.rewardB)}-${n(v.lambda)}(${n(v.costB)}-${n(v.budget)})\approx${n(r.scoreB)}\end{aligned}`, explanation: t('最大化 L；预算项 d 对两个候选相同，但可行性仍需单独判断。', 'Maximize L. The budget term is shared, but feasibility must still be checked separately.') },
        { title: t('明确检查预算', 'Check the budget explicitly'), equation: String.raw`J_c^A=${n(v.costA)},\quad J_c^B=${n(v.costB)},\quad d=${n(v.budget)}`, explanation: t(`预算筛选结果：${winner(r.feasibleWinner)}。这只针对输入的预期成本估计，不等于每时刻的物理安全。`, `Budget-filtered result: ${winner(r.feasibleWinner)}. This uses supplied expected costs, not pointwise physical safety.`) },
        { title: t('根据当前策略的违规量更新乘子', 'Update from the current policy’s budget excess'), equation: String.raw`\lambda_{new}=\operatorname{clip}(${n(v.lambda)}+${n(v.rate)}\cdot(${n(r.violation)}),0,100)\approx${n(r.nextMultiplier)}`, explanation: t('超过预算时乘子上升，低于预算时可能下降；100 是演示的数值上限，不是工业阈值或理论保证。', 'Budget excess increases the multiplier; undershoot may reduce it. The cap 100 is a numerical demonstration limit, not an industrial threshold or guarantee.') },
      ], interpretation: [t('有限乘子的松弛排序可以选中不满足预算的候选，因此不能用一个分数代替可行性检查。', 'A finite multiplier can favor a budget-violating candidate; one score does not replace feasibility checks.'), t('此处不是 CPO 的完整更新算法；独立成本评估、模型可信度、五层执行门控和回退仍然必要。', 'This is not the full CPO update. Independent cost evaluation, model credibility, five execution gates and fallback remain necessary.')],
      table: { caption: t('两个候选逐项比较', 'Compare the two candidates'), headers: [t('策略', 'Policy'), 'Jᵣ', 'J꜀', 'L', t('满足预算', 'Within budget')], rows: [['A', v.rewardA, v.costA, r.scoreA, r.feasibleA ? t('是', 'Yes') : t('否', 'No')], ['B', v.rewardB, v.costB, r.scoreB, r.feasibleB ? t('是', 'Yes') : t('否', 'No')]] },
    }; },
  },
];

export function getFormulaCaseDefinition(id: string): FormulaCaseDefinition | undefined {
  return formulaCases.find(item => item.id === id);
}
export function defaultFormulaValues(id: string): FormulaValues {
  const definition = getFormulaCaseDefinition(id);
  if (!definition) throw new RangeError(`Unknown formula case: ${id}`);
  return Object.fromEntries(definition.fields.map(field => [field.key, field.value]));
}
export function getFormulaCases(locale: Locale = getLocale()) {
  return formulaCases.map(item => ({ id: item.id, topic: item.topic[locale], title: item.title[locale], description: item.description[locale], scenario: item.scenario[locale], chapterIds: [...item.chapterIds], researchIds: [...item.researchIds], tags: [...item.tags] }));
}
export function getFormulaCase(id: string, locale: Locale = getLocale()) {
  return getFormulaCases(locale).find(item => item.id === id);
}
export type FormulaEvaluation = { ok: true; values: FormulaValues; presentation: FormulaPresentation } | { ok: false; errors: Record<string, string> };
export function evaluateFormulaCase(id: string, raw: Record<string, unknown>, locale: Locale = getLocale()): FormulaEvaluation {
  const definition = getFormulaCaseDefinition(id), t = tr(locale);
  if (!definition) return { ok: false, errors: { case: t('未找到这个案例。', 'This case was not found.') } };
  const values: FormulaValues = {}, errors: Record<string, string> = {};
  for (const field of definition.fields) {
    const value = raw[field.key];
    const number = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    if (!Number.isFinite(number)) errors[field.key] = t('请输入一个有限数值，不能为空。', 'Enter a finite number; the field cannot be empty.');
    else if (number < field.min || number > field.max) errors[field.key] = t(`请输入 ${field.min} 至 ${field.max} 之间的数值。`, `Enter a value between ${field.min} and ${field.max}.`);
    else if (field.options && !field.options.some(option => option.value === number)) errors[field.key] = t('请选择列出的选项。', 'Choose one of the listed options.');
    else values[field.key] = number;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  try {
    const presentation = definition.present(values, locale);
    for (const metric of presentation.metrics) if (typeof metric.value === 'number' && !Number.isFinite(metric.value)) throw new RangeError('Invalid numerical result.');
    return { ok: true, values, presentation };
  } catch {
    return { ok: false, errors: { calculation: t('这些输入无法得到有限结果，请检查数值范围。', 'These inputs did not produce a finite result; check their ranges.') } };
  }
}

const markdownCell = (value: string | number): string => (typeof value === 'number' ? formatFormulaNumber(value) : value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
/** Standalone static examples have no repeated HTML anchors and no web-only hash routes. */
export function formulaCaseMarkdown(id: string, locale: Locale = getLocale(), input?: FormulaValues): string {
  const definition = getFormulaCaseDefinition(id);
  if (!definition) return '';
  const t = tr(locale), result = evaluateFormulaCase(id, input ?? defaultFormulaValues(id), locale);
  if (!result.ok) throw new RangeError(`Invalid formula export: ${id}`);
  const p = result.presentation;
  const lines = [
    `### ${t('公式案例', 'Worked formula case')} · ${definition.title[locale]}`, '', `**${t('起始案例背景（默认参数；本次值见输入表）', 'Starting scenario (defaults; see the input table for this calculation)')}**`, '', definition.scenario[locale], '',
    t('以下为当前输入的静态计算快照。网页中的“公式案例”可修改参数与切换情景；本文件保留完整代入过程。', 'This is a static calculation snapshot for these inputs. The website’s Formula cases allow parameter and scenario changes; this file retains the full calculation.'), '',
    `**${t('输入与单位', 'Inputs and units')}**`, '',
    `| ${t('参数', 'Parameter')} | ${t('数值', 'Value')} | ${t('单位', 'Unit')} |`, '|---|---|---|',
    ...definition.fields.map(field => `| ${markdownCell(field.label[locale])} | ${markdownCell(field.options?.find(option => option.value === result.values[field.key])?.label[locale] ?? result.values[field.key]!)} | ${markdownCell(field.unit[locale])} |`), '',
    `**${t('原始公式', 'Equations')}**`, '', ...definition.formulas.flatMap(formula => ['$$', formula, '$$', '']),
    `**${t('代入与计算', 'Substitution and calculation')}**`, '',
    ...p.steps.flatMap((step, index) => [`${index + 1}. **${step.title}**`, '', '$$', step.equation, '$$', '', step.explanation, '']),
    `**${t('结果', 'Results')}**`, '', ...p.metrics.map(metric => `- ${metric.label}: ${typeof metric.value === 'number' ? formatFormulaNumber(metric.value) : metric.value}${metric.unit ? ` ${metric.unit}` : ''}`), '',
  ];
  if (p.table) lines.push(`**${p.table.caption}**`, '', `| ${p.table.headers.map(markdownCell).join(' | ')} |`, `| ${p.table.headers.map(() => '---').join(' | ')} |`, ...p.table.rows.map(row => `| ${row.map(markdownCell).join(' | ')} |`), '');
  lines.push(`**${t('如何解释', 'Interpretation')}**`, '', ...p.interpretation.map(line => `- ${line}`), '', `**${t('来源与约定', 'Sources and conventions')}**`, '', ...definition.sources.map(source => `- [${source.title}](${source.url})`), '');
  return lines.join('\n');
}
export function chapterFormulaCasesMarkdown(chapterId: string, locale: Locale = getLocale()): string {
  return formulaCases.filter(item => item.chapterIds.includes(chapterId)).map(item => formulaCaseMarkdown(item.id, locale)).join('\n\n');
}
export function researchFormulaCasesMarkdown(researchId: string, locale: Locale = getLocale()): string {
  return formulaCases.filter(item => item.researchIds.includes(researchId)).map(item => formulaCaseMarkdown(item.id, locale)).join('\n\n');
}
