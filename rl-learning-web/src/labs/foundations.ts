import { text } from '../i18n';
import { discountedReturns, runBandit, mean, gridSweep, gridBestAction, GRID_GOAL, GRID_WALL, tdTarget, nStepTarget, trainCliff } from './math';
import { COLORS, fmt, percent, chart, bars, slider, numberInput, select, checkbox, button, stat, table, note, setup } from './ui';

export function renderReturn(host: HTMLElement): () => void {
  const ui = setup(host, text("同样的奖励，晚一点到达还值多少？", "How much is the same reward worth when it arrives later?"), text("奖励发生在动作之后：第一项是 r₁。拖动 γ，观察长期回报与决策排序如何一起变化。", "Rewards follow actions: the first reward is r₁. Move γ to see how long-term return and the ranking of decisions change together."),
    slider('gamma', text("折扣因子 γ", "Discount factor γ"), .9, 0, 1, .01) + slider('late', text("第四步奖励 r₄", "Fourth-step reward r₄"), 5, 0, 10, .5) + slider('probability', text("高收益发生概率 p", "Probability p of the high payoff"), .5, 0, 1, .05));
  const update = () => {
    const gamma = ui.number('gamma'), late = ui.number('late'), p = ui.number('probability');
    const rewards = [1, 0, 0, late];
    const returns = discountedReturns(rewards, gamma);
    const contributions = rewards.map((r, t) => r * gamma ** t);
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("这条轨迹的 G₀", "G₀ for this trajectory"), fmt(returns[0]!))}${stat(text("立即结束得 2 分", "End now for 2 points"), '2.00', returns[0]! > 2 ? text("此时等待方案更优", "Waiting is better at this setting") : returns[0]! < 2 ? text("此时立即结束更优", "Ending now is better at this setting") : text("两方案相同", "Both options have equal value"))}${stat(text("随机奖励的期望", "Expected random reward"), fmt(p * 5 + (1 - p) * -1), 'p × 5 + (1 − p) × (−1)')}</div>` +
      bars(contributions.map((v, t) => ({ label: `r${t + 1} × γ${t === 0 ? '⁰' : t === 1 ? '¹' : t === 2 ? '²' : '³'}`, value: v, color: t === 3 ? COLORS.orange : COLORS.green })), text("每个未来奖励对当前 G₀ 的贡献", "Each future reward’s contribution to the current G₀")) +
      table([text("时刻", "Step"), text("实际奖励", "Observed reward"), text("折扣权重", "Discount weight"), text("当前回报贡献", "Contribution to G₀"), text("从该步起的回报", "Return from this step")], rewards.map((r, t) => [String(t + 1), fmt(r), fmt(gamma ** t, 3), fmt(contributions[t]!), fmt(returns[t]!)])) +
      note(text("先预测，再拖动", "Predict before moving the slider"), text("γ = 0 时只在意第一步；这条有限轨迹在 γ = 1 时直接求和。随机奖励期望是对不同可能结果按概率求平均，与把某一次轨迹的奖励相加是两种不同运算。这里的两个方案是人为构造的有限决策例子。", "At γ=0 only the first reward matters; at γ=1 this finite trajectory is summed directly. An expected random reward averages possible outcomes by their probabilities. That differs from summing the rewards along one trajectory. These two options are constructed finite-decision examples."));
  };
  update(); return ui.bind(update);
}

export function renderBandit(host: HTMLElement): () => void {
  const ui = setup(host, text("为了找到更好的选择，要付出多少探索成本？", "How much exploration does finding a better option require?"), text("四个 Bernoulli 臂的真实均值固定为 0.25、0.45、0.65、0.55；智能体开始时并不知道。每次运行都从空统计重新学习。", "The four Bernoulli arms have fixed true means 0.25, 0.45, 0.65, and 0.55, unknown to the agent initially. Each run learns again from empty statistics."),
    select('strategy', text("探索策略", "Exploration strategy"), [['epsilon', 'ε-greedy'], ['ucb', 'UCB1']]) + slider('epsilon', text("ε（仅 ε-greedy 使用）", "ε (used by ε-greedy only)"), .1, 0, 1, .05) + numberInput('steps', text("交互次数", "Interaction budget"), 500, 10, 5000) + numberInput('seed', text("随机种子", "Random seed"), 42, 0, 999999),
    button('run', text("运行实验", "Run experiment")) + button('reset', text("清空统计", "Clear statistics"), true));
  let hasRun = false;
  const draw = () => {
    if (!hasRun) { ui.target.innerHTML = note(text("开始前做个判断", "Make a prediction before starting"), text("全程贪心是否一定会选中第三个臂？更换随机种子再运行，观察早期偶然奖励如何改变后续探索。更改参数后请重新运行。", "Will a fully greedy agent necessarily discover the third arm? Change the seed and rerun to see how early chance rewards affect later exploration. Rerun after changing the parameters.")); return; }
    const n = Math.round(ui.number('steps'));
    const result = runBandit(n, Math.round(ui.number('seed')), ui.number('epsilon'), ui.value('strategy') as 'epsilon' | 'ucb');
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("实际累计奖励", "Realized total reward"), String(result.reward), text(`${n} 次真实随机抽样`, `${n} actual random draws`))}${stat(text("累计伪遗憾", "Cumulative pseudo-regret"), fmt(result.regret.at(-1)!), text("Σ (最优均值 − 所选臂均值)", "Σ (best mean − chosen arm’s mean)"))}${stat(text("最优臂选择比例", "Best-arm selection rate"), percent(result.counts[2]! / n))}</div>` +
      chart([{ name: text("累计伪遗憾", "Cumulative pseudo-regret"), values: result.regret, color: COLORS.orange }], text("根据每次实际选择计算伪遗憾；它不同于“最优随机回报 − 本次随机回报”", "Pseudo-regret uses each actual arm selection. It differs from “best random return minus this run’s random return.”"), { xLabel: text("交互步数", "Interaction step"), yLabel: text("累计伪遗憾", "Cumulative pseudo-regret"), min: 0 }) +
      table([text("臂", "Arm"), text("真实均值（仅供观察）", "True mean (for inspection only)"), text("估计均值", "Estimated mean"), text("访问次数", "Visit count")], result.counts.map((c, i) => [text(`臂 ${i + 1}`, `Arm ${i + 1}`), fmt([.25, .45, .65, .55][i]!), c ? fmt(result.estimates[i]!, 3) : text("未访问", "Not visited"), String(c)])) +
      note(text("如何比较", "How to compare"), text("单个种子不能证明某策略更强。UCB 的上置信项随着访问次数下降；ε-greedy 以固定概率随机选臂。这里臂的分布不随时间变化，也没有状态转移，尚不是完整 MDP。", "One seed cannot establish that a strategy is better. UCB’s confidence term decreases as visits accumulate; ε-greedy chooses randomly with a fixed probability. Arm distributions are stationary here and there are no state transitions: this is not yet a full MDP."));
  };
  draw(); return ui.bind(() => { hasRun = false; draw(); }, action => { hasRun = action === 'run'; draw(); });
}

export function renderBellman(host: HTMLElement): () => void {
  const ui = setup(host, text("下一步的价值，怎样传回当前状态？", "How does next-state value propagate to the present?"), text("两个非终止状态 A、B。A 可以立刻结束得 1，或零奖励去 B；B 可以花 0.2 返回 A，或结束得 3。终止状态价值为 0。", "There are two nonterminal states, A and B. From A, end for 1 or move to B for 0. From B, pay 0.2 to return to A or end for 3. The terminal state has value 0."),
    slider('gamma', text("折扣因子 γ", "Discount factor γ"), .9, 0, .99, .01) + select('backup', text("备份方式", "Backup rule"), [['optimal', text("最优 Bellman：取最大值", "Bellman optimality: take the maximum")], ['policy', text("策略评估：两个动作各 50%", "Policy evaluation: 50% per action")]]),
    button('step', text("同步备份一步", "One synchronous backup")) + button('ten', text("再备份 10 步", "10 more backups"), true) + button('reset', text("重置为 0", "Reset to zero"), true));
  let values = [0, 0], iteration = 0;
  const history = [[0], [0]];
  const update = (count = 0) => {
    const gamma = ui.number('gamma');
    for (let i = 0; i < count; i++) {
      const qA = [1, gamma * values[1]!], qB = [-.2 + gamma * values[0]!, 3];
      values = ui.value('backup') === 'optimal' ? [Math.max(...qA), Math.max(...qB)] : [mean(qA), mean(qB)];
      history[0]!.push(values[0]!); history[1]!.push(values[1]!); iteration++;
    }
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("已完成备份", "Completed backups"), String(iteration))}${stat('V(A)', fmt(values[0]!, 3))}${stat('V(B)', fmt(values[1]!, 3))}</div>` +
      table([text("本次使用的后继估计", "State for the next backup"), text("立即结束", "End immediately"), text("转移到另一状态", "Move to the other state"), text("下一次备份值", "Next backup value")], [
        ['A', '1 + γ × 0 = 1', `0 + ${fmt(gamma)} × ${fmt(values[1]!)} = ${fmt(gamma * values[1]!)}`, fmt(ui.value('backup') === 'optimal' ? Math.max(1, gamma * values[1]!) : (1 + gamma * values[1]!) / 2)],
        ['B', '3 + γ × 0 = 3', `−0.2 + ${fmt(gamma)} × ${fmt(values[0]!)} = ${fmt(-.2 + gamma * values[0]!)}`, fmt(ui.value('backup') === 'optimal' ? Math.max(3, -.2 + gamma * values[0]!) : (3 - .2 + gamma * values[0]!) / 2)],
      ]) + chart([{ name: 'V(A)', values: history[0]!, color: COLORS.green }, { name: 'V(B)', values: history[1]!, color: COLORS.orange }], text("同步备份始终读取上一次完整价值向量", "Each synchronous backup reads the entire previous value vector"), { xLabel: text("备份次数", "Backup count"), xMin: 0, xMax: iteration, yLabel: text("状态价值", "State value") }) +
      note(text("关键区别", "The key distinction"), text("策略评估对动作价值按策略概率求平均；最优 Bellman 备份对动作取最大值。模型、奖励和 γ 都相同，仅改变这一步聚合规则，就会得到不同的价值与行为。", "Policy evaluation averages action values using policy probabilities; a Bellman optimality backup maximizes over actions. The model, rewards, and γ are identical. Changing this aggregation rule changes the values and behavior."));
  };
  const reset = () => { values = [0, 0]; iteration = 0; history[0] = [0]; history[1] = [0]; update(); };
  update(); return ui.bind(reset, action => action === 'reset' ? reset() : update(action === 'ten' ? 10 : 1));
}

export function renderGridworld(host: HTMLElement): () => void {
  const ui = setup(host, text("奖励信息一轮能传多远？", "How far can reward information travel in one sweep?"), text("4 × 4 网格，深色格是墙。每走一步 −1；进入右下角终点得 +10 并真正终止。越界或碰墙停在原地，仍扣 1。", "A 4 × 4 grid with a dark wall cell. Each ordinary step earns −1; entering the lower-right goal earns +10 and truly terminates. Hitting a wall or boundary leaves the agent in place and still costs 1."),
    slider('gamma', text("折扣因子 γ", "Discount factor γ"), .9, 0, .99, .01), button('step', text("执行一轮价值迭代", "Run one value-iteration sweep")) + button('ten', text("执行 10 轮", "Run 10 sweeps"), true) + button('reset', text("重新开始", "Start again"), true));
  let values = new Array<number>(16).fill(0), iteration = 0, residual = 0;
  const arrows = ['↑', '→', '↓', '←'];
  const draw = () => {
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("迭代轮数", "Sweep count"), String(iteration))}${stat(text("最大变化量", "Largest value change"), fmt(residual, 4))}${stat(text("左上角 V", "Top-left V"), fmt(values[0]!, 3))}</div><div class="lab-world" role="img" aria-label="${text('4乘4网格中的状态价值与贪心动作', 'State values and greedy actions in a 4 by 4 grid')}">${values.map((v, s) => s === GRID_WALL ? text("<div class=\"lab-cell wall\" aria-label=\"墙\">墙</div>", "<div class=\"lab-cell wall\" aria-label=\"Wall\">Wall</div>") : s === GRID_GOAL ? text("<div class=\"lab-cell goal\"><strong>终点</strong><span>V = 0</span><small>进入奖励 +10</small></div>", "<div class=\"lab-cell goal\"><strong>Goal</strong><span>V = 0</span><small>Entry reward +10</small></div>") : `<div class="lab-cell" style="--cell-opacity:${Math.min(.9, .1 + Math.max(0, v) / 12)}"><b>${arrows[gridBestAction(values, s, ui.number('gamma'))]}</b><strong>${fmt(v)}</strong><small>${text('状态', 'State')} ${s}</small></div>`).join('')}</div>` +
      note(text("为什么终点不是 10？", "Why is the goal’s value not 10?"), text("奖励 +10 属于“进入终点”的转移，终点之后没有奖励，所以终点的 V 为 0。第一轮只有终点相邻状态知道它值得去；同步迭代中价值每轮向前传播。并列最优时箭头显示一个代表动作，不表示唯一最优。", "The +10 reward belongs to the transition into the goal. There are no later rewards, so the goal’s V is 0. Only neighboring states learn of the goal in the first sweep; subsequent synchronous sweeps propagate value outward. When actions tie, the arrow shows one representative optimal action, not a unique optimum."));
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
  const ui = setup(host, text("等到结局，还是借用下一步的估计？", "Wait for the outcome, or use the next-state estimate?"), text("观察同一条奖励轨迹 [1, 0, 2, 4]。当前 V 估计为 [2, 3, 1, 2, 5]；末尾若是真终止则 V₄ 必须被遮罩，若只是采样截断则保留它。", "Use the same reward trajectory [1, 0, 2, 4] and current value estimates [2, 3, 1, 2, 5]. Mask V₄ at genuine termination; retain it if the segment is only truncated."),
    slider('gamma', text("折扣因子 γ", "Discount factor γ"), .9, 0, 1, .01) + slider('n', text("n-step 的 n", "n-step horizon n"), 2, 1, 4, 1) + slider('alpha', text("学习率 α", "Learning rate α"), .2, 0, 1, .05) + checkbox('terminal', text("最后一步是真终止（取消表示时间截断）", "Final step is truly terminal (uncheck for time truncation)")));
  const update = () => {
    const gamma = ui.number('gamma'), n = ui.number('n'), alpha = ui.number('alpha'), terminal = ui.checked('terminal');
    const rewards = [1, 0, 2, 4], values = [2, 3, 1, 2, 5];
    const one = tdTarget(rewards[0]!, gamma, values[1]!, false);
    const nTarget = nStepTarget(rewards, values, 0, n, gamma, terminal);
    const full = discountedReturns(rewards, gamma, terminal ? 0 : values[4]!)[0]!;
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("TD(0) 目标", "TD(0) target"), fmt(one))}${stat(text(`${n}-step 目标`, `${n}-step target`), fmt(nTarget))}${stat(terminal ? text("完整 MC 回报", "Complete MC return") : text("截断段 + 末状态 bootstrap", "Truncated segment + final-state bootstrap"), fmt(full))}</div>` +
      bars([{ label: text("当前 V(s₀)", "Current V(s₀)"), value: 2, color: COLORS.muted }, { label: text("TD 目标", "TD target"), value: one }, { label: text(`${n}-step 目标`, `${n}-step target`), value: nTarget, color: COLORS.blue }, { label: terminal ? text("MC 回报", "MC return") : text("截断回报", "Truncated return"), value: full, color: COLORS.orange }], text("同一轨迹、不同备份长度的学习目标", "Learning targets for different backup lengths on the same trajectory")) +
      table([text("方法", "Method"), text("误差（目标 − 2）", "Error (target − 2)"), text("更新后 V(s₀) = 2 + α × 误差", "Updated V(s₀) = 2 + α × error")], [['TD(0)', fmt(one - 2), fmt(2 + alpha * (one - 2))], [`${n}-step`, fmt(nTarget - 2), fmt(2 + alpha * (nTarget - 2))], [terminal ? 'MC' : text("截断段回报", "Segment return"), fmt(full - 2), fmt(2 + alpha * (full - 2))]]) +
      note(text("截断不是终止", "Truncation is not termination"), terminal ? text("现在末尾是真终止，完整 MC 不再使用末状态价值。n 越小，对当前价值估计依赖越多；n 越大，包含的随机回报越多。仅看这一条轨迹不能比较方差。", "The final step now truly terminates, so complete MC does not use a final-state value. Smaller n relies more on current value estimates; larger n incorporates more random rewards. A single trajectory cannot establish a variance comparison.") : text("现在只是时间上限截断，最后奖励之后仍可能继续，因此使用 V(s₄)=5。这个“采样段 + bootstrap”不是纯 Monte Carlo。reset 后的新初始状态绝不能替代截断前的 final observation。", "This is now a time-limit truncation. The process can continue after the last reward, so use V(s₄)=5. This segment plus bootstrap is not pure Monte Carlo. The new initial state after reset must never replace the final observation before truncation."));
  };
  update(); return ui.bind(update);
}

export function renderCliff(host: HTMLElement): () => void {
  const ui = setup(host, text("学最优动作，与学正在执行的策略有什么不同？", "How does learning optimal actions differ from learning the behavior policy?"), text("经典悬崖网格：下排从 S 到 G，中间是悬崖；掉下去 −100 并回到 S，普通步 −1。分别训练 SARSA 与 Q-learning，再显示无探索的贪心路径。", "The classic cliff grid has S and G on the bottom row, with the cliff between them. Falling earns −100 and returns to S; an ordinary step earns −1. Train SARSA and Q-learning separately, then inspect greedy paths without exploration."),
    slider('epsilon', text("训练探索率 ε", "Training exploration rate ε"), .1, 0, .4, .02) + numberInput('episodes', text("每种算法的回合数", "Episodes per algorithm"), 400, 50, 2000) + numberInput('seed', text("随机种子", "Random seed"), 42, 0, 999999), button('train', text("训练两种表格策略", "Train both tabular policies")));
  const empty = () => { ui.target.innerHTML = note(text("先看行为策略", "Start with the behavior policy"), text("SARSA 的 TD 目标使用实际采样的下个动作；Q-learning 的目标使用最大 Q。此环境的持续探索让靠近悬崖更危险，但“SARSA 更安全”并不是所有任务的普遍定理。", "SARSA’s TD target uses the next action actually sampled; Q-learning’s target uses the maximum Q. Continued exploration makes the cliff edge risky here, but “SARSA is safer” is not a universal theorem.")); };
  empty();
  return ui.bind(empty, () => {
    const episodes = Math.round(ui.number('episodes')), seed = Math.round(ui.number('seed')), epsilon = ui.number('epsilon');
    const sarsa = trainCliff('sarsa', episodes, seed, epsilon), q = trainCliff('q', episodes, seed, epsilon);
    const windows = (xs: number[]) => Array.from({ length: Math.ceil(xs.length / 20) }, (_, i) => mean(xs.slice(i * 20, (i + 1) * 20)));
    const world = (path: number[], title: string, success: boolean) => `<section class="lab-path-panel"><h3>${title}</h3><div class="lab-cliff-world" role="img" aria-label="${text(`${title}的贪心评估路径`, `${title}: greedy evaluation path`)}">${Array.from({ length: 48 }, (_, s) => `<div class="${s > 36 && s < 47 ? 'cliff' : path.includes(s) ? 'path' : ''}">${s === 36 ? 'S' : s === 47 ? 'G' : s > 36 && s < 47 ? '×' : path.includes(s) ? '•' : ''}</div>`).join('')}</div><p>${success ? text("本次贪心策略到达终点", "This greedy policy reached the goal") : text("本次贪心策略未到达终点；可能尚未收敛或存在并列动作循环", "This greedy policy did not reach the goal; it may not have converged, or tied actions may create a loop")}</p></section>`;
    ui.target.innerHTML = `<div class="lab-stats">${stat(text("SARSA 最后 20 回合均值", "SARSA: mean of final 20 episodes"), fmt(mean(sarsa.returns.slice(-20))), text(`训练掉崖 ${sarsa.falls} 次`, `${sarsa.falls} cliff falls in training`))}${stat(text("Q-learning 最后 20 回合均值", "Q-learning: mean of final 20 episodes"), fmt(mean(q.returns.slice(-20))), text(`训练掉崖 ${q.falls} 次`, `${q.falls} cliff falls in training`))}</div>` +
      chart([{ name: 'SARSA', values: windows(sarsa.returns), color: COLORS.green }, { name: 'Q-learning', values: windows(q.returns), color: COLORS.orange }], text("本次实际训练回报，每 20 回合取均值；回合超过 600 步会截断", "Returns from this training run, averaged over 20 episodes; episodes are truncated at 600 steps"), { xLabel: text("训练回合（每点 20 回合）", "Training episode (20 per point)"), xMin: 20, xMax: episodes, yLabel: text("回合回报", "Episode return") }) +
      `<div class="lab-two-up">${world(sarsa.path, text("SARSA 贪心路径", "SARSA greedy path"), sarsa.reachedGoal)}${world(q.path, text("Q-learning 贪心路径", "Q-learning greedy path"), q.reachedGoal)}</div>` +
      note(text("读图边界", "Read the plot with these limits"), text("曲线含训练时的探索，下面的路径不含探索，两者对应不同评估条件。这里固定 α=0.5、γ=1，训练随机数流同种子初始化，但算法行为不同后采样轨迹会分叉。请换种子重复，不要只选最漂亮的一次。", "The curves include training exploration; the paths do not. They represent different evaluation conditions. Here α=0.5 and γ=1 are fixed. Both RNG streams start from the same seed, but sampled trajectories diverge as algorithm behavior differs. Repeat with other seeds instead of selecting the most attractive run."));
  });
}
