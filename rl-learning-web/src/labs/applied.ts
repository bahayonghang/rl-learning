import { text } from '../i18n';
import { runBandit, mean, standardDeviation, bootstrapMeanInterval, evaluateSafety, clamp } from './math';
import { COLORS, fmt, chart, slider, numberInput, checkbox, button, stat, table, note, setup } from './ui';

export function renderSeeds(host: HTMLElement): () => void {
  const ui = setup(host, text("一条好看的曲线，能代表一种方法吗？", "Can one attractive curve represent a method?"), text("在同一个四臂老虎机问题上，使用独立种子重复训练 ε-greedy。曲线全部来自当前浏览器内的真实采样。先固定比较协议，再看结果。", "Repeat ε-greedy learning with independent seeds on the same four-armed bandit. Every curve comes from actual sampling in this browser. Fix the comparison protocol before inspecting results."),
    slider('epsilon', text("探索率 ε", "Exploration rate ε"), .1, 0, .5, .02) + slider('runs', text("独立随机种子数", "Independent seed count"), 5, 5, 20, 1) + numberInput('steps', text("每个种子的交互预算", "Interactions per seed"), 500, 100, 2000) + numberInput('seed', text("起始种子", "Starting seed"), 42, 0, 999999), button('run', text("运行多种子实验", "Run multiple seeds")));
  let ready = false;
  const update = () => {
    if (!ready) { ui.target.innerHTML = note(text("固定预算，避免挑结果", "Fix the budget and avoid selecting favorable results"), text("每个运行使用 seed = 起始种子 + 17 × 运行编号，其他参数相同。下面的区间用于描述该固定任务上的随机波动，不能代表不同任务或工业工况的泛化能力。", "Each run uses seed = starting seed + 17 × run index, with other parameters fixed. These intervals describe randomness on this fixed task, not generalization to other tasks or industrial operating conditions.")); return; }
    const count = Math.round(ui.number('runs')), steps = Math.round(ui.number('steps')), baseSeed = Math.round(ui.number('seed'));
    const runs = Array.from({ length: count }, (_, i) => runBandit(steps, baseSeed + i * 17, ui.number('epsilon')));
    const means = Array.from({ length: steps }, (_, t) => mean(runs.map(r => r.regret[t]!)));
    const std = Array.from({ length: steps }, (_, t) => standardDeviation(runs.map(r => r.regret[t]!)));
    const final = runs.map(r => r.regret.at(-1)!);
    const interval = bootstrapMeanInterval(final, baseSeed + 100000, 1500);
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("最终伪遗憾均值 ± 样本 SD", "Final pseudo-regret: mean ± sample SD"), `${fmt(mean(final))} ± ${fmt(standardDeviation(final))}`, text(`${count} 个独立运行`, `${count} independent runs`))}${stat(text("均值的 bootstrap 95% 区间", "Bootstrap 95% interval for the mean"), `[${fmt(interval[0])}, ${fmt(interval[1])}]`, text("跨种子重采样 1500 次", "1,500 resamples across seeds"))}${stat(text("只报告最好一次会得到", "Reporting only the best run gives"), fmt(Math.min(...final)), text("伪遗憾越小越好；此值有挑选偏差", "Lower pseudo-regret is better; this selected value is biased"))}</div>` +
      chart([{ name: text("第一个种子", "First seed"), values: runs[0]!.regret, color: COLORS.orange, dashed: true }, { name: text("所有种子的均值", "Mean across all seeds"), values: means, color: COLORS.green }, { name: text("均值 + 1 SD", "Mean + 1 SD"), values: means.map((m, i) => m + std[i]!), color: COLORS.muted, dashed: true }, { name: text("均值 − 1 SD", "Mean − 1 SD"), values: means.map((m, i) => m - std[i]!), color: COLORS.blue, dashed: true }], text("曲线虚线描述运行间波动（±1 SD），不是均值的置信区间", "Dashed spread curves show between-run variability (±1 SD), not a confidence interval for the mean"), { xLabel: text("每个运行的交互次数", "Interactions per run"), yLabel: text("累计伪遗憾", "Cumulative pseudo-regret") }) +
      table([text("种子", "Seed"), text("最终伪遗憾 ↓", "Final pseudo-regret ↓"), text("实际累计奖励", "Realized total reward"), text("最优臂访问次数", "Best-arm visits")], runs.map((r, i) => [String(baseSeed + 17 * i), fmt(r.regret.at(-1)!), String(r.reward), String(r.counts[2])] )) +
      note(text("SD 与置信区间不要混用", "Do not confuse SD with a confidence interval"), text("样本标准差描述不同运行的离散程度；均值区间描述均值估计的不确定性。小样本 percentile bootstrap 也可能覆盖不足，5 个种子只是起点，不是统计可信性的保证。对比新方法时应使用相同任务、预算和评估条件，并预先说明调参协议。", "Sample standard deviation describes dispersion across runs; an interval for the mean describes uncertainty in the mean estimate. A small-sample percentile bootstrap can also undercover. Five seeds are a starting point, not a guarantee of statistical credibility. Compare methods using the same task, budget, and evaluation conditions, with a predefined tuning protocol."));
  };
  update(); return ui.bind(() => { ready = false; update(); }, () => { ready = true; update(); });
}

export function renderSafety(host: HTMLElement): () => void {
  const ui = setup(host, text("一个候选设定值，要经过哪些检查才能被接受？", "Which checks must a proposed setpoint pass?"), text("只演示仓库五层门的判断顺序。这里抽取一个归一化 CV，设定值范围 [0,1]、教学 RATE=0.05；不改变仓库 POMDP 定义，也不连接任何设备。", "This demonstrates the order of the repository’s five gate layers using one normalized CV, setpoint range [0,1], and teaching RATE=0.05. It neither changes the repository’s POMDP contract nor connects to any equipment."),
    slider('oxygen', text("模拟 O₂（%）", "Simulated O₂ (%)"), 1.5, .6, 2.5, .1) + slider('z', text("最大标准化偏离 |z|", "Largest standardized deviation |z|"), 1, 0, 6, .1) + slider('action', text("候选归一化增量 a", "Requested normalized increment a"), .3, -1, 1, .1) + slider('previous', text("前一步增量 a₋₁", "Previous executed increment a₋₁"), 0, -1, 1, .1) + slider('setpoint', text("当前归一化设定值", "Current normalized setpoint"), .5, 0, 1, .01) + slider('quality', text("模拟 f-CaO（%）", "Simulated f-CaO (%)"), 1.1, 0, 2, .1) +
    checkbox('data', text("数据有效，无 NaN/Inf", "Valid data, no NaN/Inf")) + checkbox('state', text("其他核心 CV 均在状态边界内", "Other core CVs are within state limits")) + checkbox('apc', text("模拟 APC 授权为开", "Simulated APC authorization is enabled")),
    button('safe', text("载入通过示例", "Load passing example")) + button('ood', text("载入 OOD 示例", "Load OOD example"), true) + button('curve', text("载入变化过快示例", "Load excessive-change example"), true));
  const draw = () => {
    const sp = ui.number('setpoint'), quality = ui.number('quality'), oxygen = ui.number('oxygen');
    const result = evaluateSafety({ dataValid: ui.checked('data'), stateValid: ui.checked('state'), oxygen, z: ui.number('z'), action: ui.number('action'), previousAction: ui.number('previous'), setpoint: sp, apc: ui.checked('apc') });
    const titles = [text("数据安全", "Data validity"), text("状态安全", "Process state"), text("模型可信度", "Model credibility"), text("优化可行性", "Action feasibility"), text("执行保护", "Execution protection")];
    const details = [text("检查数据有效性与数值有限性", "Check data validity and finite values"), text("O₂ ≥ 1.2%，其他 CV 状态检查通过", "O₂ ≥ 1.2% and other CV state checks pass"), text("|z| ≤ 4.0，仍不能证明模型在域内绝对准确", "|z| ≤ 4.0; this does not prove perfect in-domain model accuracy"), text("|a − a₋₁| ≤ 1.5，且 a ∈ [−1,1]", "|a − a₋₁| ≤ 1.5 and a ∈ [−1,1]"), text("模拟授权开启，候选设定值位于 [0,1]", "Authorization enabled; candidate setpoint within [0,1]")];
    const names = { pass: text("通过", "Passed"), fail: text("拦截", "Rejected"), pending: text("未执行", "Not checked") };
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("判定结果", "Gate outcome"), result.failedGate === null ? text("候选通过", "Candidate accepted") : text(`Gate ${result.failedGate} 拦截`, `Rejected at Gate ${result.failedGate}`), result.failedGate === null ? text("仅供模拟推演", "Simulation only") : text("立即回退为零增量，保持现值", "Fallback to zero increment; hold the current setpoint"))}${stat(text("实际采用的增量", "Executed increment"), fmt(result.output, 2), text("原始候选 a = ", "Requested a = ") + fmt(ui.number('action')))}${stat(text("模拟输出设定值", "Simulated output setpoint"), fmt(sp + .05 * result.output, 3), text("候选设定值 = ", "Candidate setpoint = ") + fmt(result.candidate, 3))}</div>` +
      `<ol class="lab-gates">${result.gates.map((status, i) => `<li class="gate-${status}"><span class="gate-number">${i + 1}</span><div><h3>${titles[i]}</h3><p>${details[i]}</p></div><strong>${names[status]}</strong></li>`).join('')}</ol>` +
      table([text("CMDP 单步成本示意", "Illustrative one-step CMDP cost"), text("本次计算值", "Calculated value"), text("与回报的关系", "Relation to reward")], [['c_quality = max(0,0.5−q)+max(0,q−1.5)', fmt(Math.max(0, .5 - quality) + Math.max(0, quality - 1.5), 3), text("单独记录，不冒充煤耗收益", "Recorded separately from coal-use benefit")], ['c_gas = max(0,1.2−O₂)', fmt(Math.max(0, 1.2 - oxygen), 3), text("约束目标与经济目标分开", "Constraint and economic objectives stay separate")]]) +
      note(text("门通过不等于生产安全证明", "Passing the gate is not proof of plant safety"), text("1.2%、|z|≤4.0、变化限值 1.5 来自本仓库约定，不是通用工艺标准。归一化 CV 范围和 RATE 只为展示检查逻辑。质量成本是单独的 CMDP 教学量，不在这里伪造新增生产联锁。真实验证还必须覆盖传感器漂移、模型误差、延迟与人工审批；本页面不会下发指令。", "The 1.2%, |z|≤4.0, and change limit 1.5 are repository conventions, not universal process standards. The normalized CV range and RATE illustrate the checking logic. Quality cost is a separate teaching CMDP quantity; this does not invent a new production interlock. Real validation also needs sensor drift, model error, delays, and human approval. This page issues no equipment commands."));
  };
  const setNumber = (id: string, value: number) => {
    const input = host.querySelector<HTMLInputElement>(`[data-control="${id}"]`)!;
    input.value = String(clamp(value, Number(input.min), Number(input.max)));
    const output = host.querySelector<HTMLOutputElement>(`[data-output="${id}"]`);
    if (output) output.value = input.value;
  };
  draw(); return ui.bind(draw, action => {
    for (const id of ['data', 'state', 'apc']) host.querySelector<HTMLInputElement>(`[data-control="${id}"]`)!.checked = true;
    setNumber('oxygen', 1.5); setNumber('z', action === 'ood' ? 4.5 : 1); setNumber('action', action === 'curve' ? 1 : .3); setNumber('previous', action === 'curve' ? -1 : 0); setNumber('setpoint', .5); setNumber('quality', 1.1); draw();
  });
}
