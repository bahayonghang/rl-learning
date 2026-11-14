import { fmt } from '../labs/ui';
import {
  MAX_STEPS, STEP_MINUTES, RATE, SP_LOW, SP_HIGH, TRACKING, SCENARIOS,
  createKiln, observeKiln, checkKilnGates, actionForMode, advanceKiln, stepKiln, compareKilnBranches,
  type Vec3, type Scenario, type ActionMode, type KilnState, type BranchComparison,
} from './math';
import './kiln.css';

const CV = [
  { short: 'T꜀', name: '分解炉出口温度 T꜀', unit: '°C', color: 'var(--kw-green)' },
  { short: 'T₂', name: '二次风温 T₂', unit: '°C', color: 'var(--kw-orange)' },
  { short: 'P', name: '窑头压力 P', unit: 'Pa', color: 'var(--kw-blue)' },
];
const GATES = ['数据有效', '当前状态', '模型适用域', '动作可行', '执行保护'];
const MODE_NAMES: Record<ActionMode, string> = { manual: '手动候选增量', hold: '保持当前设定值', feedback: '保守反馈规则' };
const STAGES = [
  { id: 'preheater', title: '01 · 预热器', subtitle: '生料与热烟气换热', icon: '<path d="M18 9h20l-2 15-8 7-8-7ZM21 33h20l-2 15-8 7-8-7M12 17H5v29h11M38 14h12v31h-8"/>', observed: '本工作台用原料 KH 表示一种可测原料性质；真实工况还会使用喂料量、烟气温度等历史信号。', hidden: '颗粒内部温度、物料在设备中的实际停留分布，没有被这 13 个数完整测到。', action: '这里没有单独的动作滑块。原料变化是外部扰动，不能把已经测到的 KH 当成智能体可以直接操纵的动作。', lesson: '先问“我看见了什么”。可测原料变化先出现，最终熟料质量会晚一些响应。' },
  { id: 'calciner', title: '02 · 分解炉', subtitle: '热量进入，碳酸盐分解', icon: '<path d="M22 8h17v9l7 9v18l-12 12-12-12V26l6-9V8M9 33h13M46 34h11"/><path d="M32 43c-9-6 0-10 0-16 8 6 10 12 0 16Z"/>', observed: '分解炉出口温度 T꜀ 是实际测量 PV；T꜀ˢᵖ 是当前要求下层追踪的设定值。O₂ 提供燃烧状态信息。', hidden: '炉内蓄热、各位置的温度分布和物料反应程度无法由一个出口温度完全代表。', action: '候选 a꜀ 乘 2°C，得到每 5 分钟的设定值增量。下层 PID/APC 再调煤量等执行量；上层动作不是直接开关煤阀。', lesson: '在稳定工况把 a꜀ 设为 +1，点“单次脉冲”。先看 SP，再看 PV，最后等待化验。' },
  { id: 'rotary', title: '03 · 回转窑', subtitle: '物料移动与熟料形成', icon: '<path d="m9 29 40-14 8 22-40 14ZM14 28l8 22M44 18l8 22M22 49l-3 7h12M44 41l-3 7h12"/>', observed: '本简化界面展示窑头压力 P、O₂ 和延迟发布的熟料 f-CaO 化验。温度代理影响物料的热历史。', hidden: '当前物料批次的完整热历史和即时真实 f-CaO 不可在线直接获知。教学真值只供解释与评价。', action: 'aP 乘 5Pa 改变压力设定值，由下层风机/风门等回路追踪。T꜀ 和二次风温的影响经蓄热、物料移动后才反映到质量。', lesson: '即时奖励可以变化，而质量仍在响应旧工况。别把“现在拿到的化验”误读为“现在生产的样品”。' },
  { id: 'cooler', title: '04 · 冷却机', subtitle: '冷却熟料并回收热量', icon: '<path d="M8 22h46v18H8ZM12 32h38M18 45v11M30 45v11M42 45v11M18 55l-4-5m4 5 4-5M30 55l-4-5m4 5 4-5M42 55l-4-5m4 5 4-5M32 20V8l-5 5m5-5 5 5"/>', observed: '二次风温 T₂ 是本工作台的第三个温度/压力通道之一；煤耗与电耗是运行指标，不能只用一个温度代替。', hidden: '熟料内部温度、料层分布和换热效率没有在教学状态中逐项建模。', action: 'a₂ 乘 5°C 调整上层二次风温目标。这里用一阶跟踪代理代替复杂的冷却风和料层耦合，不代表真实装置可独立瞬时调温。', lesson: '同时看煤耗和电耗：同一个设定值方向，在这个教学模型中可能让两项指标向不同方向变化。' },
];
const escape = (s: string): string => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const time = (step: number): string => `${step * STEP_MINUTES} 分钟`;
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
  return `<figure class="kw-trend"><div class="kw-svg-scroll"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(label)}"><title>${escape(label)}</title>${ticks}${paths}${timeTicks}<text x="${left}" y="14">${escape(unit)}</text><text x="${w - right}" y="${h - 2}" text-anchor="end">仿真时间 / 分钟</text></svg></div><div class="kw-legend">${series.map(s => `<span><i style="--series:${s.color}" class="${s.dashed ? 'dashed' : ''}"></i>${escape(s.label)}</span>`).join('')}</div><figcaption>${escape(label)}</figcaption></figure>`;
}

function calculation(state: KilnState): string {
  const t = state.lastTransition;
  if (!t) return '<p>执行一步后，这里会展开刚刚发生的数值计算。起点的奖励显示“尚未执行”，不是一条虚构奖励。</p>';
  const p = t.rewardParts;
  return `<p class="kw-small">时间：${time(t.before.step)} → ${time(state.step)}。所有值来自这次真实计算；显示值作了四舍五入。</p>
  <ol class="kw-calculation">
    <li><strong>提出候选，先过门控</strong><p>a<sub>候选</sub> = ${vec(t.proposed)}。${t.gate.failed ? `Gate ${t.gate.failed} 拒绝，实际增量 a = [0, 0, 0]。` : '五层通过，实际增量等于候选。'}上次实际增量 = ${vec(t.previousExecuted)}。</p></li>
    <li><strong>归一化动作 → 物理设定值</strong><p>ΔSP = a ⊙ [2°C, 5°C, 5Pa] = ${vec(t.physicalIncrement)}。SP<sub>新</sub> = ${vec(t.before.setpoints)} + ΔSP = ${vec(state.setpoints)}。三个分量的单位不同。</p></li>
    <li><strong>下层代理逐步追踪，PV 不会瞬移到 SP</strong>${dataTable(['通道', '旧 PV + 跟踪项 + 扰动', '新 PV'], CV.map((cv, i) => [cv.short, `${fmt(t.before.pv[i]!)} + ${fmt(TRACKING[i]!)} × (${fmt(state.setpoints[i]!)} − ${fmt(t.before.pv[i]!)}) ${signed(t.disturbances[i]!)}`, `${fmt(state.pv[i]!)} ${cv.unit}`]))}<p>煤耗/电耗再由新 PV 与原料计算；它们不是把动作直接改名得到的量。热量进入隐藏蓄热变量，再经 6 步物料队列影响质量。</p></li>
    <li><strong>运行指标归一化，奖励单独计算</strong><p>z<sub>煤</sub> = (${fmt(state.coal, 3)} − 134) / 4 = ${fmt(p.coalZ, 4)}；z<sub>电</sub> = (${fmt(state.electric, 3)} − 25) / 1 = ${fmt(p.electricZ, 4)}。</p><p>能耗项 = −0.6 z<sub>煤</sub> − 0.4 z<sub>电</sub> = ${fmt(p.energyTerm, 4)}。</p><p>平滑项 = −0.05 (‖a‖² + ‖a − a<sub>上次实际</sub>‖²) = −0.05 × (${fmt(p.actionSquare, 4)} + ${fmt(p.changeSquare, 4)}) = ${fmt(p.smoothTerm, 4)}。</p><p class="kw-formula">奖励 r = ${fmt(p.energyTerm, 4)} + (${fmt(p.smoothTerm, 4)}) = <strong>${fmt(p.reward, 4)}</strong></p></li>
    <li><strong>约束成本另列，不放进上式</strong><p>c<sub>q</sub> = max(0, 0.5 − q) + max(0, q − 1.5) = ${fmt(t.costs.quality, 4)}；c<sub>O₂</sub> = max(0, 1.2 − ${fmt(state.oxygen, 4)}) = ${fmt(t.costs.oxygen, 4)}。质量成本使用模拟器真值，只供教学评价，不进入策略的 13 维输入。</p></li>
    <li><strong>发布新的观测，只纳入已到达的化验</strong><p>${t.sampled ? `本步采样，预计在 ${time(t.sampled.releaseStep)} 发布；当前还不能使用其结果。` : '本步不是新的采样时点。'}${t.published.length ? `本步发布了 ${t.published.map(l => `${time(l.sampleStep)} 采样的结果 ${fmt(l.value, 3)}%`).join('、')}。` : '本步没有化验发布，沿用最近已发布结果，样品年龄继续增加。'}</p></li>
  </ol>`;
}

/** Isolated teaching simulation. No network, actuator access, timers, or policy training. */
export function mountKilnWorkbench(host: HTMLElement): () => void {
  let state = createKiln();
  let mode: ActionMode = 'manual';
  let manual: Vec3 = [1, 0, 0];
  let selectedStage = 'calciner';
  let selectedCV = 0;
  let showTruth = false;
  let comparison: BranchComparison[] | null = null;
  let comparisonFrom = 0;
  let message = '建议从一次 T꜀ 设定值脉冲开始。先预测，再执行，然后等待数据到来。';
  host.innerHTML = `<section class="kiln-workbench" aria-label="水泥烧成互动工作台">
    <header class="kw-opening"><span class="kw-eyebrow">浏览器教学模拟 · 5 分钟一步</span><h2>让一个设定值，走完一段烧成过程</h2><p>你站在上层决策的位置：看观测，提一个小增量，让下层回路追踪，再等待热过程与化验。这里的反馈规则没有经过强化学习训练。</p><div class="kw-contract">项目约定：动作范围、速率、门控阈值与 13 维输入。<br>教学假设：一阶动态、噪声、能耗系数与固定时滞。页面不连接真实设备。</div></header>
    <section class="kw-section" aria-labelledby="kw-process-title"><div class="kw-heading"><span class="kw-step">01</span><div><h3 id="kw-process-title">先找到动作落在哪里</h3><p>按物料方向选择一个部位，区分看得见的量、隐藏过程和下层执行。</p></div></div><div class="kw-process">${STAGES.map(s => `<button type="button" data-stage="${s.id}" aria-pressed="${s.id === selectedStage}" class="kw-stage"><svg viewBox="0 0 64 64" aria-hidden="true">${s.icon}</svg><strong>${s.title}</strong><span>${s.subtitle}</span></button>`).join('')}</div><div data-zone="stage" class="kw-stage-detail"></div><div class="kw-control-chain"><span>上层候选 <b>ΔSP</b></span><span aria-hidden="true">→</span><span>五层安全门</span><span aria-hidden="true">→</span><span>下层 PID / APC</span><span aria-hidden="true">→</span><span>过程测量 <b>PV</b></span></div><p class="kw-small">煤阀、风机等操纵量 MV 属于下层控制。这里展示 SP → PV 的代理关系，没有把温度设定值当成直接执行量。</p></section>
    <section class="kw-section" aria-labelledby="kw-scenario-title"><div class="kw-heading"><span class="kw-step">02</span><div><h3 id="kw-scenario-title">选一个可以解释的实验</h3><p>相同种子与相同步数使用相同外部随机扰动，便于重做和对照。</p></div></div><div class="kw-scenario-row"><label for="kw-scenario"><span>初始情景</span><select id="kw-scenario" data-field="scenario">${SCENARIOS.map(s => `<option value="${s.id}">${s.title}</option>`).join('')}</select></label><label for="kw-seed"><span>重置时使用的种子</span><input id="kw-seed" data-field="seed" type="number" min="0" max="999999" step="1" value="42" inputmode="numeric"/></label><button type="button" class="kw-button kw-secondary" data-action="reset">重置这个情景</button></div><p data-zone="scenario" class="kw-small"></p><div class="kw-checkpoint"><strong>先做一个预测</strong><p>稳定工况下，T꜀ 的 SP 从 880°C 调到 882°C。5 分钟后的 PV 会怎样？</p><div class="kw-answer-options"><button type="button" data-predict="instant">立刻等于 882°C</button><button type="button" data-predict="tracking">先上升约 0.56°C，另有小扰动</button><button type="button" data-predict="lab">最新化验也立刻反映这次动作</button></div><p data-zone="prediction" aria-live="polite">选一个判断，再用下面的“单次脉冲”验证。</p></div></section>
    <section class="kw-section" aria-labelledby="kw-control-title"><div class="kw-heading"><span class="kw-step">03</span><div><h3 id="kw-control-title">提建议，再让时间向前走</h3><p>动作是每一步的增量。连续 12 步会重复提同样的增量；单次脉冲只改一次，随后保持。</p></div><div data-zone="clock" class="kw-clock"></div></div><div class="kw-work-grid"><div class="kw-control-panel"><label for="kw-mode"><span>候选产生方式</span><select id="kw-mode" data-field="mode"><option value="manual">手动候选增量</option><option value="hold">保持当前设定值</option><option value="feedback">保守反馈规则（未训练）</option></select></label><div class="kw-sliders">${CV.map((c, i) => `<label for="kw-a${i}" class="kw-slider"><span>${c.name}<output data-value="a${i}"></output></span><input id="kw-a${i}" data-field="a${i}" type="range" min="-1" max="1" step="0.1" value="${manual[i]}"/><small data-value="delta${i}"></small></label>`).join('')}</div><p data-zone="mode" class="kw-small"></p><div data-zone="candidate" class="kw-candidate"></div><div class="kw-actions"><button type="button" class="kw-button" data-action="one">执行 1 步 · 5 分钟</button><button type="button" class="kw-button kw-secondary" data-action="twelve">连续执行 12 步</button><button type="button" class="kw-button kw-secondary" data-action="pulse">单次脉冲 + 11 步保持</button></div><p class="kw-small">每次执行都重新过门控。拒绝时只保持 SP；时间、PV、指标与化验仍继续演化。</p></div><div class="kw-gate-panel"><h4>下一步候选的五层预检</h4><p class="kw-small">一票拒绝即执行零增量。通过前层才检查后层；这不是已执行记录。</p><div data-zone="gates"></div></div></div><div class="kw-status" data-zone="status" role="status" aria-live="polite" aria-atomic="true"></div><div data-zone="horizon"></div></section>
    <section class="kw-section" aria-labelledby="kw-observation-title"><div class="kw-heading"><span class="kw-step">04</span><div><h3 id="kw-observation-title">此刻到底知道什么？</h3><p>实际 PV、要求的 SP、即时软测量、已发布化验分别看。样品年龄从采样时刻计，不从发布时间计。</p></div></div><div data-zone="observations"></div><details class="kw-details"><summary>展开策略能拿到的 13 维观测</summary><div data-zone="vector"></div><p class="kw-small">保持 SimpleKilnEnv 的既有顺序。这里不把教学真值、待发布化验值或未来扰动拼进输入；完整工业 POMDP 通常还需要历史窗口。</p></details><details class="kw-details"><summary>教学透视：隐藏状态与排队化验</summary><p class="kw-small">下面是模拟器的解释/评价视角，不属于策略可见输入。真实装置没有一个可以随时读取的“完美质量真值”。</p><div data-zone="hidden"></div></details></section>
    <section class="kw-section" aria-labelledby="kw-trends-title"><div class="kw-heading"><span class="kw-step">05</span><div><h3 id="kw-trends-title">对齐三只时钟</h3><p>设定值更新、过程响应与化验发布发生在不同时间。所有曲线来自本次逐步计算，最多保留 73 个状态点。</p></div></div><div class="kw-chart-grid"><div class="kw-chart-panel"><div class="kw-chart-heading"><h4>设定值与实际测量</h4><label for="kw-cv" class="kw-inline-label"><span class="kw-sr-only">选择绘图通道</span><select id="kw-cv" data-field="cv">${CV.map((c, i) => `<option value="${i}">${c.short} · ${c.unit}</option>`).join('')}</select></label></div><div data-zone="pv-chart"></div></div><div class="kw-chart-panel"><h4>奖励与独立约束成本</h4><div data-zone="reward-chart"></div><div data-zone="reward-breakdown"></div></div></div><div class="kw-chart-panel kw-quality-panel"><div class="kw-chart-heading"><h4>软测量先变，化验稍后到达</h4><label class="kw-check"><input type="checkbox" data-field="truth"/><span>叠加教学真值（仅解释）</span></label></div><div data-zone="quality-chart"></div><div data-zone="assay-timeline" class="kw-assay-timeline"></div></div><details class="kw-details"><summary>把刚刚那一步展开：动作 → SP → PV → 奖励与成本</summary><div data-zone="calculation"></div></details></section>
    <section class="kw-section" aria-labelledby="kw-compare-title"><div class="kw-heading"><span class="kw-step">06</span><div><h3 id="kw-compare-title">同一个起点，比较三种选择</h3><p>从当前隐藏状态、化验队列和同一随机扰动序列分叉。对照不改变上面的主轨迹。</p></div></div><button type="button" class="kw-button kw-secondary" data-action="compare">对照未来 12 步 · 最多 60 分钟</button><div data-zone="comparison"><p class="kw-small">保持、保守反馈和重复当前手动增量，是三条教学基线。点击后再判断“奖励更高”是否同时满足质量与氧含量约束。</p></div></section>
    <footer class="kw-footer"><h3>把这次观察接回强化学习</h3><div class="kw-connections"><a href="#/chapter/01"><b>状态、动作、奖励</b><span>把一步操作写成 transition → 第 01 章</span></a><a href="#/chapter/07"><b>为什么要自举</b><span>过程还会继续，窗口却结束 → 第 07 章</span></a><a href="#/chapter/21"><b>迟滞与部分可观测</b><span>当前观测不等于完整状态 → 第 21 章</span></a><a href="#/chapter/24"><b>约束与五层门控</b><span>奖励与质量/氧成本分开 → 第 24 章</span></a><a href="#/lab/td"><b>MC / TD / n-step</b><span>拆开“奖励到来晚”和“价值估计”</span></a><a href="#/lab/safety"><b>五层安全门实验</b><span>独立触发各层拒绝，检查回退</span></a></div><p class="kw-small">这里未训练 RL 策略，也未完成 Operator 或 PG-MOEA/D-IEpsilon 的正式比较。真实策略评估仍需按项目协议做历史回放、多种子与基线实验。<a href="#/labs">返回全部 14 个基础实验</a>。全部教学系数与时间对齐说明见仓库 <code>docs/kiln-workbench.md</code>。</p></footer>
  </section>`;
  const zone = (name: string): HTMLElement => host.querySelector<HTMLElement>(`[data-zone="${name}"]`)!;
  const field = <T extends HTMLInputElement | HTMLSelectElement = HTMLInputElement>(name: string): T => host.querySelector<T>(`[data-field="${name}"]`)!;

  function renderStage(): void {
    const stage = STAGES.find(s => s.id === selectedStage)!;
    host.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.stage === selectedStage)));
    zone('stage').innerHTML = `<div><span class="kw-caption">可观测</span><p>${stage.observed}</p></div><div><span class="kw-caption">隐藏过程</span><p>${stage.hidden}</p></div><div><span class="kw-caption">上层与下层</span><p>${stage.action}</p></div><p class="kw-stage-lesson">${stage.lesson}</p>`;
  }
  function renderControls(): void {
    const proposed = actionForMode(state, mode, manual);
    CV.forEach((cv, i) => {
      host.querySelector<HTMLOutputElement>(`[data-value="a${i}"]`)!.value = signed(proposed[i]!, 2);
      host.querySelector<HTMLElement>(`[data-value="delta${i}"]`)!.textContent = `候选 ΔSP ${signed(proposed[i]! * RATE[i]!, 2)} ${cv.unit} / 5 分钟；SP 范围 ${SP_LOW[i]}～${SP_HIGH[i]} ${cv.unit}`;
      field(`a${i}`).value = String(proposed[i]!);
      field(`a${i}`).setAttribute('aria-valuetext', `${fmt(proposed[i]!)}，对应 ${signed(proposed[i]! * RATE[i]!)} ${cv.unit} 设定值增量`);
      field(`a${i}`).disabled = mode !== 'manual' || state.truncated;
    });
    zone('mode').innerHTML = mode === 'feedback' ? '明确的教学规则：用当前软测量与目标差提出小幅 T꜀ 增量；T₂ 和 P 缓慢回到初始 SP。<b>不读真实质量，也没有学习或训练。</b>' : mode === 'hold' ? '候选一直为 [0, 0, 0]。保持的是设定值；实际测量仍有跟踪误差、扰动和延迟响应。' : '滑块只改变尚未执行的候选。实际是否执行，由下面的五层门控共同决定。';
    const gate = checkKilnGates(state, proposed);
    zone('candidate').innerHTML = `<span>候选 SP（尚未下发）</span><strong>${CV.map((c, i) => `${c.short} ${fmt(gate.candidateSetpoints[i]!)} ${c.unit}`).join(' · ')}</strong><small>当前 SP + [2, 5, 5] ⊙ ${vec(proposed)}</small>`;
    zone('gates').innerHTML = `<ol class="kw-gates">${GATES.map((name, i) => `<li data-gate-state="${gate.checks[i]}"><span class="kw-gate-indicator" aria-hidden="true">${gate.checks[i] === 'pass' ? '✓' : gate.checks[i] === 'fail' ? '×' : '·'}</span><div><strong>Gate ${i + 1} · ${name}<small>${gate.checks[i] === 'pass' ? '通过' : gate.checks[i] === 'fail' ? '拒绝' : '未检查'}</small></strong><p>${gate.reasons[i]}</p></div></li>`).join('')}</ol><div class="kw-gate-result ${gate.failed ? 'is-rejected' : ''}">${gate.failed ? `候选被 Gate ${gate.failed} 拒绝 → 实际 ΔSP = 0` : '五层通过 → 可以执行候选增量'}</div><p class="kw-small">项目示例阈值：状态范围为 [SP 下界 − 20, SP 上界 + 20]；OOD 本页只演示 3 维 PV 子空间，μ = [880, 1100, −80]，σ = [5, 15, 10] 为教学假设。门控通过不保证延迟质量必然合格。</p>`;
    host.querySelectorAll<HTMLButtonElement>('[data-action="one"],[data-action="twelve"],[data-action="pulse"],[data-action="compare"]').forEach(el => { el.disabled = state.truncated; });
    const pulse = host.querySelector<HTMLButtonElement>('[data-action="pulse"]')!;
    pulse.disabled = state.truncated || mode !== 'manual';
  }
  function renderObserved(): void {
    const obs = observeKiln(state);
    zone('observations').innerHTML = `<div class="kw-metrics">${CV.map((c, i) => card(`${c.name} · PV`, `${fmt(obs.pv[i]!, 2)} <em>${c.unit}</em>`, `当前 SP ${fmt(obs.setpoints[i]!)} ${c.unit} · 偏差 ${signed(obs.pv[i]! - obs.setpoints[i]!)}`)).join('')}${card('煤耗 F · 教学代理', `${fmt(obs.coal, 3)} <em>kg/t</em>`, '标准化参考 134；尺度 4')}${card('电耗 E · 教学代理', `${fmt(obs.electric, 3)} <em>kWh/t</em>`, '标准化参考 25；尺度 1')}${card('氧含量 O₂', `${fmt(obs.oxygen, 3)} <em>%</em>`, '项目状态门阈值 ≥ 1.2%')}</div><div class="kw-quality-cards">${card('最新已发布化验 · 可以使用', `${fmt(obs.lab.value, 3)} <em>% f-CaO</em>`, `采样 ${time(obs.lab.sampleStep)} · 发布 ${time(obs.lab.releaseStep)}<br>样品年龄 ${obs.labAgeMinutes} 分钟（${fmt(obs.labAgeMinutes / 60, 2)} 小时）`)}${card('即时软测量 · 不是实测化验', `${fmt(obs.softQuality, 3)} <em>% f-CaO</em>`, `根据当前 PV 和 KH = ${fmt(obs.kh, 4)} 的教学估算<br>可能有偏差，不能替代质量测量`)}</div>`;
    const labels = ['T꜀', 'T₂', 'P', 'T꜀ˢᵖ', 'T₂ˢᵖ', 'Pˢᵖ', 'coal', 'elec', 'O₂', 'KH', 'lab_fcao', 'lab_age（小时）', 'soft_fcao'];
    zone('vector').innerHTML = dataTable(['索引', '输入', '此刻可用值'], labels.map((l, i) => [String(i), l, fmt(obs.vector[i]!, i === 9 ? 4 : 3)]));
    zone('hidden').innerHTML = `<div class="kw-quality-cards">${card('模拟蓄热 H · 隐藏', `${fmt(state.thermal, 3)} <em>°C</em>`, '有自身记忆，不能用当前 T꜀ 完整替代')}${card('即时真实 f-CaO · 隐藏', `${fmt(state.trueQuality, 4)} <em>%</em>`, '只用于生成延迟样品与教学质量成本')}</div>${dataTable(['采样时刻', '预计发布时刻', '隐藏样品值', '输入策略？'], state.pendingAssays.map(l => [time(l.sampleStep), time(l.releaseStep), `${fmt(l.value, 4)}%`, '否：尚未发布']))}<p class="kw-small">初始历史化验人为设为 1.10%，采样时刻为 −60 分钟、在 0 分钟已发布。另一个 0 分钟样品在 60 分钟发布；这只是用于建立可解释起点的初始化。</p>`;
  }
  function renderCharts(): void {
    const h = state.history;
    const cv = CV[selectedCV]!;
    zone('pv-chart').innerHTML = trend([{ label: '实际 PV', values: h.map(p => p.pv[selectedCV]!), color: cv.color }, { label: '已执行 SP', values: h.map(p => p.setpoints[selectedCV]!), color: 'var(--kw-orange)', dashed: true, stairs: true }], `${cv.name}：SP 是阶梯目标，PV 按一阶动态逐步追踪。`, cv.unit, 0, state.step * STEP_MINUTES);
    zone('reward-chart').innerHTML = state.step ? trend([{ label: '奖励 r', values: h.slice(1).map(p => p.reward), color: 'var(--kw-green)' }], '奖励越高表示这个教学加权能耗/动作目标更好；不是约束合格证。', '无量纲奖励', STEP_MINUTES, state.step * STEP_MINUTES) : '<div class="kw-empty-chart">执行后显示奖励曲线。<br>起点还没有 transition，也就没有本步奖励。</div>';
    const p = state.lastTransition?.rewardParts;
    const c = state.lastTransition?.costs;
    zone('reward-breakdown').innerHTML = `<div class="kw-mini-metrics">${card('最新能耗项', p ? fmt(p.energyTerm, 4) : '—')}${card('最新动作平滑项', p ? fmt(p.smoothTerm, 4) : '—')}${card('质量成本 cᵩ · 独立', c ? fmt(c.quality, 4) : '—')}${card('氧成本 cO₂ · 独立', c ? fmt(c.oxygen, 4) : '—')}</div><p class="kw-small">两项成本单位为超限的百分点。质量成本用模拟真值评价，不是观测到的新化验；成本没有从奖励中相减。</p>`;
    const quality: TrendSeries[] = [{ label: '即时软测量', values: h.map(p => p.softQuality), color: 'var(--kw-blue)' }, { label: '最新可用化验', values: h.map(p => p.lab.value), color: 'var(--kw-orange)', stairs: true }];
    if (showTruth) quality.push({ label: '教学真值（策略不可见）', values: h.map(p => p.trueQuality), color: 'var(--kw-green)', dashed: true });
    quality.push({ label: '项目范围 0.5～1.5%', values: h.map(() => 1.5), color: '#9a8b7b', dashed: true }, { label: '项目下界 0.5%', values: h.map(() => .5), color: '#b7ac9f', dashed: true });
    const qvalues = quality.flatMap(q => q.values);
    zone('quality-chart').innerHTML = trend(quality, '橙色阶梯只在化验发布时间更新；蓝色软测量每步更新。插值线用于阅读趋势，不表示连续测到了真实质量。', 'f-CaO / %', 0, state.step * STEP_MINUTES, [Math.min(.35, ...qvalues) - .03, Math.max(1.65, ...qvalues) + .03]);
    const next = state.pendingAssays[0];
    zone('assay-timeline').innerHTML = `<div><span>最近已发布</span><b>${time(state.latestAssay.sampleStep)} 采样 → ${time(state.latestAssay.releaseStep)} 发布</b></div><div><span>正在等待</span><b>${next ? `${time(next.sampleStep)} 采样 → ${time(next.releaseStep)} 才可用` : '没有待发布样品'}</b></div><div><span>分辨三个时间</span><b>每 60 分钟采样 · 发布再延后 60 分钟 · 每步推进 5 分钟</b></div>`;
    zone('calculation').innerHTML = calculation(state);
  }
  function renderComparison(): void {
    if (!comparison) {
      zone('comparison').innerHTML = '<p class="kw-small">保持、保守反馈和重复当前手动增量，是三条教学基线。点击后判断“奖励更高”是否同时满足质量与氧含量约束。任何主轨迹或动作变化后，需要重新对照。</p>';
      return;
    }
    const n = comparison[0]!.points.length;
    zone('comparison').innerHTML = `<p class="kw-small">从 ${time(comparisonFrom)} 分叉，推演 ${n} 步。手动分支每一步都提出 ${vec(manual)}，保守反馈每步重算候选；三条分支都必须过同样的安全门。</p>${dataTable(['教学候选方式', '平均煤耗 kg/t', '平均电耗 kWh/t', '累计奖励', '累计质量成本', '累计氧成本', '拒绝次数'], comparison.map(b => [b.title, fmt(b.meanCoal, 3), fmt(b.meanElectric, 3), fmt(b.totalReward, 3), fmt(b.qualityCost, 3), fmt(b.oxygenCost, 3), `${b.blocked} / ${n}`]))}${trend(comparison.map((b, i) => ({ label: b.title, values: b.points.map(p => p.lab.value), color: ['var(--muted)', 'var(--kw-green)', 'var(--kw-orange)'][i]!, stairs: true })), '对照分支中实际可用的化验。短窗口内曲线重合，可能只是新工况样品尚未发布，不等于质量没有变化。', '已发布 f-CaO / %', (comparisonFrom + 1) * STEP_MINUTES, (comparisonFrom + n) * STEP_MINUTES)}<div class="kw-comparison-note"><strong>怎么读这个比较？</strong><p>先检查成本与门控，再看加权奖励和两个原始能耗指标。这里没有从三条结果中替你宣判“最佳真实操作”；参数来自教学假设，不能解释为现场节能效果或已完成正式项目基线验证。</p></div>`;
  }
  function render(): void {
    renderControls();
    renderObserved();
    renderCharts();
    renderComparison();
    zone('clock').innerHTML = `<b>${state.step * STEP_MINUTES}<small> 分钟</small></b><span>第 ${state.step} / ${MAX_STEPS} 步</span>`;
    zone('scenario').textContent = SCENARIOS.find(s => s.id === state.scenario)!.description;
    zone('status').textContent = message;
    zone('horizon').innerHTML = state.truncated ? '<div class="kw-horizon"><strong>教学窗口已满：6 小时 / 72 步</strong><p>这里是 truncated = true、terminated = false。物理过程仍会继续，只是本次记录到此结束；价值目标仍应保留 γV(s′) 自举项。需要继续实验时，请重置情景。</p></div>' : '';
  }
  function reset(): void {
    const raw = Number(field('seed').value);
    const seed = Math.min(999999, Math.max(0, Number.isFinite(raw) ? Math.trunc(raw) : 42));
    field('seed').value = String(seed);
    state = createKiln(seed, field<HTMLSelectElement>('scenario').value as Scenario);
    comparison = null;
    message = `已重置为「${SCENARIOS.find(s => s.id === state.scenario)!.title}」，种子 ${seed}。尚未执行候选。`;
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
        instant: 'SP 会立刻改成 882°C，PV 不会。本模型第一步跟踪项为 0.28 × (882 − 880) = 0.56°C，再叠加小随机扰动。',
        tracking: '这个判断符合模型：PV 的跟踪项是 0.56°C，不是完整的 2°C。热惯性与物料移动继续延后质量响应，化验还要等发布。',
        lab: '最新化验来自较早采样的物料。本次动作不会改写旧样品；只有到了新的发布时间，观测中的 lab_fcao 才更新。',
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
      zone('status').textContent = `已从 ${time(state.step)} 比较未来 ${comparison[0]!.points.length} 步。主轨迹时间没有改变，结果在本页“同一个起点”区域。`;
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
    message = `${action === 'pulse' ? '单次手动脉冲后保持' : MODE_NAMES[mode]}：已从 ${time(before)} 推进到 ${time(state.step)}；${rejects ? `${rejects} 步候选被拒绝并保持 SP` : `${added.length} 步候选通过门控`}；${released} 份新化验发布。${action === 'pulse' ? '展开计算显示最后一步；图上的 SP 阶梯保留了第一次动作。' : ''}`;
    render();
  };
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('click', onClick);
  renderStage();
  render();
  return () => { host.removeEventListener('input', onInput); host.removeEventListener('change', onChange); host.removeEventListener('click', onClick); };
}
