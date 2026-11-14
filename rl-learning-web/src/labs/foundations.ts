import { discountedReturns, runBandit, mean, gridSweep, gridBestAction, GRID_GOAL, GRID_WALL, tdTarget, nStepTarget, trainCliff } from './math';
import { COLORS, fmt, percent, chart, bars, slider, numberInput, select, checkbox, button, stat, table, note, setup } from './ui';

export function renderReturn(host: HTMLElement): () => void {
  const ui = setup(host, '同样的奖励，晚一点到达还值多少？', '奖励发生在动作之后：第一项是 r₁。拖动 γ，观察长期回报与决策排序如何一起变化。',
    slider('gamma', '折扣因子 γ', .9, 0, 1, .01) + slider('late', '第四步奖励 r₄', 5, 0, 10, .5) + slider('probability', '高收益发生概率 p', .5, 0, 1, .05));
  const update = () => {
    const gamma = ui.number('gamma'), late = ui.number('late'), p = ui.number('probability');
    const rewards = [1, 0, 0, late];
    const returns = discountedReturns(rewards, gamma);
    const contributions = rewards.map((r, t) => r * gamma ** t);
    ui.target.innerHTML = `<div class="lab-stats">${stat('这条轨迹的 G₀', fmt(returns[0]!))}${stat('立即结束得 2 分', '2.00', returns[0]! > 2 ? '此时等待方案更优' : returns[0]! < 2 ? '此时立即结束更优' : '两方案相同')}${stat('随机奖励的期望', fmt(p * 5 + (1 - p) * -1), 'p × 5 + (1 − p) × (−1)')}</div>` +
      bars(contributions.map((v, t) => ({ label: `r${t + 1} × γ${t === 0 ? '⁰' : t === 1 ? '¹' : t === 2 ? '²' : '³'}`, value: v, color: t === 3 ? COLORS.orange : COLORS.green })), '每个未来奖励对当前 G₀ 的贡献') +
      table(['时刻', '实际奖励', '折扣权重', '当前回报贡献', '从该步起的回报'], rewards.map((r, t) => [String(t + 1), fmt(r), fmt(gamma ** t, 3), fmt(contributions[t]!), fmt(returns[t]!)])) +
      note('先预测，再拖动', 'γ = 0 时只在意第一步；这条有限轨迹在 γ = 1 时直接求和。随机奖励期望是对不同可能结果按概率求平均，与把某一次轨迹的奖励相加是两种不同运算。这里的两个方案是人为构造的有限决策例子。');
  };
  update(); return ui.bind(update);
}

export function renderBandit(host: HTMLElement): () => void {
  const ui = setup(host, '为了找到更好的选择，要付出多少探索成本？', '四个 Bernoulli 臂的真实均值固定为 0.25、0.45、0.65、0.55；智能体开始时并不知道。每次运行都从空统计重新学习。',
    select('strategy', '探索策略', [['epsilon', 'ε-greedy'], ['ucb', 'UCB1']]) + slider('epsilon', 'ε（仅 ε-greedy 使用）', .1, 0, 1, .05) + numberInput('steps', '交互次数', 500, 10, 5000) + numberInput('seed', '随机种子', 42, 0, 999999),
    button('run', '运行实验') + button('reset', '清空统计', true));
  let hasRun = false;
  const draw = () => {
    if (!hasRun) { ui.target.innerHTML = note('开始前做个判断', '全程贪心是否一定会选中第三个臂？更换随机种子再运行，观察早期偶然奖励如何改变后续探索。更改参数后请重新运行。'); return; }
    const n = Math.round(ui.number('steps'));
    const result = runBandit(n, Math.round(ui.number('seed')), ui.number('epsilon'), ui.value('strategy') as 'epsilon' | 'ucb');
    ui.target.innerHTML = `<div class="lab-stats">${stat('实际累计奖励', String(result.reward), `${n} 次真实随机抽样`)}${stat('累计伪遗憾', fmt(result.regret.at(-1)!), 'Σ (最优均值 − 所选臂均值)')}${stat('最优臂选择比例', percent(result.counts[2]! / n))}</div>` +
      chart([{ name: '累计伪遗憾', values: result.regret, color: COLORS.orange }], '根据每次实际选择计算伪遗憾；它不同于“最优随机回报 − 本次随机回报”', { xLabel: '交互步数', yLabel: '累计伪遗憾', min: 0 }) +
      table(['臂', '真实均值（仅供观察）', '估计均值', '访问次数'], result.counts.map((c, i) => [`臂 ${i + 1}`, fmt([.25, .45, .65, .55][i]!), c ? fmt(result.estimates[i]!, 3) : '未访问', String(c)])) +
      note('如何比较', '单个种子不能证明某策略更强。UCB 的上置信项随着访问次数下降；ε-greedy 以固定概率随机选臂。这里臂的分布不随时间变化，也没有状态转移，尚不是完整 MDP。');
  };
  draw(); return ui.bind(() => { hasRun = false; draw(); }, action => { hasRun = action === 'run'; draw(); });
}

export function renderBellman(host: HTMLElement): () => void {
  const ui = setup(host, '下一步的价值，怎样传回当前状态？', '两个非终止状态 A、B。A 可以立刻结束得 1，或零奖励去 B；B 可以花 0.2 返回 A，或结束得 3。终止状态价值为 0。',
    slider('gamma', '折扣因子 γ', .9, 0, .99, .01) + select('backup', '备份方式', [['optimal', '最优 Bellman：取最大值'], ['policy', '策略评估：两个动作各 50%']]),
    button('step', '同步备份一步') + button('ten', '再备份 10 步', true) + button('reset', '重置为 0', true));
  let values = [0, 0], iteration = 0;
  const history = [[0], [0]];
  const update = (count = 0) => {
    const gamma = ui.number('gamma');
    for (let i = 0; i < count; i++) {
      const qA = [1, gamma * values[1]!], qB = [-.2 + gamma * values[0]!, 3];
      values = ui.value('backup') === 'optimal' ? [Math.max(...qA), Math.max(...qB)] : [mean(qA), mean(qB)];
      history[0]!.push(values[0]!); history[1]!.push(values[1]!); iteration++;
    }
    ui.target.innerHTML = `<div class="lab-stats">${stat('已完成备份', String(iteration))}${stat('V(A)', fmt(values[0]!, 3))}${stat('V(B)', fmt(values[1]!, 3))}</div>` +
      table(['本次使用的后继估计', '立即结束', '转移到另一状态', '下一次备份值'], [
        ['A', '1 + γ × 0 = 1', `0 + ${fmt(gamma)} × ${fmt(values[1]!)} = ${fmt(gamma * values[1]!)}`, fmt(ui.value('backup') === 'optimal' ? Math.max(1, gamma * values[1]!) : (1 + gamma * values[1]!) / 2)],
        ['B', '3 + γ × 0 = 3', `−0.2 + ${fmt(gamma)} × ${fmt(values[0]!)} = ${fmt(-.2 + gamma * values[0]!)}`, fmt(ui.value('backup') === 'optimal' ? Math.max(3, -.2 + gamma * values[0]!) : (3 - .2 + gamma * values[0]!) / 2)],
      ]) + chart([{ name: 'V(A)', values: history[0]!, color: COLORS.green }, { name: 'V(B)', values: history[1]!, color: COLORS.orange }], '同步备份始终读取上一次完整价值向量', { xLabel: '备份次数', xMin: 0, xMax: iteration, yLabel: '状态价值' }) +
      note('关键区别', '策略评估对动作价值按策略概率求平均；最优 Bellman 备份对动作取最大值。模型、奖励和 γ 都相同，仅改变这一步聚合规则，就会得到不同的价值与行为。');
  };
  const reset = () => { values = [0, 0]; iteration = 0; history[0] = [0]; history[1] = [0]; update(); };
  update(); return ui.bind(reset, action => action === 'reset' ? reset() : update(action === 'ten' ? 10 : 1));
}

export function renderGridworld(host: HTMLElement): () => void {
  const ui = setup(host, '奖励信息一轮能传多远？', '4 × 4 网格，深色格是墙。每走一步 −1；进入右下角终点得 +10 并真正终止。越界或碰墙停在原地，仍扣 1。',
    slider('gamma', '折扣因子 γ', .9, 0, .99, .01), button('step', '执行一轮价值迭代') + button('ten', '执行 10 轮', true) + button('reset', '重新开始', true));
  let values = new Array<number>(16).fill(0), iteration = 0, residual = 0;
  const arrows = ['↑', '→', '↓', '←'];
  const draw = () => {
    ui.target.innerHTML = `<div class="lab-stats">${stat('迭代轮数', String(iteration))}${stat('最大变化量', fmt(residual, 4))}${stat('左上角 V', fmt(values[0]!, 3))}</div><div class="lab-world" role="img" aria-label="4乘4网格中的状态价值与贪心动作">${values.map((v, s) => s === GRID_WALL ? '<div class="lab-cell wall" aria-label="墙">墙</div>' : s === GRID_GOAL ? '<div class="lab-cell goal"><strong>终点</strong><span>V = 0</span><small>进入奖励 +10</small></div>' : `<div class="lab-cell" style="--cell-opacity:${Math.min(.9, .1 + Math.max(0, v) / 12)}"><b>${arrows[gridBestAction(values, s, ui.number('gamma'))]}</b><strong>${fmt(v)}</strong><small>状态 ${s}</small></div>`).join('')}</div>` +
      note('为什么终点不是 10？', '奖励 +10 属于“进入终点”的转移，终点之后没有奖励，所以终点的 V 为 0。第一轮只有终点相邻状态知道它值得去；同步迭代中价值每轮向前传播。并列最优时箭头显示一个代表动作，不表示唯一最优。');
  };
  const reset = () => { values = new Array<number>(16).fill(0); iteration = 0; residual = 0; draw(); };
  draw(); return ui.bind(reset, action => {
    if (action === 'reset') { reset(); return; }
    for (let i = 0; i < (action === 'ten' ? 10 : 1); i++) {
      const next = gridSweep(values, ui.number('gamma'));
      residual = Math.max(...next.map((v, s) => Math.abs(v - values[s]!)));
      values = next; iteration++;
    }
    draw();
  });
}

export function renderTD(host: HTMLElement): () => void {
  const ui = setup(host, '等到结局，还是借用下一步的估计？', '观察同一条奖励轨迹 [1, 0, 2, 4]。当前 V 估计为 [2, 3, 1, 2, 5]；末尾若是真终止则 V₄ 必须被遮罩，若只是采样截断则保留它。',
    slider('gamma', '折扣因子 γ', .9, 0, 1, .01) + slider('n', 'n-step 的 n', 2, 1, 4, 1) + slider('alpha', '学习率 α', .2, 0, 1, .05) + checkbox('terminal', '最后一步是真终止（取消表示时间截断）'));
  const update = () => {
    const gamma = ui.number('gamma'), n = ui.number('n'), alpha = ui.number('alpha'), terminal = ui.checked('terminal');
    const rewards = [1, 0, 2, 4], values = [2, 3, 1, 2, 5];
    const one = tdTarget(rewards[0]!, gamma, values[1]!, false);
    const nTarget = nStepTarget(rewards, values, 0, n, gamma, terminal);
    const full = discountedReturns(rewards, gamma, terminal ? 0 : values[4]!)[0]!;
    ui.target.innerHTML = `<div class="lab-stats">${stat('TD(0) 目标', fmt(one))}${stat(`${n}-step 目标`, fmt(nTarget))}${stat(terminal ? '完整 MC 回报' : '截断段 + 末状态 bootstrap', fmt(full))}</div>` +
      bars([{ label: '当前 V(s₀)', value: 2, color: COLORS.muted }, { label: 'TD 目标', value: one }, { label: `${n}-step 目标`, value: nTarget, color: COLORS.blue }, { label: terminal ? 'MC 回报' : '截断回报', value: full, color: COLORS.orange }], '同一轨迹、不同备份长度的学习目标') +
      table(['方法', '误差（目标 − 2）', '更新后 V(s₀) = 2 + α × 误差'], [['TD(0)', fmt(one - 2), fmt(2 + alpha * (one - 2))], [`${n}-step`, fmt(nTarget - 2), fmt(2 + alpha * (nTarget - 2))], [terminal ? 'MC' : '截断段回报', fmt(full - 2), fmt(2 + alpha * (full - 2))]]) +
      note('截断不是终止', terminal ? '现在末尾是真终止，完整 MC 不再使用末状态价值。n 越小，对当前价值估计依赖越多；n 越大，包含的随机回报越多。仅看这一条轨迹不能比较方差。' : '现在只是时间上限截断，最后奖励之后仍可能继续，因此使用 V(s₄)=5。这个“采样段 + bootstrap”不是纯 Monte Carlo。reset 后的新初始状态绝不能替代截断前的 final observation。');
  };
  update(); return ui.bind(update);
}

export function renderCliff(host: HTMLElement): () => void {
  const ui = setup(host, '学最优动作，与学正在执行的策略有什么不同？', '经典悬崖网格：下排从 S 到 G，中间是悬崖；掉下去 −100 并回到 S，普通步 −1。分别训练 SARSA 与 Q-learning，再显示无探索的贪心路径。',
    slider('epsilon', '训练探索率 ε', .1, 0, .4, .02) + numberInput('episodes', '每种算法的回合数', 400, 50, 2000) + numberInput('seed', '随机种子', 42, 0, 999999), button('train', '训练两种表格策略'));
  const empty = () => { ui.target.innerHTML = note('先看行为策略', 'SARSA 的 TD 目标使用实际采样的下个动作；Q-learning 的目标使用最大 Q。此环境的持续探索让靠近悬崖更危险，但“SARSA 更安全”并不是所有任务的普遍定理。'); };
  empty();
  return ui.bind(empty, () => {
    const episodes = Math.round(ui.number('episodes')), seed = Math.round(ui.number('seed')), epsilon = ui.number('epsilon');
    const sarsa = trainCliff('sarsa', episodes, seed, epsilon), q = trainCliff('q', episodes, seed, epsilon);
    const windows = (xs: number[]) => Array.from({ length: Math.ceil(xs.length / 20) }, (_, i) => mean(xs.slice(i * 20, (i + 1) * 20)));
    const world = (path: number[], title: string, success: boolean) => `<section class="lab-path-panel"><h3>${title}</h3><div class="lab-cliff-world" role="img" aria-label="${title}的贪心评估路径">${Array.from({ length: 48 }, (_, s) => `<div class="${s > 36 && s < 47 ? 'cliff' : path.includes(s) ? 'path' : ''}">${s === 36 ? 'S' : s === 47 ? 'G' : s > 36 && s < 47 ? '×' : path.includes(s) ? '•' : ''}</div>`).join('')}</div><p>${success ? '本次贪心策略到达终点' : '本次贪心策略未到达终点；可能尚未收敛或存在并列动作循环'}</p></section>`;
    ui.target.innerHTML = `<div class="lab-stats">${stat('SARSA 最后 20 回合均值', fmt(mean(sarsa.returns.slice(-20))), `训练掉崖 ${sarsa.falls} 次`)}${stat('Q-learning 最后 20 回合均值', fmt(mean(q.returns.slice(-20))), `训练掉崖 ${q.falls} 次`)}</div>` +
      chart([{ name: 'SARSA', values: windows(sarsa.returns), color: COLORS.green }, { name: 'Q-learning', values: windows(q.returns), color: COLORS.orange }], '本次实际训练回报，每 20 回合取均值；回合超过 600 步会截断', { xLabel: '训练回合（每点 20 回合）', xMin: 20, xMax: episodes, yLabel: '回合回报' }) +
      `<div class="lab-two-up">${world(sarsa.path, 'SARSA 贪心路径', sarsa.reachedGoal)}${world(q.path, 'Q-learning 贪心路径', q.reachedGoal)}</div>` +
      note('读图边界', '曲线含训练时的探索，下面的路径不含探索，两者对应不同评估条件。这里固定 α=0.5、γ=1，训练随机数流同种子初始化，但算法行为不同后采样轨迹会分叉。请换种子重复，不要只选最漂亮的一次。');
  });
}
