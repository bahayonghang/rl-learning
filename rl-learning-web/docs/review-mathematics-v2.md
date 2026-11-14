# Independent mathematics and reasoning review — RL Atlas v2

Review date: 2026-11-14. Reviewer scope is the research content and its technical claims. The review is read-only for `src/research/`; corrections described below were made by the research author. This report does not duplicate the root agent's formula-rendering, interface, route, export, or build checks.

## Review status

Completed substantive review of all nine research pages: `formulation.ts` (history, indicators, objectives), `optimization.ts` (evolution), `reinforcement.ts` (sequential, architecture), and `outlook.ts` (evidence, open problems, agenda). The last two pages were reviewed after the author completed them.

The reviewed material has no unresolved substantive mathematical error after the three corrections below. The distinction between educational examples, proposed research interfaces, simulation evidence, and plant execution is maintained.

## Findings and verified corrections

### 1. Specific-energy aggregation at zero-production intervals — corrected in both languages

**Location:** `formulation.ts`, indicators page, section 2.

The original equality between the aggregate ratio and a production-weighted average of interval ratios did not state its positivity conditions. The same page explicitly includes startup and shutdown periods. An interval with zero production and nonzero energy has an undefined interval-specific ratio. Dropping it also changes the total accounting boundary.

Counterexample: energy `[100, 900]` kWh and production `[0, 100]` t have aggregate specific energy `(100 + 900) / 100 = 10` kWh/t. Removing the zero-production period reports 9 and hides 100 kWh of overhead.

The author added the required conditions in both languages: positive total production for the aggregate ratio; positive production in every interval for the weighted-ratio expansion; retain zero-production energy in the total numerator; report total energy and operating status separately when the entire window has zero production. The 10-versus-9 example is present. Re-read and confirmed in the current source.

### 2. Negative log density described as a density — corrected

**Location:** `reinforcement.ts`, architecture page, section 3, Chinese worked example.

The numerical result `−0.7821` is the logarithm of the transformed action density. The Chinese sentence initially called it a transformed density, which could incorrectly suggest that a density may be negative. The English sentence already said log density.

The author changed the Chinese label to “变换后的对数密度”. The formula and numerical calculation did not need modification. Re-read and confirmed. The corresponding density is positive, approximately `exp(−0.7821) = 0.4574`.

### 3. A per-step probability bound used as an exact probability — corrected in both languages

**Location:** `outlook.ts`, open-problems page, section 4.

The initial example moved from an at-most-1% violation probability at each step to an equality for the probability of any violation in 100 independent steps. Independence alone does not make an upper bound exact. If every per-step probability is at most 0.01, the independent joint risk is at most `1 − 0.99^100`; it equals that expression when all the per-step probabilities are exactly 0.01.

The author now states the exact-1% assumption for the 63.4% numerical example and explicitly identifies the expression as an upper bound under the at-most-1% assumption. Both languages retain the qualification that dependence invalidates the product calculation. Re-read and confirmed.

## Numerical and mathematical checks

| Topic | Independently checked calculation or condition | Result |
| --- | --- | --- |
| Dynamic operating cost | `[0,4]` versus `[1,1]` at discount 0.9 gives 3.6 versus 1.9 | Correct |
| Specific electricity | 26,000 kWh / 300 t = approximately 86.67 kWh/t | Correct |
| Ratio versus total | 96 versus 100 kWh/t is a 4% reduction; 14,400 versus 10,000 kWh is a 44% increase | Correct |
| Fuel heat input | 100 kg/t × 25 MJ/kg = 2.5 GJ/t; 90 × 30 = 2.7 GJ/t | Correct; 10% mass reduction and 8% heat-input increase are distinct |
| Normalized preferences | A/B/C scores `−0.46, 0, 0.32` and `0.44, 0, −0.48` | Correct |
| Nonconvex Pareto example | For normalized nonnegative weights, one endpoint costs at most 1 while the middle point always costs 1.1 | Correct demonstration of an unsupported nondominated point |
| Gaussian upper chance constraint | 1.2 + 1.645 × 0.2 = 1.529; 1.1 + 1.645 × 0.2 = 1.429 | Correct one-sided illustration; lower-tail and joint-horizon requirements remain explicit |
| NSGA-II crowding | The two interior distances are 1.0 and 1.5, with neighbors sorted separately for each objective | Correct |
| Tchebycheff scalarization | Weight pair `(0.8,0.2)` gives 0.8 versus 1.6; `(0.2,0.8)` gives 3.2 versus 1.6 | Correct |
| Sequential negative-cost return | `−1 − 0.9 × 5 = −5.5`; `−2 − 0.9 × 1 = −2.9` | Correct |
| Discount-normalized CMDP | Multiplying an infinite discounted constant cost by `1−gamma` recovers that cost; changing normalization requires changing the budget | Correct |
| Multiplier direction | Cost 0.12, budget 0.10, step 0.5 increases the nonnegative multiplier by 0.01 | Correct for reward maximization with a subtracted constraint term |
| Tanh change of variables | `atanh(0.5) ≈ 0.5493`; Gaussian log density about −1.0698; subtract log(0.75) to get about −0.7821 | Correct |
| SAC target | `−0.4 + 0.9 × (−2 + 0.14) = −2.074` | Correct entropy sign and twin-critic minimum |
| Entropy temperature | Descent on `alpha × (estimated entropy − target entropy)` increases positive alpha when entropy is too low | Correct update direction with detached entropy estimate |
| IQL expectile loss | At tau 0.7, residuals +2 and −2 contribute 2.8 and 1.2 | Correct asymmetric squared-error weights |
| Trajectory importance ratio | Five consecutive increases give ratio `5^5 = 3125` and behavior probability `0.1^5 = 10^-5` in the specified constant-probability example | Correct; support and behavior-information limitations remain explicit |
| Multistep model-error recurrence | With normalized error 0.02 and sensitivity 1.2, the three-step bound is 0.0728 and the ten-step bound is about 0.519174 | Correct geometric sum; open-loop and closed-loop sensitivity assumptions are separated |
| Independent horizon risk | At exactly 1% risk on each independent step, `1 − 0.99^100 = 0.6339677` | Correct after the bound/equality wording correction |
| Zero-event confidence bound | Zero events in 100 independent, identically distributed complete experiments gives one-sided 95% upper bound `1 − 0.05^(1/100) = 0.0295130` | Correct; the event is defined per complete experiment, not per time step |

The Bellman expression keeps the action expectation separate from the transition expectation. The Markov condition is stated as a conditional-independence assumption, not a claim that stacked measurements automatically satisfy it. The ideal belief update is followed by an explicit distinction between a sufficient information state and a practical learned history representation.

The request-domain critic includes the gate in the environment. The execution-domain critic instead evaluates actual executed actions and must compose with the gate when scoring requests. The text does not silently differentiate through rejection, relabel executed actions as sampled requests, or evaluate the original request likelihood at a replacement action. It correctly notes that hold fallback can create an atom in the executed-action distribution.

Physical setpoint changes and smoothing use executed increments. Rejection advances the process rather than freezing it. Costs remain separate from energy reward. Termination masks exclude external sampling truncation, and advantage recursion does not cross resets. Assay sample time, release time, and decision-time availability remain distinct.

## Independent primary-source spot checks

The review opened the original sources below, in addition to checking the repository's cited text. These are selective semantic checks, not a claim that every bibliography record was independently re-audited here.

- [Conservative Q-Learning, original full text](https://arxiv.org/html/2006.04779v3), section 3 and equations 2–4: the article's distinction between policy-value conservatism and an arbitrary pointwise neural lower bound is supported. The tutorial retains assumptions and does not present its discrete regularizer as a ready-made continuous-action implementation.
- [Soft Actor-Critic Algorithms and Applications, original full text](https://arxiv.org/html/1812.05905v2), sections 4–5 and appendix C: the actor, temperature direction, and tanh Jacobian match the method. The tutorial does not transfer robotic evidence into kiln results.
- [Implicit Q-Learning, original full text](https://arxiv.org/html/2110.06169v1), section 4: the expectile loss, value-based target, and advantage-weighted policy extraction are consistent. Avoiding out-of-data Q queries during value training is not described as an absolute support guarantee for a fitted policy.
- [Predictive safety filter, open author manuscript](https://arxiv.org/html/1812.05506v4): the source uses a model-based backup construction, uncertainty treatment, and safety conditions. The tutorial correctly distinguishes these ingredients from a generic threshold Gate box.
- [Yokogawa–JSR official report](https://www.yokogawa.com/news/press-releases/2022/2022-03-22/): the stated distillation-unit trial dates, 35-day duration, simulator training, and DCS/interlock integration match the report. The review page preserves its first-party evidential status and does not transfer economic outcomes to cement calcination.
- [DeepMind's official operational account](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/): candidate prediction, local verification, uncertainty handling, and human override are supported. The tutorial neither identifies an unsupported PPO/SAC implementation nor uses its savings percentage to estimate kiln benefits.

## Final outlook and research-agenda review

The open-problems page distinguishes a uniform one-step model-error bound from observed RMSE. Its recurrence is conditional on a valid sensitivity bound over the comparison domain. A common action sequence needs a dynamics-state bound; separate feedback on real and modeled states requires a closed-loop bound such as `Lx + La × Lpolicy`. Discrete rejection gates are explicitly identified as potentially violating global continuity. The geometric bound is presented as an illustrative conditional calculation, not an identified kiln certificate.

The horizon-risk example and zero-event confidence bound preserve different probability objects. The first concerns any violation over a horizon under an explicitly specified independent-step example. The second concerns binary outcomes from independent complete experiments for a fixed policy. Neither is relabeled as a guarantee of zero risk, and correlated points from one trajectory are not treated as independent experiments.

The agenda's 2 × 2 study separates instantaneous/history input from one-step/multistep targets. The n-step expression retains the first reward's weight of 1 and the tail value's weight of `gamma^n`. It specifies genuine termination, time-limit bootstrapping, reset boundaries, and the need to state an off-policy correction or accepted bias. It does not claim that uncorrected behavioral multistep returns are universally unbiased for a different target policy.

Missing requested actions are recorded as unavailable rather than fabricated from execution. The proposed temporal split also accounts for history overlap, forecast horizon, and assay-release delay; decision-time ordering alone is not represented as sufficient. Training, validation, and final testing have distinct roles. Baseline implementations and industrial data remain prerequisites, not implied existing results.

All six research hypotheses provide a comparison design and an outcome that would fail to support the claim. They keep action authority, gates, information availability, and computational preparation visible, distinguish behavior cloning from additional value-learning benefit, and reject circular model-only evaluation. The final decision protocol requires a meaningful effect threshold and acknowledges inconclusive intervals. It does not equate a satisfied training cost budget with plant safety or removal of the gate.

CVaR was not introduced in these pages; the author deliberately retained the verified chance-constraint and CMDP treatment rather than adding an unverified risk-measure claim. No additional CVaR theorem or tail convention requires review in this edition.

**Final review outcome:** three concrete issues identified and corrected, with no unresolved substantive mathematics or reasoning defect found in the nine reviewed pages. This conclusion is limited to the authored derivations, examples, and stated evidential scope. It is not empirical validation of an industrial controller.
