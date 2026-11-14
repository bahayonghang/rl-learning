import type { Chapter, Source } from '../../types';

export const advancedSourcesEn: Source[] = [
  { id: 'gae-paper', title: 'High-Dimensional Continuous Control Using Generalized Advantage Estimation', author: 'Schulman et al.', year: '2015 / ICLR 2016', url: 'https://arxiv.org/abs/1506.02438', note: 'Advantage estimation and the bias–variance trade-off; distinguish complete trajectories from truncated segments when reading the equations.' },
  { id: 'trpo-paper', title: 'Trust Region Policy Optimization', author: 'Schulman et al.', year: '2015', url: 'https://arxiv.org/abs/1502.05477', note: 'Changes in policy distributions, KL constraints, and practical algorithmic approximations.' },
  { id: 'ppo-paper', title: 'Proximal Policy Optimization Algorithms', author: 'Schulman et al.', year: '2017', url: 'https://arxiv.org/abs/1707.06347', note: 'The original paper introducing the PPO clipped surrogate objective.' },
  { id: 'spinup-ppo', title: 'Spinning Up: Proximal Policy Optimization', author: 'OpenAI', year: 'Official documentation', url: 'https://spinningup.openai.com/en/latest/algorithms/ppo.html', note: 'Clipping for positive and negative advantages, and why clipping is not a hard constraint.' },
  { id: 'sac-paper', title: 'Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor', author: 'Haarnoja et al.', year: '2018', url: 'https://arxiv.org/abs/1801.01290', note: 'The maximum-entropy objective and transformed policy densities.' },
  { id: 'sac-applications', title: 'Soft Actor-Critic Algorithms and Applications', author: 'Haarnoja et al.', year: '2018 / 2019', url: 'https://arxiv.org/abs/1812.05905', note: 'Automatic temperature adjustment and common modern SAC variants.' },
  { id: 'spinup-sac', title: 'Spinning Up: Soft Actor-Critic', author: 'OpenAI', year: 'Official documentation', url: 'https://spinningup.openai.com/en/latest/algorithms/sac.html', note: 'Reference implementation explanations for twin Q-functions, reparameterization, and target networks.' },
  { id: 'td3-paper', title: 'Addressing Function Approximation Error in Actor-Critic Methods', author: 'Fujimoto, van Hoof & Meger', year: '2018', url: 'https://arxiv.org/abs/1802.09477', note: 'TD3, twin critics, and delayed policy updates.' },
  { id: 'gym-custom', title: 'Create a Custom Environment', author: 'Farama Foundation', year: 'Official documentation', url: 'https://gymnasium.farama.org/introduction/create_custom_env/', note: 'Gymnasium reset, step, space definitions, and environment randomness.' },
  { id: 'gym-time-limits', title: 'Handling Time Limits', author: 'Farama Foundation', year: 'Official documentation', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/', note: 'The difference in bootstrapping between natural termination and external truncation.' },
  { id: 'sb3-tips', title: 'Reinforcement Learning Tips and Tricks', author: 'Stable-Baselines3', year: 'Official documentation', url: 'https://stable-baselines3.readthedocs.io/en/master/guide/rl_tips.html', note: 'Independent evaluation, repeated runs, environment checks, and experimental practice.' },
  { id: 'rliable-paper', title: 'Deep Reinforcement Learning at the Edge of the Statistical Precipice', author: 'Agarwal et al.', year: '2021', url: 'https://arxiv.org/abs/2108.13264', note: 'Uncertainty with few random seeds, interval estimation, and aggregation across tasks.' },
  { id: 'cql-paper', title: 'Conservative Q-Learning for Offline Reinforcement Learning', author: 'Kumar et al.', year: '2020', url: 'https://arxiv.org/abs/2006.04779', note: 'Distribution shift in offline data and conservative value learning.' },
  { id: 'iql-paper', title: 'Offline Reinforcement Learning with Implicit Q-Learning', author: 'Kostrikov, Nair & Levine', year: '2021 / ICLR 2022', url: 'https://arxiv.org/abs/2110.06169', note: 'Expectile value estimation and advantage-weighted behavioral cloning.' },
  { id: 'td3bc-paper', title: 'A Minimalist Approach to Offline Reinforcement Learning', author: 'Fujimoto & Gu', year: '2021', url: 'https://arxiv.org/abs/2106.06860', note: 'TD3+BC as a useful first offline RL baseline.' },
  { id: 'mbpo-paper', title: 'When to Trust Your Model: Model-Based Policy Optimization', author: 'Janner et al.', year: '2019', url: 'https://arxiv.org/abs/1906.08253', note: 'Short model rollouts branched from real samples.' },
  { id: 'mopo-paper', title: 'MOPO: Model-based Offline Policy Optimization', author: 'Yu et al.', year: '2020', url: 'https://arxiv.org/abs/2005.13239', note: 'Offline model error, uncertainty penalties, and their assumptions.' },
  { id: 'cpo-paper', title: 'Constrained Policy Optimization', author: 'Achiam et al.', year: '2017', url: 'https://arxiv.org/abs/1705.10528', note: 'Constrained policy optimization with separate rewards and costs.' },
  { id: 'dpo-paper', title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model', author: 'Rafailov et al.', year: '2023', url: 'https://arxiv.org/abs/2305.18290', note: 'Optional reading: the distinction between preference optimization and online policy optimization.' },
  { id: 'project-contract', title: 'rl-learning project domain conventions', author: 'bahayonghang / rl-learning', year: 'Repository conventions', url: 'https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md', note: 'Observation, setpoint-increment, threshold, and five-layer gate conventions for the kiln case; these are not universal engineering standards.' },
];

export const advancedChaptersEn: Chapter[] = [
  {
    id: '13', number: 13, module: 4, title: 'Actor–Critic and GAE',
    subtitle: 'Use value estimates to give policy updates a more stable direction', duration: 40, level: '进阶',
    prerequisites: ['07', '12'], objectives: ['Distinguish the optimization objectives of the actor and critic', 'Derive the backward GAE recursion from TD residuals', 'Handle termination, bootstrapping, and trajectory boundaries correctly'],
    tags: ['Actor-Critic', 'Advantage function', 'GAE'], lab: 'gae', sources: ['gae-paper', 'gym-time-limits'],
    body: String.raw`## Why REINFORCE needs a critic

Suppose you try the same action twice in a simulator. One run encounters little subsequent disturbance and returns 20; the other encounters an external shock and returns 2. Using the complete return directly to update the policy can attribute all that later chance variation to the current action. Actor–critic adds a value estimator that asks “What would we usually expect?” and turns an absolute outcome into an improvement relative to that expectation.

The actor is the policy $\pi_\theta(a\mid s)$; the critic is $V_\phi(s)$ or $Q_\phi(s,a)$. They can share part of a network or use separate networks. Shared representations save computation, but gradients from the two losses can interfere. Start with separate networks in this chapter so that each update is easier to inspect.

## Advantage uses the current policy as its baseline

$$A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).$$

A positive advantage means only that, in this state, an action is better than the current policy's average. It does not imply a positive reward or satisfied constraints. If every option loses value, an action that loses less can still have positive advantage. Subtracting a baseline that depends only on the state does not change the expected ideal policy gradient, because $\sum_a\pi(a\mid s)\nabla\log\pi(a\mid s)=0$. It can, however, change finite-sample variance.

The true $Q^\pi$ is unknown in practice. A one-step TD residual gives a computable signal:

$$\delta_t=r_{t+1}+\gamma(1-d_t)V_\phi(s_{t+1})-V_\phi(s_t).$$

$d_t$ represents natural termination only. When the critic is accurate, the conditional expectation of this residual corresponds to the advantage. An inaccurate critic introduces bias into policy updates. Actor–critic therefore trades estimation bias for lower variance; it does not make uncertainty disappear.

## From multistep advantages to GAE

One residual relies on an immediate value prediction; summing many residuals relies on a longer random trajectory. GAE combines this evidence with exponential weights:

$$\hat A_t^{\mathrm{GAE}}=\sum_{l=0}^{T-t-1}(\gamma\lambda)^l\delta_{t+l}.$$

$\lambda=0$ retains only one-step TD. As $\lambda$ approaches 1, more actual subsequent rewards enter the update. On a complete, terminated trajectory with zero terminal value, $\lambda=1$ reduces to return minus baseline. At the end of a truncated segment, it still includes final-state bootstrapping and cannot unconditionally be called a complete Monte Carlo return. See the [original paper](https://arxiv.org/abs/1506.02438) for the origin and derivation of GAE.

### Work through the backward recursion

Let three residuals be $[1,-0.5,2]$, with $\gamma=0.9,\lambda=0.8$, so their product is $0.72$. The final advantage is 2; the preceding one is $-0.5+0.72\times2=0.94$; the first is $1+0.72\times0.94=1.6768$. Earlier actions receive some credit for later good outcomes. Set $\lambda$ to 0 and all three advantages return to the original residuals.

## Code needs two different masks

~~~python
# reward, value, and next_value are one-dimensional arrays of length T.
# On a truncated step, next_value must use the final observation before reset.
gae = 0.0
advantage = np.zeros_like(reward)
for t in reversed(range(len(reward))):
    bootstrap = 1.0 - float(terminated[t])
    same_episode = 1.0 - float(terminated[t] or truncated[t])
    delta = reward[t] + gamma * bootstrap * next_value[t] - value[t]
    gae = delta + gamma * lam * same_episode * gae
    advantage[t] = gae
value_target = advantage + value
~~~

bootstrap controls whether to estimate the future; same_episode controls whether to keep accumulating residuals from this trajectory. An external timeout retains the former but must cut the latter, or an unrelated state after the next reset will contaminate the previous episode. At the end of a fixed rollout batch, explicitly preserve the final-state value and initialize the unknown subsequent advantage to zero for the backward pass. [Gymnasium's explanation of time limits](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) describes this distinction.

## How the two losses work together

The actor minimizes $-\mathbb E[\log\pi_\theta(a_t\mid s_t)\,\operatorname{stopgrad}(\hat A_t)]$; the critic minimizes squared error between its prediction and a fixed return target. Stop gradients through the actor's advantage, or it could lower its loss by changing the “scoring system.” The critic's target should likewise be fixed supervision for the current update. Advantage normalization often helps control optimization scale, but it is not theoretically required; normalization over small batches can particularly affect estimator behavior.

This is the common surrogate loss written under the training batch's sampling distribution. If you strictly use Chapter 12's finite-trajectory objective discounted from the initial time and directly sum over all timesteps in complete trajectories, retain that chapter's $\gamma^t$ weights. Common implementations that omit them use a different sampling convention or an approximate objective; these conventions must not be silently mixed within a derivation.

~~~mermaid
flowchart TD
    S["Same trajectory batch"] --> V["Critic estimates state values"]
    S --> R["Rewards and termination flags"]
    V --> D["TD residuals"]
    R --> D
    D --> A["GAE advantages"]
    A --> P["Update actor"]
    A --> T["Construct value targets"]
    T --> C["Update critic"]
~~~

## What to inspect in experiments

Adjust $\gamma$ and $\lambda$ in the GAE laboratory. Predict which timestep will change most before checking the numbers. If the critic's explained variance falls and policy entropy suddenly collapses, do not simply add training epochs. Check reward scaling, termination masks, value targets, and learning rates. A falling loss means the current target is being fitted; it does not by itself establish a better policy.

## Go further: locate errors in specific tensors

While debugging, first freeze the actor and train only the critic to fit returns from the same small batch of complete trajectories; verify that the value loss falls. Then freeze the critic and check whether a manually assigned positive advantage really increases the corresponding action probability. This separation does not prove convergence, but it can rule out gradient-sign, target-shape, and parameter-group errors. Updating both networks at once can let one update temporarily conceal a mistake in the other.

You can also test a baseline shift: add 100 to every action value in one state and add 100 to that state's value. Advantages should remain unchanged. The algorithm cares about improvement relative to the current policy, not an arbitrary absolute score. This is an algebraic test of value definitions. Adding a constant to every environment reward while changing episode lengths need not preserve optimal behavior; do not confuse these two experiments.

In an industrial setting, the critic's input should match the information visible to the actor. Giving the critic future true quality during training while the actor sees only the current soft estimate is a privileged-information design requiring explicit theoretical and implementation conditions. It must not slip unnoticed into an ordinary baseline. For introductory experiments, let both networks use the same observation and keep environment ground truth strictly in evaluation logs.

Finally, the discount, reward scale, and policy objective used in the value target must agree. If the critic learns normalized rewards while the actor's advantage mixes in raw rewards, training may run without a clear interpretation. A short trajectory table containing raw reward, scaled reward, value, delta, and advantage is one of the most useful debugging records.

## Exercises and answers

1. Can advantage be positive when every return is negative?
2. A truncated step has reward 1, next-state value 10, $\gamma=0.9$, and current value 5. What is its TD residual?
3. What happens if the value of the reset state, 0, is used instead of the final observation?

<details><summary>Show reference answers</summary>

1. Yes. If an action value is -3 while the state average is -8, its advantage is 5.
2. Truncation still bootstraps, so the residual is $1+0.9\times10-5=5$. It would be -4 only for true termination.
3. The incorrect residual becomes -4, making the algorithm interpret an artificial cutoff as a poor environmental outcome. Preserve the final observation; simply renaming a done flag is not enough.

</details>

**What you can now do:** Explain value, return, advantage, and both kinds of boundary flag in a PPO rollout buffer, item by item.
`,
  },
  {
    id: '14', number: 14, module: 4, title: 'Importance Sampling and Trust Regions',
    subtitle: 'How long old data remain useful, and why a policy should not change too far at once', duration: 35, level: '进阶',
    prerequisites: ['03', '12', '13'], objectives: ['Correct the sampling distribution with probability ratios', 'Distinguish action-distribution correction from state-distribution shift', 'Understand KL constraints and practical TRPO approximations'],
    tags: ['Importance sampling', 'TRPO', 'KL'], sources: ['trpo-paper', 'ppo-paper'],
    body: String.raw`## The same data—but whose policy generated them?

The preceding chapter's trajectories came from the policy in use during collection. After one gradient update, its parameters have changed. Treating those old data as if they arose naturally from the new policy shifts the estimation problem. Importance sampling begins with a simpler question: can samples drawn from distribution $q$ estimate an expectation under distribution $p$?

$$\mathbb E_{x\sim p}[f(x)]=\mathbb E_{x\sim q}\left[\frac{p(x)}{q(x)}f(x)\right].$$

The sampling distribution must provide support wherever the target distribution has probability mass. If $p(x)>0$ but $q(x)=0$, that region is absent from the data; multiplying by a weight cannot create the missing experience. This condition will appear again in offline reinforcement learning.

## Understand weights with a two-outcome example

The old policy selects actions A and B with probabilities $[0.8,0.2]$; the target policy uses $[0.4,0.6]$. Their known payoffs are 1 and 3. The target expectation is $0.4\times1+0.6\times3=2.2$. Weight old A samples by $0.4/0.8=0.5$ and old B samples by $0.6/0.2=3$, and the expectation is again 2.2.

A finite sample may contain very few B actions. Each one then carries a large weight, making the estimate fluctuate. A correct expectation identity does not guarantee a reliable small-sample estimate. Trajectory-level importance weights also multiply the probability ratios at every step; longer sequences generally make the weights harder to control.

## Probability ratios in policy optimization

To avoid confusion with reward $r$, this tutorial writes the ratio as $\rho_t$:

$$\rho_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\mathrm{old}}(a_t\mid s_t)}
=\exp\left(\log\pi_\theta(a_t\mid s_t)-\log\pi_{\mathrm{old}}(a_t\mid s_t)\right).$$

This gives the local surrogate objective $L(\theta)=\mathbb E_{s,a\sim\pi_{\mathrm{old}}}[\rho_t(\theta)\hat A_t]$. It corrects only the action distribution conditional on a given state. It does not exactly transform the old policy's visited-state distribution into the new policy's state distribution. Larger policy changes can lead to less familiar regions of the data, making the local estimate less credible. This motivates limiting the size of an update.

## KL measures a change in distributions

For discrete actions,

$$D_{\mathrm{KL}}(p\Vert q)=\sum_a p(a)\log\frac{p(a)}{q(a)}.$$

KL is asymmetric and is not an ordinary distance satisfying all metric axioms. It compares whole probability distributions, not parameter vectors. A small neural-network parameter change can sometimes produce a large output-probability change; conversely, many changes in redundant parameters may barely alter the policy.

Original TRPO places improved advantage and limited policy change in one KL-constrained surrogate optimization problem. The practical algorithm uses a sampled average KL, a local second-order approximation, and numerical solving. Its theoretical bound cannot be equated with a definite improvement on every actual training update. Read the derivation and approximation conditions alongside the [original TRPO paper](https://arxiv.org/abs/1502.05477).

$$\max_\theta\ \mathbb E[\rho_t(\theta)\hat A_t],\qquad
\mathbb E_{s\sim\pi_{\mathrm{old}}}\big[D_{\mathrm{KL}}(\pi_{\mathrm{old}}\Vert\pi_\theta)\big]\le\delta.$$

## Check your understanding against update logs

Save old_log_prob during collection and freeze it throughout every optimization epoch on the batch. Advantages likewise use fixed estimates from that collection. This snippet calculates diagnostics; it is not a complete TRPO implementation:

~~~python
ratio = torch.exp(new_log_prob - old_log_prob.detach())
surrogate = (ratio * advantage.detach()).mean()
# A common nonnegative local second-order diagnostic on old-policy samples.
approx_kl = ((ratio - 1.0) - (new_log_prob - old_log_prob)).mean()
~~~

When the new and old policies match, ratio should be close to 1. If it is already far from 1 before the first update, check the sum of log_prob over action dimensions, whether the old policy really is frozen, and whether preprocessing agrees between collection and training. With continuous actions, this is a density ratio. A density above 1 is not an invalid probability.

## Why not add every old sample?

“Probability ratios are available” does not mean that arbitrary old samples are suitable for indefinite reuse. If an action's new probability is a hundred times its old probability, the estimate depends heavily on a few records. If the old policy never visited a state, action weights still cannot repair state coverage. PPO's short-term, multiple-epoch optimization on one batch is an engineering compromise between sampling cost and credibility of a local objective; it is usually still classified as on-policy. The [PPO paper](https://arxiv.org/abs/1707.06347) describes this batch-update design.

## Calculate KL again instead of memorizing its name

Continue with old distribution $[0.8,0.2]$ and new distribution $[0.4,0.6]$. Old-to-new KL is $0.8\log2+0.2\log(1/3)\approx0.3348$; the reverse direction is $0.4\log(1/2)+0.6\log3\approx0.3819$. They differ. A report that “KL is too large” must specify its direction, the sampled-state distribution, and the estimator.

Probabilities near zero can cause numerical problems when logged or divided directly. A stable implementation generally computes log_prob from a distribution object, then takes a difference and exponentiates. Avoid converting tiny probabilities into low-precision values before dividing. Building a discrete distribution from logits also makes numerical stability easier to inspect than manually applying softmax and then taking a logarithm.

You do not always need to retain a permanent second network for the old policy. Saving the sampled action's old log_prob during collection suffices for that action's ratio. However, calculating exact KL over the entire action distribution requires enough information to reconstruct the old distribution's parameters. What you save depends on the diagnostic's definition. A log field named KL is not necessarily the same quantity as a theoretical constraint.

Another common misunderstanding is to treat a one-step action-weight correction as if it corrected the whole trajectory. Changing the first action can change every state encountered afterward. A trust region makes the local approximation more credible by limiting change; it does not magically remove that difference. This is why historical-log analysis should prioritize coverage diagnostics, not merely an attractive weighted loss.

## Exercises and answers

1. The old probability is 0.1, the new probability is 0.3, and the action advantage is -2. What is the unclipped surrogate contribution?
2. Can an action absent from the batch be evaluated simply by increasing its weight?
3. Does a small Euclidean distance between neural-network parameters imply a small KL?

<details><summary>Show reference answers</summary>

1. The ratio is 3 and the contribution is -6. The update increases the probability of a disadvantageous action, so the objective penalizes it.
2. No. If it is absent only by finite-sample chance, uncertainty is large. If the sampling distribution assigns the action zero probability, the importance-sampling support condition fails outright.
3. No. Output sensitivity depends on architecture and inputs. Monitor the change in the policy distribution directly.

</details>

**Research connection:** Before calculating a one-step probability ratio, inspect the setpoint combinations that historical operators never tried.
`,
  },
  {
    id: '15', number: 15, module: 4, title: 'Unpacking the PPO Clipped Objective',
    subtitle: 'Read the update through advantage signs, probability ratios, and four numerical cases', duration: 45, level: '进阶',
    prerequisites: ['13', '14'], objectives: ['Calculate the clipped objective for positive and negative advantages', 'Understand why clip is not a hard bound on the probability ratio', 'Build a PPO training workflow that can be debugged'],
    tags: ['PPO', 'Clipping', 'Policy optimization'], lab: 'ppo', sources: ['ppo-paper', 'spinup-ppo'],
    body: String.raw`## What PPO is trying to preserve

Policy gradients tell us which direction to change action probabilities; GAE supplies more useful advantages; importance ratios allow several parameter updates on the same old-policy batch. We now need an easily implemented mechanism that discourages the optimizer from moving the policy too far in pursuit of a higher objective on old samples. PPO-Clip introduces a plateau in the benefit of continuing to push in the favorable direction.

$$L^{\mathrm{clip}}(\theta)=\mathbb E_t\left[\min\left(\rho_t\hat A_t,\operatorname{clip}(\rho_t,1-\epsilon,1+\epsilon)\hat A_t\right)\right].$$

$\epsilon$ is the clipping width, for example 0.2; $\rho_t$ is the new-to-old probability ratio; $\hat A_t$ stays fixed during updates on the current batch. Training libraries normally minimize the negative of this objective. The min is applied after multiplication by the advantage. You cannot first take the smaller ratio and then multiply by an advantage that may be negative.

## Four numbers, four update directions

Let $\epsilon=0.2$:

| Advantage | Probability ratio | Unclipped contribution | Clipped contribution | Result of min |
|---|---:|---:|---:|---:|
| $+2$ | 1.4 | 2.8 | 2.4 | 2.4 |
| $+2$ | 0.6 | 1.2 | 1.6 | 1.2 |
| $-2$ | 0.6 | -1.2 | -1.6 | -1.6 |
| $-2$ | 1.4 | -2.8 | -2.4 | -2.8 |

For a good action, increasing its probability beyond a certain point earns no further encouragement from that sample; substantially decreasing its probability is still penalized. For a bad action, decreasing its probability beyond a certain point earns no additional benefit; increasing its probability still worsens the objective. This asymmetry is the purpose of min.

## The misconception that matters most

**PPO clips one term in the objective. It does not force the actual probability ratio to remain inside the interval.** Parameters are shared across samples. After one sample's gradient becomes zero, other samples can still move the parameters and push its probability ratio past the boundary. Clipping also supplies no per-step safety guarantee, monotonic performance guarantee, or strict KL constraint. The original figures build intuition, but reading them as “the ratio always remains between 0.8 and 1.2” is incorrect. The [official Spinning Up explanation](https://spinningup.openai.com/en/latest/algorithms/ppo.html) explicitly discusses this limitation and KL-based early stopping.

## The stages of a complete update

~~~mermaid
flowchart TD
    P["Freeze collection policy"] --> R["Collect the current trajectory batch"]
    R --> G["Compute returns and GAE"]
    G --> B["Shuffle and sample minibatches"]
    B --> L["Clipped policy loss and value loss"]
    L --> K{"Is KL too large"}
    K -- "No" --> B
    K -- "Yes or epochs complete" --> N["Finish this batch update"]
    N --> P
~~~

During collection, record observations, actions, rewards, old_log_prob, values, and both kinds of boundary flag. After computing advantages, normally freeze these targets and perform a limited number of minibatch epochs on the same data. Then discard that old rollout for policy optimization and collect fresh interaction.

~~~python
ratio = (new_log_prob - old_log_prob).exp()
first = ratio * advantages.detach()
second = ratio.clamp(1 - clip_eps, 1 + clip_eps) * advantages.detach()
policy_loss = -torch.minimum(first, second).mean()
value_loss = (values - value_targets.detach()).square().mean()
loss = policy_loss + vf_coef * value_loss - ent_coef * entropy.mean()
optimizer.zero_grad()
loss.backward()
torch.nn.utils.clip_grad_norm_(parameters, max_norm=0.5)
optimizer.step()
~~~

This is the core loss, without a network, environment, or collector. Gradient clipping and probability-ratio clipping are independent: the former controls gradient norm, while the latter changes the surrogate objective. Value clipping is another implementation choice and should not be confused with the definition of PPO itself.

## Diagnose problems from their symptoms

If approximate KL grows rapidly, first reduce the learning rate or optimization epochs per batch. Adjusting $\epsilon$ alone may not suffice. A high clip fraction means many ratios lie outside the interval, not that every one of those samples has zero gradient because of clipping. If entropy falls quickly without higher return, the policy may become deterministic too early. If the value-loss scale is enormous, check rewards and normalization. If training return is good but independent evaluation is poor, inspect evaluation-time observation normalization and randomness rather than simply training longer.

PPO's environment samples generally cannot be reused indefinitely like off-policy experience. When many simulated trajectories can be collected in parallel, PPO is a clear, practical baseline. With only static historical logs, use the offline RL problem setting instead. The [original paper](https://arxiv.org/abs/1707.06347) is the starting point for its objective and batch-update design.

## The life cycle of a rollout batch

Give each collected batch its own identifier: fix parameters and collect, calculate targets, optimize, then close the batch. Do not recompute old_log_prob between minibatches. That would keep resetting ratios toward 1 and remove clipping's reference point. Nor should every minibatch rebuild advantages from the newest critic, unless you explicitly intend a different research variant.

A trajectory batch ending need not mean the environment has ended. A collector may hand a fixed number of steps to the optimizer while the environment continues running; its final state still requires value bootstrapping. The next collection batch can resume from the current environment state, with boundaries handled according to the algorithm. Resetting after every batch for convenience changes the initial-state distribution and sampling pattern, so record that choice.

For discrete actions, compute log_prob for the action taken. For multidimensional continuous actions, use the log joint density by summing over action dimensions. Advantages, joint log_prob, and value predictions should agree on their batch dimension. In particular, check whether multiplying a one-dimensional vector and a column vector silently broadcasts into a square matrix. Such an error may raise no exception while changing the objective.

Before tuning hyperparameters, print ratio, advantage, both surrogate terms, and the final min for a dozen fixed samples. Once the signs and plateaus are correct, inspect actual training logs. Return, KL, and entropy answer different questions: did performance improve, how far did the policy move, and how dispersed is the distribution? No single number is a complete “training health score.”

## Exercises and answers

1. What is the objective contribution for $A=3,\rho=1.1,\epsilon=0.2$?
2. For $A=-3,\rho=0.5$, why is the objective not -1.5?
3. What happens if the probability ratio is clipped directly and then used in every calculation?

<details><summary>Show reference answers</summary>

1. Both terms are 3.3; the sample has not reached a plateau.
2. The two terms are -1.5 and -2.4. min selects -2.4, preventing continued, excessive reduction of a bad action's probability from earning spurious additional surrogate benefit.
3. It removes PPO's mechanism for continuing to penalize movement in the unfavorable direction. It also conceals the real ratio and diagnostics. This is not standard PPO-Clip.

</details>

**Completion task:** Switch the advantage sign in the laboratory, explain why the plateau moves from the right side to the left, then state the separate questions answered by KL, clip fraction, and entropy.
`,
  },
  {
    id: '16', number: 16, module: 5, title: 'Continuous Actions and Tanh-Gaussian Policies',
    subtitle: 'Move from choosing an option to choosing an adjustment, with the correct density', duration: 40, level: '进阶',
    prerequisites: ['03', '12', '14'], objectives: ['Generate continuous actions through reparameterization', 'Derive density corrections for tanh and physical scaling', 'Distinguish bounded actions from a safe system'],
    tags: ['Continuous actions', 'Gaussian', 'Reparameterization'], lab: 'gaussian', sources: ['sac-paper', 'spinup-sac'],
    body: String.raw`## Actions are no longer a finite menu

Adjusting a simulated system's temperature setpoint may require an arbitrary real-valued increment. Discretize each of six control dimensions into ten levels and the joint action space already has a million combinations. Enumerating the largest Q-value soon becomes impractical. A continuous policy instead outputs distribution parameters and generates an action directly.

The usual starting point is a diagonal Gaussian: a network produces mean $\mu_\theta(s)$ and log standard deviation $\log\sigma_\theta(s)$. Standard deviation must be positive, so predicting its logarithm and exponentiating is convenient. Bounding log_std numerically is an engineering choice for stable optimization and belongs in the configuration.

$$u=\mu_\theta(s)+\sigma_\theta(s)\odot\varepsilon,\qquad \varepsilon\sim\mathcal N(0,I).$$

This is reparameterization: randomness is isolated in $\varepsilon$, while the action remains differentiable with respect to network parameters. The policy can therefore be optimized through the gradient of $Q(s,a)$ with respect to its action. Accidentally using an ordinary sample operation that cuts this gradient can break the intended SAC actor-update path.

## Gaussians are unbounded; actions need bounds

Set the normalized action to $a=\tanh(u)$, placing it in $(-1,1)$. Then map it to the physical action range:

$$a^{\mathrm{phys}}=b+c\odot a,\quad b=\frac{h+l}{2},\quad c=\frac{h-l}{2}.$$

In this project, actions are normalized setpoint increments. The physical increment is $\Delta Y^{sp}=\mathrm{RATE}\odot a$, after which the supervisory safety gate decides whether to accept it. This does not directly drive manipulated variables such as fuel valves or replace the inner PID/APC loops.

tanh differs from hard clipping. A hard clip maps many different inputs onto the same boundary point; tanh is a smooth, invertible transformation for finite inputs, so its density can be calculated by change of variables. Gradients can still be small near a boundary, which makes frequent action saturation a useful diagnostic.

## Why the original Gaussian log_prob cannot be reused

Compression changes density. Intuitively, squeezing a wide interval into a narrow one concentrates the same probability mass. For a diagonal Gaussian transformed by componentwise tanh and positive scaling:

$$\log\pi(a^{\mathrm{phys}}\mid s)=\log\mathcal N(u;\mu,\sigma^2)
-\sum_i\log(1-\tanh^2u_i)-\sum_i\log c_i.$$

The final term is required only when density is calculated in physical coordinates. It can be omitted if entropy is defined consistently in normalized action coordinates, but target entropy and every density calculation must use that same convention. The [appendix of the original SAC paper](https://arxiv.org/abs/1801.01290) derives the squashed policy density.

### A one-dimensional calculation

Take $u=0,\mu=0,\sigma=1$. The standard-normal log density is approximately -0.91894. The tanh derivative is then 1, so normalized-action density is unchanged. Scaling to $[-2,2]$ gives $c=2$, making the physical log density $-0.91894-\log2\approx-1.61209$. A wider interval has less density per unit length, as expected.

## A numerically stable implementation fragment

~~~python
# mu and log_std: [batch, action_dim]
std = log_std.exp()
base = torch.distributions.Normal(mu, std)
u = base.rsample()   # Preserve reparameterization gradients.
normalized_action = torch.tanh(u)
log_base = base.log_prob(u).sum(dim=-1)
# Stable equivalent of log(1 - tanh(u)^2).
correction = 2.0 * (math.log(2.0) - u - F.softplus(-2.0 * u))
log_prob = log_base - correction.sum(dim=-1)
# For physical-action density: log_prob -= torch.log(scale).sum()
~~~

Directly computing log(1 - tanh(u)^2) can produce log(0) through rounding at extreme inputs. Adding a tiny epsilon is common, but the stable equivalent preserves the mathematical structure more explicitly. The joint log_prob of a multidimensional independent Gaussian must sum across action dimensions. Forgetting the sum and combining it with a one-dimensional Q-value may silently broadcast instead of raising an error, changing the loss.

## Bounded, smooth, and safe mean different things

tanh guarantees only that the candidate action lies within the agreed numerical interval. The same small increment may be acceptable in a normal state but unacceptable with abnormal oxygen or an actuator close to its limit. Even bounded individual increments can push an absolute setpoint out of range after repeated changes in one direction. System safety additionally requires state constraints, magnitude and rate checks, model credibility, and fallback behavior.

Deterministic evaluation of a stochastic policy often uses $\tanh(\mu)$ as a representative action. Because the transformation is nonlinear, $\tanh(\mathbb E[u])$ generally differs from $\mathbb E[\tanh(u)]$. Call it “the action corresponding to the mean parameter,” not the exact mean of the transformed distribution in a mathematically precise discussion.

## Do not confuse density and probability

A uniform distribution covering an interval of length 0.2 has density 5. That is entirely valid because its integral over the interval is 1. The probability of a continuous action equaling one exact real number is generally zero; probabilities over small intervals are meaningful. Thus log_prob can be positive and differential entropy can be negative. An assertion that every log_prob must be below zero would reject valid continuous policies.

A diagonal Gaussian also assumes conditional independence between action dimensions given the state. Its means can change together with the state, but it does not directly model covariance between sampling noise components in that same state. If setpoints require strongly coupled actions, an independent Gaussian may not be the best representation. Treat this as a later modeling assumption and experimental question rather than immediately adding complicated distributions while learning the basics.

Plot three distribution comparisons: hold the mean fixed while increasing standard deviation; hold standard deviation fixed while moving the mean toward a boundary; and use different physical scales for the same normalized distribution. Observe how the exploration range, saturation rate, and density per unit change. After tanh, the original Gaussian shape may be substantially distorted, so the output is no longer an ordinary Gaussian action distribution.

Finally, check that execution and training refer to the same action. If the environment applies another opaque hard clip while the logged action density still describes the pre-clipped action, the policy–transition relationship becomes ambiguous. Keep coordinates and transformations consistent in the teaching implementation, and record any extra action correction separately so that it remains traceable in the safety-gate case.

## Exercises and answers

1. Two action dimensions have log densities -0.4 and -0.7. What is their joint log density?
2. What happens when $\mu$ is very large and $\sigma$ is very small?
3. Why does entropy change when actions are scaled from $[-1,1]$ to $[-3,3]$?

<details><summary>Show reference answers</summary>

1. Under the diagonal independence assumption, add them to obtain -1.1.
2. tanh actions concentrate near a boundary and respond weakly to parameter changes. Check reward scale, standard-deviation bounds, action scaling, and saturation rate.
3. Differential entropy depends on coordinate scale. Multiplying a one-dimensional variable by three increases entropy by $\log3$. This does not automatically improve physical safety or exploration quality.

</details>
`,
  },
  {
    id: '17', number: 17, module: 5, title: 'Maximum Entropy and SAC',
    subtitle: 'Reuse experience while learning values, a stochastic policy, and exploration temperature', duration: 45, level: '进阶',
    prerequisites: ['10', '13', '16'], objectives: ['Explain how entropy regularization changes the objective', 'Write the twin-Q bootstrap target and actor loss', 'Distinguish SAC exploration from industrial safety constraints'],
    tags: ['SAC', 'Maximum entropy', 'Twin critics'], lab: 'gaussian', sources: ['sac-paper', 'sac-applications', 'spinup-sac'],
    body: String.raw`## Why reward randomness as well as high return?

If two actions currently look equally good, committing to only one too early may miss further information. Maximum-entropy reinforcement learning preserves policy diversity alongside return:

$$J(\pi)=\mathbb E_\pi\left[\sum_{t\ge0}\gamma^t\left(r_{t+1}+\alpha\mathcal H(\pi(\cdot\mid s_t))\right)\right].$$

$\alpha$ trades off entropy against task payoff. Writing entropy in sampled form, $\mathcal H=\mathbb E[-\log\pi(a\mid s)]$, makes it estimable on minibatches. Continuous actions use differential entropy, which can be negative and depends on coordinate scale. The discrete intuition that entropy must be nonnegative does not transfer directly.

SAC combines this objective with off-policy experience reuse, a stochastic actor, and twin critics. [Original SAC](https://arxiv.org/abs/1801.01290) and its [later version](https://arxiv.org/abs/1812.05905) differ in implementation structure. This chapter uses the common form with two Q-networks, two target Q-networks, and no separate V-network. Identify the version before reading code; do not combine updates from different papers into a single algorithm.

## First ask what the critic is fitting

Sample $(s_t,a_t,r_{t+1},s_{t+1},d_t)$ from replay. At the next state, draw a fresh action from the current actor, $a'\sim\pi_\theta(\cdot\mid s_{t+1})$, and calculate a fixed target:

$$y=r_{t+1}+\gamma(1-d_t)\left[\min_{j=1,2}\bar Q_j(s_{t+1},a')-\alpha\log\pi_\theta(a'\mid s_{t+1})\right].$$

Each critic minimizes $\mathbb E[(Q_j(s_t,a_t)-y)^2]$. Stop gradients through the target branch. Selecting the smaller Q-value mitigates excessive optimism; it neither eliminates all estimation error nor rules out conservative bias. $d_t$ still denotes true termination, not an external time truncation.

Suppose reward is 1, $\gamma=0.9$, target Q-values are 3 and 4, $\alpha=0.2$, and the next action's log density is -0.5. Then $y=1+0.9(3+0.1)=3.79$. This is only a worked calculation, not a training result. Under true termination, the target becomes 1.

## How the actor improves through Q

The actor generates new differentiable actions at replay states instead of merely imitating the old actions stored there:

$$L_\pi=\mathbb E_{s\sim\mathcal D,\varepsilon}\left[\alpha\log\pi_\theta(a_\theta\mid s)-\min_j Q_j(s,a_\theta)\right].$$

Minimizing the first term encourages entropy; minimizing the negative second term encourages high value. Actor updates do not update critic parameters, but they must retain Q's gradient with respect to the action. Wrapping the entire Q calculation in no_grad would cut an important policy-improvement path. Reparameterization and the tanh density correction are algorithmic components, not implementation decoration.

~~~python
# Pseudocode: update targets, critics, actor, and temperature separately.
with torch.no_grad():
    next_action, next_logp = actor.sample(next_obs)
    next_q = torch.minimum(target_q1(next_obs, next_action),
                           target_q2(next_obs, next_action))
    target = reward + gamma * (1.0 - terminated.float()) * (next_q - alpha * next_logp)
critic_loss = mse(q1(obs, action), target) + mse(q2(obs, action), target)

# Freeze critic parameter gradients, but retain differentiation through new_action.
new_action, logp = actor.sample(obs)
actor_loss = (alpha * logp - torch.minimum(q1(obs, new_action),
                                         q2(obs, new_action))).mean()
~~~

## What temperature and target networks each solve

With fixed $\alpha$, multiplying rewards by ten weakens entropy's relative influence. Automatic temperature adjustment steers policy entropy around a specified target, but that target remains a design choice. It does not automatically discover the best operational trade-off, and it does not make exploration safe in every state. When using automatic temperature, record the action-coordinate and dimensional conventions behind target_entropy.

Target networks commonly use $\bar\phi\leftarrow(1-\tau)\bar\phi+\tau\phi$. Here $\tau$ is the fraction of new parameters absorbed per update. Some implementations use polyak for the fraction of old parameters retained; the two are complements. Copying 0.995 or 0.005 by parameter name alone can produce the opposite update speed.

~~~mermaid
flowchart TD
    E["Simulated environment interaction"] --> D["Experience replay"]
    D --> Q["Twin critics fit soft targets"]
    D --> A["Actor generates differentiable actions"]
    Q --> A
    A --> H["Entropy and temperature adjustment"]
    A --> E
    Q --> T["Slow target-critic update"]
    T --> Q
~~~

## When does an implementation begin to be credible?

First verify a Bellman target by hand on fixed samples, then check log_prob, action range, and tensor shapes. During training, record Q scale, reward scale, temperature, policy entropy, action-saturation rate, and independent evaluation return together. Rising Q with falling evaluation return may indicate extrapolation error; both being small could simply reflect reward scaling. Higher entropy only means a more dispersed distribution, not that candidate actions satisfy engineering boundaries.

SAC can reuse old experience, but ordinary online SAC still relies on continuing interaction to correct estimates. Filling a replay buffer with historical plant logs and training indefinitely without new data does not automatically yield a reliable offline algorithm. Chapter 22 develops this distinction. Compare update details with the [Spinning Up SAC documentation](https://spinningup.openai.com/en/latest/algorithms/sac.html).

## Divide SAC's data flow into three tables

The first table contains historical replay actions, used to fit critic values on observed transitions. The second contains current-policy actions at next states, used to construct soft bootstrap targets. The third contains new differentiable actions at current states, used to update the actor. They can have identical shapes but are not interchangeable. In particular, actor-stage actions need gradients, while critic-target calculations must stop them.

Twin critics are not two fully independent measuring instruments. They often share data and training targets, so their errors may be strongly correlated. Taking the minimum reduces one kind of optimistic bias but cannot guarantee detection of every model flaw. If both Q-values rise while independent return stays flat, investigate extrapolation, rewards, and bootstrapping; agreement between two networks is not sufficient evidence of correctness.

If temperature rises rapidly, first verify the tanh correction in log_prob, the sum over action dimensions, and the target-entropy coordinate system. Incorrect calculations make automatic temperature chase an incorrect signal. Temperature approaching zero is not necessarily a training failure either: the current objective and reward scale may favor more deterministic behavior. Judge it alongside return and coverage rather than the curve's shape alone.

Implementations differ in gradient updates per environment step, when training begins, and target-network update frequency. Repeated fitting before replay contains sufficiently diverse data can amplify early chance events. State these update ratios in a report so readers can distinguish changes to the algorithmic objective from changes to computational budget. Full reproduction also requires normalization statistics and action-transformation configuration.

## Exercises and answers

1. If the two Q-values are 10 and 4, which enters the target? Does that make it the correct value?
2. Why can an actor update not substitute a replay action for its newly sampled action?
3. Does high SAC entropy authorize trial-and-error on equipment?

<details><summary>Show reference answers</summary>

1. Use 4. This is a conservative estimation choice, not a guarantee of ground truth.
2. The actor must evaluate actions it currently generates and improve through action gradients. Evaluating only fixed historical actions lacks that path.
3. No. Entropy is not a safety metric. This project permits training only from historical data or simulated environments, and candidate setpoints still require independent gating.

</details>
`,
  },
  {
    id: '18', number: 18, module: 5, title: 'Choose an Algorithm for the Problem',
    subtitle: 'Start with data, actions, and interaction budgets to establish interpretable baselines', duration: 30, level: '实践',
    prerequisites: ['08', '11', '15', '17'], objectives: ['Screen algorithm families by the problem setting', 'Distinguish sample efficiency, computational efficiency, and deployment speed', 'Write a fair protocol for the first algorithm comparison'],
    tags: ['Algorithm selection', 'Baselines', 'Decision modeling'], sources: ['sb3-tips', 'td3-paper', 'td3bc-paper', 'project-contract'],
    body: String.raw`## The first question is usually not PPO versus SAC

First ask: will a decision affect later states? If there is no significant effect across time and the task only predicts immediate outcomes before choosing an action, supervised learning, contextual bandits, or static optimization may fit better. With a clear model and constraints, dynamic programming, model predictive control, or an existing optimizer may provide a more transparent baseline. RL's value is in learning sequential decisions, not replacing every optimization method.

The second question is where the data come from. Repeated interaction with an inexpensive simulator and access to only one historical production log are different problem settings. Only then ask about action space, state complexity, and computing resources. This order avoids the detour of choosing the most fashionable algorithm first and forcing an environment around it.

## A practical selection table

| Task conditions | First baseline | Next comparison | Check first |
|---|---|---|---|
| Small discrete state and action spaces | DP or tabular Q-learning | SARSA, Expected SARSA | Is the model known, and is exploration permitted? |
| Large state space, few discrete actions | DQN | Double DQN, PPO | Are representation, replay, and target networks correct? |
| Interaction simulation with extensive parallelism | PPO | SAC, depending on action space | Are total environment steps and parallelism compared fairly? |
| Continuous actions with emphasis on experience reuse | SAC | TD3, PPO | Are replay coverage and action scaling reasonable? |
| Historical logs only | Behavioral cloning, BC | TD3+BC, IQL, CQL | Data support, time leakage, and offline evaluation |
| Known, reliable dynamics model | MPC / planning | Model-based RL | Are model error and constraints quantified? |
| Hard physical boundaries | Compliant baseline and safety filter | CMDP methods | Do independent per-step protection and fallback exist? |

These are experimental starting points, not a universal ranking. The [official SB3 practical guide](https://stable-baselines3.readthedocs.io/en/master/guide/rl_tips.html) also emphasizes repeated runs and environment validation. [TD3](https://arxiv.org/abs/1802.09477) and [TD3+BC](https://arxiv.org/abs/2106.06860) address interactive continuous control and offline data respectively; similar names do not make them interchangeable.

## Do not collapse three kinds of efficiency into one word

Sample efficiency measures environment interactions needed to reach a performance level. Computational efficiency measures training time and hardware use. Deployment efficiency measures latency and resources for each decision. An off-policy algorithm's sample reuse does not guarantee shorter wall-clock time. Highly parallel PPO may use more interactions yet run quickly in a particular simulator. Report environment steps, gradient steps, total time, and hardware together.

For a teaching budget, give algorithms A and B each one hundred thousand environment steps. A performs one gradient update per step, B four. Their environment-information budgets match, but their computational budgets do not. This can support a carefully framed claim about sample efficiency; a claim about speed also needs measured time. Budget is not a result and should be configured before the experiment.

## Write a selection card for kiln operational decisions

This project's actions are bounded setpoint increments, with control loops underneath. Historical logs are available; online exploration on real equipment is prohibited; observations and assays are delayed. Putting online PPO or SAC directly onto equipment for trial-and-error therefore violates the problem conditions. A sensible starting point is to reproduce operator behavior with BC, examine coverage, and then compare conservative offline methods. Independently validated world models can support additional restricted simulation rollouts. Evaluate constraint costs and the five-layer gate separately. These boundaries come from the [repository's domain conventions](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md).

The existing PG-MOEA/D-IEpsilon method is a required comparison, but this tutorial does not contain its full implementation or original experimental data. The course can specify integration and comparison protocols, not invent a result row or relabel ordinary random search as that baseline.

## A decision tree helps you ask questions

~~~mermaid
flowchart TD
    Q["Does the action affect future states"] --> S{"Long-term effects"}
    S -- "No" --> B["Supervised prediction or bandit baseline"]
    S -- "Yes" --> D{"Can interaction data be obtained"}
    D -- "Historical logs only" --> O["BC and offline RL"]
    D -- "Simulation interaction permitted" --> A{"Action space"}
    A -- "Finite discrete" --> V["Tabular methods or DQN"]
    A -- "Continuous" --> P["Compare PPO, SAC, or TD3"]
    O --> C["Coverage, constraints, and independent evaluation"]
    P --> C
    V --> C
~~~

The tree narrows the candidate set. You must still consider whether a model is known, memory requirements, action constraints, and interpretability. It has no branch that guarantees the best choice.

## Turn selection into a falsifiable hypothesis

A useful justification might say: “Because interaction comes only from a simulator and the budget is limited, we compare SAC with PPO. We hypothesize that experience reuse reduces the environment steps needed to reach a predefined threshold. We hold observations, rewards, action mapping, evaluation disturbances, and seeds consistent, and report both sample efficiency and wall-clock time. If replay-related estimation errors produce more failures with SAC, we retain PPO as the baseline.” This states a testable prediction and the evidence that would change the choice.

## Three choices beyond the algorithm's name

Changing observation-history length, reward scale, or action-hold duration within one algorithm can matter more than changing algorithm families. Fix these modeling conditions in the first comparison and compare update mechanisms. Only in the second round change conditions in response to a specific failure. Otherwise, you cannot tell whether improvement came from a policy method or an easier task definition.

Write stopping criteria in advance as well. If the zero-action baseline already meets the goal, first show that a more complicated policy adds value. If every algorithm fails, investigate the environment and reward before blaming an algorithm for being insufficiently advanced. Tie each choice to a hypothesis that still needs evidence; that makes algorithm comparisons interpretable.

## Exercises and answers

1. An advertising task cares only about immediate clicks, and actions do not change future user states. Must it use full RL?
2. Is a higher maximum return in one run enough to select a final algorithm?
3. Discretize each of six continuous action dimensions into five levels. How many joint actions result?

<details><summary>Show reference answers</summary>

1. No. A contextual bandit or supervised predictor with a decision rule may fit better. Study sequential modeling if effects such as long-term fatigue change future states.
2. No. Use multiple seeds, a fixed budget, independent evaluation, and constraint metrics, and report uncertainty.
3. $5^6=15625$. Discretization quickly expands a joint action space, although this does not make every discretization unusable.

</details>
`,
  },
  {
    id: '19', number: 19, module: 6, title: 'Turn a Real Problem into a Verifiable Environment',
    subtitle: 'State, action, reward, and boundaries shape success before the algorithm name does', duration: 45, level: '实践',
    prerequisites: ['04', '08', '18'], objectives: ['Complete an environment design table and timing contract', 'Implement and check the Gymnasium five-value interface', 'Detect information leakage, action-mapping errors, and termination mistakes'],
    tags: ['Gymnasium', 'Environment modeling', 'Time boundaries'], sources: ['gym-custom', 'gym-time-limits', 'project-contract'],
    body: String.raw`## Define the problem before defining a class

An environment is not complete merely because a predictive model has been wrapped in step. It must specify when an observation is available, when an action takes effect, which interval a reward describes, which variables are exogenous disturbances, and which information becomes known only in the future. Vague conventions can let an algorithm reliably optimize an objective unrelated to the real task.

Start with a table, giving every field units and a data source:

| Field | Question it should answer | Typical error |
|---|---|---|
| Observation | What is actually visible at decision time? | Backfilling future assays into past states |
| Action | Increment, absolute value, or category? | Normalizing twice or mixing units |
| Transition | How do delays and disturbances enter? | Assuming immediate setpoint tracking |
| Reward | Why does long-term accumulation match the goal? | Scoring only a short-term prediction |
| Cost | Which boundaries cannot be traded for payoff? | Arbitrarily merging hard constraints into reward |
| Boundary | Natural termination or artificial truncation? | Treating every timeout as termination |

## The minimum Gymnasium interface contract

reset returns an initial observation and info. step returns the next observation, scalar reward, terminated, truncated, and info. Call the parent reset(seed=seed) to initialize the environment random generator, then sample environmental disturbances only through self.np_random. The [official custom-environment guide](https://gymnasium.farama.org/introduction/create_custom_env/) defines the interface.

This tutorial supplies a [normalized-setpoint teaching environment](./code/advanced_toy_env.py). Its dynamics are one-dimensional and abstract, intended to check the API, setpoint increments, and time truncation. It is not a cement-kiln model, does not alter the project's formal POMDP dimension, and has neither industrial units nor real process conclusions.

~~~python
obs, info = env.reset(seed=42)
for _ in range(env.horizon):
    action = np.array([0.0], dtype=np.float32)
    next_obs, reward, terminated, truncated, info = env.step(action)
    assert env.observation_space.contains(next_obs)
    assert np.isfinite(reward)
    # Store next_obs before considering a reset.
    replay.append((obs, action, reward, next_obs, terminated, truncated))
    obs = next_obs
    if terminated or truncated:
        break
~~~

## A simulated transition you can calculate by hand

The teaching model uses $x_{t+1}=\operatorname{clip}(0.8x_t+0.2y_t^{sp}+\eta_t,-1,1)$, with the setpoint updated by $y_t^{sp}=\operatorname{clip}(y_{t-1}^{sp}+0.1a_t,-1,1)$. State clipping matches the downloadable script and keeps the teaching observation space bounded; it is not a claim about real process dynamics. Set $x_t=0.4,y_{t-1}^{sp}=0.2,a_t=0.5,\eta_t=0$. The new setpoint is 0.25 and the next state is $0.32+0.05=0.37$. These numbers directly test action sign and update order.

The reward is $-(x_{t+1}-x_{\mathrm{target}})^2-0.01a_t^2$, an abstract tracking task only. Quality, safety, and real energy use are not modeled. Stating simplifications teaches more than labeling a complicated model “a real industrial environment.” The teaching clip does not replace the formal case's five-layer gate.

## Time boundaries in a continuing task

A continuous-production task is cut into 72-step segments only because training or reporting needs a finite window. Value still exists beyond that window. The current project therefore specifies terminated=False and truncated=(t>=horizon). Bootstrap targets use $1-\mathrm{terminated}$, while the data-collection loop uses terminated or truncated to decide when to reset. These booleans serve different purposes. The [time-limit documentation](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) also notes that a finite-horizon ending can be true termination when the countdown is part of the task definition itself; remaining time should then be included in the state.

Inspect automatically resetting vector environments carefully: the returned observation may belong to a new episode. Extract the actual final observation when writing replay or calculating GAE; do not connect a post-reset state to the old action. Specific field names vary with the wrapper API, so check the version in use.

## Test the environment with baselines, not just an API checker

Before training a neural network, run zero actions, fixed actions, random actions, and simple feedback control. Does zero action produce reasonable drift? Do positive and negative actions move the process in the expected directions? Does the seed reproduce disturbances? An environment checker can identify shape, dtype, and range problems, but cannot judge physical reasoning such as why reduced coal consumption would improve quality.

Also check extreme inputs: how are NaN, Inf, incorrect dimensions, and out-of-range actions handled? Explicitly reject invalid inputs or apply a documented handling rule; do not silently pass invalid values into replay. A formal industrial environment must follow the [project contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md), emit separate costs, and preserve safe fallback on gate rejection.

## Check one transition against a timeline

At decision point t, first construct the observation from released information. Next let the policy propose an increment, apply permitted action handling, pass the result to simulated dynamics, and finally settle the reward for that interval and produce the next observation. Drawing these five events often reveals reward misalignment—for example, scoring an action with energy use from the previous interval before it could have taken effect. With a pure delay, rewards may respond later, but the indexing must remain consistent.

Reset needs an explicit meaning too. Always starting at the same ideal steady state may conceal the policy's ability to handle transitions. Randomly sampling every variable independently can instead assemble states that never occur. Simple initialization in a teaching environment checks the interface; a formal model should initialize from credible historical segments or a justified state distribution.

Keep a short fixed action sequence and its step-by-step outputs as a readable environment example. If another reader can see every observation, candidate action, executed action, reward, cost, and boundary flag, they can independently determine what problem has been defined. This checks model credibility better than a terminal message claiming that training succeeded.

## Exercises and answers

1. Why might training look unusually good after tomorrow's published assay is inserted into today's observation?
2. In the model above, what is the next state if a changes to -0.5?
3. Should one seed make every floating-point value identical on all hardware?

<details><summary>Show reference answers</summary>

1. The policy sees future information unavailable at decision time: temporal leakage. Build an as-of join using publication time instead of backfilling visibility by the time the measurement describes.
2. The new setpoint is 0.15 and the next state is $0.8\times0.4+0.2\times0.15=0.35$.
3. Not necessarily. Seeds control randomness; library versions, parallel execution order, and hardware kernels can still affect results. Report environment versions and determinism settings, not just a seed.

</details>
`,
  },
  {
    id: '20', number: 20, module: 6, title: 'Build a Credible Reinforcement Learning Experiment',
    subtitle: 'Use multiple seeds, controls, and ablations so results withstand scrutiny', duration: 40, level: '实践',
    prerequisites: ['18', '19'], objectives: ['Distinguish training seeds from evaluation disturbances', 'Design time splits, baselines, and ablations', 'Report means, variation, and the limits of conclusions'],
    tags: ['Reproducibility', 'Multiple seeds', 'Experimental design'], lab: 'seeds', sources: ['rliable-paper', 'sb3-tips', 'project-contract'],
    body: String.raw`## One attractive curve proves very little

Reinforcement learning has at least three sources of randomness: network initialization, sampling during training, and evaluation disturbances. A seed that happens to find a good policy does not establish a stable method. A policy that performs well on one steady disturbance sequence is not necessarily reliable under changing operating conditions. An experiment must first define whether a “result” means one trajectory, one training seed, or an estimate across seeds.

The [statistical precipice paper](https://arxiv.org/abs/2108.13264) emphasizes uncertainty from a limited number of runs. The seed counts used in course experiments are teaching starting points. Real conclusions must also consider effect size, computational budget, and uncertainty intervals.

## Fix the protocol before inspecting results

Standardize observations, action mapping, rewards, training environment steps, evaluation checkpoints, and model-selection rules. Give algorithms comparable tuning budgets rather than repeatedly searching for a new method while running a baseline only at defaults. Keep individual curves as well as summaries. Smoothing can aid reading but must not hide failures or variation, and its window must be stated.

This project requires at least five training seeds and comparisons with the operator behavior baseline and PG-MOEA/D-IEpsilon. Exposing different methods to the same external disturbances during evaluation can reduce comparison noise, but training seeds and test-disturbance seeds must be separate. Do not repeatedly use the final test set for hyperparameter selection.

## Split time-series data by available information

Neighboring windows in industrial logs overlap heavily. Randomly shuffling them can make training and test windows share many original timestamps. Split by time, production batch, or operating condition, leaving boundary gaps that match the history length and prediction horizon. Fit normalization parameters, soft sensors, and missing-value rules only on the training region. Use validation to select models and testing for the final evaluation under a fixed protocol.

A “70/15/15” ratio does not automatically prevent leakage. Explain which dates, batches, and future information enter each set. Reconstruct assay publication delays according to what was visible at the time as well.

## Calculate variation from five numbers

The teaching scores $[8,9,10,11,12]$ have mean 10, sample standard deviation $\sqrt{10/4}\approx1.581$, and standard error approximately $1.581/\sqrt5\approx0.707$. Standard deviation describes variation between runs; standard error describes uncertainty in the estimated mean. Plotting standard error as “method variability” can make a method look excessively stable.

If method B scores 0.2 above A under each of the same five test conditions, paired differences may vary little even when each method varies substantially on its own. Conversely, evaluating one trained model on a hundred episodes and calling them a hundred independent training runs exaggerates the evidence. Resampling should respect the hierarchy of training seeds and test trajectories.

~~~python
# scores[training_seed, evaluation_episode]
per_seed = scores.mean(axis=1)
mean_score = per_seed.mean()
std_across_seeds = per_seed.std(ddof=1)
# Start with training seeds as statistical units; retain episodes for hierarchical analysis.
print({"mean": mean_score, "std": std_across_seeds,
       "n_train_seeds": len(per_seed)})
~~~

## Industrial tasks require more than aggregate reward

Report at least coal consumption, electricity consumption, quality compliance rate, oxygen-constraint violation rate, setpoint-change magnitude, interception counts at each safety gate, and inference latency separately. Reward combines objectives into a training signal; readers need to know where improvements came from and what they cost. Evaluate both the raw policy and the gated policy. A gate may protect a boundary while the raw policy repeatedly proposes noncompliant actions; those are different capabilities.

| Comparison | Question being tested | Output |
|---|---|---|
| Zero action / operator | Does the method improve on simple decisions? | Separate metrics under matched disturbances |
| PG-MOEA/D-IEpsilon | Does it improve on the existing optimization approach? | Original implementation and matched constraint protocol |
| Remove the history window | Is memory necessary? | Changes under delayed operating conditions |
| Remove the conservative term | Is offline coverage important? | OOD action rate and value bias |
| Vary gating | Does performance come from the policy or protection layer? | Before-gate and after-gate results, plus rejection reasons |

The tutorial has no real baseline data. This table is an experimental design, not a completed algorithm ranking. Do not turn illustrative numbers from a specification into purported new measurements.

## The minimum files in a report

Configuration records every hyperparameter and seed; a code commit hash identifies the implementation; an environment manifest records software versions; raw logs retain evaluations for every seed; an analysis script regenerates tables from logs; and a report includes successes, failures, and limitations. A PNG alone cannot reveal whether only the best curve was selected. Use the [SB3 practical guide](https://stable-baselines3.readthedocs.io/en/master/guide/rl_tips.html) as a reference for running experiments and independent evaluation.

## What an ablation must control

When removing a component, keep other training budgets, network capacity, and tuning opportunities as comparable as possible. Removing a history encoder while also halving parameter count can reduce performance through lost information or reduced capacity. Distinguish these explanations and add a capacity-matched control if needed. An ablation should answer one specific causal question, not remove as many features as possible.

Retain denominators when comparing constraint-compliance rates: how many proposals, timesteps, or episodes, and whether gated fallback periods are included. Reporting only the number of violations for trajectories of unequal duration makes shorter trajectories look inherently safer. Predefine how truncated, failed, and abnormal runs enter the results so that the statistical definition is not changed after seeing the data.

## Exercises and answers

1. What bias arises if a paper reports only the seed with the highest training return?
2. Does “mean ± standard deviation” over five seeds automatically establish a significant improvement?
3. Does zero violation after gating mean the policy never proposes a dangerous action?

<details><summary>Show reference answers</summary>

1. Selection bias. Readers see a selected extreme, not typical performance. Predefine all seeds and report failed runs.
2. No. It describes dispersion; paired design, intervals, effect size, and sample size also matter. Statistical significance also does not imply a practically large benefit.
3. No. Also report the fraction of violating candidates before gating, interceptions at each layer, and performance after fallback.

</details>
`,
  },
  {
    id: '21', number: 21, module: 6, title: 'Capstone: Setpoint Decisions for a Kiln System',
    subtitle: 'Connect time-series prediction, offline policies, constraints, and experimental reporting', duration: 55, level: '实践',
    prerequisites: ['04', '18', '19', '20'], objectives: ['Distinguish supervisory setpoints from inner-loop manipulated variables', 'Build observations containing history, soft estimates, and assay age', 'Design five-layer gating and an executable comparison protocol'],
    tags: ['Process industry', 'POMDP', 'Safety gating', 'Capstone'], lab: 'safety', sources: ['project-contract', 'cpo-paper', 'gym-time-limits'],
    body: String.raw`## From accurate prediction to effective decisions

A predictor asks how future indicators may change under given conditions. A decision model must also ask what future trajectory would follow a different setpoint choice now, and which costs are worth accepting. For industrial multivariate time-series modeling, the main added challenges are action dependence, long delays, data coverage, and constraints—not merely replacing a prediction head with a policy head.

This chapter follows the [repository's kiln-system conventions](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md). All numerical values are learning and modeling contracts for this project, not engineering thresholds applicable to every cement plant. Quantities without actual data support are not presented as plant findings. The website experiments neither connect to production equipment nor perform real online exploration.

## First table: who does what, at which timescale?

| Layer | Input and output | Role in this tutorial |
|---|---|---|
| Supervisory operational decisions | Historical observations → normalized CV setpoint increments | A candidate every 5 minutes |
| Five-layer safety gate | Candidate action and current state → accept or fall back | Independent checks of the candidate |
| Inner DCS / PID / APC | CV setpoints → actual manipulated variables, MVs | Existing control systems perform tracking |
| Process and measurement | Operations and disturbances → sensors, assays, and energy use | Simulation or historical data only in this course |

The six CVs are calciner outlet temperature, kiln-inlet smoke-chamber temperature, secondary-air temperature, tertiary-air temperature, kiln-hood pressure, and the first grate-cooler chamber pressure. The policy does not directly choose valve openings or motor outputs. Bypassing the existing control layer would change the problem itself.

## Observation: preserve what was known at the time

Retain the project's observation components:

$$o_t=\left[X_{t-23:t},Y_t^{sp},\hat q_t,q^{\mathrm{lab}}_\tau,t-\tau,\mathrm{KH},\mathrm{SM},\mathrm{IM}\right].$$

The project history window contains 24 samples. $\hat q_t$ is a soft-sensor estimate; the latest released assay and its sample age enter together. Construct samples using the assay's actual availability time. Never backfill true quality received later into an earlier policy input. Fit soft sensors only on the training region. Internal true quality used for evaluation may go in info but must not accidentally enter policy observations.

History stacking and recurrent networks help with partial observability but do not guarantee that a finite window restores strict Markov behavior. Specifically test changing delays, missing measurements, and operating-condition transitions. A history input does not by itself solve a POMDP.

## Keep actions, objectives, and costs separate

The policy candidate $a_t\in[-1,1]^6$ maps to physical setpoint increments through each dimension's RATE:

$$Y_{t+1}^{sp,\mathrm{candidate}}=Y_t^{sp}+\mathrm{RATE}\odot a_t.$$

For example, if one dimension permits a change of 2 units per step, policy output 0.3 represents 0.6 units. This illustrates scaling and introduces no new actual RATE parameter. Absolute limits, rates, and inner-loop feasibility still require checks.

The reward retains the coal, electricity, and action-smoothness objectives. Quality and gas boundaries are separate costs:

The next equation uses the repository's $r_t$ label for the reward of the evaluation window associated with an action. When constructing training transitions, label that feedback consistently as the earlier $R_{t+1}$, align action effectiveness with indicator timing, and keep window indicators not yet available out of $o_t$. In the physical smoothness term, $a_t$ denotes the increment actually executed after gating; preserve the requested increment separately.

$$r_t=-w_f\frac{F_t-\bar F}{\sigma_F}-w_e\frac{E_t-\bar E}{\sigma_E}
-w_s\left(\|a_t\|^2+\|a_t-a_{t-1}\|^2\right).$$

The project's quality band is f-CaO $[0.5,1.5]\%$, and its oxygen boundary is $O_2\ge1.2\%$. A cost can record violation magnitude or an indicator of violation, but state its definition and accumulation scale. Training normalization parameters must not use test data. Expected-cost constraints in a CMDP cannot replace physical protection at every step; this distinction relates to the constraint forms studied in [constrained policy optimization](https://arxiv.org/abs/1705.10528).

## Five-layer gating: explain each layer independently

~~~mermaid
flowchart TD
    A["Candidate setpoint increment"] --> G1{"1 Data validity"}
    G1 -- "Pass" --> G2{"2 Current-state boundaries"}
    G2 -- "Pass" --> G3{"3 Model credibility and OOD"}
    G3 -- "Pass" --> G4{"4 Rate and curvature feasibility"}
    G4 -- "Pass" --> G5{"5 Absolute bounds and authorization"}
    G5 -- "Pass" --> S["Accept candidate in simulation only"]
    G1 -- "Fail" --> F["Fall back and record reason"]
    G2 -- "Fail" --> F
    G3 -- "Fail" --> F
    G4 -- "Fail" --> F
    G5 -- "Fail" --> F
~~~

The first layer checks NaN, Inf, and measurement anomalies in observations and actions. The second checks critical states. The third checks support, with the project's illustrative threshold requiring standardized deviation no greater than 4. The fourth retains the convention that changes in normalized increments do not exceed 1.5. The fifth checks absolute target-setpoint ranges and APC authorization. Any failure records the specific layer and falls back to the project's $Y_{\mathrm{safe}}$.

Holding the current setpoint is the project's illustrative fallback, not a universal emergency action for every fault. Existing production interlocks and human procedures remain the responsibility of plant systems. The teaching gate is not a certified safety controller. Satisfying a training-cost threshold does not justify removing these protections.

## An experimental route with staged acceptance

First validate time alignment, units, and data visibility; then reproduce the operator baseline and BC. After building a simulation adapter that preserves the contract, compare offline RL candidates, the operator, and PG-MOEA/D-IEpsilon under matched disturbances. The environment is continuing, so window endings use truncated. Report separate metrics for pre-gate candidates, accepted execution, and fallback events.

The accessible repository currently contains no formal historical dataset, world-model weights, or complete PG-MOEA/D-IEpsilon and plant-environment code referenced by the specifications. This tutorial therefore supplies a modeling design and integration checklist, not a claim that the industrial comparison has already been completed. Coal reductions, quality compliance, and closed-loop benefits require subsequent actual experiments. Describe simulated results as rollouts or deductions.

## Leave an integration checklist for the next experiment

Formal integration still requires variable units and sample times, original sources for RATE and absolute bounds, assay publication times, executed-action logs, and the world model's training interval. It also requires the original baseline configuration, weights, and reproducible entry point. Mark any missing item explicitly in the results table instead of filling plant facts with plausible defaults. The course establishes a reviewable modeling route; industrial validation requires this evidence to complete the connection.

## Exercises and answers

1. Why does accurate f-CaO prediction not directly prove effective energy-saving decisions?
2. A policy candidate fails Gate 3 but has Gate 5 authorization. May it execute?
3. At one decision every 5 minutes, what duration corresponds to $1/(1-\gamma)$ when $\gamma=0.98$?

<details><summary>Show reference answers</summary>

1. Decisions change state distributions and action conditions. Predictive accuracy may hold only near historical behavior. Action-response validity, coverage, constraints, and controlled evaluation are also needed.
2. No. The five layers are serial requirements; failure at any layer triggers fallback. Authorization cannot supply missing model credibility.
3. About 50 steps, or 250 minutes. This is a common timescale for exponentially discounted weights, not a hard cutoff after which outcomes are ignored.

</details>
`,
  },
  {
    id: '22', number: 22, module: 7, title: 'Offline Reinforcement Learning: From Logs to Policies',
    subtitle: 'Understand out-of-distribution actions, then compare BC, TD3+BC, CQL, and IQL', duration: 50, level: '进阶',
    prerequisites: ['10', '17', '20'], objectives: ['Explain why off-policy does not mean offline', 'Understand conservative values and advantage-weighted imitation', 'Design support diagnostics and offline evaluation'],
    tags: ['Offline RL', 'CQL', 'IQL', 'TD3+BC'], sources: ['cql-paper', 'iql-paper', 'td3bc-paper'],
    body: String.raw`## Why a million log records can still teach the wrong behavior

A large log does not cover every important action. Operators may keep setpoints in a narrow region for long periods, while a policy proposes extreme increments in those same states during training. A Q-network outputs numbers even for unseen actions, and the optimizer may select the numbers that are erroneously high. An online algorithm can correct some errors through new interaction. Purely offline training has no such correction channel.

This is the key distinction between offline RL and general off-policy RL. The latter permits a behavior policy different from the target policy but often continues acquiring new data. The former has a fixed dataset and must explicitly address support and extrapolation error. The [CQL paper](https://arxiv.org/abs/2006.04779) discusses this directly.

## First baseline: behavioral cloning

BC minimizes the negative log likelihood of historical actions: $L_{BC}=-\mathbb E_{(s,a)\sim\mathcal D}\log\pi_\theta(a\mid s)$. It asks whether existing decisions can be reproduced, and is relatively direct to train and debug. It does not optimize long-term reward. Small deployment errors can push states away from the historical distribution, allowing imitation errors to accumulate.

Even so, BC is an essential diagnostic baseline. If a complicated offline RL method cannot consistently outperform BC under the same evaluation protocol, investigate rewards, data, and evaluation before increasing model size. A dataset containing both good and poor operations offers room to distinguish behaviors by long-term value.

## Three improvement routes—and what each restrains

| Method | Core mechanism | Benefit and cost |
|---|---|---|
| TD3+BC | Optimize Q while keeping the actor close to logged actions | A simple baseline; imitation strength and scales must agree |
| CQL | Relatively suppress values of poorly supported actions | Less optimistic extrapolation; excessive strength can be too conservative |
| IQL | Learn values on logged actions, then imitate with advantage weights | Fewer queries of unknown actions during training; deployment coverage still needs checking |

The continuous-action TD3+BC objective can be written $\mathbb E[\lambda Q(s,\pi(s))-\|\pi(s)-a\|^2]$. The original method normalizes Q scale. Its [paper](https://arxiv.org/abs/2106.06860) is a useful implementation reference for a first deep offline method.

For discrete actions, a common CQL regularizer is:

$$\alpha\,\mathbb E_{s\sim\mathcal D}\left[\log\sum_a\exp Q(s,a)-\mathbb E_{a\sim\mathcal D(\cdot\mid s)}Q(s,a)\right].$$

It is optimized together with Bellman error. This is the discrete form. Integral approximations, sampling distributions, and density corrections for continuous actions depend on the implementation; do not replace them with an unexplained sum over arbitrary sampled actions.

## Why IQL learns an expectile

IQL does not directly maximize over unknown new actions generated by the policy. It first uses logged Q-values to learn a state value tilted toward higher values:

$$L_V=\mathbb E\left[|\tau-\mathbf1(u<0)|u^2\right],\quad u=Q(s,a)-V(s).$$

With $\tau>0.5$, residuals above V receive greater weight. It then updates Q with $r+\gamma(1-d)V(s')$ and fits logged actions with weights $\exp(\beta A)$. Practical implementations must limit those weights so that a few high-advantage samples do not dominate. The [IQL paper](https://arxiv.org/abs/2110.06169) explains this route to implicit improvement.

Calculate it: with $\tau=0.7$, a +2 residual has loss $0.7\times4=2.8$, while a -2 residual has loss $0.3\times4=1.2$. Underestimation of the same magnitude is penalized more strongly, pushing V toward a higher conditional value rather than an ordinary mean.

## Data construction is half the algorithm

Save observations, executed actions, rewards, next observations, natural termination, and truncation. If a safety gate rejects a policy proposal, distinguish the candidate action from the action actually executed; attribute the physical transition to the latter. Data should also trace control modes, operator changes, abnormal shutdowns, sensor quality, and when action information was available. Otherwise, an algorithm may wrongly credit human corrective action to its own candidate.

~~~mermaid
flowchart TD
    D["Historical logs"] --> T["Construct transitions by time and visibility"]
    T --> S["Separate training, validation, and testing"]
    S --> B["Behavioral cloning baseline"]
    S --> R["Conservative offline policy"]
    B --> E["Support and independent evaluation"]
    R --> E
    E --> F["Record payoff, costs, and uncertainty"]
~~~

## Offline evaluation has assumptions too

FQE fixes the policy being evaluated and fits its value. Importance sampling depends on behavior probabilities and support. World-model rollouts depend on credible predictions under new actions. None provides true counterfactual outcomes for free. Cross-check estimates, compare rankings across methods, and explicitly report uncertainty in poorly supported regions. A small FQE training loss does not establish accurate real-world value estimates.

## A counterexample involving an out-of-distribution action

Suppose a log contains only actions -0.1, 0, and 0.1 in one state, each with true return around 1. The network predicts Q=20 for unseen action 0.9, so greedy improvement selects 0.9. No actual transition supports that high value. Reducing training-set Bellman error does not automatically constrain this point. A good training error and an untrustworthy decision can therefore coexist.

Conservative terms, behavior regularization, and weighted imitation restrain this loophole in different ways, but each may miss good actions outside the data. Offline RL is not simply about being as conservative as possible. It asks which improvements are credible within the available evidence. Data quality and coverage bound what can be learned before an algorithm's name does.

Also distinguish historical action frequency from the true behavior-policy probability. If logs omit the operator's decision mechanism, a fitted behavior model provides only estimated probabilities. Report estimation error and support diagnostics when using those probabilities in importance weights. Predicted density is not known ground truth; replacing a zero-probability region with a tiny constant does not “repair” it into an unbiased evaluation.

## Exercises and answers

1. Why can Q-values keep rising when standard SAC is trained on static logs?
2. IQL does not query unknown actions during training. Does that guarantee deployed actions always remain within data support?
3. A log records candidate increment +0.5, but the gate executes 0. Which action belongs in the transition?

<details><summary>Show reference answers</summary>

1. The actor may repeatedly select overestimated OOD actions. Bellman bootstrapping propagates the errors without new environmental feedback to correct them.
2. No. Function generalization, state-distribution changes, and stochastic sampling can produce poorly supported behavior. Diagnostics and gating remain necessary.
3. Label the transition with the executed 0. Store candidate +0.5 separately as an audit field for rejection analysis.

</details>
`,
  },
  {
    id: '23', number: 23, module: 7, title: 'Model Learning, Dyna, and Short Rollouts',
    subtitle: 'Turn prediction models into planning resources while controlling model error', duration: 40, level: '进阶',
    prerequisites: ['08', '19', '22'], objectives: ['Distinguish real experience, model experience, and planning updates', 'Understand how model error accumulates through rollouts', 'Design short branched rollouts restricted by data support'],
    tags: ['Dyna-Q', 'MBPO', 'MOPO', 'World models'], sources: ['mbpo-paper', 'mopo-paper', 'project-contract'],
    body: String.raw`## Why learn a policy after learning a transition model?

Supervised prediction can estimate the next state under one action. Decision-making must still compare long-term consequences across candidate actions. Model-based RL uses learned dynamics to generate extra transitions, plan, or improve a policy. Models can reduce dependence on expensive interaction, but introduce another risk: a policy may become skilled at exploiting prediction errors.

Build intuition with tabular Dyna-Q. After each real transition, perform an ordinary Q-learning update, store the transition in the model, and then sample previously seen state–action pairs for several planning updates using predicted rewards and next states. The difference is not the Q update equation; it is whether the sample comes from the real environment or an internal model.

## A minimal Dyna update

~~~python
# Illustration for a small deterministic environment; a stochastic model cannot store only the latest transition.
q[s, a] += lr * (reward + gamma * (1 - terminal) * q[next_s].max() - q[s, a])
model[(s, a)] = (reward, next_s, terminal)
seen_pairs = list(model)
for _ in range(planning_steps):
    si, ai = seen_pairs[rng.integers(len(seen_pairs))]
    ri, sj, end = model[(si, ai)]
    q[si, ai] += lr * (ri + gamma * (1 - end) * q[sj].max() - q[si, ai])
~~~

A terminal transition with reward 1, initial Q of 0, and learning rate 0.1 gives Q=0.1 after the real update. Planning once more with the same transition gives 0.19. No new environmental information was acquired, but known information was propagated further. The virtual sample is not independent of the real one, and two updates do not count as two real interactions.

In a stochastic environment, one state–action pair can lead to several next states. Storing only the latest outcome turns chance noise into an apparent deterministic rule. Store an empirical transition distribution, mean rewards, or a probabilistic model, and sample during planning. Nonstationary environments also require attention to model staleness.

## Two errors in deep world models

One-step prediction error comes from model fitting. Distribution shift comes from the policy visiting state–action pairs rare during training. The two can amplify each other: a small first-step prediction error makes the second-step input inaccurate, and later inputs may become increasingly unfamiliar. In a simple noncontracting additive-error example, fixed bias of 0.02 per step can accumulate to 0.4 over 20 steps. Real systems may amplify or attenuate errors, so linear accumulation is not a universal error law.

Low one-step MSE on an independent test set therefore does not prove suitability for long-horizon policy optimization. Check multistep error, action-intervention responses, boundary behavior, error calibration, and whether the policy obtains unusually high returns by exploiting model flaws.

## The MBPO lesson: short branches from real states

[MBPO](https://arxiv.org/abs/1906.08253) emphasizes short model trajectories starting from states in real data, treating rollout length as a way to control error. Real states provide frequent anchors instead of allowing one virtual trajectory to extend indefinitely.

~~~mermaid
flowchart TD
    D["Real historical state bank"] --> S["Sample covered initial states"]
    S --> M["Short model and policy rollouts"]
    M --> U{"Uncertainty and boundary checks"}
    U -- "Credible" --> B["Add to model replay buffer"]
    U -- "Not credible" --> X["Stop branch and record reason"]
    B --> P["Improve policy with mixed experience"]
    P --> M
~~~

Treat model-data proportion, branch length, and initial-state selection as experimental variables. Longer rollouts are not necessarily better. More model samples in a buffer do not imply a proportional increase in information.

## The MOPO lesson: include uncertainty in the objective

In the offline setting, a model cannot correct itself promptly through new plant interaction. [MOPO](https://arxiv.org/abs/2005.13239) adds an uncertainty penalty to model rewards: $\tilde r(s,a)=\hat r(s,a)-\lambda_u u(s,a)$. Ensemble disagreement offers one uncertainty signal, but common bias can make all models agree and be wrong. It is not a universal estimator of true error.

Keep uncertainty penalties and safety costs semantically distinct. The former asks how uncertain the model is; the latter asks whether task constraints are violated. Model confidence cannot authorize crossing a physical boundary, and a large penalty coefficient cannot replace per-step protection.

## What industrial time-series models need for this connection

A world model must explicitly receive candidate setpoints and their timing, representing delays in inner-loop tracking. A model that forecasts from history without conditioning on actions cannot directly describe the counterfactual consequences of a different decision. Separate the responsibilities of soft sensors, exogenous-disturbance forecasters, and action-conditioned dynamics models as well.

The project specification defines rollout windows starting at 12 steps and capped at 72. This is not an automatically credible horizon. Validate errors and coverage, shortening windows where appropriate while remaining within project boundaries. All outputs remain simulation rollouts. This tutorial has neither world-model weights nor production data and supplies no invented model-accuracy or energy-saving figures.

## Separate model acceptance from policy acceptance

Model acceptance first checks predictions on independent segments with fixed historical actions. Policy acceptance checks whether the new policy's action distribution remains compatible with the model's training coverage. If the same model is repeatedly optimized against and used as the sole judge, the policy can overfit the judge's flaws. Independent models, held-out operating conditions, and sensitivity analyses offer cross-checks, but still do not replace evidence of plant effects.

Before lengthening rollouts, inspect whether error grows strongly with steps, gate rejection increases, or the policy concentrates near training-domain boundaries. Those signs support shorter branches, a lower model-data proportion, or tighter support restrictions rather than simply generating more virtual data.

## Exercises and answers

1. Are a hundred additional planning updates equivalent to a hundred new plant observations?
2. A model has low one-step error on historical data, but the policy performs poorly. What could explain this?
3. If every ensemble member rates an action highly, may gating be removed?

<details><summary>Show reference answers</summary>

1. No. Planning reuses existing model knowledge; its information source is still the original data.
2. Accumulated multistep error, action-distribution shift, missing action dependence, or exploitation of model flaws can all cause this.
3. No. Ensemble members can share bias, and physical constraints and execution authorization are independent of model disagreement.

</details>
`,
  },
  {
    id: '24', number: 24, module: 7, title: 'Constrained RL and a Complete Research Cycle',
    subtitle: 'Move from knowing algorithms to asking questions and producing credible evidence', duration: 45, level: '实践',
    prerequisites: ['20', '21', '22', '23'], objectives: ['Separate objectives and constraints with a CMDP', 'Understand dual-update directions and limitations', 'Formulate reproducible research questions and deliverables'],
    tags: ['CMDP', 'Constrained optimization', 'Research roadmap'], sources: ['cpo-paper', 'rliable-paper', 'dpo-paper', 'project-contract'],
    body: String.raw`## When objectives cannot be traded freely

A fixed negative reward for a quality violation still lets an algorithm accept that violation if energy benefits are large enough. That is not necessarily a coding mistake; the objective you supplied permits the trade. A CMDP separates the primary payoff from multiple costs:

$$\max_\pi J_r(\pi),\qquad J_{c_k}(\pi)=\mathbb E_\pi\left[\sum_{t\ge0}\gamma^t c_k(s_t,a_t)\right]\le d_k.$$

Costs may represent quality-exceedance magnitude, gas-boundary violations, action limits, or support risk. $d_k$ must match the cost's units, discount, and time horizon. Per-step violation rate, an unnormalized total count, and discounted accumulated cost are different metrics. The [CPO paper](https://arxiv.org/abs/1705.10528) is one starting point for constrained policy optimization.

## Lagrange multipliers are adaptive constraint prices

One common approach optimizes $J_r-\sum_k\lambda_k(J_{c_k}-d_k)$ for the policy and adjusts nonnegative multipliers according to excess cost:

$$\lambda_k\leftarrow\max\left(0,\lambda_k+\eta_\lambda(\hat J_{c_k}-d_k)\right).$$

If cost exceeds its budget, the price rises and subsequent policy updates emphasize that cost more. Below budget, the price can fall. The policy balances payoff and costs; the multiplier corrects the tendency to exceed a budget. Check the direction numerically: $\lambda=0.5,\eta=0.1,\hat J_c=0.08,d=0.05$ gives a new multiplier of 0.503.

~~~python
# Conceptual fragment: maintain a reward critic and separate cost critics.
violation = estimated_cost.detach() - cost_limit
with torch.no_grad():
    lagrange.add_(dual_lr * violation)
    lagrange.clamp_(min=0.0, max=lagrange_cap)
actor_objective = reward_objective - (lagrange.detach() * cost_objectives).sum()
~~~

An excessive learning rate can make multipliers and the policy oscillate. Different cost scales can let one constraint dominate updates for long periods. An upper bound helps numerical stability but may weaken constraint pressure, so report it. Ordinary neural-network optimization with finite samples does not guarantee a globally optimal feasible solution.

## Expected constraints differ from per-step safety

A policy with a low average violation rate can still cause a severe exceedance on one occasion. Common CMDP formulations constrain expected cumulative cost. Per-step hard boundaries, tail risk, and almost-sure constraints need separate definitions and validation. A claim to use “safe RL” does not tell readers what was actually guaranteed.

This project models quality and gas boundaries as costs while retaining five-layer gating, fallback, and the existing control system. Gating is an independent protection layer and cannot be replaced by a low average cost. Also report the difference between original policy proposals and gated execution so a frequently rejected policy cannot hide its shortcomings behind the protection layer.

## Turn an idea into a testable research question

For example: “With the same historical-data budget and candidate-action constraints, does explicitly adding assay age reduce quality violations when delays change, without materially increasing coal consumption?” This identifies an intervention, comparison, conditions, and metrics. It is easier to test—and to interpret a negative result—than “combine a Transformer with SAC to improve performance.”

Create four controls: complete observations, assay age removed, history window removed, and latest sensor readings only. Hold other settings fixed and evaluate on delay and operating conditions excluded from tuning. If the effect appears only under training conditions, report that honestly. A negative result can reveal whether the model actually uses delay information.

## A six-to-eight-week delivery schedule

| Time | Main work | Reviewable deliverable |
|---|---|---|
| Weeks 1–2 | Interaction, probability, MDPs, and tabular algorithms | Hand-calculated Bellman equations; independently implemented small environment and Q-learning |
| Week 3 | DQN and policy gradients | Replay and target-network controls; an explanation of advantage estimates |
| Week 4 | GAE, PPO, and continuous actions | Correct clipped objectives and transformed densities |
| Week 5 | SAC and experimental protocols | Equal-budget baselines and raw logs from multiple seeds |
| Week 6 | Environment modeling and the industrial case | Data dictionary, time visibility, and gate test cases |
| Weeks 7–8 | Offline, model-based, and constrained topics | A reproducible report on one narrow question |

This is a suggested schedule, and reading-time labels are estimates rather than completion promises. Existing neural-network knowledge can shorten introductory network work, leaving more time for conditional expectations, probability ratios, time boundaries, and statistical evaluation. Those topics often improve research reliability more than swapping networks.

## How to organize the final research package

Deliver an environment contract, data-construction scripts, frozen configuration, code version, raw evaluation for every seed, analysis scripts that generate figures, and a report explaining failure conditions. Separate verified conclusions, model rollouts, and unverified hypotheses. Real industrial benefits require corresponding plant validation; they cannot be extrapolated from teaching-simulator numbers.

Revisit the [study of statistics across repeated runs](https://arxiv.org/abs/2108.13264) before writing the report. It helps move the question from “Which mean is larger?” to “What scope of conclusion does the evidence support?”

## Optional reading: connections to language-model post-training

Concepts such as policy, reward, KL, and credit assignment transfer to language models, but action sequences, data-generation costs, and evaluation differ. DPO optimizes a classification-style objective directly from preference data. It cannot simply be described as online RL identical to PPO. The [DPO paper](https://arxiv.org/abs/2305.18290) explains its relationships to reward modeling and preference objectives. This tutorial's main path remains general sequential decision-making and process industry; explore this branch after completing the foundational experiments.

## Exercises and answers

1. Does average cost below its threshold imply that every step satisfies a hard boundary?
2. Should a dual multiplier increase or decrease when training cost exceeds budget?
3. Write a research question for which you would accept “no significant improvement” as a result.

<details><summary>Show reference answers</summary>

1. No. Expected cumulative constraints allow averaging across events. Per-step safety needs different constraints or independent protection.
2. Increase it so that violating the budget becomes more expensive in later policy updates; also check cost units and estimation error.
3. Example: “Under the same data and computing budgets, does a history window reduce constraint-violation rates in delay-switching scenarios?” If not, investigate whether other features already encode temporal information rather than discarding unfavorable seeds.

</details>

**Course completion standard:** Independently define a decision problem, explain algorithmic mechanisms, build a verifiable experiment, and clearly state what your evidence still cannot prove.
`,
  },

];
