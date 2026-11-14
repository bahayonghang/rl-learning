# Interactive laboratories

The application contains exactly 14 original browser experiments. All stochastic demonstrations use a local seeded PRNG; this does not claim bitwise equivalence to NumPy or PyTorch.

| ID | Actual computation |
|---|---|
| return | Finite discounted trajectory and discrete expected reward |
| bandit | Bernoulli epsilon-greedy/UCB1 and cumulative pseudo-regret |
| bellman | Synchronous policy or optimality backup on a two-state MDP |
| gridworld | Exact 4×4 deterministic transitions and value iteration |
| td | Numeric MC, TD and n-step targets with termination/truncation distinction |
| cliff | Seeded SARSA and Q-learning on the standard 4×12 cliff setup |
| replay | Scalar TD with sampled replay and periodic target copies |
| overestimation | Gaussian Monte Carlo with split selection/evaluation |
| policy-gradient | Sampled REINFORCE updates to a three-action softmax policy |
| gae | Backward residual accumulation with separate bootstrap/reset masks |
| ppo | Exact clipped surrogate for either advantage sign |
| gaussian | Gaussian/tanh density, entropy and fixed-policy SAC-style objective |
| seeds | Multiple bandit runs with seed-level bootstrap intervals |
| safety | Five-layer local checks and zero-increment fallback |

`src/labs/math.ts` exposes the pure numerical kernels. `tests/labs.test.ts` checks hand-calculated targets, termination masks, exact shortest-path value, PPO sign behavior, transformed-density normalization and each gate's failure path.

## Scope and limitations

The replay demonstration is a scalar model, not a complete DQN implementation, and cannot measure decorrelation benefits. The Gaussian laboratory evaluates a fixed policy rather than training a SAC actor or critic. Plots are computed from the displayed toy experiments; they are not fabricated neural training curves. A confidence interval from a few seeds does not establish generalization.

The safety laboratory extracts one normalized CV. Bounds [0,1] and RATE=0.05 are teaching units, not replacements for the industrial observation/action contract. Existing project O2, OOD and curvature thresholds are kept. No physical controller, network equipment, historian or production dataset is connected. Its gate display is a logic demonstration, not a verified production safety system.

`labAliases` maps `expectation` to `return` and `sac` to `gaussian`. Offline RL has no misleadingly relabeled online experiment.

## Primary references

- Sutton and Barto: https://incompleteideas.net/book/the-book-2nd.html
- Gymnasium time limits: https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/
- PPO: https://arxiv.org/abs/1707.06347
- GAE: https://arxiv.org/abs/1506.02438
- Double Q-learning: https://papers.nips.cc/paper/3964-double-q-learning
- SAC: https://arxiv.org/abs/1801.01290
- Project safety conventions: `../../AGENTS.md`, not universal engineering standards.
