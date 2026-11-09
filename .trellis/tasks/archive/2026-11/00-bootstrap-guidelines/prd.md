# Bootstrap Task: Fill Project Development Guidelines

> RL for Process Industry Operational Metric Decision (Cement Clinker Calcining System)

This bootstrap task tailors the Trellis specification layer (`.trellis/spec/`) to the actual domain of this repository: applying reinforcement learning to clinker calcining operational decisions (coal consumption, electricity consumption, clinker quality f-CaO, and stability).

---

## Status

- [x] Analyze process industry domain context and reference materials (`ref/RL运行指标决策`)
- [x] Remove inapplicable web frontend/backend templates
- [x] Populate algorithm guidelines (`algorithms/index.md`, `offline-rl.md`, `model-based-rl.md`, `safe-constrained-rl.md`)
- [x] Populate environment guidelines (`environments/index.md`, `kiln-simulation-env.md`, `delays-and-pomdp.md`)
- [x] Populate experiment guidelines (`experiments/index.md`, `evaluation-and-metrics.md`, `reproducibility-and-safety.md`)
- [x] Ensure all specs are backed by working code patterns (`simple_kiln_env.py`, `safety_gate.py`) and contain zero placeholders

---

## Spec Files Populated

### 1. Algorithms (`.trellis/spec/algorithms/`)
- `index.md`: Overview and selection matrix for offline RL, world-model rollouts, and CMDP.
- `offline-rl.md`: TD3+BC, CQL, IQL, distribution shift mitigation, `d3rlpy` dataset formatting, FQE evaluation.
- `model-based-rl.md`: Integration with world model $W_\psi$ (CSC-MTWaveSME), short-horizon branching rollouts ($H \in [12, 72]$), uncertainty penalties (MOPO).
- `safe-constrained-rl.md`: CMDP formulation, Lagrangian dual optimization, 5-layer Safety Gate (`Gate1`–`Gate5`), fallback to $Y_{safe}$.

### 2. Environments (`.trellis/spec/environments/`)
- `index.md`: Environment lifecycle and Gymnasium API standards.
- `kiln-simulation-env.md`: Process mapping (6 CVs / 3 CV toy model), observation space, incremental action space $\Delta Y^{sp}$, reward and cost functions.
- `delays-and-pomdp.md`: 60–120 min lab assay delays, POMDP state augmentation, data age tracking, continuing task truncation protocol (`truncated` vs `terminated`).

### 3. Experiments (`.trellis/spec/experiments/`)
- `index.md`: Experiments and evaluation overview.
- `evaluation-and-metrics.md`: Physical metrics ($J_f, J_e, \text{Pass}_q, J_s$), comparative benchmarking against Operator Policy and PG-MOEA/D-IEpsilon.
- `reproducibility-and-safety.md`: Multi-seed control, deterministic evaluation, zero live-plant trial rule, simulation/deduction terminology boundary.
