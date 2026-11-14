# Kiln workbench: teaching model, data clocks, and implementation limits

## 1. Purpose and entry point

The web route is `#/kiln`. The standalone mounting function is in `src/kiln/workbench.ts`:

```ts
import { mountKilnWorkbench } from './kiln/workbench';
const cleanup = mountKilnWorkbench(host);
// Call when leaving the page; there are no timers or background simulation tasks.
cleanup();
```

This is a reproducible browser teaching environment. It shows how one supervisory setpoint adjustment passes through inner-loop tracking, thermal inertia, material transport, assay sampling, and result publication to become the next available observation. It trains no RL policy, communicates with no equipment, and makes no claim that the model was identified from a real kiln.

The page distinguishes three categories:

- **Project conventions:** a five-minute decision cycle, normalized setpoint increments, the rates and bounds of the simplified three-dimensional action, the existing 13-dimensional observation order, quality and oxygen thresholds, five gate layers, and continuing-task truncation semantics.
- **Teaching assumptions:** the dynamic coefficients, noise scales, sampling/publication intervals, raw-material scenarios, first-order inner-loop proxy, soft-sensor equation, OOD calibration means and standard deviations, and energy reference values and weights documented here.
- **Results of the current calculation:** charts, tables, gate states, and comparisons are calculated step by step from the current seed and executed actions. They are not preset training curves.

These conventions come from the repository's [AGENTS.md](../../AGENTS.md), [kiln simulation environment specification](../../.trellis/spec/environments/kiln-simulation-env.md), [delay and POMDP specification](../../.trellis/spec/environments/delays-and-pomdp.md), and [constrained RL and safety-gate specification](../../.trellis/spec/algorithms/safe-constrained-rl.md). This page does not modify `ref/`, the formal environment's state dimension, or the production safety contract.

## 2. Five suggested experiments

### Experiment A: a 2°C SP change does not imply a 2°C PV change

Select the stable scenario and seed 42. Choose “Manual candidate increment” and set `[a꜀, a₂, aP] = [1, 0, 0]`. Answer the prediction question, then execute one five-minute step.

SP immediately changes from `[880, 1100, −80]` to `[882, 1100, −80]`. The noise-free tracking term for Tc is only `0.28 × (882 − 880) = 0.56°C`. The disturbance for seed 42 makes the actual Tc PV approximately `880.468113°C`. The latest available assay still comes from the historical sample taken at −60 minutes; the new action cannot rewrite that sample.

After resetting, select “One pulse + 11 hold steps” to watch one action continue to affect the process over 60 minutes. The button requests the current manual increment once, then proposes `[0,0,0]` for the following 11 steps. Every step passes independently through the gate. “Execute 12 consecutive steps” instead repeats the manual increment; it does not hold one unchanged SP for 12 steps.

### Experiment B: the process has changed, so why has the assay not changed?

After a single pulse, switch to “Hold current setpoints” and continue to 120 minutes. The six-step material queue makes the pulse's causal effect on true quality appear no earlier than step 7. A sample taken at 60 minutes does not enter the observation until 120 minutes.

With seed 42, one initial `[1,0,0]` pulse, and a hold thereafter, the assay available at 120 minutes is approximately `1.102148%`, sampled at 60 minutes. Current teaching ground truth is approximately `1.042414%`. Their difference is not a programming error: the values describe different production times.

Expand the teaching view or select “Overlay teaching truth” to inspect the delay. Those hidden values are absent from the conservative feedback function's input. The page consistently separates data available to a policy from simulator information used only for evaluation.

### Experiment C: holding does not stop the process

Select the low-oxygen, OOD, and unauthorized-APC scenarios in turn. Inspect the next-step preview, then execute one step.

Low oxygen triggers Gate 2; the preset high T₂ first triggers Gate 3; disabled simulated APC triggers Gate 5. Rejection sets the executed increment to zero and holds SP, while PV, stored heat, quality, energy use, and assay clocks continue. An existing low-oxygen condition does not disappear merely because the interface says “hold.” The gate checks the current available observation and candidate; it provides no perfect guarantee about delayed quality.

### Experiment D: why not optimize reward alone?

Try different increments over a sufficiently long window and observe coal use, electricity use, reward, and both constraint costs. Quality and oxygen violations enter their respective cost columns; costs are not silently folded into reward. A high energy reward at one step does not establish satisfaction of industrial constraints.

The three-method comparison starts from the same physical state, pending-assay queue, and random disturbances. It does not advance the main trajectory. It compares holding, a repeated manual increment, and an explicitly stated conservative rule: all are teaching candidates. There are no Operator behavior data or PG-MOEA/D-IEpsilon calculations, so this is not a completed formal project-baseline evaluation.

### Experiment E: the window ends, but the kiln does not terminate

Execution is capped at 72 steps, or six hours. Buttons then stop advancing, and history contains at most 73 state points, including the initial state. The resulting flags are `terminated = false, truncated = true`.

If the final step is used as a temporal-difference sample, its target remains `r + γV(s′)`. A time limit is not a physical absorbing terminal state; `truncated` must not remove future value. The page links to the TD laboratory and related chapters for further explanation of bootstrapping.

## 3. Actions, setpoints, and the inner-loop proxy

Each step lasts five minutes. The normalized candidate action is

\[
a_t=(a_t^c,a_t^2,a_t^P)\in[-1,1]^3.
\]

The three channels are calciner outlet temperature Tc, secondary-air temperature T₂, and kiln-hood pressure P, in that order. Gating produces the executed increment `a_t^exec`; all three components are zero after rejection. Then:

\[
\Delta SP_t=a_t^{exec}\odot(2,5,5),\qquad
SP_{t+1}=SP_t+\Delta SP_t.
\]

| Channel | Initial SP | Project SP lower bound | Project SP upper bound | RATE per five minutes |
|---|---:|---:|---:|---:|
| Tc | 880°C | 860°C | 900°C | 2°C |
| T₂ | 1100°C | 1000°C | 1200°C | 5°C |
| P | −80Pa | −120Pa | −40Pa | 5Pa |

Actions do not directly set coal-valve, fan, or damper MVs. The page does not simulate a full inner controller; a first-order tracking model approximates its aggregate effect:

\[
PV_{t+1,i}=PV_{t,i}+\alpha_i(SP_{t+1,i}-PV_{t,i})+\epsilon_{t+1,i},
\quad \alpha=(0.28,0.18,0.45).
\]

Independent channel disturbances have teaching standard deviations `(0.12°C, 0.30°C, 0.15Pa)`. Pressure and temperature are not treated as the same physical dimension; the three channels simply occupy a fixed vector order.

A positive pressure increment makes pressure less negative, for example from −80Pa to −75Pa. Temperature, pressure, material beds, and actuators interact more intricately in real equipment. No coefficient here should directly define a production control rule.

## 4. Hidden dynamics and material delay

Let `n = t + 1` denote the new state step. Teaching raw-meal KH is

\[
KH_n=0.95+0.018\,\mathbf{1}[\text{raw-material scenario and }n\ge6]
+0.0015\sin(n/4)+0.0004\xi_n.
\]

`ξ` is standard normal noise. Other scenarios omit the 0.018 step change. Step 6 corresponds to 30 minutes.

The hidden thermal proxy H adds inertia:

\[
H_n=0.88H_{n-1}+0.12\left(T_{c,n}+0.08(T_{2,n}-1100)\right).
\]

A first-in, first-out material queue has six entries, each containing `(H,KH)`. At each step, the oldest entry is read to calculate quality; it is then removed and the current `(H_n,KH_n)` is appended. All six initial entries are `(880,0.95)`.

For the delayed material `(H^{delay},KH^{delay})`,

\[
q_n^{target}=1.10-0.035(H^{delay}-880)+12(KH^{delay}-0.95),
\]

\[
q_n=\operatorname{clip}(0.75q_{n-1}+0.25q_n^{target}+0.008\xi_n,0.1,3.0).
\]

Initially, `H = 880°C` and `q = 1.10%`. An H change caused by a step-1 action is first read from the queue at step 7. This is an explicit discrete-time convention. True quality may fluctuate during the first six steps because of noise, but those fluctuations are not yet the temperature pulse's causal effect. Tests compare paired pulse/hold trajectories with the same seed to cancel shared disturbances and verify this distinction.

Every coefficient and clipping interval is a teaching assumption chosen to illustrate a mechanism, not a cement-reaction law or an identified kiln model. Material transport, sensor response, sample analysis, and result publication are modeled separately rather than collapsed into one delay constant.

## 5. Oxygen, energy use, and soft sensing

### Oxygen proxy

\[
O_{2,n}^{target}=1.65-0.008(T_{c,n}-880)-0.009(P_n+80)
-0.75\,\mathbf{1}[\text{low-oxygen scenario}],
\]

\[
O_{2,n}=\operatorname{clip}(0.7O_{2,n-1}+0.3O_{2,n}^{target}+0.012\xi_n,0.4,4.0).
\]

Normal initial O₂ is 1.65%; the low-oxygen scenario starts at 1.05%. Oxygen is measured in percent. Subsequent costs measure violation magnitude in percentage points; do not reinterpret these values as a fractional oxygen level of 0.012.

### Energy proxies

\[
F_n=134+0.18(T_{c,n}-880)-0.025(T_{2,n}-1100)
+20(KH_n-0.95)+0.12\xi_n,
\]

\[
E_n=25+0.009(T_{2,n}-1100)+0.020(-P_n-80)+0.025\xi_n.
\]

Illustrative units are kg/t for F and kWh/t for E. T₂ has coefficients of opposite signs in the two equations to illustrate a possible trade-off. These are not plant coal/electricity models; the denominators, noise, and temporal aggregation have not been identified from plant metering.

### Current soft estimate

\[
\hat q_n=\operatorname{clip}(1.10-0.025(T_{c,n}-880)
-0.002(T_{2,n}-1100)+14(KH_n-0.95)+0.02\sin(n/5),0.2,2.5).
\]

This equation uses only currently visible variables and the clock. It accesses neither true q, hidden H, future assays, nor future noise. It is not a trained neural network and deliberately does not duplicate the true quality dynamics. An instantaneous algebraic estimate of a process with memory leaves visible errors; observing them is part of the lesson.

## 6. Assay clocks and observation boundaries

A sample is taken every 12 steps, or 60 minutes. Each assay is published after an additional 12 steps, another 60 minutes. Sampling reads `q_sample + 0.005ξ` into a pending queue. Values not yet published remain inside the simulator.

Initialization defines two explicit teaching samples:

- Historical sample: sample step −12, release step 0, value 1.10%. Available at the start, with age one hour.
- Starting-point sample: sample step 0, release step 12, value 1.10%. Unavailable to the observation before step 12.

Each transition first updates the physical state and possibly samples it, then publishes every sample satisfying `releaseStep ≤ currentStep`. Unreleased samples do not enter `latestAssay`. Sample age is always

\[
lab\_age=(currentStep-sampleStep)\times5/60\quad\text{hours}.
\]

The page lists sampling time, publication time, and sample age separately. The orange available-assay curve is stepwise and changes only at publication. It does not backfill a later result into the sample's past timestamp.

The policy's 13-dimensional input strictly preserves the existing order:

```text
[Tc, T2, P, Tc_sp, T2_sp, P_sp,
 coal, elec, O2, KH, lab_fcao, lab_age_hours, soft_fcao]
```

`observeKiln` also exposes explanatory metadata such as step, minutes, and assay timestamps. It does not return H, q, the material queue, or pending assay values. The parameter type of `conservativeFeedback` accepts only this observation object. Optional truth curves and quality costs belong to the evaluation channel and must not be mistaken for online feedback already available to the policy. A formal industrial POMDP often also needs history; this page does not claim that one 13-dimensional vector is a complete Markov state.

## 7. Reward, action smoothness, and separate constraint costs

Reward uses post-transition energy metrics and the increment actually executed. This aligns time as `o_t → a_t → r_{t+1}, o_{t+1}`. Another repository notation may label the same transition's reward r_t; its meaning must remain consistent with the stored transition.

\[
z_F=(F_n-134)/4,\qquad z_E=(E_n-25)/1,
\]

\[
r_n^{energy}=-0.6z_F-0.4z_E,
\]

\[
r_n^{smooth}=-0.05\left(\|a_t^{exec}\|^2
+\|a_t^{exec}-a_{t-1}^{exec}\|^2\right),
\]

\[
r_n=r_n^{energy}+r_n^{smooth}.
\]

The previous executed increment starts at `[0,0,0]`. After rejection, the current executed increment is zero. Smoothness is calculated using this zero, and the following step compares against it as well. An unexecuted request must not be treated as if it caused an actual energy or setpoint change.

Two constraint costs are returned separately:

\[
c_{q,n}=\max(0,0.5-q_n)+\max(0,q_n-1.5),
\qquad c_{O_2,n}=\max(0,1.2-O_{2,n}).
\]

The f-CaO interval `[0.5,1.5]%` and O₂ threshold `1.2%` are project conventions, not universal industry standards. Simulator evaluation uses hidden truth for the quality cost; it neither exposes unpublished quality to the policy nor subtracts cost from r. A complete CMDP additionally requires cost budgets, constraint evaluation, and a candidate-policy solver. This workbench separates the meanings of these objects.

For seed 42, the first `[1,0,0]` action yields coal use approximately `133.888711`, electricity use `24.995417`, energy term `0.0185264`, smoothness term `−0.1`, and reward `−0.0814736`. Noise can influence a single step's coal-use change. This point cannot identify a real causal temperature–coal-use slope.

## 8. Five gate layers

The gate inspects currently available observations and the candidate before deciding whether to update SP. Layers after the first failure display “Not checked,” not “Passed.”

| Layer | Check implemented in this workbench | Meaning |
|---|---|---|
| Gate 1: data | All 13 observation values and 3 candidate values are finite | A teaching finite-value subcheck; production sensor validity also needs ranges and quality codes |
| Gate 2: state | O₂ ≥ 1.2%; all three PVs within `[SP_LOW−20, SP_HIGH+20]` | Project example thresholds, interpreted in each component's units |
| Gate 3: model domain | Three-dimensional PV `max abs((PV−μ)/σ) ≤ 4` | 4 is the project convention; the projection and μ, σ are teaching approximations |
| Gate 4: action | Each component in `[−1,1]`; infinity-norm difference from the previous executed increment ≤ 1.5 | Bounded supervisory increments and the project's change limit |
| Gate 5: execution | Simulated APC flag enabled; each candidate SP within its mechanical bounds | A teaching Boolean flag and 3D SP limits, with no external authorization interface |

Teaching OOD calibration uses `μ=[880,1100,−80]` and `σ=[5,15,10]`. Production checks should use the training/calibration domain; this 3D projection cannot replace formal support checks. The OOD scenario starts at PV `[895,1180,−80]`. T₂ is `80/15 ≈ 5.33σ` from the calibration mean while remaining inside the core state envelope, so Gate 3 rejects it.

The Gate 2 example envelopes are Tc `[840,920]°C`, T₂ `[980,1220]°C`, and P `[−140,−20]Pa`. These express the existing example numerically; they do not treat 20°C and 20Pa as an identical physical margin. No new production threshold is introduced.

Every rejection uses `a_exec=[0,0,0]` and holds current SP; inner tracking, disturbances, and time continue. Even passing all layers does not prove that delayed quality will remain acceptable. Gating cannot replace complete validation of state estimation, physical interlocks, and constrained policies.

## 9. Hold, conservative feedback, and matched-disturbance comparisons

The hold candidate is always zero. A manual candidate equals the slider values and is requested again at every consecutive step.

Conservative feedback is an explicit, untrained heuristic:

\[
a_c=\operatorname{clip}(2(\hat q-1.15),-0.2,0.35),
\]

\[
a_2=\operatorname{clip}(0.2(1100-SP_2)/5,-0.25,0.25),\qquad
 a_P=\operatorname{clip}(0.2(-80-SP_P)/5,-0.25,0.25).
\]

It reads only the soft estimate and current SP. The value 1.15 is a teaching soft-estimate target, not a new quality acceptance threshold. This rule is neither a trained RL policy nor an observed plant Operator policy.

Random values use the existing Mulberry32 and Box–Muller functions. The generator at step n depends only on `(seed + n × 104729) mod 2³²`, independently of the action. Branches draw noise in the same order at each matching step, sharing external disturbances. Their actions change subsequent states through their respective dynamics, not by changing the order of random draws.

The comparison starts every branch from the same complete physical state and assay queue and rolls out at most 12 steps. Its table reports mean F, mean E, cumulative undiscounted reward, both cumulative costs, and rejection count. Costs are summed within the teaching window; they are not already-estimated infinite-horizon constraint metrics. Changing the main trajectory, manual action, or mode clears the old comparison so stale results cannot be mistaken for the current experiment.

Available assays can be identical over a short window. This reflects delayed information, not necessarily identical true quality across branches.

## 10. Implementation and validation

File responsibilities:

- `src/kiln/math.ts`: pure state transitions, gating, observations, rewards/costs, seeding, and comparisons from a common start.
- `src/kiln/workbench.ts`: process-stage explanations, controls, prediction feedback, charts, expanded calculations, observation/truth separation, and cleanup.
- `src/kiln/kiln.css`: scoped responsive styles using global color variables.
- `tests/kiln.test.ts`: nine groups of distinct numerical and semantic regression checks.

Run:

```sh
node --import tsx --test tests/kiln.test.ts
npm run typecheck
```

Tests cover action scaling and first-order tracking; sampling/publication times and age; exclusion of future assays and hidden quality from policy input; material delay after a pulse; individual rejection at all five layers; SP holding while physical time continues; seed reproducibility and shared branch disturbances; separation of quality/oxygen costs from reward; and the 72-step limit with retained bootstrap at truncation.

The page has no automatic timer. One-step, twelve-step, and comparison operations are bounded synchronous calculations. Listeners attach to the supplied host and are removed at unmount. Charts contain at most 73 main state points and 12 comparison points, with no unbounded cache. On narrow screens, tables and SVGs scroll inside local containers to retain readable coordinate labels; the page itself should not overflow horizontally. Additional DOM event smoke checks passed for the expected one-step PV, unchanged main clock after comparison, scenario reset, APC fallback, disabling at 72 steps, and no response after cleanup. These checks do not replace visual acceptance; actual browser and narrow-screen layout are reviewed with the complete website.
