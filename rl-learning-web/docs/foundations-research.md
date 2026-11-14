# Foundations curriculum: research and implementation notes

Reviewed: 2026-11-13 (America/New_York). Scope: chapters 01–12.

## Pedagogical design

The supplied public article proposes a useful sequence: interaction and return → mathematical modeling → tabular evaluation and control → function approximation → policy optimization. This implementation follows that sequence while writing original explanations, numerical examples, code and exercises. It does not reproduce paid course content or the supplied promotional illustrations.

Each chapter contains a concrete problem, an explanation of why the method is needed, formulas with a consistent reward-time convention, a worked example, implementation guidance, limitations and a solved exercise. The assumed learner already understands basic neural networks but benefits from a concise probability bridge.

The industrial context is drawn from the repository's `AGENTS.md`. It is used to explain why temporal availability, bounded setpoint increments, partial observability and constraints matter. No existing state dimensions, safety thresholds, reference files or physical control interfaces are changed.

## Original technical decisions and clarifications

1. **Reward timing:** use `(S_t, A_t, R_{t+1}, S_{t+1})` consistently. Other indexing conventions are acknowledged rather than labeled erroneous.
2. **Ending semantics:** sampler reset uses `terminated or truncated`; value bootstrap ordinarily stops only on true termination. A finite horizon inherent to the task is distinguished from an external time limit, with remaining time included in the state where needed.
3. **Bandit comparisons:** distinguish realized cumulative reward from pseudo-regret based on known simulator arm means. Never present pseudo-regret as a directly observed real-world quantity.
4. **Markov modeling:** a history window reduces aliasing but does not prove that a partially observed physical process has become fully observable.
5. **MC versus TD:** explanations retain the sampling and target assumptions; they avoid blanket claims that MC is always unbiased or TD always better.
6. **SARSA versus Q-learning:** the familiar cliff example depends on continuing exploration and its environment definition. SARSA does not provide a generic safety guarantee.
7. **Function approximation:** value estimation is distinguished from dynamics modeling. Replay reduces temporal correlation without magically guaranteeing i.i.d. data.
8. **Double DQN:** online network selects, target network evaluates. Two networks alone do not define Double DQN. Correlated network errors and possible underestimation are acknowledged.
9. **Policy gradients:** the finite-horizon discounted objective explicitly retains the outer `gamma**t` factor when reward-to-go uses relative discounting. Loss normalization by trajectories versus timesteps is distinguished.
10. **Illustrative limits:** browser mechanisms and toy grid training are not full Atari training, calibrated kiln simulations or industrial performance evidence.

## Verified primary references

| Topic | Source | URL |
|---|---|---|
| Standard RL definitions | Sutton & Barto, *Reinforcement Learning: An Introduction*, 2018, publisher record | https://mitpress.mit.edu/9780262039246/reinforcement-learning/ |
| Foundational lectures | David Silver, UCL RL lectures, 2015 | https://www.davidsilver.uk/teaching/ |
| Probability prerequisites | Joe Blitzstein, Harvard Stat110 | https://stat110.hsites.harvard.edu/ |
| MDP/POMDP and planning | Kochenderfer, Wheeler & Wray, *Algorithms for Decision Making*, 2022, authors' site | https://algorithmsbook.com/decisionmaking/ |
| UCB | Auer, Cesa-Bianchi & Fischer, 2002 | https://doi.org/10.1023/A:1013689704352 |
| Environment endings | Farama Foundation, Gymnasium official documentation | https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/ |
| TD | Sutton, 1988, university-hosted original paper | https://jmvidal.cse.sc.edu/library/sutton88a.pdf |
| Q-learning | Watkins & Dayan, 1992, author's paper and errata page | https://www.gatsby.ucl.ac.uk/~dayan/papers/wd92.html |
| Off-policy instability | Jiang et al., ICML 2021 | https://proceedings.mlr.press/v139/jiang21j.html |
| Target network theory | Fellows, Smith & Whiteson, ICML 2023 | https://proceedings.mlr.press/v202/fellows23a.html |
| DQN | Mnih et al., Nature, 2015 | https://doi.org/10.1038/nature14236 |
| DQN implementation | PyTorch official tutorial | https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html |
| Double Q-learning | van Hasselt, NeurIPS 2010 | https://proceedings.neurips.cc/paper_files/paper/2010/hash/091d584fced301b442654dd8c23b3fc9-Abstract.html |
| Double DQN | van Hasselt, Guez & Silver, arXiv 2015 / AAAI 2016 | https://arxiv.org/abs/1509.06461 |
| REINFORCE | Williams, Machine Learning, 1992 | https://doi.org/10.1007/BF00992696 |
| Policy-gradient derivation | OpenAI Spinning Up official documentation | https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html |

The Sutton author's old domain failed retrieval in this session, so the stable MIT Press record is used. The Nature and UCB DOI redirects did not expose their full texts to the retrieval tool, but bibliographic metadata was independently verified and the tutorial uses independently derived standard formulas and original examples. No claims about the papers' benchmark improvements are reproduced.

## Implementation inventory

- `src/content/foundations.ts`: 12 typed chapters, 16 source records, 4 Mermaid diagrams and 12 solved exercises.
- Chapter IDs are `01`–`12`; modules are 1 (01–03), 2 (04–08), 3 (09–11), 4 (12).
- Laboratory links: return, bandit, bellman, gridworld, td, cliff, replay, overestimation, policy-gradient. Chapter 03 intentionally has no standalone expectation lab.
- `public/code/tabular_foundations.py`: a Python-standard-library 4×4 deterministic gridworld with exact value iteration, Q-learning or SARSA, seeded tie-breaking, explicit true termination and external truncation, and independent evaluation sampling.

## Verification of the runnable example

Commands executed:

```bash
python public/code/tabular_foundations.py --method q_learning --seed 42
python public/code/tabular_foundations.py --method sarsa --seed 42
```

Both 400-episode runs completed a six-move evaluation route. The dynamic-programming start value and evaluated discounted return were both `-5.2981621875` at gamma 0.95. This agreement is a sanity check on this tiny deterministic environment and seed, not a statistical performance claim. Q-learning had one training time-limit truncation; SARSA had none. The learning target retains bootstrap on such truncations.

The chapter snippets are explicitly instructional kernels. Snippets using torch require surrounding network/batch setup; the download above is the fully runnable self-contained example. Full neural training is linked to the official PyTorch tutorial instead of being claimed as executed here.
