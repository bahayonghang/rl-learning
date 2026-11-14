import type { Chapter, Source } from '../types';

const FENCE = '```';

export const foundationSources: Source[] = [
  { id: 'f-sutton', title: 'Reinforcement Learning: An Introduction, 2nd edition', author: 'Richard S. Sutton · Andrew G. Barto', year: '2018', url: 'https://mitpress.mit.edu/9780262039246/reinforcement-learning/', note: '基础概念、表格方法与函数逼近的参考书；本文的例子与讲解为独立创作。' },
  { id: 'f-silver', title: 'UCL Reinforcement Learning Lectures', author: 'David Silver', year: '2015', url: 'https://www.davidsilver.uk/teaching/', note: 'MDP、动态规划、无模型预测与控制、函数逼近和策略梯度的原始课程资料。' },
  { id: 'f-probability', title: 'Statistics 110: Probability', author: 'Joe Blitzstein · Harvard University', year: '持续维护', url: 'https://stat110.hsites.harvard.edu/', note: '条件概率、期望、方差与全期望公式的补充学习入口。' },
  { id: 'f-decision', title: 'Algorithms for Decision Making', author: 'Mykel J. Kochenderfer · Tim A. Wheeler · Kyle H. Wray', year: '2022', url: 'https://algorithmsbook.com/decisionmaking/', note: '作者提供的决策算法教材，含 MDP、POMDP、规划与学习。' },
  { id: 'f-ucb', title: 'Finite-time Analysis of the Multiarmed Bandit Problem', author: 'Peter Auer · Nicolò Cesa-Bianchi · Paul Fischer', year: '2002', url: 'https://doi.org/10.1023/A:1013689704352', note: 'UCB 的原始分析；理论界依赖有界、平稳奖励等条件。' },
  { id: 'f-gym', title: 'Handling Time Limits', author: 'Farama Foundation', year: '持续维护', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/', note: 'terminated、truncated 与 bootstrap 的官方解释。' },
  { id: 'f-td', title: 'Learning to Predict by the Methods of Temporal Differences', author: 'Richard S. Sutton', year: '1988', url: 'https://jmvidal.cse.sc.edu/library/sutton88a.pdf', note: '时序差分预测的原始论文（大学托管副本）。' },
  { id: 'f-qlearning', title: 'Q-learning', author: 'Christopher J. C. H. Watkins · Peter Dayan', year: '1992', url: 'https://www.gatsby.ucl.ac.uk/~dayan/papers/wd92.html', note: '作者页面，含原文与勘误；收敛结论必须保留其假设。' },
  { id: 'f-triad', title: 'Emphatic Algorithms for Deep Reinforcement Learning', author: 'Ray Jiang et al.', year: '2021', url: 'https://proceedings.mlr.press/v139/jiang21j.html', note: '函数逼近、离策略与自举组合的不稳定性及其研究背景。' },
  { id: 'f-target', title: 'Why Target Networks Stabilise Temporal Difference Methods', author: 'Mattie Fellows · Matthew J. A. Smith · Shimon Whiteson', year: '2023', url: 'https://proceedings.mlr.press/v202/fellows23a.html', note: '目标网络稳定性的理论分析，不能简化为任意配置都保证收敛。' },
  { id: 'f-dqn', title: 'Human-level control through deep reinforcement learning', author: 'Volodymyr Mnih et al.', year: '2015', url: 'https://doi.org/10.1038/nature14236', note: 'DQN 原始研究：神经网络、经验回放与目标网络。' },
  { id: 'f-pytorch', title: 'Reinforcement Learning (DQN) Tutorial', author: 'PyTorch contributors', year: '持续维护', url: 'https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html', note: '可运行的 CartPole 与 PyTorch 教程，版本以官方页面为准。' },
  { id: 'f-doubleq', title: 'Double Q-learning', author: 'Hado van Hasselt', year: '2010', url: 'https://proceedings.neurips.cc/paper_files/paper/2010/hash/091d584fced301b442654dd8c23b3fc9-Abstract.html', note: '双估计器方法及最大化偏差的原始论文。' },
  { id: 'f-double-dqn', title: 'Deep Reinforcement Learning with Double Q-learning', author: 'Hado van Hasselt · Arthur Guez · David Silver', year: '2015 / AAAI 2016', url: 'https://arxiv.org/abs/1509.06461', note: 'Double DQN 将动作选择与动作估值分离。' },
  { id: 'f-reinforce', title: 'Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning', author: 'Ronald J. Williams', year: '1992', url: 'https://doi.org/10.1007/BF00992696', note: 'REINFORCE 原始论文。' },
  { id: 'f-policy-gradient', title: 'Intro to Policy Optimization', author: 'OpenAI Spinning Up', year: '持续维护', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html', note: '轨迹概率、log-derivative trick、reward-to-go 与 baseline 推导。' },
];

export const foundationChapters: Chapter[] = [
  {
    id: '01', number: 1, module: 1, title: '从一次行动，到长期回报',
    subtitle: '先把智能体、环境和反馈连成闭环，再讨论算法。',
    duration: 30, level: '入门', prerequisites: [],
    objectives: ['区分监督预测与序贯决策', '按统一时间下标写出一段轨迹', '手算折扣回报并解释折扣因子'],
    tags: ['智能体', '环境', '回报', '折扣因子'], lab: 'return',
    sources: ['f-sutton', 'f-gym'],
    body: String.raw`
## 先回答：我们到底要学会什么？

假设你有一个很准的温度预测模型。它回答“保持当前条件，十分钟后可能多热”。但操作员真正需要的是“现在应该怎样调整设定值，才能让未来一小时能耗较低、质量稳定”。预测给出可能发生什么；决策还要比较行动的后果。强化学习研究的正是这种**行动改变未来、反馈又改变行动**的闭环。

把问题写成算法前，先分清五个角色。智能体是做选择的规则或程序；环境是选择之外的过程；状态是用于决策的信息；动作是程序允许改变的量；奖励是评价结果的一项数值。策略 $\pi(a\mid s)$ 表示在状态 $s$ 下选择动作 $a$ 的概率。策略不一定是神经网络，一张表、一条规则也能构成策略。基本术语可对照 [Sutton 与 Barto 的教材](https://mitpress.mit.edu/9780262039246/reinforcement-learning/)。

在本教程的工业案例里，智能体每五分钟给出**有界的运行指标设定值增量**，由下层控制回路跟踪。它不直接驱动风机或阀门。现在先用一个无需工业背景的例子：仓储机器人可以立即取到价值较低的货物，也可以绕路去取更高价值的货物。真正需要比较的是整段路线的收益。

## 统一时间轴：奖励发生在行动之后

本教程统一使用轨迹 $S_t,A_t,R_{t+1},S_{t+1}$：先看到 $S_t$，选择 $A_t$，环境再返回 $R_{t+1}$ 与 $S_{t+1}$。某些论文把同一个奖励记为 $r_t$，只是下标约定不同，移植公式时要整套对齐。

${FENCE}mermaid
flowchart TD
    S["读取观测与当前状态"] --> P["策略选择动作"]
    P --> E["环境演化一个时间步"]
    E --> R["收到奖励与新观测"]
    R --> D{"任务真正结束了吗"}
    D -- "否" --> S
    D -- "是" --> U["记录轨迹并更新策略"]
    U --> S
${FENCE}

这里的“更新策略”可以每一步发生，也可以收集一批数据后发生。交互与学习是两个不同的时钟；环境采样一次，不意味着神经网络只能更新一次。

## 为什么不能只看眼前奖励？

从时刻 $t$ 开始的折扣回报定义为：

$$G_t=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1},\qquad 0\leq\gamma\leq1.$$

三步奖励为 $[2,-1,5]$，取 $\gamma=0.9$，则 $G_0=2-0.9+0.81\times5=5.15$。立即获得 4 后结束的路线，其回报为 4。前者第一步奖励较低，但在这个目标下更值得选择。若改成 $\gamma=0.2$，前者回报只有 2，偏好便反转。**修改折扣因子会修改优化目标，不只是修改训练速度。**

持续任务中，若奖励有界且 $\gamma<1$，无限和仍可收敛。$1/(1-\gamma)$ 可作为粗略的有效步数尺度，但不是严格的规划终点。五分钟一步与一分钟一步使用同一个 $\gamma$，对应的物理时间偏好不同；跨采样周期比较时要重新校准。

下面是完整的回报计算函数。从后往前累积，可以避免为每个起点重复计算整段和：

${FENCE}python
def discounted_returns(rewards, gamma):
    result = [0.0] * len(rewards)
    running = 0.0
    for t in range(len(rewards) - 1, -1, -1):
        running = rewards[t] + gamma * running
        result[t] = running
    return result

assert abs(discounted_returns([2, -1, 5], 0.9)[0] - 5.15) < 1e-9
${FENCE}

## 回报、价值和目标不是同一个数

一次实际轨迹得到的 $G_t$ 是随机样本；价值函数是给定条件下对这类样本取期望；学习目标通常还要对初始状态分布取平均。不要因为某一次探索的回报很高，就认为策略已经变好。至少需要独立评估、多个环境随机种子和与基线的比较。

奖励也并非天然存在的“正确答案”。若只奖励产量，策略可能牺牲质量；若只奖励平稳，策略可能永远不调整。工业质量与环境边界应作为显式约束另外报告，而不能靠一个总分掩盖。本章的仓储例子没有安全约束，不能直接等同于工业部署方案。

## 终止与暂停要分开

到达目标且任务结束，是终止；为了节约计算，把持续过程切成一百步，是截断。两者都需要重置采样器，但截断后的状态仍可能具有未来价值。[Gymnasium 官方说明](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/)专门区分了这两种信号。后续 TD、DQN、GAE 都会用到这个区别。

打开回报实验，先预测 $\gamma$ 变大后远期奖励的贡献，再拖动滑块验证。记录自己的预测与实际差异，比只观看动画更有价值。

## 把决策周期也当作建模的一部分

同样是“向上调整一次”，五秒执行一次与五分钟执行一次，会造成完全不同的累积变化。设计环境时先确定一条动作保持多久，再定义奖励覆盖哪个时间段。若动作持续时间不固定，普通固定步长 MDP 的时间含义就需要重新检查，而不是随意把不同长度日志拼成相邻 transition。

建议为第一个项目写一张时间对照表：观测形成时间、动作发出时间、下层执行时间、奖励归属区间、质量结果可用时间。每一行只引用当时已经获得的信息。这样，后面看到 $r_{t+1}$ 时知道它对应哪五分钟，看到化验数据时知道它属于哪批物料，而不是只在数学下标上保持一致。

## 练习与解答

一条路线的奖励为 $[0,0,10]$，另一条为 $[6]$。在什么折扣因子下第一条更优？若过程只是达到采样上限，应把未来价值设为零吗？

<details><summary>查看参考答案</summary>

第一条回报是 $10\gamma^2$，因此当 $\gamma>\sqrt{0.6}\approx0.7746$ 时更优；等号时两者相同。外部采样上限是截断，通常保留最终观测的 bootstrap 值。若任务本身规定“最后一刻即结束”，则是有限时域任务，需要把剩余时间纳入状态，并在真正终点令后续回报为零。

</details>
`,
  },
  {
    id: '02', number: 2, module: 1, title: '多臂老虎机：探索需要付出什么？',
    subtitle: '在最简单的决策问题里，理解信息为什么有价值。',
    duration: 35, level: '入门', prerequisites: ['01'],
    objectives: ['实现增量均值与 ε-greedy', '解释 UCB 的不确定性奖励', '区分实现回报和伪遗憾'],
    tags: ['Bandit', '探索利用', 'UCB', '遗憾'], lab: 'bandit',
    sources: ['f-sutton', 'f-ucb'],
    body: String.raw`
## 去掉状态转移，留下最核心的矛盾

有四台机器，每次只能选一台，机器按未知概率给出 1 或 0 的奖励。你既想多拿奖励，又需要知道哪台机器更好。与完整 MDP 相比，当前动作不会改变下一轮的状态；问题只剩“怎样从有限采样中分配尝试次数”。这就是多臂老虎机。

设第 $a$ 个动作的真实均值为 $\mu_a$，已经观察到 $N(a)$ 次，经验估计为 $\hat\mu(a)$。不要把“目前均值最高”误认为“真实均值最高”：一台只试过一次且恰好中奖的机器，其证据强度远低于一台试过一百次的机器。

## 用一行更新记录经验

均值不必每次遍历完整历史。第 $n$ 个奖励到来后：

$$Q_n=Q_{n-1}+\frac{1}{n}(R_n-Q_{n-1}).$$

例如某台机器已经试了四次，均值为 0.5，第五次奖励为 1，则新均值为 $0.5+(1-0.5)/5=0.6$。括号里的差是“本次结果比预期好多少”。这个“估计加学习率乘误差”的结构还会在 TD 和 Q-learning 中反复出现。

若环境非平稳，可用固定 $\alpha$ 替代 $1/n$，让新证据权重更大；代价是不再收敛为全部历史样本的普通平均。是否需要遗忘旧经验，应由过程是否发生漂移决定。

## ε-greedy：明确花出探索预算

以 $1-\epsilon$ 的概率选当前估计最好的动作，以 $\epsilon$ 的概率在所有动作中均匀随机选择。若有四个动作、唯一最优估计动作且 $\epsilon=0.2$，它被选中的概率是 $0.8+0.2/4=0.85$，不是 0.8。

${FENCE}python
import random

def epsilon_greedy(q, epsilon, rng):
    if rng.random() < epsilon:
        return rng.randrange(len(q))
    best = max(q)
    ties = [a for a, value in enumerate(q) if value == best]
    return rng.choice(ties)

rng = random.Random(42)
q, counts = [0.0] * 4, [0] * 4
# 在每次实际得到 reward 后执行：
a, reward = 2, 1.0
counts[a] += 1
q[a] += (reward - q[a]) / counts[a]
${FENCE}

随机打破并列很重要。若所有初始值都是零，而程序永远取第一个最大值，纯贪心策略会偏向数组最前面的动作。它可能把实现细节误当作经验。

## UCB：优先探索还不确定的动作

一种常见 UCB 形式选择：

$$A_t=\arg\max_a\left[Q_t(a)+c\sqrt{\frac{\ln t}{N_t(a)}}\right].$$

从未尝试的动作先各试一次，避免除以零。第一项代表已有收益证据，第二项代表不确定性。$N_t(a)$ 越少，探索奖励越大；一个动作长期没被选中时，$\ln t$ 的增长会让它重新获得关注。[Auer 等人的原始研究](https://doi.org/10.1023/A:1013689704352)分析了满足特定条件的有界奖励问题。不能把该理论保证直接迁移到漂移严重、反馈延迟或选择会改变工况的工业任务。

手算一个时刻：$t=100$，两台机器估计均值分别为 0.7 和 0.6，访问次数为 80 和 5。取 $c=0.2$，上置信指标约为 0.748 和 0.792。UCB 会选第二台：它暂时愿意放弃一点估计收益，换取更多信息。

Thompson Sampling 则从参数后验采样后选最优动作。Bernoulli 奖励可用 Beta 后验：先验 $\mathrm{Beta}(1,1)$，观察到三次成功、一次失败后得到 $\mathrm{Beta}(4,2)$。后验概率不是固定的探索比例，而会随证据改变。

## 怎样公平比较策略？

累计实现奖励会受到运气影响。已知仿真中的真实均值时，可以计算伪遗憾：

$$\bar R_T=\sum_{t=1}^{T}(\mu_* - \mu_{A_t}),\qquad \mu_*=\max_a\mu_a.$$

它度量“因为选错机器，期望上错失了多少”，不等于最优机器一条随机奖励曲线减当前曲线。网页实验使用明确标注的合成机器，故能显示这个量；真实业务一般不知道 $\mu_*$，不能假装可以直接观测遗憾。

比较时固定机器的真实参数，跨多个随机种子重复，让策略面对同等预算。观察短期奖励、长期遗憾与各臂次数。一次试验里贪心胜出，并不能证明探索无用；反过来，探索过多也确实会浪费预算。

## 把探索策略放回真实条件中

上述 UCB 探索项的常数与奖励尺度有关。若把 0–1 奖励改为 0–100，仍使用原来的探索系数，利用项与探索项的相对权重就变了。比较方法时应统一量纲，或说明如何缩放，不能只复制一个常见参数值。

固定 $\epsilon$ 也有容易忽略的长期代价：如果最优臂唯一且探索始终均匀随机，长期仍会持续抽到次优臂，因此累积伪遗憾通常持续增长。衰减探索可能减少这项成本，但衰减过早又可能错过正确动作。没有任何一句“多探索”或“尽快利用”能脱离任务条件成为答案。

工业过程更不能把四个操作方案随便轮流试验。Bandit 的无状态转移假设常被设备惯性破坏，安全约束也限制可选动作。它在这里用于理解信息价值，不能替代完整的过程建模。

## 练习与解答

五个动作、$\epsilon=0.1$，若两个动作并列最大且均匀打破并列，每个最大动作被选中的概率是多少？为什么把 $ε$ 一开始就降到零可能出问题？

<details><summary>查看参考答案</summary>

每个最大动作概率为 $(1-0.1)/2+0.1/5=0.47$，另外三个各为 0.02。太早停止探索会把早期噪声固定成长期偏见；但持续固定探索也会持续支付探索代价。合理安排需要结合采样预算、漂移程度和理论假设，而不能只背一个衰减公式。

</details>
`,
  },
  {
    id: '03', number: 3, module: 1, title: '够用的概率：从样本到期望',
    subtitle: '把公式中的 E、条件概率和方差翻译成可计算的操作。',
    duration: 40, level: '入门', prerequisites: ['01', '02'],
    objectives: ['计算离散期望与条件期望', '用全期望公式连接策略和环境', '理解样本均值、方差与偏差'],
    tags: ['概率基础', '条件期望', '方差', '采样'],
    sources: ['f-probability', 'f-decision'],
    body: String.raw`
## 不必先学完整概率论，但要弄清四件事

强化学习公式常让人产生距离感，通常因为把三个层次混在一起：随机变量、一次实现值、对所有可能实现求平均。用大写 $R$ 表示随机奖励，用小写 $r$ 表示某次观察到的奖励，用 $\mathbb E[R]$ 表示按概率加权的平均。神经网络输出的“估计值”又是对这个期望的近似，不是额外的一次真实奖励。

本章只补四个工具：条件概率、期望、全期望公式、方差。需要系统补课时，可沿 [Harvard Stat110](https://stat110.hsites.harvard.edu/) 中这些主题继续读；无需在开始 MDP 前把所有概率分布背完。

## 期望是加权和，不是最可能结果

若一次动作有 80% 概率获得 2，20% 概率获得 -3，则：

$$\mathbb E[R]=0.8\times2+0.2\times(-3)=1.$$

奖励 1 从未出现过，却完全可以是正确期望。这个区别很重要：价值为 1 不代表下一次一定得到 1，也不代表发生坏结果时模型一定错误。

随机变量经过非线性函数后，通常不能把函数与期望交换。例如 $X$ 以相同概率取 -1 和 1，则 $\mathbb E[X]=0$，但 $\mathbb E[X^2]=1\ne0$。后面最大化偏差也源于类似的非线性操作；不能把“先对有噪声估计取最大”当成“对真实均值取最大”。

## 条件期望：先规定我们知道什么

$\mathbb E[R\mid S=s,A=a]$ 不是对全部轨迹混在一起平均，而是讨论给定状态和动作下的奖励。如果只看温度，样本里可能混合不同原料批次；这些批次的平均响应可能差异很大。写清条件，是避免把混杂数据当成同一过程的第一步。

设状态 $s$ 下策略选择动作 $a_1$ 的概率为 0.6，选择 $a_2$ 的概率为 0.4。两个动作的条件奖励均值分别为 3 和 -1。则：

$$\mathbb E[R\mid S=s]=\sum_a\pi(a\mid s)\mathbb E[R\mid s,a]=0.6\times3+0.4\times(-1)=1.4.$$

这就是全期望公式的一次应用。Bellman 方程会再加一层：选动作后，环境还会随机走向不同状态。因此一个期望里常同时存在策略随机性与环境随机性。

## 方差告诉我们一次结论有多不稳定

对前面取 2 或 -3、均值为 1 的奖励：

$$\operatorname{Var}(R)=0.8(2-1)^2+0.2(-3-1)^2=4.$$

标准差是 2，单位与奖励一致。若 $n$ 个样本独立同分布，样本均值方差为 $4/n$。样本数扩大四倍，标准误差才缩小一半。因此“多跑一点”并不能线性提高精度。连续工业采样往往高度相关，不能把相邻的一万条记录当作一万个独立实验。

${FENCE}python
import random
import math

rng = random.Random(42)
rewards = [2.0 if rng.random() < 0.8 else -3.0 for _ in range(1000)]
mean = sum(rewards) / len(rewards)
sample_variance = sum((r - mean) ** 2 for r in rewards) / (len(rewards) - 1)
standard_error = math.sqrt(sample_variance / len(rewards))
print(mean, sample_variance, standard_error)
# 这是有限样本估计；不要断言它恰好等于 1、4 和 0.0632。
${FENCE}

这里的随机种子用于复现实验，不会让一次有限样本平均“变成真值”。比较算法时，训练种子代表不同的学习经历，评估种子代表不同的测试环境经历，二者都应记录。

## 偏差和方差分别在问什么？

偏差问“重复采样后，估计平均偏离真值多少”；方差问“不同采样得到的估计相互差多远”。一个常数估计可能方差为零，却严重错误。MC 用完整回报作目标，可能波动较大；TD 借助当前价值估计，更快得到目标，但会继承估计误差。只有具体说明目标、采样过程和假设后，这些比较才有意义。

均值不是唯一需要的风险指标。两个策略可有相同平均回报，却一个偶尔造成严重越界。工业实验至少还需报告约束违反频率、最大越界幅度、尾部表现和回退次数。这里先建立统计语言，后续再进入 CMDP。

## 从公式读出实现步骤

看到 $\mathbb E_{a\sim\pi,\,s'\sim P}[f(s,a,s')]$ 时，可以作两种实现：已知离散概率就枚举所有 $a,s'$ 加权求和；不知道概率但能交互就多次采样，再对 $f$ 求平均。动态规划偏向前者，MC 与 TD 依赖后者。这是概率记号与算法之间最重要的一座桥。[决策算法教材](https://algorithmsbook.com/decisionmaking/)进一步讨论了这两种计算方式。

## 概率与概率密度，提前分清一个坑

离散动作的 $\pi(a\mid s)$ 是概率，所有动作概率之和为 1。连续动作的策略通常给出概率密度，一个精确实数点的概率为零；一个区间内的概率才是密度积分。密度可以大于 1，因此看到连续策略的密度值超过 1，不应直接断言实现错误。

后续 PPO 使用的新旧策略比，在离散情况下是概率比，在连续情况下是同一动作位置的密度比。两者都需要在相同测度、相同动作变换下比较。对动作进行了缩放或 tanh 变换后，不能仍然无条件沿用变换前的密度。

另外，“不相关”比“独立”弱；时序数据看起来相关系数不大，也不能自动视作独立试验。评估算法差异时，独立训练重复通常比把同一轨迹切成很多小段更能说明学习过程的稳定性。

## 练习与解答

动作 A 总是得 1；动作 B 以相同概率得 -1 或 3。它们的期望与方差分别是多少？只最大化平均单步奖励能区分它们吗？

<details><summary>查看参考答案</summary>

两者期望都是 1。A 的方差为 0；B 的方差为 $0.5(-1-1)^2+0.5(3-1)^2=4$。平均奖励目标无法区分，风险约束或不同的效用目标才可能产生偏好。不能在目标未改变的情况下，指责期望最优算法“不懂风险”。

</details>
`,
  },
  {
    id: '04', number: 4, module: 2, title: 'MDP 与 POMDP：先把问题写对',
    subtitle: '状态不是传感器清单，而是关于未来的充分信息。',
    duration: 40, level: '入门', prerequisites: ['01', '03'],
    objectives: ['写出 MDP 五元组与初始分布', '诊断状态缺失和部分可观测性', '区分自然终止、时间截断与有限时域'],
    tags: ['MDP', 'POMDP', '状态设计', 'Gymnasium'],
    sources: ['f-decision', 'f-silver', 'f-gym'],
    body: String.raw`
## 算法只能优化你真正定义的问题

“让能耗更低”还不是一个强化学习环境。你需要说明何时决策、能看到什么、能改变什么、动作怎样影响下一步、奖励何时到账，以及任务是否结束。把这些条件明确写下来，比先选 PPO 还是 SAC 更重要。

常见折扣 MDP 写为 $\mathcal M=(\mathcal S,\mathcal A,P,R,\gamma)$，实验还需初始状态分布 $\rho_0$。$P(s'\mid s,a)$ 描述状态转移概率，$R(s,a)$ 常表示条件期望奖励；若奖励与下一状态联合随机，可以直接写 $p(s',r\mid s,a)$。这两个记法都有效，但一个项目应采用一致定义。详细形式可参考[作者公开的决策算法教材](https://algorithmsbook.com/decisionmaking/)。

## 马尔可夫性不是“世界没有记忆”

马尔可夫条件是：给定当前状态和动作，额外历史不再改善下一步分布的预测。

$$P(S_{t+1}\mid S_0,A_0,\ldots,S_t,A_t)=P(S_{t+1}\mid S_t,A_t).$$

世界当然有惯性。关键在于你把相关记忆是否装进了状态。一个小车只给位置，相同位置可能正在向左或向右，下一步不同；加上速度，描述才更充分。对温度控制，只给当前温度往往无法区分正在升温还是降温；可以考虑历史、变化率与执行器状态。

不过，堆更多变量不自动保证马尔可夫性。遗漏的原料特性、设备内部蓄热、未测扰动仍然可能影响未来。必须把“近似状态表示”与“完整物理状态”区分开。

## 看不全时，就是 POMDP 的语言

真实状态 $S_t$ 不可直接获取时，智能体看到观测 $O_t$。理论上可以维护信念状态 $b_t(s)=P(S_t=s\mid O_{0:t},A_{0:t-1})$；实践中常使用历史窗口、循环网络或状态估计器近似它。历史窗口解决的是信息表示问题，不会凭空提供未测量的事实。

本仓库的工业观测合同保留 120 分钟历史、当前设定值、软测量、最近一次化验与化验年龄、原料模数。化验在时刻 $t$ 还未发布时，不能为了让预测更准，使用事后回填的最新化验值。这会产生时间泄漏，训练表现再好也无法在线复现。

${FENCE}mermaid
flowchart TD
    Q["定义业务问题与决策周期"] --> O["列出当时真正可获得的信息"]
    O --> M{"当前观测能充分描述过程吗"}
    M -- "近似可以" --> S["构造状态表示"]
    M -- "存在延迟或隐变量" --> H["加入历史与状态估计"]
    H --> S
    S --> A["定义动作边界和奖励成本"]
    A --> T["定义终止与截断语义"]
    T --> C["先用随机策略检查环境"]
${FENCE}

## 一个完整的小型建模例子

考虑库存教学环境，每天决定补货量。状态为当前库存和已下单未到货数量；动作是从有限集合选择订货量；环境随机产生需求、推进物流；奖励为销售利润减持有与缺货成本；初始分布规定起始库存。若遗漏在途订单，相同库存下明天到货量可能不同，状态就有明显缺失。

再看工业映射：状态来自过去可用信息；动作是归一化设定值增量 $a_t\in[-1,1]^K$；物理建议为 $Y^{sp}_{t+1}=Y^{sp}_t+\mathrm{RATE}\odot a_t$。奖励表达能耗与平滑偏好，质量和环境边界单列为约束成本。网页只进行教学仿真，不连接设备。

## 两种结束信号怎样进入代码？

按照 [Gymnasium 官方接口](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/)，一步返回五个对象。下面是持续任务的采样骨架：

${FENCE}python
obs, info = env.reset(seed=42)
for t in range(horizon):
    action = policy(obs)
    next_obs, reward, terminated, truncated, info = env.step(action)
    # 存储真正的最终观测，别误存自动 reset 后的观测。
    replay.add(obs, action, reward, next_obs, terminated)
    obs = next_obs
    if terminated or truncated:
        obs, info = env.reset()
${FENCE}

**重置采样**用 $terminated\lor truncated$；**停止未来价值自举**一般只用 $terminated$。对本仓库持续工业过程，固定评估窗口结束属于截断。若任务是“未来十步内完成交货”，十步期限本身属于任务定义，则应把剩余步数纳入状态，并在期限结束时真正终止。

## 先检查环境，再检查学习器

写下同一初始状态、同一动作的预期响应；验证动作上下界、奖励单位、观测形状、随机种子和终止条件。让零动作、随机策略、简单规则各跑一遍。如果零动作都造成物理量瞬间跳变，训练失败首先应怀疑环境。环境通过接口检查，只能证明格式正确，不能证明动力学真实或奖励合理。

## 一个状态审查的具体方法

从历史日志里找两段“当前观测近似相同，但过去走势不同”的片段，比较相同动作下后续响应。如果响应有系统差别，说明当前表示可能遗漏了历史信息。这个检查不能证明完整马尔可夫性，却能直接揭示一些明显的状态混叠。

对执行滞后也要做相似审查：刚刚发出的设定值是否已经被下层回路接收，控制器是否饱和，上一轮动作是否仍在生效？如果这些信息影响未来，仅记录新的目标数字就可能不足。教程提出这些审查问题，不修改仓库既有状态维度；改变正式观测合同应另行验证数据可用性和接口兼容性。

## 练习与解答

一个温控状态只包含当前温度和设定值。为什么相同状态下仍可能出现不同下一温度？如果加入最近三次温度，还能直接宣称它就是严格 MDP 吗？

<details><summary>查看参考答案</summary>

设备蓄热、不同升降温速度、执行器滞后或原料扰动都可能造成差别。历史可以减少状态混叠，但无法保证覆盖所有隐变量。应称其为近似状态表示，通过预测残差、不同历史条件下的转移差异和实际任务表现进行验证；不要把建模假设写成已证明事实。

</details>
`,
  },
  {
    id: '05', number: 5, module: 2, title: 'Bellman 方程：把未来拆成一步',
    subtitle: '不是背公式，而是学会递归地计算一个决定的后果。',
    duration: 40, level: '入门', prerequisites: ['03', '04'],
    objectives: ['从回报递推推导 Bellman 期望方程', '区分 V、Q 与优势', '区分评价一个策略和寻找最优策略'],
    tags: ['Bellman', '价值函数', 'V 与 Q'], lab: 'bellman',
    sources: ['f-sutton', 'f-decision', 'f-silver'],
    body: String.raw`
## 为什么需要价值函数？

若只看下一步奖励，我们看不到动作的长期影响；若为每个动作都重新模拟所有未来，计算量又很大。价值函数把“从这里出发，之后按某个策略行动会怎样”压缩为一个数。它像一本可以反复查询的未来账本，但账本里的数始终依赖策略、奖励和折扣约定。

$$V^\pi(s)=\mathbb E_\pi[G_t\mid S_t=s],\qquad Q^\pi(s,a)=\mathbb E_\pi[G_t\mid S_t=s,A_t=a].$$

$V$ 从状态出发，第一步也按策略选动作；$Q$ 固定第一步动作，之后才按策略继续。因此：

$$V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a).$$

不要把 $Q^\pi(s,a)$ 理解成动作本身的“固定好坏”。同样的一次绕路，在后续会及时回主路的策略下和继续迷路的策略下，价值完全不同。

## 从一个等式推导整套方法

将回报第一项提出来：

$$G_t=R_{t+1}+\gamma G_{t+1}.$$

给定当前状态，对动作、转移与未来策略取条件期望：

$$V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^\pi(s')\right].$$

这就是 Bellman 期望方程。它没有声称未来只剩一步；它把更远的未来封装到了 $V^\pi(s')$ 里。嵌套期望的展开可参照 [Silver 的 MDP 与动态规划课程](https://www.davidsilver.uk/teaching/)。本节用下面的小问题独立完成数值推演。

设只有一个非终止状态 A。固定策略每一步得到奖励 1，以 0.5 概率留在 A，以 0.5 概率终止；终止后的价值为零，$\gamma=0.9$。则：

$$V(A)=1+0.9\times[0.5V(A)+0.5\times0],\qquad V(A)=\frac{1}{0.55}\approx1.8182.$$

如果从零开始反复代入，得到 $1,1.45,1.6525,\ldots$，逐渐接近同一个值。只看即时奖励会得到 1，恰好漏掉了可能继续获得的奖励。

## 评价与最优性，差一个 max 却是不同问题

评价问“给定策略会得到多少”；控制问“可以选择策略时，最多得到多少”。后者使用 Bellman 最优方程：

$$Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma\max_{a'}Q^*(s',a')\right].$$

前者按 $\pi$ 加权平均，后者选最大动作。把期望误写成最大值，会把“当前探索策略的价值”偷换为“假设未来都贪心行动的价值”。这正是后面 SARSA 与 Q-learning 的关键分界。

举例：某状态有两个动作，$Q(s,\text{左})=3$，$Q(s,\text{右})=5$，策略以 0.75 概率向左。该策略的状态价值是 $0.75\times3+0.25\times5=3.5$。选择最优动作的价值则是 5。二者都可以正确，但回答的问题不同。

## 优势：比当前习惯好多少

$$A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).$$

以上例为准，左的优势为 -0.5，右为 1.5。优势衡量“这个动作比当前策略在这里的平均表现好多少”。在同一策略下加权平均优势为零：$0.75(-0.5)+0.25(1.5)=0$。后续 Actor-Critic 会用它告诉 Actor 应该增加还是减少某个动作的概率。

## 写一个可以手工核对的 backup

${FENCE}python
def expected_backup(transitions, values, gamma):
    # 每一项为 (概率, 下一状态, 奖励, 是否真正终止)。
    total = 0.0
    for probability, next_state, reward, terminal in transitions:
        future = 0.0 if terminal else values[next_state]
        total += probability * (reward + gamma * future)
    return total

v = {"A": 0.0, "end": 0.0}
model = [(0.5, "A", 1.0, False), (0.5, "end", 1.0, True)]
for _ in range(30):
    v["A"] = expected_backup(model, v, 0.9)
print(v["A"])
${FENCE}

这里每个分支的概率必须合计为 1，终止奖励只记一次。常见错误是进入终止状态时已经奖励 10，又把终止状态价值设置为 10，于是重复计奖。采用“进入终点得到奖励、终点后价值为零”的约定，通常更容易检查。

## 为什么反复代入可能收敛？

对有限状态、有限动作、有界奖励、$\gamma<1$ 的折扣问题，Bellman 算子在最大范数下是压缩映射，前后两份估计的差最多缩为原来的 $\gamma$ 倍。这个结论支撑表格动态规划；加入任意神经网络、数据分布改变和近似优化后，不能直接沿用该保证。相关理论背景可继续查阅[决策算法教材](https://algorithmsbook.com/decisionmaking/)。

打开 Bellman 实验时，观察数值如何从奖励附近逐步向前传播。一次 backup 不是“发现整条最优路线”，而是把当前知道的下一步价值往前传了一层。

另一个检查是奖励单位：如果奖励以每五分钟的能耗差计量，价值就是这些奖励的折扣累积，而不是某一时刻的温度或吨产品煤耗。给价值图标注单位或归一化约定，能避免把数学分数误读成直接的物理预测。

## 把一次 backup 拆成三个可检查的步骤

第一步列出候选动作；第二步在每个动作下列出可能的下一状态与对应概率；第三步才计算奖励加未来价值。需要评价策略时，再把动作得分按策略概率加权；需要控制时，再对动作得分取最大。把两个随机层次和一个选择层次分开，很多看似复杂的公式会变成几行表格。

例如“动作有 70% 成功率”并不代表它的策略概率是 0.7。策略概率描述智能体选不选这个动作；成功率描述动作已经选定后环境怎样响应。若智能体只有 20% 概率选择它，该成功分支的联合概率才是 $0.2\times0.7=0.14$。混淆这两个概率，会让计算结果虽落在合理范围，却系统性偏离真实目标。

## 练习与解答

一个动作立即得 2，之后以 0.7 概率进入价值为 4 的状态，以 0.3 概率终止。$\gamma=0.9$ 时动作价值是多少？若把第二个分支也错误加上 4，会多算多少？

<details><summary>查看参考答案</summary>

正确值为 $2+0.9\times(0.7\times4+0.3\times0)=4.52$。错误值为 5.6，多算 1.08。注意即时奖励 2 在两种分支下都存在，因此先写为 2 没有问题；若奖励随分支变化，应一起放进概率加权和里。

</details>
`,
  },
  {
    id: '06', number: 6, module: 2, title: '动态规划：模型已知时怎样规划？',
    subtitle: '用策略评估、策略改进和价值迭代建立第一条算法主线。',
    duration: 40, level: '入门', prerequisites: ['05'],
    objectives: ['实现一次同步价值迭代', '区分策略迭代与价值迭代', '理解模型误差与计算复杂度的限制'],
    tags: ['动态规划', '价值迭代', '策略迭代'], lab: 'gridworld',
    sources: ['f-silver', 'f-decision'],
    body: String.raw`
## 先给算法一个有利条件：知道环境模型

假设每个状态下，所有动作的转移概率与奖励都已知。我们就不用靠实际行动来估计一个动作的结果，而可以在纸上枚举。这个计算过程称为规划；动态规划利用子问题之间共享的价值，把多步决策拆成一系列 Bellman 更新。[Silver 的动态规划课程](https://www.davidsilver.uk/teaching/)给出了完整理论背景。

先用网格世界：每个格子是状态，四个方向是动作，撞墙保持原位，普通移动奖励 -1，进入目标后任务结束。在这个定义下，最大化回报倾向于缩短到达目标的路径。若加入滑动概率，同一个动作可能走向多个格子，backup 要按所有转移分支加权，不能只算最可能的一支。

## 策略迭代：先理解当前策略，再改善它

策略迭代交替做两件事。策略评估固定 $\pi$，求 $V^\pi$；策略改进根据当前价值选出更好的动作：

$$\pi_{\mathrm{new}}(s)\in\arg\max_a\sum_{s',r}p(s',r\mid s,a)[r+\gamma V^\pi(s')].$$

第一步不改变策略，第二步不把已有价值当最终答案。只要还有动作改善，就重新评估新策略。若评估做到足够准确，在标准有限折扣 MDP 下可以建立策略改进性质；这是清晰建模条件下的结论，不等于所有近似神经网络优化都单调进步。

## 价值迭代：每次只评估一点，再贪心改进

价值迭代直接使用最优 backup：

$$V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)[r+\gamma V_k(s')].$$

它可以理解为把评估与改进紧密交织。算法中的 $k$ 表示计算轮数，不是环境真实时间。不要把“做一千次价值迭代”写成“智能体与环境交互一千次”。已知模型时，访问表格并不消耗真实采样。

${FENCE}python
def value_iteration(model, states, actions, gamma=0.95, tolerance=1e-8):
    v = {state: 0.0 for state in states}
    while True:
        new_v = {}
        for state in states:
            scores = []
            for action in actions[state]:
                score = sum(
                    p * (r + gamma * (0.0 if terminal else v[next_state]))
                    for p, next_state, r, terminal in model[state, action]
                )
                scores.append(score)
            new_v[state] = max(scores) if scores else 0.0
        change = max(abs(new_v[s] - v[s]) for s in states)
        v = new_v
        if change < tolerance:
            return v
${FENCE}

这段函数要求模型概率有效、动作集合有限且 $\gamma<1$。它使用同步更新：同一轮所有状态只读取旧的 $v$。若一边计算一边覆盖，得到的是异步或原位更新，数值传播速度会不同。两者都可能有效，但比较轮数时要说明更新方式。

## 手工推演，看到价值如何向前传播

考虑三格直线 A → B → G，只有向右动作。进入 G 的奖励为 10，其余奖励为 0，$\gamma=0.9$，终点后价值为零。初始全部为零。第一轮 B 得到 10，A 仍为 0；第二轮 A 得到 9。后续不再改变。最远的价值信息需要逐步沿图传播。

若 A 还有一个“立即退出并得 8”的动作，初期 A 会选择退出；等 B 的价值传回来后，它才会选择向右。**中间迭代得到的贪心策略可能暂时错误**，这是因为价值尚未传播完成，而不是算法逻辑矛盾。

## 停止条件应该检查什么？

$\Delta_k=\max_s|V_{k+1}(s)-V_k(s)|$ 衡量相邻计算结果变化，但不是直接测得的真实误差。在压缩条件下可以给出误差界；当 $\gamma$ 接近 1 时，变化很小仍可能对应较大的剩余误差。因此实验需要同时记录容差、折扣因子、更新次数和提取后的策略表现。

一个实用的检查是：用最终价值重新计算每个动作的 backup，确认策略选择一致；再从所有可达起点进行模拟，检查是否陷入非终止循环。奖励设计不合理时，循环本身可能是环境定义下的最优行为；那需要修改问题定义，而非强迫算法“懂常识”。

## 动态规划为什么无法包办工业任务？

首先，完整转移模型通常未知。其次，多维连续状态无法轻易列成表。若十个变量各离散成十档，就有 $10^{10}$ 个组合，简单扩大数组不能解决维数灾难。再次，模型误差会被规划重复利用：策略可能专门挑模型乐观的区域。

但动态规划仍是很好的教学与调试基准。小环境里它提供可核对的最优值，用来检查 MC、TD、Q-learning 是否学对。

可下载本教程的[完整表格实验脚本](code/tabular_foundations.py)，运行 **python tabular_foundations.py --method q_learning --seed 42**。脚本只用 Python 标准库，先求解 4×4 网格的动态规划基准，再训练并独立评估学习策略；输出全部是教学仿真结果。后续模型基强化学习重新使用“学习模型后规划”的思想，只是必须面对模型误差和分布外问题。相关扩展可参考[决策算法教材](https://algorithmsbook.com/decisionmaking/)。

## 区分规划预算与模型可信度

对同一张转移表多做十次 backup，只增加计算，没有增加现实证据。若表格里的转移概率本来就是用少量历史样本估计的，规划收敛只表示“对这张表算得更准确”，不表示这张表更接近真实世界。因此实验报告要把模型估计误差与规划求解误差分开。

当状态较多时，也不一定每轮遍历全部状态。可以只更新相关或误差较大的状态，但要清楚哪些状态尚未被充分处理。不同算法之间比较计算效率时，报告实际 backup 次数、耗时和模型访问次数，比只报告含义不同的“迭代轮数”更公平。

## 练习与解答

把上面的直线例子改为进入 G 奖励 10，每次非终止移动奖励 -1。A 可以直接退出得 8。$\gamma=0.9$ 时，A 最后会选择什么？

<details><summary>查看参考答案</summary>

B 向右进入 G 得 10，所以 $V(B)=10$；A 经 B 的回报为 $-1+0.9\times10=8$，与退出相同。两种动作都可为最优，程序需要明确并列处理。若代码由于固定取第一个最大值而总显示退出，不能解释为另一路线不最优。

</details>
`,
  },
  {
    id: '07', number: 7, module: 2, title: 'MC、TD 与 n-step：向什么目标学习？',
    subtitle: '完整结局、一步预期和中间折衷，是同一个估计问题的不同答案。',
    duration: 45, level: '进阶', prerequisites: ['05', '06'],
    objectives: ['写出 MC 与 TD(0) 的更新目标', '手算 TD 误差与 n-step return', '正确处理轨迹截断的 bootstrap'],
    tags: ['Monte Carlo', 'TD', '自举', 'n-step'], lab: 'td',
    sources: ['f-td', 'f-sutton', 'f-gym'],
    body: String.raw`
## 不知道转移概率，仍然可以估值

动态规划要求知道模型，现实中通常只有采样轨迹。假设先固定策略，暂时不讨论怎样改策略；目标只是从多次体验中估计 $V^\pi$。最直接的方法是从某状态出发，把实际完整回报平均起来。这叫 Monte Carlo，简称 MC。

$$V(S_t)\leftarrow V(S_t)+\alpha[G_t-V(S_t)].$$

若每次访问都使用 $\alpha=1/N(S_t)$，它就是样本均值。一次 episode 中同一状态可能出现多次：first-visit MC 每局只用第一次访问，every-visit MC 使用全部访问。实验必须说明采用哪一种，不能不知不觉混在一起。

## TD：不等结局，先用下一步预测修正当前预测

若一条工业轨迹连续运行数月，你不想等到结束才更新一次价值。TD(0) 用即时奖励加下一状态估计作目标：

$$\delta_t=R_{t+1}+\gamma(1-d_t)V(S_{t+1})-V(S_t),$$

$$V(S_t)\leftarrow V(S_t)+\alpha\delta_t.$$

$d_t$ 只表示真正终止。用一个估计更新另一个估计，称为 **bootstrapping（自举）**。[Sutton 的原始 TD 论文](https://jmvidal.cse.sc.edu/library/sutton88a.pdf)研究了利用相邻预测之间的差进行学习。这里不需要环境可微，也不需要知道状态转移概率。

手算：当前 $V(s)=2$，下一状态 $V(s')=5$，奖励 1，$\gamma=0.9$、$\alpha=0.1$。目标为 5.5，TD 误差为 3.5，新值为 2.35。若这是终止转移，目标变为 1，新值为 1.9。一次布尔标志错误，就会系统性改变学习目标。

## 用同一条轨迹比较 MC 与 TD

轨迹为 A → B → 终点，奖励依次为 0 和 4，$\gamma=0.9$，开始时 $V(A)=V(B)=0$。MC 等结束后知道 A 的回报为 3.6、B 为 4。顺序 TD 在 A → B 时目标是零，只能先更新 B；A 要等以后再次访问，或通过额外 replay 更新，才看到 B 的新价值。

这解释了两种方法的不同传播方式。MC 一次把实际终局信息传回较远状态，但该终局可能很偶然；TD 可以更早更新、复用下一状态的统计信息，但暂时不准的下一状态值也会传回。**“MC 无偏、TD 有偏”是一种特定目标下的简写，不是任何设置下都成立的完整定理。**

## n-step：用几步事实，再接一个估计

若接下来 $n$ 步均未真正终止：

$$G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV(S_{t+n}).$$

$n=1$ 就是 TD(0)；达到真正终点且不再自举时，变成完整回报。例：两步奖励 1、2，$V(S_{t+2})=4$，$\gamma=0.9$，两步目标是 $1+0.9\times2+0.81\times4=6.04$。若第二步真正终止，最后一项应去掉，目标为 2.8。

${FENCE}python
def n_step_target(rewards, gamma, final_value, terminated):
    target = 0.0
    weight = 1.0
    for reward in rewards:
        target += weight * reward
        weight *= gamma
    if not terminated:
        target += weight * final_value
    return target

assert abs(n_step_target([1, 2], 0.9, 4, False) - 6.04) < 1e-9
assert abs(n_step_target([1, 2], 0.9, 4, True) - 2.8) < 1e-9
${FENCE}

代码里的最后一个状态必须与奖励序列相衔接。向量环境自动 reset 后返回的新 episode 初始观测，不能拿来作为旧 episode 的最终值。

## 截断并不是 MC 获得了完整结局

若只采样了前二十步，剩余回报未知，直接把尾部设为零会改变估计对象。可以明确改为二十步有限时域任务，也可以用最终观测的价值估计补上尾部；后一种已经是自举目标，不再是完整轨迹 MC。[Gymnasium 的时间限制说明](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/)展示了为什么截断不应直接清空未来值。

在线策略评估还需注意数据来源。MC 与 TD 在此都假设轨迹由待评估策略生成；如果轨迹来自旧策略，估计对象会改变，需要离策略校正或专门算法。把“有一堆日志”直接等同于“可以评估任何新策略”，是工业离线研究中常见的跨越。

## 实验应该看什么？

在一个已知真实价值的小环境里，比较估计误差、学习步数和不同种子之间的波动。统一采样预算，并分别调节学习率。观察 TD 越来越快并不意味着它在所有环境都更好；较长 n-step 的效果还取决于奖励延迟、估计误差和策略变化速度。

画误差曲线时，给未访问状态与已访问状态分别统计也很有帮助。否则大量从未访问的状态会把平均误差拉高，掩盖常见状态已经学好的事实；只报告常见状态又可能掩盖覆盖缺口。两组结果对应不同问题，应一起解释。

## 学习率决定“记忆”怎样累积

更新式里 $\alpha$ 越大，当前目标对旧估计的覆盖越强；它不是单纯的动画播放速度。固定小学习率可能更平滑，却会适应得慢；固定大学习率可能追随漂移，但也更容易放大噪声。若环境平稳、采用递减步长讨论渐近收敛，通常还需要访问次数趋于无穷等条件，不能从一个收敛定理跳到“训练一千步一定正确”。

建议用三组不同初始价值做同一个预测实验。若方法能逐渐修正乐观和悲观初始化，说明数据确实在起作用；若某些状态从未被访问，它们保持初始值并非算法失败，而是没有证据。将“未访问”“估计不准”“目标定义错误”分开诊断，能减少盲目调参。

## 练习与解答

$V(s)=3$，奖励为 2，$V(s')=8$，$\gamma=0.5$、$\alpha=0.2$。分别计算普通转移、真正终止、外部时间截断时的 TD 更新。

<details><summary>查看参考答案</summary>

普通转移与外部截断都保留 bootstrap：目标为 6，新值为 $3+0.2(6-3)=3.6$。真正终止时目标为 2，新值为 2.8。截断时需要使用实际最终观测的价值，而不是 reset 后初始观测的价值。

</details>
`,
  },
  {
    id: '08', number: 8, module: 2, title: 'SARSA 与 Q-learning：到底在学谁？',
    subtitle: '行为策略与目标策略的区别，比记住更新公式更重要。',
    duration: 45, level: '进阶', prerequisites: ['02', '07'],
    objectives: ['从 SARSA 元组解释 on-policy', '从 max 目标解释 off-policy', '正确理解悬崖行走与收敛条件'],
    tags: ['SARSA', 'Q-learning', 'On-policy', 'Off-policy'], lab: 'cliff',
    sources: ['f-qlearning', 'f-sutton', 'f-silver'],
    body: String.raw`
## 从“评价”走向“控制”

前一章固定策略估计状态价值。现在要一边收集数据，一边改善策略。若没有环境模型，单独知道 $V(s)$ 无法轻易比较每个动作，因为还不知道动作会把我们带到哪里。因此直接估计 $Q(s,a)$，再根据 Q 值选择动作，更自然。

行为策略 $\mu$ 决定数据怎么产生；目标策略 $\pi$ 决定想评估或改进谁。两者相同称为 on-policy，允许不同称为 off-policy。“离策略”不等于“完全离线”：Q-learning 可以边交互边学习，只是更新目标不必跟随探索行为。

## SARSA：下一步真的会怎样行动？

SARSA 使用五元组 $S_t,A_t,R_{t+1},S_{t+1},A_{t+1}$，其中下一动作实际由当前行为策略选出：

$$Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left[R_{t+1}+\gamma(1-d_t)Q(S_{t+1},A_{t+1})-Q(S_t,A_t)\right].$$

若策略是 $\epsilon$-greedy，SARSA 学到的就是这种包含探索行为的策略的后果。它会把“下一步可能随机选错”也纳入价值，而不是假定接下来永远选最好的动作。

## Q-learning：假设未来贪心，会怎样？

$$Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left[R_{t+1}+\gamma(1-d_t)\max_{a'}Q(S_{t+1},a')-Q(S_t,A_t)\right].$$

数据依然可由 $\epsilon$-greedy 行为策略产生，但目标使用下一状态最大值。假设下一状态两个 Q 值为 4 和 1，本次探索恰好选了后者，奖励 0，$\gamma=0.9$。SARSA 的目标是 0.9，Q-learning 的目标是 3.6。差异不在“谁算错”，而在它们对未来行动的假设不同。

[Watkins 与 Dayan 的原始论文](https://www.gatsby.ucl.ac.uk/~dayan/papers/wd92.html)讨论表格 Q-learning 的收敛。必须保留充分访问、合适的步长条件、平稳 MDP 等假设；固定学习率、有限数据、深度网络和非平稳工况都不自动继承这些结论。

## 同一段更新代码，把目标换清楚

${FENCE}python
def td_control_update(q, s, a, reward, next_s, next_a,
                      alpha, gamma, terminated, method):
    if terminated:
        future = 0.0
    elif method == "sarsa":
        future = q[next_s][next_a]
    elif method == "q_learning":
        future = max(q[next_s])
    else:
        raise ValueError("unknown control method")
    target = reward + gamma * future
    q[s][a] += alpha * (target - q[s][a])
${FENCE}

对 SARSA，先从下一状态选好下一动作，再做更新，随后真正执行这个动作。若更新后又重新随机选一次，记录的动作与执行动作不一致，就悄悄改变了算法。对 Q-learning，更新不需要下一实际动作；但采样器仍需选择它来继续收集经验。

## 悬崖例子为什么经常让 SARSA 绕远路？

网格底边有悬崖，掉下去获得较大负奖励并回到起点，目标在另一侧。固定探索率时，沿悬崖的短路虽然贪心执行很快，但一个随机动作就可能坠落。SARSA 评价包含探索的策略，通常会学到离边缘远一点的路线。Q-learning 的目标假设未来贪心，可能估计短路更好；而训练阶段仍在探索，所以实际训练回报可能更差。

**这不是“SARSA 天生安全，Q-learning 天生激进”的普遍结论。** 改变探索率、奖励、滑动概率、评估方式或状态表示，结果都会变化。安全约束也不会仅因为选择 SARSA 就自动满足。严格工业约束需要单独建模与执行保护。

掉入悬崖后回到起点是否属于真正终止，要由环境明确定义。经典任务可以将其作为非终止重置位置；你也可以构造坠落即终止的变体，但这两个 MDP 的目标与价值不同，不能混用结果。

## Expected SARSA 把采样目标换成平均

$$y_t=R_{t+1}+\gamma(1-d_t)\sum_{a'}\pi(a'\mid S_{t+1})Q(S_{t+1},a').$$

它明确计算探索策略下的平均下一动作价值，减少了“下一动作恰好选到谁”的随机性，同时保留探索策略的影响。它需要知道策略概率；对表格离散动作这很便宜，对复杂动作空间则未必容易。

## 训练曲线与评估曲线要分开

除浏览器悬崖实验外，还可下载[完整表格实验脚本](code/tabular_foundations.py)，分别用 **--method sarsa** 与 **--method q_learning** 运行同一个普通网格任务。脚本中的普通网格没有悬崖，适合检查收敛到短路径的基本行为；不要把这两个环境的回报混在同一张对比表里。

在实验里分别看带探索的训练收益和关闭探索后的评估收益。固定环境、总步数、种子与起点，记录掉崖次数、完成率和路径长度。训练中更少掉崖，不等于部署策略在所有扰动下安全；更短的平均路径，也不等于尾部风险更低。若两个策略使用不同探索预算，就不能把全部差异归因于更新公式。

## 别用网络结构来判断 on-policy 或 off-policy

一张表也可以离策略学习，一个神经网络也可以在策略学习；Actor-Critic 结构本身更不能决定分类。判断时只问：样本由谁产生，更新想评估谁，以及两者不同时用了什么处理。这个判断方法会贯穿 PPO、SAC 和离线 RL。

对 SARSA，保持固定探索率相当于持续评价带探索的行为。若想讨论逐渐趋向贪心最优策略，还需恰当的探索衰减、充分访问和步长安排。对 Q-learning，即使目标是贪心最优，也需要行为策略提供足够的状态动作覆盖。一个从未尝试的动作，不会因为公式里出现了 max 就自动拥有可靠价值。

因此实验中同时显示访问次数往往很有帮助：Q 值异常高的格子可能来自初始化并尚未被数据修正；如果只画最优箭头，读者就会把未经证实的估计误认为已学到的知识。

## 练习与解答

下一状态 Q 值为 $[5,1]$，$\epsilon=0.2$，唯一贪心动作是第一个。奖励 2，$\gamma=0.9$。计算 Q-learning 和 Expected SARSA 的目标。

<details><summary>查看参考答案</summary>

贪心动作概率为 0.9，另一个为 0.1。Q-learning 目标为 $2+0.9\times5=6.5$；Expected SARSA 的下一状态期望是 $0.9\times5+0.1\times1=4.6$，目标为 $2+0.9\times4.6=6.14$。普通 SARSA 单次目标可能是 6.5 或 2.9，其均值与这个 Expected SARSA 目标一致。

</details>
`,
  },
  {
    id: '09', number: 9, module: 3, title: '函数逼近：从 Q 表到共享参数',
    subtitle: '神经网络让经验能够泛化，也让误差有机会互相放大。',
    duration: 40, level: '进阶', prerequisites: ['08'],
    objectives: ['说明表格方法为何无法扩展到大状态空间', '区分函数逼近和模型学习', '解释致命三角与半梯度更新'],
    tags: ['函数逼近', '神经网络', 'Deadly Triad'],
    sources: ['f-triad', 'f-target', 'f-silver'],
    body: String.raw`
## 表格里存不下的状态，能否共享经验？

如果状态只是一张小网格，给每个状态动作对一个独立数字就够了。但连续温度、压力、时间序列窗口会产生巨大乃至无限的状态空间。即便强行离散，相邻区间的样本也无法自动帮助彼此。函数逼近用参数 $\theta$ 表示 $Q_\theta(s,a)$，希望相似输入共享学习结果。

最简单的线性形式是 $Q_\theta(s,a)=\phi(s,a)^\top\theta$。神经网络只是更灵活的函数族。离散动作 DQN 常输入一个状态，同时输出每个动作的 Q 值；连续动作 Critic 通常同时输入状态和动作。这些是模型结构选择，不是新的奖励定义。

**价值网络不是环境模型。** $Q_\theta$ 预测长期回报；动力学模型预测下一状态或奖励。两者可以同时使用，但不要因为存在神经网络，就把算法叫作“模型基强化学习”。

## 共享参数既是优点，也是新风险

假设两个状态的特征分别为 1 和 2，价值函数 $V_\theta(s)=\theta\phi(s)$。当 $\theta=1$ 时，两个估值分别为 1 和 2。为了把第一个状态拟合到 3 而增大 $\theta$，第二个状态也会随之增大，即使没有新证据支持它。表格更新通常只改一个格子；函数逼近会同时改变许多状态的价值。

泛化是否有益，取决于表示是否抓住任务规律。把温度、压力、化验年龄直接拼接后交给网络，不意味着网络一定能辨认滞后和缺失信息。输入尺度、缺失值标记、时间可用性与训练评估分布都需要检查。

## 为什么它不像普通监督学习那么稳定？

监督学习通常把标签视为固定数据，而 TD 目标包含模型自己的预测：

$$y_t=R_{t+1}+\gamma(1-d_t)\max_{a'}Q_{\bar\theta}(S_{t+1},a').$$

当参数改变时，目标会改变；当策略改变时，采样分布也会改变。数据分布、预测值和训练目标彼此影响，形成反馈系统。把一个监督学习网络直接塞进 Q-learning 循环，可能得到一条越来越小的局部损失，却没有得到越来越好的策略。

${FENCE}mermaid
flowchart TD
    F["函数逼近共享参数"] --> C["一次更新影响多个状态"]
    B["自举目标依赖已有预测"] --> C
    O["离策略数据与目标策略不同"] --> C
    C --> U["可能形成不稳定的误差反馈"]
    U --> R["经验回放改善样本利用"]
    U --> T["目标网络减缓目标变化"]
    R --> V["检查价值尺度与独立评估"]
    T --> V
${FENCE}

函数逼近、自举与离策略学习同时出现，被称为 **deadly triad（致命三角）**。它表示存在不稳定性风险，并非三个条件满足就必然发散。[Jiang 等人的研究](https://proceedings.mlr.press/v139/jiang21j.html)与[目标网络理论分析](https://proceedings.mlr.press/v202/fellows23a.html)提供了更严谨的讨论。

## 半梯度：当前这一步把目标当作常量

平方损失可以写成 $L(\theta)=\frac12(y-Q_\theta(s,a))^2$。常见 TD 实现只对当前预测求导，不对目标中下一状态的估计反向传播，因此称为半梯度更新。它不是完整 Bellman 残差最小化，不能因为用了梯度下降，就假设有普通监督回归的全部性质。

${FENCE}python
# PyTorch 中一批离散动作 Q 值：q_values 的形状为 [batch, n_actions]
q_values = online_network(states)
chosen_q = q_values.gather(1, actions.long().unsqueeze(1)).squeeze(1)

with torch.no_grad():
    next_q = target_network(next_states).max(dim=1).values
    target = rewards + gamma * (1.0 - terminated.float()) * next_q

loss = torch.nn.functional.smooth_l1_loss(chosen_q, target)
optimizer.zero_grad()
loss.backward()
optimizer.step()
${FENCE}

这段是训练更新片段，需要已定义网络、优化器和 batch。重要检查是形状：$[B]$ 与 $[B,1]$ 不小心广播，可能形成 $[B,B]$ 的错误损失，而且程序不会报错。另一个检查是目标必须断开梯度，目标网络参数不应通过该损失被优化器更新。

## 怎样判断网络是否在学正确的东西？

先在可以求真实值的小环境里比较网络估计与动态规划结果，再扩大状态空间。记录平均 Q、最大绝对 Q、TD 误差、梯度范数和独立评估回报。若奖励被限制在绝对值 $R_{\max}$ 且 $\gamma<1$，真实折扣价值绝对值不超过 $R_{\max}/(1-\gamma)$；预测远超这个尺度是一个调试信号，不是自动证明某一种具体 bug。

观察误差来源时逐项排除：环境是否正确？归一化是否仅用训练集拟合？终止标记是否正确？动作索引是否对应同一个动作？最后才扩大网络或修改复杂算法。小网络也能正确实现错误的问题，大网络也无法修复时间泄漏。

## 输出层不是分类概率

离散动作 Q 网络的输出是一组价值，可能为负，也不要求加起来等于 1。通常不应因为“有多个动作”就习惯性加 softmax，把它变成分类概率。探索阶段可以根据 Q 值构造行为策略，但那是选动作规则，不是价值函数定义。

同样，输入归一化应仅利用训练阶段可获得的数据统计量，并固定或明确管理后续更新。用整个测试时期的温度均值标准化训练样本，会把未来分布信息泄漏回来。改变标准化统计量时，已有网络看到的输入坐标也会改变，必须与模型版本一起记录。

## 练习与解答

如果当前网络和目标网络恰好参数相同，它们是否就等同于“只有一个网络”？如果每次梯度更新后立即完整复制参数，目标网络还提供多大的时间滞后？

<details><summary>查看参考答案</summary>

初始化相同不代表训练机制相同：只要后续目标参数被固定一段时间，两份网络就会分离。每一步立刻完整复制时，目标只落后极短时间，失去了大部分延缓目标变化的作用，但目标计算是否 stop-gradient 仍是独立问题。更新周期与软更新系数需要结合训练和采样频率解释。

</details>
`,
  },
  {
    id: '10', number: 10, module: 3, title: 'DQN：把不稳定的学习循环拆开',
    subtitle: '经验回放与目标网络分别解决什么，又没有解决什么？',
    duration: 45, level: '进阶', prerequisites: ['08', '09'],
    objectives: ['写出完整 DQN 数据与参数流', '正确构造 minibatch TD 目标', '区分交互步数、优化步数和目标同步频率'],
    tags: ['DQN', 'Replay Buffer', 'Target Network'], lab: 'replay',
    sources: ['f-dqn', 'f-pytorch', 'f-target'],
    body: String.raw`
## 两个朴素改动为什么如此关键？

如果每拿到一条经验就直接更新价值网络，相邻样本高度相关；策略一变，数据分布随之变化；网络更新又改变后续的目标。DQN 保留 Q-learning 的 Bellman 目标，用经验回放打散近期相关性并复用历史经验，用目标网络减缓目标漂移。[Mnih 等人的原始论文](https://doi.org/10.1038/nature14236)是这一组合的重要来源。

把系统拆成四个对象：在线网络 $Q_\theta$ 负责选动作和被训练；目标网络 $Q_{\bar\theta}$ 提供相对缓慢变化的估值；回放池 $\mathcal D$ 保存转移；环境产生新经验。四个对象各有更新时间，不能含糊地写成一句“训练 DQN”。

## 一条经验怎样变成一批学习目标？

每条转移保存 $(s,a,r,s',d)$，其中 $d$ 是真正终止标志。从回放池随机抽取一批，构造：

$$y_i=r_i+\gamma(1-d_i)\max_{a'}Q_{\bar\theta}(s_i',a'),$$

$$L(\theta)=\frac1B\sum_{i=1}^{B}\operatorname{Huber}(Q_\theta(s_i,a_i)-y_i).$$

Huber 损失在小误差附近类似平方损失，在较大误差时减缓梯度增长；它不是奖励设计错误的补丁。损失只比较**本条经验执行过的动作**的 Q 值与目标，不能把同一个目标盲目复制给所有动作输出。

设 $r=1$、$\gamma=0.9$、目标网络下一动作估计为 $[2,4,3]$，则非终止目标为 4.6。若在线网络对当前实际动作估计为 3，TD 误差为 1.6；真正终止时目标只有 1。外部时间截断仍使用最终观测估出的未来值。

## 回放池不是魔法般的独立同分布制造器

随机抽样能减少相邻轨迹的时间相关性，但池内样本仍来自历史策略与环境分布，严格独立同分布不能因此保证。容量太小可能保留过强的短期相关；容量太大又可能使陈旧经验占据大量更新。应记录容量、预热步数、batch 大小和每步交互对应的更新次数。

所谓预热是先积累一定经验再开始优化，不是让智能体“无奖励行动”。奖励与终止标记从第一条经验就应正确记录。离线数据若覆盖不足，单纯增大回放池也无法创造缺失动作的可信后果。

## 目标网络怎样更新？

硬更新每隔 $C$ 个优化步复制一次：$\bar\theta\leftarrow\theta$。软更新采用：

$$\bar\theta\leftarrow(1-\tau)\bar\theta+\tau\theta.$$

$\tau$ 较小意味着更缓慢跟随；但不同实现可能用相反的参数命名，所以必须看实际公式。目标更新太快，目标仍会剧烈漂移；太慢，目标可能陈旧。不存在脱离环境、更新比与学习率的万能数值。

${FENCE}python
# 单次 minibatch 更新；网络结构可参考 PyTorch 官方完整教程。
def dqn_update(online, target_net, optimizer, batch, gamma=0.99):
    states, actions, rewards, next_states, terminated = batch
    prediction = online(states).gather(1, actions[:, None]).squeeze(1)
    with torch.no_grad():
        future = target_net(next_states).max(dim=1).values
        expected = rewards + gamma * (~terminated).float() * future
    assert prediction.shape == expected.shape
    loss = torch.nn.functional.smooth_l1_loss(prediction, expected)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
    return float(loss.detach())
${FENCE}

这段片段假设 actions 为整型、terminated 为布尔张量，所有张量位于同一设备。完整可运行训练可沿 [PyTorch 官方 DQN 教程](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)练习，设备选择应保留 CPU 回退。

## 一份能诊断问题的训练记录

至少记录环境步数、优化步数、探索率、回放池大小、TD loss、Q 值尺度和独立评估收益。曲线横轴写清“环境交互步”还是“梯度更新步”；否则一个算法每步更新十次、另一个更新一次，比较可能误导。

评估时固定策略规则并关闭训练探索，使用未参与训练选择的评估种子。训练回报低、评估回报高，可能只是探索造成；训练损失低、评估回报低，则可能是采样覆盖不足或自举偏差。目标网络能缓和一些不稳定来源，但不能保证任意网络与参数设置都收敛，理论条件见[相关目标网络研究](https://proceedings.mlr.press/v202/fellows23a.html)。

浏览器“回放与目标网络”实验用于观察索引采样和目标追随的数值机制，不代表浏览器训练了一个完整 Atari DQN。把机制演示与端到端训练分清楚，才能从可视化学到正确结论。

## 不要把游戏实现中的处理原样搬到能耗目标

某些基准实现会裁剪奖励以控制数值尺度，但裁剪会改变不同收益或代价的相对关系。把 -1 与 -100 都裁成 -1，会抹掉严重程度；把不同吨产品能耗差异压成同一个值，也可能让算法优化错误目标。工业任务应先定义物理指标、归一化基准与约束，再讨论是否需要数值缩放。

还要把评估模式与学习模式分开：评估时不更新回放池和参数，避免验证集经历重新影响训练决策。可以持续收集诊断日志，但不能让“测试一下”悄悄变成额外训练预算。每个检查点的环境步数、优化步数和配置应能对应到同一份记录。

## 练习与解答

回放池存入的是外部超时截断的一条转移，$r=0$、$\gamma=0.9$、下一状态最大 Q 为 6。正确目标是多少？若自动 reset 后初始状态 Q 为 2，被错误存入回放池，又会得到什么？

<details><summary>查看参考答案</summary>

正确目标为 5.4；若误用 reset 后观测，则为 1.8；若误把 truncated 当作 terminated，则为 0。三种结果都可能产生看似合理的数值，只有明确环境接口和时间语义才能发现错误。

</details>
`,
  },
  {
    id: '11', number: 11, module: 3, title: 'Double DQN：别让同一份噪声既选又评',
    subtitle: '从一个可以手算的偏差，理解动作选择与估值分离。',
    duration: 35, level: '进阶', prerequisites: ['03', '10'],
    objectives: ['解释最大化偏差的来源', '区分 DQN 与 Double DQN 目标', '说明双估计器的局限和消融方法'],
    tags: ['Double DQN', '高估偏差', '消融实验'], lab: 'overestimation',
    sources: ['f-doubleq', 'f-double-dqn'],
    body: String.raw`
## 估值平均没偏，取最大为什么会偏？

设两个动作真实价值都为零，每个估计独立地以相同概率取 -1 或 +1。单个动作估计的期望是零，但取两者最大值后，四种等概率组合里只有 $(-1,-1)$ 得到 -1，其余都得到 +1，所以：

$$\mathbb E[\max(\hat Q_1,\hat Q_2)]=\tfrac14(-1)+\tfrac34(1)=0.5.$$

这个高估不是环境变得更好了，而是最大值操作倾向于挑中正噪声。一般而言，最大值是凸函数，$\mathbb E[\max_a\hat Q_a]\geq\max_a\mathbb E[\hat Q_a]$。不等式说明方向，但实际差距取决于误差大小、相关性、动作数和各动作真实价值。

在 Q-learning 中，这个最大值进入 TD 目标，再传播给前面的状态。网络不一定在每个状态都高估，但长期反复使用这种目标，可能造成明显偏差。[Double Q-learning 原论文](https://proceedings.neurips.cc/paper_files/paper/2010/hash/091d584fced301b442654dd8c23b3fc9-Abstract.html)研究了这一问题及双估计器思路。

## 核心做法：分开动作选择与动作评价

理想化地，让估计器 A 负责选动作，让独立估计器 B 负责评价被选动作。若两个动作真值均为零，B 的零均值误差与 A 的选择独立，那么被选动作在 B 下的期望仍为零。它不再直接奖励“A 恰好高估的那一份噪声”。

表格 Double Q-learning 通常维护两张表并交替更新。Double DQN 则复用已有在线网络和目标网络，不需要再新增第三张网络。[van Hasselt 等人的 Double DQN 论文](https://arxiv.org/abs/1509.06461)给出其深度版本。

DQN 的目标是：

$$y^{\mathrm{DQN}}=r+\gamma(1-d)\max_{a'}Q_{\bar\theta}(s',a').$$

Double DQN 先由在线网络选动作，再由目标网络估值：

$$a^*=\arg\max_{a'}Q_\theta(s',a'),$$

$$y^{\mathrm{DDQN}}=r+\gamma(1-d)Q_{\bar\theta}(s',a^*).$$

两者都使用目标网络；所以“用了两个网络”并不是识别 Double DQN 的标准。真正区别是 **argmax 用谁，评价用谁**。

## 用两个数组检查实现

在线网络下一状态 Q 值为 $[4,3]$，目标网络为 $[2,5]$，$r=1$、$\gamma=0.9$。DQN 选择目标网络中的 5，得到 5.5；Double DQN 由在线网络选第一个动作，再取目标网络对应的 2，得到 2.8。

这不证明 2.8 一定更接近真值，因为此时没有给出真实值。算法改进的目标是缓解系统性的选择偏差，而非保证每一个样本目标都更准确。若真实值恰好更高，Double DQN 这次甚至可能低估。

${FENCE}python
with torch.no_grad():
    # 选择动作：在线网络。形状 [batch, 1]。
    best_actions = online(next_states).argmax(dim=1, keepdim=True)
    # 评价该动作：目标网络。形状 [batch]。
    next_values = target_net(next_states).gather(1, best_actions).squeeze(1)
    td_target = rewards + gamma * (~terminated).float() * next_values

# 当前状态的 Q(s,a) 与损失，和 DQN 保持相同。
${FENCE}

常见误写是两个位置都用在线网络，或两个位置都用目标网络；前者丢失稳定目标，后者退回普通 DQN。还要检查 argmax 发生在动作维度，而不是 batch 维度。

## 两份网络并不真正独立

目标参数来自在线参数的历史副本，二者误差通常相关，因此不能把理想独立估计器的分析直接当成 Double DQN 的无偏保证。若每一步同步，两份网络几乎一致，动作选择和评价的差异也随之减弱。反之，太久不同步又可能增加估值陈旧性。

Double DQN 可能低估，也不能消除数据覆盖、函数逼近、终止处理和奖励设计问题。它是针对一个明确偏差源的改动，而不是“DQN 的全部问题已经解决”。Dueling Network 则是把价值分解为状态价值与动作优势的网络结构；它与 Double DQN 是不同方向，可以组合，但不能混称。

## 如何做一个可信的比较？

保持网络规模、回放池、探索日程、学习率、交互预算和目标更新规则一致，只替换 TD 目标。用有可求真实值的小任务验证估计偏差，再看独立评估回报与多种子分布。若只看“最大 Q 值更低”，无法判断是否更准确，因为真实价值也可能较高。

浏览器实验首先展示零真值、独立噪声的合成估计问题。这是用来隔离最大化偏差的机制实验；它没有模拟完整 DQN 训练，也不代表任何工业节能效果。先预测增大动作数和噪声幅度的影响，再运行实验验证。

## 偏差减少，不等于所有误差都减少

若两个动作真实价值并不相同，选择估计器可能因为噪声选中真正较差的动作。独立评价器会忠实地给这个较差动作较低的估值，于是双估计器结果可能低于最优真值。这说明“避免正向选择偏差”和“准确找到最优动作”仍是两个相关但不同的目标。

做合成实验时可以先保持真值相等，单独观察最大化噪声；再拉开动作真值差距，观察错误选择的影响；最后让两份噪声逐渐相关，观察去偏效果减弱。每次只改变一个因素，才能解释曲线为什么变化。若同时增加动作数、噪声和相关性，即使图形很漂亮，也无法知道哪个因素造成差异。

这套分离因素的方法比记住某条曲线的形状更有用，后续比较 GAE 参数、PPO 裁剪幅度和 SAC 温度时都可以沿用。

## 练习与解答

若两个估计器的误差完全相同，选择与评价分离还能消除上面的 0.5 高估吗？若只有一个动作，是否还存在由动作最大化额外引入的选择偏差？

<details><summary>查看参考答案</summary>

完全相同的误差会让评价重新使用被选择的正噪声，不能得到独立情形的去偏效果。只有一个动作时 max 不再选择多个估计中的较大者，因此没有这一来源的额外偏差；但估计器本身依然可能有拟合偏差或自举误差。

</details>
`,
  },
  {
    id: '12', number: 12, module: 4, title: 'REINFORCE：直接学习行动的概率',
    subtitle: '不用对环境反向传播，也能知道策略应该朝哪边改。',
    duration: 45, level: '进阶', prerequisites: ['03', '05', '09'],
    objectives: ['从轨迹概率理解 log-derivative trick', '解释 reward-to-go 和状态 baseline', '正确区分梯度上升目标与梯度下降损失'],
    tags: ['策略梯度', 'REINFORCE', 'Baseline'], lab: 'policy-gradient',
    sources: ['f-reinforce', 'f-policy-gradient'],
    body: String.raw`
## 为什么不再先估值，再取 argmax？

价值方法先学“每个动作值多少”，然后选择最大者。动作连续时，求最大值本身可能困难；某些任务还需要随机策略。策略梯度直接用参数化分布 $\pi_\theta(a\mid s)$ 表示行为，训练参数，让高回报行为更可能出现。Critic 不是这一思想的必需条件，最基本的 REINFORCE 可以直接用实际轨迹回报。

离散动作可以使用 logits 加 softmax；连续动作可以用参数化概率密度。参数改变的是分布，不是把每个动作硬编码成正确标签。[Williams 1992 年的论文](https://doi.org/10.1007/BF00992696)是 REINFORCE 的原始来源。

## 环境不可微，梯度从哪里来？

先用有限时域、无折扣目标 $J(\theta)=\mathbb E_{\tau\sim p_\theta}[R(\tau)]$。轨迹概率为初始分布、策略概率与转移概率的连乘：

$$p_\theta(\tau)=\rho_0(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t).$$

利用 $\nabla p=p\nabla\log p$，得到：

$$\nabla_\theta J=\mathbb E\left[R(\tau)\nabla_\theta\log p_\theta(\tau)\right]=\mathbb E\left[R(\tau)\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right].$$

这里假设环境转移与初始分布不直接依赖待优化的策略参数。求对数后，环境项对 $\theta$ 的导数为零，所以不需要对仿真器内部反向传播。公式依赖的是“采到这条轨迹的概率如何随策略变化”。完整推导可对照 [Spinning Up 的策略优化教程](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)。

## 一个动作不应该替过去的奖励邀功

时刻 $t$ 的动作不能改变已经发生的奖励，因此可以把整条轨迹总奖励换为从该动作之后开始的 reward-to-go。对上面的无折扣有限任务，权重为 $G_t=\sum_{k=t}^{T-1}R_{k+1}$。

若目标改为 $J=\mathbb E[\sum_t\gamma^tR_{t+1}]$，且 $G_t$ 定义为从 $t$ 相对折扣的回报，精确的有限轨迹梯度表达包含 $\gamma^tG_t$。一些实现把时间权重吸收到采样分布或采用近似目标中；学习时应先固定一种约定，避免公式与代码一边有 $\gamma^t$、另一边没有。

## baseline：评价“比预期更好”，减少噪声

用只依赖状态、不依赖当前采样动作的 $b(s_t)$ 替代零基线：

$$\nabla_\theta J=\mathbb E\left[\sum_t\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\big(G_t-b(S_t)\big)\right].$$

它不改变期望梯度的关键在于 $\sum_a\pi(a\mid s)\nabla\log\pi(a\mid s)=\nabla\sum_a\pi(a\mid s)=0$。baseline 可以降低方差，但不是任意选择都必然最优；若它偷偷依赖动作，或者让错误的梯度通过权重流回 Actor，推导条件就被破坏。

${FENCE}mermaid
flowchart TD
    P["策略分布采样动作"] --> T["收集完整任务轨迹"]
    T --> G["计算每步 reward-to-go"]
    G --> B["减去状态 baseline"]
    B --> L["回报权重乘动作 log 概率"]
    L --> U["更新策略参数"]
    U --> P
    B --> C["下一章用 Critic 学习 baseline"]
${FENCE}

## 一次更新到底让哪个概率变大？

单步任务，某动作当前概率 $p=0.25$，获得奖励 2，baseline 为 1。对该动作对应 logit，$\partial\log p/\partial z=1-p=0.75$。权重是 1，所以正梯度为 0.75；学习率 0.1 的一次梯度上升会把 logit 增大 0.075。若奖励变为 0，权重变为 -1，方向就反过来。

这不意味着一次坏奖励证明该动作很差，只是一次随机梯度样本。需要积累批次、合适步长和独立评估，避免被高方差反馈牵着走。

${FENCE}python
# logits: [T, n_actions]；actions、returns、baselines: [T]
distribution = torch.distributions.Categorical(logits=logits)
log_prob = distribution.log_prob(actions)
steps = torch.arange(len(returns), device=returns.device)
discounts = gamma ** steps
weights = (returns - baselines).detach()
# 优化器做梯度下降，因此对希望最大化的目标取负号。
loss = -(discounts * log_prob * weights).sum()
optimizer.zero_grad(set_to_none=True)
loss.backward()
optimizer.step()
${FENCE}

多条轨迹时，先对每条轨迹求和再按轨迹数平均，与把所有时间步混合平均存在归一化差异，尤其当长度不同。必须明确优化目标，不要在重构 batch 时悄悄改变权重。

## REINFORCE 为什么还不够？

完整回报包含大量未来随机性，训练可能方差很高；必须等待轨迹终局，持续任务不方便；一次更新过大可能把已经有效的策略破坏。接下来 Actor-Critic 用价值估计缓解等待与方差，GAE 调节偏差方差，PPO 进一步约束有利方向上的更新激励。每一步都在解决一个具体问题，而不是因为算法名字更新就必然更好。

## 为什么不能随便重复使用旧轨迹？

推导中的轨迹由当前策略采样。参数改动很多轮后，旧轨迹不再来自当前分布，直接继续用它们当作当前期望，会改变梯度估计。可以考虑重要性采样校正，但概率比可能带来很大方差，并且要求旧策略对新策略关心的动作有足够支持。

这就是“离策略算法可以复用回放池”与“REINFORCE 也把旧数据再训练几遍”之间的区别。PPO 会在同一批近期轨迹上做有限轮更新，并显式使用新旧概率比与额外稳定措施；它仍然不能无条件复用任意陈旧日志。只要理解梯度期望究竟对哪个分布求平均，就能判断一段训练代码的数据使用是否符合算法假设。

## 练习与解答

一个动作取得回报 5，但状态 baseline 是 7。策略梯度应该提高还是降低它的概率？如果奖励整体都加上一个常数，直接看“奖励为正就增加概率”的口号为什么会失效？

<details><summary>查看参考答案</summary>

相对 baseline 的权重为 -2，该样本会降低其概率。真正决定方向的是相对期望的好坏，不是奖励数值正负。常数偏移在固定长度、特定目标下可不改变最优策略，但在可变长度任务中还可能改变对任务长度的偏好；因此奖励平移也要结合任务定义分析。

</details>
`,
  },
];
