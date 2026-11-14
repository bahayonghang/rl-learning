import type { ResearchPage } from './types';

export const reinforcementPages: ResearchPage[] = [
  {
    id: 'sequential', order: 5, group: 'reinforcement', minutes: 32,
    title: { 'zh-CN': '从指标优化到序列决策：MDP、POMDP 与 CMDP', en: 'From operational optimization to MDPs, POMDPs and CMDPs' },
    summary: {
      'zh-CN': '从当前候选、未来轨迹推到反馈策略，说明历史、化验可用性、占用分布、延迟回报与独立约束如何进入同一个问题。',
      en: 'Move from a present candidate to a trajectory and a feedback policy, connecting history, assay availability, occupancy, delayed returns and separate constraints.',
    },
    sources: ['r2-rlbook', 'r2-mpcbook', 'r2-mpc-rl', 'r2-process-rl', 'r2-cpo', 'r2-cql', 'r2-project'],
    body: {
      'zh-CN': String.raw`## 1. 改变的是求解对象，而不只是算法名字

设当前信息为 $h_t$。单步优化寻找 $a_t^*=\arg\min_a\widehat\ell(h_t,a)$；轨迹优化寻找 $a_{t:t+H-1}$，通过模型把当前选择对未来状态的影响计入目标；反馈策略则学习一个随可用信息改变动作的映射 $\pi(a\mid h)$。轨迹优化每次执行第一步再重算，也是一种反馈策略。RL 的特点是通过交互或日志学习长期价值与决策规律，**不是首次让优化能够考虑未来**。[MPC 教材](https://sites.engineering.ucsb.edu/~jbraw/mpc/)；[Sutton 与 Barto](https://incompleteideas.net/book/the-book-2nd.html)

对于烧成，上层动作始终是 CV 设定值增量；动态评价中应包含内层 DCS/APC 的响应。学到一个保持设定值的动作，并不意味着过程停止变化：原料、传热、反应、冷却及扰动仍然继续。把“当前煤耗最低”直接当作长期最优，或者把“拒绝动作”实现成冻结仿真，都改变了原来要研究的过程。[项目契约](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
  D["已到达的信号与化验"] --> H["历史或信念状态"]
  H --> P["策略产生候选增量"]
  H --> O["模型规划产生候选增量"]
  P --> G["门控得到执行增量"]
  O --> G
  G --> K["内层控制与过程推进"]
  K --> R["能耗回报与独立约束成本"]
  K --> D
  R --> L["价值学习或模型校准"]
  L --> P
  L --> O
~~~

## 2. MDP 是条件独立假设，不是把一行数据命名为 state

如果充分状态 $S_t$ 满足

$$P(S_{t+1},R_{t+1},C_{t+1}\mid S_{0:t},A_{0:t})=P(S_{t+1},R_{t+1},C_{t+1}\mid S_t,A_t),$$

就可以使用 Markov 决策过程。状态应覆盖影响未来分布的重要记忆，例如热状态、物料状态、当前设定值、前次执行增量、设备模式及门控所依赖的变量。右侧不是“没有扰动”，而是“给定当前状态和动作后，更早历史不再额外改变下一步分布”。现实中这些隐变量往往无法全部测量，所以直接把瞬时温度、压力和旧化验拼成向量，并不能证明 Markov 性。

理论推导先假定充分状态存在。令 $a$ 表示候选动作，门控为 $G(s,a)$；复合转移核 $P_G$ 包含执行门控和内层响应。价值满足

$$V^\pi(s)=\mathbb E_{a\sim\pi(\cdot\mid s)}\!\left[\mathbb E_{(s',r)\sim P_G(\cdot\mid s,a)}\!\left[r+\gamma V^\pi(s')\right]\right].$$

外层平均策略可能选的动作，内层平均过程在该动作下的随机结果。最优性方程把动作平均换成优化，但仍保留对随机转移的期望。一步差异会改变后续访问的状态，因此优化的是由策略诱导的整条轨迹分布，而非在固定历史数据的每一行上分别找最小预测煤耗。

一个完全虚构且两方案均满足约束的能耗例子：方案 A 两步成本为 $[1,5]$，方案 B 为 $[2,1]$。即时优化选 A；取 $\gamma=0.9$，负成本回报分别为 $-1-0.9\times5=-5.5$ 与 $-2-0.9\times1=-2.9$，长期选择 B。这里没有把质量违规塞入奖励，差异只是早期动作造成后续能耗变化。EA 轨迹规划、MPC 或正确学习的价值函数都可能识别这个差异。

## 3. 部分可观测：需要对“尚不知道什么”建模

POMDP 区分隐藏状态 $S_t$ 与观测 $O_t$。理想信念 $b_t(s)=P(S_t=s\mid O_{0:t},A_{0:t-1})$ 通过转移预测和观测更新递推：

$$b_{t+1}(s')\propto P(o_{t+1}\mid s')\int P_G(s'\mid s,a_t)b_t(s)\,ds.$$

实际项目通常没有足够可信的完整概率模型，因此使用历史窗口、循环网络或时序编码器近似信息状态。这是可检验的逼近，不是“用了 TCN 就自动成为 MDP”。比较窗口长度和编码器时，应控制参数量、延迟标签对齐与训练预算；验证剩余预测误差是否还系统依赖更早历史。[流程工业 RL 综述](https://doi.org/10.1109/JAS.2024.124227)提供领域问题的组织框架，具体建模仍须依过程而定。

项目全量接口含每 5 分钟一次的 24 个采样点、当前设定值、软测量、已发布化验与化验年龄、原料率值。24 点窗口名义上覆盖约两小时，但首末采样点间隔是 $23\times5=115$ 分钟；不要把窗口命名当成精确物理时滞。教学工作台的 13 维观测、3 维动作也不等于全量 36 变量、6 CV 方案。

一份化验在 10:00 取样、10:40 发布：10:20 的策略不得读取它；10:45 可读取它，但该值描述 10:00 的材料，样品年龄为 45 分钟、发布后年龄为 5 分钟，两者含义不同。训练软测量可在标签发布后对齐到取样时刻进行监督；这并不允许重建历史决策输入时提前填入该标签。数据表至少要保留采样时间、发布时间、缺失标记和当时可用值。[项目观测约定](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 4. CMDP：把目标与约束分开，并保持单位一致

定义奖励 $r$ 衡量煤、电和执行平滑性，成本 $c_j$ 衡量第 $j$ 项约束。一个便于解释单位的折扣形式是

$$\max_\pi J_r(\pi),\quad J_{c_j}(\pi)\le d_j,$$
$$J_r=(1-\gamma)\mathbb E_\pi\sum_{t\ge0}\gamma^t r_{t+1},\qquad J_{c_j}=(1-\gamma)\mathbb E_\pi\sum_{t\ge0}\gamma^t c_{j,t+1}.$$

乘上 $1-\gamma$ 后，常值成本的指标等于该常值；去掉这个因子也完全可以，但预算必须同步换算。平均成本形式又是另一种长期定义，不能直接复用未经转换的预算。本项目中的质量和氧含量阈值属于项目约定，作为独立成本与执行保护使用，不是全球水泥工艺标准。

拉格朗日函数为 $\mathcal L=J_r-\sum_j\lambda_j(J_{c_j}-d_j)$，$\lambda_j\ge0$。策略方向提高 $\mathcal L$，乘子通过

$$\lambda_j\leftarrow\left[\lambda_j+\eta_\lambda(\widehat J_{c_j}-d_j)\right]_+$$

提高超预算约束的代价。若估计成本 $0.12$、预算 $0.10$、步长 $0.5$，乘子增加 $0.01$；若成本低于预算，则倾向降低乘子，但不会降到负数。这是带估计噪声的优化更新，不是每一步都可行的证明。平均成本小可以与少量严重违规并存；训练期的预算满足、测试期的预算满足和逐时刻工程安全也不是同一命题。[CPO 原论文](https://arxiv.org/abs/1705.10528)

因此门控和成本学习各有作用：门控阻止当前已知不合规候选执行，成本价值让策略学会提前避开未来风险。门控拒绝率应独立报告，否则一个不断提出危险建议、总靠回退保持运行的策略，可能在仅看执行后违规率时显得很好。

## 5. 从日志学策略，需要行为支持而不仅是样本数量

设日志行为策略为 $\mu$，目标策略为 $\pi$。重要性比率 $\pi(a\mid h)/\mu(a\mid h)$ 有意义的必要支持条件是：目标策略给正概率的动作，行为策略在相同信息条件下也要有支持。工业日志常集中在窄工况和小幅调整区；一百万条近乎保持动作，并不等于可靠覆盖所有六维联合增量。

普通在线 SAC/TD3 依靠后续交互纠正价值误差；直接让它们在固定日志上反复最大化 Critic，可能选择数据外的虚高价值动作。CQL 等离线方法正是针对这种分布外评价风险提出约束或保守学习，理论结论也依赖数据、函数逼近和优化假设。[CQL](https://arxiv.org/abs/2006.04779)。离线学习可以生成研究候选，但不能从“训练结束”推导出“允许现场探索”。本仓库交互范围仍是离线与仿真。

## 6. RL 与优化的连接点应当可替换、可消融

可以让 RL 学终端价值、为优化器提供热启动、在可行示范附近学习策略，或调整经济 MPC 的参数。Gros 与 Zanon 研究了经济 NMPC 作为 RL 函数逼近器的联系，并分析了模型与成本修正之间的关系。相关定理有明确的修改阶段成本、终端价值及存在性条件；不能概括为“即使模型任意错误，RL 也保证控制最优且安全”。[原论文](https://arxiv.org/abs/1904.04152)

比较时先固定同一个状态信息、动作接口、偏好、约束与评价环境，再替换终端价值、候选生成器或策略学习器。持续过程在有限模拟窗口结束时是截断：价值目标可以对最终观测 bootstrap，但优势递推不能跨越重置串接下一段轨迹。这样得到的差异才能主要归因于决策方法，而不是标签泄漏、动作权限或终止语义被悄悄改变。`,
      en: String.raw`## 1. The object being solved changes, not just the algorithm name

Let $h_t$ denote the information currently available. A one-step optimizer chooses $a_t^*=\arg\min_a\widehat\ell(h_t,a)$. A trajectory optimizer chooses $a_{t:t+H-1}$ and propagates a model to account for future consequences. A feedback policy maps available information to a decision distribution $\pi(a\mid h)$. Trajectory optimization that executes the first action and replans is itself a feedback policy. RL learns long-term values and decision rules from interaction or logs; it does **not** introduce the first way to reason about future outcomes. [MPC textbook](https://sites.engineering.ucsb.edu/~jbraw/mpc/); [Sutton and Barto](https://incompleteideas.net/book/the-book-2nd.html)

In this kiln problem, supervisory actions remain CV setpoint increments, and dynamic evaluation includes the response of the inner DCS/APC loops. A hold-setpoint action does not stop the process: feed, heat transfer, reactions, cooling and disturbances continue. Equating lowest present fuel use with long-run optimality, or implementing rejected actions by freezing the simulator, changes the problem. [Project contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
  D["Arrived signals and assays"] --> H["History or belief state"]
  H --> P["Policy proposes increments"]
  H --> O["Model planner proposes increments"]
  P --> G["Gate determines execution"]
  O --> G
  G --> K["Inner control and process advance"]
  K --> R["Energy rewards and separate costs"]
  K --> D
  R --> L["Value learning or model calibration"]
  L --> P
  L --> O
~~~

## 2. An MDP is a conditional-independence assumption

A sufficient state $S_t$ supports a Markov decision process when

$$P(S_{t+1},R_{t+1},C_{t+1}\mid S_{0:t},A_{0:t})=P(S_{t+1},R_{t+1},C_{t+1}\mid S_t,A_t).$$

Relevant memory may include thermal and material states, current setpoints, the previous executed increment, equipment modes and variables used by the gate. The right-hand side does not assert absence of disturbances. It asserts that, conditional on the present state and action, earlier history supplies no additional information about the next-step distribution. Many such variables are hidden in a kiln; concatenating instantaneous temperatures, pressures and an old assay does not prove the Markov property.

For the theoretical derivation, suppose a sufficient state exists. Let $a$ be a requested action and $G(s,a)$ the gate. The composite kernel $P_G$ includes gating and the inner-loop response. Then

$$V^\pi(s)=\mathbb E_{a\sim\pi(\cdot\mid s)}\!\left[\mathbb E_{(s',r)\sim P_G(\cdot\mid s,a)}\!\left[r+\gamma V^\pi(s')\right]\right].$$

The outer expectation averages policy choices; the inner expectation averages stochastic outcomes for that choice. The optimality equation optimizes over actions while retaining the transition expectation. An action changes which states will subsequently be visited. The objective therefore concerns a policy-induced trajectory distribution, not independent minimization of predicted fuel use on each fixed row of a historical table.

Consider two entirely synthetic, constraint-satisfying alternatives. Their two-step energy costs are $[1,5]$ and $[2,1]$. Immediate optimization chooses the first. With $\gamma=0.9$, negative-cost returns are $-1-0.9\times5=-5.5$ and $-2-0.9\times1=-2.9$, favoring the second. Quality violations have not been hidden in the reward; this example concerns only delayed energy consequences. Evolutionary trajectory optimization, MPC and a correctly learned value function can all recognize this difference.

## 3. Partial observation requires representing what remains unknown

A POMDP separates hidden state $S_t$ from observation $O_t$. An ideal belief $b_t(s)=P(S_t=s\mid O_{0:t},A_{0:t-1})$ combines prediction and observation updates:

$$b_{t+1}(s')\propto P(o_{t+1}\mid s')\int P_G(s'\mid s,a_t)b_t(s)\,ds.$$

Industrial projects rarely possess a fully credible probabilistic model for this update. A history window, recurrent network or temporal encoder approximates an information state instead. That is a testable approximation; using a TCN does not automatically turn the problem into an MDP. Compare memory lengths and encoders with parameter counts, delayed-label alignment and training budgets controlled. Check whether prediction residuals still systematically depend on older history. The [process-industry RL review](https://doi.org/10.1109/JAS.2024.124227) organizes the field, but individual process models still require justification.

The full project interface includes 24 five-minute samples, present setpoints, a soft estimate, released assays and assay age, and raw-meal moduli. This is nominally a roughly two-hour window, while the first and last samples are $23\times5=115$ minutes apart. A window name is not an exact physical delay. The teaching workbench's 13 observation dimensions and three actions also differ from the full 36-variable, six-CV proposal.

Suppose a sample is taken at 10:00 and released at 10:40. A 10:20 policy cannot read it. A 10:45 policy can, but the value describes the 10:00 material: sample age is 45 minutes and time since release is five minutes. After release, supervised soft-sensor training may align the label to the sampling time. This does not permit filling that label into earlier decision inputs. Preserve sampling time, release time, missingness and the value actually available at each decision. [Project observation contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 4. CMDPs separate objectives and constraints

Let reward $r$ measure fuel, electricity and executed-action smoothness, and let $c_j$ measure constraint $j$. A discounted formulation with interpretable units is

$$\max_\pi J_r(\pi),\quad J_{c_j}(\pi)\le d_j,$$
$$J_r=(1-\gamma)\mathbb E_\pi\sum_{t\ge0}\gamma^t r_{t+1},\qquad J_{c_j}=(1-\gamma)\mathbb E_\pi\sum_{t\ge0}\gamma^t c_{j,t+1}.$$

The $1-\gamma$ factor makes the criterion for a constant cost equal to that constant. Omitting it is also valid, provided the budget is converted consistently. Long-run average cost is a different definition and cannot inherit an unconverted discounted budget. Quality and oxygen thresholds in this repository are project conventions for separate costs and execution protection, not universal cement standards.

Write $\mathcal L=J_r-\sum_j\lambda_j(J_{c_j}-d_j)$ with $\lambda_j\ge0$. Policy optimization increases $\mathcal L$, while

$$\lambda_j\leftarrow\left[\lambda_j+\eta_\lambda(\widehat J_{c_j}-d_j)\right]_+$$

increases the price of over-budget costs. If estimated cost is $0.12$, the budget $0.10$ and step size $0.5$, the multiplier increases by $0.01$. Below-budget cost tends to decrease it without allowing a negative value. This is an optimization update with estimation noise, not a per-step feasibility proof. A small average can coexist with rare severe violations. Training-budget satisfaction, test-budget satisfaction and instantaneous engineering safety are different propositions. [CPO](https://arxiv.org/abs/1705.10528)

The gate and cost learning serve complementary purposes. Gating prevents known noncompliant proposals from executing; cost values encourage anticipation of future risks. Report rejection rates separately: a policy that continually proposes unacceptable actions but is rescued by fallback may otherwise appear excellent when only executed violations are measured.

## 5. Logs need behavioral support, not merely large row counts

Let $\mu$ be the logging policy and $\pi$ the proposed policy. Importance ratios $\pi(a\mid h)/\mu(a\mid h)$ require support wherever the target policy assigns positive probability, conditional on the same information. Industrial logs often cover narrow regimes and small adjustments. A million nearly unchanged setpoints do not imply coverage of the six-dimensional joint increment space.

Online SAC and TD3 can use new interactions to correct value errors. Repeatedly maximizing a critic trained only on fixed logs may instead select unsupported actions with spuriously high values. Offline methods such as CQL specifically address this evaluation problem through conservative learning or restrictions, with conclusions dependent on data, approximation and optimization assumptions. [CQL](https://arxiv.org/abs/2006.04779). A completed offline training run produces a research candidate, not permission for live exploration. Interaction in this repository remains offline or simulated.

## 6. Make optimization–RL connections replaceable and testable

RL can learn a terminal value, warm-start an optimizer, fit a policy near feasible demonstrations or tune economic-MPC parameters. Gros and Zanon study economic NMPC as an RL function approximator and relate model mismatch to cost modification. Their results have explicit modified-stage-cost, terminal-value and existence conditions; they do not state that an arbitrarily wrong model becomes safe and optimal through RL. [Original paper](https://arxiv.org/abs/1904.04152)

First fix the available information, action interface, preferences, constraints and evaluation environment. Then replace a terminal value, candidate generator or learning component. In a continuing process, a finite simulation window ends by truncation: a value target may bootstrap from the final observation, while advantage recursion must stop across a reset. These controls help attribute differences to the decision method rather than to changed information, actuator permissions or termination semantics.`,
    },
  },
  {
    id: 'architecture', order: 6, group: 'reinforcement', minutes: 39,
    title: { 'zh-CN': '网络与数据路径：一个可审计的上层决策系统', en: 'Neural and data paths for an auditable supervisory agent' },
    summary: {
      'zh-CN': '逐一说明历史编码、软测量、tanh Actor、双 Critic、温度、成本、离线支持与世界模型各自学习什么，以及门控改变了哪些语义。',
      en: 'Explain what the history encoder, soft sensor, tanh actor, twin critics, temperature, costs, offline support and world model each learn—and what gating changes.',
    },
    figure: 'safe-agent',
    sources: ['r2-sac', 'r2-sac-apps', 'r2-td3', 'r2-cql', 'r2-iql', 'r2-td3bc', 'r2-mbpo', 'r2-mopo', 'r2-safety-filter', 'r2-project'],
    body: {
      'zh-CN': String.raw`## 1. 一张网络结构图必须同时是一张信息权限图

设计从数据路径开始，而不是从“堆更多模块”开始。快速 DCS 信号、当前 CV 设定值、原料率值、缺失掩码、已发布化验及其年龄进入时序编码器；软测量输出质量估计与经验证的不确定性描述。Actor 读取当时可用的表示，产生归一化候选增量，五层门控决定真正执行什么。奖励、成本和下一时刻观测形成训练记录。隐藏的当前真实质量只属于仿真评价或后来取得的监督标签，不得偷偷进入历史决策输入。[项目契约](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
  D["已到达信号、掩码与化验年龄"] --> E["历史编码与质量软测量"]
  E --> A["有界 Actor：候选增量"]
  E --> Q["双奖励 Critic 与成本 Critic"]
  A --> G["五层门控：执行增量"]
  G --> P["CV 设定值与内层控制"]
  P --> R["下一观测、奖励、成本与日志"]
  R --> D
  R --> Q
  Q --> A
~~~

这是建议的研究接口，不是已经训练和部署的工业网络。模块名称 OAM-Net、QC-MTWaveSME、MC3/OOD 在后续研究页中作为可接入接口讨论；此图不推断这些已有模块的层数、参数量、损失配方或未公开实验成绩。

## 2. 表示学习与质量监督各自回答不同问题

用 $h_t=f_\omega(X_{t-L+1:t},m_t,Y_t^{sp},q_t^{\rm available},\mathrm{age}_t,R_t)$ 表示信息编码。$m_t$ 表示缺失与有效性，$R_t$ 在本节指原料特征，不是奖励。编码器可以是 TCN、RNN、注意力网络或简单堆叠；选择应由时滞、数据规模、推理预算和消融结果决定。较低预测误差不自动说明表示保留了控制所需的全部信息。

若软测量输出均值 $\mu_i$ 和标准差 $\sigma_i>0$，一个高斯观测模型的监督损失是

$$L_{\rm soft}=\sum_i m_i^{\rm label}\left[\frac{(q_i-\mu_i)^2}{2\sigma_i^2}+\log\sigma_i\right].$$

这是省略常数的负对数似然；$m_i^{\rm label}$ 只选择合法可用标签。它要求残差分布假设及独立校准检查，输出一个数字 $\sigma$ 并不等于获得可靠置信区间。标签应对齐取样时刻，输入必须按决策时的可用性重建。若共享编码器同时接收预测损失、Critic 损失和 Actor 梯度，需要报告哪些梯度被截断、各损失如何缩放及表示版本；否则难以解释性能来自哪里。

## 3. 有界 Actor：边界来自变量变换，密度也必须跟着变

SAC 常使用可重参数化的高斯样本，再压缩到动作区间：

$$\epsilon\sim\mathcal N(0,I),\quad u=\mu_\theta(h)+\sigma_\theta(h)\odot\epsilon,\quad a^{\rm req}=\tanh u.$$
$$\log\pi_\theta(a^{\rm req}\mid h)=\log\mathcal N(u;\mu_\theta,\sigma_\theta^2)-\sum_i\log(1-\tanh^2u_i).$$

第二项来自变量替换的 Jacobian。若一维 $\mu=0,\sigma=1,a=0.5$，则 $u=\operatorname{atanh}(0.5)\approx0.5493$，高斯 log-density 约为 $-1.0698$；减去 $\log(0.75)\approx-0.2877$ 后，变换后的对数密度约为 $-0.7821$。省略 Jacobian 会改变熵目标和策略梯度。数值实现需处理饱和附近的稳定性，物理单位缩放若进入密度坐标也须加上对应常数 Jacobian。[SAC 原论文](https://arxiv.org/abs/1801.01290)

门控后执行为

$$a_t^{\rm exec}=G(h_t,a_t^{\rm req}),\qquad Y_{t+1}^{sp}=Y_t^{sp}+\mathrm{RATE}\odot a_t^{\rm exec}.$$

例如分解炉通道的项目 RATE 为每步 $2^\circ\mathrm C$，候选 $0.4$ 只有在通过时才对应 $0.8^\circ\mathrm C$ 的设定值变化。拒绝并保持时该通道实际增量为零，但过程照常推进。平滑性项必须使用执行增量及其变化。tanh 只限制归一化动作大小，不保证下一步氧含量、质量或机械状态可行。

## 4. Critic 到底评价候选，还是评价执行？必须选清楚

有两种一致的设计。**执行域 Critic** $Q^{\rm exec}(h,a^{\rm exec})$ 学习物理执行的后果，训练记录使用实际执行动作；要优化候选，就要考虑 $Q^{\rm exec}(h,G(h,a^{\rm req}))$。含拒绝和替换的门控通常不光滑，不能把它默认为可微层直接套用普通 SAC 梯度。

**候选域 Critic** $Q_G(h,a^{\rm req})$ 则把门控作为环境的一部分，评价“提出该候选后，既定 Gate 会如何执行”的长期结果。训练必须同时记录候选、执行、门控原因和版本，并使表示足以描述该复合环境。若老日志只有执行动作，不能假造被拒绝的候选去训练这个定义。换 Gate 后，转移关系也可能变化。

下文 SAC 公式使用第二种定义，并省略下标 $G$。策略 log-prob 始终属于采样得到的候选动作。若候选被替换为保持动作，**不能在替换值上计算原高斯 log-prob，并声称它是本次采样的概率**。执行动作分布可能因回退而包含原点质量，与原连续高斯变换密度不同。候选熵很高、执行却一直保持也是可能的；必须联合报告执行多样性与拒绝率。

## 5. 双 Critic、Actor 与温度的更新方向

现代 SAC 使用两个奖励 Critic 与慢更新目标网络。对于下一候选 $a'\sim\pi_\theta(\cdot\mid h')$，目标为

$$y=r+\gamma(1-d)\left[\min_{i=1,2}\overline Q_i(h',a')-\alpha\log\pi_\theta(a'\mid h')\right],$$
$$L_{Q_i}=\mathbb E_{\mathcal D}\left[(Q_i(h,a^{\rm req})-\operatorname{stopgrad}(y))^2\right].$$

$d$ 只表示真实终止，不是时间窗口截断。双 Q 取较小值用于缓解过估计；这不是可靠性置信下界，两个网络共享偏差时仍会一起犯错。[TD3](https://arxiv.org/abs/1802.09477)；[SAC Algorithms and Applications](https://arxiv.org/abs/1812.05905)。取 $r=-0.4,\gamma=0.9,d=0$，两目标 Q 为 $-2,-1.6$，$\alpha=0.2,\log\pi=-0.7$，则 $y=-0.4+0.9[-2+0.14]=-2.074$。

Actor 最小化

$$L_\pi=\mathbb E_{h,\epsilon}\left[\alpha\log\pi_\theta(a^{\rm req}\mid h)-\min_iQ_i(h,a^{\rm req})\right].$$

重参数化使随机性来自固定采样分布，梯度可沿 $\theta\to u\to a^{\rm req}\to Q$ 传播。优化 Actor 时固定 Critic 参数，不等于阻断 Q 对动作的导数。常见温度目标的方向可写成 $L_\alpha=\alpha(\widehat H-H_{\rm target})$，$\alpha>0$；把熵估计视为此步常数。若熵 $0.5$ 低于目标 $0.8$，梯度下降会提高 $\alpha$，增加保持随机性的动力。连续变量的微分熵依坐标尺度变化，目标值不是普适常数；更高熵也不是更安全。

成本 Critic 另外估计 $Q_{c_j}$，目标可用 $c_j+\gamma(1-d)\overline Q_{c_j}(h',a')$，不加入奖励熵项。约束 Actor 可以在损失中加 $\sum_j\lambda_jQ_{c_j}$，预算与折扣归一化保持一致。质量成本仍需来自正确标签或经验证的代理及不确定性处理；用同一个偏置软测量同时训练和评价，可能产生自我证明。

## 6. 离线数据改变了学习目标，不能只关闭采样循环

普通 SAC 在固定日志上最大化 Q，容易利用数据外误差。CQL 在 Bellman 误差之外，对高估的数据外动作施加保守压力。离散动作下，一个示意项为

$$L_{\rm conservative}=\beta\left[\mathbb E_h\log\sum_a e^{Q(h,a)}-\mathbb E_{(h,a)\sim\mathcal D}Q(h,a)\right].$$

连续动作需要积分及相应采样/密度校正，不能直接把六维网格穷举当成现实实现。原文关于策略价值的保守性结论有假设，不能改写为“任意神经网络 Q 在每个点都一定低于真值”。[CQL](https://arxiv.org/abs/2006.04779)

IQL 通过数据动作上的 expectile 回归学习状态价值：

$$L_V=\mathbb E_{\mathcal D}\left[\left|\tau-\mathbf1_{\delta<0}\right|\delta^2\right],\qquad\delta=\overline Q(h,a)-V(h).$$

$\tau=0.7$ 时，$\delta=2$ 的损失为 $2.8$，$\delta=-2$ 为 $1.2$，正残差受到更大权重，使 V 倾向拟合较好的数据动作。随后 Q 拟合 $r+\gamma V(h')$，Actor 进行由优势加权的行为克隆，常用权重与 $e^{\beta(Q-V)}$ 成正比，并设置数值上限。它减少价值训练时查询未见动作的需要，仍不保证拟合策略永不越出行为支持。[IQL](https://arxiv.org/abs/2110.06169)。普通 BC 和 [TD3+BC](https://arxiv.org/abs/2106.06860)应是保留的简单基线。

## 7. 世界模型必须显式看到动作，且不能替代证据

用于控制的模型应估计 $\widehat P_\psi(x_{t+1},r_{t+1},c_{t+1}\mid h_t,a_t^{\rm exec})$，或明确估计包含 Gate 的候选域转移。只根据历史预测下一温度的网络，可能准确复现操作员策略下的相关性，却未学会改变设定值后的反事实响应。动作条件、模式切换、延迟标签和模型不确定性需要专门验证。

MBPO 从真实状态分叉较短模型推演来减轻长序列模型误差，原始算法仍包含采集真实交互和更新模型；把它用于固定日志需重新考虑离线分布支持。[MBPO](https://arxiv.org/abs/1906.08253)。MOPO 将离线模型的不确定性纳入保守目标，但惩罚不是设备硬约束证明。[MOPO](https://arxiv.org/abs/2005.13239)。模型生成一万条轨迹仍是一万次模型推演，不是新增的一万次现场验证。

最后，五层阈值门控是项目执行规则；预测安全过滤器的形式化保证通常另需有效模型误差界、终端安全集合、备用控制器和可行性条件。应把“架构中有 Gate”与“满足特定安全定理”分开表述。[Wabersich 与 Zeilinger](https://doi.org/10.1016/j.automatica.2021.109597)。当前网站提供推导与教学模拟，没有在后台训练 SAC、运行工业世界模型或证明现场收益。`,
      en: String.raw`## 1. An architecture diagram is also an information-permission diagram

Begin with data paths, not with a list of fashionable modules. Fast DCS signals, current CV setpoints, raw-meal features, missingness masks, released assays and their ages enter a temporal encoder. A soft sensor supplies a quality estimate and a separately validated uncertainty description. The actor uses information available at decision time to propose normalized increments. Five gates determine execution. Rewards, costs and the next observation form training records. Hidden current quality belongs to simulator evaluation or subsequently obtained supervision; it must not leak into reconstructed historical policy inputs. [Project contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
  D["Arrived signals, masks and assay age"] --> E["History encoder and soft sensor"]
  E --> A["Bounded actor: requested increment"]
  E --> Q["Twin reward critics and cost critics"]
  A --> G["Five gates: executed increment"]
  G --> P["CV setpoints and inner control"]
  P --> R["Next observation, reward, costs and log"]
  R --> D
  R --> Q
  Q --> A
~~~

This is a proposed research interface, not a trained or deployed industrial network. OAM-Net, QC-MTWaveSME and MC3/OOD are discussed later as possible interfaces. This diagram does not reconstruct their layer counts, parameter counts, loss recipes or unpublished experimental results.

## 2. Representation learning and quality supervision answer different questions

Write $h_t=f_\omega(X_{t-L+1:t},m_t,Y_t^{sp},q_t^{\rm available},\mathrm{age}_t,R_t)$ for the encoded information. Here $m_t$ describes validity and missingness, and $R_t$ denotes raw-material features rather than reward. The encoder could be a TCN, RNN, attention model or simple stacked history. Delay structure, data volume, inference budget and controlled ablations should decide. Improved forecasting does not automatically mean that every control-relevant variable has been preserved.

If a soft sensor predicts mean $\mu_i$ and positive standard deviation $\sigma_i$, a Gaussian observation model gives

$$L_{\rm soft}=\sum_i m_i^{\rm label}\left[\frac{(q_i-\mu_i)^2}{2\sigma_i^2}+\log\sigma_i\right].$$

This negative log likelihood omits constants; $m_i^{\rm label}$ selects legitimate labels. The residual distribution assumption and interval calibration need independent checks. Merely outputting $\sigma$ does not provide a trustworthy uncertainty interval. Align labels to sample time while reconstructing inputs according to decision-time availability. If a shared encoder receives forecasting, critic and actor gradients, report gradient stops, relative loss scales and representation versions so that improvements remain interpretable.

## 3. A bounded actor needs a transformed density

SAC commonly reparameterizes a Gaussian sample and squashes it into the action range:

$$\epsilon\sim\mathcal N(0,I),\quad u=\mu_\theta(h)+\sigma_\theta(h)\odot\epsilon,\quad a^{\rm req}=\tanh u.$$
$$\log\pi_\theta(a^{\rm req}\mid h)=\log\mathcal N(u;\mu_\theta,\sigma_\theta^2)-\sum_i\log(1-\tanh^2u_i).$$

The second term is the change-of-variables Jacobian. With one dimension, $\mu=0,\sigma=1,a=0.5$, the pre-squash value is $u=\operatorname{atanh}(0.5)\approx0.5493$. Gaussian log density is approximately $-1.0698$; subtracting $\log(0.75)\approx-0.2877$ gives transformed log density $-0.7821$. Omitting the Jacobian changes both the entropy objective and policy gradient. Implementations need numerical care near saturation. If physical scaling is included in the density coordinates, its constant Jacobian also belongs in the density. [Original SAC paper](https://arxiv.org/abs/1801.01290)

Execution is

$$a_t^{\rm exec}=G(h_t,a_t^{\rm req}),\qquad Y_{t+1}^{sp}=Y_t^{sp}+\mathrm{RATE}\odot a_t^{\rm exec}.$$

For the project's calciner channel, RATE is $2^\circ\mathrm C$ per step. A request of $0.4$ becomes a $0.8^\circ\mathrm C$ setpoint change only if accepted. Rejection with hold fallback makes the executed increment zero while the process continues. Smoothness terms use executed increments and their changes. Tanh bounds a normalized action; it does not guarantee acceptable future oxygen, quality or mechanical states.

## 4. Does the critic value requests or execution?

Two coherent designs are possible. An **execution-domain critic** $Q^{\rm exec}(h,a^{\rm exec})$ learns physical consequences from executed-action records. Optimizing proposals requires considering $Q^{\rm exec}(h,G(h,a^{\rm req}))$. Rejection and replacement generally make a gate nonsmooth; ordinary SAC gradients cannot silently treat it as a differentiable layer.

A **proposal-domain critic** $Q_G(h,a^{\rm req})$ treats the gate as part of the environment and values the consequences of making a request under that gate. Log requests, executions, rejection reasons and gate versions, and represent enough information to describe this composite environment. If historical logs contain only executed actions, do not invent rejected requests to train this definition. Changing the gate may change the transition relation.

The following SAC equations use the second definition and omit subscript $G$. Policy log probability always belongs to the sampled request. When that request is replaced by a hold action, **evaluating the original Gaussian log probability at the replacement and calling it the sampled action's likelihood is incorrect**. Execution may acquire a point mass at zero through fallback, unlike the original continuous transformed density. High proposal entropy can coexist with almost constant execution, so measure executed diversity and rejection rates together.

## 5. Twin critics, the actor and temperature

Modern SAC uses two reward critics and slowly updated target networks. For a next request $a'\sim\pi_\theta(\cdot\mid h')$,

$$y=r+\gamma(1-d)\left[\min_{i=1,2}\overline Q_i(h',a')-\alpha\log\pi_\theta(a'\mid h')\right],$$
$$L_{Q_i}=\mathbb E_{\mathcal D}\left[(Q_i(h,a^{\rm req})-\operatorname{stopgrad}(y))^2\right].$$

Here $d$ denotes genuine termination, not exhaustion of a time window. Taking the smaller Q mitigates overestimation; it is not a calibrated lower confidence bound. Shared bias can make both critics wrong. [TD3](https://arxiv.org/abs/1802.09477); [SAC Algorithms and Applications](https://arxiv.org/abs/1812.05905). For $r=-0.4,\gamma=0.9,d=0$, target critics $-2,-1.6$, $\alpha=0.2$ and $\log\pi=-0.7$, the target is $y=-0.4+0.9[-2+0.14]=-2.074$.

The actor minimizes

$$L_\pi=\mathbb E_{h,\epsilon}\left[\alpha\log\pi_\theta(a^{\rm req}\mid h)-\min_iQ_i(h,a^{\rm req})\right].$$

Reparameterization moves randomness to a fixed sampling distribution, allowing gradients along $\theta\to u\to a^{\rm req}\to Q$. Freezing critic parameters during actor optimization does not block the derivative of Q with respect to the action. A temperature objective with the usual adjustment direction is $L_\alpha=\alpha(\widehat H-H_{\rm target})$, $\alpha>0$, treating the entropy estimate as constant for that update. If entropy is $0.5$ against a target of $0.8$, gradient descent increases $\alpha$ and strengthens the incentive for randomness. Differential entropy depends on coordinate scale; its target is not a universal constant, and higher entropy does not imply safety.

Separate cost critics estimate $Q_{c_j}$ using a target such as $c_j+\gamma(1-d)\overline Q_{c_j}(h',a')$, without the reward-entropy bonus. A constrained actor may add $\sum_j\lambda_jQ_{c_j}$ to its loss with consistent budget and discount normalization. Quality costs still require correctly aligned labels or a validated proxy with uncertainty treatment. Using the same biased soft sensor for training and final evaluation can create circular evidence.

## 6. Offline learning changes the objective, not just the collection loop

Maximizing an ordinary SAC critic trained on fixed logs can exploit unsupported actions. CQL supplements Bellman fitting with conservative pressure on high-valued actions outside the data. For discrete actions, an illustrative term is

$$L_{\rm conservative}=\beta\left[\mathbb E_h\log\sum_a e^{Q(h,a)}-\mathbb E_{(h,a)\sim\mathcal D}Q(h,a)\right].$$

Continuous actions require integration with appropriate sampling and density corrections; exhaustive enumeration of a six-dimensional grid is not a realistic substitute. The paper's policy-value conservatism statements have assumptions. They do not say that every arbitrary neural Q estimate is a pointwise lower bound on truth. [CQL](https://arxiv.org/abs/2006.04779)

IQL fits a state value through expectile regression over dataset actions:

$$L_V=\mathbb E_{\mathcal D}\left[\left|\tau-\mathbf1_{\delta<0}\right|\delta^2\right],\qquad\delta=\overline Q(h,a)-V(h).$$

At $\tau=0.7$, residual $2$ contributes $2.8$, while residual $-2$ contributes $1.2$. Stronger weighting of positive residuals moves V toward better dataset actions. Q then fits $r+\gamma V(h')$, and the actor uses advantage-weighted behavior cloning, often with weights proportional to $e^{\beta(Q-V)}$ and numerical caps. This reduces the need to query unseen actions during value training; the fitted policy is still not guaranteed to stay within behavioral support. [IQL](https://arxiv.org/abs/2110.06169). Retain plain BC and [TD3+BC](https://arxiv.org/abs/2106.06860) as simple baselines.

## 7. A world model must see actions and cannot manufacture evidence

A control model should estimate $\widehat P_\psi(x_{t+1},r_{t+1},c_{t+1}\mid h_t,a_t^{\rm exec})$, or explicitly estimate the proposal-domain transition including the gate. A network that forecasts temperature from history alone may reproduce correlations under the operator's policy without learning counterfactual responses to changed setpoints. Action conditioning, mode switches, delayed labels and uncertainty require dedicated evaluation.

MBPO branches short model rollouts from real states to reduce long-horizon model error. Its original algorithm also collects real interactions and updates its model; adaptation to fixed logs requires separate treatment of offline support. [MBPO](https://arxiv.org/abs/1906.08253). MOPO incorporates offline-model uncertainty into a conservative objective, but a penalty is not a hard-constraint certificate. [MOPO](https://arxiv.org/abs/2005.13239). Ten thousand generated trajectories remain ten thousand model rollouts, not ten thousand new physical validations.

Finally, the project's five threshold gates are execution rules. Formal predictive-safety-filter results typically require credible model error bounds, terminal safe sets, a backup controller and feasibility assumptions. Having a Gate box in a diagram does not establish those premises. [Wabersich and Zeilinger](https://doi.org/10.1016/j.automatica.2021.109597). This website supplies derivations and teaching simulations; it neither trains SAC in the background nor runs an industrial world model or demonstrates plant savings.`,
    },
  },
];
