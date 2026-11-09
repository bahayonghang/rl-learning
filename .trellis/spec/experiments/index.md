# Experiments Guidelines

> Evaluation standards, benchmark baselines, reproducibility rules, and reporting protocol for industrial RL experiments.

---

## Overview

Industrial operational decision-making requires rigorous evaluation. Unlike standard gaming or robotics benchmarks (e.g., MuJoCo, Atari), a policy cannot be declared successful based solely on average episodic return. It must balance multiple physical dimensions:
- Thermodynamic efficiency (coal consumption).
- Electrical efficiency (fan/motor power consumption).
- Quality compliance (f-CaO strictly inside the $[0.5, 1.5]\%$ band).
- Equipment preservation (actuator smoothness, avoidance of rapid thermal shock).

---

## Guidelines Index

| Guide | Description | Key Reference |
|---|---|---|
| [Evaluation & Metrics](./evaluation-and-metrics.md) | Multi-objective metrics, baseline comparisons (Operator policy, PG-MOEA/D-IEpsilon) | `ref/RL运行指标决策/07_阶段6_与MOEAD对比结合.md`, `12_课题背景精简版.md` |
| [Reproducibility & Safety](./reproducibility-and-safety.md) | Seed management, deterministic evaluation, terminology constraints (simulation vs real site) | `ref/RL运行指标决策/00_README.md`, `14_ChatGPT_Project_Instructions_粘贴版.md` |

---

## Key Baseline Comparison Requirements

Every RL experiment in this repository must benchmark against two mandatory baselines:
1. **Operator / Heuristic Behavioral Policy**: Simulates historical human manual adjustments (`operator_policy` in `simple_kiln_env.py`).
2. **Evolutionary Optimization Baseline**: Reference performance from **PG-MOEA/D-IEpsilon** (the project's existing multi-objective evolutionary algorithm with IEpsilon constraint handling).
