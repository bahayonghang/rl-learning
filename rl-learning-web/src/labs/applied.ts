import { runBandit, mean, standardDeviation, bootstrapMeanInterval, evaluateSafety, clamp } from './math';
import { COLORS, fmt, chart, slider, numberInput, checkbox, button, stat, table, note, setup } from './ui';

export function renderSeeds(host: HTMLElement): () => void {
  const ui = setup(host, '一条好看的曲线，能代表一种方法吗？', '在同一个四臂老虎机问题上，使用独立种子重复训练 ε-greedy。曲线全部来自当前浏览器内的真实采样。先固定比较协议，再看结果。',
    slider('epsilon', '探索率 ε', .1, 0, .5, .02) + slider('runs', '独立随机种子数', 5, 5, 20, 1) + numberInput('steps', '每个种子的交互预算', 500, 100, 2000) + numberInput('seed', '起始种子', 42, 0, 999999), button('run', '运行多种子实验'));
  let ready = false;
  const update = () => {
    if (!ready) { ui.target.innerHTML = note('固定预算，避免挑结果', '每个运行使用 seed = 起始种子 + 17 × 运行编号，其他参数相同。下面的区间用于描述该固定任务上的随机波动，不能代表不同任务或工业工况的泛化能力。'); return; }
    const count = Math.round(ui.number('runs')), steps = Math.round(ui.number('steps')), baseSeed = Math.round(ui.number('seed'));
    const runs = Array.from({ length: count }, (_, i) => runBandit(steps, baseSeed + i * 17, ui.number('epsilon')));
    const means = Array.from({ length: steps }, (_, t) => mean(runs.map(r => r.regret[t]!)));
    const std = Array.from({ length: steps }, (_, t) => standardDeviation(runs.map(r => r.regret[t]!)));
    const final = runs.map(r => r.regret.at(-1)!);
    const interval = bootstrapMeanInterval(final, baseSeed + 100000, 1500);
    ui.target.innerHTML = `<div class="lab-stats">${stat('最终伪遗憾均值 ± 样本 SD', `${fmt(mean(final))} ± ${fmt(standardDeviation(final))}`, `${count} 个独立运行`)}${stat('均值的 bootstrap 95% 区间', `[${fmt(interval[0])}, ${fmt(interval[1])}]`, '跨种子重采样 1500 次')}${stat('只报告最好一次会得到', fmt(Math.min(...final)), '伪遗憾越小越好；此值有挑选偏差')}</div>` +
      chart([{ name: '第一个种子', values: runs[0]!.regret, color: COLORS.orange, dashed: true }, { name: '所有种子的均值', values: means, color: COLORS.green }, { name: '均值 + 1 SD', values: means.map((m, i) => m + std[i]!), color: COLORS.muted, dashed: true }, { name: '均值 − 1 SD', values: means.map((m, i) => m - std[i]!), color: COLORS.blue, dashed: true }], '曲线虚线描述运行间波动（±1 SD），不是均值的置信区间', { xLabel: '每个运行的交互次数', yLabel: '累计伪遗憾' }) +
      table(['种子', '最终伪遗憾 ↓', '实际累计奖励', '最优臂访问次数'], runs.map((r, i) => [String(baseSeed + 17 * i), fmt(r.regret.at(-1)!), String(r.reward), String(r.counts[2])] )) +
      note('SD 与置信区间不要混用', '样本标准差描述不同运行的离散程度；均值区间描述均值估计的不确定性。小样本 percentile bootstrap 也可能覆盖不足，5 个种子只是起点，不是统计可信性的保证。对比新方法时应使用相同任务、预算和评估条件，并预先说明调参协议。');
  };
  update(); return ui.bind(() => { ready = false; update(); }, () => { ready = true; update(); });
}

export function renderSafety(host: HTMLElement): () => void {
  const ui = setup(host, '一个候选设定值，要经过哪些检查才能被接受？', '只演示仓库五层门的判断顺序。这里抽取一个归一化 CV，设定值范围 [0,1]、教学 RATE=0.05；不改变仓库 POMDP 定义，也不连接任何设备。',
    slider('oxygen', '模拟 O₂（%）', 1.5, .6, 2.5, .1) + slider('z', '最大标准化偏离 |z|', 1, 0, 6, .1) + slider('action', '候选归一化增量 a', .3, -1, 1, .1) + slider('previous', '前一步增量 a₋₁', 0, -1, 1, .1) + slider('setpoint', '当前归一化设定值', .5, 0, 1, .01) + slider('quality', '模拟 f-CaO（%）', 1.1, 0, 2, .1) +
    checkbox('data', '数据有效，无 NaN/Inf') + checkbox('state', '其他核心 CV 均在状态边界内') + checkbox('apc', '模拟 APC 授权为开'),
    button('safe', '载入通过示例') + button('ood', '载入 OOD 示例', true) + button('curve', '载入变化过快示例', true));
  const draw = () => {
    const sp = ui.number('setpoint'), quality = ui.number('quality'), oxygen = ui.number('oxygen');
    const result = evaluateSafety({ dataValid: ui.checked('data'), stateValid: ui.checked('state'), oxygen, z: ui.number('z'), action: ui.number('action'), previousAction: ui.number('previous'), setpoint: sp, apc: ui.checked('apc') });
    const titles = ['数据安全', '状态安全', '模型可信度', '优化可行性', '执行保护'];
    const details = ['检查数据有效性与数值有限性', 'O₂ ≥ 1.2%，其他 CV 状态检查通过', '|z| ≤ 4.0，仍不能证明模型在域内绝对准确', '|a − a₋₁| ≤ 1.5，且 a ∈ [−1,1]', '模拟授权开启，候选设定值位于 [0,1]'];
    const names = { pass: '通过', fail: '拦截', pending: '未执行' };
    ui.target.innerHTML = `<div class="lab-stats">${stat('判定结果', result.failedGate === null ? '候选通过' : `Gate ${result.failedGate} 拦截`, result.failedGate === null ? '仅供模拟推演' : '立即回退为零增量，保持现值')}${stat('实际采用的增量', fmt(result.output, 2), '原始候选 a = ' + fmt(ui.number('action')))}${stat('模拟输出设定值', fmt(sp + .05 * result.output, 3), '候选设定值 = ' + fmt(result.candidate, 3))}</div>` +
      `<ol class="lab-gates">${result.gates.map((status, i) => `<li class="gate-${status}"><span class="gate-number">${i + 1}</span><div><h3>${titles[i]}</h3><p>${details[i]}</p></div><strong>${names[status]}</strong></li>`).join('')}</ol>` +
      table(['CMDP 单步成本示意', '本次计算值', '与回报的关系'], [['c_quality = max(0,0.5−q)+max(0,q−1.5)', fmt(Math.max(0, .5 - quality) + Math.max(0, quality - 1.5), 3), '单独记录，不冒充煤耗收益'], ['c_gas = max(0,1.2−O₂)', fmt(Math.max(0, 1.2 - oxygen), 3), '约束目标与经济目标分开']]) +
      note('门通过不等于生产安全证明', '1.2%、|z|≤4.0、变化限值 1.5 来自本仓库约定，不是通用工艺标准。归一化 CV 范围和 RATE 只为展示检查逻辑。质量成本是单独的 CMDP 教学量，不在这里伪造新增生产联锁。真实验证还必须覆盖传感器漂移、模型误差、延迟与人工审批；本页面不会下发指令。');
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
