# Algorithms Guidelines

> Standards and best practices for reinforcement learning algorithms tailored to process industry operational metric decision-making (cement clinker calcining system).

---

## Overview

In industrial process control (such as cement calcination), agents cannot interact through trial-and-error on real physical equipment. The algorithm design centers on:
1. **Offline RL**: Learning effective policies strictly from historical DCS/APC and lab logs without online interaction.
2. **Model-Based RL**: Expanding rollouts safely within a learned or pretrained world model ($W_\psi$) while penalizing out-of-distribution (OOD) transitions.
3. **Safe & Constrained RL (CMDP)**: Enforcing strict thermal, environmental, and product quality boundaries through Lagrangian optimization and the project's 5-layer Safety Gate.

---

## Guidelines Index

| Guide | Description | Primary References |
|---|---|---|
| [Offline RL](./offline-rl.md) | Policy training from static logs (TD3+BC, CQL, IQL), distribution shift, FQE | `ref/RL运行指标决策/04_阶段3_离线RL.md` |
| [Model-Based RL](./model-based-rl.md) | World model integration ($W_\psi$), short-horizon rollouts, uncertainty penalties | `ref/RL运行指标决策/05_阶段4_模型基RL.md` |
| [Safe & Constrained RL](./safe-constrained-rl.md) | CMDP formulation, Lagrange multipliers, 5-layer safety gate, fallback | `ref/RL运行指标决策/06_阶段5_安全约束RL.md`, `ref/RL运行指标决策/code/safety_gate.py` |

---

## Core Algorithm Selection Matrix

| Scenario / Objective | Recommended Algorithm | Key Hyperparameters / Constraints |
|---|---|---|
| Historical log baseline | **TD3+BC** or **IQL** | Balance BC weight $\alpha$, conservative value temperature $\beta$ |
| World model synthetic rollouts | **MOPO** / **MBPO** | Rollout horizon $H \in [12, 72]$, ensemble variance penalty $\lambda$ |
| Hard constraint enforcement | **CMDP with Lagrangian Relaxation** | Dual learning rate $\eta_{\lambda}$, cost limit $d_k$ matched to historical limits |
| Production candidate output | **Policy + 5-Layer Safety Gate** | All candidate actions must pass Gate 1–5 before DCS dispatch; else $Y_{safe}$ |

---

**Language**: Documentation is maintained in English for technical precision, with exact industrial variables matching the project's domain vocabulary.
