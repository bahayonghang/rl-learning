# Environments Guidelines

> Standards for simulation environments, Gymnasium API conventions, and POMDP observation handling in process industry RL.

---

## Overview

The environment layer provides the interaction boundary for RL agents. Because real cement calcining systems cannot be directly connected for training, this layer encompasses:
- Synthetic toy environments for rapid prototyping (`SimpleKilnEnv`).
- High-fidelity surrogate / world model environments driven by deep neural dynamics ($W_\psi$).
- Observation builders that bridge high-frequency DCS sensors and low-frequency, delayed laboratory assays.

---

## Guidelines Index

| Guide | Description | Key Reference |
|---|---|---|
| [Kiln Simulation Environment](./kiln-simulation-env.md) | Gymnasium environment contract, action/observation spaces, reward/cost functions | `ref/RL运行指标决策/code/simple_kiln_env.py` |
| [Delays & POMDP](./delays-and-pomdp.md) | Multi-rate sampling, 60–120 min lab assay delays, soft-sensor integration, episode truncation | `ref/RL运行指标决策/08_烧成系统MDP_CMDP建模.md` |

---

## Environment Lifecycle Contract

1. **Step Interval**: Fixed at $\Delta t = 5\text{ minutes}$ (matches DCS supervisor scan frequency).
2. **Action Space**: Box space representing normalized increments $\Delta Y^{sp} \in [-1, 1]^K$, mapped to real physical ranges via `RATE`.
3. **Step Signature**: Must return the standard 5-tuple:
   `obs, reward, terminated, truncated, info`
   - `terminated`: Always `False` for continuing processes.
   - `truncated`: `True` when reaching maximum horizon $H$ (e.g., 12 or 72 steps).
   - `info`: Must include `cost`, energy breakdown (`coal`, `elec`), and true clinker quality (`fcao_true`).
