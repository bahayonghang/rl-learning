# Interactive formula cases / 交互公式案例

The ten bilingual cases connect a question, editable inputs, an original equation, numerical substitution, intermediate results and an interpretation. They extend the existing eight math-primer calculators and fourteen labs. They do not run training, evaluate an actual plant or issue control commands.

中文页面的字段、预设、反馈、解释与导出使用中文；英文页面使用英文。每个案例保留完整的“背景 → 输入与单位 → 原式 → 代入 → 结果 → 解释 → 来源”链条。章节与研究专题复用相同计算模块，多案例章节用选择器切换，避免连续堆叠多个大型表单。

## Cases and hand-checkable examples

All numbers below are deterministic teaching inputs. Computation uses full JavaScript floating-point precision; the display normally shows up to six decimal places and uses scientific notation for very small or large numbers.

| Route suffix | Learning question | Default hand check | Useful counterexample |
|---|---|---|---|
| `return-bootstrap` | Does stopping collection erase future value? | −1 + 0.9×2 + 0.9²×3 = 3.23; tail = 0.9³×4 = 2.916; target = **6.146** | True termination gives **3.23**; external truncation retains the tail |
| `bellman-expectation` | How does a fixed action average two possible outcomes? | 0.7×(3 + 0.9×5) + 0.3×(−2 + 0.9×1) = **4.92** | A sample observes one outcome; the expectation does not guarantee each outcome |
| `td-update` | What changes between TD(0), SARSA and Q-learning? | SARSA selects next-action B: target −0.1, error −2.1, new estimate **1.58** | Q-learning selects maximum Q: target 2.6, new estimate **2.12** |
| `gae` | How do residuals propagate without crossing a reset? | Residuals (1.4, 0.35, 2.3), γλ = 0.72, advantages **(2.84432, 2.006, 2.3)** | λ=0 returns each residual; λ=1 returns finite bootstrapped return minus V |
| `ppo-clip` | Which side clips when the advantage changes sign? | Ratio 0.3/0.2=1.5; min(1.5×2, 1.2×2) = **2.4** | A=−2 and ratio 0.5 gives min(−1, −1.6) = **−1.6** |
| `sac-target` | How do twin target critics and entropy form a target? | 1 + 0.99×[min(5,6) − 0.2×(−1.2)] = **6.1876** | Positive continuous log density is allowed; log π=0.5 gives **5.851** |
| `cql-regularizer` | How does a high unrecorded-action Q affect a discrete CQL term? | Q=(1,4,0), recorded A: gap **3.0658839037574293**, TD loss 0.125, total **3.1908839037574293** | Add 1000 to every Q and the fixed TD target; the losses remain unchanged |
| `setpoint-response` | Why does a measured process value differ from the setpoint? | a=0.5 requests +1°C; SP=881°C; PV=879+0.28×2 = **879.56°C** | Rejecting the request holds SP=880°C while PV still reaches **879.28°C** |
| `energy-reward` | Can good energy reward conceal an independent constraint violation? | Coal z=−1, electricity z=0.5, regularity=−0.025; reward **0.375** | q=1.8%, O₂=1.05% leaves reward unchanged but gives costs **0.3 and 0.15 percentage points** |
| `constraint-lagrangian` | Does the largest relaxed score imply budget feasibility? | At λ=2, L(A)=9.6, L(B)=9.1; relaxed winner **A**, budget-feasible winner **B**, updated λ=**2.1** | If both costs exceed the budget, the result explicitly reports no feasible candidate |

The catalogue is `#/cases`; an individual case is `#/cases/{id}`. Case metadata also maps each example into relevant chapters and research topics. Internal static exports contain no website-only hash links and no HTML anchor IDs that could repeat when a case appears in several chapters.

## Mathematical conventions and sources

### Returns, Bellman backups and TD

The tutorial consistently uses the sequence `S_t, A_t, R_(t+1), S_(t+1)`. The first observed reward in a segment has discount exponent zero. A three-step bootstrapped return uses γ³ for the final V estimate. `bellman-expectation` backs up a **fixed** state-action pair through two outcomes; it neither maximizes over actions nor claims to have solved a Bellman fixed point. TD(0) treats input A as V(s′); SARSA uses the sampled next-action Q; Q-learning uses the maximum of the two next-action Q estimates.

Reference: [Sutton and Barto, *Reinforcement Learning: An Introduction*, second edition, Chapters 3, 6 and 7](https://incompleteideas.net/book/the-book-2nd.html).

### Termination, external truncation and GAE

`d` denotes true task termination. `e` denotes a trajectory/collector boundary. At an external cutoff, `d=0,e=1`: retain the final-state V bootstrap and stop the advantage trace. A finite-horizon endpoint intrinsic to the task is termination, not this external cutoff. The last GAE continuation is zero; no reset-state value is borrowed from another trajectory.

The GAE calculation reuses the existing `generalizedAdvantage` kernel with separate terminal and boundary arrays. The original paper’s reward indexing is translated consistently into this tutorial’s `R_(t+1)` convention.

References: [Gymnasium, Handling Time Limits](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/); [Schulman et al., Generalized Advantage Estimation, Section 3, equations 11–16 and λ endpoint discussion](https://arxiv.org/html/1506.02438v6).

### PPO

The case is one sample’s clipped surrogate, maximized. Its negative is shown separately for minimization. Old and new inputs are **discrete action probabilities**, with a strictly positive denominator. The implementation computes the minimum after multiplying both candidates by the fixed advantage, so the clipping side reverses for negative advantages. Neither the ratios nor policy parameters are globally hard-clamped by PPO-Clip.

References: [Schulman et al., Proximal Policy Optimization Algorithms, equation 7](https://arxiv.org/abs/1707.06347); [OpenAI Spinning Up, PPO-Clip equations](https://spinningup.openai.com/en/latest/algorithms/ppo.html).

### SAC

The target is `r + γ(1−d)[min(Q₁,Q₂) − α log π]`, using two target critics and one next action sampled from the current policy. The log-density input is assumed to include required squashing/scale corrections. A continuous density can exceed one, so its log may be positive. True termination removes the entire future Q-and-entropy contribution. The same entropy contribution is not also added to the immediate reward.

Reference: [OpenAI Spinning Up, Soft Actor-Critic, target-Q equation](https://spinningup.openai.com/en/latest/algorithms/sac.html).

### Discrete CQL

This is a finite three-action CQL(H) teaching loss for one state and one recorded action: `α[LSE(Q) − Q_data] + 0.5(Q_data − y)²`, with fixed target y. It is not a continuous-action CQL implementation. Log-sum-exp subtracts the maximum before exponentiation; the conservative gap uses `(max Q − Q_data) + log(sum exp(Q−max Q))` directly to reduce cancellation. Its shown derivatives apply to the conservative term alone. Theory about lower bounds requires the paper’s assumptions and supplies no safety guarantee for this three-action example.

Reference: [Kumar et al., Conservative Q-Learning for Offline Reinforcement Learning, equation 4; Appendix F for continuous-action approximations](https://arxiv.org/html/2006.04779v3).

### Industrial reward, setpoints and constraints

These cases reuse the project’s existing teaching constants in `src/kiln/math.ts`, without changing them: the first setpoint increment rate is 2°C per five-minute step, the setpoint range is 860–900°C and the first tracking coefficient is 0.28. The scalar response is one slice of the workbench; it omits coupled CV dynamics, disturbances, full gates and delays. It does not replace the primer’s separate simplified demonstration.

The energy case uses fixed coal reference 134 kg/t with scale 4 kg/t, electricity reference 25 kWh/t with scale 1 kWh/t, and default weights 0.6, 0.4 and 0.05. Only the first executed action component varies; other components are zero. Quality cost uses the existing teaching range 0.5–1.5% and oxygen cost the existing 1.2% lower bound. Costs remain separate from the energy/regularity reward. Delayed quality is an evaluation sample, not a current online policy input. These values are project conventions, not universal industrial limits or fitted plant data.

Reference: [existing kiln-workbench model contract](./kiln-workbench.en.md) and its implementation in `src/kiln/math.ts`.

### Lagrangian ranking

`J_r` and `J_c` are supplied expected discounted totals with a shared horizon/discount convention. The relaxed score maximizes `J_r − λ(J_c−d)`. Budget filtering checks `J_c≤d` separately and ranks feasible candidates by return. The multiplier update uses the cost of the explicitly selected **evaluated current policy**, not the winning candidate as though it had been executed. Projection to [0,100] has a teaching numerical cap; the source’s nonnegative update has no such universal industrial cap. This is a primal-dual illustration, not the full CPO algorithm. Expected-cost feasibility remains distinct from hard execution gates.

Reference: [Achiam et al., Constrained Policy Optimization, Section 4, primal-dual baseline equation 16, and Appendix 10.3.3](https://arxiv.org/html/1705.10528v1).

Primary sources were checked on 2026-11-14. Formula definitions retain their direct source links on screen and in exported snapshots.

## Module and API contract

| Module | Responsibility |
|---|---|
| `src/formula-case-math.ts` | Pure numerical calculations, finite/domain guards, reuse of existing return, TD, PPO, GAE and kiln constants/cost kernels |
| `src/formula-cases.ts` | Typed bilingual definitions, parameters/units, three presets per case, mappings, validation, deterministic presentation and Markdown snapshots |
| `src/formula-case-view.ts` | DOM controls, immediate recalculation, presets/reset, validation feedback, export of current inputs, catalogue and contextual mounts |
| `src/formula-cases.css` | Theme-aware responsive layouts, local formula/table scrolling and print treatment |
| `tests/formula-cases.test.ts` | Independent hand arithmetic, boundary cases, strict KaTeX rendering, exports and DOM interaction |

`getFormulaCases(locale?)` returns plain localized `id`, `topic`, `title`, `description`, `scenario`, plus `chapterIds`, `researchIds`, `tags`. `getFormulaCase(id,locale?)` returns one metadata item; `getFormulaCaseDefinition(id)` returns its typed full definition. `defaultFormulaValues(id)` returns a fresh parameter map.

`evaluateFormulaCase(id,raw,locale?)` returns `{ok:true,values,presentation}` or `{ok:false,errors}`. Empty strings, whitespace, missing values, nonfinite values, range violations and invalid select values fail visibly. Invalid inputs remove the previous success results and disable export. Authored numeric bounds are teaching UI ranges, not industrial admissibility checks.

`formulaCaseMarkdown(id,locale?,values?)` exports the full current calculation, or defaults when values are omitted. The starting scenario is explicitly labeled as using defaults, with the current values in the input table. `chapterFormulaCasesMarkdown(chapterId,locale)` and `researchFormulaCasesMarkdown(researchId,locale)` concatenate the relevant default snapshots without duplicate anchors.

All view entry points return a cleanup function:

```ts
mountFormulaCase(host, id)
mountFormulaCasesForChapter(host, chapterId)
mountFormulaCasesForResearch(host, researchId)
renderFormulaCasesPage(host, id = '')
```

The parent router imports the stylesheet. The view deliberately has no CSS import, enabling real DOM tests through Node/tsx and JSDOM. Mounts capture the active locale; the existing router remounts the view when the site language changes. Recalculation replaces only the result pane, preserving the active input and focus. Cleanup removes handlers and revokes outstanding export object URLs.

## Validation and review

Run the focused checks from `rl-learning-web/`:

```sh
node --import tsx --test tests/formula-cases.test.ts
npm run typecheck
```

The tests independently check the numbers in the table above, γ/λ endpoints, true termination, both PPO advantage signs and helpful/harmful directions, positive SAC log density, CQL shift invariance and a finite-difference derivative, rejected setpoint progression, reward-versus-cost separation, no-feasible-candidate reporting and multiplier projection. Both languages and all presets undergo strict KaTeX validation. A small γ=1e−7 regression checks that scientific notation stays grouped when raised to powers.

The DOM test checks live input changes without focus loss, hidden stale results after blank/range errors, preset switching, reset, current-value Markdown export, listener cleanup, contextual case switching, all ten English mounts and catalogue filtering. It does not substitute for visual browser review. Review the integrated case route and a chapter at 375 px and desktop widths in both themes: equations should scroll inside their own regions, labels remain associated with native inputs, errors remain visible and page-level horizontal overflow should be absent. No animation is introduced, so reduced-motion preferences require no additional behavior.
