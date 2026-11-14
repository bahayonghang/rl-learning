import type { ResearchPage } from './types';

export const formulationPages: ResearchPage[] = [
  {
    id:'history', order:1, group:'formulation', minutes:24, figure:'operations-stack',
    title:{'zh-CN':'从全厂控制到运行指标决策','en':'From plantwide control to operational decisions'},
    summary:{'zh-CN':'先定位决策层，再理解 RTO、跟踪 MPC、经济 MPC 和学习策略各自回答的问题。','en':'Locate the decision layer before comparing RTO, tracking MPC, economic MPC and learned policies.'},
    sources:['r2-skogestad','r2-rto','r2-engell','r2-empc','r2-mpcbook','r2-project'],
    body:{
      'zh-CN':String.raw`## 1. 先问“决定什么”，再问“用什么算法”

水泥烧成系统中的控制并不是一个从传感器直接连到执行器的黑箱。生产计划约束产量和产品，运行优化选择可接受的操作区间，上层决策给出温度、压力等 CV 的设定值，下层 PID/APC 再调节实际操纵量。各层解决的问题和反馈速度不同；一层的输出通常是另一层的目标或边界。Skogestad 的[全厂控制原文](https://doi.org/10.1016/S0959-1524(00)00023-8)将“应该控制哪些变量”与“采用哪种控制器”明确分开，这对学习方法同样重要。

本项目研究的接口位于上层运行决策：每五分钟提出有界 CV 设定值增量。它沿用内层调节、权限和安全门，不直接输出给煤量或风机开度。比较一个直接操纵执行器的 RL 与一个只修改设定值的优化器，无法把结果差异全部归因于学习算法，因为控制权限、动态响应和约束已经不同。[项目契约](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
    P["生产计划与产品要求"] --> O["经济目标与操作边界"]
    O --> S["上层设定值决策"]
    M["状态估计与质量信息"] --> S
    S --> G["门控与执行授权"]
    G --> C["DCS 与 PID 或 APC"]
    C --> K["烧成物理过程"]
    K --> M
    K --> A["指标核算与审计"]
    A --> O
~~~

## 2. 稳态 RTO 将经济要求变成操作点

经典稳态实时优化可以写成：

$$\min_{x_s,u_s}\ \ell_{econ}(x_s,u_s,d),\qquad 0=f_s(x_s,u_s,d),\quad g(x_s,u_s,d)\le0.$$

下标 $s$ 表示稳态，$d$ 是扰动或工况参数。模型先回答在给定原料、价格和生产要求下，哪个稳态操作点更有利，再把结果转换为下层目标。RTO 还需要数据协调、参数估计、稳态检测和结果实施；求解器找到最优数值，并不意味着这些工程环节已经完成。[Darby 等的综述](https://doi.org/10.1016/j.jprocont.2011.03.009)讨论的是这整套实践，而不只是一个优化表达式。

稳态近似的优点是问题相对清楚、经济解释直接；限制来自“在求解和实施期间可以把工况近似看作稳定”这一条件。频繁原料变化、长物料延迟或转换过程可能使同一个稳态点的即时实施代价很大。这是特定问题表述的限制，不能据此断言 RTO、进化算法或优化技术不能处理动态问题。动态 RTO 和滚动优化正是对这些条件的不同处理。

## 3. 跟踪 MPC 与经济 MPC 的目标不同

跟踪 MPC 常最小化预测输出与目标之间的偏差，再加动作变化项：

$$\min_{a_{0:H-1}}\sum_{k=0}^{H-1}\left(\|y_k-y^{ref}_k\|_Q^2+\|\Delta a_k\|_R^2\right)+V_f(x_H).$$

这里的 $Q,R$ 是权重矩阵，不是 RL 的动作价值函数。控制器使用动态模型预测一段轨迹，只执行第一步，再用新观测重新求解。这种反馈来自重复估计和重新规划，不要求每次都执行最初计划的全部动作。[Rawlings、Mayne 与 Diehl 的开放教材](https://sites.engineering.ucsb.edu/~jbraw/mpc/)详细讨论其模型、约束和终端条件。

经济 MPC 把阶段目标直接改成经济或运行损失 $\ell_{econ}(x_k,a_k)$。最低经济损失不一定恰好位于某个固定参考点，某些问题甚至可能偏好周期运行；因此传统跟踪代价的稳定性结论不能不加条件地照搬。终端集、终端代价、耗散性和可行性等结构，要与具体设计一起检查。[Engell](https://doi.org/10.1016/j.jprocont.2006.10.011)与[Ellis 等](https://doi.org/10.1016/j.jprocont.2014.03.010)提供了从跟踪到经济运行的理论背景。

## 4. 一个需要动态比较的设定值算例

假设只有“保持”和“小幅上调”两个已通过门控的候选，两方案均遵守质量与氧含量约束。下面的无量纲能耗/平滑性成本是课堂假设，不是辨识出的烧成规律：保持后两段成本为 $[0,4]$；上调后为 $[1,1]$。若只看第一段，保持更好；两段折扣和取 $\gamma=0.9$，则保持为 $3.6$，上调为 $1.9$。后者用眼前代价换取随后运行成本改善，没有用节能收益交换质量越界。

能够比较这两段轨迹的动态优化器同样可以发现这种取舍，完全不必先变成 RL。真正需要回答的是：后果模型来自哪里，未知未来如何补足，计算预算是否允许每步重算，策略将在哪些未见工况被使用。RL 的候选价值是从数据中学习长期价值或反馈规则，使部分在线搜索转移到训练阶段；它仍要承担数据支持和泛化的代价。

## 5. 用四个问题比较架构

| 问题 | 稳态 RTO | 动态 MPC / 轨迹优化 | 学习策略或价值 |
| --- | --- | --- | --- |
| 优化对象 | 工况下的操作点 | 有限时域动作或设定值路径 | 从信息到动作的规则、长期价值 |
| 模型如何进入 | 稳态关系与约束 | 动态预测与终端结构 | 交互数据，可同时使用世界模型 |
| 新观测如何改变决策 | 更新参数或重算操作点 | 状态估计后重新规划 | 策略推断；必要时按受控协议再训练 |
| 主要验证问题 | 模型失配与实施协调 | 多步误差、可行性、计算延迟 | 支持覆盖、价值偏差与分布变化 |

这个表是比较维度，不是排名。EA 可作为动态 MPC 的求解器；神经网络可为 MPC 提供模型或末端价值；RL 也可以调节一个优化器的参数。方法可以组合，研究贡献必须通过相同信息、相同动作权限、相同约束和相同资源预算来识别。

## 6. 自优化控制关心的不是“把误差压到零”

设工况为 $d$，理想可行操作点为 $u^*(d)$。选择某组 CV 并保持其设定值后，内层闭环实际形成操作点 $u(c,d)$。对最小化经济成本 $J$，可以比较损失

$$\mathcal L(c,d)=J(u(c,d),d)-J(u^*(d),d).$$

在两者都满足同一约束、$u^*$ 是全局最优的条件下，损失非负。关注的是扰动和实现误差下，所选 CV 是否仍能保持较小经济损失，而不只是跟踪误差是否接近零。这是[自优化控制](https://doi.org/10.1016/S0959-1524(00)00023-8)对学习架构很有用的提问方式：控制得很准的变量，可能并不是经济上最敏感的变量。

用虚构损失举例：方案一在两个等可能工况下损失为 $[1,9]$，方案二为 $[3,4]$。只在第一个工况验证会偏好方案一；平均损失分别为 5 与 3.5，最坏损失为 9 与 4，评价范围扩展后会选方案二。这里比较的是可行闭环的经济损失，不是允许违反约束换利润。该思想提示我们分工况验证软测量、设定值与内层响应的完整链条。

本教程保持仓库已有 CV 接口，不重新选择实际装置控制结构。若以后研究新的 CV 组合，应把它作为独立的工程建模课题：先确定测量与可操纵自由度，再检查内层可跟踪性和经济敏感性，最后讨论学习方法。否则 CV 变化带来的收益会被错误记到新算法名下。

## 7. 本项目应该保留的历史经验

第一，经济目标必须能落到可测的运行指标，不能只剩一个不知单位的 reward。第二，设定值应与内层可跟踪范围、速度和授权协调；缓慢的外层建议也可能激起快速的内层响应。第三，状态估计、时间同步、模型维护和操作人员退出机制是决策系统的一部分，不能只在算法成功后再补。

最后，所谓“学习到更好的运行策略”，应具体说明它相对于操作员策略、已有 PG-MOEA/D-IEpsilon 与其他合理优化基线多解决了什么问题。如果改进来自更准确的软测量、更晚到但被错误回填的化验，或更多模型调用，就应分别归因。后面的综述沿这条线展开：指标先定义清楚，约束再写准确，算法最后接受公平检验。`,
      en:String.raw`## 1. Identify the decision before choosing an algorithm

A cement control system is not one black box connecting sensors directly to actuators. Production planning specifies output and product requirements. Operational optimization identifies acceptable operating regions. Supervisory decisions specify controlled-variable targets. PID or APC loops then manipulate the physical process. These layers have different responsibilities and feedback rates; the output of one layer often becomes another layer's reference or constraint. [Skogestad's plantwide-control paper](https://doi.org/10.1016/S0959-1524(00)00023-8) separates the selection of controlled variables from the selection of a controller. Learning methods must respect the same distinction.

This repository places RL at the supervisory layer: every five minutes it proposes bounded CV setpoint increments, retaining the inner control loops, authorization and safety checks. It does not directly command coal feeders or fan openings. Comparing direct-actuator RL with an optimizer restricted to setpoints changes both the algorithm and the available control authority. A resulting performance difference cannot be attributed to learning alone. [Project contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

~~~mermaid
flowchart TD
    P["Production and product requirements"] --> O["Economic objectives and boundaries"]
    O --> S["Supervisory setpoint decision"]
    M["State and quality information"] --> S
    S --> G["Gate and authorization"]
    G --> C["DCS and PID or APC"]
    C --> K["Physical kiln process"]
    K --> M
    K --> A["Indicator accounting and audit"]
    A --> O
~~~

## 2. Steady-state RTO converts economics into an operating point

A classical steady-state real-time optimization problem has the form

$$\min_{x_s,u_s}\ \ell_{econ}(x_s,u_s,d),\qquad 0=f_s(x_s,u_s,d),\quad g(x_s,u_s,d)\le0.$$

The subscript $s$ denotes a steady state and $d$ represents disturbances or operating conditions. Given raw-material properties, prices and production requirements, the model identifies a favorable operating point and translates it into lower-layer targets. The surrounding workflow also needs data reconciliation, parameter estimation, steady-state detection and implementation. A numerical optimum is not evidence that these engineering tasks have been solved. [Darby et al.](https://doi.org/10.1016/j.jprocont.2011.03.009) review this broader RTO practice.

The attraction is a comparatively explicit optimization problem and a direct economic interpretation. The limitation is the assumption that conditions can be approximated as steady during estimation, optimization and implementation. Frequent feed changes, material delays or transitions may make a nominally attractive operating point costly to reach. This limits that formulation; it does not establish that RTO, evolutionary algorithms or optimization in general cannot handle dynamics. Dynamic RTO and receding-horizon formulations address the issue in different ways.

## 3. Tracking MPC and economic MPC optimize different quantities

A tracking MPC formulation often penalizes predicted reference error and input changes:

$$\min_{a_{0:H-1}}\sum_{k=0}^{H-1}\left(\|y_k-y^{ref}_k\|_Q^2+\|\Delta a_k\|_R^2\right)+V_f(x_H).$$

Here $Q$ and $R$ are weighting matrices, not RL action-value functions. The controller predicts a trajectory, applies its first move, receives a new observation and solves again. Feedback comes from repeated estimation and replanning; it does not require executing the original plan to completion. The open [Rawlings–Mayne–Diehl textbook](https://sites.engineering.ucsb.edu/~jbraw/mpc/) develops the associated models, constraints and terminal ingredients.

Economic MPC instead uses an economic or operational stage loss $\ell_{econ}(x_k,a_k)$. Its optimum need not coincide with one fixed tracking reference; some formulations can favor periodic operation. Consequently, familiar stability conclusions from a tracking cost cannot simply be imported. Terminal costs, terminal sets, dissipativity and feasibility must be checked for the particular construction. [Engell](https://doi.org/10.1016/j.jprocont.2006.10.011) and [Ellis et al.](https://doi.org/10.1016/j.jprocont.2014.03.010) explain this shift toward economic operation.

## 4. A small example that requires a trajectory comparison

Consider two gate-approved setpoint candidates, hold and increase slightly, both satisfying the same quality and oxygen constraints. Invented dimensionless energy/smoothness costs are $[0,4]$ after holding and $[1,1]$ after increasing. These numbers illustrate a mechanism; they are not identified kiln dynamics. Looking only at the first period favors holding. With $\gamma=0.9$, the two-period costs are $3.6$ and $1.9$, so an immediate cost buys lower subsequent operational cost without exchanging quality violations for savings.

A dynamic optimizer can discover this trade-off without becoming an RL method. The substantive questions are where its consequence model comes from, how it accounts for the unplanned tail, whether online computation is affordable, and which unseen conditions it must handle. RL offers the possibility of learning a long-horizon value or feedback rule from data, moving some online computation into training. It pays for this with requirements on data support and generalization.

## 5. Compare architectures along four axes

| Question | Steady-state RTO | Dynamic MPC or trajectory search | Learned policy or value |
| --- | --- | --- | --- |
| Optimized object | An operating point under specified conditions | A finite action or setpoint trajectory | An information-to-action rule or long-term value |
| Model role | Steady-state relations and constraints | Dynamic prediction and terminal structure | Interaction data, optionally a world model |
| Response to observations | Update estimates and recompute the point | Estimate state and replan | Policy inference, with controlled retraining if appropriate |
| Main validation issue | Mismatch and implementation coordination | Rollout error, feasibility and computation delay | Support, value bias and distribution change |

This is a set of comparison axes, not a ranking. An EA can solve a dynamic MPC problem. A neural network can supply its model or terminal value. RL can tune an optimizer rather than replace it. The contribution of a hybrid must be established using the same available information, action authority, constraints and resource budget.

## 6. Self-optimizing control asks more than whether tracking error is zero

Let $d$ denote conditions and $u^*(d)$ an ideal feasible operating point. Holding a selected set of CVs at references produces an actual inner-loop operating point $u(c,d)$. For a minimized economic cost $J$, compare

$$\mathcal L(c,d)=J(u(c,d),d)-J(u^*(d),d).$$

The loss is nonnegative when both points satisfy the same constraints and $u^*$ is globally optimal. The question is whether selected CVs maintain small economic losses under disturbances and implementation error, not merely whether their tracking errors approach zero. This perspective from [self-optimizing control](https://doi.org/10.1016/S0959-1524(00)00023-8) transfers usefully to learning architectures: a precisely regulated variable need not be the economically important one.

As an invented example, design one incurs losses $[1,9]$ under two equally likely regimes, while design two incurs $[3,4]$. Testing only the first regime favors design one. Mean losses are 5 and 3.5, and worst losses are 9 and 4, favoring design two once the evaluation scope expands. These are economic losses between feasible closed loops, not permission to buy constraint violations with profit. The example motivates regime-level validation of the complete soft-sensor, setpoint and inner-control chain.

The tutorial preserves the existing CV interface. Studying a different CV selection would require a separate engineering formulation: establish measurements and available degrees of freedom, check inner-loop trackability and economic sensitivity, then evaluate the learning method. Otherwise the benefit of changing the control structure may be mistakenly attributed to the algorithm.

## 7. Lessons the research should retain

First, economic objectives must map to auditable measurements rather than disappear into an unexplained reward. Second, setpoints must respect the inner system's tracking capability, rate limits and authorization. A slow supervisory change can still induce a fast regulatory response. Third, estimation, synchronization, model maintenance and operator exit mechanisms are parts of the decision system, not accessories to add after an algorithm succeeds.

A claim of a better learned operational policy must identify what it improves over operator behavior, the project's PG-MOEA/D-IEpsilon baseline and other appropriate optimization baselines. Better soft sensing, extra model calls and future assay leakage are three very different explanations for apparent progress. The review therefore proceeds from measurable indicators, to precise objectives and constraints, and only then to algorithms and evidence.`,
    },
  },
  {
    id:'indicators', order:2, group:'formulation', minutes:25,
    title:{'zh-CN':'运行指标、权衡与因果混杂','en':'Operational indicators, trade-offs and confounding'},
    summary:{'zh-CN':'把煤耗、电耗、质量、产量、排放与平稳性放回单位、边界和时间，再讨论策略收益。','en':'Put fuel, electricity, quality, throughput, emissions and stability back into units, boundaries and time before comparing policies.'},
    sources:['r2-cement-bat','r2-energy-guide','r2-project','r2-rliable'],
    body:{
      'zh-CN':String.raw`## 1. 指标定义先于奖励设计

“节能”只有在明确生产边界、产品分母、时间窗和燃料口径后，才是可比较的量。熟料烧成与水泥粉磨是不同边界；每吨熟料电耗与每吨水泥综合电耗不能直接拼成一张算法排名。[EPA 水泥能效指南](https://www.energystar.gov/sites/default/files/buildings/tools/ENERGY%20STAR%20Guide%20for%20the%20Cement%20Industry%2028_08_2013%20Final.pdf)按工序讨论能耗，[欧盟 BREF](https://publications.jrc.ec.europa.eu/repository/handle/JRC83006)同时处理能源、物料与排放。本页借用这种核算思路，不把历史行业平均数当成本项目实测值。

| 指标 | 一个清楚的定义 | 决策研究中容易漏掉什么 |
| --- | --- | --- |
| 单位燃料质量 | kg 燃料 / t 熟料 | 热值、含水、替代燃料比例和煤耗折算基准 |
| 单位热耗 | GJ 燃料热输入 / t 熟料 | 低位或高位热值、系统边界、启动和停机段 |
| 单位电耗 | kWh / t 熟料 | 包含哪些风机、冷却、输送和辅助设备 |
| 质量 | f-CaO、其他检验与合格率 | 样品时间、发布延迟、采样频率和未检样品 |
| 产量 | t/h 或窗口合格产品总量 | 降低负荷换取较低瞬时能耗的代价 |
| 排放 | 质量流量、浓度或单位产品排放 | 干湿基、标态、参考氧和统计时间的统一 |
| 平稳性 | CV 波动、跟踪误差、增量总变差 | 趋势与波动的区别，以及平稳但偏离目标的状态 |

## 2. “平均单位能耗”有两种不同算法

设第 $i$ 个时间段能耗为 $E_i$，产量为 $M_i$。只要总产量 $\sum_iM_i>0$，总体单位电耗就按总量核算；当各段均有 $M_i>0$ 时，还可以展开成产量加权平均：

$$e_{total}=\frac{\sum_i E_i}{\sum_i M_i}=\sum_i\frac{M_i}{\sum_jM_j}\frac{E_i}{M_i}.$$

所以在各段产量为正的条件下，它是按产量加权的单位能耗，而不是各段比值的普通平均。启停段若 $M_i=0,E_i>0$，该段比值没有定义，但能耗仍须保留在总分子中；不能为计算平均而删除。例如两段 $E=[100,900]$ kWh、$M=[0,100]$ t，总体为 10 kWh/t，删去零产段会错误得到 9。若总产量为零，就不报告该窗口的吨产品比值，而单独列能耗与运行状态。

另一个教学例中，两段分别耗电 10,000 和 16,000 kWh，生产 100 和 200 t。各段为 100 和 80 kWh/t；普通平均为 90，总量口径却为 $26000/300\approx86.67$ kWh/t。负荷变化时，混用这两个数会产生虚假的改善。

同样，若 A 方案用 10,000 kWh 生产 100 t，B 用 14,400 kWh 生产 150 t，B 的单位电耗低 4%，总耗电却高 44%。两句话都可以正确，但回答的问题不同。研究报告应同时给产量、总量和单位量，说明比较是否满足相同生产要求，而不是只选一个有利的百分比。

## 3. 燃料质量下降不一定代表热输入下降

热输入需要把燃料质量乘以对应热值：

$$Q_{fuel}=\sum_j m_j H_j,\qquad q_{spec}=\frac{Q_{fuel}}{M_{clinker}}.$$

教学例 A 使用 100 kg/t、热值 25 MJ/kg 的燃料，热输入为 2.5 GJ/t；B 使用 90 kg/t、热值 30 MJ/kg 的燃料，却是 2.7 GJ/t。质量口径减少 10%，热输入反而增加 8%。这不是对任何实际工厂的判断，而是单位换算说明：不同燃料、含水和替代燃料条件下，先统一基准才能把变化归因于设定值策略。

碳排放还涉及燃烧与原料分解等不同来源；仅降低电耗，不足以推出全部温室气体排放按同一比例下降。排放浓度与排放质量也不同：稀释可能改变浓度，未必减少污染物质量。研究应保存原始流量、测量条件和核算版本，不能让归一化 reward 取代物理核算。[BREF](https://publications.jrc.ec.europa.eu/repository/handle/JRC83006)

## 4. 质量指标有时间戳，也有适用范围

f-CaO 提供熟料质量相关信息，但不代表所有产品性质都由一个数决定。当前仓库采用 f-CaO 区间 $[0.5,1.5]\%$ 与 $O_2\ge1.2\%$ 等约定；这些是教学与项目接口，不能作为别的窑线的普遍阈值。[项目来源](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

至少要保留样品采集时刻 $\tau$、结果可用时刻 $v$ 和决策时刻 $t$。只有 $v\le t$ 的化验可以进入策略输入；样品年龄是 $t-\tau$。10:00 采样、10:40 返回的结果不能被 10:20 的策略读取。事后可以把它用于正确对齐的质量评价，但“新发布”不等于“反映刚才动作”。物料停留分布不一定是一个精确固定滞后，简单把所有样品平移一个常数也需要验证。

## 5. 不把相关性直接写成动作效果

操作员可能在原料变难烧、质量已有恶化迹象时提高温度设定值。历史上“高设定值与高 f-CaO 同时出现”，可以是补救动作和困难工况共同造成，不能直接断言提高设定值使质量变差。下图表达这个假设结构；它是诊断思路，不是已识别的工艺因果图。

~~~mermaid
flowchart TD
    D["原料与负荷变化"] --> A["操作员设定值建议"]
    D --> Q["后续质量与能耗"]
    H["既有历史与隐含判断"] --> A
    H --> Q
    A --> X["内层控制后的过程状态"]
    X --> Q
~~~

应先检查时间先后、测量来源、操作员当时可见的信息和联合动作覆盖，再决定能做哪类比较。匹配工况、分层分析或因果模型可以减少部分偏差，却不能证明已经控制全部隐藏因素。世界模型拟合误差很低，也可能只是复现历史操作规律，并未识别改变策略后的后果。

## 6. 质量和产量不能在分母里悄悄消失

另取一个虚构核算例：基线消耗 300 GJ，生产 100 t 且全部合格，单位热耗为 3.0 GJ/t；候选方案消耗 290 GJ，仍生产 100 t，但只有 90 t 合格。按全部产量计算为 2.9 GJ/t，表面下降约 $3.33\%$；按合格产量则为 $290/90\approx3.222$ GJ/t，高于基线。两种分母回答不同问题，不能只选择对方案有利的那个。

本项目质量边界仍独立成立；使用合格产量分母不代表可以付出额外能耗来“抵消”不合格质量，更不让不合格候选变成可执行方案。返工、库存滞后与后续处理若属于核算边界，也应明确归属，不要在改变时间窗时把它们移走。质量检验后来才完成，允许用于事后绩效审计，但不能回流成为当时策略已知的信息。

煤耗、电耗、产量和质量也不是互不相关的旋钮。冷却和余热回收、燃烧条件与风机负荷会改变全系统的折中；某个局部设备指标变好，未必使同一产品边界内的总指标改善。[EPA 能效指南](https://www.energystar.gov/sites/default/files/buildings/tools/ENERGY%20STAR%20Guide%20for%20the%20Cement%20Industry%2028_08_2013%20Final.pdf)的分工序核算可用于组织这个检查。具体方向和幅度必须由本装置数据或经验证模型回答，不能从概念示意图读出节能百分比。

## 7. 平稳性与收益应分别报告

归一化执行增量可用总变差描述：

$$TV(a^{exec})=\sum_t\|a_t^{exec}-a_{t-1}^{exec}\|_1.$$

同样可记录 CV 方差、跟踪误差、最长连续超限、门控拒绝率和恢复时间。它们互不等价：恒定但错误的温度可以方差很小；从旧工况平滑转向新工况会有趋势，不能把所有变化都视为噪声。门控拒绝后保持设定值，也不会使物理过程、扰动或化验时钟停止。

最后把指标分成主结果和诊断，而不是把主结果合成一个无法解释的总分。主结果保留煤耗、电耗、合格产量、质量和氧量成本；诊断解释数据支持、动作平滑和回退原因。采用时间外评估、按工况分层和独立重复运行，才能区别算法变化与某次有利原料。关于小样本算法比较的不确定性，可继续阅读 [Agarwal 等](https://arxiv.org/abs/2108.13264)。`,
      en:String.raw`## 1. Define indicators before designing a reward

Energy saving becomes comparable only after specifying the production boundary, product denominator, time window and fuel basis. Clinker production and cement grinding are different accounting boundaries. Electricity per tonne of clinker and total electricity per tonne of cement cannot be placed in one algorithm ranking without reconciliation. The [EPA cement energy guide](https://www.energystar.gov/sites/default/files/buildings/tools/ENERGY%20STAR%20Guide%20for%20the%20Cement%20Industry%2028_08_2013%20Final.pdf) organizes energy use by process, while the [EU BREF](https://publications.jrc.ec.europa.eu/repository/handle/JRC83006) also addresses materials and emissions. We adopt that accounting discipline, not their historical sector averages as measurements of this project.

| Indicator | An explicit definition | Frequently omitted context |
| --- | --- | --- |
| Specific fuel mass | kg fuel / t clinker | Heating value, moisture, fuel mix and conversion basis |
| Specific heat input | GJ fuel heat / t clinker | Lower versus higher heating value, boundary and start/stop periods |
| Specific electricity | kWh / t clinker | Included fans, cooling, transport and auxiliary equipment |
| Quality | f-CaO, other assays and conformity rate | Sample time, release delay, sampling frequency and untested product |
| Throughput | t/h or conforming product per window | Cost of reducing load to reduce instantaneous consumption |
| Emissions | Mass flow, concentration or mass per product | Dry/wet basis, reference conditions, oxygen basis and averaging time |
| Stability | CV variation, tracking error or action variation | Trends versus fluctuations, and stable but incorrect conditions |

## 2. Two averages of specific energy are different

Let interval $i$ consume $E_i$ and produce $M_i$. Aggregate specific electricity is defined when total production $\sum_iM_i>0$; its expansion as a production-weighted average additionally requires each interval to have $M_i>0$:

$$e_{total}=\frac{\sum_i E_i}{\sum_i M_i}=\sum_i\frac{M_i}{\sum_jM_j}\frac{E_i}{M_i}.$$

With positive production in every interval, it is a production-weighted average of interval ratios, not their unweighted mean. If a startup or shutdown interval has $M_i=0,E_i>0$, its ratio is undefined but its energy must remain in the total numerator. For $E=[100,900]$ kWh and $M=[0,100]$ t, the aggregate is 10 kWh/t; discarding the zero-production period incorrectly gives 9. If total production is zero, report energy and operating status separately rather than a per-tonne ratio.

In another invented example, two periods consume 10,000 and 16,000 kWh while producing 100 and 200 t. Their ratios are 100 and 80 kWh/t. The simple mean is 90, whereas the aggregate is $26000/300\approx86.67$ kWh/t. Mixing these conventions can create apparent improvement when load changes.

Similarly, suppose A consumes 10,000 kWh for 100 t and B consumes 14,400 kWh for 150 t. B has 4% lower specific electricity but 44% higher total electricity. Both statements are correct; they answer different questions. Report production, total consumption and specific consumption together, and state whether the policies meet the same production requirement. Selecting one favorable percentage conceals the trade-off.

## 3. Lower fuel mass need not mean lower heat input

Heat input requires multiplying each fuel mass by its heating value:

$$Q_{fuel}=\sum_jm_jH_j,\qquad q_{spec}=\frac{Q_{fuel}}{M_{clinker}}.$$

In a teaching example, A uses 100 kg/t of fuel at 25 MJ/kg, giving 2.5 GJ/t. B uses 90 kg/t at 30 MJ/kg, giving 2.7 GJ/t. Mass falls by 10% while heat input increases by 8%. This is a units example, not a plant observation. Changes in fuel properties and alternative-fuel share must be reconciled before attributing a difference to setpoint decisions.

Carbon accounting also separates combustion from raw-material decomposition and other sources. Lower electricity does not imply the same percentage reduction in total greenhouse-gas emissions. Emission concentration and emitted mass are different quantities: dilution can change concentration without removing the corresponding pollutant mass. Preserve flows, measurement conditions and accounting versions. A normalized reward cannot replace a physical inventory. [BREF](https://publications.jrc.ec.europa.eu/repository/handle/JRC83006)

## 4. Quality has timestamps and a scope

Free lime provides quality-related information, but one number does not determine every product property. The repository uses conventions including f-CaO in $[0.5,1.5]\%$ and $O_2\ge1.2\%$. These are project and teaching interfaces, not universal specifications for other kiln lines. [Project source](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

Keep sample time $\tau$, result-availability time $v$ and decision time $t$. Only a result with $v\le t$ may enter the policy observation. Its sample age is $t-\tau$. A sample collected at 10:00 and released at 10:40 cannot be read by the 10:20 policy. It can later support appropriately aligned evaluation, but newly released does not mean caused by the most recent action. Material residence time may be distributed rather than a single exact delay; shifting every assay by one fixed lag also requires validation.

## 5. Association is not automatically an action effect

An operator may raise a temperature setpoint because feed has become harder to burn or because deterioration is already suspected. A historical association between high setpoints and high free lime can reflect corrective action under difficult conditions. It does not establish that raising the setpoint caused poorer quality. The following is a hypothesized diagnostic structure, not an identified causal model of the plant.

~~~mermaid
flowchart TD
    D["Feed and load changes"] --> A["Operator setpoint proposal"]
    D --> Q["Later quality and energy"]
    H["History and hidden judgment"] --> A
    H --> Q
    A --> X["Process after inner control"]
    X --> Q
~~~

Check temporal order, measurement provenance, information available to the operator and joint action coverage before deciding which comparisons are identifiable. Matching, stratification and causal models can address some biases without proving that all hidden confounding has disappeared. A world model can fit historical data closely while mainly reproducing the old operating policy, rather than identifying the consequences of changing it.

## 6. Quality and production must not disappear into the denominator

Consider another invented accounting example. The baseline consumes 300 GJ and makes 100 t, all conforming, for 3.0 GJ/t. A candidate consumes 290 GJ and still makes 100 t, but only 90 t conforms. Per total output it uses 2.9 GJ/t, apparently about $3.33\%$ lower. Per conforming output it uses $290/90\approx3.222$ GJ/t, worse than the baseline. These denominators answer different questions; selecting whichever favors a candidate is invalid.

The project's independent quality boundaries remain in force. A conforming-output denominator does not permit compensating for unacceptable quality with energy, and it does not turn an infeasible proposal into an executable one. Define how rework, inventory delay and downstream processing enter the accounting boundary instead of moving them outside a favorable time window. Later quality inspection may support retrospective performance auditing, but it cannot become information that the historical policy already possessed.

Fuel, electricity, output and quality are not independent knobs. Cooling and heat recovery, combustion conditions and fan loads affect system-level trade-offs. A local equipment metric can improve without improving totals for the same product boundary. The process-oriented accounting in the [EPA energy guide](https://www.energystar.gov/sites/default/files/buildings/tools/ENERGY%20STAR%20Guide%20for%20the%20Cement%20Industry%2028_08_2013%20Final.pdf) helps organize the comparison. Actual directions and magnitudes need plant-specific data or validated models, not a percentage inferred from a conceptual illustration.

## 7. Report stability separately from benefit

For normalized executed increments, one useful diagnostic is total variation:

$$TV(a^{exec})=\sum_t\|a_t^{exec}-a_{t-1}^{exec}\|_1.$$

Other diagnostics include CV variance, tracking error, the longest violation episode, gate rejection rate and recovery time. They are not interchangeable. A constant but wrong temperature has low variance. A smooth transition to a new operating condition contains a trend that should not automatically be treated as noise. Holding a setpoint after rejection does not freeze physical dynamics, disturbances or the assay clock.

Separate primary outcomes from explanatory diagnostics. Preserve fuel, electricity, conforming production, quality costs and oxygen costs as outcomes; use support, smoothness and fallback causes to explain them. Time-held-out evaluation, operating-condition strata and independent repeated runs help distinguish an algorithm effect from unusually favorable feed. [Agarwal et al.](https://arxiv.org/abs/2108.13264) provide a useful treatment of uncertainty in limited-run RL comparisons.`,
    },
  },
  {
    id:'objectives', order:3, group:'formulation', minutes:29,
    title:{'zh-CN':'从指标到目标、Pareto 与约束','en':'From indicators to objectives, Pareto order and constraints'},
    summary:{'zh-CN':'用完整算例解释尺度、偏好、可行性、机会约束与软约束为什么不能混为一谈。','en':'Worked examples separate scaling, preferences, feasibility, chance constraints and soft constraints.'},
    sources:['r2-moead','r2-nsga2','r2-chance','r2-cpo','r2-mpcbook','r2-project'],
    body:{
      'zh-CN':String.raw`## 1. 目标函数是研究问题的一部分

对于当前工况 $h$ 和候选设定值路径 $u$，可以先写多目标问题：

$$\min_{u\in\mathcal U(h)}\mathbf f(u;h)=\left(f_F(u;h),f_E(u;h),f_S(u;h)\right),\qquad g_j(u;h)\le0.$$

三个目标可以分别表示煤耗、电耗和平滑性；质量、氧量、设定值范围和授权条件进入可行集合。这里 $u$ 可以是一点、若干步路径或策略参数，不能仅凭这个式子判断是否存在动态优化。选取哪个对象、目标如何累积以及模型怎样预测后果，才定义了问题。[MOEA/D 原文](https://doi.org/10.1109/TEVC.2007.892759)

把质量超限乘一个大数加到能耗里，会改变问题：它可能允许足够大的节能收益交换违反。某些数学罚函数在特定条件和足够参数下具有精确性，但有限训练中的任意惩罚系数没有这种自动保证。项目约定要求独立质量与环境成本；教程不擅自修改边界。[项目契约](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 2. 单位缩放不能隐藏偏好

直接把 kg/t 和 kWh/t 相加没有清楚的解释。可以换成货币、工程容许尺度，或冻结在训练集上的标准化量：

$$z_F=\frac{F-\mu_F}{s_F},\qquad z_E=\frac{E-\mu_E}{s_E},\qquad L_w=w_Fz_F+w_Ez_E.$$

除数必须大于零，且记录版本。若以标准差归一化，高波动指标的一单位物理改善会被压得更小；这是一种数值选择，不自动对应经济偏好。换测试工况后重新拟合尺度，会使同样物理结果得到不同分数，也可能造成信息泄漏。报告原始单位指标和归一化目标两套数。

给出一组完全虚构的可行方案：A 的 $(F,E)=(95,108)$，B 为 $(100,100)$，C 为 $(104,92)$。取参考均值 $(100,100)$、尺度 $(5,10)$，得到 A=$(-1,0.8)$，B=$(0,0)$，C=$(0.8,-0.8)$。权重 $(0.7,0.3)$ 下损失为 $-0.46,0,0.32$，选 A；换为 $(0.2,0.8)$，损失为 $0.44,0,-0.48$，选 C。模型和候选都没变，改变的是偏好。

把归一化表达式展开，可见 $L_w=(w_F/s_F)F+(w_E/s_E)E-\mathrm{const}$，真正作用在原始指标上的系数是 $w_F/s_F$ 与 $w_E/s_E$。若目标本来是成本 $C=p_FF+p_EE$，想让归一化写法保留同一偏好，可令 $w_F:w_E=p_Fs_F:p_Es_E$。不能先任意标准化，再声称相同权重就代表相同经济重要性。

例如仅为教学假设燃料价格 $p_F=0.8$ 元/kg、电价 $p_E=0.6$ 元/kWh，并假定三个方案产品边界与质量相同，则 A、B、C 分别为 140.8、140.0、138.4 元/t。这个口径选择 C。它没有包含全部生产成本，也不代表当前市场价格；其作用是展示单位怎样相乘、偏好怎样解释。若加入价格变化、产量或返工，必须重新明确定义经济目标，而不是继续沿用这些数字。

## 3. Pareto 前沿描述取舍，不代替最终选择

最小化时，$u$ 支配 $v$，表示所有目标都不更差，而且至少一项更好：

$$u\prec v\iff [\forall i:f_i(u)\le f_i(v)]\land[\exists j:f_j(u)<f_j(v)].$$

上例 A、B、C 互不支配；D=$(107,110)$ 被 B 支配。若另有 U=$(90,85)$ 但 f-CaO 超项目边界，它首先是不可行候选，不能因为两个能耗指标很好就加入允许执行的前沿。非支配指相对于已比较集合，不等于已证明到达全局真实前沿。[NSGA-II](https://doi.org/10.1109/4235.996017)

加权和也未必找得到所有非凸前沿点。教学点 $(0,2),(1.1,1.1),(2,0)$ 都非支配；任意两目标非负权重归一化后，总有一个端点的加权值不超过 1，而中点恒为 1.1。因此仅扫描线性权重会错过这个中点。分解方式、约束法与解集覆盖要结合问题选择，不是权重扫描次数越多就自动解决。[MOEA/D](https://doi.org/10.1109/TEVC.2007.892759)

## 4. 两种 epsilon 不应混淆

多目标的 epsilon-constraint 表述可以是：

$$\min_u F(u)\quad\text{subject to}\quad E(u)\le\varepsilon_E,\quad g(u)\le0.$$

对 A、B、C，若电耗预算设为 100，A 被排除，B 的煤耗低于 C，于是选 B。改变预算便能沿不同取舍搜索。预算有明确单位，应来自生产要求或预先声明的研究扫描。

进化约束处理中的 epsilon-level，通常是搜索时比较违反程度的容忍水平。它可能暂时让近可行解参与搜索，以免种群过早丢失通向可行区的路径；这不是批准工厂执行同样超限动作。数学搜索中的松弛、产品指标预算和设备硬边界是三个不同概念。

~~~mermaid
flowchart TD
    A["候选点或轨迹"] --> F["量纲与时间核算"]
    F --> C["可行性检查"]
    C -->|"不可行"| R["拒绝或继续搜索"]
    C -->|"可行"| P["Pareto 比较"]
    P --> W["偏好或预算选择"]
    W --> G["独立执行审核"]
    R --> A
~~~

## 5. 硬、软、机会和期望约束各控制什么

硬约束要求在所建模型的允许集合内满足 $g\le0$；实际保证仍依赖模型误差和执行条件。软约束引入松弛量 $\xi\ge0$，例如 $g\le\xi$ 并惩罚 $\xi$，使不可行问题有可诊断的折中；不能把它无条件用于不可放宽的物理保护。

机会约束控制指定概率：$P(q\le1.5\mid h,u)\ge0.95$。假设仅用于算例的预测质量为高斯分布，$\sigma_q>0$ 且分布校准可靠，把质量标准化后有 $P(q\le1.5)=\Phi((1.5-\mu_q)/\sigma_q)$。由于标准正态分布函数 $\Phi$ 单调，要求该概率至少 0.95，等价于 $\mu_q+\Phi^{-1}(0.95)\sigma_q\le1.5$。使用近似分位数 $\Phi^{-1}(0.95)\approx1.645$，得到：

$$\mu_q+1.645\sigma_q\le1.5.$$

若 $\mu_q=1.2,\sigma_q=0.2$，左侧约为 1.529，均值虽在范围内，仍未满足该上界概率要求。若均值降为 1.1，左侧约为 1.429。这只是单侧上界；下界、多个变量和整段轨迹还要另分配风险，不能把每步 95% 当成无限运行的整体 95%。[机会约束的原始理论入口](https://doi.org/10.1287/mnsc.6.1.73)

CMDP 中常见 $\mathbb E_\pi[\sum_t\gamma^t c_t]\le d$，控制的是期望累计成本。若 99 次成本为 0、一次为 10，平均为 0.1；平均预算 0.2 可以满足，那次严重事件却仍然存在。成本的幅度、概率、时长和单位都要明确。[CPO](https://arxiv.org/abs/1705.10528)

具体到质量，超限幅度成本可以是 $c_q=(q_{\min}-q)_++(q-q_{\max})_+$；若 q 按百分数的数值表示，单位就是百分点。事件成本 $c_I=\mathbf1_{q\notin[q_{\min},q_{\max}]}$ 是无量纲；持续时间成本可把对应区间长度乘以事件指示。它们衡量的是不同后果，不应共享一个未经换算的预算。

假设三个连续 5 分钟区间的质量分别恒为 $1.4\%,1.6\%,1.9\%$，上界为项目的 $1.5\%$，下界均满足。幅度成本为 $[0,0.1,0.4]$ 个百分点，事件成本为 $[0,1,1]$，超限累计持续 10 分钟。相同平均事件率可能对应完全不同的最大超限程度；所以至少并报频率、幅度与持续时间。这个区间恒值是假设，稀疏化验本身不能直接证明真实连续超限时长。

## 6. 可审阅的目标设计应交付什么

应交付指标字典、原始单位、归一化版本、时间聚合规则、权重或预算的选择理由、每种约束的语义、不可行时的批准回退，以及候选和执行动作的独立日志。比较算法时冻结这些条件；只有研究目标本身就是偏好敏感性时，才系统改变权重并展示全套结果。

目标写得越清楚，越容易发现奖励被“钻空子”的位置：少生产来降低瞬时耗能、用稀释改善浓度、长期保持却偏离质量要求、利用尚未返回的化验作决策。修复这些问题属于任务定义和数据治理，不能靠换一个更强的优化器补救。`,
      en:String.raw`## 1. The objective is part of the research question

For current information $h$ and a candidate setpoint path $u$, begin with

$$\min_{u\in\mathcal U(h)}\mathbf f(u;h)=\left(f_F(u;h),f_E(u;h),f_S(u;h)\right),\qquad g_j(u;h)\le0.$$

The objectives may represent fuel, electricity and smoothness, while quality, oxygen, setpoint bounds and authorization define feasibility. The variable $u$ may be a point, a trajectory or policy parameters. The expression alone does not tell us whether optimization is dynamic. That depends on the decision representation, temporal aggregation and consequence model. [MOEA/D](https://doi.org/10.1109/TEVC.2007.892759)

Adding a large quality penalty to energy changes the problem: sufficient energy benefit may compensate for a violation. Some mathematical penalty constructions are exact under specified conditions and sufficiently large coefficients. An arbitrary coefficient in finite-data training does not inherit that result. The project therefore keeps quality and environmental costs explicit and does not alter physical boundaries for a tutorial experiment. [Contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 2. Scaling must not conceal preferences

Adding kg/t directly to kWh/t lacks an obvious interpretation. Convert to money, engineering tolerances or frozen training-set scales:

$$z_F=\frac{F-\mu_F}{s_F},\qquad z_E=\frac{E-\mu_E}{s_E},\qquad L_w=w_Fz_F+w_Ez_E.$$

Denominators must be positive and versioned. Standard-deviation scaling gives a smaller normalized improvement to one physical unit of a highly variable indicator; that numerical convention is not automatically an economic preference. Refitting scales on the test regime changes the score assigned to the same physical result and can leak information. Report both raw indicators and normalized objectives.

Consider invented feasible alternatives A=$(95,108)$, B=$(100,100)$ and C=$(104,92)$ in fuel/electricity coordinates. Reference values $(100,100)$ and scales $(5,10)$ give A=$(-1,0.8)$, B=$(0,0)$ and C=$(0.8,-0.8)$. Weights $(0.7,0.3)$ yield losses $-0.46,0,0.32$, selecting A. Weights $(0.2,0.8)$ yield $0.44,0,-0.48$, selecting C. Neither the predictions nor the candidates changed; the preference did.

Expanding gives $L_w=(w_F/s_F)F+(w_E/s_E)E-\mathrm{const}$. The effective coefficients on physical indicators are $w_F/s_F$ and $w_E/s_E$. If the intended objective is cost $C=p_FF+p_EE$, preserve the same preference by choosing $w_F:w_E=p_Fs_F:p_Es_E$. Arbitrary standardization followed by equal weights does not establish equal economic importance.

For a purely invented teaching price of $p_F=0.8$ currency units/kg and $p_E=0.6$ units/kWh, assuming identical product boundaries and acceptable quality, A, B and C cost 140.8, 140.0 and 138.4 currency units/t. This objective selects C. It excludes other production costs and is not a current market-price claim; it demonstrates dimensional multiplication and interpretable preferences. Price changes, throughput or rework require a revised economic definition rather than continued use of these illustrative numbers.

## 3. Pareto order exposes trade-offs without choosing for you

For minimization, $u$ dominates $v$ when it is no worse in every objective and better in at least one:

$$u\prec v\iff[\forall i:f_i(u)\le f_i(v)]\land[\exists j:f_j(u)<f_j(v)].$$

A, B and C above are mutually nondominated. D=$(107,110)$ is dominated by B. An alternative U=$(90,85)$ that violates the project's f-CaO boundary is infeasible first; excellent energy coordinates do not put it on an executable frontier. Nondominance is also relative to the set examined, not proof that a search has reached the global front. [NSGA-II](https://doi.org/10.1109/4235.996017)

A weighted sum may miss points on a nonconvex front. The teaching points $(0,2),(1.1,1.1),(2,0)$ are all nondominated. For any normalized nonnegative pair of weights, at least one endpoint has weighted cost at most 1, whereas the middle point costs 1.1. No scan of linear weights selects it. Decomposition, constraint formulations and coverage must therefore match the problem; increasing the number of weights alone does not fix the issue. [MOEA/D](https://doi.org/10.1109/TEVC.2007.892759)

## 4. Two meanings of epsilon

An epsilon-constraint formulation of multiobjective optimization can be

$$\min_u F(u)\quad\text{subject to}\quad E(u)\le\varepsilon_E,\quad g(u)\le0.$$

An electricity budget of 100 excludes A. B then has lower fuel use than C, so B is selected. Varying a predeclared budget explores different trade-offs. This budget has units and should be justified by operational requirements or an explicit sensitivity study.

An epsilon-level in evolutionary constraint handling instead concerns how violation is compared during search. It can temporarily retain nearly feasible candidates to preserve routes into the feasible region. That does not authorize an equally violating action on equipment. Search tolerance, product-budget preference and hard operational boundaries are different concepts.

~~~mermaid
flowchart TD
    A["Candidate point or trajectory"] --> F["Units and time accounting"]
    F --> C["Feasibility check"]
    C -->|"Infeasible"| R["Reject or continue search"]
    C -->|"Feasible"| P["Pareto comparison"]
    P --> W["Preference or budget selection"]
    W --> G["Independent execution review"]
    R --> A
~~~

## 5. Hard, soft, chance and expected constraints differ

A hard constraint requires $g\le0$ within the modeled admissible set; physical assurance still depends on model error and execution conditions. A soft constraint introduces slack, for example $g\le\xi$, $\xi\ge0$, and penalizes it. This can make infeasibility diagnosable, but it is not a blanket license to relax non-negotiable protection.

A chance constraint controls a stated probability, such as $P(q\le1.5\mid h,u)\ge0.95$. For an assumed, calibrated Gaussian distribution with $\sigma_q>0$, standardization gives $P(q\le1.5)=\Phi((1.5-\mu_q)/\sigma_q)$. Monotonicity of the standard-normal distribution function makes the requirement equivalent to $\mu_q+\Phi^{-1}(0.95)\sigma_q\le1.5$. Approximating the quantile by $\Phi^{-1}(0.95)\approx1.645$ yields

$$\mu_q+1.645\sigma_q\le1.5.$$

With $\mu_q=1.2$ and $\sigma_q=0.2$, the left side is about 1.529. The mean lies inside the range, but the chance requirement fails. With mean 1.1 it becomes about 1.429. This examines only the upper tail. Lower limits, multiple variables and trajectories require additional risk allocation. Per-step 95% coverage is not an infinite-run 95% guarantee. [Original chance-constraint reference](https://doi.org/10.1287/mnsc.6.1.73)

A CMDP constraint such as $\mathbb E_\pi[\sum_t\gamma^tc_t]\le d$ instead controls expected cumulative cost. If 99 outcomes cost zero and one costs 10, their mean is 0.1. A mean budget of 0.2 can be satisfied despite the severe individual event. Define whether the cost measures magnitude, probability or duration, and give its units. [CPO](https://arxiv.org/abs/1705.10528)

For quality, a violation-magnitude cost can be $c_q=(q_{\min}-q)_++(q-q_{\max})_+$. When q is represented by its numerical percentage value, this cost has units of percentage points. An event cost $c_I=\mathbf1_{q\notin[q_{\min},q_{\max}]}$ is dimensionless; a duration cost multiplies the indicator by interval length. They measure different consequences and cannot share an unconverted budget.

Suppose three five-minute intervals have constant qualities $1.4\%,1.6\%,1.9\%$, with the project's upper boundary $1.5\%$ and the lower boundary satisfied. Magnitude costs are $[0,0.1,0.4]$ percentage points, event costs are $[0,1,1]$, and total violation duration is ten minutes. Identical event rates can conceal different peak magnitudes, so report frequency, magnitude and duration together. Constant quality over each interval is an explicit example assumption; sparse assays alone do not establish continuous violation duration.

## 6. Deliver an objective that can be reviewed

Provide a metric dictionary, raw units, normalization version, temporal aggregation, preference rationale, constraint semantics, approved infeasibility fallback, and separate requested/executed action logs. Freeze these across algorithm comparisons. If preference sensitivity is the subject, vary weights systematically and publish the whole comparison.

An explicit formulation reveals ways a reward can be exploited: producing less to lower instantaneous consumption, diluting an emission concentration, remaining motionless at the wrong quality condition, or consulting an assay that had not yet arrived. These are specification and data-governance failures. A more powerful solver cannot repair an incorrectly defined task.`,
    },
  },
];
