<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

# Project Context: RL for Process Industry Operational Metric Decision

> **Domain Mission**: Sequence decision-making using Reinforcement Learning (RL) for operational metrics optimization (specific coal consumption, electricity consumption, clinker free lime f-CaO, and process stability) in industrial process systems — specifically cement clinker calcining (山西某水泥熟料烧成系统).

---

## 1. Toolchain & Environment

| Action | Command / Target | Notes |
|---|---|---|
| Environment Activation | `conda activate rl` | Python 3.11 environment |
| Core PyTorch | `pip install torch --index-url https://download.pytorch.org/whl/cu121` | PyTorch $\ge 2.0.0$ |
| RL Toolchain | `pip install "gymnasium[classic-control]" stable-baselines3 d3rlpy matplotlib pandas` | Standard RL & Offline RL libraries |
| Kiln Env Verification | `python ref/RL运行指标决策/code/simple_kiln_env.py` | Validates `SimpleKilnEnv` integrity & baseline |
| Safety Gate Verification | `python ref/RL运行指标决策/code/safety_gate.py` | Validates 5-layer safety gate execution |
| Lint & Style | `ruff check .` / `black --check .` | Adhere to PEP 8 standards |

---

## 2. Operating Boundaries & Guardrails

### NEVER (Strict Invariants)
- **NEVER execute online exploratory actions on live industrial production equipment**: Online trial-and-error is strictly forbidden on physical kilns. Interaction is permitted only within simulation environments (`SimpleKilnEnv`, world model surrogate $W_\psi$).
- **NEVER bypass the Five-Layer Safety Gate**: Candidate setpoint suggestions must pass Gate 1–5 before any simulated DCS dispatch; any failure must immediately fallback to $Y_{\text{safe}}$.
- **NEVER claim simulation/deduction results as real-site closed-loop energy savings**: Results from $W_\psi$ or `SimpleKilnEnv` must strictly be termed "simulation rollouts" or "deductions" (推演).
- **NEVER modify read-only reference materials in `ref/`**: Files under `ref/RL运行指标决策/` and `ref/repo/` are reference knowledge and must remain untouched.
- **NEVER hardcode CUDA device IDs without CPU fallback**: Always use `torch.device("cuda" if torch.cuda.is_available() else "cpu")`.
- **NEVER commit large checkpoint binaries or dataset files to Git**: Large weights (`*.pt`, `*.pth`) and raw logs belong in `.gitignore`.
- **NEVER modify the Trellis-managed block**: The section between `<!-- TRELLIS:START -->` and `<!-- TRELLIS:END -->` must be preserved intact.

### ALWAYS (Mandatory Practices)
- **ALWAYS ensure experimental reproducibility**: Explicitly set identical seeds across `random`, `numpy`, `torch` (including CUDA deterministic flags), and Gymnasium environments.
- **ALWAYS define action space as bounded setpoint increments**: Output normalized increments $a_t = \Delta Y^{sp} \in [-1, 1]^K$ scaled by physical rate limits `RATE`. Never bypass DCS inner PID/APC loops to directly actuate MVs.
- **ALWAYS formulate quality and environmental constraints via CMDP**: Product quality (f-CaO within $[0.5, 1.5]\%$) and combustion oxygen ($O_2 \ge 1.2\%$) are hard physical boundaries; model them as constrained costs $c_k$, not arbitrary scalar reward penalties.
- **ALWAYS follow continuing task termination semantics**: In Gymnasium steps, set `terminated = False` and `truncated = (t >= horizon)`. Never mark timeout steps as terminal, which corrupts Q-value bootstrapping.
- **ALWAYS benchmark against project baselines**: Compare candidate RL policies against the Operator behavioral policy (`operator_policy`) and the existing evolutionary optimization benchmark (**PG-MOEA/D-IEpsilon**).

### ASK (Clarification Triggers)
- **ASK** before introducing new heavy third-party framework dependencies.
- **ASK** before changing the POMDP state dimension or altering safety gate threshold parameters.
- **ASK** before initiating compute-heavy multi-epoch offline training runs.

---

## 3. Repository Architecture & Knowledge Map

```
.
├── .trellis/                 # Trellis workflow, specs, task tracking & journals
│   └── spec/
│       ├── algorithms/       # Offline RL, Model-based RL, Safe CMDP guidelines
│       ├── environments/     # Kiln simulation envs, POMDP & time-delay guidelines
│       └── experiments/      # Multi-objective metrics, reproducibility standards
├── ref/
│   ├── RL运行指标决策/        # Process industry RL knowledge package
│   │   ├── 01_总路线图与逐日计划.md   # Phased curriculum & milestones
│   │   ├── 08_烧成系统MDP_CMDP建模.md # Official mathematical modeling definitions
│   │   ├── 12_课题背景精简版.md       # PhD dissertation background & model architecture
│   │   └── code/                    # Verified prototype code (simple_kiln_env.py, safety_gate.py)
│   └── repo/
│       └── hands-on-modern-rl/      # Open-source RL codebook & reference implementations
├── AGENTS.md                 # This instruction file for AI agents
└── .gitignore                # Git exclusions
```

---

## 4. Domain & Algorithmic Contracts

### Decision Cycle & Control Structure
- **Decision Step ($\Delta t$)**: $5\text{ minutes}$.
- **Control Hierarchy**: RL Agent outputs CV setpoints $\to$ DCS/APC regulatory loops manipulate MVs $\to$ Physical kiln process.
- **Controlled Variables (CV)**: Calciner outlet temp ($T_c$), kiln inlet smoke chamber temp ($T_{\text{inlet}}$), secondary air temp ($T_2$), tertiary air temp ($T_3$), kiln hood pressure ($P$), grate cooler chamber 1 pressure ($P_{\text{cooler}}$).

### State Representation (POMDP)
$$o_t = \big[ X_{t-23:t} \text{ (120 min history)},\; Y^{sp}_t,\; \hat{q}_t \text{ ($S_\theta$ soft-sensor)},\; q^{\text{lab}}_\tau \text{ (delayed assay)},\; t-\tau \text{ (assay age)},\; \text{raw meal moduli (KH, SM, IM)} \big]$$

### Reward & Multi-Objective Trade-Off
$$r_t = - \left( w_f \frac{F_t - \bar{F}}{\sigma_F} + w_e \frac{E_t - \bar{E}}{\sigma_E} \right) - w_s \big( \|a_t\|^2 + \|a_t - a_{t-1}\|^2 \big)$$
- Objective: Minimize coal consumption $F_t$ and electricity consumption $E_t$ while enforcing setpoint smoothness.

### Five-Layer Safety Gate
Every candidate action $\Delta Y^{sp}$ must pass:
1. **Gate 1 (Data Safety)**: NaN/Inf detection, sensor range check.
2. **Gate 2 (State Safety)**: Core CV boundaries, $O_2 \ge 1.2\%$ combustion safety.
3. **Gate 3 (Model Credibility)**: Mahalanobis / $z$-score out-of-distribution (OOD) check against historical operational domain ($z \le 4.0$).
4. **Gate 4 (Optimization Feasibility)**: Curvature and acceleration limits ($\|\Delta a_t - \Delta a_{t-1}\|_\infty \le 1.5$).
5. **Gate 5 (Execution Protection)**: Hard mechanical high/low setpoint bounds and APC authorization flag.
*Pass $\to$ Dispatch $Y_d$; Fail $\to$ Maintain current operating point $Y_{\text{safe}}$.*
