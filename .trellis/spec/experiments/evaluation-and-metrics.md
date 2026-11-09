# Industrial Evaluation & Metrics Guidelines

> Evaluation criteria, reporting templates, and benchmark protocols for kiln operational decision-making.

---

## 1. Multi-Objective Evaluation Criteria

In academic RL, a single scalar return $\sum r_t$ is commonly reported. For process operations, agents must report the exact decoupled physical metrics:

| Metric Symbol | Physical Meaning | Target Direction | Acceptance Threshold |
|---|---|---|---|
| $J_f$ | Specific Coal Consumption ($\text{kg/t}$) | Minimize ($\downarrow$) | Lower than operator baseline |
| $J_e$ | Specific Electricity Consumption ($\text{kW}\cdot\text{h/t}$) | Minimize ($\downarrow$) | Lower than operator baseline |
| $\text{Pass}_{q}$ | Free Lime (f-CaO) Compliance Rate | Maximize ($\uparrow$) | $\ge 95.0\%$ within $[0.5, 1.5]\%$ |
| $J_q$ | Distance to Energy-Saving Preference Band | Minimize ($\downarrow$) | Narrower deviation from $[1.0, 1.5]\%$ |
| $J_s$ | Setpoint Smoothness / Curvature | Minimize ($\downarrow$) | No high-frequency reversals |
| $\text{Gate}_{\text{block}}$ | Safety Gate Interception Rate | Minimize ($\downarrow$) | $\le 5\%$ in normal steady state |

---

## 2. Mandatory Baseline Comparisons

All experimental evaluations must contrast candidate RL policies against:

1. **Operator Baseline (`operator_policy`)**:
   - Represents the behavioral policy $\mu(a|s)$ in historical operations.
   - Evaluated under identical disturbance sequences (identical raw meal KH random walks).
2. **PG-MOEA/D-IEpsilon**:
   - The established multi-objective evolutionary optimization benchmark.
   - Known benchmark: 7-day rolling horizon yielded Coal $-1.61\%$, Electricity $-1.34\%$, f-CaO compliance $95.05\%$.
3. **Candidate RL Policy ($\pi_\theta$)**:
   - Evaluated both before and after the 5-layer Safety Gate filtering.

### Standard Comparative Reporting Table Template

```markdown
| Method | Coal (kg/t) | Elec (kW·h/t) | f-CaO Pass Rate | Gate Interceptions | Inference Time |
|---|---|---|---|---|---|
| Zero Action | 135.2 ± 0.8 | 25.5 ± 0.2 | 91.2% | 0 | < 1 ms |
| Operator Baseline | 134.6 ± 1.1 | 25.4 ± 0.3 | 94.1% | 2 (Gate 4) | < 1 ms |
| PG-MOEA/D-IEpsilon | 132.8 ± 0.9 | 25.1 ± 0.2 | 95.1% | 0 | 8.6 s / window |
| **RL Candidate (Raw)** | 131.9 ± 1.4 | 24.9 ± 0.4 | 93.8% | 14 | 2.1 ms |
| **RL Candidate (Gated)** | 132.4 ± 1.0 | 25.0 ± 0.3 | 95.4% | 0 (fallback) | 2.5 ms |
```

---

## 3. Statistical Testing Protocol

RL training dynamics exhibit high variance. For all reported metrics:
- Run evaluation across a minimum of **5 distinct random seeds** (e.g., seeds 42, 43, 44, 45, 46).
- Report mean $\pm$ standard deviation.
- Record the exact number of Gate 1 through Gate 5 triggers to identify which constraint is most actively binding.
