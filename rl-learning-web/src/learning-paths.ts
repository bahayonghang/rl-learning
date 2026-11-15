import { chapters, getChapter } from './content/localized';
import { getLocale, text as t, type Locale, type Localized } from './i18n';
import { researchPages } from './research/content';

export type LearningPathId = 'ml' | 'control' | 'rl';
export type StudyWeeks = 6 | 8;
type StepKind = 'primer' | 'case' | 'kiln' | 'research';
const bi = (zh: string, en: string): Localized<string> => ({ 'zh-CN': zh, en });

interface PathStepDefinition {
  kind: StepKind;
  id: string;
  title: Localized<string>;
  outcome: Localized<string>;
  /** A planning estimate for practice; article times come from the research registry. */
  minutes?: number;
}
interface LearningPathDefinition {
  id: LearningPathId;
  icon: string;
  title: Localized<string>;
  shortTitle: Localized<string>;
  description: Localized<string>;
  prerequisite: Localized<string>;
  outcome: Localized<string>;
  level: Localized<string>;
  steps: PathStepDefinition[];
  chapterIds: string[];
}
export interface LearningPathStep {
  kind: StepKind;
  id: string;
  href: string;
  title: string;
  outcome: string;
  minutes: number;
}
export interface LearningPath {
  id: LearningPathId;
  icon: string;
  title: string;
  shortTitle: string;
  description: string;
  prerequisite: string;
  outcome: string;
  level: string;
  steps: LearningPathStep[];
  chapterIds: readonly string[];
  firstSessionMinutes: number;
}

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => String(start + index).padStart(2, '0'));
const definitions: LearningPathDefinition[] = [
  {
    id: 'ml', icon: 'BrainCircuit',
    title: bi('懂神经网络，刚开始学 RL', 'I know neural networks; I’m new to RL'),
    shortTitle: bi('从机器学习进入', 'From machine learning'),
    description: bi('先补概率与期望，再把长期回报变成能解释的数字。', 'Build probability intuition, then turn long-term returns into numbers you can explain.'),
    prerequisite: bi('基础代数；了解梯度更新即可。', 'Basic algebra and an idea of gradient updates.'),
    outcome: bi('手算一个期望，解释折扣与截断后的自举。', 'Calculate an expectation and explain discounting and bootstrap after a cutoff.'),
    level: bi('RL 入门', 'RL foundation'),
    steps: [
      { kind: 'primer', id: 'probability', minutes: 15, title: bi('概率与条件概率', 'Probability and conditional probability'), outcome: bi('改变一次升温的条件，比较两种后果的概率。', 'Change the conditions of a temperature increase and compare outcome probabilities.') },
      { kind: 'primer', id: 'expectation', minutes: 15, title: bi('期望与全期望', 'Expectation and total expectation'), outcome: bi('先按概率手算加权结果，再用计算器核对。', 'Calculate the probability-weighted outcome before checking the calculator.') },
      { kind: 'case', id: 'return-bootstrap', minutes: 15, title: bi('三步回报公式案例', 'Three-step return worked case'), outcome: bi('改变折扣与边界类型，解释为什么时间截断仍保留尾部价值。', 'Change the discount and boundary type; explain why a time cutoff retains the tail value.') },
    ],
    chapterIds: range(1, 8),
  },
  {
    id: 'control', icon: 'Settings2',
    title: bi('懂过程控制，想理解 RL 决策', 'I know process control; I want to understand RL'),
    shortTitle: bi('从过程控制进入', 'From process control'),
    description: bi('从熟悉的设定值与反馈入手，区分动作、动态和可用信息。', 'Start with setpoints and feedback; distinguish actions, dynamics and available information.'),
    prerequisite: bi('了解设定值 SP、测量值 PV 与反馈控制。', 'Familiarity with setpoints (SP), measurements (PV) and feedback.'),
    outcome: bi('解释请求动作、执行增量与滞后的测量值为什么不同。', 'Explain why a requested action, executed increment and lagging measurement differ.'),
    level: bi('控制到 RL 的桥梁', 'Control-to-RL bridge'),
    steps: [
      { kind: 'primer', id: 'language', minutes: 15, title: bi('符号、单位与决策时间', 'Notation, units and decision time'), outcome: bi('读懂五分钟决策周期，以及上层设定值和下层操作量的区别。', 'Read the five-minute decision cycle and distinguish supervisory setpoints from manipulated variables.') },
      { kind: 'case', id: 'setpoint-response', minutes: 15, title: bi('设定值与响应公式案例', 'Setpoint and response worked case'), outcome: bi('把归一化动作换算成温度增量，检查 SP 与 PV 的不同变化。', 'Convert a normalized action into a temperature increment and compare changes in SP and PV.') },
      { kind: 'kiln', id: 'kiln', minutes: 20, title: bi('水泥决策工作台', 'Cement decision workbench'), outcome: bi('提出一次增量建议，观察门控、过程惯性与延迟化验。', 'Propose an increment and observe gate decisions, process inertia and delayed assays.') },
    ],
    chapterIds: range(1, 8),
  },
  {
    id: 'rl', icon: 'Telescope',
    title: bi('已掌握 RL，准备研究工业决策', 'I know RL; I’m exploring industrial decisions'),
    shortTitle: bi('从 RL 进入研究', 'From RL to research'),
    description: bi('先确定上层决策的位置，再构建目标、约束与信息时间。', 'Locate the supervisory decision, then define objectives, constraints and information timing.'),
    prerequisite: bi('掌握 Bellman、Actor–Critic 与连续动作策略。', 'Working knowledge of Bellman, Actor–Critic and continuous-action policies.'),
    outcome: bi('写出一个工业序贯决策问题的初步变量、目标与约束。', 'Draft the variables, objectives and constraints of an industrial sequential decision problem.'),
    level: bi('进阶研究', 'Advanced research'),
    steps: [
      { kind: 'research', id: 'history', title: bi('从全厂控制到运行指标决策', 'From plantwide control to operational decisions'), outcome: bi('说明 RL 策略处于哪一层，以及哪些控制职责仍属于下层。', 'Identify the policy’s layer and the control responsibilities that remain below it.') },
      { kind: 'research', id: 'objectives', title: bi('从指标到目标、Pareto 与约束', 'From indicators to objectives, Pareto order and constraints'), outcome: bi('分清优化偏好与不可突破的边界，并检查指标量纲。', 'Separate optimization preferences from hard boundaries and check units.') },
      { kind: 'research', id: 'sequential', title: bi('从指标优化到 MDP、POMDP 与 CMDP', 'From operational optimization to MDPs, POMDPs and CMDPs'), outcome: bi('明确观测历史、动作、信息可用时间及独立约束成本。', 'Specify observation history, actions, information availability and separate constraint costs.') },
    ],
    chapterIds: range(19, 24),
  },
];

function stepHref(kind: StepKind, id: string): string {
  return kind === 'kiln' ? '#/kiln' : `#/${kind === 'case' ? 'cases' : kind}/${id}`;
}

export function getLearningPaths(locale: Locale = getLocale()): LearningPath[] {
  return definitions.map(path => {
    const steps = path.steps.map(step => ({
      kind: step.kind, id: step.id, href: stepHref(step.kind, step.id),
      title: step.title[locale], outcome: step.outcome[locale],
      minutes: step.kind === 'research' ? researchPages.find(page => page.id === step.id)!.minutes : step.minutes!,
    }));
    return {
      id: path.id, icon: path.icon, title: path.title[locale], shortTitle: path.shortTitle[locale],
      description: path.description[locale], prerequisite: path.prerequisite[locale], outcome: path.outcome[locale],
      level: path.level[locale], steps, chapterIds: [...path.chapterIds],
      firstSessionMinutes: steps.reduce((total, step) => total + step.minutes, 0),
    };
  });
}

export const findLearningPath = (id: string, locale: Locale = getLocale()): LearningPath | undefined => getLearningPaths(locale).find(path => path.id === id);

/** Completion is an explicit chapter mark, never inferred from a visit or role choice. */
export function chapterProgress(completed: readonly string[], ids: readonly string[] = chapters.map(chapter => chapter.id)) {
  const valid = new Set(chapters.map(chapter => chapter.id));
  const included = [...new Set(ids)].filter(id => valid.has(id));
  const marked = new Set(completed);
  return { completed: included.filter(id => marked.has(id)).length, total: included.length };
}

interface WeekDefinition { start: number; end: number; title: Localized<string>; outcome: Localized<string>; }
export interface StudyWeek { week: number; chapterIds: string[]; range: string; title: string; outcome: string; readingMinutes: number; }
const weekDefinitions: WeekDefinition[] = [
  { start: 1, end: 3, title: bi('建立交互与概率直觉', 'Interaction and probability'), outcome: bi('画出闭环、手算回报、解释探索的代价。', 'Draw the loop, calculate returns and explain the cost of exploration.') },
  { start: 4, end: 6, title: bi('用 Bellman 方程看未来', 'Bring the future into Bellman backups'), outcome: bi('写出 MDP，完成一次策略评估与价值迭代。', 'Specify an MDP; complete policy evaluation and value iteration.') },
  { start: 7, end: 8, title: bi('从样本里学会估值', 'Learn values from samples'), outcome: bi('比较 MC、TD、SARSA 与 Q-learning 的目标。', 'Compare the targets in MC, TD, SARSA and Q-learning.') },
  { start: 9, end: 12, title: bi('深度价值与策略梯度', 'Deep values and policy gradients'), outcome: bi('解释 DQN 不稳定性，推导 REINFORCE。', 'Explain DQN instability and derive REINFORCE.') },
  { start: 13, end: 15, title: bi('拆开 PPO 的更新', 'Unpack the PPO update'), outcome: bi('手算 GAE、概率比与正负优势下的裁剪。', 'Calculate GAE, probability ratios and clipping for both signs.') },
  { start: 16, end: 18, title: bi('掌握连续动作与 SAC', 'Continuous actions and SAC'), outcome: bi('理解 tanh 密度修正，写出双 Critic 目标。', 'Understand tanh density correction and twin-critic targets.') },
  { start: 19, end: 21, title: bi('独立建模与可信实验', 'Modelling and credible experiments'), outcome: bi('写环境契约、基线矩阵与工业实验协议。', 'Write an environment contract, baseline matrix and industrial protocol.') },
  { start: 22, end: 24, title: bi('形成研究方向', 'Develop a research question'), outcome: bi('比较离线、模型与约束方法，提出最小消融实验。', 'Compare offline, model-based and constrained methods; design a minimal ablation.') },
];

export function getStudyPlan(weeks: StudyWeeks, locale: Locale = getLocale()): StudyWeek[] {
  const selected = weeks === 8 ? weekDefinitions : [
    weekDefinitions[0],
    { start: 4, end: 8, title: bi('建模与表格控制', 'Modelling and tabular control'), outcome: bi('串起 Bellman、MC/TD 与控制算法。', 'Connect Bellman, MC/TD and control algorithms.') },
    weekDefinitions[3],
    { start: 13, end: 18, title: bi('PPO 与 SAC 核心机制', 'Core PPO and SAC mechanisms'), outcome: bi('推导优势、概率比与连续策略目标。', 'Derive advantages, likelihood ratios and continuous-policy objectives.') },
    weekDefinitions[6], weekDefinitions[7],
  ];
  return selected.map((week, index) => {
    const chapterIds = range(week.start, week.end);
    return {
      week: index + 1, chapterIds, range: `${chapterIds[0]}–${chapterIds.at(-1)}`,
      title: week.title[locale], outcome: week.outcome[locale],
      readingMinutes: chapterIds.reduce((sum, id) => sum + (getChapter(id)?.duration ?? 0), 0),
    };
  });
}

/** Uses the active edition, matching the visible route and the download filename. */
export function studyChecklist(weeks: StudyWeeks, completed: readonly string[], pathId = ''): string {
  const path = findLearningPath(pathId);
  const marked = new Set(completed);
  const progress = chapterProgress(completed);
  const introduction = `# RL Atlas · ${t(`${weeks} 周学习清单`, `${weeks}-week study checklist`)}\n\n${t(`已选择 ${weeks} 周计划。每周 8–12 小时仅作安排参考；推导、编码与实验所需时间因人而异。`, `Selected schedule: ${weeks} weeks. Eight to twelve hours per week is a planning guide; derivations, coding and experiments vary by learner.`)}\n\n${t(`导出时手动标记完成：${progress.completed}/${progress.total} 章。仅反映当前浏览器的记录。`, `Manually marked at export: ${progress.completed}/${progress.total} chapters, using this browser’s records.`)}`;
  const entry = path ? `\n\n## ${t('入门活动', 'Entry session')} · ${path.title}\n\n${t('预备知识：', 'Prerequisites: ')}${path.prerequisite}\n\n${t('完成后：', 'After this session: ')}${path.outcome}\n\n${t(`预计约 ${path.firstSessionMinutes} 分钟，仅为第一轮活动的安排参考。`, `Allow approximately ${path.firstSessionMinutes} minutes for the first session; this is a planning estimate.`)}\n\n${path.steps.map((step, index) => `${index + 1}. ${step.title} — ${step.outcome}`).join('\n')}` : '';
  const schedule = getStudyPlan(weeks).map(week => `## ${t(`第 ${week.week} 周`, `Week ${week.week}`)} · ${week.title}\n\n${week.outcome}\n\n${week.chapterIds.map(id => `- [${marked.has(id) ? 'x' : ' '}] ${id} ${getChapter(id)?.title ?? id}`).join('\n')}\n\n${t(`章节阅读估计合计 ${week.readingMinutes} 分钟；不含练习与实验。`, `Chapter reading estimates total ${week.readingMinutes} minutes; practice and experiments are additional.`)}`).join('\n\n');
  return `${introduction}${entry}\n\n${schedule}\n`;
}
