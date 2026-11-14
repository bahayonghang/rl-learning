import { clamp, seededRandom, normal, mean, softmax, sampleCategorical, reinforceUpdate, generalizedAdvantage, ppoObjective, squashedLogProbability } from './math';
import { COLORS, fmt, percent, chart, bars, slider, numberInput, checkbox, button, stat, table, note, setup } from './ui';

export function renderReplay(host: HTMLElement): () => void {
  const ui = setup(host, '经验回放与目标网络，各自冻结了什么？', '把 DQN 的两项机制拆到单状态价值模型：每步奖励按 Bernoulli(0.6) 抽样，状态继续。在线 Q 是一个可学习标量，目标 Q 定期复制。这里不训练神经网络。',
    slider('gamma', '折扣因子 γ', .8, 0, .95, .05) + slider('sync', '目标同步间隔 C', 8, 1, 20, 1) + numberInput('seed', '随机种子', 42, 0, 999999),
    button('step', '收集经验并更新一次') + button('fifty', '更新 50 次', true) + button('reset', '重置', true));
  let rng = seededRandom(42), online = 0, target = 0, step = 0, lastTarget = 0, batchMean = 0;
  let buffer: { t: number; reward: number }[] = [], sampled: number[] = [];
  let onlineHistory = [0], targetHistory = [0];
  const draw = () => {
    const expected = .6 / (1 - ui.number('gamma'));
    ui.target.innerHTML = `<div class="lab-stats">${stat('在线 Q', fmt(online, 3), '每次按 TD 误差更新')}${stat('目标 Q̄', fmt(target, 3), `每 ${ui.number('sync')} 次同步`)}${stat('本批 TD 目标', fmt(lastTarget, 3), `平均奖励 ${fmt(batchMean)}`)}</div>` +
      `<div class="lab-buffer" role="list" aria-label="回放缓冲区，橙色为本批采样">${buffer.length ? buffer.map(b => `<div role="listitem" class="${sampled.includes(b.t) ? 'sampled' : ''}"><small>#${b.t}</small><strong>${b.reward}</strong></div>`).join('') : '<p>缓冲区为空，点击“收集经验并更新一次”。</p>'}</div><p class="lab-caption">容量 16；从当前缓冲区均匀无放回采样至多 4 条。橙色表示本批样本。</p>` +
      chart([{ name: '在线 Q', values: onlineHistory, color: COLORS.green }, { name: '目标 Q̄', values: targetHistory, color: COLORS.orange }, { name: '模型真值 0.6/(1−γ)', values: onlineHistory.map(() => expected), color: COLORS.blue, dashed: true }], '实际标量 TD 更新轨迹，目标值只在同步时改变', { xLabel: '更新次数', xMin: 0, xMax: step, yLabel: '价值估计' }) +
      note('把机制与完整算法分开', '回放改变用哪些历史样本；目标网络改变 bootstrap 使用哪份参数。本实验的奖励本来就独立，因此不能用它证明“去相关”带来的性能收益。完整 DQN 还需要状态特征、动作选择、网络损失与优化器。');
  };
  const run = (count: number) => {
    for (let i = 0; i < count; i++) {
      step++; buffer.push({ t: step, reward: rng() < .6 ? 1 : 0 }); if (buffer.length > 16) buffer.shift();
      const order = buffer.map((_, j) => j);
      for (let j = order.length - 1; j > 0; j--) { const k = Math.floor(rng() * (j + 1)); [order[j], order[k]] = [order[k]!, order[j]!]; }
      const batch = order.slice(0, 4).map(j => buffer[j]!);
      sampled = batch.map(b => b.t); batchMean = mean(batch.map(b => b.reward));
      lastTarget = batchMean + ui.number('gamma') * target;
      online += .1 * (lastTarget - online);
      if (step % ui.number('sync') === 0) target = online;
      onlineHistory.push(online); targetHistory.push(target);
    }
    draw();
  };
  const reset = () => { rng = seededRandom(Math.round(ui.number('seed'))); online = 0; target = 0; step = 0; lastTarget = 0; batchMean = 0; buffer = []; sampled = []; onlineHistory = [0]; targetHistory = [0]; draw(); };
  draw(); return ui.bind(reset, a => a === 'reset' ? reset() : run(a === 'fifty' ? 50 : 1));
}

export function renderOverestimation(host: HTMLElement): () => void {
  const ui = setup(host, '零均值噪声，取最大值后还会是零吗？', '所有动作的真实价值都为 0。估计器 A、B 分别获得独立高斯噪声。比较 max A 与 B[argmax A] 的平均估计。',
    slider('actions', '动作数量 K', 6, 2, 20, 1) + slider('sigma', '估计噪声 σ', 1, 0, 2, .1) + numberInput('trials', '独立试验次数', 2000, 100, 10000) + numberInput('seed', '随机种子', 42, 0, 999999), button('run', '重新采样并比较'));
  const run = () => {
    const rng = seededRandom(Math.round(ui.number('seed'))), k = ui.number('actions'), sigma = ui.number('sigma'), count = Math.round(ui.number('trials'));
    let sumMax = 0, sumDouble = 0;
    const single: number[] = [], double: number[] = [];
    for (let t = 0; t < count; t++) {
      const a = Array.from({ length: k }, () => sigma * normal(rng)), b = Array.from({ length: k }, () => sigma * normal(rng));
      const index = a.indexOf(Math.max(...a));
      sumMax += a[index]!; sumDouble += b[index]!;
      if ((t + 1) % 10 === 0 || t === count - 1) { single.push(sumMax / (t + 1)); double.push(sumDouble / (t + 1)); }
    }
    ui.target.innerHTML = `<div class="lab-stats">${stat('真实价值', '0.000')}${stat('同估计器选择并评估', fmt(sumMax / count, 3))}${stat('独立估计器评估', fmt(sumDouble / count, 3))}</div>` +
      chart([{ name: 'max A 的累计均值', values: single, color: COLORS.orange }, { name: 'B[argmax A] 的累计均值', values: double, color: COLORS.green }, { name: '真实值', values: single.map(() => 0), color: COLORS.blue, dashed: true }], '由本次独立随机试验得到的累计均值', { xLabel: '试验数', xMin: 10, xMax: count, yLabel: '估计价值' }) +
      note('适用边界', '对同一组噪声先选最大再评估会产生选择偏差。这里刻意假设两个估计器独立，Double DQN 的在线/目标网络通常仍有相关性，不能把图中接近零的结果当作 Double DQN 无偏的保证。');
  };
  run(); return ui.bind(run, run);
}

export function renderPolicyGradient(host: HTMLElement): () => void {
  const ui = setup(host, '一次奖励，怎样改变所有动作的概率？', '三个动作的确定奖励分别为 1、0.4、−0.5；softmax 策略起始为均匀分布。每步采样一个动作，再进行真实 REINFORCE 参数更新。',
    slider('alpha', '学习率 α', .1, .01, .5, .01) + checkbox('baseline', '使用当前策略期望奖励作 baseline') + numberInput('seed', '随机种子', 42, 0, 999999),
    button('step', '采样并更新一步') + button('hundred', '更新 100 步', true) + button('reset', '重置策略', true));
  const rewards = [1, .4, -.5];
  let logits = [0, 0, 0], rng = seededRandom(42), iteration = 0, lastAction: number | null = null, lastAdv = 0;
  let history = [mean(rewards)];
  const draw = () => {
    const p = softmax(logits), expected = p.reduce((sum, x, i) => sum + x * rewards[i]!, 0);
    ui.target.innerHTML = `<div class="lab-stats">${stat('更新次数', String(iteration))}${stat('当前策略期望奖励', fmt(expected, 3), 'Σ π(a) r(a)，精确枚举')}${stat('最近采样', lastAction === null ? '尚未采样' : `动作 ${lastAction + 1}`, lastAction === null ? '' : `优势估计 ${fmt(lastAdv, 3)}`)}</div>` +
      bars(p.map((value, i) => ({ label: `动作 ${i + 1} · 奖励 ${rewards[i]}`, value, color: [COLORS.green, COLORS.blue, COLORS.orange][i] })), 'softmax 动作概率', '') +
      chart([{ name: '当前策略精确期望回报', values: history, color: COLORS.green }], '真实策略更新后，按三个已知奖励精确评估期望回报', { xLabel: '更新次数', xMin: 0, xMax: iteration, yLabel: '期望奖励', min: -.5, max: 1.05 }) +
      note('观察一个容易漏掉的细节', '∇log π(a) = one_hot(a) − π，因此选中动作概率改变时，其他动作也会一起改变。baseline 降低梯度估计方差，但不保证每一步的期望回报都增加。此处用已知奖励精确求 baseline 是教学便利。');
  };
  const run = (n: number) => {
    for (let j = 0; j < n; j++) {
      const p = softmax(logits), action = sampleCategorical(p, rng);
      const baseline = ui.checked('baseline') ? p.reduce((sum, x, i) => sum + x * rewards[i]!, 0) : 0;
      lastAdv = rewards[action]! - baseline; lastAction = action;
      logits = reinforceUpdate(logits, action, lastAdv, ui.number('alpha'));
      const next = softmax(logits);
      history.push(next.reduce((sum, x, i) => sum + x * rewards[i]!, 0)); iteration++;
    }
    draw();
  };
  const reset = () => { logits = [0, 0, 0]; rng = seededRandom(Math.round(ui.number('seed'))); iteration = 0; lastAction = null; lastAdv = 0; history = [mean(rewards)]; draw(); };
  draw(); return ui.bind(reset, a => a === 'reset' ? reset() : run(a === 'hundred' ? 100 : 1));
}

export function renderGAE(host: HTMLElement): () => void {
  const ui = setup(host, 'λ 到底在混合什么信息？', '固定奖励 [1, 0, 2, 1] 和价值估计 [1.5, 1, 2, 0.5, 3]，先计算 TD 残差，再按 γλ 向前递推。',
    slider('gamma', '折扣因子 γ', .9, 0, 1, .01) + slider('lambda', 'GAE 参数 λ', .95, 0, 1, .01) + checkbox('terminal', '轨迹末尾是真终止（取消表示截断）'));
  const update = () => {
    const rewards = [1, 0, 2, 1], values = [1.5, 1, 2, .5, 3], gamma = ui.number('gamma'), lambda = ui.number('lambda');
    const terminated = [false, false, false, ui.checked('terminal')], ends = [false, false, false, true];
    const advantages = generalizedAdvantage(rewards, values, gamma, lambda, terminated, ends);
    const deltas = rewards.map((r, t) => r + gamma * (terminated[t] ? 0 : values[t + 1]!) - values[t]!);
    ui.target.innerHTML = `<div class="lab-stats">${stat('Â₀', fmt(advantages[0]!, 3))}${stat('第一步 TD 残差 δ₀', fmt(deltas[0]!, 3))}${stat('递推折扣 γλ', fmt(gamma * lambda, 3))}</div>` +
      bars(advantages.map((value, t) => ({ label: `Â${t}`, value, color: t === 0 ? COLORS.orange : COLORS.green })), '每个时间步的广义优势估计') +
      table(['t', 'rₜ₊₁', 'V(sₜ)', 'δₜ', 'Âₜ = δₜ + γλ Âₜ₊₁'], rewards.map((r, t) => [String(t), fmt(r), fmt(values[t]!), fmt(deltas[t]!, 3), fmt(advantages[t]!, 3)])) +
      note('两个不同的遮罩', 'TD 残差在真正 terminated 时不 bootstrap；GAE 的递推链在 reset 边界都要停止，包括 truncated。截断时可以使用截断前末观察的价值，但不能把下个回合的残差串进来。λ=0 只保留一步残差；λ=1 在这段轨迹内使用完整折扣残差和。');
  };
  update(); return ui.bind(update);
}

export function renderPPO(host: HTMLElement): () => void {
  const ui = setup(host, 'PPO 裁剪的是目标函数，还是实际概率比？', '同时画出 ρA 与 min(ρA, clip(ρ,1−ε,1+ε)A)。切换优势的正负，观察“停止额外奖励更新”的平台出现在哪一侧。',
    slider('advantage', '优势 A', 1, -2, 2, .1) + slider('epsilon', '裁剪参数 ε', .2, .05, .4, .05) + slider('ratio', '观察概率比 ρ', 1.5, 0, 2, .02));
  const update = () => {
    const a = ui.number('advantage'), e = ui.number('epsilon'), r = ui.number('ratio');
    const xs = Array.from({ length: 201 }, (_, i) => i / 100);
    const plateau = a > 0 && r > 1 + e || a < 0 && r < 1 - e;
    ui.target.innerHTML = `<div class="lab-stats">${stat('当前概率比 ρ', fmt(r), r < 1 - e || r > 1 + e ? '在裁剪区间外，仍是有效输入' : '位于裁剪区间内')}${stat('原始项 ρA', fmt(r * a, 3))}${stat('PPO-Clip 目标', fmt(ppoObjective(r, a, e), 3), a === 0 ? 'A = 0，没有这一项的梯度' : plateau ? '此样本的目标进入平台' : '此样本仍保留斜率')}</div>` +
      chart([{ name: '未裁剪的 ρA', values: xs.map(x => x * a), color: COLORS.blue, dashed: true }, { name: 'PPO-Clip 目标', values: xs.map(x => ppoObjective(x, a, e)), color: COLORS.green }], `优势 A=${fmt(a)}；裁剪区间 [${fmt(1 - e)}, ${fmt(1 + e)}]`, { xLabel: '新旧策略概率比 ρ', xMin: 0, xMax: 2, yLabel: '单样本代理目标' }) +
      note('不要把示意图读成硬约束', '当 A>0，超过 1+ε 后不再增加此项收益；当 A<0，低于 1−ε 后不再增加此项收益。另一方向的恶化仍保留惩罚。实际概率比可以超出区间，PPO-Clip 也不保证 KL 或工业约束安全。');
  };
  update(); return ui.bind(update);
}

export function renderGaussian(host: HTMLElement): () => void {
  const ui = setup(host, '连续动作经过 tanh 后，密度该怎么算？', '采样 u = μ + σε，再把 a=tanh(u) 限制在 (−1,1)。固定 600 个随机样本，查看动作分布和正确的换元 log 概率。',
    slider('mu', '高斯均值 μ', 0, -2, 2, .1) + slider('sigma', '高斯标准差 σ', .7, .1, 2, .1) + slider('alpha', '熵权重 α（仅目标评估）', .2, 0, 1, .05) + numberInput('seed', '随机种子', 42, 0, 999999));
  const update = () => {
    const mu = ui.number('mu'), sigma = ui.number('sigma'), alpha = ui.number('alpha'), rng = seededRandom(Math.round(ui.number('seed')));
    const us = Array.from({ length: 600 }, () => mu + sigma * normal(rng));
    const actions = us.map(Math.tanh), logps = us.map(u => squashedLogProbability(u, mu, sigma));
    const density = Array.from({ length: 201 }, (_, i) => {
      const a = -.99 + i / 200 * 1.98, u = Math.atanh(a);
      return Math.exp(squashedLogProbability(u, mu, sigma));
    });
    const binCount = 20, counts = Array.from({ length: binCount }, () => 0);
    for (const a of actions) { const i = clamp(Math.floor((a + 1) / 2 * binCount), 0, binCount - 1); counts[i] = counts[i]! + 1; }
    const entropy = -mean(logps), expectedQ = mean(actions.map(a => 1 - (a - .55) ** 2));
    ui.target.innerHTML = `<div class="lab-stats">${stat('动作均值', fmt(mean(actions), 3), 'tanh 后，不等于 μ')}${stat('估计微分熵 −E log π', fmt(entropy, 3), '微分熵可以为负')}${stat('固定策略的 E[Q−α logπ]', fmt(expectedQ + alpha * entropy, 3), '示例 Q(a)=1−(a−0.55)²')}</div>` +
      chart([{ name: 'tanh 后的理论动作密度', values: density, color: COLORS.green }], '使用雅可比修正的解析密度；图只展示 a∈[−0.99,0.99]', { xLabel: '归一化动作 a', xMin: -.99, xMax: .99, yLabel: '概率密度', min: 0 }) +
      `<div class="lab-histogram" aria-label="600次动作采样的直方图">${counts.map((c, i) => `<div title="[${fmt(-1 + i / 10, 1)}, ${fmt(-.9 + i / 10, 1)}): ${c} 次"><i style="height:${Math.max(2, c / Math.max(...counts) * 100)}%"></i><span>${c}</span></div>`).join('')}</div><p class="lab-caption">采样直方图：左端 −1，右端 +1；每格宽 0.1，数字是样本数。</p>` +
      table(['第一条样本', '数值'], [['u（未压缩）', fmt(us[0]!, 4)], ['a = tanh(u)', fmt(actions[0]!, 4)], ['log π(a) = log N(u;μ,σ²) − log(1−a²)', fmt(logps[0]!, 4)]]) +
      note('SAC 实现中的关键接口', '动作变换后仍使用原高斯 log 概率会改变熵项，造成错误梯度。本实验只是评估固定策略的最大熵目标，调整 α 不会自动训练策略。实际动作再缩放到物理范围时，还需要相应的尺度雅可比；工业动作应是受限设定值增量。');
  };
  update(); return ui.bind(update);
}
