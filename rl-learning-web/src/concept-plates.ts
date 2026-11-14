/** Original generated plates. Exact semantics remain selectable outside each raster. */
import { getLocale, type Locale, type Localized } from './i18n';
import { imageLocaleDirectory, illustrationImage, translatedIllustrationIds } from './image-locales';
import { mapMarkdownProse } from './markdown-prose';

export type FigureTopic = 'foundations' | 'algorithms' | 'process' | 'optimization' | 'architecture' | 'orientation';
export const conceptPlateIds = [
  "chapter-01-diagram-1",
  "chapter-04-diagram-1",
  "chapter-09-diagram-1",
  "chapter-12-diagram-1",
  "chapter-13-diagram-1",
  "chapter-15-diagram-1",
  "chapter-17-diagram-1",
  "chapter-18-diagram-1",
  "chapter-21-diagram-1",
  "chapter-22-diagram-1",
  "chapter-23-diagram-1",
  "research-history-diagram-1",
  "research-indicators-diagram-1",
  "research-objectives-diagram-1",
  "research-evolution-diagram-1",
  "research-sequential-diagram-1",
  "research-architecture-diagram-1",
  "research-evidence-diagram-1",
  "research-open-problems-diagram-1",
  "research-agenda-diagram-1",
  "roadmap-learning"
] as const;
export type ConceptPlateId = typeof conceptPlateIds[number];
export interface ConceptPlate {
  id: ConceptPlateId;
  topic: FigureTopic;
  title: Localized<string>;
  alt: Localized<string>;
  explanation: Localized<string>;
  href: string;
  keywords: readonly string[];
  regions: readonly { label: Localized<string>; description: Localized<string> }[];
  relationship: Localized<string>;
}
export const conceptPlates: readonly ConceptPlate[] = [
  {
    "id": "chapter-01-diagram-1",
    "topic": "foundations",
    "title": {
      "zh-CN": "交互闭环：从行动到反馈",
      "en": "The interaction loop: action and feedback"
    },
    "alt": {
      "zh-CN": "紧凑交互闭环，呈现观测、策略动作、环境演化、奖励与新观测，以及用于学习的轨迹。",
      "en": "A compact loop connects observation, policy action, environment response, reward and next observation, with a trajectory used for learning."
    },
    "explanation": {
      "zh-CN": "沿着观测、策略、过程响应和反馈读一圈，区分单步奖励与长期目标。结束一次教学轨迹不等于工业系统真正终止。",
      "en": "Follow observation, policy, process response and feedback. Distinguish immediate reward from the long-term objective; ending a teaching rollout is not necessarily physical termination."
    },
    "href": "#/chapter/01",
    "keywords": [
      "智能体",
      "环境",
      "回报",
      "折扣因子",
      "从一次行动，到长期回报",
      "01",
      "The interaction loop: action and feedback",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "观测与动作",
          "en": "Observation and action"
        },
        "description": {
          "zh-CN": "策略依据决策时可用的信息选择动作；观测与环境的完整内部状态不必相同。",
          "en": "The policy chooses from information available at decision time. An observation need not reveal the complete internal state."
        }
      },
      {
        "label": {
          "zh-CN": "过程与反馈",
          "en": "Response and feedback"
        },
        "description": {
          "zh-CN": "环境先执行一步演化，再返回该行动之后的奖励和新观测；回报还包含后续奖励。",
          "en": "The environment advances before returning the subsequent reward and observation. Return includes later rewards as well."
        }
      },
      {
        "label": {
          "zh-CN": "轨迹与学习",
          "en": "Trajectory and learning"
        },
        "description": {
          "zh-CN": "交互记录可以供策略或价值学习使用；是否等待完整轨迹由算法决定。",
          "en": "Interaction records support policy or value learning. Whether a complete trajectory is required depends on the algorithm."
        }
      }
    ],
    "relationship": {
      "zh-CN": "读取观测 → 选择动作 → 环境推进 → 接收反馈 → 下一次决策。真正的任务终止与教学轨迹截断必须区分；持续过程在时间上限后仍保留价值自举。图中的学习回路不规定所有算法只能在终止后更新。",
      "en": "Read observation → choose action → advance the environment → receive feedback → decide again. Distinguish genuine termination from a teaching time limit; a continuing process retains value bootstrapping at truncation. The learning loop does not require every algorithm to update only after termination."
    }
  },
  {
    "id": "chapter-04-diagram-1",
    "topic": "foundations",
    "title": {
      "zh-CN": "MDP 与 POMDP：信息先于状态建模",
      "en": "MDPs and POMDPs: information before state design"
    },
    "alt": {
      "zh-CN": "两种状态表示路径：当期观测近似充分时直接构造状态，存在隐藏过程或延迟时加入历史与估计，再共同定义环境契约。",
      "en": "Two state-design paths use either approximately sufficient observations or history and estimation for hidden dynamics and delays, then share an environment contract."
    },
    "explanation": {
      "zh-CN": "从当时可获得的信息判断状态是否充分；有延迟或隐变量时引入历史与状态估计，再定义动作、奖励和截断语义。",
      "en": "Check whether information available at the time is sufficient. Add history or state estimation for delays and hidden variables, then define actions, rewards and truncation semantics."
    },
    "href": "#/chapter/04",
    "keywords": [
      "MDP",
      "POMDP",
      "状态设计",
      "Gymnasium",
      "MDP 与 POMDP：先把问题写对",
      "04",
      "MDPs and POMDPs: information before state design",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "可用信息",
          "en": "Available information"
        },
        "description": {
          "zh-CN": "先定义业务问题和决策周期，只列出当时已经到达的测量、动作历史与化验。",
          "en": "Define the operating problem and decision interval, then list only measurements, action history and assays that have arrived."
        }
      },
      {
        "label": {
          "zh-CN": "两种表示路径",
          "en": "Two representation paths"
        },
        "description": {
          "zh-CN": "当前观测近似充分时可用状态表示；存在隐变量或延迟时需要历史、信念或估计。",
          "en": "Use a state representation when current observations are approximately sufficient; otherwise consider history, beliefs or state estimates."
        }
      },
      {
        "label": {
          "zh-CN": "共同环境契约",
          "en": "A shared environment contract"
        },
        "description": {
          "zh-CN": "随后明确动作界、奖励、独立成本以及 terminated/truncated，并在模拟环境检查接口。",
          "en": "Then specify action bounds, reward, separate costs and terminated/truncated, and check the interface in simulation."
        }
      }
    ],
    "relationship": {
      "zh-CN": "充分性判断决定表示路径，两条路径汇合到相同的环境定义。加入历史或神经编码并不自动获得 Markov 性；随机策略检查仅限教学模拟，不能解释为真实窑上的探索。",
      "en": "The sufficiency question selects a representation path; both paths join the same environment definition. History or neural encoding does not automatically establish the Markov property. Random-policy checks belong only in teaching simulation, never exploration on a physical kiln."
    }
  },
  {
    "id": "chapter-09-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "价值学习的不稳定因素与缓解机制",
      "en": "Instability in value learning and its mitigations"
    },
    "alt": {
      "zh-CN": "函数逼近、自举和离策略数据共同影响误差反馈，旁列经验回放、目标网络及独立评价的不同作用。",
      "en": "Function approximation, bootstrapping and off-policy data interact in an error-feedback system, alongside replay, target networks and independent evaluation."
    },
    "explanation": {
      "zh-CN": "函数逼近、自举和离策略学习会相互作用。回放与目标网络缓解不同问题，仍需检查价值尺度和独立评估。",
      "en": "Function approximation, bootstrapping and off-policy learning interact. Replay and target networks address different problems; value scales and independent evaluation still need attention."
    },
    "href": "#/chapter/09",
    "keywords": [
      "函数逼近",
      "神经网络",
      "Deadly Triad",
      "函数逼近：从 Q 表到共享参数",
      "09",
      "Instability in value learning and its mitigations",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "三种相互作用",
          "en": "Three interacting ingredients"
        },
        "description": {
          "zh-CN": "共享参数让一次更新影响多个状态；自举依赖已有预测；离策略数据来自不同的行为策略。",
          "en": "Shared parameters couple states, bootstrap targets depend on predictions, and off-policy data come from another behaviour policy."
        }
      },
      {
        "label": {
          "zh-CN": "回放与目标网络",
          "en": "Replay and target networks"
        },
        "description": {
          "zh-CN": "回放重用并打散部分时序相关样本；缓慢变化的目标网络减少目标快速漂移。",
          "en": "Replay reuses samples and reduces some temporal correlation; a slowly changing target network reduces rapid target drift."
        }
      },
      {
        "label": {
          "zh-CN": "诊断与评价",
          "en": "Diagnostics and evaluation"
        },
        "description": {
          "zh-CN": "价值尺度、训练诊断和独立评价用于发现不稳定，不能只看训练损失下降。",
          "en": "Inspect value scales, training diagnostics and independent evaluation rather than relying on decreasing training loss alone."
        }
      }
    ],
    "relationship": {
      "zh-CN": "三种因素的组合可能形成不稳定反馈，并非每次组合都会发散。回放和目标网络针对不同机制，既不移除所有离策略问题，也不构成收敛或工业安全保证。",
      "en": "The combination can create unstable feedback; it does not imply inevitable divergence. Replay and target networks address different mechanisms. Neither removes all off-policy problems or guarantees convergence or industrial safety."
    }
  },
  {
    "id": "chapter-12-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "REINFORCE：用回报与基线形成更新信号",
      "en": "REINFORCE: returns, baselines and policy updates"
    },
    "alt": {
      "zh-CN": "策略采样轨迹后计算每步未来回报，减去状态基线形成权重，再更新动作的对数概率。",
      "en": "A policy samples a trajectory, computes reward-to-go, subtracts a state baseline and updates action log probabilities."
    },
    "explanation": {
      "zh-CN": "先采样轨迹，再计算 reward-to-go 与 baseline，最后用优势加权动作 log 概率。注意采样分布与更新目标之间的联系。",
      "en": "Sample a trajectory, compute reward-to-go and a baseline, then weight action log probabilities. Track the link between the sampling distribution and the update objective."
    },
    "href": "#/chapter/12",
    "keywords": [
      "策略梯度",
      "REINFORCE",
      "Baseline",
      "REINFORCE：直接学习行动的概率",
      "12",
      "REINFORCE: returns, baselines and policy updates",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "采样与回报",
          "en": "Sampling and returns"
        },
        "description": {
          "zh-CN": "从当前策略采样完整任务轨迹，再为每个时间步计算 reward-to-go。",
          "en": "Sample a complete task trajectory under the current policy and compute reward-to-go for every time step."
        }
      },
      {
        "label": {
          "zh-CN": "基线与权重",
          "en": "Baseline and weights"
        },
        "description": {
          "zh-CN": "减去不依赖当次动作的状态基线；相对基线的好坏改变概率更新的方向。",
          "en": "Subtract a state baseline independent of the sampled action; performance relative to it determines the update direction."
        }
      },
      {
        "label": {
          "zh-CN": "概率与学习",
          "en": "Probability and learning"
        },
        "description": {
          "zh-CN": "用减去基线后的优势估计加权动作 log 概率；状态 Critic 可学习该基线，但承担不同于策略的目标。",
          "en": "Weight action log probabilities by the advantage estimate: return minus baseline. A state critic may learn that baseline with its own objective."
        }
      }
    ],
    "relationship": {
      "zh-CN": "采样 → reward-to-go → 减基线 → 加权 log 概率 → 更新策略 → 再采样。对于正文采用的从初始时刻起折扣目标，时间权重 γᵗ 不可遗漏；合适的状态基线可以降低梯度估计方差，但不能替代回报定义。",
      "en": "Sample → reward-to-go → subtract baseline → weight log probabilities → update policy → sample again. For the discounted start-state objective in the text, retain the time weight γᵗ. A suitable state baseline can reduce gradient-estimator variance without replacing the definition of return."
    }
  },
  {
    "id": "chapter-13-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "Actor–Critic：共享轨迹，区分两种目标",
      "en": "Actor–critic: one batch, two learning objectives"
    },
    "alt": {
      "zh-CN": "共享轨迹分别进入 Actor 与 Critic 两栏；Critic 的价值估计进入 TD/GAE 信号区，再为 Actor 学习提供信号。",
      "en": "Shared trajectories enter separate actor and critic columns. Critic value estimates feed a TD/GAE signal region, which supplies the actor learning signal."
    },
    "explanation": {
      "zh-CN": "Actor 决定动作分布，Critic 估计价值；它们交换的是学习信号，不是彼此可以无条件替代的目标。",
      "en": "The actor defines the action distribution and the critic estimates value. They exchange learning signals while serving different objectives."
    },
    "href": "#/chapter/13",
    "keywords": [
      "Actor-Critic",
      "优势函数",
      "GAE",
      "Actor-Critic 与 GAE",
      "13",
      "Actor–critic: one batch, two learning objectives",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "残差输入",
          "en": "Residual inputs"
        },
        "description": {
          "zh-CN": "Critic 价值、奖励和真正终止信息共同决定 TD 残差；截断处可能仍需末观测价值。",
          "en": "Critic values, rewards and genuine termination flags determine TD residuals. A truncation can still require the final-observation value."
        }
      },
      {
        "label": {
          "zh-CN": "GAE 累加",
          "en": "GAE accumulation"
        },
        "description": {
          "zh-CN": "沿连续轨迹递推加权残差；bootstrap mask 与 trace mask 的职责不同。",
          "en": "Accumulate weighted residuals along a continuous trajectory. Bootstrap masks and trace masks have distinct roles."
        }
      },
      {
        "label": {
          "zh-CN": "两种损失",
          "en": "Two losses"
        },
        "description": {
          "zh-CN": "Actor 使用停止梯度的优势权重；Critic 拟合固定的价值目标，不能把两种目标混成一个。",
          "en": "The actor uses detached advantage weights; the critic fits a fixed value target. These objectives are not interchangeable."
        }
      }
    ],
    "relationship": {
      "zh-CN": "同批奖励与价值 → TD 残差 → GAE → Actor 更新，以及 GAE + 旧价值 → Critic 目标。真正终止关闭 bootstrap；时间截断保留适当 bootstrap，但批次或轨迹边界不能跨越重置串接 trace。",
      "en": "Batch rewards and values → TD residuals → GAE → actor update; GAE plus the old value → critic target. True termination stops bootstrapping. Time truncation retains appropriate bootstrapping, while trace recursion must not cross a reset or unrelated trajectory boundary."
    }
  },
  {
    "id": "chapter-15-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "PPO：冻结采样批次与有限轮策略更新",
      "en": "PPO: a frozen rollout batch and limited updates"
    },
    "alt": {
      "zh-CN": "外圈为冻结策略、采集轨迹与构造 GAE；内圈为 minibatch 优化、KL 检查和有限轮数停止，然后开始下一批采样。",
      "en": "An outer cycle freezes collection, gathers trajectories and computes GAE; an inner loop updates minibatches with KL monitoring and a finite epoch budget."
    },
    "explanation": {
      "zh-CN": "冻结旧策略采样数据，构造优势与概率比，再进行有限轮更新。裁剪约束的是代理目标，不能解释为每个动作的硬执行界。",
      "en": "Freeze the behaviour policy, construct advantages and probability ratios, then perform limited update epochs. Clipping shapes a surrogate objective; it is not a hard execution bound on each action."
    },
    "href": "#/chapter/15",
    "keywords": [
      "PPO",
      "Clipping",
      "策略优化",
      "把 PPO 的裁剪目标拆开",
      "15",
      "PPO: a frozen rollout batch and limited updates",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "固定行为策略",
          "en": "Fixed behaviour policy"
        },
        "description": {
          "zh-CN": "本批数据由冻结的旧策略采样，并保存旧 log 概率，作为概率比的分母。",
          "en": "Collect the batch with a frozen old policy and retain old log probabilities for the probability-ratio denominator."
        }
      },
      {
        "label": {
          "zh-CN": "有限 minibatch 更新",
          "en": "Limited minibatch updates"
        },
        "description": {
          "zh-CN": "计算优势和价值目标，打乱样本，优化裁剪策略目标与独立价值损失。",
          "en": "Compute advantages and value targets, shuffle samples, and optimize the clipped policy surrogate and separate value loss."
        }
      },
      {
        "label": {
          "zh-CN": "停止与再采样",
          "en": "Stop and collect again"
        },
        "description": {
          "zh-CN": "达到更新轮数，或采用的 KL 诊断触发停止条件时，结束本批并采集新数据。",
          "en": "Finish the batch at the epoch budget or an adopted KL stopping criterion, then collect fresh data."
        }
      }
    ],
    "relationship": {
      "zh-CN": "外圈更新采样分布，内圈只有限重用同一批轨迹。PPO 的 min 目标按优势正负产生不同平台，绝不意味着所有概率比都被硬限制在裁剪区间；KL 早停也是诊断手段，不是物理门控。",
      "en": "The outer cycle refreshes the sampling distribution; the inner cycle reuses one batch only for a limited budget. The min surrogate has different plateaus for positive and negative advantages. It does not hard-bound every probability ratio, and KL early stopping is not a physical execution gate."
    }
  },
  {
    "id": "chapter-17-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "SAC：回放、双评价网络与熵温度",
      "en": "SAC: replay, twin critics and entropy temperature"
    },
    "alt": {
      "zh-CN": "SAC 学习回路把模拟经验回放连接到双 Critic、随机 Actor、熵温度和缓慢更新的目标 Critic，区分交互和学习信号。",
      "en": "The SAC loop connects simulated replay to twin critics, a stochastic actor, entropy temperature and slowly updated target critics, separating interaction from learning signals."
    },
    "explanation": {
      "zh-CN": "回放、双 Critic、随机 Actor 与熵温度构成 SAC 的更新回路。区分目标网络、停止梯度以及 tanh 后动作密度的坐标。",
      "en": "Replay, twin critics, a stochastic actor and entropy temperature form the SAC update loop. Track target networks, stopped gradients and the coordinate used for tanh-corrected densities."
    },
    "href": "#/chapter/17",
    "keywords": [
      "SAC",
      "最大熵",
      "双 Critic",
      "最大熵目标与 SAC",
      "17",
      "SAC: replay, twin critics and entropy temperature",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "回放与双 Critic",
          "en": "Replay and twin critics"
        },
        "description": {
          "zh-CN": "从回放批次拟合 soft 目标；目标中的下一动作来自随机策略，双 Critic 的较小值缓解高估。",
          "en": "Fit soft targets from replay. Next actions are sampled from the stochastic policy, and the smaller target-critic estimate limits overestimation."
        }
      },
      {
        "label": {
          "zh-CN": "Actor 与密度",
          "en": "Actor and density"
        },
        "description": {
          "zh-CN": "重参数化动作支持策略梯度；tanh 后 log 密度必须包含变量变换修正。",
          "en": "Reparameterized actions support policy gradients. The post-tanh log density requires the change-of-variables correction."
        }
      },
      {
        "label": {
          "zh-CN": "温度与目标网络",
          "en": "Temperature and targets"
        },
        "description": {
          "zh-CN": "温度权衡熵与价值，目标网络缓慢跟踪 Critic；两者分别处理不同学习机制。",
          "en": "Temperature balances entropy and value, while target networks track critics slowly. These address different learning mechanisms."
        }
      }
    ],
    "relationship": {
      "zh-CN": "模拟交互 → 回放 → Critic 与 Actor 学习；Critic 评价为 Actor 提供梯度信号，目标 Critic 为价值更新提供停止梯度的目标。熵温度与目标网络都不能替代动作边界、独立成本或执行安全门。",
      "en": "Simulated interaction → replay → critic and actor learning. Critic evaluation supplies the actor learning signal; target critics supply detached value targets. Entropy temperature and target networks do not replace action bounds, separate costs or execution gates."
    }
  },
  {
    "id": "chapter-18-diagram-1",
    "topic": "algorithms",
    "title": {
      "zh-CN": "算法选型：从长期影响与数据条件出发",
      "en": "Algorithm selection: consequences and data access"
    },
    "alt": {
      "zh-CN": "紧凑分支比较先区分有无长期状态影响，再区分只有历史日志或允许模拟交互，最后区分离散和连续动作。",
      "en": "A compact decision structure separates long-term state effects, historical-only versus simulated interaction data, and discrete versus continuous actions."
    },
    "explanation": {
      "zh-CN": "先判断动作是否影响未来，再判断可用的是历史日志还是模拟交互，最后比较离散/连续动作方法。选型之后仍要统一覆盖、约束与独立评估。",
      "en": "First ask whether actions affect the future, then whether you have historical logs or simulator interaction, and finally compare methods for discrete or continuous actions. Coverage, constraints and independent evaluation remain necessary after selection."
    },
    "href": "#/chapter/18",
    "keywords": [
      "算法选择",
      "基线",
      "决策建模",
      "根据问题选择算法",
      "18",
      "Algorithm selection: consequences and data access",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "决策影响",
          "en": "Decision consequences"
        },
        "description": {
          "zh-CN": "先问动作是否影响未来状态；没有长期影响时，预测或 contextual bandit 可能是更合适的基线。",
          "en": "First ask whether actions affect future states. Without long-term effects, prediction or a contextual bandit may be an appropriate baseline."
        }
      },
      {
        "label": {
          "zh-CN": "数据与动作空间",
          "en": "Data and action space"
        },
        "description": {
          "zh-CN": "仅日志时比较行为克隆与离线 RL；允许模拟交互时，再按离散或连续动作提出候选算法。",
          "en": "With logs only, compare behavioural cloning and offline RL. With simulated interaction, distinguish discrete and continuous action candidates."
        }
      },
      {
        "label": {
          "zh-CN": "共同评价",
          "en": "Common evaluation"
        },
        "description": {
          "zh-CN": "表格方法、DQN、PPO、SAC、TD3 是候选，不是自动选择的赢家；统一预算与评价再比较。",
          "en": "Tabular methods, DQN, PPO, SAC and TD3 are candidates, not predetermined winners; compare them under shared budgets and evaluation."
        }
      }
    ],
    "relationship": {
      "zh-CN": "无长期影响 → 预测/老虎机基线；有长期影响 → 检查数据权限；模拟离散动作 → 表格/DQN，模拟连续动作 → PPO/SAC/TD3，固定日志 → BC/离线 RL。所有分支仍需覆盖、约束和独立评价。",
      "en": "No long-term effect → prediction/bandit baseline; long-term effect → inspect data permissions. Simulated discrete actions → tabular/DQN; simulated continuous actions → PPO/SAC/TD3; fixed logs → BC/offline RL. Every path still needs coverage checks, constraints and independent evaluation."
    }
  },
  {
    "id": "chapter-21-diagram-1",
    "topic": "process",
    "title": {
      "zh-CN": "五层门控：请求、拒绝与实际执行",
      "en": "Five gates: requests, rejection and execution"
    },
    "alt": {
      "zh-CN": "候选设定值增量依次经过五个有序门，任一失败都汇入保持当前设定值的回退路径，全部通过才允许模拟执行。",
      "en": "A requested setpoint increment passes five ordered gates. Any failure joins the hold-current-setpoint fallback; only complete acceptance permits simulated execution."
    },
    "explanation": {
      "zh-CN": "运行决策改变上层设定值，下层控制负责跟踪；门控、延迟反馈与奖励/成本必须沿着实际执行路径记录。",
      "en": "Operational decisions change supervisory setpoints while lower-level control tracks them. Record gates, delayed feedback, rewards and costs along the actual execution path."
    },
    "href": "#/chapter/21",
    "keywords": [
      "流程工业",
      "POMDP",
      "安全门控",
      "Capstone",
      "贯穿案例：烧成系统设定值决策",
      "21",
      "Five gates: requests, rejection and execution",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "门 1–2：数据与当前状态",
          "en": "Gates 1–2: data and current state"
        },
        "description": {
          "zh-CN": "先检查数据有效性，再检查核心 CV/PV 范围与氧含量边界。质量另作独立成本评价；未发布化验或隐藏的当前真质量不能成为教学门控的输入。",
          "en": "Check data validity first, then core CV/PV ranges and oxygen limits. Quality is evaluated as a separate constraint cost; unreleased assays and hidden current quality are not inputs to the teaching gate."
        }
      },
      {
        "label": {
          "zh-CN": "门 3–4：可信度与增量变化",
          "en": "Gates 3–4: credibility and variation"
        },
        "description": {
          "zh-CN": "模型/OOD 检查先于变化率与曲率可行性；阈值属于本项目约定。",
          "en": "Model/OOD checks precede rate and curvature feasibility. Thresholds are project conventions."
        }
      },
      {
        "label": {
          "zh-CN": "门 5 与回退",
          "en": "Gate 5 and fallback"
        },
        "description": {
          "zh-CN": "最后检查绝对机械边界与 APC 授权。任一门拒绝均执行零增量，记录原因并保持当前 SP。",
          "en": "Finally check absolute mechanical bounds and APC authorization. Any rejection executes zero increment, records its reason and holds the current SP."
        }
      }
    ],
    "relationship": {
      "zh-CN": "数据 → 当前状态 → 模型/OOD → 变化率/曲率 → 绝对边界/授权，顺序不可互换为五个独立的质量检查。通过后仍由下层控制跟踪 SP；拒绝只保持 SP，时间、动态和测量仍推进。候选增量与执行增量分别记录。",
      "en": "Data → current state → model/OOD → rate/curvature → absolute bounds/authorization. These are ordered gates, not five independent quality checks. Accepted SPs are still tracked by inner control. Rejection holds SP while time, dynamics and measurements advance; requested and executed increments are logged separately."
    }
  },
  {
    "id": "chapter-22-diagram-1",
    "topic": "process",
    "title": {
      "zh-CN": "离线策略：从日志到独立证据",
      "en": "Offline policies: from logs to independent evidence"
    },
    "alt": {
      "zh-CN": "历史日志按决策可见性重建并按时间隔离，行为克隆与保守离线策略两条路径在支持域检查和独立评价处汇合。",
      "en": "Historical logs are reconstructed by decision-time visibility and split temporally; behavioural cloning and conservative offline learning join at support checks and independent evaluation."
    },
    "explanation": {
      "zh-CN": "离线数据固定后，分布外动作的价值外推成为风险；策略限制、保守估值和独立评估承担不同职责。",
      "en": "With a fixed dataset, extrapolating values for unsupported actions becomes a risk. Policy restrictions, conservative values and independent evaluation play different roles."
    },
    "href": "#/chapter/22",
    "keywords": [
      "Offline RL",
      "CQL",
      "IQL",
      "TD3+BC",
      "离线强化学习：从日志到策略",
      "22",
      "Offline policies: from logs to independent evidence",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "时间与可见性",
          "en": "Timing and visibility"
        },
        "description": {
          "zh-CN": "转移只能使用当时可用的数据；延迟化验按发布时间进入观测，不能因离线整理而提前出现。",
          "en": "Transitions may use only data available then. Delayed assays enter observations at release time, never earlier during offline reconstruction."
        }
      },
      {
        "label": {
          "zh-CN": "隔离与基线",
          "en": "Isolation and baselines"
        },
        "description": {
          "zh-CN": "隔离训练、验证和测试；先构建行为克隆基线，再比较保守价值或策略限制方法。",
          "en": "Separate training, validation and testing. Build a behavioural-cloning baseline before comparing conservative values or policy restrictions."
        }
      },
      {
        "label": {
          "zh-CN": "支持与证据",
          "en": "Support and evidence"
        },
        "description": {
          "zh-CN": "检查动作支持、独立工况、收益、约束成本及不确定性，不能只报告拟合误差。",
          "en": "Check action support, held-out regimes, returns, constraint costs and uncertainty, not fitting error alone."
        }
      }
    ],
    "relationship": {
      "zh-CN": "日志 → 合法转移 → 时间隔离 → BC 与离线 RL 对比 → 支持域和独立评价。离线固定数据不授予真实设备探索权限；对分布外动作的高价值预测不能当作现场收益。",
      "en": "Logs → valid transitions → temporal separation → BC versus offline RL → support and independent evaluation. A fixed offline dataset does not authorize exploration on real equipment. High predicted values for unsupported actions are not field benefits."
    }
  },
  {
    "id": "chapter-23-diagram-1",
    "topic": "process",
    "title": {
      "zh-CN": "短程模型分叉：真实锚点与想象经验",
      "en": "Short model branches: real anchors, imagined experience"
    },
    "alt": {
      "zh-CN": "从有覆盖的真实历史状态抽取起点，用当前策略和模型短程分叉，经不确定性与边界检查后进入独立模型缓冲区，失败分支停止。",
      "en": "Covered real states anchor short model-policy branches; uncertainty and boundary checks admit credible branches into a separate model buffer and stop rejected ones."
    },
    "explanation": {
      "zh-CN": "区分真实经验与模型生成的短轨迹，检查模型误差如何进入策略更新。增加模拟数据不自动增加现实证据。",
      "en": "Separate real experience from short model-generated trajectories and inspect how model errors enter policy updates. More simulated data is not automatically more physical evidence."
    },
    "href": "#/chapter/23",
    "keywords": [
      "Dyna-Q",
      "MBPO",
      "MOPO",
      "世界模型",
      "模型学习、Dyna 与短程推演",
      "23",
      "Short model branches: real anchors, imagined experience",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "真实起点",
          "en": "Real starting states"
        },
        "description": {
          "zh-CN": "从真实历史状态库抽取有覆盖的起点，保留所属工况与数据来源。",
          "en": "Sample covered starting states from the real history bank and retain regime and provenance."
        }
      },
      {
        "label": {
          "zh-CN": "短推演与停止",
          "en": "Short rollouts and stopping"
        },
        "description": {
          "zh-CN": "模型与当前策略生成短分支；不确定性或边界检查不通过时立即停止该分支并记原因。",
          "en": "The model and current policy generate short branches. Stop a branch and record why if uncertainty or boundary checks fail."
        }
      },
      {
        "label": {
          "zh-CN": "分开的经验来源",
          "en": "Separate experience sources"
        },
        "description": {
          "zh-CN": "可信模型经验存入独立缓冲区，再按明确比例与真实经验混合用于学习。",
          "en": "Store accepted model experience separately, then mix it with real experience under an explicit learning protocol."
        }
      }
    ],
    "relationship": {
      "zh-CN": "真实状态 → 短分叉 → 检查 → 模型缓冲区 → 策略更新 → 新分叉。闭环误差还取决于策略对状态误差的响应；模型一致或短期预测好，都不保证长程闭环可靠。生成更多轨迹不增加真实试验次数。",
      "en": "Real states → short branches → checks → model buffer → policy update → new branches. Closed-loop error also depends on the policy response to state error. Model agreement or good one-step prediction does not guarantee reliable long rollouts; generated trajectories are not additional physical trials."
    }
  },
  {
    "id": "research-history-diagram-1",
    "topic": "process",
    "title": {
      "zh-CN": "运行决策分层：信息、目标与执行权限",
      "en": "Operational hierarchy: information, targets and authority"
    },
    "alt": {
      "zh-CN": "分层闭环连接生产要求、经济目标、上层设定值、门控、内层控制和物理过程；信息估计与指标审计形成两条反馈路径。",
      "en": "A hierarchy links production requirements, economic targets, supervisory setpoints, gates, inner control and the process, with state information and indicator audits feeding back."
    },
    "explanation": {
      "zh-CN": "先定位决策层，再理解 RTO、跟踪 MPC、经济 MPC 和学习策略各自回答的问题。",
      "en": "Locate the decision layer before comparing RTO, tracking MPC, economic MPC and learned policies."
    },
    "href": "#/research/history",
    "keywords": [
      "history",
      "从全厂控制到运行指标决策",
      "From plantwide control to operational decisions",
      "研究",
      "research",
      "Operational hierarchy: information, targets and authority",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "目标与上层决策",
          "en": "Objectives and supervision"
        },
        "description": {
          "zh-CN": "生产要求限定经济目标与操作边界；状态和质量信息支持上层 SP 建议。",
          "en": "Production requirements define objectives and boundaries; state and quality information support supervisory SP proposals."
        }
      },
      {
        "label": {
          "zh-CN": "授权与实际控制",
          "en": "Authorization and control"
        },
        "description": {
          "zh-CN": "建议先过门控，再由 DCS、PID/APC 跟踪设定值；上层学习器不直接指挥执行器。",
          "en": "Proposals pass authorization before DCS and PID/APC track setpoints; the supervisory learner does not directly command actuators."
        }
      },
      {
        "label": {
          "zh-CN": "两条反馈路径",
          "en": "Two feedback paths"
        },
        "description": {
          "zh-CN": "过程测量更新状态信息；带单位、时间和分母的指标核算用于审计运行目标。",
          "en": "Process measurements update state information; indicator accounting with explicit units, time and denominators audits operational objectives."
        }
      }
    ],
    "relationship": {
      "zh-CN": "生产要求 → 目标 → SP 决策 → 门控 → 内层控制 → 过程。过程同时反馈给状态/质量估计与指标审计，后者回到目标核算。RTO、跟踪 MPC、经济 MPC 与学习策略的角色应按决策层和目标区分。",
      "en": "Requirements → objectives → SP decision → gate → inner control → process. The process feeds both state/quality information and indicator audits, with audits informing objectives. Distinguish RTO, tracking MPC, economic MPC and learned policies by decision layer and objective."
    }
  },
  {
    "id": "research-indicators-diagram-1",
    "topic": "optimization",
    "title": {
      "zh-CN": "因果混杂：为什么日志相关性不是动作效果",
      "en": "Confounding: why logged association is not an action effect"
    },
    "alt": {
      "zh-CN": "共同原因结构：原料负荷及历史判断同时影响操作建议和后续指标，建议又通过内层控制后的过程影响质量与能耗。",
      "en": "A confounding structure shows feed/load and historical judgment affecting both proposals and later outcomes, while proposals act through the regulated process."
    },
    "explanation": {
      "zh-CN": "把煤耗、电耗、质量、产量、排放与平稳性放回单位、边界和时间，再讨论策略收益。",
      "en": "Put fuel, electricity, quality, throughput, emissions and stability back into units, boundaries and time before comparing policies."
    },
    "href": "#/research/indicators",
    "keywords": [
      "indicators",
      "运行指标、权衡与因果混杂",
      "Operational indicators, trade-offs and confounding",
      "研究",
      "research",
      "Confounding: why logged association is not an action effect",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "共同原因",
          "en": "Common causes"
        },
        "description": {
          "zh-CN": "原料、负荷、历史及未记录的操作判断可能同时影响设定值选择与后续质量、能耗。",
          "en": "Feed, load, history and unrecorded operator judgment can affect both setpoint choice and subsequent quality or energy."
        }
      },
      {
        "label": {
          "zh-CN": "动作作用路径",
          "en": "The action pathway"
        },
        "description": {
          "zh-CN": "设定值建议要经过门控与内层控制，过程状态改变后才可能影响后续指标。",
          "en": "A proposal passes gates and inner control before process changes can affect later indicators."
        }
      },
      {
        "label": {
          "zh-CN": "指标口径",
          "en": "Indicator definitions"
        },
        "description": {
          "zh-CN": "煤耗、电耗、质量、产量、排放和平稳性必须保留单位、核算时间与分母。",
          "en": "Fuel, electricity, quality, throughput, emissions and stability require explicit units, accounting windows and denominators."
        }
      }
    ],
    "relationship": {
      "zh-CN": "原料/负荷 → 操作建议且 → 后续结果；历史/判断也同时指向两者。另有 建议 → 受控过程 → 结果 的作用路径。这些共同原因使条件相关不自动等于干预效果，按时间留出测试集也不能单独消除混杂。",
      "en": "Feed/load → proposal and → later outcome; history/judgment also affects both. A separate proposal → regulated process → outcome path represents action effects. These shared causes prevent conditional association from automatically identifying intervention effects; a temporal test split alone does not remove confounding."
    }
  },
  {
    "id": "research-objectives-diagram-1",
    "topic": "optimization",
    "title": {
      "zh-CN": "从指标核算到可行性与 Pareto 选择",
      "en": "From metric accounting to feasibility and Pareto choice"
    },
    "alt": {
      "zh-CN": "候选先统一单位与时间，再分成不可行拒绝/继续搜索和可行 Pareto 比较，最终经过偏好选择与独立执行审核。",
      "en": "Candidates pass units/time accounting and feasibility; infeasible proposals return to search, while feasible ones undergo Pareto comparison, preference selection and execution review."
    },
    "explanation": {
      "zh-CN": "用完整算例解释尺度、偏好、可行性、机会约束与软约束为什么不能混为一谈。",
      "en": "Worked examples separate scaling, preferences, feasibility, chance constraints and soft constraints."
    },
    "href": "#/research/objectives",
    "keywords": [
      "objectives",
      "从指标到目标、Pareto 与约束",
      "From indicators to objectives, Pareto order and constraints",
      "研究",
      "research",
      "From metric accounting to feasibility and Pareto choice",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "尺度与可行性",
          "en": "Scale and feasibility"
        },
        "description": {
          "zh-CN": "先核对量纲、时间窗口和归一化，再按明确约束判定候选是否可行。",
          "en": "Check units, time windows and normalization before determining feasibility under explicit constraints."
        }
      },
      {
        "label": {
          "zh-CN": "Pareto 与偏好",
          "en": "Pareto order and preference"
        },
        "description": {
          "zh-CN": "对可行候选比较支配关系；Pareto 集通常不只一个点，仍需偏好或预算作选择。",
          "en": "Compare dominance among feasible candidates. A Pareto set usually needs a preference or budget to choose one candidate."
        }
      },
      {
        "label": {
          "zh-CN": "独立执行审核",
          "en": "Independent execution review"
        },
        "description": {
          "zh-CN": "选出的候选仍要通过实际执行路径；优化中的容忍规则不自动授权执行。",
          "en": "A selected candidate still passes execution review. Search tolerances do not themselves authorize an action."
        }
      }
    ],
    "relationship": {
      "zh-CN": "候选 → 核算 → 可行性；不通过则拒绝/继续搜索，通过后才比较 Pareto 与偏好，再独立审核。epsilon-constraint 的预算与进化搜索中暂时容忍违反的 epsilon 是不同概念；软惩罚、机会约束和逐步硬边界不能互相替代。",
      "en": "Candidate → accounting → feasibility. Reject or continue searching when infeasible; otherwise compare Pareto order, choose a preference and independently review execution. An epsilon-constraint budget differs from epsilon tolerance during evolutionary search. Soft penalties, chance constraints and per-step hard boundaries are distinct."
    }
  },
  {
    "id": "research-evolution-diagram-1",
    "topic": "optimization",
    "title": {
      "zh-CN": "进化优化：搜索循环与滚动执行",
      "en": "Evolutionary optimization: search and rolling execution"
    },
    "alt": {
      "zh-CN": "紧凑双循环展示候选种群、模型评价、约束与排序、选择变异；优选候选只提出当前一步，再经门控和内层控制获得新观测。",
      "en": "Two compact cycles show a population, model evaluation, constraints/ranking and variation; preference selection proposes only the current step before gating and new observations."
    },
    "explanation": {
      "zh-CN": "拆开候选表示、评价模型、约束比较与搜索器，推导 NSGA-II 和 MOEA/D，解释动态优化如何与 MPC、RL 连接。",
      "en": "Separate representation, evaluation, feasibility and search. Derive NSGA-II and MOEA/D, then connect dynamic optimization with MPC and RL."
    },
    "href": "#/research/evolution",
    "keywords": [
      "evolution",
      "进化优化：从 Pareto 搜索到滚动轨迹",
      "Evolutionary optimization: Pareto search and rolling trajectories",
      "研究",
      "research",
      "Evolutionary optimization: search and rolling execution",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "候选表示与评价",
          "en": "Representation and evaluation"
        },
        "description": {
          "zh-CN": "个体可以表示当前点或未来轨迹；动力学和指标模型给出预测目标与违反量。",
          "en": "An individual can represent a present point or future trajectory. Dynamics and metric models estimate objectives and violations."
        }
      },
      {
        "label": {
          "zh-CN": "搜索内部循环",
          "en": "The search loop"
        },
        "description": {
          "zh-CN": "NSGA-II 的排序与 MOEA/D 的分解是不同比较机制；选择、交叉和变异形成新候选。",
          "en": "NSGA-II ranking and MOEA/D decomposition are different comparison mechanisms; selection, crossover and mutation create new candidates."
        }
      },
      {
        "label": {
          "zh-CN": "滚动执行循环",
          "en": "The rolling execution loop"
        },
        "description": {
          "zh-CN": "按偏好选候选，仅将当前一步送往统一门控与内层控制，然后根据新信息重新优化。",
          "en": "Choose a preference, submit only the current step to shared gates and inner control, and optimize again with new information."
        }
      }
    ],
    "relationship": {
      "zh-CN": "观测/历史 → 种群 → 模型与约束评价 → 排序或分解 → 选择变异 → 种群；优选分支 → 第一步建议 → 门控/内层控制 → 新观测。进化搜索可以处理动态轨迹，但效果依赖模型、预算与公平的滚动评价。",
      "en": "Observation/history → population → model and constraint evaluation → ranking or decomposition → variation → population. The selected branch → first-step proposal → gates/inner control → new observation. Evolutionary search can optimize dynamic trajectories; results depend on the model, budget and fair rolling evaluation."
    }
  },
  {
    "id": "research-sequential-diagram-1",
    "topic": "architecture",
    "title": {
      "zh-CN": "序列决策：历史、候选与延迟反馈",
      "en": "Sequential decisions: history, proposals and delayed feedback"
    },
    "alt": {
      "zh-CN": "已到达的信息形成历史或信念，策略学习与模型规划作为候选生成的替代路径，共同经过门控和过程；能耗奖励与质量/氧成本分开返回学习。",
      "en": "Arrived information forms history or belief; policy and model-planning alternatives propose actions through shared gates and process, returning separate energy rewards and quality/oxygen costs."
    },
    "explanation": {
      "zh-CN": "从当前候选、未来轨迹推到反馈策略，说明历史、化验可用性、占用分布、延迟回报与独立约束如何进入同一个问题。",
      "en": "Move from a present candidate to a trajectory and a feedback policy, connecting history, assay availability, occupancy, delayed returns and separate constraints."
    },
    "href": "#/research/sequential",
    "keywords": [
      "sequential",
      "从指标优化到序列决策：MDP、POMDP 与 CMDP",
      "From operational optimization to MDPs, POMDPs and CMDPs",
      "研究",
      "research",
      "Sequential decisions: history, proposals and delayed feedback",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "信息与候选",
          "en": "Information and proposals"
        },
        "description": {
          "zh-CN": "只把已到达的信号及化验写入历史/信念；学习策略与模型规划是可比较的候选生成路径。",
          "en": "Use only arrived signals and assays in history/belief. A learned policy and a model planner are alternative proposal generators."
        }
      },
      {
        "label": {
          "zh-CN": "执行与后果",
          "en": "Execution and consequences"
        },
        "description": {
          "zh-CN": "候选增量先过门控，再改变 CV 设定值；内层控制与物料、热惯性共同决定未来响应。",
          "en": "Gate requested increments before changing CV setpoints; inner control and material/thermal inertia determine future response."
        }
      },
      {
        "label": {
          "zh-CN": "奖励与独立成本",
          "en": "Reward and separate costs"
        },
        "description": {
          "zh-CN": "奖励由归一化煤耗、电耗及平滑项构成；质量和氧约束作为单独成本记录。",
          "en": "Reward combines normalized fuel/electricity and smoothness; quality and oxygen constraints are recorded as separate costs."
        }
      }
    ],
    "relationship": {
      "zh-CN": "已到达信息 → 历史/信念 → 策略或规划 → 门控执行 → 过程 → 下一信息与独立奖励/成本。反馈可支持价值学习或模型校准。两种生成路径不表示必须同时执行；期望成本约束不等于每一步的安全保证。",
      "en": "Arrived information → history/belief → policy or planner → gated execution → process → next information and separate reward/cost signals. Feedback supports value learning or model calibration. The alternatives need not execute together; expected-cost constraints do not guarantee every step is safe."
    }
  },
  {
    "id": "research-architecture-diagram-1",
    "topic": "architecture",
    "title": {
      "zh-CN": "可审计的策略系统：信息权限与执行路径",
      "en": "An auditable agent: information rights and execution paths"
    },
    "alt": {
      "zh-CN": "已到达信号、掩码和化验年龄经过历史编码/软测量，分别供 Actor 和评价网络使用；请求增量经五层门控转为执行增量，并记录过程反馈。",
      "en": "Arrived signals, masks and assay age feed history encoding/soft sensing and then actor/critics; requested increments pass five gates before execution and logged feedback."
    },
    "explanation": {
      "zh-CN": "逐一说明历史编码、软测量、tanh Actor、双 Critic、温度、成本、离线支持与世界模型各自学习什么，以及门控改变了哪些语义。",
      "en": "Explain what the history encoder, soft sensor, tanh actor, twin critics, temperature, costs, offline support and world model each learn—and what gating changes."
    },
    "href": "#/research/architecture",
    "keywords": [
      "architecture",
      "网络与数据路径：一个可审计的上层决策系统",
      "Neural and data paths for an auditable supervisory agent",
      "研究",
      "research",
      "An auditable agent: information rights and execution paths",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "合法信息接口",
          "en": "Permitted information"
        },
        "description": {
          "zh-CN": "历史编码器与软测量只读决策时可用的信息；未来化验、隐含真值与测试目标不能进入策略输入。",
          "en": "History encoding and soft sensing read only decision-time information; future assays, hidden truth and test targets must not enter the policy."
        }
      },
      {
        "label": {
          "zh-CN": "策略与评价网络",
          "en": "Policy and critics"
        },
        "description": {
          "zh-CN": "有界 Actor 提出请求增量；双奖励 Critic 与成本 Critic 学习不同目标，节点数并非网络规模规定。",
          "en": "A bounded actor proposes requested increments. Twin reward critics and cost critics learn distinct objectives; illustrated nodes do not prescribe dimensions."
        }
      },
      {
        "label": {
          "zh-CN": "执行与日志",
          "en": "Execution and logging"
        },
        "description": {
          "zh-CN": "五层门控决定执行增量，内层控制跟踪 CV SP，日志分别保留请求、执行、奖励与成本。",
          "en": "Five gates determine executed increments; inner control tracks CV SPs. Logs retain requested/executed actions and separate rewards/costs."
        }
      }
    ],
    "relationship": {
      "zh-CN": "合法历史 → 编码/软测量 → Actor 与 Critic；Actor 请求 → 五层门控 → CV SP/内层控制 → 下一观测与日志。日志支持 Critic 更新，Critic 给 Actor 的是学习信号，不是设备指令；门控后动作语义须与价值函数及离线数据一致。",
      "en": "Permitted history → encoder/soft sensor → actor and critics. Actor request → five gates → CV SP/inner control → next observation and logs. Logs support critic updates; critics supply actor learning signals, not device commands. Action semantics after gating must remain consistent with value functions and offline data."
    }
  },
  {
    "id": "research-evidence-diagram-1",
    "topic": "architecture",
    "title": {
      "zh-CN": "证据地图：从具体主张到允许的结论",
      "en": "Evidence mapping: from a claim to supported conclusions"
    },
    "alt": {
      "zh-CN": "具体主张回到一手资料后分成理论/仿真、生产日志/代理模型、真实执行三类证据，再共同核对假设、对照与适用范围。",
      "en": "A concrete claim leads to primary sources and distinct theory/simulation, plant-log/surrogate and physical-execution evidence, all checked for assumptions, controls and scope."
    },
    "explanation": {
      "zh-CN": "按实际可读的一手材料建立证据矩阵，区分生产数据、模型闭环、现场试验和运营报告，核验相关论文归属与适用范围。",
      "en": "An evidence matrix based on accessible primary material, separating plant data, model loops, field trials and operational accounts while checking attribution and scope."
    },
    "href": "#/research/evidence",
    "keywords": [
      "evidence",
      "证据地图：论文、仿真、现场与尚未回答的问题",
      "Evidence map: theory, simulation, field operation and open claims",
      "研究",
      "research",
      "Evidence mapping: from a claim to supported conclusions",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "主张与原始材料",
          "en": "Claim and primary material"
        },
        "description": {
          "zh-CN": "先写清要核验的结论，再查原论文或官方运营材料，保留实际读到的范围。",
          "en": "State the claim first, then inspect original papers or official operational material and record what was actually accessible."
        }
      },
      {
        "label": {
          "zh-CN": "三类证据",
          "en": "Distinct evidence categories"
        },
        "description": {
          "zh-CN": "理论、模拟、真实日志和现场执行各支持不同主张；使用工业数据不说明动作由谁执行。",
          "en": "Theory, simulation, real logs and physical execution support different claims. Industrial data do not establish who executed plant actions."
        }
      },
      {
        "label": {
          "zh-CN": "结论边界",
          "en": "Boundaries of the conclusion"
        },
        "description": {
          "zh-CN": "记录假设、对照、工况、统计和未回答的问题，再选择与证据强度一致的措辞。",
          "en": "Record assumptions, controls, regimes, statistics and open questions before choosing wording appropriate to the evidence."
        }
      }
    ],
    "relationship": {
      "zh-CN": "具体主张 → 一手资料 → 分辨证据类别 → 核对假设/对照/范围 → 支持的表述与开放问题。三条分支是证据分类，不能读成必然逐级升级的部署路线，也不能把别人的现场报告写成本项目收益。",
      "en": "Specific claim → primary material → evidence category → assumptions/controls/scope → supported wording and open questions. The branches classify evidence rather than promise a deployment progression; another project’s operational report is not a benefit measured for this project."
    }
  },
  {
    "id": "research-open-problems-diagram-1",
    "topic": "architecture",
    "title": {
      "zh-CN": "闭环模型研究：校准、短推演与失败反馈",
      "en": "Closed-loop model research: calibration and failure feedback"
    },
    "alt": {
      "zh-CN": "时间隔离的真实日志支持模型集合与独立评价两条路径，模型校准后只做受限短推演，评价揭示失败机制并反向修订停止规则。",
      "en": "Temporally isolated logs support model ensembles and independent evaluation; calibrated models produce restricted short rollouts, whose failures refine calibration and stopping rules."
    },
    "explanation": {
      "zh-CN": "围绕隐藏状态、离线支持、闭环模型误差、罕见风险、目标漂移和评价统计提出可检验的下一步，而不是把复杂网络当作答案。",
      "en": "Testable next steps for hidden state, offline support, closed-loop model error, rare risk, changing objectives and statistical evaluation."
    },
    "href": "#/research/open-problems",
    "keywords": [
      "open-problems",
      "开放问题：从预测准确到决策可信还缺什么",
      "Open problems: from accurate prediction to credible decisions",
      "研究",
      "research",
      "Closed-loop model research: calibration and failure feedback",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "隔离数据与校准",
          "en": "Separated data and calibration"
        },
        "description": {
          "zh-CN": "按时间隔离日志，训练动作条件模型集合，并在独立数据核验误差与不确定性。",
          "en": "Separate logs temporally, train action-conditioned model ensembles, and assess error and uncertainty on independent data."
        }
      },
      {
        "label": {
          "zh-CN": "受限模型经验",
          "en": "Restricted model experience"
        },
        "description": {
          "zh-CN": "只从有覆盖起点做受限短分叉，再学习候选策略；模型预测仍是模拟经验。",
          "en": "Generate restricted short branches from covered starts before learning candidate policies; predictions remain simulated experience."
        }
      },
      {
        "label": {
          "zh-CN": "工况与故障评价",
          "en": "Regime and fault evaluation"
        },
        "description": {
          "zh-CN": "开发阶段的留出工况与故障诊断用于寻找失效机制，反馈校准和停止规则；最终锁定测试集不能反复用于调参。",
          "en": "Development holdouts and fault diagnostics identify failures and refine calibration and stopping rules; the final locked test set cannot be repeatedly used for tuning."
        }
      }
    ],
    "relationship": {
      "zh-CN": "日志 → 模型 → 校准 → 短分叉 → 候选策略 → 独立评价 → 失败/停止规则 → 重新校准；真实留出数据也直接支持评价。反馈修改属于开发/校准阶段；看过最终锁定测试结果后反复调参，再复用同一测试集，不能仍称独立测试。闭环误差须包含策略响应，单步预测准确不证明安全或收益。",
      "en": "Logs → models → calibration → short branches → candidate policy → independent evaluation → failure/stopping rules → recalibration. Real held-out logs also support evaluation. Failure feedback may revise development/calibration; repeatedly tuning after inspecting the final locked test set and reusing it is no longer independent testing. Closed-loop error includes policy responses; one-step accuracy alone does not establish safety or benefit."
    }
  },
  {
    "id": "research-agenda-diagram-1",
    "topic": "architecture",
    "title": {
      "zh-CN": "研究议程：统一接口、两类候选与可证伪评价",
      "en": "Research agenda: common interfaces and falsifiable tests"
    },
    "alt": {
      "zh-CN": "按可用时间重建的数据形成状态/质量/可靠性接口，多目标轨迹优化与离线策略学习并列，经统一门控和配对评价检验六项假设。",
      "en": "Availability-aligned data form state/quality/reliability interfaces; multiobjective trajectories and offline policies share gates and paired evaluation of six hypotheses."
    },
    "explanation": {
      "zh-CN": "沿“状态感知→质量预测→动态多目标优化→设定值决策”主线，定义数据契约、基线、消融、失败标准和分阶段产物。",
      "en": "Turn the state–quality–optimization–setpoint chain into explicit data contracts, baselines, ablations, failure criteria and staged deliverables."
    },
    "href": "#/research/agenda",
    "keywords": [
      "agenda",
      "研究路线：把已有模块变成六个可证伪问题",
      "Research agenda: six falsifiable questions connecting existing modules",
      "研究",
      "research",
      "Research agenda: common interfaces and falsifiable tests",
      "concept plate"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "信息契约",
          "en": "Information contract"
        },
        "description": {
          "zh-CN": "重建数据可用时间，明确状态表示、质量预测、可靠性与缺失信息接口。",
          "en": "Rebuild availability times and define interfaces for state, quality, reliability and missing information."
        }
      },
      {
        "label": {
          "zh-CN": "两类候选及连接",
          "en": "Two candidate families"
        },
        "description": {
          "zh-CN": "多目标优化产生轨迹建议，离线学习产生反馈策略与成本价值；二者可比较，也可在明确数据契约下连接。",
          "en": "Multiobjective search proposes trajectories; offline learning produces feedback policies and cost values. Compare or connect them under an explicit data contract."
        }
      },
      {
        "label": {
          "zh-CN": "共同门控与假设检验",
          "en": "Common gates and hypothesis tests"
        },
        "description": {
          "zh-CN": "用同一五层门控、配对扰动和独立工况评价候选，分别记录对六项假设的支持或失败证据。",
          "en": "Use the same five gates, paired disturbances and held-out regimes; record evidence supporting or refuting each of the six hypotheses."
        }
      }
    ],
    "relationship": {
      "zh-CN": "可用数据 → 状态/质量/可靠性 → 优化或策略 → 统一门控 → 配对评价 → 假设证据；失败反馈修订接口、优化与学习。优化候选可向学习提供受审计的数据，但复杂模块组合不等于已证实的新方法或现场节能结果。",
      "en": "Available data → state/quality/reliability → optimization or policy → shared gates → paired evaluation → hypothesis evidence. Failures revise interfaces, optimization and learning. Optimization can supply audited learning data, but combining modules does not establish a validated method or field energy savings."
    }
  },
  {
    "id": "roadmap-learning",
    "topic": "orientation",
    "title": {
      "zh-CN": "学习路线：从交互基础到可信研究",
      "en": "Learning roadmap: interaction foundations to credible research"
    },
    "alt": {
      "zh-CN": "紧凑学习地图从交互、概率和 MDP 到 Bellman 与表格控制，分出价值学习和策略梯度，再汇入评价、离线/模型学习与约束研究。",
      "en": "A compact learning map moves from interaction, probability and MDPs to Bellman/tabular control, branches into value and policy learning, then joins evaluation and constrained research."
    },
    "explanation": {
      "zh-CN": "两条算法主线共享建模与概率基础，最终汇合到环境、评价和受约束研究。路线表达知识依赖，不保证学习时长或任何算法的效果。",
      "en": "Two algorithm strands share modelling and probability foundations, then join environment design, evaluation and constrained research. The map expresses dependencies, not guaranteed study time or algorithm performance."
    },
    "href": "#/roadmap",
    "keywords": [
      "路线",
      "课程",
      "roadmap",
      "curriculum",
      "Bellman",
      "DQN",
      "PPO",
      "SAC",
      "offline",
      "model-based"
    ],
    "regions": [
      {
        "label": {
          "zh-CN": "共同基础",
          "en": "Shared foundations"
        },
        "description": {
          "zh-CN": "先建立状态、动作、奖励、条件期望、MDP 与 Bellman 的联系，再学习表格估值和控制。",
          "en": "Connect state, action, reward, conditional expectation, MDPs and Bellman before studying tabular estimation and control."
        }
      },
      {
        "label": {
          "zh-CN": "两条算法主线",
          "en": "Two algorithm strands"
        },
        "description": {
          "zh-CN": "共享基础支持 DQN 的价值路线与策略梯度路线；Actor–Critic、PPO、SAC 进一步连接估值和策略。",
          "en": "The foundation supports DQN value learning and policy gradients; actor–critic, PPO and SAC further connect evaluation and policy learning."
        }
      },
      {
        "label": {
          "zh-CN": "共同研究出口",
          "en": "Shared research destination"
        },
        "description": {
          "zh-CN": "两条路线都需要环境契约与独立评价，再进入离线、模型、约束和门控研究。",
          "en": "Both strands require environment contracts and independent evaluation before offline, model-based, constrained and gated research."
        }
      }
    ],
    "relationship": {
      "zh-CN": "交互/概率/MDP → Bellman/表格 → 价值与策略两条学习路线 → 环境与独立评价 → 离线/模型 → 约束与研究设计。图表示学习依赖，不是算法优劣排名；研究时可以返回前面的建模和评估环节。",
      "en": "Interaction/probability/MDPs → Bellman/tabular methods → value and policy strands → environment and independent evaluation → offline/model-based learning → constraints and research design. This is a learning dependency map, not an algorithm ranking; research often returns to modelling and evaluation."
    }
  }
];

export const conceptPlateNotice: Localized<string> = {
  'zh-CN': '原创中文概念图解。下方文字解释图中各部分；精确公式、假设与执行边界以正文为准。图像不代表实测数据、真实工程接线或现场性能证据。',
  en: 'Original English concept illustration. The selectable text explains each region. Equations, assumptions and execution boundaries are specified in the accompanying text; the image is not measured data, engineering wiring or field-performance evidence.',
};
export function conceptPlate(id: string): ConceptPlate | undefined {
  return conceptPlates.find(plate => plate.id === id);
}
export const conceptPlateImage = (id: ConceptPlateId, locale: string = getLocale()): string => `./images/diagrams/${imageLocaleDirectory(locale)}${id}.webp`;
export function localizedConceptPlate(id: string, locale: Locale = getLocale()) {
  const plate = conceptPlate(id);
  if (!plate) return;
  return {
    id: plate.id, kind: 'concept' as const, topic: plate.topic,
    title: plate.title[locale], alt: plate.alt[locale], explanation: plate.explanation[locale],
    href: plate.href, image: conceptPlateImage(plate.id, locale), width: 1536, height: 1024,
    keywords: [...plate.keywords, plate.title['zh-CN'], plate.title.en],
    regions: plate.regions.map(region => ({ label: region.label[locale], description: region.description[locale] })),
    relationship: plate.relationship[locale],
  };
}
/** A normal Markdown image is portable even before the renderer adds the reading guide. */
export function conceptPlateReference(id: ConceptPlateId, locale: Locale = getLocale()): string {
  const plate = conceptPlate(id)!;
  return `![${plate.title[locale]}](${conceptPlateImage(id, locale)})`;
}
/** Only an exact, registered local asset path may receive trusted figure controls. */
export function conceptPlateFromImage(src: string): ConceptPlate | undefined {
  const match = /^\.\/images\/diagrams\/(?:zh-CN\/)?([a-z0-9-]+)\.webp$/.exec(src);
  return match ? conceptPlate(match[1]) : undefined;
}
export function conceptPlateMarkdown(id: ConceptPlateId, locale: Locale, imageUrl = conceptPlateImage(id, locale)): string {
  const plate = conceptPlate(id)!;
  return [
    `<a id="figure-${id}"></a>`, '', `![${plate.alt[locale]}](${imageUrl})`, '',
    `**${plate.title[locale]}**`, '', plate.explanation[locale], '',
    `**${locale === 'en' ? 'Reading guide' : '读图要点'}**`, '',
    ...plate.regions.map(region => `- **${region.label[locale]}** · ${region.description[locale]}`), '',
    `**${locale === 'en' ? 'Exact relationships and boundaries' : '准确关系与边界'}**`, '',
    plate.relationship[locale], '', `*${conceptPlateNotice[locale]}*`, '',
  ].join('\n');
}
/** Localize every trusted image; only standalone plates receive a full reading guide. */
export function expandConceptPlateReferences(markdown: string, locale: Locale, imagePrefix = './images/diagrams/'): string {
  const imageUrl = (id: ConceptPlateId) => `${imagePrefix}${imageLocaleDirectory(locale)}${id}.webp`;
  return mapMarkdownProse(markdown, (prose, boundary) => prose.split('\n').map((line, index, lines) => {
    const wholeLine = (index > 0 || boundary.startsLine) && (index < lines.length - 1 || boundary.endsLine);
    // Do not let the alt text swallow another image on the same line.
    const reference = wholeLine ? /^!\[(?:\\.|[^\]\\\n])*\]\((\.\/images\/diagrams\/(?:zh-CN\/)?[a-z0-9-]+\.webp)\)[ \t]*$/.exec(line) : undefined;
    const standalone = reference ? conceptPlateFromImage(reference[1]!) : undefined;
    if (standalone) return conceptPlateMarkdown(standalone.id, locale, imageUrl(standalone.id));
    return line.replace(/(!\[(?:\\.|[^\]\\\n])*\]\()((?:\.\/images\/diagrams\/(?:zh-CN\/)?|\.\/images\/(?:zh-CN\/)?)[a-z0-9-]+\.webp)(\))/g, (match, before: string, source: string, after: string) => {
      const plate = conceptPlateFromImage(source);
      if (plate) return `${before}${imageUrl(plate.id)}${after}`;
      const illustration = /^\.\/images\/(?:zh-CN\/)?([a-z0-9-]+)\.webp$/.exec(source);
      if (!illustration || !(translatedIllustrationIds as readonly string[]).includes(illustration[1]!)) return match;
      return `${before}${imagePrefix.replace(/diagrams\/$/, '')}${illustrationImage(illustration[1]!, locale).replace(/^\.\/images\//, '')}${after}`;
    });
  }).join('\n'));
}
