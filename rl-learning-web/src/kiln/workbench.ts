import { text } from '../i18n';
import { fmt } from '../labs/ui';
import {
  MAX_STEPS, STEP_MINUTES, RATE, SP_LOW, SP_HIGH, TRACKING, SCENARIOS,
  createKiln, observeKiln, checkKilnGates, actionForMode, advanceKiln, stepKiln, compareKilnBranches,
  type Vec3, type Scenario, type ActionMode, type KilnState, type BranchComparison,
} from './math';
import './kiln.css';

const getChannels = () => [
  { short: 'T꜀', name: text('分解炉出口温度 T꜀', "Calciner outlet temperature T꜀"), unit: '°C', color: 'var(--kw-green)' },
  { short: 'T₂', name: text('二次风温 T₂', "Secondary-air temperature T₂"), unit: '°C', color: 'var(--kw-orange)' },
  { short: 'P', name: text('窑头压力 P', "Kiln-hood pressure P"), unit: 'Pa', color: 'var(--kw-blue)' },
];
const getGateLabels = () => [text('数据有效', "Data validity"), text('当前状态', "Current state"), text('模型适用域', "Model applicability"), text('动作可行', "Action feasibility"), text('执行保护', "Execution protection")];
const getModeNames = (): Record<ActionMode, string> => ({ manual: text('手动候选增量', "Manual candidate increment"), hold: text('保持当前设定值', "Hold current setpoints"), feedback: text('保守反馈规则', "Conservative feedback rule") });
const getStages = () => [
  { id: 'preheater', title: text('01 · 预热器', "01 · Preheater"), subtitle: text('生料与热烟气换热', "Raw meal exchanges heat with flue gas"), icon: '<path d="M18 9h20l-2 15-8 7-8-7ZM21 33h20l-2 15-8 7-8-7M12 17H5v29h11M38 14h12v31h-8"/>', observed: text('本工作台用原料 KH 表示一种可测原料性质；真实工况还会使用喂料量、烟气温度等历史信号。', "This workbench uses raw-meal KH as one measurable material property. A real system would also use histories of feed rate, gas temperature, and other signals."), hidden: text('颗粒内部温度、物料在设备中的实际停留分布，没有被这 13 个数完整测到。', "Particle-core temperatures and the material’s actual residence-time distribution are not fully measured by these 13 numbers."), action: text('这里没有单独的动作滑块。原料变化是外部扰动，不能把已经测到的 KH 当成智能体可以直接操纵的动作。', "There is no separate action slider here. Raw-material changes are external disturbances; observing KH does not make it a variable the agent can directly control."), lesson: text('先问“我看见了什么”。可测原料变化先出现，最终熟料质量会晚一些响应。', "First ask what is observable. A measured raw-material change appears before the eventual clinker-quality response.") },
  { id: 'calciner', title: text('02 · 分解炉', "02 · Calciner"), subtitle: text('热量进入，碳酸盐分解', "Heat input and carbonate decomposition"), icon: '<path d="M22 8h17v9l7 9v18l-12 12-12-12V26l6-9V8M9 33h13M46 34h11"/><path d="M32 43c-9-6 0-10 0-16 8 6 10 12 0 16Z"/>', observed: text('分解炉出口温度 T꜀ 是实际测量 PV；T꜀ˢᵖ 是当前要求下层追踪的设定值。O₂ 提供燃烧状态信息。', "Calciner outlet temperature T꜀ is a measured process variable, PV. T꜀ˢᵖ is the setpoint the inner loop is asked to track. O₂ provides information about combustion."), hidden: text('炉内蓄热、各位置的温度分布和物料反应程度无法由一个出口温度完全代表。', "One outlet temperature cannot fully represent stored heat, spatial temperature distribution, or the extent of material reaction."), action: text('候选 a꜀ 乘 2°C，得到每 5 分钟的设定值增量。下层 PID/APC 再调煤量等执行量；上层动作不是直接开关煤阀。', "Multiply candidate a꜀ by 2°C to obtain the setpoint increment per five minutes. Inner PID/APC loops then adjust actuators such as coal feeds; the upper-level action does not directly switch a coal valve."), lesson: text('在稳定工况把 a꜀ 设为 +1，点“单次脉冲”。先看 SP，再看 PV，最后等待化验。', "In the stable scenario, set a꜀ to +1 and select the single pulse. Watch SP first, then PV, and finally wait for an assay.") },
  { id: 'rotary', title: text('03 · 回转窑', "03 · Rotary kiln"), subtitle: text('物料移动与熟料形成', "Material transport and clinker formation"), icon: '<path d="m9 29 40-14 8 22-40 14ZM14 28l8 22M44 18l8 22M22 49l-3 7h12M44 41l-3 7h12"/>', observed: text('本简化界面展示窑头压力 P、O₂ 和延迟发布的熟料 f-CaO 化验。温度代理影响物料的热历史。', "This simplified interface shows kiln-hood pressure P, O₂, and delayed clinker f-CaO assays. The temperature proxies affect the material’s thermal history."), hidden: text('当前物料批次的完整热历史和即时真实 f-CaO 不可在线直接获知。教学真值只供解释与评价。', "The full thermal history and current true f-CaO of the material batch are not directly available online. Teaching ground truth is for explanation and evaluation only."), action: text('aP 乘 5Pa 改变压力设定值，由下层风机/风门等回路追踪。T꜀ 和二次风温的影响经蓄热、物料移动后才反映到质量。', "Multiply aP by 5Pa to change the pressure setpoint, tracked by inner fan/damper loops. Effects of T꜀ and secondary-air temperature reach quality through heat storage and material transport."), lesson: text('即时奖励可以变化，而质量仍在响应旧工况。别把“现在拿到的化验”误读为“现在生产的样品”。', "Immediate reward may change while quality still responds to earlier conditions. An assay received now does not necessarily describe a sample produced now.") },
  { id: 'cooler', title: text('04 · 冷却机', "04 · Cooler"), subtitle: text('冷却熟料并回收热量', "Clinker cooling and heat recovery"), icon: '<path d="M8 22h46v18H8ZM12 32h38M18 45v11M30 45v11M42 45v11M18 55l-4-5m4 5 4-5M30 55l-4-5m4 5 4-5M42 55l-4-5m4 5 4-5M32 20V8l-5 5m5-5 5 5"/>', observed: text('二次风温 T₂ 是本工作台的第三个温度/压力通道之一；煤耗与电耗是运行指标，不能只用一个温度代替。', "Secondary-air temperature T₂ is one of this workbench’s three temperature/pressure channels. Coal and electricity use are operating metrics; one temperature cannot stand in for both."), hidden: text('熟料内部温度、料层分布和换热效率没有在教学状态中逐项建模。', "Clinker-core temperature, bed distribution, and heat-transfer efficiency are not modeled individually in this teaching state."), action: text('a₂ 乘 5°C 调整上层二次风温目标。这里用一阶跟踪代理代替复杂的冷却风和料层耦合，不代表真实装置可独立瞬时调温。', "Multiply a₂ by 5°C to adjust the supervisory secondary-air temperature target. A first-order tracking proxy replaces complex cooling-air and bed interactions; it does not imply that a real plant can change this temperature independently or instantaneously."), lesson: text('同时看煤耗和电耗：同一个设定值方向，在这个教学模型中可能让两项指标向不同方向变化。', "Watch coal and electricity together: the same setpoint direction can move these two metrics in opposite directions in this teaching model.") },
];

/** Localize kernel metadata in the presentation layer; simulation contracts stay unchanged. */
function getScenarios() {
  const english: Record<Scenario, readonly [string, string]> = {
    normal: ['Stable operation · Observe one action', 'Start at 880°C / 1100°C / −80Pa. Apply one small increment, then hold. Observe when PV, thermal memory, and assays change.'],
    'raw-meal': ['Raw-material change · Delay and feedback', 'From minute 30, teaching KH rises from 0.95 by about 0.018. The material measurement changes first; clinker quality follows thermal and material dynamics, and the assay is published later.'],
    'low-oxygen': ['Low oxygen · Gate 2', 'Initial O₂ is 1.05%, with a continuing low-oxygen disturbance. The gate rejects candidates, but holding setpoints does not instantly remove an existing abnormal condition.'],
    ood: ['Out-of-distribution state · Gate 3', 'T₂ starts at 1180°C, within the displayed state range but more than 4σ from the teaching calibration distribution. The gate outcome can change as temperature naturally falls.'],
    'no-apc': ['No execution authorization · Gate 5', 'Observations are normal, but simulated APC authorization is disabled. Suggestions are allowed; the workbench executes zero increments while the process proxy continues under its existing setpoints.'],
  };
  return SCENARIOS.map(s => ({ ...s, title: text(s.title, english[s.id][0]), description: text(s.description, english[s.id][1]) }));
}

const escape = (s: string): string => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const time = (step: number): string => `${step * STEP_MINUTES}${text(" 分钟", " min")}`;
const signed = (x: number, precision = 2): string => `${x >= 0 ? '+' : '−'}${fmt(Math.abs(x), precision)}`;
const vec = (v: readonly number[], precision = 2): string => `[${v.map(x => fmt(x, precision)).join(', ')}]`;
const card = (label: string, value: string, sub = ''): string => `<div class="kw-metric"><span>${label}</span><strong>${value}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
const dataTable = (head: string[], rows: string[][]): string => `<div class="kw-table-scroll"><table><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
interface TrendSeries { label: string; values: number[]; color: string; dashed?: boolean; stairs?: boolean; }
function trend(series: TrendSeries[], label: string, unit: string, startMinute: number, endMinute: number, domain?: [number, number]): string {
  const w = 680, h = 255, left = 64, right = 16, top = 24, bottom = 42;
  const values = series.flatMap(s => s.values).filter(Number.isFinite);
  let lo = domain?.[0] ?? Math.min(...values), hi = domain?.[1] ?? Math.max(...values);
  const pad = Math.max((hi - lo) * .12, unit === '°C' ? .5 : .025);
  if (!domain) { lo -= pad; hi += pad; }
  if (hi <= lo) hi = lo + 1;
  const y = (v: number): number => top + (hi - v) / (hi - lo) * (h - top - bottom);
  const x = (i: number, count: number): number => left + (w - left - right) * i / Math.max(1, count - 1);
  const paths = series.map(s => {
    const points = s.values.map((v, i) => `${i === 0 ? 'M' : s.stairs ? 'H' : 'L'}${fmt(x(i, s.values.length))}${i && s.stairs ? 'V' : ' '}${fmt(y(v))}`).join(' ');
    const last = s.values.length - 1;
    return `<path d="${points}" fill="none" stroke="${s.color}" stroke-width="2.5" ${s.dashed ? 'stroke-dasharray="6 4"' : ''} stroke-linejoin="round"/><circle cx="${x(last, s.values.length)}" cy="${y(s.values[last]!)}" r="3" fill="${s.color}"/>`;
  }).join('');
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const v = lo + i / 4 * (hi - lo);
    return `<line x1="${left}" x2="${w - right}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" opacity=".12"/><text x="${left - 9}" y="${y(v) + 4}" text-anchor="end">${fmt(v, Math.max(Math.abs(lo), Math.abs(hi)) > 100 ? 1 : 2)}</text>`;
  }).join('');
  const count = Math.max(...series.map(s => s.values.length));
  const timeTicks = count > 1 ? [0, .5, 1].map(f => `<text x="${left + (w - left - right) * f}" y="${h - 20}" text-anchor="middle">${fmt(startMinute + f * (endMinute - startMinute), 0)}</text>`).join('') : `<text x="${left}" y="${h - 20}" text-anchor="middle">${startMinute}</text>`;
  return `<figure class="kw-trend"><div class="kw-svg-scroll"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(label)}"><title>${escape(label)}</title>${ticks}${paths}${timeTicks}<text x="${left}" y="14">${escape(unit)}</text><text x="${w - right}" y="${h - 2}" text-anchor="end">${text("仿真时间 / 分钟", "Simulation time / min")}</text></svg></div><div class="kw-legend">${series.map(s => `<span><i style="--series:${s.color}" class="${s.dashed ? 'dashed' : ''}"></i>${escape(s.label)}</span>`).join('')}</div><figcaption>${escape(label)}</figcaption></figure>`;
}

function calculation(state: KilnState): string {
  const CV = getChannels();
  const t = state.lastTransition;
  if (!t) return text('<p>执行一步后，这里会展开刚刚发生的数值计算。起点的奖励显示“尚未执行”，不是一条虚构奖励。</p>', "<p>After one step, this section expands the numerical calculation that just occurred. At the starting point no action has been executed, so no reward is fabricated.</p>");
  const p = t.rewardParts;
  return `<p class="kw-small">${text("时间：", "Time: ")}${time(t.before.step)} → ${time(state.step)}${text("。所有值来自这次真实计算；显示值作了四舍五入。", ". All values come from this simulation step; displayed values are rounded.")}</p>
  <ol class="kw-calculation">
    <li><strong>${text("提出候选，先过门控", "Propose a candidate and check the gate")}</strong><p>a<sub>${text("候选", "requested")}</sub> = ${vec(t.proposed)}${text("。", ". ")}${t.gate.failed ? `Gate ${t.gate.failed}${text(" 拒绝，实际增量 a = [0, 0, 0]。", " rejected the request; executed increment a = [0, 0, 0]. ")}` : text('五层通过，实际增量等于候选。', "All five layers passed; the executed increment equals the request. ")}${text("上次实际增量 = ", "Previous executed increment = ")}${vec(t.previousExecuted)}${text("。", ". ")}</p></li>
    <li><strong>${text("归一化动作 → 物理设定值", "Normalized action → physical setpoint")}</strong><p>ΔSP = a ⊙ [2°C, 5°C, 5Pa] = ${vec(t.physicalIncrement)}${text("。SP", ". SP")}<sub>${text("新", "new")}</sub> = ${vec(t.before.setpoints)} + ΔSP = ${vec(state.setpoints)}${text("。三个分量的单位不同。", ". The three components have different units.")}</p></li>
    <li><strong>${text("下层代理逐步追踪，PV 不会瞬移到 SP", "The inner-loop proxy tracks gradually; PV does not jump to SP")}</strong>${dataTable([text('通道', "Channel"), text('旧 PV + 跟踪项 + 扰动', "Old PV + tracking term + disturbance"), text('新 PV', "New PV")], CV.map((cv, i) => [cv.short, `${fmt(t.before.pv[i]!)} + ${fmt(TRACKING[i]!)} × (${fmt(state.setpoints[i]!)} − ${fmt(t.before.pv[i]!)}) ${signed(t.disturbances[i]!)}`, `${fmt(state.pv[i]!)} ${cv.unit}`]))}<p>${text("煤耗/电耗再由新 PV 与原料计算；它们不是把动作直接改名得到的量。热量进入隐藏蓄热变量，再经 6 步物料队列影响质量。", "Coal and electricity use are then calculated from the new PV and raw material; they are not renamed actions. Heat enters a hidden storage state, then affects quality through a six-step material queue.")}</p></li>
    <li><strong>${text("运行指标归一化，奖励单独计算", "Normalize operating metrics and calculate reward separately")}</strong><p>z<sub>${text("煤", "coal")}</sub> = (${fmt(state.coal, 3)} − 134) / 4 = ${fmt(p.coalZ, 4)}${text("；z", "; z")}<sub>${text("电", "electric")}</sub> = (${fmt(state.electric, 3)} − 25) / 1 = ${fmt(p.electricZ, 4)}${text("。", ". ")}</p><p>${text("能耗项 = −0.6 z", "Energy term = −0.6 z")}<sub>${text("煤", "coal")}</sub> − 0.4 z<sub>${text("电", "electric")}</sub> = ${fmt(p.energyTerm, 4)}${text("。", ". ")}</p><p>${text("平滑项 = −0.05 (‖a‖² + ‖a − a", "Smoothness term = −0.05 (‖a‖² + ‖a − a")}<sub>${text("上次实际", "previous executed")}</sub>‖²) = −0.05 × (${fmt(p.actionSquare, 4)} + ${fmt(p.changeSquare, 4)}) = ${fmt(p.smoothTerm, 4)}${text("。", ". ")}</p><p class="kw-formula">${text("奖励 r = ", "Reward r = ")}${fmt(p.energyTerm, 4)} + (${fmt(p.smoothTerm, 4)}) = <strong>${fmt(p.reward, 4)}</strong></p></li>
    <li><strong>${text("约束成本另列，不放进上式", "Keep constraint costs separate from the reward above")}</strong><p>c<sub>q</sub> = max(0, 0.5 − q) + max(0, q − 1.5) = ${fmt(t.costs.quality, 4)}${text("；c", "; c")}<sub>O₂</sub> = max(0, 1.2 − ${fmt(state.oxygen, 4)}) = ${fmt(t.costs.oxygen, 4)}${text("。质量成本使用模拟器真值，只供教学评价，不进入策略的 13 维输入。", ". Quality cost uses simulator truth for teaching evaluation; it does not enter the policy’s 13-dimensional input.")}</p></li>
    <li><strong>${text("发布新的观测，只纳入已到达的化验", "Publish the next observation using only assays that have arrived")}</strong><p>${t.sampled ? `${text("本步采样，预计在 ", "A sample was taken this step, due for release at ")}${time(t.sampled.releaseStep)}${text(" 发布；当前还不能使用其结果。", "; its result is not available yet. ")}` : text('本步不是新的采样时点。', "This step is not a new sampling time. ")}${t.published.length ? `${text("本步发布了 ", "Released this step: ")}${t.published.map(l => `${time(l.sampleStep)}${text(" 采样的结果 ", " sample: ")}${fmt(l.value, 3)}%`).join(text('、', ", "))}${text("。", ". ")}` : text('本步没有化验发布，沿用最近已发布结果，样品年龄继续增加。', "No assay was released this step. Retain the latest published result while its sample age increases.")}</p></li>
  </ol>`;
}

/** Isolated teaching simulation. No network, actuator access, timers, or policy training. */
export function mountKilnWorkbench(host: HTMLElement): () => void {
  const CV = getChannels(), GATES = getGateLabels(), MODE_NAMES = getModeNames(), STAGES = getStages();
  const scenarios = getScenarios();
  let state = createKiln();
  let mode: ActionMode = 'manual';
  let manual: Vec3 = [1, 0, 0];
  let selectedStage = 'calciner';
  let selectedCV = 0;
  let showTruth = false;
  let comparison: BranchComparison[] | null = null;
  let comparisonFrom = 0;
  let message = text('建议从一次 T꜀ 设定值脉冲开始。先预测，再执行，然后等待数据到来。', "Start with one T꜀ setpoint pulse. Predict first, execute, then wait for the information to arrive.");
  host.innerHTML = `<section class="kiln-workbench" aria-label="${text("水泥烧成互动工作台", "Interactive cement kiln workbench")}">
    <header class="kw-opening"><span class="kw-eyebrow">${text("浏览器教学模拟 · 5 分钟一步", "Browser teaching simulation · Five minutes per step")}</span><h2>${text("让一个设定值，走完一段烧成过程", "Follow a setpoint through the kiln process")}</h2><p>${text("你站在上层决策的位置：看观测，提一个小增量，让下层回路追踪，再等待热过程与化验。这里的反馈规则没有经过强化学习训练。", "Take the supervisory decision role: inspect observations, propose a small increment, let the inner loop track it, and wait for the thermal process and assays. The feedback rule here has not been trained with reinforcement learning.")}</p><div class="kw-contract">${text("项目约定：动作范围、速率、门控阈值与 13 维输入。", "Project conventions: action ranges, rates, gate thresholds, and the 13-dimensional input.")}<br>${text("教学假设：一阶动态、噪声、能耗系数与固定时滞。页面不连接真实设备。", "Teaching assumptions: first-order dynamics, noise, energy coefficients, and fixed delays. This page has no connection to real equipment.")}</div></header>
    <section class="kw-section" aria-labelledby="kw-process-title"><div class="kw-heading"><span class="kw-step">01</span><div><h3 id="kw-process-title">${text("先找到动作落在哪里", "Locate where the action enters the process")}</h3><p>${text("按物料方向选择一个部位，区分看得见的量、隐藏过程和下层执行。", "Select a stage along the material flow. Distinguish observable variables, hidden processes, and inner-loop execution.")}</p></div></div><div class="kw-process">${STAGES.map(s => `<button type="button" data-stage="${s.id}" aria-pressed="${s.id === selectedStage}" class="kw-stage"><svg viewBox="0 0 64 64" aria-hidden="true">${s.icon}</svg><strong>${s.title}</strong><span>${s.subtitle}</span></button>`).join('')}</div><div data-zone="stage" class="kw-stage-detail"></div><div class="kw-control-chain"><span>${text("上层候选 ", "Supervisory candidate ")}<b>ΔSP</b></span><span aria-hidden="true">→</span><span>${text("五层安全门", "Five-layer gate")}</span><span aria-hidden="true">→</span><span>${text("下层 PID / APC", "Inner PID / APC")}</span><span aria-hidden="true">→</span><span>${text("过程测量 ", "Process measurement ")}<b>PV</b></span></div><p class="kw-small">${text("煤阀、风机等操纵量 MV 属于下层控制。这里展示 SP → PV 的代理关系，没有把温度设定值当成直接执行量。", "Manipulated variables such as coal valves and fans belong to the inner control layer. This is a proxy for SP → PV tracking; a temperature setpoint is not treated as a direct actuator command.")}</p></section>
    <section class="kw-section" aria-labelledby="kw-scenario-title"><div class="kw-heading"><span class="kw-step">02</span><div><h3 id="kw-scenario-title">${text("选一个可以解释的实验", "Choose an interpretable experiment")}</h3><p>${text("相同种子与相同步数使用相同外部随机扰动，便于重做和对照。", "The same seed and step use the same external random disturbance, enabling repetition and paired comparisons.")}</p></div></div><div class="kw-scenario-row"><label for="kw-scenario"><span>${text("初始情景", "Initial scenario")}</span><select id="kw-scenario" data-field="scenario">${scenarios.map(s => `<option value="${s.id}">${s.title}</option>`).join('')}</select></label><label for="kw-seed"><span>${text("重置时使用的种子", "Seed used on reset")}</span><input id="kw-seed" data-field="seed" type="number" min="0" max="999999" step="1" value="42" inputmode="numeric"/></label><button type="button" class="kw-button kw-secondary" data-action="reset">${text("重置这个情景", "Reset this scenario")}</button></div><p data-zone="scenario" class="kw-small"></p><div class="kw-checkpoint"><strong>${text("先做一个预测", "Make a prediction first")}</strong><p>${text("稳定工况下，T꜀ 的 SP 从 880°C 调到 882°C。5 分钟后的 PV 会怎样？", "In stable conditions, T꜀ SP rises from 880°C to 882°C. What will PV do five minutes later?")}</p><div class="kw-answer-options"><button type="button" data-predict="instant">${text("立刻等于 882°C", "Immediately equal 882°C")}</button><button type="button" data-predict="tracking">${text("先上升约 0.56°C，另有小扰动", "Rise by about 0.56°C, plus a small disturbance")}</button><button type="button" data-predict="lab">${text("最新化验也立刻反映这次动作", "The latest assay immediately reflects this action too")}</button></div><p data-zone="prediction" aria-live="polite">${text("选一个判断，再用下面的“单次脉冲”验证。", "Choose an answer, then test it using the single pulse below.")}</p></div></section>
    <section class="kw-section" aria-labelledby="kw-control-title"><div class="kw-heading"><span class="kw-step">03</span><div><h3 id="kw-control-title">${text("提建议，再让时间向前走", "Propose an action and advance time")}</h3><p>${text("动作是每一步的增量。连续 12 步会重复提同样的增量；单次脉冲只改一次，随后保持。", "Actions are increments at every step. Twelve consecutive steps repeat the increment; a single pulse changes it once and then holds.")}</p></div><div data-zone="clock" class="kw-clock"></div></div><div class="kw-work-grid"><div class="kw-control-panel"><label for="kw-mode"><span>${text("候选产生方式", "Candidate-generation method")}</span><select id="kw-mode" data-field="mode"><option value="manual">${text("手动候选增量", "Manual candidate increment")}</option><option value="hold">${text("保持当前设定值", "Hold current setpoints")}</option><option value="feedback">${text("保守反馈规则（未训练）", "Conservative feedback rule (untrained)")}</option></select></label><div class="kw-sliders">${CV.map((c, i) => `<label for="kw-a${i}" class="kw-slider"><span>${c.name}<output data-value="a${i}"></output></span><input id="kw-a${i}" data-field="a${i}" type="range" min="-1" max="1" step="0.1" value="${manual[i]}"/><small data-value="delta${i}"></small></label>`).join('')}</div><p data-zone="mode" class="kw-small"></p><div data-zone="candidate" class="kw-candidate"></div><div class="kw-actions"><button type="button" class="kw-button" data-action="one">${text("执行 1 步 · 5 分钟", "Execute 1 step · 5 minutes")}</button><button type="button" class="kw-button kw-secondary" data-action="twelve">${text("连续执行 12 步", "Execute 12 consecutive steps")}</button><button type="button" class="kw-button kw-secondary" data-action="pulse">${text("单次脉冲 + 11 步保持", "One pulse + 11 hold steps")}</button></div><p class="kw-small">${text("每次执行都重新过门控。拒绝时只保持 SP；时间、PV、指标与化验仍继续演化。", "Every execution is gated again. Rejection holds only SP; time, PV, operating metrics, and assays continue to evolve.")}</p></div><div class="kw-gate-panel"><h4>${text("下一步候选的五层预检", "Five-layer preview for the next candidate")}</h4><p class="kw-small">${text("一票拒绝即执行零增量。通过前层才检查后层；这不是已执行记录。", "Any rejection produces a zero increment. Later layers are checked only after earlier layers pass. This is a preview, not an execution record.")}</p><div data-zone="gates"></div></div></div><div class="kw-status" data-zone="status" role="status" aria-live="polite" aria-atomic="true"></div><div data-zone="horizon"></div></section>
    <section class="kw-section" aria-labelledby="kw-observation-title"><div class="kw-heading"><span class="kw-step">04</span><div><h3 id="kw-observation-title">${text("此刻到底知道什么？", "What is actually known at this moment?")}</h3><p>${text("实际 PV、要求的 SP、即时软测量、已发布化验分别看。样品年龄从采样时刻计，不从发布时间计。", "Read actual PV, requested SP, current soft estimates, and published assays separately. Sample age starts at sampling, not publication.")}</p></div></div><div data-zone="observations"></div><details class="kw-details"><summary>${text("展开策略能拿到的 13 维观测", "Expand the policy’s 13-dimensional observation")}</summary><div data-zone="vector"></div><p class="kw-small">${text("保持 SimpleKilnEnv 的既有顺序。这里不把教学真值、待发布化验值或未来扰动拼进输入；完整工业 POMDP 通常还需要历史窗口。", "The existing SimpleKilnEnv order is preserved. Teaching truth, pending assay values, and future disturbances do not enter the input. A full industrial POMDP generally also needs a history window.")}</p></details><details class="kw-details"><summary>${text("教学透视：隐藏状态与排队化验", "Teaching view: hidden state and queued assays")}</summary><p class="kw-small">${text("下面是模拟器的解释/评价视角，不属于策略可见输入。真实装置没有一个可以随时读取的“完美质量真值”。", "The following is the simulator’s explanatory/evaluation view, outside the policy’s inputs. A real plant has no perfect quality truth that can be read at any moment.")}</p><div data-zone="hidden"></div></details></section>
    <section class="kw-section" aria-labelledby="kw-trends-title"><div class="kw-heading"><span class="kw-step">05</span><div><h3 id="kw-trends-title">${text("对齐三只时钟", "Align three clocks")}</h3><p>${text("设定值更新、过程响应与化验发布发生在不同时间。所有曲线来自本次逐步计算，最多保留 73 个状态点。", "Setpoint updates, process responses, and assay publication occur at different times. Every curve comes from this step-by-step calculation, with at most 73 state points.")}</p></div></div><div class="kw-chart-grid"><div class="kw-chart-panel"><div class="kw-chart-heading"><h4>${text("设定值与实际测量", "Setpoints and actual measurements")}</h4><label for="kw-cv" class="kw-inline-label"><span class="kw-sr-only">${text("选择绘图通道", "Select the plotted channel")}</span><select id="kw-cv" data-field="cv">${CV.map((c, i) => `<option value="${i}">${c.short} · ${c.unit}</option>`).join('')}</select></label></div><div data-zone="pv-chart"></div></div><div class="kw-chart-panel"><h4>${text("奖励与独立约束成本", "Reward and separate constraint costs")}</h4><div data-zone="reward-chart"></div><div data-zone="reward-breakdown"></div></div></div><div class="kw-chart-panel kw-quality-panel"><div class="kw-chart-heading"><h4>${text("软测量先变，化验稍后到达", "Soft estimates change before assays arrive")}</h4><label class="kw-check"><input type="checkbox" data-field="truth"/><span>${text("叠加教学真值（仅解释）", "Overlay teaching truth (explanation only)")}</span></label></div><div data-zone="quality-chart"></div><div data-zone="assay-timeline" class="kw-assay-timeline"></div></div><details class="kw-details"><summary>${text("把刚刚那一步展开：动作 → SP → PV → 奖励与成本", "Expand the last step: action → SP → PV → reward and costs")}</summary><div data-zone="calculation"></div></details></section>
    <section class="kw-section" aria-labelledby="kw-compare-title"><div class="kw-heading"><span class="kw-step">06</span><div><h3 id="kw-compare-title">${text("同一个起点，比较三种选择", "Compare three choices from the same starting point")}</h3><p>${text("从当前隐藏状态、化验队列和同一随机扰动序列分叉。对照不改变上面的主轨迹。", "Branch from the current hidden state, assay queue, and shared disturbance sequence. This comparison does not alter the main trajectory above.")}</p></div></div><button type="button" class="kw-button kw-secondary" data-action="compare">${text("对照未来 12 步 · 最多 60 分钟", "Compare the next 12 steps · Up to 60 minutes")}</button><div data-zone="comparison"><p class="kw-small">${text("保持、保守反馈和重复当前手动增量，是三条教学基线。点击后再判断“奖励更高”是否同时满足质量与氧含量约束。", "Hold, conservative feedback, and the repeated manual increment are three teaching baselines. Compare whether higher reward also respects quality and oxygen constraints.")}</p></div></section>
    <footer class="kw-footer"><h3>${text("把这次观察接回强化学习", "Connect the observation back to reinforcement learning")}</h3><div class="kw-connections"><a href="#/chapter/01"><b>${text("状态、动作、奖励", "State, action, reward")}</b><span>${text("把一步操作写成 transition → 第 01 章", "Write one operation as a transition → Chapter 01")}</span></a><a href="#/chapter/07"><b>${text("为什么要自举", "Why bootstrap?")}</b><span>${text("过程还会继续，窗口却结束 → 第 07 章", "The process continues after the window ends → Chapter 07")}</span></a><a href="#/chapter/21"><b>${text("迟滞与部分可观测", "Delay and partial observability")}</b><span>${text("当前观测不等于完整状态 → 第 21 章", "The current observation is not the full state → Chapter 21")}</span></a><a href="#/chapter/24"><b>${text("约束与五层门控", "Constraints and five gate layers")}</b><span>${text("奖励与质量/氧成本分开 → 第 24 章", "Separate reward from quality/oxygen costs → Chapter 24")}</span></a><a href="#/lab/td"><b>MC / TD / n-step</b><span>${text("拆开“奖励到来晚”和“价值估计”", "Distinguish delayed rewards from value estimation")}</span></a><a href="#/lab/safety"><b>${text("五层安全门实验", "Five-layer gate laboratory")}</b><span>${text("独立触发各层拒绝，检查回退", "Trigger each rejection layer and inspect fallback")}</span></a></div><p class="kw-small">${text("这里未训练 RL 策略，也未完成 Operator 或 PG-MOEA/D-IEpsilon 的正式比较。真实策略评估仍需按项目协议做历史回放、多种子与基线实验。", "No RL policy has been trained here, and no formal comparison with Operator or PG-MOEA/D-IEpsilon has been completed. Actual policy evaluation still requires historical replay, multiple seeds, and baseline experiments under the project protocol. ")}<a href="#/labs">${text("返回全部 14 个基础实验", "Return to all 14 foundation laboratories")}</a>${text("。全部教学系数与时间对齐说明见仓库 ", ". Teaching coefficients and time-alignment details are documented in the repository at ")}<code>docs/kiln-workbench.md</code>${text("。", ". ")}</p></footer>
  </section>`;
  const zone = (name: string): HTMLElement => host.querySelector<HTMLElement>(`[data-zone="${name}"]`)!;
  const field = <T extends HTMLInputElement | HTMLSelectElement = HTMLInputElement>(name: string): T => host.querySelector<T>(`[data-field="${name}"]`)!;

  function renderStage(): void {
    const stage = STAGES.find(s => s.id === selectedStage)!;
    host.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.stage === selectedStage)));
    zone('stage').innerHTML = `<div><span class="kw-caption">${text("可观测", "Observable")}</span><p>${stage.observed}</p></div><div><span class="kw-caption">${text("隐藏过程", "Hidden process")}</span><p>${stage.hidden}</p></div><div><span class="kw-caption">${text("上层与下层", "Supervisory and inner control")}</span><p>${stage.action}</p></div><p class="kw-stage-lesson">${stage.lesson}</p>`;
  }
  function renderControls(): void {
    const proposed = actionForMode(state, mode, manual);
    CV.forEach((cv, i) => {
      host.querySelector<HTMLOutputElement>(`[data-value="a${i}"]`)!.value = signed(proposed[i]!, 2);
      host.querySelector<HTMLElement>(`[data-value="delta${i}"]`)!.textContent = `${text("候选 ΔSP ", "Requested ΔSP ")}${signed(proposed[i]! * RATE[i]!, 2)} ${cv.unit}${text(" / 5 分钟；SP 范围 ", " / 5 min; SP range ")}${SP_LOW[i]}～${SP_HIGH[i]} ${cv.unit}`;
      field(`a${i}`).value = String(proposed[i]!);
      field(`a${i}`).setAttribute('aria-valuetext', `${fmt(proposed[i]!)}${text("，对应 ", ", corresponding to a ")}${signed(proposed[i]! * RATE[i]!)} ${cv.unit}${text(" 设定值增量", " setpoint increment")}`);
      field(`a${i}`).disabled = mode !== 'manual' || state.truncated;
    });
    zone('mode').innerHTML = mode === 'feedback' ? text('明确的教学规则：用当前软测量与目标差提出小幅 T꜀ 增量；T₂ 和 P 缓慢回到初始 SP。<b>不读真实质量，也没有学习或训练。</b>', "Explicit teaching rule: propose a small T꜀ increment from the current soft estimate’s deviation from its target; return T₂ and P slowly toward their initial SPs. <b>No access to true quality, and no learning or training.</b>") : mode === 'hold' ? text('候选一直为 [0, 0, 0]。保持的是设定值；实际测量仍有跟踪误差、扰动和延迟响应。', "The candidate remains [0, 0, 0]. Setpoints are held; measurements still have tracking errors, disturbances, and delayed responses.") : text('滑块只改变尚未执行的候选。实际是否执行，由下面的五层门控共同决定。', "Sliders only change the unexecuted candidate. All five gate layers determine whether it is actually executed.");
    const gate = checkKilnGates(state, proposed);
    const englishReasons = [
      'All 13 observation values and 3 candidate values must be finite',
      'O₂ ≥ 1.2%; PV within the displayed core state ranges',
      `3D PV subspace max |z| = ${fmt(gate.maxZ)}; required ≤ 4.0`,
      `max |a − previous executed a| = ${fmt(gate.actionChange)}; required ≤ 1.5 and a∈[−1,1]`,
      state.scenario === 'no-apc' ? 'Simulated APC authorization is disabled' : 'APC authorized; each candidate SP must remain within the project limits',
    ];
    zone('candidate').innerHTML = `<span>${text("候选 SP（尚未下发）", "Candidate SP (not yet issued)")}</span><strong>${CV.map((c, i) => `${c.short} ${fmt(gate.candidateSetpoints[i]!)} ${c.unit}`).join(' · ')}</strong><small>${text("当前 SP + [2, 5, 5] ⊙ ", "Current SP + [2, 5, 5] ⊙ ")}${vec(proposed)}</small>`;
    zone('gates').innerHTML = `<ol class="kw-gates">${GATES.map((name, i) => `<li data-gate-state="${gate.checks[i]}"><span class="kw-gate-indicator" aria-hidden="true">${gate.checks[i] === 'pass' ? '✓' : gate.checks[i] === 'fail' ? '×' : '·'}</span><div><strong>Gate ${i + 1} · ${name}<small>${gate.checks[i] === 'pass' ? text('通过', "Passed") : gate.checks[i] === 'fail' ? text('拒绝', "Rejected") : text('未检查', "Not checked")}</small></strong><p>${text(gate.reasons[i]!, englishReasons[i]!)}</p></div></li>`).join('')}</ol><div class="kw-gate-result ${gate.failed ? 'is-rejected' : ''}">${gate.failed ? `${text("候选被 Gate ", "Candidate rejected at Gate ")}${gate.failed}${text(" 拒绝 → 实际 ΔSP = 0", " → executed ΔSP = 0")}` : text('五层通过 → 可以执行候选增量', "Five layers passed → candidate increment may execute")}</div><p class="kw-small">${text("项目示例阈值：状态范围为 [SP 下界 − 20, SP 上界 + 20]；OOD 本页只演示 3 维 PV 子空间，μ = [880, 1100, −80]，σ = [5, 15, 10] 为教学假设。门控通过不保证延迟质量必然合格。", "Project example limits: state range [SP lower bound − 20, SP upper bound + 20]. This page’s OOD check uses only the 3D PV subspace; μ=[880,1100,−80] and σ=[5,15,10] are teaching assumptions. Passing the gate does not guarantee acceptable delayed quality.")}</p>`;
    host.querySelectorAll<HTMLButtonElement>('[data-action="one"],[data-action="twelve"],[data-action="pulse"],[data-action="compare"]').forEach(el => { el.disabled = state.truncated; });
    const pulse = host.querySelector<HTMLButtonElement>('[data-action="pulse"]')!;
    pulse.disabled = state.truncated || mode !== 'manual';
  }
  function renderObserved(): void {
    const obs = observeKiln(state);
    zone('observations').innerHTML = `<div class="kw-metrics">${CV.map((c, i) => card(`${c.name} · PV`, `${fmt(obs.pv[i]!, 2)} <em>${c.unit}</em>`, `${text("当前 SP ", "Current SP ")}${fmt(obs.setpoints[i]!)} ${c.unit}${text(" · 偏差 ", " · deviation ")}${signed(obs.pv[i]! - obs.setpoints[i]!)}`)).join('')}${card(text('煤耗 F · 教学代理', "Coal use F · teaching proxy"), `${fmt(obs.coal, 3)} <em>kg/t</em>`, text('标准化参考 134；尺度 4', "Normalization reference 134; scale 4"))}${card(text('电耗 E · 教学代理', "Electricity use E · teaching proxy"), `${fmt(obs.electric, 3)} <em>kWh/t</em>`, text('标准化参考 25；尺度 1', "Normalization reference 25; scale 1"))}${card(text('氧含量 O₂', "Oxygen O₂"), `${fmt(obs.oxygen, 3)} <em>%</em>`, text('项目状态门阈值 ≥ 1.2%', "Project state-gate threshold ≥ 1.2%"))}</div><div class="kw-quality-cards">${card(text('最新已发布化验 · 可以使用', "Latest published assay · available"), `${fmt(obs.lab.value, 3)} <em>% f-CaO</em>`, `${text("采样 ", "Sampled ")}${time(obs.lab.sampleStep)}${text(" · 发布 ", " · published ")}${time(obs.lab.releaseStep)}<br>${text("样品年龄 ", "Sample age ")}${obs.labAgeMinutes}${text(" 分钟（", " min (")}${fmt(obs.labAgeMinutes / 60, 2)}${text(" 小时）", " h)")}`)}${card(text('即时软测量 · 不是实测化验', "Current soft estimate · not a measured assay"), `${fmt(obs.softQuality, 3)} <em>% f-CaO</em>`, `${text("根据当前 PV 和 KH = ", "Teaching estimate using current PV and KH = ")}${fmt(obs.kh, 4)}${text(" 的教学估算", "")}<br>${text("可能有偏差，不能替代质量测量", "May be biased; does not replace quality measurement")}`)}</div>`;
    const labels = ['T꜀', 'T₂', 'P', 'T꜀ˢᵖ', 'T₂ˢᵖ', 'Pˢᵖ', 'coal', 'elec', 'O₂', 'KH', 'lab_fcao', text('lab_age（小时）', "lab_age (hours)"), 'soft_fcao'];
    zone('vector').innerHTML = dataTable([text('索引', "Index"), text('输入', "Input"), text('此刻可用值', "Currently available value")], labels.map((l, i) => [String(i), l, fmt(obs.vector[i]!, i === 9 ? 4 : 3)]));
    zone('hidden').innerHTML = `<div class="kw-quality-cards">${card(text('模拟蓄热 H · 隐藏', "Simulated stored heat H · hidden"), `${fmt(state.thermal, 3)} <em>°C</em>`, text('有自身记忆，不能用当前 T꜀ 完整替代', "Has memory; current T꜀ cannot fully represent it"))}${card(text('即时真实 f-CaO · 隐藏', "Current true f-CaO · hidden"), `${fmt(state.trueQuality, 4)} <em>%</em>`, text('只用于生成延迟样品与教学质量成本', "Used only for delayed samples and teaching quality costs"))}</div>${dataTable([text('采样时刻', "Sampling time"), text('预计发布时刻', "Scheduled publication"), text('隐藏样品值', "Hidden sample value"), text('输入策略？', "Policy input?")], state.pendingAssays.map(l => [time(l.sampleStep), time(l.releaseStep), `${fmt(l.value, 4)}%`, text('否：尚未发布', "No: not yet published")]))}<p class="kw-small">${text("初始历史化验人为设为 1.10%，采样时刻为 −60 分钟、在 0 分钟已发布。另一个 0 分钟样品在 60 分钟发布；这只是用于建立可解释起点的初始化。", "The initial historical assay is set to 1.10%, sampled at −60 minutes and already published at 0. A second sample taken at 0 is published at 60 minutes. This initialization provides an interpretable starting point.")}</p>`;
  }
  function renderCharts(): void {
    const h = state.history;
    const cv = CV[selectedCV]!;
    zone('pv-chart').innerHTML = trend([{ label: text('实际 PV', "Actual PV"), values: h.map(p => p.pv[selectedCV]!), color: cv.color }, { label: text('已执行 SP', "Executed SP"), values: h.map(p => p.setpoints[selectedCV]!), color: 'var(--kw-orange)', dashed: true, stairs: true }], `${cv.name}${text("：SP 是阶梯目标，PV 按一阶动态逐步追踪。", ": SP is a stepwise target; PV follows first-order tracking dynamics.")}`, cv.unit, 0, state.step * STEP_MINUTES);
    zone('reward-chart').innerHTML = state.step ? trend([{ label: text('奖励 r', "Reward r"), values: h.slice(1).map(p => p.reward), color: 'var(--kw-green)' }], text('奖励越高表示这个教学加权能耗/动作目标更好；不是约束合格证。', "Higher reward means a better score for this teaching energy/action objective, not a certificate of constraint satisfaction."), text('无量纲奖励', "Dimensionless reward"), STEP_MINUTES, state.step * STEP_MINUTES) : text('<div class="kw-empty-chart">执行后显示奖励曲线。<br>起点还没有 transition，也就没有本步奖励。</div>', "<div class=\"kw-empty-chart\">The reward curve appears after execution.<br>There is no transition or step reward at the starting point.</div>");
    const p = state.lastTransition?.rewardParts;
    const c = state.lastTransition?.costs;
    zone('reward-breakdown').innerHTML = `<div class="kw-mini-metrics">${card(text('最新能耗项', "Latest energy term"), p ? fmt(p.energyTerm, 4) : '—')}${card(text('最新动作平滑项', "Latest action-smoothness term"), p ? fmt(p.smoothTerm, 4) : '—')}${card(text('质量成本 cᵩ · 独立', "Quality cost cᵩ · separate"), c ? fmt(c.quality, 4) : '—')}${card(text('氧成本 cO₂ · 独立', "Oxygen cost cO₂ · separate"), c ? fmt(c.oxygen, 4) : '—')}</div><p class="kw-small">${text("两项成本单位为超限的百分点。质量成本用模拟真值评价，不是观测到的新化验；成本没有从奖励中相减。", "Both costs measure violation magnitude in percentage points. Quality cost uses simulator truth, not a newly observed assay. Neither cost is subtracted from the reward.")}</p>`;
    const quality: TrendSeries[] = [{ label: text('即时软测量', "Current soft estimate"), values: h.map(p => p.softQuality), color: 'var(--kw-blue)' }, { label: text('最新可用化验', "Latest available assay"), values: h.map(p => p.lab.value), color: 'var(--kw-orange)', stairs: true }];
    if (showTruth) quality.push({ label: text('教学真值（策略不可见）', "Teaching truth (hidden from the policy)"), values: h.map(p => p.trueQuality), color: 'var(--kw-green)', dashed: true });
    quality.push({ label: text('项目范围 0.5～1.5%', "Project range 0.5–1.5%"), values: h.map(() => 1.5), color: '#9a8b7b', dashed: true }, { label: text('项目下界 0.5%', "Project lower bound 0.5%"), values: h.map(() => .5), color: '#b7ac9f', dashed: true });
    const qvalues = quality.flatMap(q => q.values);
    zone('quality-chart').innerHTML = trend(quality, text('橙色阶梯只在化验发布时间更新；蓝色软测量每步更新。插值线用于阅读趋势，不表示连续测到了真实质量。', "The orange steps update only when an assay is published; the blue soft estimate updates every step. Connecting lines show trends, not continuous measurements of true quality."), 'f-CaO / %', 0, state.step * STEP_MINUTES, [Math.min(.35, ...qvalues) - .03, Math.max(1.65, ...qvalues) + .03]);
    const next = state.pendingAssays[0];
    zone('assay-timeline').innerHTML = `<div><span>${text("最近已发布", "Latest published result")}</span><b>${time(state.latestAssay.sampleStep)}${text(" 采样 → ", " sampled → ")}${time(state.latestAssay.releaseStep)}${text(" 发布", " published")}</b></div><div><span>${text("正在等待", "Waiting for release")}</span><b>${next ? `${time(next.sampleStep)}${text(" 采样 → ", " sampled → ")}${time(next.releaseStep)}${text(" 才可用", " available")}` : text('没有待发布样品', "No pending sample")}</b></div><div><span>${text("分辨三个时间", "Distinguish three intervals")}</span><b>${text("每 60 分钟采样 · 发布再延后 60 分钟 · 每步推进 5 分钟", "Sample every 60 min · Publish 60 min later · Advance 5 min per step")}</b></div>`;
    zone('calculation').innerHTML = calculation(state);
  }
  function renderComparison(): void {
    if (!comparison) {
      zone('comparison').innerHTML = text('<p class="kw-small">保持、保守反馈和重复当前手动增量，是三条教学基线。点击后判断“奖励更高”是否同时满足质量与氧含量约束。任何主轨迹或动作变化后，需要重新对照。</p>', "<p class=\"kw-small\">Hold, conservative feedback, and the repeated manual increment are three teaching baselines. Check whether higher reward also respects quality and oxygen constraints. Recompute the comparison after changing the main trajectory or action.</p>");
      return;
    }
    const n = comparison[0]!.points.length;
    const branchTitle = (branch: BranchComparison): string => text(branch.title, branch.mode === 'manual' ? 'Current manual increment (repeated)' : MODE_NAMES[branch.mode]);
    zone('comparison').innerHTML = `<p class="kw-small">${text("从 ", "Branch from ")}${time(comparisonFrom)}${text(" 分叉，推演 ", " for ")}${n}${text(" 步。手动分支每一步都提出 ", " steps. The manual branch requests ")}${vec(manual)}${text("，保守反馈每步重算候选；三条分支都必须过同样的安全门。", " at every step; feedback recalculates its candidate each step. All three branches pass through the same gate.")}</p>${dataTable([text('教学候选方式', "Teaching candidate method"), text('平均煤耗 kg/t', "Mean coal kg/t"), text('平均电耗 kWh/t', "Mean electricity kWh/t"), text('累计奖励', "Total reward"), text('累计质量成本', "Total quality cost"), text('累计氧成本', "Total oxygen cost"), text('拒绝次数', "Rejections")], comparison.map(b => [branchTitle(b), fmt(b.meanCoal, 3), fmt(b.meanElectric, 3), fmt(b.totalReward, 3), fmt(b.qualityCost, 3), fmt(b.oxygenCost, 3), `${b.blocked} / ${n}`]))}${trend(comparison.map((b, i) => ({ label: branchTitle(b), values: b.points.map(p => p.lab.value), color: ['var(--muted)', 'var(--kw-green)', 'var(--kw-orange)'][i]!, stairs: true })), text('对照分支中实际可用的化验。短窗口内曲线重合，可能只是新工况样品尚未发布，不等于质量没有变化。', "Assays actually available in the comparison branches. Overlapping curves over a short window may simply mean that samples from the new conditions have not been published, not that quality is unchanged."), text('已发布 f-CaO / %', "Published f-CaO / %"), (comparisonFrom + 1) * STEP_MINUTES, (comparisonFrom + n) * STEP_MINUTES)}<div class="kw-comparison-note"><strong>${text("怎么读这个比较？", "How should you read this comparison?")}</strong><p>${text("先检查成本与门控，再看加权奖励和两个原始能耗指标。这里没有从三条结果中替你宣判“最佳真实操作”；参数来自教学假设，不能解释为现场节能效果或已完成正式项目基线验证。", "Inspect costs and gate outcomes first, then weighted reward and both raw energy metrics. These three results do not determine the best real operating action. Parameters are teaching assumptions, not evidence of plant savings or completed project-baseline validation.")}</p></div>`;
  }
  function render(): void {
    renderControls();
    renderObserved();
    renderCharts();
    renderComparison();
    zone('clock').innerHTML = `<b>${state.step * STEP_MINUTES}<small>${text(" 分钟", " min")}</small></b><span>${text("第 ", "Step ")}${state.step} / ${MAX_STEPS}${text(" 步", "")}</span>`;
    zone('scenario').textContent = scenarios.find(s => s.id === state.scenario)!.description;
    zone('status').textContent = message;
    zone('horizon').innerHTML = state.truncated ? text('<div class="kw-horizon"><strong>教学窗口已满：6 小时 / 72 步</strong><p>这里是 truncated = true、terminated = false。物理过程仍会继续，只是本次记录到此结束；价值目标仍应保留 γV(s′) 自举项。需要继续实验时，请重置情景。</p></div>', "<div class=\"kw-horizon\"><strong>Teaching window complete: 6 hours / 72 steps</strong><p>Here truncated = true and terminated = false. The physical process continues; only this recording window ends. The value target should retain the γV(s′) bootstrap term. Reset the scenario to start another experiment.</p></div>") : '';
  }
  function reset(): void {
    const raw = Number(field('seed').value);
    const seed = Math.min(999999, Math.max(0, Number.isFinite(raw) ? Math.trunc(raw) : 42));
    field('seed').value = String(seed);
    state = createKiln(seed, field<HTMLSelectElement>('scenario').value as Scenario);
    comparison = null;
    message = `${text("已重置为「", "Reset to “")}${scenarios.find(s => s.id === state.scenario)!.title}${text("」，种子 ", "”, seed ")}${seed}${text("。尚未执行候选。", ". No candidate has been executed yet.")}`;
    render();
  }
  const onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const name = input.dataset.field;
    if (!name) return;
    if (name.startsWith('a') && /^a[0-2]$/.test(name)) {
      const next = [...manual] as [number, number, number];
      next[Number(name[1])] = Number(input.value);
      manual = next;
      comparison = null;
      renderControls();
      renderComparison();
    } else if (name === 'mode') {
      mode = input.value as ActionMode;
      comparison = null;
      renderControls();
      renderComparison();
    } else if (name === 'cv') {
      selectedCV = Number(input.value);
      renderCharts();
    } else if (name === 'truth') {
      showTruth = input.checked;
      renderCharts();
    }
  };
  const onChange = (event: Event): void => {
    if ((event.target as HTMLElement).dataset.field === 'scenario') reset();
  };
  const onClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button || !host.contains(button) || button.disabled) return;
    if (button.dataset.stage) { selectedStage = button.dataset.stage; renderStage(); return; }
    if (button.dataset.predict) {
      const answers: Record<string, string> = {
        instant: text('SP 会立刻改成 882°C，PV 不会。本模型第一步跟踪项为 0.28 × (882 − 880) = 0.56°C，再叠加小随机扰动。', "SP changes immediately to 882°C, but PV does not. This model’s first-step tracking term is 0.28 × (882 − 880) = 0.56°C, plus a small random disturbance."),
        tracking: text('这个判断符合模型：PV 的跟踪项是 0.56°C，不是完整的 2°C。热惯性与物料移动继续延后质量响应，化验还要等发布。', "This agrees with the model: the PV tracking term is 0.56°C, not the full 2°C. Heat storage and material transport further delay quality, and the assay must still wait for publication."),
        lab: text('最新化验来自较早采样的物料。本次动作不会改写旧样品；只有到了新的发布时间，观测中的 lab_fcao 才更新。', "The latest assay represents material sampled earlier. This action cannot rewrite an old sample. lab_fcao in the observation changes only at the next publication time."),
      };
      zone('prediction').textContent = answers[button.dataset.predict]!;
      host.querySelectorAll<HTMLButtonElement>('[data-predict]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      return;
    }
    const action = button.dataset.action;
    if (action === 'reset') { reset(); return; }
    if (action === 'compare' && !state.truncated) {
      comparisonFrom = state.step;
      comparison = compareKilnBranches(state, 12, manual);
      renderComparison();
      zone('status').textContent = `${text("已从 ", "From ")}${time(state.step)}${text(" 比较未来 ", ", compared the next ")}${comparison[0]!.points.length}${text(" 步。主轨迹时间没有改变，结果在本页“同一个起点”区域。", " steps. The main trajectory has not advanced; results appear in the same-starting-point comparison section.")}`;
      return;
    }
    if (state.truncated || !['one', 'twelve', 'pulse'].includes(action ?? '')) return;
    const before = state.step;
    if (action === 'pulse') {
      state = stepKiln(state, manual);
      state = advanceKiln(state, 11, 'hold', [0, 0, 0]);
    } else state = advanceKiln(state, action === 'one' ? 1 : 12, mode, manual);
    comparison = null;
    const added = state.history.slice(before + 1);
    const rejects = added.filter(p => p.gateFailed !== null).length;
    const released = state.publishedAssays.filter(l => l.releaseStep > before && l.releaseStep <= state.step).length;
    message = `${action === 'pulse' ? text('单次手动脉冲后保持', "Single manual pulse, then hold") : MODE_NAMES[mode]}${text("：已从 ", ": advanced from ")}${time(before)}${text(" 推进到 ", " to ")}${time(state.step)}${text("；", "; ")}${rejects ? `${rejects}${text(" 步候选被拒绝并保持 SP", " steps rejected the candidate and held SP")}` : `${added.length}${text(" 步候选通过门控", " steps passed the gate")}`}${text("；", "; ")}${text(`${released} 份新化验发布。`, `${released} new assay${released === 1 ? '' : 's'} published. `)}${action === 'pulse' ? text('展开计算显示最后一步；图上的 SP 阶梯保留了第一次动作。', "The expanded calculation shows the last step; the SP plot retains the first action’s step change.") : ''}`;
    render();
  };
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('click', onClick);
  renderStage();
  render();
  return () => { host.removeEventListener('input', onInput); host.removeEventListener('change', onChange); host.removeEventListener('click', onClick); };
}
