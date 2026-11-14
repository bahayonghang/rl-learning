import type { ResearchPage } from './types';

export const outlookPages: ResearchPage[] = [
  {
    id: 'evidence', order: 7, group: 'outlook', minutes: 29,
    title: { 'zh-CN': '证据地图：论文、仿真、现场与尚未回答的问题', en: 'Evidence map: theory, simulation, field operation and open claims' },
    summary: {
      'zh-CN': '按实际可读的一手材料建立证据矩阵，区分生产数据、模型闭环、现场试验和运营报告，核验相关论文归属与适用范围。',
      en: 'An evidence matrix based on accessible primary material, separating plant data, model loops, field trials and operational accounts while checking attribution and scope.',
    },
    sources: ['r2-skogestad', 'r2-nsga2', 'r2-moead', 'r2-sac-apps', 'r2-process-rl', 'r2-safety-filter', 'r2-rliable', 'r2-tcnso', 'r2-oadstr', 'r2-monitoring', 'r2-todcgan', 'r2-conerl', 'r2-yokogawa', 'r2-deepmind', 'r2-project'],
    body: {
      'zh-CN': String.raw`## 1. “用了工业数据”不能回答“谁在现场决定动作”

本综述核验日期为 **2026-11-14**。证据按实际可访问的一手材料记录：作者原文或开放手稿、出版社摘要、出版社登记的 DOI 书目、官方运营说明。全文无法取得时，明确保留未知，不用检索摘要拼出未见过的实验细节。对相关论文的介绍只陈述已核验范围；本文的网络接口、教学算例与研究假设另外标明为原创设计。

以下层级不是论文价值排名，而是回答不同问题的证据类型。理论证明回答“在这些假设下是否成立”；数值基准回答“在规定的仿真问题上表现怎样”；生产数据预测回答“在日志分布上能否预测”；基于生产数据训练的模拟闭环回答“在该代理模型内选择动作会怎样”；现场建议模式回答“人如何采用建议”；实际执行试验回答“设备是否按照该策略改变了动作”。**有生产数据，仍可能完全没有进行现场控制。** [流程工业 RL 综述](https://doi.org/10.1109/JAS.2024.124227)是文献地图，不能替代每篇工作的实验核查。

![证据地图：从具体主张到允许的结论](./images/diagrams/research-evidence-diagram-1.webp)

## 2. 方法论文的证据不能直接兑换为烧成收益

| 原始来源 | 本次核验材料 | 可以支持什么 | 不能由此推出什么 |
| --- | --- | --- | --- |
| [Skogestad 2000](https://doi.org/10.1016/S0959-1524(00)00023-8) | 作者手稿 | 控制变量选择、层次与自优化控制的条件性论证 | 固定 CV 对所有工况都最优 |
| [NSGA-II](https://doi.org/10.1109/4235.996017) / [MOEA/D](https://doi.org/10.1109/TEVC.2007.892759) | 原文 | 多目标排序、拥挤度、分解与测试问题表现 | 已优化本项目真实煤电耗 |
| [SAC Algorithms and Applications](https://arxiv.org/abs/1812.05905) | 开放原文 | 最大熵更新及论文中的数值与机器人实验 | 六 CV 烧成系统已实现自主控制 |
| [预测安全过滤器](https://doi.org/10.1016/j.automatica.2021.109597) | 开放作者稿 | 在模型、终端集合与可行性条件下的过滤方法 | 任意阈值 Gate 都继承同样保证 |
| [统计评估研究](https://arxiv.org/abs/2108.13264) | 作者论文 | 少量随机种子与不稳定汇总的评估问题 | 五个种子必然足够，或同一轨迹的时间步互相独立 |

理论来源最有价值的部分经常是限定条件。把一个条件性结果删掉前提后迁移到工业系统，会比直接承认未知更危险。算法在标准控制基准上获得高回报，也不能说明工业任务的传感器故障、长化验时滞、停窑风险、操作权限和目标分母已经被正确表达。

## 3. 与本研究主线相关的论文：核验归属，也核验工艺对象

| 论文 | 已核验的作者/对象与材料 | 本综述允许的结论 | 保留的未知 |
| --- | --- | --- | --- |
| [TCNSO-MSL-TD3 相关论文，2026](https://doi.org/10.1088/2631-8695/ae5ed3) | DOI 登记题名、作者和出版社摘要；作者包含 Yonghang Li；对象为烧成 | 摘要描述时序观测、多步学习与约束相关设计 | 未取得全文，不能确定完整实验设置或现场执行层级 |
| [OA-DSTR 相关论文，2024](https://doi.org/10.1016/j.asoc.2024.111772) | 书目与出版社摘要；Yonghang Li 等；对象为水泥粉磨 | 可作为动态搜索与滚动决策的相关工作 | 不能把粉磨的对象、指标响应或结果直接当作烧成验证 |
| [软测量与时序预测联合训练，2026](https://doi.org/10.1109/TII.2026.3664090) | 出版社登记题名、作者、期刊与页码；Yonghang Li 等 | 可确认研究主题与书目归属 | 本次未取得全文，不重建内部网络与损失细节 |
| [TOD-CGAN，2026](https://doi.org/10.1016/j.jfranklin.2026.108704) | 书目与出版社摘要；作者包含 Yonghang Li | 条件生成用于烧成运行决策的相关思路 | 条件生成不自动等于 RL，也不自动说明现场自主执行 |
| [CoNERL，2026](https://doi.org/10.1016/j.aei.2026.104530) | 书目、作者列表与出版社记录中的仿真表述 | 外部进化与 RL 结合的相关工作 | 作者列表不含 Yonghang Li；不能列为用户成果，也不能将仿真改称现场节能 |

这些书目为后续精读提供入口，不是为了给任何方法背书。以 TCNSO-MSL-TD3 为例，出版社摘要足以确认其研究主题，却不足以回答划分是否严格按时间、是否有独立装置、对照策略如何调参、Gate 是否一致等问题。获得全文与补充材料后，应逐项填写，而不是把“comprehensive experiments”解释成已完成现场随机对照。

用户已有 OAM-Net、QC-MTWaveSME、MC3/OOD、PG-MOEA/D-IEpsilon 和 NURBS 轨迹等研究模块，可作为本项目已知接口背景；其准确实现与本文提出的 RL 连接方案应分别说明。论文题名相近、缩写相似或作者中包含熟悉姓名，都不能代替原始书目与全文证据。

## 4. 两个真实运营来源，分别能说明什么

**Yokogawa 与 JSR 的 2022 年官方联合报告**明确记录了一个蒸馏装置的 FKDPP 控制现场试验：从 2022-01-17 到 02-21，持续 35 天。报告描述了模拟器训练、DCS 集成及既有联锁等环节。因此它可以支持“该运营方报告了特定装置上的实际自主控制试验”，比仅使用工厂数据的仿真证据更接近执行层。[官方原页](https://www.yokogawa.com/news/press-releases/2022/2022-03-22/)

但是，这是一份运营方与供应商的一手报告，而不是本文独立复现的随机对照研究。蒸馏装置也不是水泥窑。这里不移植其经济数字，不推断本项目可以直接复制同一算法，不把 35 天试验等同于覆盖所有原料、故障和季节工况的长期保证。要评估其外推性，仍需控制变量、过程时标、约束与失效处置的具体比较。

**DeepMind 的 2018 年官方运营说明**描述了数据中心冷却的自主 AI 系统：预测候选后进行约束筛选，再由本地系统复核，并保留不确定性处理和人工退出路径。它支持“预测、候选筛选、本地检查与人类权限可以构成分层执行架构”这一事实。[官方原页](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/)

该运营说明本身不够确定具体使用了 PPO 或 SAC，也不能据其架构图反推本项目的网络结构。本文不引用其中的节能比例来估计烧成收益。两份材料的共同启发是：现场系统必须说明训练、推理、权限与回退如何连接；这并不构成某个 RL 算法普适优越的证据。

## 5. 一个可以复核的效果声明需要哪些分母

假设论文报告“单位煤耗下降”。至少还要追问：按总燃料质量还是热值折算；产量是否变化；质量不合格品是否计入；原料、燃料热值和设备状态是否匹配；对照是否经历相同扰动；模型是否用测试期数据调过参数；人工接管期间是否被删除。若算法 A 只保留容易工况而 B 承担全部工况，平均数差异可能主要来自样本选择。

同样，一条曲线的点数不能当成样本量。每个时间点共享同一训练策略和强时间相关性；训练随机种子、连续工况窗口、装置和季节是不同的变异来源。应按设计进行配对、区间估计或分层汇总，并公开失败运行。[Agarwal 等](https://arxiv.org/abs/2108.13264)解释了 RL 评估为何容易受有限样本和汇总方式影响；将其思想迁移到工业时，还要额外处理过程自相关。

## 6. 当前网页的证据位置

本网站已经提供的是：原创推导、显式计算的教学例子、浏览器中的教学动力学、可查看的项目契约和研究接口。它没有提供实际工业日志、PG-MOEA/D-IEpsilon 可运行基线、训练后的工业 SAC 模型、现场对照试验或可验证的收益数字。[仓库约定](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

因此本综述将主张限定为“为什么值得研究、如何定义问题、如何避免错误比较、什么证据会支持或推翻假设”。后续一旦获得真实数据与实现，应在同一证据矩阵中更新材料类型、实验协议、失败例与复现实验，而不是仅把介绍图换成更复杂的架构。`,
      en: String.raw`## 1. Industrial data do not establish who chose actions in the plant

This review was verified on **2026-11-14**. Evidence is recorded according to the primary material actually accessible: original articles or author manuscripts, publisher abstracts, publisher-deposited DOI metadata and official operational accounts. When full text was unavailable, unknowns remain explicit; search snippets are not assembled into an imagined experiment. Paper descriptions are restricted to verified scope, while the tutorial's interfaces, numerical examples and hypotheses are identified as original designs.

The following categories are not a ranking of scientific merit. They answer different questions. A theorem asks whether a result holds under assumptions. A benchmark asks how an algorithm performs in a specified simulation. Plant-data prediction asks whether logged outcomes can be predicted. Closed-loop simulation using a plant-trained surrogate asks what actions do inside that model. Advisory operation asks how people use recommendations. An execution trial asks whether equipment actually followed policy-generated decisions. **Using production data can involve no plant control at all.** The [process-industry RL review](https://doi.org/10.1109/JAS.2024.124227) is a literature map, not a replacement for checking individual experiments.

![Evidence mapping: from a claim to supported conclusions](./images/diagrams/research-evidence-diagram-1.webp)

## 2. Method papers do not directly establish kiln savings

| Original source | Material inspected | What it supports | What it does not establish |
| --- | --- | --- | --- |
| [Skogestad 2000](https://doi.org/10.1016/S0959-1524(00)00023-8) | Author manuscript | Conditional arguments about CV selection, hierarchy and self-optimizing control | Fixed CVs are optimal in every regime |
| [NSGA-II](https://doi.org/10.1109/4235.996017) / [MOEA/D](https://doi.org/10.1109/TEVC.2007.892759) | Original papers | Ranking, crowding, decomposition and benchmark behavior | Measured fuel/electricity improvement in this project |
| [SAC Algorithms and Applications](https://arxiv.org/abs/1812.05905) | Open original paper | Maximum-entropy updates and the paper's numerical/robotics experiments | Autonomous operation of this six-CV kiln |
| [Predictive safety filter](https://doi.org/10.1016/j.automatica.2021.109597) | Open author manuscript | Filtering under model, terminal-set and feasibility assumptions | Every threshold Gate inherits the same guarantee |
| [RL statistical evaluation](https://arxiv.org/abs/2108.13264) | Author paper | Problems with few seeds and unstable aggregate statistics | Five seeds are always sufficient, or time points are independent trials |

The most useful part of a theoretical source is often its assumptions. Removing them before transferring a conclusion to a process plant can be more misleading than admitting uncertainty. High benchmark returns do not establish that sensor failures, long assay delays, shutdown risks, operational permissions or metric denominators were represented correctly.

## 3. Related publications: verify attribution and process scope

| Publication | Verified authors, process and access | Permitted conclusion in this review | Remaining unknowns |
| --- | --- | --- | --- |
| [TCNSO-MSL-TD3-related paper, 2026](https://doi.org/10.1088/2631-8695/ae5ed3) | DOI title, authors and publisher-deposited abstract; Yonghang Li is an author; calcination | The abstract describes temporal observations, multistep learning and constraint-related design | Full text unavailable; complete experimental settings and physical execution level remain unverified |
| [OA-DSTR-related paper, 2024](https://doi.org/10.1016/j.asoc.2024.111772) | Bibliography and publisher abstract; Yonghang Li et al.; cement grinding | Relevant work on dynamic search and rolling decisions | Grinding behavior and results cannot be presented as calcination validation |
| [Joint soft-sensor and forecasting study, 2026](https://doi.org/10.1109/TII.2026.3664090) | Publisher-deposited title, authors, journal and pages; Yonghang Li et al. | Research topic and bibliographic attribution | Full text unavailable; internal architecture and losses are not reconstructed |
| [TOD-CGAN, 2026](https://doi.org/10.1016/j.jfranklin.2026.108704) | Bibliography and publisher abstract; Yonghang Li is an author | Conditional generation for calcination operational decisions | Conditional generation is not automatically RL or autonomous execution |
| [CoNERL, 2026](https://doi.org/10.1016/j.aei.2026.104530) | Bibliography, author list and simulation wording in the publisher record | External related work combining evolution and RL | Yonghang Li is not an author; simulation cannot be relabeled as plant savings |

These records are starting points for close reading, not endorsements. For TCNSO-MSL-TD3, the deposited abstract establishes its topic but does not resolve temporal splitting, independent equipment, baseline tuning or consistent gate use. Once the paper and supplementary material are available, fill these fields explicitly. A phrase such as comprehensive experiments does not establish a randomized plant trial.

OAM-Net, QC-MTWaveSME, MC3/OOD, PG-MOEA/D-IEpsilon and NURBS trajectories are known project-interface background. Their exact implementations and the proposed RL connections in this tutorial must be described separately. Similar titles, familiar acronyms or recognizable names do not replace original metadata and full-text evidence.

## 4. What two operational sources actually demonstrate

**The 2022 Yokogawa–JSR joint report** explicitly describes an FKDPP field trial on a distillation unit, lasting 35 days from 2022-01-17 to 02-21. It describes simulator training, DCS integration and existing interlocks. It therefore supports the statement that these organizations reported actual autonomous operation of a particular unit, which is stronger execution evidence than simulation based on plant data. [Official source](https://www.yokogawa.com/news/press-releases/2022/2022-03-22/)

It remains a first-party operator/vendor account, not an independently reproduced randomized comparison in this review. Distillation is not cement calcination. We do not transfer its economic figures, infer that this project can copy the algorithm directly, or treat 35 days as coverage of all feed, fault and seasonal conditions. External validity still depends on controlled variables, time scales, constraints and failure handling.

**DeepMind's 2018 operational account** describes autonomous data-centre cooling with candidate prediction, constraint screening, local verification, uncertainty handling and human override. It supports the existence of a layered operational architecture connecting prediction, selection, local checks and human authority. [Official source](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/)

That account alone does not identify PPO or SAC, and its architecture cannot establish the internal network of this project. Its energy percentages are not used to estimate kiln benefits. The shared lesson is the importance of explaining how training, inference, permissions and fallback connect in an operating system. Neither source proves that a particular RL algorithm is universally superior.

## 5. A credible effect statement needs denominators and controls

Suppose a paper reports reduced specific coal consumption. Ask whether coal was measured by mass or heating value, whether production changed, how off-spec material was counted, whether feed and equipment conditions matched, whether policies experienced the same disturbances, whether test data influenced model tuning, and whether takeover periods were excluded. If one algorithm retains only easy operating periods while another includes all periods, the difference may largely reflect selection.

Curve points are not independent samples. Time steps share a trained policy and strong serial dependence. Training seeds, contiguous operating windows, equipment and seasons represent different sources of variation. Use pairing, uncertainty intervals or hierarchical aggregation appropriate to the experimental design and include failed runs. [Agarwal et al.](https://arxiv.org/abs/2108.13264) explain the sensitivity of RL evaluation to small samples and aggregation; industrial adaptation additionally requires handling process autocorrelation.

## 6. Where this website sits on the evidence map

The site provides original derivations, explicitly calculated teaching examples, browser-based teaching dynamics, inspectable project contracts and proposed research interfaces. It does not supply actual industrial logs, an executable PG-MOEA/D-IEpsilon baseline, a trained industrial SAC policy, a plant comparison or verified savings. [Repository contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

Its claims are therefore about why a question merits study, how to formulate it, how to avoid invalid comparisons and what observations would support or refute a hypothesis. When data and implementations become available, update the same matrix with evidence type, protocol, failure cases and reproduction results, rather than merely replacing the illustration with a more elaborate network.`,
    },
  },
  {
    id: 'open-problems', order: 8, group: 'outlook', minutes: 32,
    title: { 'zh-CN': '开放问题：从预测准确到决策可信还缺什么', en: 'Open problems: from accurate prediction to credible decisions' },
    summary: {
      'zh-CN': '围绕隐藏状态、离线支持、闭环模型误差、罕见风险、目标漂移和评价统计提出可检验的下一步，而不是把复杂网络当作答案。',
      en: 'Testable next steps for hidden state, offline support, closed-loop model error, rare risk, changing objectives and statistical evaluation.',
    },
    figure: 'world-model',
    sources: ['r2-cql', 'r2-iql', 'r2-mbpo', 'r2-mopo', 'r2-chance', 'r2-cpo', 'r2-safety-filter', 'r2-rliable', 'r2-dynamic', 'r2-project'],
    body: {
      'zh-CN': String.raw`## 1. 缺少的可能是信息，而不是更深的网络

同样的温度、压力和设定值，可以对应不同的物料停留状态与潜在质量。历史编码能减少这种歧义，但窗口长度不能凭方便选定。应检查：预测残差是否依赖更早的进料、工况切换、前次调整或未记录的人工判断；对变化事件是否始终响应过晚；扩大窗口后收益是否只是多看到了将来发布的化验。一个能预测正常工况平均趋势的网络，未必能在异常来临前区分两个表面相似的状态。

化验缺失也可能不是随机的：操作员可能在怀疑质量波动时加密取样。如果只在有化验时评价误差，得到的是被采样机制选择过的分布。研究应保留采样请求、取样、发布、缺失和失效原因，分层报告误差与校准；没有这些字段时就承认识别边界，不能把插值值当成独立真值。这里是对项目 POMDP 接口的研究推论，不是声称已有数据具备这些字段。[项目观测约定](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 2. 联合动作覆盖比每个通道的直方图更重要

设历史中两个 CV 只出现过 $(+,+)$ 与 $(-,-)$ 两种联合调整。两个通道各自都覆盖了正负动作，但 $(+,-)$ 仍是未验证的组合。六维动作下这种稀疏性会更严重。应同时考察状态条件下的联合动作、近邻距离、行为策略似然及不同装置模式，而不是只画每维最大最小值。分布外检测也只是针对某个表示和参照数据的诊断，无法证明未见动作具有可接受后果。[CQL](https://arxiv.org/abs/2006.04779)；[IQL](https://arxiv.org/abs/2110.06169)

离线评价的难点可以用重要性权重直观看出：

$$w_{0:T-1}=\prod_{t=0}^{T-1}\frac{\pi(a_t\mid h_t)}{\mu(a_t\mid h_t)}.$$

在一个教学行为策略中，“上调”概率为 $0.1$，目标策略为 $0.5$。连续五次上调的轨迹权重为 $5^5=3125$，而该轨迹在行为策略中的概率只有 $10^{-5}$。少量稀有轨迹可以支配估计方差。截断权重可降低方差，却引入偏差；行为概率未知、隐藏判断未记录或支持为零时，问题更严重。这个算例只是说明统计机制，并非建议把轨迹重要性采样直接作为本项目最终评估器。

## 3. 单步预测好，并不意味着闭环推演可靠

考虑真实和模型轨迹从同一状态开始。若在比较域内有统一单步模型误差 $\varepsilon$，且真实闭环映射的敏感度上界为 $L$，则可以得到一个教学误差递推：

$$e_{k+1}\le Le_k+\varepsilon,\qquad e_0=0,$$
$$e_H\le\varepsilon\sum_{i=0}^{H-1}L^i=\begin{cases}\varepsilon\dfrac{L^H-1}{L-1},&L\ne1,\\H\varepsilon,&L=1.\end{cases}$$

如果比较的是同一动作序列，$L$ 可取动力学对状态的敏感度；如果策略分别读取各自的真实/模型状态，$L$ 必须覆盖闭环映射，例如在相应 Lipschitz 假设下取 $L_x+L_aL_\pi$。含离散拒绝的门控可能没有这样的全局连续界。**测试集 RMSE 不是统一误差上界，未经验证的 $L$ 也不是证书。**

取归一化误差 $\varepsilon=0.02,L=1.2$，三步上界为 $0.02(1+1.2+1.44)=0.0728$，十步约为 $0.5192$。这不是实际窑误差，而是解释长推演为何可能放大偏差。短分叉、模型集合、保守惩罚和停止规则可以作为控制模型利用风险的设计；它们仍需在行动后分布上校准。[MBPO](https://arxiv.org/abs/1906.08253)；[MOPO](https://arxiv.org/abs/2005.13239)

![闭环模型研究：校准、短推演与失败反馈](./images/diagrams/research-open-problems-diagram-1.webp)

## 4. 不确定性要在真正关心的条件下校准

一个总体覆盖率 95% 的质量区间，仍可能在旧化验、高负荷或原料变化时系统失准。因此除了总体覆盖，还应按化验年龄、装置模式、动作幅度与 OOD 距离分组，报告覆盖率、区间宽度及数据数量。宽到毫无行动价值的区间不能仅凭覆盖高就称为优秀；窄而失真的区间也不能只凭好看的平均误差进入 Gate。

同样，机会约束 $P(q\le q_{\max})\ge1-\delta$ 的保证对象必须说清楚：单个时刻、某个工况条件还是整条轨迹。若每一步都声称违规概率最多 $1\%$，并不意味着 100 步中至少一次违规的概率也只有 $1\%$。例如，若各步事件独立且每步违规概率恰为 $1\%$，则后者为 $1-0.99^{100}\approx63.4\%$；独立但每步仅有“至多 $1\%$”时，这个数是上界而非等式。有依赖时不能使用这个乘积式，但仍不能把逐步概率当成全程概率。[机会约束原始理论](https://doi.org/10.1287/mnsc.6.1.73)。将预算分配到时域需要明确联合风险模型，不能只调大一个损失权重。

## 5. 期望约束、执行门控和正式安全保证之间仍有距离

CMDP 的期望成本约束能表达长期预算，却允许风险在时间和轨迹间不均匀分布。成本 Critic 偏差、乘子振荡或软测量错误，都会影响学到的规避行为。[CPO](https://arxiv.org/abs/1705.10528)。项目五层门控检查数据、状态、模型可信度、动作可行性与执行权限；当前观测满足阈值，也不能推出延迟质量永远不越界。

形式化预测安全过滤需要更强的对象：可信的误差集合、能安全到达的终端集合、备用控制器，以及使后续仍有可行方案的条件。是否满足这些前提要单独建模证明。[预测安全过滤器原论文](https://doi.org/10.1016/j.automatica.2021.109597)。在研究中应保持 Gate 激活，对未经执行的候选做影子诊断，而非通过关闭执行保护来“展示 RL 的上限”。

零违规样本也不是零风险的证明。对一个固定策略，若进行了 100 次真正独立、相同分布的实验，每次事件定义为“该完整实验是否至少出现一次违规”，观察到零次事件时，二项模型下单侧 95% 上置信界为 $1-0.05^{1/100}\approx2.95\%$。这是**每次实验**发生事件的概率界，不是每个时间步的风险界；将同一相关轨迹切成 100 点不满足独立假设。工业稀有事件评价更需要故障场景与明确的外推边界。

## 6. 经济目标也会变，策略更新不能绕开评价版本

原料、产品任务、电价、燃料热值与设备磨损会改变折中。一个固定权重策略可能对新偏好反应差；一个不断调权重的系统又使实验不可比。可以研究偏好条件策略、动态 Pareto 搜索或滚动重规划，但必须保存偏好版本、归一化常数和门控版本。[动态多目标优化](https://doi.org/10.1109/TEVC.2004.831456)。在测试期看到结果后挑选最有利的偏好，相当于使用测试集选择模型。

## 7. 把未来工作排成证据顺序

| 未知问题 | 首个可执行诊断 | 什么结果会阻止进一步复杂化 |
| --- | --- | --- |
| 历史是否足够 | 控制容量后的窗口消融与残差依赖分析 | 更长窗口无稳健收益或只靠泄漏获益 |
| 候选是否有数据支持 | 条件联合动作覆盖与分工况误差 | 高收益只出现在无支持区域 |
| 模型能否回答动作后果 | 动作条件验证、短长推演误差与策略迁移测试 | 低单步误差伴随闭环失稳或指标反转 |
| Gate 是否掩盖坏策略 | 请求/执行差异、拒绝原因、恢复时间 | 执行表现靠大比例回退维持 |
| 结果是否可复现 | 配对扰动、多种子与独立时间窗口 | 排名依赖单个种子、窗口或测试调参 |

重复运行的目标不是取得一条好看的曲线，而是估计结果对训练与工况的敏感性。应预先声明实际关心的改善幅度，并报告其区间；固定少数种子是起点，不是充分性证明。[RL 统计评估](https://arxiv.org/abs/2108.13264)。这些检查都可以先在离线材料与仿真中完成。本页没有提出在真实窑上进行试错探索。`,
      en: String.raw`## 1. Missing information may matter more than network depth

Identical temperatures, pressures and setpoints can correspond to different material residence states and latent quality. History encoding can reduce this ambiguity, but window length needs justification. Check whether residuals depend on older feed changes, mode switches, previous adjustments or unrecorded operator judgment; whether event responses are consistently late; and whether longer windows help only by exposing assays released in the future. A model that predicts average normal-operation trends may fail to distinguish superficially similar states before a disturbance.

Assay missingness may also be informative: operators may request more samples when they suspect instability. Evaluation only at labeled times then reflects a distribution selected by the sampling mechanism. Preserve sample requests, sampling times, release times, missingness and invalidation reasons, and report stratified error and calibration. When these fields are unavailable, state the identification limit rather than treating interpolated values as independent truth. This is a research inference from the POMDP interface, not a claim that current data already contain these fields. [Project observation contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)

## 2. Joint action coverage matters more than marginal histograms

Suppose two CVs were historically adjusted only as $(+,+)$ or $(-,-)$. Each coordinate contains positive and negative changes, yet $(+,-)$ remains unvalidated. Six-dimensional actions intensify this sparsity. Examine state-conditional joint actions, neighborhood distances, behavior likelihoods and equipment modes rather than only coordinate ranges. OOD detection is a diagnostic relative to a representation and reference data; it does not prove acceptable consequences for an unseen action. [CQL](https://arxiv.org/abs/2006.04779); [IQL](https://arxiv.org/abs/2110.06169)

Importance weights illustrate an offline-evaluation difficulty:

$$w_{0:T-1}=\prod_{t=0}^{T-1}\frac{\pi(a_t\mid h_t)}{\mu(a_t\mid h_t)}.$$

In a teaching example, the behavior policy increases a setpoint with probability $0.1$, while the target policy does so with probability $0.5$. Five consecutive increases receive weight $5^5=3125$, but occur with behavior probability $10^{-5}$. Rare trajectories can dominate variance. Clipping weights reduces variance at the price of bias; unknown behavior probabilities, hidden operator information and missing support create further problems. The example explains a statistical mechanism, not a recommendation to make trajectory importance sampling the project's final evaluator.

## 3. Accurate one-step prediction need not produce reliable closed-loop rollouts

Compare real and model trajectories from the same initial state. Suppose there is a uniform one-step model-error bound $\varepsilon$ over the comparison domain and a sensitivity bound $L$ for the true closed-loop map. A teaching recurrence is

$$e_{k+1}\le Le_k+\varepsilon,\qquad e_0=0,$$
$$e_H\le\varepsilon\sum_{i=0}^{H-1}L^i=\begin{cases}\varepsilon\dfrac{L^H-1}{L-1},&L\ne1,\\H\varepsilon,&L=1.\end{cases}$$

For a common action sequence, $L$ may bound dynamics sensitivity to state. If the policy reacts separately to the real and predicted states, it must cover the closed-loop map—for example, $L_x+L_aL_\pi$ under suitable Lipschitz assumptions. A discrete rejection gate may have no such global continuity bound. **Test RMSE is not a uniform error bound, and an unverified value of $L$ is not a certificate.**

With normalized $\varepsilon=0.02,L=1.2$, the three-step bound is $0.02(1+1.2+1.44)=0.0728$; the ten-step bound is approximately $0.5192$. These are not measured kiln errors. They explain why longer rollouts can amplify model mismatch. Short branches, ensembles, conservative penalties and stopping rules are candidate designs for limiting exploitation, but require calibration on distributions induced by actions. [MBPO](https://arxiv.org/abs/1906.08253); [MOPO](https://arxiv.org/abs/2005.13239)

![Closed-loop model research: calibration and failure feedback](./images/diagrams/research-open-problems-diagram-1.webp)

## 4. Calibrate uncertainty under the conditions that matter

A quality interval with 95% overall coverage can still be systematically wrong for stale assays, high load or changing feed. Report coverage, interval width and sample counts by assay age, mode, action magnitude and OOD distance. An interval too wide to inform any decision is not useful merely because it covers; a narrow but misleading interval cannot enter a gate on the strength of average prediction error.

The scope of a chance constraint $P(q\le q_{\max})\ge1-\delta$ also matters: a single instant, a conditional regime or an entire trajectory. A claim of at most $1\%$ violation probability per step does not imply $1\%$ probability of any violation over 100 steps. For example, with independent events and probability exactly $1\%$ at every step, the latter is $1-0.99^{100}\approx63.4\%$. With independence but only an at-most-$1\%$ bound, this is an upper bound rather than an equality. Dependence invalidates that product calculation but does not justify equating the two risks. [Foundational chance-constraint theory](https://doi.org/10.1287/mnsc.6.1.73). Allocating risk across a horizon needs an explicit joint-risk model, not merely a larger loss weight.

## 5. Expected constraints, gates and safety certificates remain different

CMDP constraints describe expected budgets but permit uneven concentration of risk across times and trajectories. Biased cost critics, oscillating multipliers or incorrect soft measurements affect learned avoidance. [CPO](https://arxiv.org/abs/1705.10528). The project's five gates check data, state, model credibility, action feasibility and permission. Passing present-observation thresholds does not imply that delayed quality will always remain inside bounds.

Formal predictive safety filtering requires stronger objects: credible error sets, a reachable terminal safe set, a backup controller and conditions preserving future feasibility. Establishing these assumptions is a separate modeling task. [Original predictive-safety-filter paper](https://doi.org/10.1016/j.automatica.2021.109597). Keep execution protection active during research and diagnose unexecuted requests in shadow evaluation; disabling it is not an appropriate way to demonstrate a policy's potential.

Zero observed violations do not prove zero risk. For a fixed policy, suppose 100 genuinely independent, identically distributed experiments each produce a binary event: whether the complete experiment contains at least one violation. With zero events, the binomial one-sided 95% upper confidence bound is $1-0.05^{1/100}\approx2.95\%$. This bounds event probability **per experiment**, not per time step. Dividing one correlated trajectory into 100 samples does not satisfy the independence assumption. Rare industrial events therefore also require explicit fault scenarios and limits on extrapolation.

## 6. Changing economics require versioned evaluation

Feed, product assignments, electricity prices, fuel heating value and equipment wear alter trade-offs. A fixed-weight policy may respond poorly to new preferences; constantly retuned weights make comparisons ambiguous. Preference-conditioned policies, dynamic Pareto search and rolling replanning are legitimate research options, with preference versions, normalization constants and gate versions preserved. [Dynamic multiobjective optimization](https://doi.org/10.1109/TEVC.2004.831456). Selecting favorable preferences after examining test outcomes is another form of test-set model selection.

## 7. Order future work by the evidence it produces

| Unknown | First executable diagnostic | Result that should block extra complexity |
| --- | --- | --- |
| Is history sufficient? | Capacity-controlled memory ablation and residual dependence | Longer history gives no robust gain or benefits only through leakage |
| Are proposals supported? | Conditional joint-action coverage and regime-level errors | Gains occur only in unsupported regions |
| Does the model identify action consequences? | Action-conditioned checks, short/long rollout errors and policy transfer | Low one-step error coexists with closed-loop deterioration |
| Does gating conceal a poor policy? | Request/execution differences, rejection causes and recovery time | Performance depends on frequent fallback |
| Are findings reproducible? | Paired disturbances, multiple seeds and independent time windows | Ranking depends on one seed, one period or test-set tuning |

Repeated runs should estimate sensitivity to training and operating conditions, not produce a selected attractive curve. Predeclare a practically relevant effect size and report uncertainty around it. A small fixed seed count is a starting budget, not evidence of sufficiency. [RL statistical evaluation](https://arxiv.org/abs/2108.13264). These checks can begin with offline data and simulation; this page proposes no trial-and-error exploration on a physical kiln.`,
    },
  },
  {
    id: 'agenda', order: 9, group: 'outlook', minutes: 38,
    title: { 'zh-CN': '研究路线：把已有模块变成六个可证伪问题', en: 'Research agenda: six falsifiable questions connecting existing modules' },
    summary: {
      'zh-CN': '沿“状态感知→质量预测→动态多目标优化→设定值决策”主线，定义数据契约、基线、消融、失败标准和分阶段产物。',
      en: 'Turn the state–quality–optimization–setpoint chain into explicit data contracts, baselines, ablations, failure criteria and staged deliverables.',
    },
    sources: ['r2-project', 'r2-monitoring', 'r2-oadstr', 'r2-tcnso', 'r2-todcgan', 'r2-cql', 'r2-iql', 'r2-td3bc', 'r2-mbpo', 'r2-mopo', 'r2-cpo', 'r2-safety-filter', 'r2-rliable', 'r2-rlbook'],
    body: {
      'zh-CN': String.raw`## 1. 研究主线应从决策问题贯穿到证据

本项目可沿“状态感知 → 质量软测量与时序预测 → 动态多目标优化 → 上层 CV 设定值决策”组织。已有模块分别回答一部分问题；新的 RL 研究应说明在哪个接口增加了什么能力，以及什么观察会推翻这项主张。将全部模块连接起来之后回报上升，不能单独证明每个模块都有必要。

OAM-Net 的可靠性门控与多速率融合、化验缺失时回退到在线信息；QC-MTWaveSME 的质量与预测接口；MC3/OOD 的监测与域外诊断；PG-MOEA/D-IEpsilon 的多目标候选；NURBS 的轨迹表示，均在此作为**已知项目背景接口**讨论。具体层数、参数、训练配方和成绩没有在本次工作中重建。相关公开书目为[联合软测量与预测](https://doi.org/10.1109/TII.2026.3664090)、[OA-DSTR](https://doi.org/10.1016/j.asoc.2024.111772)、[TCNSO-MSL-TD3 相关工作](https://doi.org/10.1088/2631-8695/ae5ed3)与 [TOD-CGAN](https://doi.org/10.1016/j.jfranklin.2026.108704)；本综述对其访问范围见证据页，下面是待检验的新连接，而不是这些论文已经证明的结论。

![研究议程：统一接口、两类候选与可证伪评价](./images/diagrams/research-agenda-diagram-1.webp)

## 2. 先固定数据契约，避免不同模块看到不同的过去

| 字段组 | 至少保留什么 | 为什么进入研究协议 |
| --- | --- | --- |
| 时钟与信号 | 决策时间、传感器采样时间、到达时间、有效性与缺失原因 | 对齐可用信息，识别通信延迟 |
| 化验 | 取样时间、发布时间、结果、失效标记与采样事件 | 分开质量对应时刻与策略可读取时刻 |
| 设定值 | 调整前后 CV 设定值、RATE 与边界版本 | 将归一化动作还原到物理单位 |
| 动作与门控 | 候选、执行、各层结果、拒绝原因、权限与 Gate 版本 | 区分策略能力与回退贡献 |
| 原料和工况 | KH、SM、IM、负荷、设备模式及可取得的燃料热值 | 描述扰动、混杂与分工况范围 |
| 原始指标 | 燃料质量/热值、电量、熟料产量、质量记录、时间边界 | 重算总量比，不只接受预制平均指标 |
| 实验版本 | 数据划分、模型、归一化、偏好、种子、仿真与代码版本 | 允许复现与归因 |

历史日志没有候选动作、权限或采样请求时，应记为“未记录”，而不是由执行值复制生成虚假的完整记录。仿真可以提供隐藏真值用于最终评价，但训练输入依然按真实可用信息构造。研究不改变[现有 5 分钟周期、有界 CV 增量及五层门控契约](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md)，也不把煤量、风量或阀门开度当作可绕过内层控制的动作。

划分必须满足两个时间顺序条件：

$$\max t(\mathcal D_{\rm train})<\min t(\mathcal D_{\rm val}),\qquad \max t(\mathcal D_{\rm val})<\min t(\mathcal D_{\rm test}).$$

但仅按决策时间分界仍不够。根据历史窗口、预测目标跨度与化验发布延迟设置隔离区，防止同一原始片段、尚未发布标签或同一事件通过窗口重叠跨入两侧。标准化、特征选择、软测量拟合和策略训练使用训练期；超参数、停止条件和预算选择使用验证期；测试期冻结后只作最终评价。额外装置或季节留出只有在相应数据实际存在时才报告。

## 3. H1：可靠性与化验年龄是否改善决策，而不仅是平均预测

**假设。** 在化验缺失或变旧时，显式使用可用性、样品年龄和可靠性描述，比简单前向填充更能校准质量风险，并在相同门控下减少无效候选与延迟恢复。

**设计。** 记录每份化验的双时间戳、在线信号和故障掩码，比较同一编码容量下的前向填充、带掩码/年龄、可靠性融合三个版本；所有版本共享相同软测量标签和策略预算。再单独删除年龄或可靠性输入，而不把未来化验作为“理想基线”。可在仿真评价中提供一个明确标注的特权信息上限，但不能混入可部署结果。

**判定。** 同时报告质量 MAE、分年龄区间覆盖、违规持续时间、Gate 拒绝和扰动后恢复。若只降低正常工况平均误差，却让旧化验条件下的区间失准或闭环风险上升，则该决策收益假设不获支持。若容量匹配后收益消失，应把结论归为容量差异，不能宣称可靠性机制已被验证。

## 4. H2：历史表示与多步价值，各自解决了多少延迟

**假设。** 对具有物料与热惯性的模拟扰动，历史编码和多步价值目标分别减少状态混叠与延迟信用误差，且两者的组合收益可与单纯增大网络区分。

**设计。** 做“瞬时/历史输入 × 一步/多步目标”的 $2\times2$ 设计，固定参数量范围、更新次数和有效数据窗口。多步目标的基本形式为

$$y_t^{(n)}=\sum_{k=0}^{n-1}\gamma^k r_{t+k+1}+\gamma^n\overline V(h_{t+n}),$$

在真实终止时截断后续项；时间窗口截断保留合法末观测 bootstrap，但不跨 reset 拼接。离线行为轨迹与目标策略不同，多步学习还要说明采用的离策略修正或接受了何种偏差，不能把上式直接当作无条件无偏估计。[RL 教材](https://incompleteideas.net/book/the-book-2nd.html)

**判定。** 使用不同扰动起点与时滞范围，报告回报、质量成本、时滞响应及价值误差。若效果仅出现在训练过的固定延迟，换延迟即反转，或多步收益来自跨边界标签泄漏，则不支持稳健延迟建模；若预算不足导致区间过宽，应报告结论不确定，而不是自动宣布无效。

## 5. H3：优化示范与轨迹表示，是否真的带来序列改进

**假设。** PG-MOEA/D-IEpsilon 提供的可行候选/轨迹可作为离线策略的示范或热启动；NURBS 参数化可减少搜索维数。但 RL 必须在相同偏好和计算预算下，表现出超出“复制优化器”的增益，混合才有研究价值。

**设计。** 必须保留 Operator、实际 PG-MOEA/D-IEpsilon、示范 BC 和混合策略四组。先固定评价模型、预测窗口、门控及目标尺度，再比较逐步增量与轨迹参数化；报告生成示范的模型调用数、策略训练成本和每次决策延迟。轨迹必须与当前真实 SP 衔接，通过采样点的 RATE、增量变化和工艺可行性检查。

**判定。** 若混合方法只是把更长规划窗口或更多模型调用隐藏到离线阶段，不能归因于 RL；若 BC 已达到同等效果，证据支持策略压缩而不支持额外价值学习。当前仓库网页没有实际 PG 基线实现和数据，这项实验在接入它们之前保持为协议，不填入虚构对比数字。粉磨领域的 [OA-DSTR](https://doi.org/10.1016/j.asoc.2024.111772)可启发动态比较设计，但不代替烧成对照。

## 6. H4：离线保守性是否在覆盖下降时仍有价值

**假设。** 数据支持减少或工况改变时，保守/受约束的离线学习比普通在线算法直接拟合日志更少利用数据外虚高价值；同时应证明其并未退化成永远保持设定值。

**设计。** 比较 BC、TD3+BC、CQL、IQL，以及明确标为“在线算法直接用于固定日志”的诊断基线；不允许该基线在真实设备补采探索。构造不同覆盖条件时，尽量匹配样本量并分开“少数据”与“缺少联合动作支持”。固定状态表示、Actor 容量、调参次数和 Gate，记录条件动作距离、Q 校准、执行变化、拒绝率与成本。[TD3+BC](https://arxiv.org/abs/2106.06860)；[CQL](https://arxiv.org/abs/2006.04779)；[IQL](https://arxiv.org/abs/2110.06169)

**判定。** 若改善只存在于训练代理中，在独立模型/扰动下消失，或高回报伴随无支持候选与大量回退，则不支持可迁移决策收益。若所有方法都退回 BC 水平，说明当前数据可能不足以识别超越行为策略的改进，不能靠再换更复杂缩写解决。

## 7. H5：动作条件世界模型是否优于只预测趋势

**假设。** 含执行动作的模型能够在被数据支持的范围内预测调整后果；从真实状态开始的短分叉，比无约束长推演更不容易让策略利用模型偏差。

**设计。** 比较无动作预测、执行动作条件预测、模型集合三个版本；再比较零模型推演、短分叉和较长推演，统一总更新预算。把真实日志与合成转移分别标记，记录分叉源、长度与模型版本。训练损失之外，验证对动作变化的响应、工况外校准及政策改变后的闭环误差；不把相同模型既当训练环境又当唯一裁判。[MBPO](https://arxiv.org/abs/1906.08253)；[MOPO](https://arxiv.org/abs/2005.13239)

**判定。** 若预测 MAE 改善但调整方向错误，或推演越长回报越好而独立评价越差，则出现了模型利用，不支持“更准确模型带来更好决策”。短分叉只有在数据起点、长度控制和不确定性校准共同固定时才能归因；减少真实数据量后仍须报告支持边界。

## 8. H6：成本学习能否减少对 Gate 的依赖

**假设。** 独立成本 Critic 与拉格朗日预算学习，使候选提前避开未来风险，因而在不改变执行规则的前提下减少拒绝、回退与恢复时间，并保持可接受的能耗折中。

**设计。** 执行时始终保留同样的五层门控。比较有/无成本价值、有/无不确定性条件输入和不同合法成本预算，记录每层拒绝、候选与执行差、质量/氧含量的峰值违反量和持续时间。未经门控的候选只做离线或影子审计，不执行。成本预算的折扣定义、物理单位和拉格朗日步长必须登记。[CPO](https://arxiv.org/abs/1705.10528)与[预测安全过滤](https://doi.org/10.1016/j.automatica.2021.109597)分别提供学习约束和执行保护的理论参照，不能互相替代。

**判定。** 若执行后违规少只是因为回退更多，或成本均值下降但罕见峰值更高，假设尚未成立；若预算只在训练模型中满足，不能称现场安全。评价重点是能否提前规避风险，而非证明 Gate 可以删除。

## 9. 共同验收协议与阶段产物

六项假设都先声明主指标、实际重要的最小改善量 $\delta_R$、固定约束预算 $d_j$ 和失败情形。例如定义 $\Delta R=J_r^{\rm candidate}-J_r^{\rm baseline}$；只有效应区间足以支持 $\Delta R>\delta_R$、约束指标在预定预算内且关键分工况没有不可接受退化时，才支持对应实验范围内的改善。区间不足以区分时报告“不确定”。这些研究判定不修改硬边界或工程权限。[评估方法参考](https://arxiv.org/abs/2108.13264)

| 阶段 | 应交付的可检查产物 | 进入下一阶段前需要的证据 |
| --- | --- | --- |
| 数据与指标 | 时间字典、缺失报告、分母核算、冻结划分 | 无可用性泄漏，指标能从原始量重算 |
| 预测与基线 | 简单模型、软测量校准、Operator/PG 接口 | 比较边界一致，实际基线可运行 |
| 六项离线实验 | 配置、种子、消融、失败日志与统计区间 | 效应来源明确，未用测试结果调参 |
| 仿真压力评价 | 扰动/故障场景、请求执行日志、模型失配分析 | 报告适用范围与不能外推的条件 |
| 研究结论 | 证据矩阵、可复现脚本、负结果与下一问题 | 只声称实验真正支持的能力 |

这条路线的第一步是把数据、基线和接口变得可验证，而不是立即进行大型离线训练。本文未运行这些研究实验，未生成任何真实节能结果，也未提出在实体烧成系统上探索。它把已有工作组织成可以逐项被支持、被推翻或被判定仍不确定的研究计划。`,
      en: String.raw`## 1. Connect the research question to the evidence

Organize the project around state awareness → quality soft sensing and forecasting → dynamic multiobjective optimization → supervisory CV setpoint decisions. Existing modules answer parts of this chain. New RL research should state what capability is added at an interface and what observation would refute that claim. Improved return after connecting every module does not establish that every component is necessary.

OAM-Net's reliability-gated multirate fusion and online-information fallback when assays are absent; QC-MTWaveSME's quality/forecasting interface; MC3/OOD monitoring and domain diagnostics; PG-MOEA/D-IEpsilon candidates; and NURBS trajectory representation are treated here as **known project-interface background**. Exact layers, parameters, training recipes and results were not reconstructed. Related public records include [joint soft sensing and forecasting](https://doi.org/10.1109/TII.2026.3664090), [OA-DSTR](https://doi.org/10.1016/j.asoc.2024.111772), [TCNSO-MSL-TD3-related work](https://doi.org/10.1088/2631-8695/ae5ed3) and [TOD-CGAN](https://doi.org/10.1016/j.jfranklin.2026.108704), with access limits documented on the evidence page. The following connections are hypotheses, not claims already established by those publications.

![Research agenda: common interfaces and falsifiable tests](./images/diagrams/research-agenda-diagram-1.webp)

## 2. Freeze a data contract before comparing modules

| Field group | Minimum retained information | Purpose |
| --- | --- | --- |
| Clocks and signals | Decision, sensor-sample and arrival times; validity and missingness reasons | Reconstruct availability and communication delays |
| Assays | Sample and release times, result, invalidation and sampling events | Separate material time from information availability |
| Setpoints | CV setpoints before/after adjustment; RATE and boundary versions | Recover physical units from normalized actions |
| Actions and gates | Request, execution, per-layer outcomes, reasons, permissions and gate version | Separate policy skill from fallback assistance |
| Feed and regimes | KH, SM, IM, load, equipment modes and available heating values | Describe disturbances, confounding and regime scope |
| Raw outcomes | Fuel mass/heating value, electricity, clinker output, quality and interval boundaries | Recompute ratios from totals |
| Experiment versions | Split, model, normalization, preferences, seed, simulator and code | Support reproduction and attribution |

If historical logs lack requested actions, permissions or sampling requests, mark them unrecorded. Do not copy execution into a fictitious complete request log. Simulation may expose hidden truth for evaluation, while training inputs still respect actual availability. Research preserves the [five-minute cycle, bounded CV increments and five-gate contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md); it does not redefine coal, fan or valve manipulation as a way around inner control.

Two temporal ordering conditions are necessary:

$$\max t(\mathcal D_{\rm train})<\min t(\mathcal D_{\rm val}),\qquad \max t(\mathcal D_{\rm val})<\min t(\mathcal D_{\rm test}).$$

Decision-time boundaries alone are insufficient. Purge boundary regions according to history length, forecasting horizon and assay-release delay so that shared raw segments, unreleased labels and overlapping events do not bridge splits. Fit normalization, features, soft sensors and policies on training data; use validation data for hyperparameters, stopping and budget choices; freeze the test period for final evaluation. Report additional equipment or seasonal holdouts only when such data actually exist.

## 3. H1: do reliability and assay age improve decisions?

**Hypothesis.** During missing or stale assays, explicit availability, sample age and reliability improve quality-risk calibration over simple forward filling, reducing ineffective proposals and delayed recovery under the same gate.

**Design.** Retain both assay timestamps, online signals and fault masks. Compare forward filling, masks/age, and reliability fusion at matched encoder capacity with identical labels and policy budgets. Remove age and reliability separately in ablations. Future assays are not a legitimate deployable baseline. A privileged-information upper bound may appear in simulation evaluation only if clearly labeled and separated.

**Decision rule.** Report quality MAE, age-stratified interval coverage, violation duration, gate rejection and recovery after disturbances. Lower normal-regime error accompanied by worse stale-assay calibration or closed-loop risk does not support a decision benefit. If the advantage vanishes after capacity matching, attribute it to capacity rather than to a verified reliability mechanism.

## 4. H2: distinguish history representation from multistep credit

**Hypothesis.** For simulated material and thermal delays, history encoding and multistep value targets separately reduce state ambiguity and delayed-credit error, with a combined benefit distinguishable from simply increasing network size.

**Design.** Use a $2\times2$ experiment: instantaneous/history input × one-step/multistep target, controlling parameter ranges, update counts and effective data windows. The basic multistep target is

$$y_t^{(n)}=\sum_{k=0}^{n-1}\gamma^k r_{t+k+1}+\gamma^n\overline V(h_{t+n}).$$

Truncate subsequent terms at genuine termination. At a time-limit truncation, retain legitimate final-observation bootstrapping without crossing a reset. Offline behavior trajectories differ from the target policy, so specify the off-policy correction or the bias accepted; the expression is not unconditionally unbiased. [RL textbook](https://incompleteideas.net/book/the-book-2nd.html)

**Decision rule.** Vary disturbance onset and delay ranges; report return, quality cost, response lag and value error. Benefits limited to the training delay, reversal under changed delays or leakage across boundaries do not support robust delay handling. If uncertainty is too large to decide, report an inconclusive experiment rather than declaring no effect.

## 5. H3: do optimizer demonstrations and trajectories add sequential value?

**Hypothesis.** Feasible PG-MOEA/D-IEpsilon candidates or trajectories can supply demonstrations and warm starts, while NURBS parameterization can reduce search dimension. To justify a hybrid, RL must add something beyond copying the optimizer under matched preferences and computational budgets.

**Design.** Retain four comparisons: Operator, the actual PG-MOEA/D-IEpsilon implementation, demonstration BC and the hybrid policy. Fix the evaluator, prediction horizon, gate and objective scaling before comparing independent increments with trajectory parameters. Report model calls used to generate demonstrations, training cost and decision latency. Trajectories must connect to actual present setpoints and pass sampled RATE, increment-change and process-feasibility checks.

**Decision rule.** A longer planning horizon or extra model calls hidden in offline preparation cannot be credited to RL. If BC matches the hybrid, the evidence supports policy compression but not additional value learning. The web repository currently has neither the actual PG baseline nor its data, so this remains a protocol without invented scores. Grinding-oriented [OA-DSTR](https://doi.org/10.1016/j.asoc.2024.111772) informs dynamic-comparison design but does not replace a calcination baseline.

## 6. H4: does offline conservatism help as coverage deteriorates?

**Hypothesis.** As support weakens or operating conditions change, conservative or behavior-regularized offline methods exploit fewer unsupported high Q estimates than ordinary online algorithms fitted directly to logs. They must also show that the apparent benefit is not simply permanent setpoint holding.

**Design.** Compare BC, TD3+BC, CQL and IQL with a diagnostic baseline explicitly labeled an online algorithm applied to fixed logs. That baseline receives no additional exploratory plant data. Where possible match sample counts while varying coverage, separating less data from missing joint-action support. Fix representations, actor capacity, tuning attempts and gates. Record conditional action distance, Q calibration, executed variation, rejection and costs. [TD3+BC](https://arxiv.org/abs/2106.06860); [CQL](https://arxiv.org/abs/2006.04779); [IQL](https://arxiv.org/abs/2110.06169)

**Decision rule.** Gains confined to the training surrogate, disappearing under independent models/disturbances, or accompanied by unsupported proposals and frequent fallback do not establish transferable decision improvement. If all methods converge to BC-level performance, available data may not identify improvement beyond behavior. A more elaborate acronym does not resolve missing information.

## 7. H5: does an action-conditioned world model do more than forecast trends?

**Hypothesis.** A model conditioned on executed actions predicts adjustment consequences within supported regions, and short branches from real states reduce opportunities for model exploitation compared with unrestricted long rollouts.

**Design.** Compare history-only forecasting, executed-action conditioning and model ensembles. Then compare zero synthetic rollout, short branches and longer rollouts at matched update budgets. Label real and synthetic transitions separately and retain branch origins, lengths and model versions. Beyond training loss, check action-response direction, out-of-regime calibration and closed-loop errors after policy changes. The training model must not be the only final judge. [MBPO](https://arxiv.org/abs/1906.08253); [MOPO](https://arxiv.org/abs/2005.13239)

**Decision rule.** Improved prediction MAE with the wrong adjustment direction, or higher modeled return alongside worse independent evaluation as rollouts lengthen, indicates model exploitation. It does not support better decisions from a more accurate model. Attribution to short branching requires controlled start states, horizon selection and uncertainty calibration; reduced-data results still need explicit support limits.

## 8. H6: can cost learning reduce dependence on the gate?

**Hypothesis.** Separate cost critics and Lagrangian budget learning encourage anticipatory risk avoidance, reducing rejection, fallback and recovery time under unchanged execution rules while preserving an acceptable energy trade-off.

**Design.** Keep the same five gates active in every execution. Compare with/without cost values, with/without uncertainty inputs, and legally admissible research budgets. Log per-layer rejection, request–execution differences, peak quality/oxygen violations and duration. Ungated requests are audited offline or in shadow only; they are not executed. Register cost units, discount conventions and multiplier step sizes. [CPO](https://arxiv.org/abs/1705.10528) and [predictive safety filtering](https://doi.org/10.1016/j.automatica.2021.109597) inform learning constraints and execution protection respectively; neither replaces the other.

**Decision rule.** Fewer executed violations achieved only through more fallback, or lower mean cost with larger rare peaks, does not establish the hypothesis. A budget met only in the training model is not plant-safety evidence. The question is whether the agent anticipates risk, not whether the gate can be removed.

## 9. Common acceptance protocol and staged outputs

For every hypothesis, predeclare the primary outcome, a practically meaningful minimum improvement $\delta_R$, fixed constraint budgets $d_j$ and failure cases. For example, define $\Delta R=J_r^{\rm candidate}-J_r^{\rm baseline}$. Support an improvement only when its uncertainty interval supports $\Delta R>\delta_R$, constraint metrics remain within predefined budgets and important regimes show no unacceptable deterioration. Otherwise report uncertainty or failure within the tested scope. These research decisions do not modify hard operating limits or engineering permissions. [Evaluation reference](https://arxiv.org/abs/2108.13264)

| Stage | Inspectable output | Evidence needed to proceed |
| --- | --- | --- |
| Data and metrics | Clock dictionary, missingness, denominator audit and frozen splits | No availability leakage; metrics recomputable from raw quantities |
| Prediction and baselines | Simple models, soft-sensor calibration and Operator/PG interfaces | Matched comparison boundaries and runnable actual baselines |
| Six offline studies | Configurations, seeds, ablations, failure logs and intervals | Identified sources of effects; no test-set tuning |
| Simulation stress evaluation | Disturbance/fault scenarios, action logs and mismatch analysis | Explicit operating scope and extrapolation limits |
| Research conclusion | Evidence matrix, reproducible scripts, negative results and next question | Claims restricted to demonstrated capabilities |

The first step is to make data, baselines and interfaces verifiable, rather than immediately launch expensive training. These studies have not been run by this tutorial, no real energy savings have been generated, and no exploration on a physical kiln is proposed. The agenda turns existing work into claims that can be supported, refuted or left uncertain one at a time.`,
    },
  },
];
