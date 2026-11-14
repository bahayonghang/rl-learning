import type { ResearchPage } from './types';

export const optimizationPages: ResearchPage[] = [
  {
    id: 'evolution', order: 4, group: 'optimization', minutes: 31,
    title: { 'zh-CN': '进化优化：从 Pareto 搜索到滚动轨迹', en: 'Evolutionary optimization: Pareto search and rolling trajectories' },
    summary: {
      'zh-CN': '拆开候选表示、评价模型、约束比较与搜索器，推导 NSGA-II 和 MOEA/D，解释动态优化如何与 MPC、RL 连接。',
      en: 'Separate representation, evaluation, feasibility and search. Derive NSGA-II and MOEA/D, then connect dynamic optimization with MPC and RL.',
    },
    figure: 'evolution-search',
    sources: ['r2-nsga2', 'r2-moead', 'r2-feasibility', 'r2-epsilon', 'r2-dynamic', 'r2-mpcbook', 'r2-oadstr', 'r2-project'],
    body: {
      'zh-CN': String.raw`## 1. 先问一个个体表示什么，再问使用哪种进化算法

在烧成优化中，一个种群个体可以表示六个 CV 的下一步设定值增量，也可以表示未来 $H$ 步的增量序列，或一条平滑设定值轨迹的少量控制点。给定观测历史，评价器把候选送进机理模型、代理模型或回放仿真，返回煤耗、电耗、质量成本和可执行性。**表示决定要解决的问题；NSGA-II 或 MOEA/D 决定如何搜索这个表示空间。** 如果评价器只计算稳态煤电耗，搜索得到的就是稳态折中；如果评价器逐步推进动力学并计算延迟质量，EA 同样能够搜索序列决策。

这四部分可以独立改进：动作表示决定维数与光滑性，评价模型决定预测偏差，约束比较决定候选存活规则，搜索器决定有限预算如何分配。把失败统一归因于“进化算法不懂时序”会掩盖真正的瓶颈。[MPC 原理](https://sites.engineering.ucsb.edu/~jbraw/mpc/)并不要求求解器一定是梯度算法；[动态多目标优化原始研究](https://doi.org/10.1109/TEVC.2004.831456)也早已讨论变化的 Pareto 集与控制问题。

![进化优化：搜索循环与滚动执行](./images/diagrams/research-evolution-diagram-1.webp)

## 2. NSGA-II：先比较等级，再保留分布

对最小化目标，若个体 $u$ 的所有目标不差于 $v$，且至少一个严格更好，就称 $u$ 支配 $v$。第一非支配层不被任何候选支配；去掉它再求第二层。NSGA-II 合并父代和子代后，从较低等级的前沿依次填充下一代；最后一个装不下的前沿使用拥挤距离维持分布。原论文同时给出了约束支配处理与计算复杂度分析，不能把它缩写成“只保留最小加权和”。[Deb 等，2002](https://doi.org/10.1109/4235.996017)

在某个前沿内，分别按目标 $m$ 排序，内部个体的拥挤距离累计为

$$d_i=\sum_{m=1}^{M}\frac{f_m(i+1)-f_m(i-1)}{f_m^{\max}-f_m^{\min}}.$$

边界个体通常置为无限大以保护极端折中；某目标在该前沿完全相同、分母为零时，工程实现应跳过这个没有区分度的目标。分子中的前后邻居按**当前目标各自排序**，并非只按第一个目标排序后复用。

手算四个教学点 $(0,10),(2,7),(4,4),(10,0)$，两目标都最小化，四者互不支配。中间点 $(2,7)$ 的距离为 $4/10+6/10=1.0$；$(4,4)$ 为 $8/10+7/10=1.5$。若只能从两个内部点保留一个，在等级相同的前提下保留后者。距离大表示附近候选更稀疏，**不表示该工况更安全、经济价值更大或模型更可信**。这些性质要由独立定义的评价项判定。

## 3. MOEA/D：把前沿拆成相邻的标量子问题

MOEA/D 为多个权重向量维护子问题，并利用权重空间的邻居共享候选改进。常见 Tchebycheff 分解为

$$g(u\mid w,z^*)=\max_m w_m\left|\widetilde f_m(u)-z_m^*\right|,$$

其中 $\widetilde f_m$ 是尺度一致的目标，$z^*$ 是理想点估计。一个新个体可以改善多个相邻子问题；“邻近”主要指权重向量接近，不是两个候选在物理状态空间必然相近。原文还比较了其他分解方式；选定分解后仍要检查前沿覆盖、尺度敏感性和有限种群分辨率。[Zhang 与 Li，2007](https://doi.org/10.1109/TEVC.2007.892759)

取 $z^*=(0,0)$，候选 $A=(1,4)$、$B=(2,2)$。在 $w=(0.8,0.2)$ 下，$g(A)=\max(0.8,0.8)=0.8$，$g(B)=\max(1.6,0.4)=1.6$，选 $A$；在 $w=(0.2,0.8)$ 下变为 $3.2$ 与 $1.6$，选 $B$。这是多个偏好子问题共同覆盖折中的机制。它不能保证有限代搜索已找全真实 Pareto 前沿，代理模型若存在系统偏差，搜索也可能精确地优化错误目标。

## 4. 可行性处理：搜索时允许考察，不代表执行时允许越界

一种清楚的约束违反量是

$$v(u)=\sum_j\frac{\max(0,g_j(u))}{s_j},\qquad s_j>0,$$

其中 $g_j\le0$ 表示第 $j$ 项约束，$s_j$ 统一量纲。可行性优先比较通常遵循：可行者优于不可行者；两个不可行者比较违反量；两个可行者再比较目标或 Pareto 等级。归一化不能省略，否则温度的数值量级可能压过压力或质量。[Deb 的约束处理研究](https://doi.org/10.1016/S0045-7825(99)00389-8)与 NSGA-II 的约束支配提供了这一思想的原始入口。

$\epsilon$ 水平方法在搜索比较中把足够小的违反量暂按某种容忍水平处理，并随搜索进度改变该水平，以帮助穿越窄可行域附近的搜索障碍。[Takahama 与 Sakai，2006](https://doi.org/10.1109/CEC.2006.1688283)是原始方法之一。具体更新日程需要读对应实现，不能仅凭名字重建本项目的 PG-MOEA/D-IEpsilon。

这里的 $\epsilon$ 是**候选搜索规则**；上一页的 $\epsilon$ 约束是**多目标偏好预算**；设备执行边界则是**工程约束**。三者应使用不同字段、单位和日志。一个搜索阶段仍不满足执行条件的候选，必须被拒绝或由既定回退处理。约束成本的期望预算也不会自动解除五层门控。[本仓库约定](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 5. “动态”至少有三种含义

| 动态来自哪里 | 应该改变什么 | 容易误判的地方 |
| --- | --- | --- |
| 原料、价格或设备状态随时变 | 更新评价上下文并跟踪移动的折中集 | 只重跑静态模型，未更新模型条件 |
| 现在的动作影响未来状态 | 在评价器中推进动力学并优化序列 | 只换成更大种群，仍使用即时目标 |
| 每个周期获得新测量 | 执行序列第一步并重新规划 | 把整条预测轨迹当作必须开环执行的命令 |

原始动态多目标文献解决的是随时间变化的问题族；滚动优化则还涉及状态反馈、预测窗口与第一步执行。这些概念可以组合，但不应混用。[Farina 等，2004](https://doi.org/10.1109/TEVC.2004.831456)；[Rawlings 等教材](https://sites.engineering.ucsb.edu/~jbraw/mpc/)。与用户研究相关的 [OA-DSTR 论文](https://doi.org/10.1016/j.asoc.2024.111772)研究对象是水泥**粉磨**的双动态运行指标决策。其搜索与滚动思路值得对照；本次仅核验书目和出版社摘要，不能据此转述烧成现场结果。

## 6. 轨迹参数化减少维数，也引入新检查

若直接优化 $H\times K$ 个增量过于昂贵，可以将候选设定值轨迹参数化为少量控制点。例如一个可研究的 NURBS 接口为

$$Y^{sp}(s)=\frac{\sum_i N_{i,p}(s)w_iP_i}{\sum_i N_{i,p}(s)w_i},\qquad w_i>0.$$

控制点、节点向量和权重是轨迹表示，不是已经验证的本项目实现。即使曲线值保持在控制点包围范围内，也不自动满足每 5 分钟的增量限幅、相邻增量变化率或延迟质量约束；必须在执行采样点和必要的区间上检查。重新规划时还要与当前真实设定值连续衔接，不能把上一轮未执行的轨迹当成事实。

适合做消融的改进包括：将上一轮种群平移作热启动；保留少量新候选防止工况变化后陷入旧前沿；只在误差或扰动明显时重启昂贵搜索；对模型不确定区间重新评价。它们是待检验设计，不是本文已经证明的收益。比较时固定模型调用预算、墙钟时限、预测窗口、门控和偏好选择规则；若使用超体积，还要固定目标尺度、参考点和可行解筛选。

## 7. 公平比较应当解释计算花在哪里

在线 EA 将计算花在每次规划的候选评价；离线 RL 将大量计算前置到策略学习，再以网络推理给出候选。谁更合适取决于评价模型、数据支持、实时预算、变化速度及错误代价。二者也能互补：EA 提供可行示范或高质量轨迹，RL 提供热启动、候选分布或终端价值。混合方法需要与相同预算下的强 EA、纯行为克隆和简单离线 RL 比较，不能只与未经调参的静态单点搜索比较。

本项目保留 Operator 与 PG-MOEA/D-IEpsilon 基线要求。当前网页没有接入其实际实现、训练数据和统一评价结果，因此本页解释的是可复现的研究设计，而没有宣称任何网络优于该基线。`,
      en: String.raw`## 1. Ask what an individual represents before choosing the algorithm

In kiln optimization, a population member may encode the next increments of six CV setpoints, a sequence of increments over $H$ steps, or a small set of control points describing a smooth setpoint trajectory. Conditioned on the available observation history, an evaluator passes the candidate through a mechanistic model, surrogate or replay simulator and returns fuel, electricity, quality costs and feasibility. **The representation defines the decision problem; NSGA-II or MOEA/D defines a search procedure over that representation.** A steady-state evaluator produces a steady-state compromise. A dynamic evaluator that propagates delayed quality responses allows an EA to optimize sequential decisions.

Representation, evaluation, feasibility comparison and search are distinct design choices. They determine dimension and smoothness, predictive bias, survival rules and allocation of a finite computational budget. Attributing every failure to “evolutionary algorithms cannot handle time” hides these differences. [MPC theory](https://sites.engineering.ucsb.edu/~jbraw/mpc/) does not require a gradient-based optimizer, and [original dynamic multiobjective research](https://doi.org/10.1109/TEVC.2004.831456) already considered moving Pareto sets and control applications.

![Evolutionary optimization: search and rolling execution](./images/diagrams/research-evolution-diagram-1.webp)

## 2. NSGA-II: compare rank, then preserve spread

For minimization, $u$ dominates $v$ when it is no worse on every objective and strictly better on at least one. The first nondominated front contains candidates dominated by none of the others. Removing it reveals the next front. NSGA-II combines parents and offspring, fills the next generation from better-ranked fronts, and uses crowding distance when the final accepted front does not fit. The original paper also develops constrained dominance and analyzes computational complexity. This is not equivalent to selecting the smallest weighted sum. [Deb et al., 2002](https://doi.org/10.1109/4235.996017)

Within a front, sort by each objective $m$. The crowding distance of an interior individual accumulates

$$d_i=\sum_{m=1}^{M}\frac{f_m(i+1)-f_m(i-1)}{f_m^{\max}-f_m^{\min}}.$$

Boundary individuals are normally assigned infinite distance to preserve extremes. An implementation should skip a constant objective whose zero range supplies no discrimination. The neighbors are obtained from **each objective's own ordering**, not from one ordering reused for all objectives.

Consider four synthetic points $(0,10),(2,7),(4,4),(10,0)$ with both objectives minimized. All four are nondominated. The distance at $(2,7)$ is $4/10+6/10=1.0$; at $(4,4)$ it is $8/10+7/10=1.5$. If only one of these two interior candidates can be retained, the latter is preferred at equal rank. Greater distance means a more sparsely represented region of objective space. It does **not** imply greater safety, higher economic value or better model credibility; those need their own definitions.

## 3. MOEA/D: neighboring scalar subproblems

MOEA/D maintains subproblems associated with weight vectors and shares improvements among neighbors in weight space. One common Tchebycheff scalarization is

$$g(u\mid w,z^*)=\max_m w_m\left|\widetilde f_m(u)-z_m^*\right|,$$

where $\widetilde f_m$ are consistently scaled objectives and $z^*$ estimates an ideal point. A new individual may improve several neighboring subproblems. Here “neighboring” primarily refers to weights; it does not guarantee physical similarity of operating conditions. The original paper also investigates other decompositions. Front coverage, scale sensitivity and finite-population resolution still require assessment. [Zhang and Li, 2007](https://doi.org/10.1109/TEVC.2007.892759)

Let $z^*=(0,0)$ and compare $A=(1,4)$ with $B=(2,2)$. At $w=(0.8,0.2)$, $g(A)=\max(0.8,0.8)=0.8$ and $g(B)=\max(1.6,0.4)=1.6$, so $A$ is preferred. At $w=(0.2,0.8)$ the values become $3.2$ and $1.6$, favoring $B$. Multiple preference subproblems jointly represent a trade-off. A finite run does not guarantee discovery of the true Pareto front, and a biased surrogate can cause the search to optimize the wrong objectives very effectively.

## 4. Constraint handling: search tolerance is not execution permission

A dimensionally explicit violation measure is

$$v(u)=\sum_j\frac{\max(0,g_j(u))}{s_j},\qquad s_j>0,$$

where $g_j\le0$ defines constraint $j$ and $s_j$ sets its scale. Feasibility-first comparisons typically prefer feasible over infeasible candidates, compare violation between infeasible candidates, and compare objectives or Pareto rank between feasible ones. Without normalization, the numerical size of temperature violations may overwhelm pressure or quality violations. [Deb's constraint-handling study](https://doi.org/10.1016/S0045-7825(99)00389-8) and the constrained-dominance definition in NSGA-II provide the original foundations.

Epsilon-level methods allow sufficiently small violations to be treated according to a temporary search tolerance, adjusted as search progresses. This can help search around difficult feasible regions. [Takahama and Sakai, 2006](https://doi.org/10.1109/CEC.2006.1688283) is an original reference. The exact schedule must be checked in the implementation being evaluated; the name PG-MOEA/D-IEpsilon does not reveal this project's complete algorithm.

This epsilon is a **search-comparison rule**. The previous page's epsilon constraint is a **preference budget**. An equipment execution limit is an **engineering constraint**. Use separate fields, units and logs for these concepts. A candidate that remains outside an execution boundary must be rejected or handled by the approved fallback. An expected constraint-cost budget does not remove the five-layer gate. [Repository contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 5. Three different meanings of dynamic optimization

| Source of change | Required design change | Common mistake |
| --- | --- | --- |
| Raw materials, prices or equipment conditions vary | Update the evaluation context and track a changing trade-off set | Rerun an unchanged static model |
| Current actions affect future states | Propagate dynamics while evaluating a sequence | Increase population size but retain an instantaneous objective |
| New measurements arrive each cycle | Execute the first action and replan | Treat the complete predicted trajectory as an open-loop command |

Dynamic multiobjective research studies families of changing optimization problems. Receding-horizon control additionally concerns state feedback, the prediction horizon and execution of only the first decision. These ideas can be combined, but they are not interchangeable. [Farina et al., 2004](https://doi.org/10.1109/TEVC.2004.831456); [Rawlings et al.](https://sites.engineering.ucsb.edu/~jbraw/mpc/). The related [OA-DSTR publication](https://doi.org/10.1016/j.asoc.2024.111772) concerns dual-dynamic operational decisions in cement **grinding**. Its search and rolling-decision ideas are relevant, while its physical results cannot be transferred to calcination. Only bibliography and publisher-abstract information were verified for that paper in this review.

## 6. Trajectory parameterization reduces dimension and adds checks

When $H\times K$ independent increments are expensive to search, a small number of control points can represent the proposed setpoint trajectory. An example research interface is

$$Y^{sp}(s)=\frac{\sum_i N_{i,p}(s)w_iP_i}{\sum_i N_{i,p}(s)w_i},\qquad w_i>0.$$

This NURBS expression specifies a representation, not a verified implementation in this repository. Even when curve values remain inside the control-point hull, this does not automatically satisfy five-minute rate bounds, changes between successive increments or delayed quality constraints. Check the sampled execution points and, where necessary, intervals between them. Replanning must connect to the actual current setpoints; an unexecuted previous prediction is not plant history.

Candidate ablations include shifting the previous population for a warm start, injecting fresh candidates after a disturbance, restarting expensive search only after material prediction errors, and re-evaluating model-uncertain candidates. These are testable designs, not established benefits. Fix model-call budgets, wall-clock limits, prediction horizons, gates and preference rules across comparisons. Hypervolume comparisons also need fixed objective scales, a fixed reference point and consistent feasible-solution filtering.

## 7. Compare where computation is spent

An online EA spends computation evaluating candidates during each planning cycle. Offline RL spends substantial computation before operation and then proposes actions through network inference. Their suitability depends on model quality, data support, latency, changing conditions and the cost of errors. They can cooperate: an EA can supply feasible demonstrations or trajectories; RL can supply a warm start, proposal distribution or terminal value. A hybrid must earn its complexity against strong, equally budgeted evolutionary optimization, behavior cloning and simple offline RL, rather than against an inadequately tuned static search.

The project requires Operator and PG-MOEA/D-IEpsilon baselines. Their actual implementation, training data and unified experimental results are not connected to this web tutorial. This page therefore specifies a reproducible comparison and makes no claim that a neural policy outperforms that baseline.`,
    },
  },
];
