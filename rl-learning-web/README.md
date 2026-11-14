# RL Atlas · 把强化学习放进水泥烧成系统

[English README](README.en.md) · [双语内容维护说明](docs/i18n.md)

一份面向流程工业研究者的完整中英双语强化学习教程。假设读者没有系统学过 RL 和所需概率知识：先把概率、期望、梯度变成能手算的小例子，再通过水泥烧成系统理解 Bellman 方程、DQN、PPO、SAC、离线学习与约束决策。网页提供逐步推导、实时计算、延迟过程工作台和带解释的判断反馈，采用暖橙色的浅色与深色主题。中文与英文都包含完整正文、推导、练习答案和研究论述。

**7 个模块、24 章、154 步水泥案例推导 · 8 个数学准备单元与计算器 · 14 个算法实验 · 1 个动态烧成工作台 · 36 个概念词条**

**9 篇研究专题 · 27 项图解（20 个 Mermaid 图 + 7 幅原创概念插图）· 59 条去重资源，保留 77 个引用 ID**

![运行决策的信息、目标与控制分层概念图](public/images/operations-stack.webp)

教程沿用原推文“问题 → 数学 → 算法 → 代码 → 实验”的教学思路，正文、例题、实验和介绍图均为本项目重新组织与创作。参考资料以教材、算法原论文和官方实现文档为主；原文广告、付费内容和配图未作为网站资源重新发布。

## 快速运行

需要 **Node.js 22.12.0 或更新版本**、npm 和 [just](https://just.systems/)。以下命令从仓库根目录开始：

```bash
cd rl-learning-web
just dev
```

`just dev` 会先检查 Node 版本，首次运行或锁文件变化时执行 `npm ci`，随后启动开发服务。依赖已就绪时直接复用。打开终端显示的本地地址，默认是 **http://127.0.0.1:5173/**；端口已占用时以 Vite 实际输出为准。

如果还没有 just，可以按[官方安装说明](https://just.systems/man/en/packages.html)安装。例如已有 npm 时运行 `npm install --global rust-just`；Windows 也可以使用 `winget install --id Casey.Just --exact`。重新打开终端后用 `just --version` 检查。`justfile` 已为 Windows 指定 `cmd.exe`，不要求额外安装 Bash。

已有 Node/npm、暂时没有 just 时，等价入口为 `npm ci` 后运行 `npm run dev`。

前端使用本地安装的依赖，不需要 API Key、账户、数据库或 Python 环境。开发与预览服务默认仅监听本机地址。

### 常用命令

```bash
just          # 列出可用命令
just dev      # 准备依赖并启动开发服务
just book     # 导出中英文完整教材与研究综述
just check    # 导出、数值/内容测试、类型检查、生产构建
just preview  # 构建后预览生产版本
```

生产文件生成在 `dist/`，预览默认使用 **http://127.0.0.1:4173/**。`vite preview` 用于本地验证构建结果，正式访问应由静态托管服务提供，参见 [Vite 官方部署说明](https://vite.dev/guide/static-deploy.html)。

## 怎样使用这份教程

第一次学习，从“数学准备”进入。每次完成一个单元的例子，先预测计算器的结果，再修改一个参数。接着打开“水泥决策工作台”，亲手提出一次设定值增量，区分动作、下层响应、即时软测量和晚到的化验。

进入每一章后，按“当前窑况 → 要回答的问题 → 符号表 → 分步推导 → 数字代入 → 为什么这样做 → 判断与反馈”阅读。步骤可以逐个切换，也可展开全部。理解了具体例子，再阅读同页后面的系统定义、算法、代码、练习与出处。判断题的每个选项都有解释，不会因为点过按钮就自动把章节标为完成。

已有神经网络基础的读者，可以较快完成函数逼近部分，把更多时间留给条件期望、价值自举、重要性采样、终止与截断、多种子评估。网页的“学习路线”提供 **6 周集中**与 **8 周稳步**两种安排，可以切换并导出清单。章节阅读时间与周计划均为学习估计，推导和编码需要额外时间。

### 先补齐的八块数学

| 单元 | 从哪个小例子进入 | 交互时真正计算什么 |
|---|---|---|
| 符号、时间与单位 | SP 为 880°C，动作 0.5 到底改变什么 | 归一化增量、物理增量、SP 与滞后的 PV |
| 条件概率 | 100 段记录中的原料难度与恢复事件 | 联合概率、全概率、失败后的 Bayes 后验 |
| 期望 | 成功得 3、失败得 −2，是否值得尝试 | 每种结果的概率贡献与决策翻转阈值 |
| 方差 | 均值相同的两组运行表现 | 方差、标准差和独立重复时的标准误 |
| 折扣 | 先付出代价，后面才有收益 | 有限回报、5 分钟周期下 1/2 小时后的尾部价值权重 |
| 梯度与链式法则 | 用一个参数预测价值 | 损失、导数、参数更新与大步长过冲 |
| log 概率 | 一段动作序列为什么可以逐项求导 | 概率乘积的 log、旧/新策略比率 |
| 连续概率密度 | 从高斯变量生成有界增量 | tanh Jacobian、归一化动作与物理动作密度 |

正文逐步区分随机变量与实现值、概率与频率、条件平均与因果效果、方差与不确定性、上升与下降、密度与概率。公式后保留数字代入与假设，不要求先背结论。

| 模块 | 章节 | 主要内容 | 阶段产出 |
|---|---|---|---|
| 01 交互、回报与探索 | 01–03 | Agent–Environment、折扣回报、老虎机、概率与期望 | 写清决策问题，手算期望与回报 |
| 02 MDP、价值与表格控制 | 04–08 | MDP/POMDP、Bellman、DP、MC/TD/n-step、SARSA/Q-learning | 独立实现小环境和表格控制 |
| 03 从 Q 表到深度价值学习 | 09–11 | 函数逼近、不稳定性、DQN、Double DQN | 解释回放、目标网络与最大化偏差 |
| 04 策略梯度、优势与 PPO | 12–15 | REINFORCE、Actor-Critic、GAE、重要性采样、TRPO/PPO | 算对正负优势下的裁剪目标 |
| 05 连续动作与 SAC | 16–18 | 高斯策略、tanh 密度、最大熵、SAC、选型 | 说清连续动作变换与算法适用条件 |
| 06 独立建模与可信实验 | 19–21 | Gymnasium、评估协议、烧成系统设定值决策 | 环境契约、基线、门控和实验设计 |
| 07 离线、模型与约束决策 | 22–24 | BC/TD3+BC/CQL/IQL、Dyna/MBPO/MOPO、CMDP | 一个窄问题的可复现研究方案 |

### 双语阅读、研究与图解

- **完整中英版本**：顶部语言选择器切换 `zh-CN` / `en`；数学准备、24 章正文与推导、研究专题、实验反馈、词典和工作台说明均有相应语言内容。
- **水泥案例推导器**：24 章各有独立情景、符号释义、逐步展开和选择反馈，共 154 个推导步骤；整章下载会包含全部步骤。
- **数学准备与计算器**：8 个单元从符号、概率到连续密度，参数变化立即重新计算。
- **烧成决策工作台**：点击工艺部位、提出三维增量、经过五层门控，观察 5 分钟过程推进、物料时滞和延迟化验。
- **九篇研究专题**：从运行指标决策史、目标与约束、进化优化到序列决策、网络架构、证据边界与六个可证伪研究问题；每篇有独立地址、公式和来源。
- **概念词典**：按概念、英文和工艺量搜索，用水泥案例解释 36 个术语与易混点。
- **完整章节阅读器**：章节目录、前后章导航、前置知识、KaTeX 公式、代码复制、练习答案和出处链接。
- **图解库**：按主题、形式和关键词查看 27 项图解。20 个 Mermaid 图保留可查看图源与 SVG 下载；7 幅原创插图由 4 幅新研究概念图和 3 幅原始课程导览图组成，附解释和关联页面。
- **资源库**：按主题、证据类型和关键词筛选 59 条资源，保留全部 77 个引用 ID 及关联章节、研究页；URL 去重不会丢失原引用关系。
- **搜索与筛选**：全局搜索覆盖正文、推导、数学准备、研究与词典，并优先匹配标题；课程目录支持模块与学习状态筛选。
- **学习完成状态与阅读偏好**：手动标记章节完成，切换浅色/深色主题、正文字号和界面语言；支持桌面侧栏与手机导航。

语言切换保留当前页面地址，并尝试恢复滚动位置；当前页面的实验、计算器和工作台会重新挂载，临时参数、运行轨迹及工作台时钟不承诺保留。需要比较同一实验时，先记录参数和种子，再切换语言重新运行。

当前版本仅把**章节完成状态、主题、字号和语言**写入当前站点来源下的 `localStorage`，键为 `rl-atlas-preferences-v2`。首次读取旧版数据时只提取这些仍受支持的字段；旧键 `rl-atlas-learning-v1` 不删除，旧笔记、收藏和上次阅读字段不恢复、不展示，也不回写。笔记、收藏、继续阅读及学习数据 JSON 导入/导出入口已移除；章节、教材和路线清单下载继续提供。不同域名、端口、浏览器或设备之间不会自动同步，清除站点数据会清除该浏览器保存的偏好与完成状态。

概念插图表达模块分工和直觉；其中的曲线、网络节点与工艺布局不代表测量结果、精确网络结构或工程设计图。定量关系以正文公式、数值实验和 Mermaid 图源为准。新的站点标识图标单独使用，不计入 27 项图解。

## 水泥烧成工作台怎样帮助理解 RL

工作台的三个动作依次为分解炉出口温度 Tc、二次风温 T₂、窑头压力 P 的归一化设定值增量。这是完整项目六个 CV 中的教学子集。它们按教学环境约定的 `[2°C, 5°C, 5Pa] / 5分钟` 速率缩放，再经过五层门控。下层控制的聚合效果用一阶动态表示；SP 可以马上改变，PV 只逐渐跟踪。

推荐先完成五次有明确问题的实验：

1. **一次动作是什么？** 稳定工况、seed 42、动作 `[1,0,0]`，执行一步。SP 从 880 到 882°C，但 PV 约为 880.468°C；读页面展开的数值计算。
2. **为什么反馈晚到？** 执行“单次脉冲 + 11 步保持”，再保持到 120 分钟。60 分钟采样的化验此时才发布；比较即时软测量、最新可用化验和主动打开的教学真值。
3. **拒绝动作之后会怎样？** 切换低氧、OOD 或 APC 未授权情景。SP 保持，物理过程和时钟继续变化。保持并不等于过程冻结。
4. **奖励高就可以吗？** 观察煤耗、电耗、动作平滑项及独立的质量/氧成本；用同起点、同外部扰动比较保持、手动候选和保守规则。
5. **窗口结束意味着什么？** 推进到 72 步。界面说明 `truncated=true, terminated=false`，联系 TD 的自举目标。

工作台明确区分候选动作、实际执行动作、真实动态和当时可用的信息。质量成本用教学真值评价，但策略输入不会读取未发布化验。保守规则没有训练；动态、噪声和采样时钟是明确列出的教学假设。完整公式、输入顺序、参数与复现实例见 [中文工作台模型说明](docs/kiln-workbench.md)和 [English model specification](docs/kiln-workbench.en.md)。

## 九篇研究专题怎样衔接已有工作

研究区位于 `#/research`，每篇专题通过 `#/research/<id>` 单独访问，两种语言使用相同 ID。

| ID | 专题 | 要回答的问题 |
|---|---|---|
| `history` | 从全厂控制到运行指标决策 | 上层决策、优化和下层跟踪控制怎样分工？ |
| `indicators` | 运行指标、权衡与因果混杂 | 煤耗、电耗、质量与稳定性怎样测量，相关关系为什么不足以证明动作效果？ |
| `objectives` | 从指标到目标、Pareto 与约束 | 量纲、聚合口径、偏好和可行性怎样写进数学问题？ |
| `evolution` | 进化优化与滚动轨迹 | 编码、Pareto 搜索、分解、约束比较和滚动执行分别做什么？ |
| `sequential` | MDP、POMDP 与 CMDP | 何时需要长期价值，历史信息和约束成本怎样进入目标？ |
| `architecture` | 网络与数据路径 | 编码器、策略、价值/成本网络与独立执行门控怎样连接？ |
| `evidence` | 证据地图 | 理论、仿真、第一方运行报告与本项目提案分别能支持什么主张？ |
| `open-problems` | 开放问题 | 模型误差、分布偏移、风险积累和统计证据有哪些尚未解决的边界？ |
| `agenda` | 六个可证伪研究问题 | 已有模块怎样变成有数据要求、基线、消融和失败判据的实验？ |

专题结合既有 OAM-Net、QC-MTWaveSME、NURBS 轨迹与 PG-MOEA/D-IEpsilon 的研究脉络，区分预测质量、预测动作后果、寻找候选轨迹和学习长期策略。候选动作与实际执行动作分别记录；离线支持、时间隔离、模型不确定性、质量/氧成本与回退都需要可核验的数据。Operator 与 PG-MOEA/D-IEpsilon 是需要接入和比较的基线，不是已完成的工业实验结果。

来源强度、数学边界与修订记录见 [研究来源核验](docs/research-review-v2.md)和 [独立数学审查](docs/review-mathematics-v2.md)。早期研究连接记录保留在 [research-connections.md](docs/research-connections.md)。

## 14 个实验到底计算了什么

所有随机演示使用可设种子的本地伪随机数生成器。显示数值来自当前实验计算；浏览器并未暗中运行一个完整深度强化学习训练后端。

| 实验 | 实际计算 | 重点观察 |
|---|---|---|
| 01 回报与概率直觉 | 有限奖励序列的折扣和、离散期望 | 即时奖励与长期回报的差别 |
| 02 多臂老虎机 | Bernoulli 环境中的 ε-greedy/UCB1 | 探索、累计收益与伪遗憾 |
| 03 Bellman 备份 | 两状态 MDP 的同步价值备份 | 策略评估与最优备份 |
| 04 网格世界 | 4×4 确定性环境的价值迭代 | 终点信息怎样传播 |
| 05 MC、TD 与 n-step | 同一轨迹上的不同目标 | 自举、采样长度与终止标志 |
| 06 SARSA 与 Q-learning | 4×12 悬崖环境中的表格训练 | 行为策略与目标策略的差别 |
| 07 回放与目标网络 | 标量 TD、抽样回放与周期目标复制 | 样本复用和目标滞后的机制 |
| 08 最大化偏差 | 高斯噪声下的 Monte Carlo 估计 | 用同一份噪声选择和评价的偏差 |
| 09 策略梯度 | 三动作 softmax 策略的 REINFORCE 更新 | 优势如何改变动作概率 |
| 10 GAE 优势估计 | TD 残差的反向递推 | γ、λ 与两种边界 mask |
| 11 PPO-Clip | 正负优势下的精确裁剪目标 | 目标的平台与未被硬限制的概率比 |
| 12 连续策略与最大熵 | 高斯/tanh 密度、熵及固定策略目标 | 密度修正、缩放和温度 |
| 13 多种子实验 | 多次老虎机运行与种子级区间估计 | 一条好曲线和整体证据的差别 |
| 14 工业安全门推演 | 本地五层判断和零增量回退 | 拒绝原因、约束成本与候选动作 |

回放实验是标量模型，不能用来证明完整 DQN 的表现；连续策略实验计算固定策略的目标，**没有训练 SAC Actor/Critic**。安全门实验抽取单一归一化 CV 演示逻辑，教学幅值不替代正式工业环境的状态、动作或阈值契约。详细说明见 [实验实现与边界](docs/labs.md)。

## Python 配套：从算式走到可运行代码

这些文件可以从教程正文下载，也可以直接在仓库运行。前两个脚本只依赖 Python 标准库；第三个脚本需要 Gymnasium 和 NumPy。它们独立于网页，不影响前端启动。

```bash
python public/code/tabular_foundations.py --method q_learning --seed 42
python public/code/tabular_foundations.py --method sarsa --seed 42
python public/code/advanced_math_checks.py
```

| 文件 | 用途 |
|---|---|
| [`tabular_foundations.py`](public/code/tabular_foundations.py) | 网格转移、价值迭代与可复现的 Q-learning/SARSA 小实验 |
| [`advanced_math_checks.py`](public/code/advanced_math_checks.py) | GAE 递推、截断边界、PPO 正负优势与 tanh 密度的断言检查 |
| [`advanced_toy_env.py`](public/code/advanced_toy_env.py) | Gymnasium 五元组接口、归一化设定值增量、继续任务截断和简单反馈基线 |

在项目已有 Python 环境中安装第三个脚本的依赖：

```bash
python -m pip install -r public/code/requirements.txt
python public/code/advanced_toy_env.py
```

教学环境没有工业单位、质量模型、能耗模型或设备连接。其推演结果不能当作水泥系统的节能证据。依赖说明与已验证版本见 [进阶研究记录](docs/advanced-research.md)。

## 中英文完整 Markdown 教程与研究综述

网页和长文共用数学单元、章节、逐步推导、研究专题与词典数据。修改内容后运行：

```bash
npm run export:book
```

一次导出生成六个文件：

| 内容 | 中文 | English |
|---|---|---|
| 仓库内完整教材 | [docs/rl-atlas-tutorial.md](docs/rl-atlas-tutorial.md) | [docs/rl-atlas-tutorial.en.md](docs/rl-atlas-tutorial.en.md) |
| 网站下载用完整教材 | [public/rl-atlas-tutorial.md](public/rl-atlas-tutorial.md) | [public/rl-atlas-tutorial.en.md](public/rl-atlas-tutorial.en.md) |
| 独立研究综述 | [public/code/research-review.md](public/code/research-review.md) | [public/code/research-review.en.md](public/code/research-review.en.md) |

完整教材包含 24 章正文、8 个数学单元、全部 154 步推导及判断反馈、练习答案、9 篇研究、词典与对应语言的工作台模型附录。导出保留公式、代码、Mermaid 图源、研究概念图说明和来源 ID 映射；综述单独包含完整九篇研究内容。复制到其他位置阅读时，应一并保留相对路径所引用的图片和代码文件。阅读器需要支持数学与 Mermaid 渲染。

这些文件由结构化内容生成，不应直接修改。`npm run build` 只做类型检查与前端构建；`just build`、`just check` 会先更新导出。导出命令不会训练模型或调用付费服务。

## 静态托管与 GitHub Pages

项目采用 hash 路由与 `base: './'`。章节路径位于 URL 的 `#` 之后，静态服务器无需配置应用路由重写；资源使用相对路径，可以放在域名根路径或仓库子路径下。请通过 HTTP(S) 访问构建产物，直接双击 HTML 并不等同于运行静态站点。

### 通用静态托管配置

| 设置项 | 值 |
|---|---|
| 项目根目录 | `rl-learning-web` |
| Node 版本 | `22.12.0` 或更新版本 |
| 安装命令 | `npm ci` |
| 构建命令 | `npm run export:book && npm run build` |
| 输出目录 | `dist` |
| 后端启动命令 | 无 |
| 环境变量 / API Key | 无 |

### GitHub Pages 发布步骤

1. 在仓库 **Settings → Pages** 中选择 **GitHub Actions** 作为发布来源。
2. 使用 [GitHub Pages 官方工作流模板](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)创建工作流，并加入 Node 安装与构建步骤。
3. 将 npm 命令的工作目录设为 `rl-learning-web`，缓存锁文件设为 `rl-learning-web/package-lock.json`；依次执行 `npm ci`、`npm run export:book`、`npm test` 和 `npm run build`。
4. Pages 上传步骤的路径设为 **`rl-learning-web/dist`**，再由部署步骤发布该 artifact。部署 job 需要官方文档要求的 Pages/OIDC 权限与 `github-pages` environment。
5. 查看工作流实际返回的部署地址，并在该地址检查首页、章节刷新、图片和公式。只有部署成功后才存在可用的线上站点。

本目录提供可发布的源代码与静态构建方式；README 中的发布步骤不表示仓库已经启用 Pages 或完成线上部署。

## 技术结构与维护

| 位置 | 职责 |
|---|---|
| `src/content/foundations.ts` | 第 01–12 章与基础来源 |
| `src/content/advanced.ts` | 第 13–24 章与进阶来源 |
| `src/content/*-guides.ts` | 24 章水泥情景、分步推导、数字例子和判断反馈 |
| `src/content/primer.ts` / `glossary.ts` | 中文数学准备与概念词典 |
| `src/content/en/` | 完整英文正文、推导、数学准备、词典、模块与来源说明 |
| `src/i18n.ts` / `src/content/localized.ts` | 语言注册、UI 文案、内容 bundle 加载与切换 |
| `src/research/` | 九篇双语研究专题、来源、类型与页面组件 |
| `src/figures.ts` / `src/source-catalogue.ts` / `src/catalogue.ts` | 图解数据、保留引用 ID 的资源去重、分类与搜索界面 |
| `src/learning.ts` / `src/learning.css` | 推导阅读器、数学单元、词典和教学组件 |
| `src/primer-math.ts` / `src/primer-calculators.ts` | 数学计算内核与交互计算器 |
| `src/kiln/` | 烧成教学模型、工作台和响应式布局 |
| `src/content/index.ts` | 模块、章节与来源汇总 |
| `src/labs/` | 纯数值内核、实验界面与实验样式 |
| `src/render.ts` | Markdown 清洗、KaTeX、Mermaid 与代码工具 |
| `src/storage.ts` | 版本 2 的章节完成状态、主题、字号与语言 |
| `src/main.ts` / `src/style.css` / `src/atlas.css` / `src/ui.ts` | 页面路由、橙色主题、界面与响应式设计 |
| `public/images/` | 七幅本地 WebP 概念插图与独立站点标识 |
| `public/code/` | 可下载 Python 教学脚本与中英文研究综述 |
| `scripts/export-book.ts` | 从规范内容生成两种语言的完整教材与综述 |
| `justfile` / `scripts/ensure-deps.mjs` | 一键启动、依赖就绪检查与常用开发命令 |
| `tests/` | 数值行为、课程完整性、公式、Mermaid 与资源链接验证 |
| `docs/` | 教学设计、资料核验、配图来源与完整长文 |

应用使用 Vite + TypeScript，复用 Marked、DOMPurify、KaTeX、Mermaid 和 Lucide。Mermaid 使用 strict 安全模式，正文经过清洗；插图、图标、字体样式与数学资源由本地构建提供。网页没有接入第三方分析、AI 聊天接口或生产设备。

修改课程时，保持章节 ID、模块映射、实验 ID 与来源 ID 一致，并同步相应英文内容。新增实验时先明确它实际计算的对象，再添加对应数值验证；不要用预设曲线冒充训练结果。修改公式后应检查两种语言的正文渲染与完整导出。扩展语言需要补齐内容 bundle、研究正文、交互与 UI 文案，以及对应导出；仅添加语言下拉选项不会形成完整的新版本，详见 [i18n 维护说明](docs/i18n.md)。

### 验证命令

```bash
npm run export:book
npm run typecheck
npm test
npm run build
```

浏览器交互和响应式布局另行通过实际页面验收，本轮步骤、结果和截图见[双语改版验证记录](docs/verification-v2.md)。`npm test` 运行数值与内容检查，不会启动浏览器；它不替代页面交互验收。

## 工业案例的边界

教程第 21 章衔接仓库的烧成系统研究：策略输出有界 CV 设定值增量，保留下层 DCS/PID/APC、历史窗口、软测量、化验年龄、约束成本与五层安全门控。具体阈值来自[项目领域约定](../AGENTS.md)，不是通用工程标准。

当前交付不包含真实生产日志、世界模型权重、完整工业训练管线或 PG-MOEA/D-IEpsilon 原实现。因此课程没有编造工业基线结果，也没有宣称已训练出可现场执行的 PPO/SAC 策略。实验和图示用于理解机制；工业研究的下一步是接入可追溯数据、正式环境和原始基线，再按固定协议开展推演评估。

## 来源与设计说明

- [教程设计与推文分析](docs/tutorial-design.md)
- [研究插图与新标识的来源及完整提示词](docs/illustrations-v2.md)
- [原始三幅课程导览图的来源与提示词摘要](docs/illustrations.md)
- [基础资料核验](docs/foundations-research.md)
- [进阶资料核验](docs/advanced-research.md)
- [内容独立复核记录](docs/content-review.md)
- [14 个实验的实现范围](docs/labs.md)
- [水泥工作台的模型与实验](docs/kiln-workbench.md)
- [基础推导补充记录](docs/foundations-kiln-notes.md)
- [研究方向与论文核验](docs/research-connections.md)
- [本次数学与推导独立审阅](docs/learning-review.md)
- [九篇研究专题的来源核验](docs/research-review-v2.md)
- [双语版本研究数学独立审查](docs/review-mathematics-v2.md)
- [基础内容英文翻译核验](docs/translation-foundations.md)
- [进阶内容英文翻译核验](docs/translation-advanced.md)
- [双语架构、持久化与扩展语言](docs/i18n.md)
- [双语改版验证结果与页面截图](docs/verification-v2.md)
- [初版验证记录](docs/verification.md)

主线教材为 [Sutton & Barto《Reinforcement Learning: An Introduction》](https://incompleteideas.net/book/the-book-2nd.html)，算法部分结合 [PPO](https://arxiv.org/abs/1707.06347)、[SAC](https://arxiv.org/abs/1801.01290)、[CQL](https://arxiv.org/abs/2006.04779)、[IQL](https://arxiv.org/abs/2110.06169)等原论文，以及 [Gymnasium](https://gymnasium.farama.org/) 和 [Stable-Baselines3](https://stable-baselines3.readthedocs.io/)官方资料。每章保留相应的具体出处。
