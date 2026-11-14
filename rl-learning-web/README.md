# RL Atlas · 从反馈中，学会决策

一份可以阅读、推导、操作实验并保存学习记录的中文强化学习教程。课程从交互与概率直觉出发，走过 Bellman 方程、表格控制、DQN、PPO 和 SAC，再进入独立建模、离线学习与流程工业设定值决策。

**7 个模块 · 24 章完整内容 · 14 个浏览器实验 · 36 条来源记录（35 个独立链接） · 3 幅原创介绍图**

![RL Atlas 原创课程总览插图](public/images/journey.webp)

教程沿用原推文“问题 → 数学 → 算法 → 代码 → 实验”的教学思路，正文、例题、实验和介绍图均为本项目重新组织与创作。参考资料以教材、算法原论文和官方实现文档为主；原文广告、付费内容和配图未作为网站资源重新发布。

## 快速运行

需要 **Node.js 22.12.0 或更新版本**以及 npm。以下命令从仓库根目录开始：

```bash
cd rl-learning-web
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 **http://127.0.0.1:5173/**。如果端口已占用，以 Vite 实际输出为准。

前端使用本地安装的依赖，不需要 API Key、账户、数据库或 Python 环境。开发与预览服务默认仅监听本机地址。

### 构建与预览

```bash
npm run typecheck
npm test
npm run export:book
npm run build
npm run preview
```

生产文件生成在 `dist/`，预览默认使用 **http://127.0.0.1:4173/**。`vite preview` 用于本地验证构建结果，正式访问应由静态托管服务提供，参见 [Vite 官方部署说明](https://vite.dev/guide/static-deploy.html)。

## 怎样使用这份教程

第一次学习，按首页的七个模块顺序推进。每章先读“这一章要学会什么”，写下一个直觉解释，再手算正文例子，最后进入关联实验。做完练习后展开答案，检查自己错在概念、计算还是边界条件。

已有神经网络基础的读者，可以较快完成函数逼近部分，把更多时间留给条件期望、价值自举、重要性采样、终止与截断、多种子评估。网页的“学习路线”提供 **6 周集中**与 **8 周稳步**两种安排，可以切换并导出清单。章节阅读时间与周计划均为学习估计，推导和编码需要额外时间。

| 模块 | 章节 | 主要内容 | 阶段产出 |
|---|---|---|---|
| 01 交互、回报与探索 | 01–03 | Agent–Environment、折扣回报、老虎机、概率与期望 | 写清决策问题，手算期望与回报 |
| 02 MDP、价值与表格控制 | 04–08 | MDP/POMDP、Bellman、DP、MC/TD/n-step、SARSA/Q-learning | 独立实现小环境和表格控制 |
| 03 从 Q 表到深度价值学习 | 09–11 | 函数逼近、不稳定性、DQN、Double DQN | 解释回放、目标网络与最大化偏差 |
| 04 策略梯度、优势与 PPO | 12–15 | REINFORCE、Actor-Critic、GAE、重要性采样、TRPO/PPO | 算对正负优势下的裁剪目标 |
| 05 连续动作与 SAC | 16–18 | 高斯策略、tanh 密度、最大熵、SAC、选型 | 说清连续动作变换与算法适用条件 |
| 06 独立建模与可信实验 | 19–21 | Gymnasium、评估协议、烧成系统设定值决策 | 环境契约、基线、门控和实验设计 |
| 07 离线、模型与约束决策 | 22–24 | BC/TD3+BC/CQL/IQL、Dyna/MBPO/MOPO、CMDP | 一个窄问题的可复现研究方案 |

### 阅读与记录功能

- **完整章节阅读器**：章节目录、前后章导航、前置知识、KaTeX 公式、代码复制、练习答案和出处链接。
- **知识关系图**：Mermaid 渲染，支持查看图源和下载 SVG；算法与工艺流程由可编辑图源表达。
- **搜索与筛选**：按标题、正文和标签搜索，课程目录支持模块与学习状态筛选。
- **学习记录**：完成状态、上次阅读章节、章节收藏与笔记保存在当前浏览器。
- **备份与迁移**：笔记可导出 Markdown；学习数据可导出 JSON 后导入其他浏览器。导入合并完成状态和收藏；同一章已有不同笔记时保留当前浏览器版本，并提示冲突数量。
- **阅读偏好**：浅色/深色主题、正文字号切换、桌面侧栏与手机导航。
- **配图图册**：展示与下载三幅原创概念介绍图。

学习记录使用当前站点来源下的 `localStorage`，不同域名、端口、浏览器或设备之间不会自动同步。需要迁移时使用导出/导入功能；清除站点数据会清除该浏览器的记录。应用不包含云端笔记服务。

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

## 完整 Markdown 教程

网页和长文共用同一份章节数据。修改章节后运行：

```bash
npm run export:book
```

导出结果为 [`docs/rl-atlas-tutorial.md`](docs/rl-atlas-tutorial.md) 和面向网站下载的 `public/rl-atlas-tutorial.md`。Markdown 保留章节内容、公式、练习与 Mermaid 图源；阅读器需要支持相应的数学与 Mermaid 渲染。导出命令不会训练模型或调用付费服务。

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
3. 将 npm 命令的工作目录设为 `rl-learning-web`，缓存锁文件设为 `rl-learning-web/package-lock.json`；依次执行 `npm ci`、`npm test`、`npm run export:book` 和 `npm run build`。
4. Pages 上传步骤的路径设为 **`rl-learning-web/dist`**，再由部署步骤发布该 artifact。部署 job 需要官方文档要求的 Pages/OIDC 权限与 `github-pages` environment。
5. 查看工作流实际返回的部署地址，并在该地址检查首页、章节刷新、图片和公式。只有部署成功后才存在可用的线上站点。

本目录提供可发布的源代码与静态构建方式；README 中的发布步骤不表示仓库已经启用 Pages 或完成线上部署。

## 技术结构与维护

| 位置 | 职责 |
|---|---|
| `src/content/foundations.ts` | 第 01–12 章与基础来源 |
| `src/content/advanced.ts` | 第 13–24 章与进阶来源 |
| `src/content/index.ts` | 模块、章节与来源汇总 |
| `src/labs/` | 纯数值内核、实验界面与实验样式 |
| `src/render.ts` | Markdown 清洗、KaTeX、Mermaid 与代码工具 |
| `src/storage.ts` | 带版本校验的浏览器学习状态 |
| `src/main.ts` / `src/style.css` | 页面路由、阅读体验和响应式设计 |
| `public/images/` | 三幅本地 WebP 原创介绍图 |
| `public/code/` | 可下载的 Python 教学脚本 |
| `scripts/export-book.ts` | 将结构化章节导出为完整 Markdown |
| `tests/` | 数值行为、课程完整性、公式、Mermaid 与资源链接验证 |
| `docs/` | 教学设计、资料核验、配图来源与完整长文 |

应用使用 Vite + TypeScript，复用 Marked、DOMPurify、KaTeX、Mermaid 和 Lucide。Mermaid 使用 strict 安全模式，正文经过清洗；插图、图标、字体样式与数学资源由本地构建提供。网页没有接入第三方分析、AI 聊天接口或生产设备。

修改课程时，保持章节 ID、模块映射、实验 ID 与来源 ID 一致。新增实验时先明确它实际计算的对象，再添加对应数值验证；不要用预设曲线冒充训练结果。修改公式后应检查正文渲染与完整教程导出。

### 验证命令

```bash
npm run typecheck
npm test
npm run build
```

浏览器交互和响应式布局另行通过实际页面验收，步骤、结果和截图见[验证记录](docs/verification.md)。`npm test` 运行数值与内容检查，不会启动浏览器；它不替代页面交互验收。

## 工业案例的边界

教程第 21 章衔接仓库的烧成系统研究：策略输出有界 CV 设定值增量，保留下层 DCS/PID/APC、历史窗口、软测量、化验年龄、约束成本与五层安全门控。具体阈值来自[项目领域约定](../AGENTS.md)，不是通用工程标准。

当前交付不包含真实生产日志、世界模型权重、完整工业训练管线或 PG-MOEA/D-IEpsilon 原实现。因此课程没有编造工业基线结果，也没有宣称已训练出可现场执行的 PPO/SAC 策略。实验和图示用于理解机制；工业研究的下一步是接入可追溯数据、正式环境和原始基线，再按固定协议开展推演评估。

## 来源与设计说明

- [教程设计与推文分析](docs/tutorial-design.md)
- [三幅原创介绍图与提示词摘要](docs/illustrations.md)
- [基础资料核验](docs/foundations-research.md)
- [进阶资料核验](docs/advanced-research.md)
- [内容独立复核记录](docs/content-review.md)
- [14 个实验的实现范围](docs/labs.md)
- [验证结果与页面截图](docs/verification.md)

主线教材为 [Sutton & Barto《Reinforcement Learning: An Introduction》](https://incompleteideas.net/book/the-book-2nd.html)，算法部分结合 [PPO](https://arxiv.org/abs/1707.06347)、[SAC](https://arxiv.org/abs/1801.01290)、[CQL](https://arxiv.org/abs/2006.04779)、[IQL](https://arxiv.org/abs/2110.06169)等原论文，以及 [Gymnasium](https://gymnasium.farama.org/) 和 [Stable-Baselines3](https://stable-baselines3.readthedocs.io/)官方资料。每章保留相应的具体出处。
