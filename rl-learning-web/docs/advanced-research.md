# Advanced curriculum: research and verification

Research checked on 2026-11-13. These chapters are original educational synthesis and worked examples. They do not reproduce the paid course referred to by the promotional article. Numerical examples are hand calculations or explicitly identified dimensionless teaching simulations; no industrial savings or benchmark ranking is claimed.

## Chapters and primary sources

| Chapters | Source | Verified use |
|---|---|---|
| 13 | [Schulman et al., GAE](https://arxiv.org/abs/1506.02438) | Weighted TD residual advantage estimate; distinguish complete returns from bootstrapped rollout segments. |
| 14 | [Schulman et al., TRPO](https://arxiv.org/abs/1502.05477) | Local surrogate, KL constraint and the gap between theoretical assumptions and practical approximations. |
| 14–15 | [Schulman et al., PPO](https://arxiv.org/abs/1707.06347) | Frozen old policy probabilities, finite minibatch reuse and clipped surrogate. |
| 15 | [OpenAI Spinning Up PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html) | PPO clipping removes some incentive; it does not enforce a hard probability-ratio or KL bound. |
| 16–17 | [Haarnoja et al., SAC](https://arxiv.org/abs/1801.01290) | Maximum-entropy objective and change-of-variables density correction. |
| 17 | [Haarnoja et al., SAC Algorithms and Applications](https://arxiv.org/abs/1812.05905) | Later SAC variant and automatic temperature tuning. |
| 17 | [OpenAI Spinning Up SAC](https://spinningup.openai.com/en/latest/algorithms/sac.html) | Twin Q, reparameterized policy and slow target updates. |
| 18 | [Fujimoto et al., TD3](https://arxiv.org/abs/1802.09477) | Twin critics address a specific overestimation mechanism, not universal estimation error. |
| 18, 20 | [Stable-Baselines3 RL Tips](https://stable-baselines3.readthedocs.io/en/master/guide/rl_tips.html) | Independent evaluation and multiple runs. Algorithm selection table is the tutorial's reasoned design aid, not a benchmark result. |
| 19 | [Farama, Custom Environments](https://gymnasium.farama.org/introduction/create_custom_env/) | Current reset/step contract and per-environment RNG. |
| 13, 19, 21 | [Farama, Handling Time Limits](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) | Bootstrap on external truncation; do not bootstrap at true terminal states; preserve final observation before autoreset. |
| 20, 24 | [Agarwal et al., Statistical Precipice](https://arxiv.org/abs/2108.13264) | Report uncertainty; respect training seeds as experimental units. |
| 22 | [Kumar et al., CQL](https://arxiv.org/abs/2006.04779) | Static-data distribution shift and conservative Q regularization. |
| 22 | [Kostrikov et al., IQL](https://arxiv.org/abs/2110.06169) | Expectile value fitting and advantage-weighted behavior cloning. |
| 18, 22 | [Fujimoto and Gu, TD3+BC](https://arxiv.org/abs/2106.06860) | Lightweight offline baseline; behavior regularization and normalization. |
| 23 | [Janner et al., MBPO](https://arxiv.org/abs/1906.08253) | Short model rollouts branched from real states. |
| 23 | [Yu et al., MOPO](https://arxiv.org/abs/2005.13239) | Model uncertainty penalties in offline policy optimization, subject to assumptions. |
| 21, 24 | [Achiam et al., CPO](https://arxiv.org/abs/1705.10528) | Separate reward and constrained cost; expected constraint is different from stepwise safety. |
| 24 | [Rafailov et al., DPO](https://arxiv.org/abs/2305.18290) | Brief optional connection to language-model preference learning; not described as ordinary online PPO. |
| 18, 21, 24 | [Project AGENTS.md](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md) | Existing process variables, 5-minute interval, bounded setpoint increments, 24-sample observation window and five-layer gate conventions. |

## Deliberate corrections to promotional simplifications

- PPO clips a surrogate objective; actual ratios can leave the interval and performance/safety are not guaranteed.
- GAE uses two distinct masks: termination controls value bootstrap, while termination or truncation stops trace propagation across resets.
- SAC entropy is not a physical safety constraint. Tanh bounds an action value, not a system trajectory.
- The displayed SAC equations consistently use the common modern twin-Q variant, not an accidental mixture with the original separate V network.
- Continuous-action density can exceed one; differential entropy can be negative and changes under coordinate scaling.
- Off-policy methods are not automatically reliable offline algorithms on a fixed log.
- IQL's in-sample value-learning mechanism does not guarantee deployment always stays inside data support.
- CMDP expected cumulative costs do not imply per-step hard-boundary guarantees.
- Baseline and threshold figures from the repository are project conventions. The tutorial does not promote them to universal physical rules or independently verified field results.
- Reference paths in AGENTS.md are not present in the accessible repository checkout. No world-model weights, industrial dataset, full operator implementation or PG-MOEA/D-IEpsilon implementation were available for a genuine industrial comparison.

## Local runnable companions

### `public/code/advanced_math_checks.py`

Standard library only. Verified with Python 3.12.14:

- GAE residual recursion gives `[1.6768, 0.94, 2]`.
- Time truncation keeps the final-state bootstrap but blocks trace leakage from the reset episode.
- True termination drops bootstrap.
- Four positive/negative-advantage PPO cases match the teaching table.
- Tanh density at zero and physical scaling agree with closed-form values; stable correction stays finite at large input.

Command: `python public/code/advanced_math_checks.py`.

### `public/code/advanced_toy_env.py`

Verified with Gymnasium 1.4.0 and NumPy 2.5.4, installed in a temporary QA directory outside the repository. `check_env(..., skip_render_check=True)` passed. Five seeded hold-setpoint versus elementary feedback rollouts executed successfully.

This is a dimensionless, one-dimensional API teaching environment. It is not a physical kiln model, does not replace the project's POMDP contract, has no DCS connection and claims no industrial energy or quality results. The observation consists only of abstract process value, setpoint and target. Real domain safety gates remain a separate project requirement.

Command after installing Gymnasium and NumPy: `python public/code/advanced_toy_env.py`.

## Content verification

- Twelve complete chapters, IDs 13–24, with objectives, prerequisites, equations, original numerical examples, code or structured implementation reasoning, pitfalls, and expandable exercise answers.
- Twenty source records with directly checked primary-source URLs.
- Seven Mermaid diagrams across policy optimization, continuous control, modeling, offline and model-based topics.
- All lab links use implemented experiment IDs: `gae`, `ppo`, `gaussian`, `seeds`, `safety`.
- TypeScript typecheck passed after the content file was complete; mathematical rendering is checked separately using KaTeX with strict error reporting.
