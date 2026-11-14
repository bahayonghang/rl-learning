export interface GlossaryEntry {
  term: string;
  english: string;
  symbol?: string;
  meaning: string;
  kiln: string;
  caution: string;
  chapter: string;
  group: '决策基本量' | '概率与学习' | '工业与研究';
}

export const glossary: GlossaryEntry[] = [
  {term:'智能体',english:'Agent',meaning:'根据可用信息选择动作的决策者。',kiln:'上层设定值建议策略，按每 5 分钟一次的教学节奏工作。',caution:'整个工厂不是智能体；下层 PID/APC 也不必由 RL 取代。',chapter:'01',group:'决策基本量'},
  {term:'环境',english:'Environment',meaning:'接收动作、演化状态并产生反馈的系统。',kiln:'教学或世界模型中的烧成过程、跟踪回路、扰动与测量链。',caution:'学习环境必须说明模型误差和观测生成过程。',chapter:'01',group:'决策基本量'},
  {term:'状态',english:'State',symbol:String.raw`s_t`,meaning:'若完整已知，能足以描述未来演化所需信息的变量集合。',kiln:'可能包括物料热状态、化学反应状态、设备状态等。',caution:'一组测量值不自动等于完整马尔可夫状态。',chapter:'04',group:'决策基本量'},
  {term:'观测',english:'Observation',symbol:String.raw`o_t`,meaning:'决策当时实际可以获得的信息。',kiln:'DCS 历史、当前 SP、已公布化验、化验年龄与软测量。',caution:'当前尚未公布的化验不能提前放进观测。',chapter:'04',group:'决策基本量'},
  {term:'历史表示',english:'History / Representation',symbol:String.raw`h_t`,meaning:'把过去一段观测与动作整理成策略输入。',kiln:'24 步历史窗口，或由 TCN/GRU/Transformer 编码的历史。',caution:'增加历史只是缓解部分可观测，不能证明完全恢复马尔可夫性。',chapter:'04',group:'决策基本量'},
  {term:'动作',english:'Action',symbol:String.raw`a_t`,meaning:'智能体当前选择的决策量。',kiln:'有界归一化 CV 设定值增量，乘 RATE 后变成物理单位。',caution:'请求动作与门控后真正执行的动作要分别记录。',chapter:'01',group:'决策基本量'},
  {term:'设定值与过程变量',english:'Setpoint / Process Variable · SP / PV',symbol:String.raw`Y_t^{sp}`,meaning:'SP 是下层跟踪目标，PV 是实际测量结果。',kiln:'Tc 的 SP 从 880°C 调到 881°C，PV 随动态逐渐响应。',caution:'改 SP 不等于温度瞬间改变；零增量不等于过程静止。',chapter:'21',group:'工业与研究'},
  {term:'操纵变量',english:'Manipulated Variable / MV',meaning:'下层控制回路实际调节的执行量。',kiln:'例如由 APC/PID 调节的给煤、风机或阀门等量。',caution:'本项目上层动作定义不直接输出 MV。',chapter:'21',group:'工业与研究'},
  {term:'策略',english:'Policy',symbol:String.raw`\pi_\theta(a\mid o)`,meaning:'在给定观测下选择动作的规则或概率分布。',kiln:'看到较低温度与陈旧化验后，倾向保持还是小幅上调。',caution:'策略概率大小与动作物理幅值是不同概念。',chapter:'12',group:'决策基本量'},
  {term:'即时奖励',english:'Reward',symbol:String.raw`r_{t+1}`,meaning:'执行当前动作后得到的一步目标评分。',kiln:'煤耗、电耗的标准化项，加上设定值平滑性项。',caution:'奖励的定义需要解释单位、权重和时间归属。',chapter:'01',group:'决策基本量'},
  {term:'约束成本',english:'Constraint Cost',symbol:String.raw`c_{t+1}^{(k)}`,meaning:'单独记录某种约束违背或风险的信号。',kiln:'f-CaO 越界、氧含量不足分别作为质量与安全成本。',caution:'高奖励不能抵消未满足的工程约束。',chapter:'24',group:'工业与研究'},
  {term:'回报',english:'Return',symbol:String.raw`G_t`,meaning:'从当前起，未来多步奖励的加权和。',kiln:'现在调节的代价与后续能耗、稳定性后果一起评价。',caution:'回报不是当前一次测得的奖励。',chapter:'01',group:'决策基本量'},
  {term:'折扣因子',english:'Discount Factor',symbol:String.raw`\gamma`,meaning:'同一项未来回报每推迟一步，权重再乘一次 γ。',kiln:'5 分钟一步，60 分钟之后的尾部价值乘 γ¹²；60 分钟时收到的单条奖励 Rₜ₊₁₂ 乘 γ¹¹，因为第一条 Rₜ₊₁ 的权重为 1。',caution:'先区分单条奖励与尾部回报。1/(1−γ) 是粗略权重尺度，不是硬截止时间。',chapter:'05',group:'概率与学习'},
  {term:'状态价值',english:'State Value',symbol:String.raw`V^\pi(s)`,meaning:'从一个状态出发、随后遵循策略的期望回报。',kiln:'按当前操作策略继续运行，这个窑况整体有多好。',caution:'价值取决于后续策略，不能脱离策略谈“这个状态的唯一价值”。',chapter:'05',group:'决策基本量'},
  {term:'动作价值',english:'Action Value',symbol:String.raw`Q^\pi(s,a)`,meaning:'当前先做指定动作，再遵循策略的期望回报。',kiln:'在同一窑况下先保持与先升温的长期后果比较。',caution:'大写 Q 是动作价值，小写 q 常指质量，两者不是同一量。',chapter:'05',group:'决策基本量'},
  {term:'优势',english:'Advantage',symbol:String.raw`A^\pi(s,a)`,meaning:'动作价值减去同状态下策略平均价值。',kiln:'这个建议比当前策略通常的选择好多少。',caution:'优势为正不表示奖励为正，也不表示约束满足。',chapter:'13',group:'概率与学习'},
  {term:'条件期望',english:'Conditional Expectation',symbol:String.raw`\mathbb E[R\mid s,a]`,meaning:'固定已知工况和动作后，按可能结果的概率平均。',kiln:'分别在正常原料与难烧原料下评价同样升温。',caution:'“平均”需要正确概率/样本分布，不能只选成功记录。',chapter:'03',group:'概率与学习'},
  {term:'Bellman 备份',english:'Bellman Backup',meaning:'用当前奖励与下一状态价值来更新当前价值。',kiln:'先计算下一步可能进入哪些窑况，再把未来价值带回当前。',caution:'策略评估的加权平均与最优控制的取最大值不同。',chapter:'05',group:'概率与学习'},
  {term:'自举',english:'Bootstrapping',meaning:'用已有估计参与构造新的学习目标。',kiln:'不用等到很久以后，而先用下一状态价值帮助更新。',caution:'估计误差也可能随目标传播；不是统计重采样 bootstrap 的同一用途。',chapter:'07',group:'概率与学习'},
  {term:'TD 误差',english:'Temporal-Difference Error',symbol:String.raw`\delta_t`,meaning:'一步奖励加折扣后的未来估值，再减当前估值。',kiln:'这一步真实反馈比模型原先预期好多少。',caution:'TD 误差不是质量预测残差，也不天然等于真实优势。',chapter:'07',group:'概率与学习'},
  {term:'学习率',english:'Learning Rate',symbol:String.raw`\eta`,meaning:'参数更新时沿梯度或误差方向移动的步幅。',kiln:'决定价值网络/策略网络一次更新改多少。',caution:'它不等于设定值 RATE，也不等于 SAC 熵温度 α。',chapter:'09',group:'概率与学习'},
  {term:'经验回放',english:'Experience Replay',meaning:'保存历史转移，从中抽样训练。',kiln:'重复利用仿真交互产生的工况、请求/执行动作与反馈。',caution:'随机抽样不保证完全独立同分布，也不让在线算法自动变成可靠离线 RL。',chapter:'10',group:'概率与学习'},
  {term:'同策略与离策略',english:'On-policy / Off-policy',meaning:'采数据的行为策略与正在学习/评价的目标策略是否一致。',kiln:'用当前策略推演，或复用旧策略和操作员数据。',caution:'离策略能力不等于允许在固定历史日志外随意估值。',chapter:'08',group:'概率与学习'},
  {term:'自然终止与截断',english:'Terminated / Truncated',meaning:'任务自身结束，与人为停止采样是两种边界。',kiln:'持续运行任务在 72 步停止教学采样，使用 truncated。',caution:'人工截止仍保留最终观测自举，不能拿 reset 后观测接续。',chapter:'19',group:'概率与学习'},
  {term:'重要性采样',english:'Importance Sampling',symbol:String.raw`\rho`,meaning:'用目标分布与采样分布的概率比校正期望。',kiln:'旧策略偏好保持，新策略更常升温，样本贡献需重加权。',caution:'旧分布不覆盖的动作不能靠除法凭空创造证据。',chapter:'14',group:'概率与学习'},
  {term:'PPO 裁剪',english:'PPO-Clip',meaning:'限制代理目标继续奖励某些过大概率变化的方式。',kiln:'避免一次更新过分鼓励同一批设定值建议。',caution:'实际概率比可越界；它不是硬 KL 约束或工业安全门。',chapter:'15',group:'概率与学习'},
  {term:'概率密度',english:'Probability Density',symbol:String.raw`p(a)`,meaning:'连续变量的区间概率由密度积分得到。',kiln:'连续设定值增量的高斯/tanh 分布。',caution:'密度可以大于 1，密度值本身不是事件概率。',chapter:'16',group:'概率与学习'},
  {term:'最大熵与温度',english:'Entropy / Temperature',symbol:String.raw`\alpha`,meaning:'用熵项控制策略分布保持多少随机性。',kiln:'在教学仿真训练中权衡高价值动作与分布多样性。',caution:'SAC 温度不是窑温；现场决策不采用随机试错。',chapter:'17',group:'概率与学习'},
  {term:'软测量',english:'Soft Sensor',symbol:String.raw`\hat q_t`,meaning:'从可测信号估计暂时不可直接测到的质量量。',kiln:'融合多速率 DCS 与已可用化验，估计 f-CaO。',caution:'预测值需要误差/可靠性说明，不能当作无误差真值。',chapter:'21',group:'工业与研究'},
  {term:'化验年龄',english:'Assay Age',meaning:'当前时间与最近已公布样品采样时间的差。',kiln:'同样是 1.0% 的化验，10 分钟前与 100 分钟前含义不同。',caution:'同时保存采样时刻与公布时刻，按公布时间决定能否使用。',chapter:'21',group:'工业与研究'},
  {term:'离线强化学习',english:'Offline RL',meaning:'学习期间只使用固定日志，不再向环境索要新交互。',kiln:'从历史运行与操作记录学习候选设定值策略。',caution:'历史记录覆盖不足、操作员混杂与反事实不可见是关键困难。',chapter:'22',group:'工业与研究'},
  {term:'行为克隆',english:'Behavior Cloning / BC',meaning:'用监督学习模仿日志中的行为动作。',kiln:'先学习操作员在不同窑况下如何调整 SP。',caution:'它学习已有行为，不自动超越操作员，也不能消除分布外误差。',chapter:'22',group:'工业与研究'},
  {term:'世界模型',english:'World Model',symbol:String.raw`W_\psi`,meaning:'预测给定状态/历史与动作后的转移和反馈。',kiln:'让候选设定轨迹在模型中短时推演，与已有预测优化框架衔接。',caution:'只会无条件预测历史延续的模型，不自动具有动作因果响应能力。',chapter:'23',group:'工业与研究'},
  {term:'分布外与动作支持',english:'OOD / Action Support',meaning:'候选工况或动作离开已有数据覆盖范围。',kiln:'罕见原料与大幅设定组合可能让估值虚高。',caution:'状态在分布内不保证该状态下所有动作都有数据支持。',chapter:'22',group:'工业与研究'},
  {term:'约束决策过程',english:'CMDP',meaning:'最大化奖励的同时，单独限制累计成本。',kiln:'分别处理质量、氧含量和执行约束。',caution:'期望累计成本约束不是每个时刻绝对不越界的保证。',chapter:'24',group:'工业与研究'},
  {term:'影子运行与基线',english:'Shadow Mode / Baseline',meaning:'记录候选建议但不执行，并与预先固定的参考方法比较。',kiln:'对比保持、操作员、BC、MPC及 PG-MOEA/D-IEpsilon 的协议。',caution:'影子建议没有真实执行结果，不能据此直接声称节能收益。',chapter:'20',group:'工业与研究'},
];

