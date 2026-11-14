import type { Chapter, Source } from '../../types';

const FENCE = '```';

export const foundationSourcesEn: Source[] = [
  { id: 'f-sutton', title: 'Reinforcement Learning: An Introduction, 2nd edition', author: 'Richard S. Sutton · Andrew G. Barto', year: '2018', url: 'https://mitpress.mit.edu/9780262039246/reinforcement-learning/', note: 'Reference textbook for the foundations, tabular methods and function approximation. The examples and explanations in this tutorial are original.' },
  { id: 'f-silver', title: 'UCL Reinforcement Learning Lectures', author: 'David Silver', year: '2015', url: 'https://www.davidsilver.uk/teaching/', note: 'Original lecture materials on MDPs, dynamic programming, model-free prediction and control, function approximation and policy gradients.' },
  { id: 'f-probability', title: 'Statistics 110: Probability', author: 'Joe Blitzstein · Harvard University', year: 'Maintained resource', url: 'https://stat110.hsites.harvard.edu/', note: 'Further study of conditional probability, expectation, variance and the law of total expectation.' },
  { id: 'f-decision', title: 'Algorithms for Decision Making', author: 'Mykel J. Kochenderfer · Tim A. Wheeler · Kyle H. Wray', year: '2022', url: 'https://algorithmsbook.com/decisionmaking/', note: 'The authors’ decision-making textbook, covering MDPs, POMDPs, planning and learning.' },
  { id: 'f-ucb', title: 'Finite-time Analysis of the Multiarmed Bandit Problem', author: 'Peter Auer · Nicolò Cesa-Bianchi · Paul Fischer', year: '2002', url: 'https://doi.org/10.1023/A:1013689704352', note: 'Original UCB analysis. Its bounds depend on assumptions such as bounded, stationary rewards.' },
  { id: 'f-gym', title: 'Handling Time Limits', author: 'Farama Foundation', year: 'Maintained resource', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/', note: 'Official explanation of termination, truncation and bootstrapping.' },
  { id: 'f-td', title: 'Learning to Predict by the Methods of Temporal Differences', author: 'Richard S. Sutton', year: '1988', url: 'https://jmvidal.cse.sc.edu/library/sutton88a.pdf', note: 'Original temporal-difference prediction paper, in a university-hosted copy.' },
  { id: 'f-qlearning', title: 'Q-learning', author: 'Christopher J. C. H. Watkins · Peter Dayan', year: '1992', url: 'https://www.gatsby.ucl.ac.uk/~dayan/papers/wd92.html', note: 'Author-hosted paper and errata. Retain the assumptions behind its convergence result.' },
  { id: 'f-triad', title: 'Emphatic Algorithms for Deep Reinforcement Learning', author: 'Ray Jiang et al.', year: '2021', url: 'https://proceedings.mlr.press/v139/jiang21j.html', note: 'Research context for instability when function approximation, off-policy learning and bootstrapping are combined.' },
  { id: 'f-target', title: 'Why Target Networks Stabilise Temporal Difference Methods', author: 'Mattie Fellows · Matthew J. A. Smith · Shimon Whiteson', year: '2023', url: 'https://proceedings.mlr.press/v202/fellows23a.html', note: 'Theoretical analysis of target-network stability; it does not establish convergence for arbitrary configurations.' },
  { id: 'f-dqn', title: 'Human-level control through deep reinforcement learning', author: 'Volodymyr Mnih et al.', year: '2015', url: 'https://doi.org/10.1038/nature14236', note: 'Original DQN research combining neural networks, experience replay and target networks.' },
  { id: 'f-pytorch', title: 'Reinforcement Learning (DQN) Tutorial', author: 'PyTorch contributors', year: 'Maintained resource', url: 'https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html', note: 'Runnable CartPole and PyTorch tutorial. Consult the official page for its current version.' },
  { id: 'f-doubleq', title: 'Double Q-learning', author: 'Hado van Hasselt', year: '2010', url: 'https://proceedings.neurips.cc/paper_files/paper/2010/hash/091d584fced301b442654dd8c23b3fc9-Abstract.html', note: 'Original paper on double estimators and maximization bias.' },
  { id: 'f-double-dqn', title: 'Deep Reinforcement Learning with Double Q-learning', author: 'Hado van Hasselt · Arthur Guez · David Silver', year: '2015 / AAAI 2016', url: 'https://arxiv.org/abs/1509.06461', note: 'Double DQN separates action selection from action evaluation.' },
  { id: 'f-reinforce', title: 'Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning', author: 'Ronald J. Williams', year: '1992', url: 'https://doi.org/10.1007/BF00992696', note: 'The original REINFORCE paper.' },
  { id: 'f-policy-gradient', title: 'Intro to Policy Optimization', author: 'OpenAI Spinning Up', year: 'Maintained resource', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html', note: 'Derivations of trajectory probabilities, the log-derivative trick, reward-to-go and baselines.' },
];

export const foundationChaptersEn: Chapter[] = [
  {
    id: '01', number: 1, module: 1, title: 'From one action to long-term return',
    subtitle: 'Connect the agent, environment and feedback before discussing algorithms.',
    duration: 30, level: '入门', prerequisites: [],
    objectives: ['Distinguish supervised prediction from sequential decision-making', 'Write a trajectory with consistent time indices', 'Calculate discounted return and explain the discount factor'],
    tags: ['Agent', 'Environment', 'Return', 'Discount factor'], lab: 'return', sources: ['f-sutton', 'f-gym'],
    body: String.raw`
## First ask: what are we trying to learn?

Suppose you have an accurate temperature predictor. It answers, “If the current conditions continue, how hot might it be in ten minutes?” An operator needs a different answer: “How should I adjust the setpoint now to keep energy consumption low and quality stable over the next hour?” Prediction describes what may happen; decision-making also compares the consequences of actions. Reinforcement learning studies this loop: **actions change the future, and feedback changes subsequent actions**.

Before turning the problem into an algorithm, separate five roles. The agent is the rule or program making choices; the environment is the process outside those choices; the state is information used for decisions; an action is something the program is permitted to change; and a reward is a numerical assessment of an outcome. A policy $\pi(a\mid s)$ gives the probability of choosing action $a$ in state $s$. A policy need not be a neural network: a table or a rule can also be a policy. See [Sutton and Barto’s textbook](https://mitpress.mit.edu/9780262039246/reinforcement-learning/) for the terminology.

In this tutorial’s industrial case, the agent proposes **bounded increments to operational setpoints** every five minutes, and lower-level control loops track them. It does not directly drive fans or valves. For now, consider an example requiring no industrial background: a warehouse robot can immediately collect a low-value item or take a detour for a more valuable one. It must compare the reward along the entire route.

## A consistent timeline: reward follows action

We use $S_t,A_t,R_{t+1},S_{t+1}$ throughout: observe $S_t$, choose $A_t$, then receive $R_{t+1}$ and $S_{t+1}$ from the environment. Some papers call the same reward $r_t$. That is a different indexing convention, so align the entire convention when transferring equations.

${FENCE}mermaid
flowchart TD
    S["Read observation and current state"] --> P["Policy selects an action"]
    P --> E["Environment advances one step"]
    E --> R["Receive reward and new observation"]
    R --> D{"Has the task truly ended"}
    D -- "No" --> S
    D -- "Yes" --> U["Record trajectory and update policy"]
    U --> S
${FENCE}

A policy update can happen at every step or after collecting a batch. Interaction and learning have different clocks: sampling the environment once does not restrict a neural network to one update.

## Why not consider only the immediate reward?

Discounted return from time $t$ is defined as:

$$G_t=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1},\qquad 0\leq\gamma\leq1.$$

For three rewards $[2,-1,5]$ with $\gamma=0.9$, $G_0=2-0.9+0.81\times5=5.15$. A route that earns 4 immediately and ends has return 4. The first route starts with a smaller reward but is preferable under this objective. With $\gamma=0.2$, its return is only 2, and the preference reverses. **Changing the discount factor changes the objective, not merely the speed of training.**

For a continuing task, bounded rewards and $\gamma<1$ allow the infinite sum to converge. $1/(1-\gamma)$ provides a rough effective step scale, not a strict planning endpoint. Using the same $\gamma$ for five-minute and one-minute steps implies different preferences over physical time; recalibrate when comparing sampling intervals.

Here is a complete return-calculation function. Accumulating backward avoids recomputing the entire suffix for every starting point:

${FENCE}python
def discounted_returns(rewards, gamma):
    result = [0.0] * len(rewards)
    running = 0.0
    for t in range(len(rewards) - 1, -1, -1):
        running = rewards[t] + gamma * running
        result[t] = running
    return result

assert abs(discounted_returns([2, -1, 5], 0.9)[0] - 5.15) < 1e-9
${FENCE}

## Return, value and objective are different quantities

The $G_t$ from one realized trajectory is a random sample. A value function takes an expectation of such samples under specified conditions. A learning objective usually also averages over an initial-state distribution. One unusually high exploration return does not establish that a policy improved. Independent evaluation, multiple environment seeds and baseline comparisons are needed.

Reward is not a naturally given “correct answer.” Rewarding only throughput can sacrifice quality; rewarding only steadiness can encourage never adjusting anything. Industrial quality and environmental boundaries should be explicit constraints, reported separately rather than hidden by an aggregate score. The warehouse example has no safety constraints and is not an industrial deployment design.

## Separate termination from interruption

Reaching a goal that ends the task is termination. Cutting a continuing process into one hundred steps to limit computation is truncation. Both require resetting the sampler, but the state after truncation can still have future value. [Gymnasium’s official explanation](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) distinguishes these signals. TD, DQN and GAE will all depend on this distinction.

Open the return experiment. Predict how increasing $\gamma$ changes the contribution of distant rewards, then move the slider. Recording the difference between your prediction and the outcome is more useful than simply watching an animation.

## Treat the decision interval as part of the model

“Increase once” every five seconds and every five minutes produces very different cumulative changes. First decide how long an action is held, then define the interval covered by its reward. If action durations vary, revisit the temporal meaning of an ordinary fixed-step MDP; do not casually concatenate log segments of different lengths into adjacent transitions.

For a first project, make a timing table: when the observation formed, when the action was issued, when the lower-level loop executed it, which interval the reward belongs to, and when the quality result became available. Every row should use only information available then. You will know which five minutes $r_{t+1}$ describes and which material batch an assay belongs to, rather than maintaining consistency only in mathematical subscripts.

## Exercises and answers

One route gives rewards $[0,0,10]$, another $[6]$. For which discount factors is the first preferable? Should future value be set to zero if the process merely reaches a sampling limit?

<details><summary>View the worked answer</summary>

The first return is $10\gamma^2$, so it is preferable when $\gamma>\sqrt{0.6}\approx0.7746$; equality gives a tie. An external sampling limit is truncation, so normally retain a bootstrap value for the final observation. If the task itself declares that the last instant is the endpoint, it is a finite-horizon task: include remaining time in the state and set subsequent return to zero at the true endpoint.

</details>
`,
  },
  {
    id: '02', number: 2, module: 1, title: 'Multi-armed bandits: what does exploration cost?',
    subtitle: 'Understand why information matters in the simplest decision problem.',
    duration: 35, level: '入门', prerequisites: ['01'],
    objectives: ['Implement an incremental mean and ε-greedy', 'Explain the uncertainty bonus in UCB', 'Distinguish realized reward from pseudo-regret'],
    tags: ['Bandit', 'Exploration and exploitation', 'UCB', 'Regret'], lab: 'bandit', sources: ['f-sutton', 'f-ucb'],
    body: String.raw`
## Remove state transitions and keep the central tension

There are four machines, and you may select one each round. Each produces a reward of 1 or 0 with an unknown probability. You want both to earn rewards and to discover which machine is better. Unlike a full MDP, the current action does not change the next round’s state. The remaining question is how to allocate a limited number of trials. This is a multi-armed bandit.

Let the true mean of action $a$ be $\mu_a$, its observation count be $N(a)$, and its empirical estimate be $\hat\mu(a)$. “Highest mean so far” does not mean “highest true mean.” A machine tried once that happened to win provides far weaker evidence than one tried a hundred times.

## Record experience with a one-line update

You do not need to revisit the entire history to update the mean. After reward number $n$ arrives:

$$Q_n=Q_{n-1}+\frac{1}{n}(R_n-Q_{n-1}).$$

Suppose an arm has four trials with mean 0.5, and its fifth reward is 1. The new mean is $0.5+(1-0.5)/5=0.6$. The bracket measures how much better this outcome was than the estimate. The pattern “estimate plus learning rate times error” will recur in TD and Q-learning.

For a nonstationary environment, a constant $\alpha$ can replace $1/n$ to give recent evidence more weight. The cost is that the result is no longer the ordinary mean of all historical samples. Whether to forget older evidence depends on whether the process actually drifts.

## ε-greedy: spend an explicit exploration budget

With probability $1-\epsilon$, choose an action with the highest current estimate; with probability $\epsilon$, choose uniformly from all actions. With four actions, a unique estimated best action and $\epsilon=0.2$, the best action is selected with probability $0.8+0.2/4=0.85$, not 0.8.

${FENCE}python
import random

def epsilon_greedy(q, epsilon, rng):
    if rng.random() < epsilon:
        return rng.randrange(len(q))
    best = max(q)
    ties = [a for a, value in enumerate(q) if value == best]
    return rng.choice(ties)

rng = random.Random(42)
q, counts = [0.0] * 4, [0] * 4
# Run this update after actually observing a reward:
a, reward = 2, 1.0
counts[a] += 1
q[a] += (reward - q[a]) / counts[a]
${FENCE}

Random tie-breaking matters. If all initial values are zero and the program always takes the first maximum, a purely greedy policy is biased toward the first array entry. An implementation detail can be mistaken for evidence.

## UCB: explore actions that remain uncertain

A common UCB form chooses:

$$A_{t+1}=\arg\max_a\left[Q_t(a)+c\sqrt{\frac{\ln t}{N_t(a)}}\right].$$

Try every previously untried arm once to avoid division by zero. The first term represents observed return; the second represents uncertainty. Fewer visits $N_t(a)$ give a larger exploration bonus. If an arm remains unselected, growing $\ln t$ can eventually bring it back into consideration. [Auer and colleagues’ original study](https://doi.org/10.1023/A:1013689704352) analyzes bounded-reward problems under stated assumptions. Its guarantee cannot be directly transferred to industrial processes with major drift, delayed feedback or actions that change operating conditions.

A hand calculation: let $t$ count completed trials. At $t=100$, two machines have means 0.7 and 0.6 and counts 95 and 5, totaling exactly 100. With $c=0.2$, their upper-confidence indices are approximately 0.744 and 0.792. UCB selects the second next, temporarily trading some estimated reward for information.

Thompson sampling instead samples parameters from a posterior and selects the action that is best under that sample. A Bernoulli arm can use a Beta posterior: prior $\mathrm{Beta}(1,1)$ becomes $\mathrm{Beta}(4,2)$ after three successes and one failure. Posterior probabilities evolve with evidence rather than prescribing a fixed exploration rate.

## How can policies be compared fairly?

Cumulative realized reward depends on luck. When a simulator’s true means are known, compute pseudo-regret:

$$\bar R_T=\sum_{t=1}^{T}(\mu_* - \mu_{A_t}),\qquad \mu_*=\max_a\mu_a.$$

It measures expected opportunities lost by selecting a less valuable arm. It is not the difference between one random reward curve for the best machine and the current curve. The web experiment explicitly uses synthetic arms, so this quantity is available. Real applications usually do not know $\mu_*$ and cannot pretend regret is directly observed.

Keep the machines’ true parameters fixed, repeat across seeds and give policies equal budgets. Inspect short-term reward, long-term regret and arm counts. A greedy policy winning once does not prove exploration is useless; excessive exploration can also waste the budget.

## Put exploration back into its actual conditions

The constant in the UCB bonus depends on reward scale. Changing rewards from 0–1 to 0–100 while retaining the coefficient changes the balance of exploitation and exploration. Use consistent units or explain rescaling rather than copying a familiar parameter.

A fixed $\epsilon$ has a lasting cost: with a unique optimal arm and ongoing uniform exploration, inferior arms continue to be sampled, so cumulative pseudo-regret generally keeps growing. Decaying exploration can reduce that cost, but decaying too soon can miss the correct action. Neither “explore more” nor “exploit immediately” is an answer independent of task conditions.

Industrial plants cannot simply cycle through four operating plans experimentally. Equipment inertia often breaks the bandit assumption of no state transitions, and safety constraints restrict the action set. Here the bandit teaches information value; it does not replace process modeling.

## Exercises and answers

There are five actions, $\epsilon=0.1$, and two tied maxima with uniform tie-breaking. What is the selection probability of each maximum? Why can setting $ε$ to zero immediately cause problems?

<details><summary>View the worked answer</summary>

Each maximal action has probability $(1-0.1)/2+0.1/5=0.47$; each of the other three has probability 0.02. Ending exploration too soon can turn early noise into a lasting bias, while fixed ongoing exploration incurs an ongoing cost. A sensible schedule depends on budget, drift and theoretical assumptions, not merely a memorized decay equation.

</details>
`,
  },
  {
    id: '03', number: 3, module: 1, title: 'Enough probability: from samples to expectations',
    subtitle: 'Turn expectation, conditional probability and variance into calculations.',
    duration: 40, level: '入门', prerequisites: ['01', '02'],
    objectives: ['Calculate discrete and conditional expectations', 'Connect policy and environment through total expectation', 'Understand sample means, variance and bias'],
    tags: ['Probability foundations', 'Conditional expectation', 'Variance', 'Sampling'], sources: ['f-probability', 'f-decision'],
    body: String.raw`
## You need four tools, not all of probability theory at once

RL equations often feel inaccessible because three levels are mixed together: a random variable, one realization, and the average over possible realizations. Use uppercase $R$ for a random reward, lowercase $r$ for an observed reward, and $\mathbb E[R]$ for its probability-weighted mean. A neural network’s estimate approximates this expectation; it is not another actual reward.

This chapter supplies four tools: conditional probability, expectation, total expectation and variance. For a systematic treatment, follow those topics in [Harvard Stat110](https://stat110.hsites.harvard.edu/). You need not memorize every probability distribution before beginning MDPs.

## An expectation is a weighted sum, not the most likely outcome

Suppose an action earns 2 with probability 80% and -3 with probability 20%:

$$\mathbb E[R]=0.8\times2+0.2\times(-3)=1.$$

A reward of 1 never occurs, yet 1 is the correct expectation. A value of 1 does not promise that the next reward will be 1; a bad outcome does not automatically prove the model wrong.

In general, nonlinear functions and expectation cannot be interchanged. If $X$ is equally likely to be -1 or 1, then $\mathbb E[X]=0$, but $\mathbb E[X^2]=1\ne0$. Maximization bias later arises from a related nonlinear operation: maximizing noisy estimates is not the same as maximizing true means.

## Conditional expectation: first specify what is known

$\mathbb E[R\mid S=s,A=a]$ does not average all trajectories indiscriminately. It concerns rewards given a particular state and action. Looking only at temperature can mix raw-material batches with very different mean responses. Stating the conditions is a first defense against treating confounded data as one process.

In state $s$, suppose the policy selects $a_1$ with probability 0.6 and $a_2$ with probability 0.4. Their conditional mean rewards are 3 and -1:

$$\mathbb E[R\mid S=s]=\sum_a\pi(a\mid s)\mathbb E[R\mid s,a]=0.6\times3+0.4\times(-1)=1.4.$$

This is the law of total expectation. Bellman equations add another layer: after choosing an action, the environment can transition randomly to different states. One expectation can therefore contain both policy and environment randomness.

## Variance describes how unstable a single conclusion can be

For the reward taking values 2 or -3 with mean 1:

$$\operatorname{Var}(R)=0.8(2-1)^2+0.2(-3-1)^2=4.$$

Its standard deviation is 2, in reward units. For $n$ independent, identically distributed samples, the sample mean has variance $4/n$. Quadrupling the sample count only halves its standard error. “Running a little longer” does not improve precision linearly. Consecutive industrial measurements are often strongly correlated; ten thousand adjacent records are not ten thousand independent experiments.

${FENCE}python
import random
import math

rng = random.Random(42)
rewards = [2.0 if rng.random() < 0.8 else -3.0 for _ in range(1000)]
mean = sum(rewards) / len(rewards)
sample_variance = sum((r - mean) ** 2 for r in rewards) / (len(rewards) - 1)
standard_error = math.sqrt(sample_variance / len(rewards))
print(mean, sample_variance, standard_error)
# These finite-sample estimates need not equal 1, 4 and 0.0632 exactly.
${FENCE}

A random seed makes an experiment reproducible; it does not turn a finite-sample mean into ground truth. Training seeds represent different learning histories, and evaluation seeds represent different test-environment histories. Record both when comparing algorithms.

## What questions do bias and variance answer?

Bias asks how far an estimator’s average over repeated sampling lies from the truth. Variance asks how far estimates from different samples lie from one another. A constant estimator can have zero variance and still be badly wrong. MC targets full returns and can fluctuate substantially. TD uses a current value estimate to obtain a target sooner but inherits estimation error. Such comparisons are meaningful only after specifying the target, sampling process and assumptions.

Mean return is not the only relevant risk metric. Two policies can have the same mean while one occasionally causes severe violations. Industrial experiments should also report violation frequency, maximum violation magnitude, tail behavior and fallback counts. We establish the statistical language here before introducing CMDPs.

## Read an implementation from the notation

For $\mathbb E_{a\sim\pi,\,s'\sim P}[f(s,a,s')]$, there are two routes: enumerate all $a,s'$ using known discrete probabilities, or sample through interaction and average $f$ when probabilities are unknown. Dynamic programming favors the former; MC and TD rely on the latter. This is a central bridge between notation and algorithms. [Algorithms for Decision Making](https://algorithmsbook.com/decisionmaking/) develops both approaches.

## Distinguish probability from probability density early

For discrete actions, $\pi(a\mid s)$ is a probability and all action probabilities sum to 1. A continuous-action policy usually provides a density: any exact real-valued point has probability zero, while an interval’s probability is the density integrated over that interval. A density can exceed 1, so that alone is not an implementation error.

PPO’s new-to-old policy ratio is a probability ratio for discrete actions and a density ratio at the same action for continuous actions. Both require the same measure and action transformation. After scaling or applying tanh to actions, the original density cannot be reused without considering the transformation.

Also, being uncorrelated is weaker than being independent. A small correlation coefficient does not automatically make time-series records independent trials. Independent training repetitions generally reveal learning stability more directly than splitting a single trajectory into many small pieces.

## Exercises and answers

Action A always earns 1. Action B earns -1 or 3 with equal probability. What are their expectations and variances? Can maximizing mean one-step reward distinguish them?

<details><summary>View the worked answer</summary>

Both expectations are 1. A has variance 0; B has variance $0.5(-1-1)^2+0.5(3-1)^2=4$. A mean-reward objective cannot distinguish them; a risk constraint or different utility objective may create a preference. Without changing the objective, it is not fair to fault an expectation-optimal algorithm for “not understanding risk.”

</details>
`,
  },
  {
    id: '04', number: 4, module: 2, title: 'MDPs and POMDPs: define the problem first',
    subtitle: 'A state is sufficient information about the future, not a sensor inventory.',
    duration: 40, level: '入门', prerequisites: ['01', '03'],
    objectives: ['Specify an MDP tuple and initial distribution', 'Diagnose missing state information and partial observability', 'Distinguish termination, time truncation and finite horizons'],
    tags: ['MDP', 'POMDP', 'State design', 'Gymnasium'], sources: ['f-decision', 'f-silver', 'f-gym'],
    body: String.raw`
## An algorithm optimizes the problem you actually define

“Lower energy consumption” is not yet an RL environment. Specify when decisions occur, what is observable, what may change, how actions affect the next step, when rewards arrive, and whether the task ends. These definitions matter more initially than choosing PPO or SAC.

A common discounted MDP is $\mathcal M=(\mathcal S,\mathcal A,P,R,\gamma)$; experiments also need an initial-state distribution $\rho_0$. $P(s'\mid s,a)$ describes transition probabilities, while $R(s,a)$ often denotes conditional expected reward. When reward and next state are jointly random, use $p(s',r\mid s,a)$ directly. Both notations are valid, but use one consistent definition within a project. See the [authors’ decision-making textbook](https://algorithmsbook.com/decisionmaking/) for details.

## The Markov property does not mean the world has no memory

The condition says that, given the current state and action, additional history does not improve the predicted next-step distribution:

$$P(S_{t+1}\mid S_0,A_0,\ldots,S_t,A_t)=P(S_{t+1}\mid S_t,A_t).$$

The world certainly has inertia. The question is whether the relevant memory is included in the state. A cart at the same position can be moving left or right; position alone is insufficient, whereas including velocity makes the description more complete. Current temperature alone often cannot distinguish heating from cooling; consider history, rates of change and actuator states.

Adding more variables does not automatically establish the Markov property. Omitted raw-material characteristics, internal stored heat and unmeasured disturbances may still affect the future. Distinguish an approximate state representation from the complete physical state.

## Incomplete information calls for POMDP language

When the true state $S_t$ is unavailable, the agent receives observation $O_t$. In principle it can maintain a belief state $b_t(s)=P(S_t=s\mid O_{0:t},A_{0:t-1})$. In practice, history windows, recurrent networks and state estimators often approximate this information. A history window addresses representation; it cannot conjure unmeasured facts.

The repository’s industrial observation contract retains 120 minutes of history, current setpoints, soft-sensor estimates, the latest assay and its age, and raw-material moduli. If an assay has not been released at time $t$, using its retrospectively backfilled value to improve prediction introduces temporal leakage. Excellent training performance under that input cannot be reproduced online.

${FENCE}mermaid
flowchart TD
    Q["Define the operating problem and decision interval"] --> O["List information actually available then"]
    O --> M{"Does the observation adequately describe the process"}
    M -- "Approximately" --> S["Construct a state representation"]
    M -- "Delays or hidden variables remain" --> H["Add history and state estimation"]
    H --> S
    S --> A["Define action bounds and reward and cost"]
    A --> T["Define termination and truncation"]
    T --> C["Check the environment with a random policy"]
${FENCE}

## A complete small modeling example

Consider a teaching inventory environment with daily restocking decisions. The state includes current stock and quantities ordered but not yet delivered; actions choose an order quantity from a finite set; the environment generates random demand and advances deliveries. Reward is sales profit minus holding and shortage costs, and the initial distribution specifies starting stock. Omitting outstanding orders creates a clear state deficiency: equal current inventories can receive different deliveries tomorrow.

For the industrial mapping, state information comes from the available past. Actions are normalized setpoint increments $a_t\in[-1,1]^K$, with physical proposals $Y^{sp}_{t+1}=Y^{sp}_t+\mathrm{RATE}\odot a_t$. Reward expresses energy and smoothness preferences; quality and environmental boundaries are separate constraint costs. This website runs teaching simulations and does not connect to equipment.

## How do the two ending signals enter code?

The [official Gymnasium interface](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) returns five objects per step. A sampling skeleton for a continuing task is:

${FENCE}python
obs, info = env.reset(seed=42)
for t in range(horizon):
    action = policy(obs)
    next_obs, reward, terminated, truncated, info = env.step(action)
    # Store the actual final observation, not an automatic reset observation.
    replay.add(obs, action, reward, next_obs, terminated)
    obs = next_obs
    if terminated or truncated:
        obs, info = env.reset()
${FENCE}

Use $terminated\lor truncated$ to **reset sampling**, but generally only $terminated$ to **stop bootstrapping future value**. A fixed evaluation window ending in this repository’s continuing industrial process is truncation. If the task itself is “complete delivery within the next ten steps,” the deadline belongs to the task definition: include remaining steps in the state and truly terminate at the deadline.

## Check the environment before the learner

Write down the expected response for a fixed initial state and action. Verify action bounds, reward units, observation shapes, seeds and ending conditions. Run zero-action, random and simple-rule policies. If even a zero action makes a physical variable jump instantaneously, investigate the environment before blaming learning. Passing an interface checker establishes format compatibility, not realistic dynamics or a sensible reward.

## A practical state audit

Find two log segments with similar current observations but different past trends. Compare subsequent responses under the same action. Systematic differences suggest that the representation omits relevant history. This does not prove a full Markov property, but it can directly expose obvious state aliasing.

Perform a similar audit for execution lag: has the lower-level loop received the new setpoint, is the controller saturated, and is the previous action still taking effect? If these influence the future, recording only the new target number may be insufficient. These are audit questions, not changes to the repository’s existing state dimension. Changes to the formal observation contract require separate checks of availability and interface compatibility.

## Exercises and answers

A temperature-control state contains only current temperature and setpoint. Why might identical states still produce different next temperatures? Does adding the last three temperature measurements establish a strict MDP?

<details><summary>View the worked answer</summary>

Stored heat, different heating or cooling rates, actuator lag and raw-material disturbances can cause different responses. History can reduce aliasing but cannot guarantee coverage of all hidden variables. Call it an approximate representation and evaluate prediction residuals, transition differences across histories and task performance. Do not present a modeling assumption as a proved fact.

</details>
`,
  },
  {
    id: '05', number: 5, module: 2, title: 'Bellman equations: reduce the future to one step',
    subtitle: 'Learn to evaluate consequences recursively instead of memorizing a formula.',
    duration: 40, level: '入门', prerequisites: ['03', '04'],
    objectives: ['Derive the Bellman expectation equation from return recursion', 'Distinguish V, Q and advantage', 'Separate policy evaluation from finding an optimal policy'],
    tags: ['Bellman', 'Value functions', 'V and Q'], lab: 'bellman', sources: ['f-sutton', 'f-decision', 'f-silver'],
    body: String.raw`
## Why introduce a value function?

Looking only at the next reward misses long-term effects, while simulating every possible future anew for each action is expensive. A value function compresses “what happens from here if a particular policy is followed” into one number. It is a reusable account of the future, but every entry depends on the policy, reward and discount conventions.

$$V^\pi(s)=\mathbb E_\pi[G_t\mid S_t=s],\qquad Q^\pi(s,a)=\mathbb E_\pi[G_t\mid S_t=s,A_t=a].$$

$V$ starts at a state and lets the policy choose the first action. $Q$ fixes that first action before following the policy. Consequently:

$$V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a).$$

$Q^\pi(s,a)$ is not an action’s fixed intrinsic goodness. The same detour has very different value under a policy that returns promptly to the main route and one that remains lost.

## Derive the method from a single identity

Separate the first reward:

$$G_t=R_{t+1}+\gamma G_{t+1}.$$

Given the current state, take a conditional expectation over actions, transitions and the future policy:

$$V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^\pi(s')\right].$$

This is the Bellman expectation equation. It does not claim only one future step remains; $V^\pi(s')$ contains everything beyond that step. See [Silver’s lectures on MDPs and dynamic programming](https://www.davidsilver.uk/teaching/) for the nested-expectation expansion. We work through an original numerical example below.

There is one nonterminal state A. A fixed policy receives reward 1 each step, stays in A with probability 0.5 and terminates with probability 0.5. Value after termination is zero, and $\gamma=0.9$:

$$V(A)=1+0.9\times[0.5V(A)+0.5\times0],\qquad V(A)=\frac{1}{0.55}\approx1.8182.$$

Starting from zero and repeatedly substituting gives $1,1.45,1.6525,\ldots$, approaching the same value. The immediate reward alone gives 1 and omits rewards that may follow.

## Evaluation and optimality differ by a max—and by the question

Evaluation asks what a given policy obtains. Control asks how much is possible when the policy can be chosen. The latter uses the Bellman optimality equation:

$$Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma\max_{a'}Q^*(s',a')\right].$$

Evaluation averages using $\pi$; optimality selects the largest action value. Replacing an expectation with a maximum silently changes “the value of the current exploratory policy” into “the value assuming greedy future actions.” This is the crucial distinction between SARSA and Q-learning later.

For example, let $Q(s,\text{left})=3$ and $Q(s,\text{right})=5$, with the policy going left with probability 0.75. Its state value is $0.75\times3+0.25\times5=3.5$, whereas choosing the best action gives 5. Both answers can be correct because they answer different questions.

## Advantage: how much better than the current habit?

$$A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).$$

In that example, the left advantage is -0.5 and the right advantage is 1.5. Advantage measures how much an action improves on the current policy’s average at that state. Its average under the same policy is zero: $0.75(-0.5)+0.25(1.5)=0$. Actor–Critic will use it to tell the Actor which action probabilities to increase or decrease.

## Write a backup you can check by hand

${FENCE}python
def expected_backup(transitions, values, gamma):
    # Each item is (probability, next state, reward, true termination).
    total = 0.0
    for probability, next_state, reward, terminal in transitions:
        future = 0.0 if terminal else values[next_state]
        total += probability * (reward + gamma * future)
    return total

v = {"A": 0.0, "end": 0.0}
model = [(0.5, "A", 1.0, False), (0.5, "end", 1.0, True)]
for _ in range(30):
    v["A"] = expected_backup(model, v, 0.9)
print(v["A"])
${FENCE}

Branch probabilities must sum to 1, and terminal reward must be counted once. A common mistake awards 10 on entering the terminal state and also sets its value to 10, counting the reward twice. “Reward on entry, zero value after the endpoint” is usually easier to audit.

## Why can repeated substitution converge?

For finite states and actions, bounded rewards and $\gamma<1$, the discounted Bellman operator is a contraction in the maximum norm: the difference between two estimates shrinks to at most $\gamma$ times its previous size. This supports tabular dynamic programming. Arbitrary neural networks, changing data distributions and approximate optimization do not automatically inherit that guarantee. See [Algorithms for Decision Making](https://algorithmsbook.com/decisionmaking/) for the theoretical background.

In the Bellman experiment, watch values propagate backward from rewards. One backup does not discover the complete optimal route; it propagates currently available next-state information backward one layer.

Check units too. If reward measures an energy difference per five minutes, value is the discounted accumulation of those rewards, not an instantaneous temperature or coal consumption per tonne. Label value plots with their units or normalization convention so a mathematical score is not mistaken for a direct physical prediction.

## Split a backup into three checkable operations

First enumerate candidate actions. Second enumerate each action’s possible next states and their probabilities. Third calculate reward plus future value. For evaluation, average action scores using policy probabilities; for control, maximize them. Separating the two random layers and the choice layer turns complicated notation into a small table.

An action having a 70% success rate does not mean the policy selects it with probability 0.7. Policy probability describes whether the agent chooses it; success probability describes the environment’s response after that choice. If the agent selects it only 20% of the time, the joint probability of this successful branch is $0.2\times0.7=0.14$. Confusing the two can yield plausible-looking but systematically incorrect results.

## Exercises and answers

An action earns 2 immediately, then enters a state valued at 4 with probability 0.7 or terminates with probability 0.3. What is its value at $\gamma=0.9$? How much is overcounted if the second branch incorrectly receives a future value of 4 too?

<details><summary>View the worked answer</summary>

The correct result is $2+0.9\times(0.7\times4+0.3\times0)=4.52$. The incorrect result is 5.6, an excess of 1.08. The immediate reward 2 occurs in both branches, so writing it outside the weighted sum is valid. If reward varies by branch, put it inside that sum as well.

</details>
`,
  },
  {
    id: '06', number: 6, module: 2, title: 'Dynamic programming: planning with a known model',
    subtitle: 'Build the first algorithmic thread through evaluation, improvement and value iteration.',
    duration: 40, level: '入门', prerequisites: ['05'],
    objectives: ['Implement a synchronous value-iteration sweep', 'Distinguish policy iteration from value iteration', 'Explain the limits imposed by model error and computational cost'],
    tags: ['Dynamic programming', 'Value iteration', 'Policy iteration'], lab: 'gridworld', sources: ['f-silver', 'f-decision'],
    body: String.raw`
## Give the algorithm an advantage: a known environment model

Suppose transition probabilities and rewards are known for every action in every state. We can enumerate outcomes on paper instead of estimating them through actual action. This computation is planning. Dynamic programming shares subproblem values, breaking sequential decisions into Bellman updates. [Silver’s dynamic-programming lectures](https://www.davidsilver.uk/teaching/) provide the theoretical background.

Start with a gridworld: cells are states, the four directions are actions, hitting a wall leaves the agent in place, ordinary moves earn -1, and entering the goal ends the task. Maximizing return then favors shorter paths to the goal. With slipping, an action can reach several cells; the backup must weight every transition branch rather than considering only the most likely one.

## Policy iteration: understand the current policy, then improve it

Policy iteration alternates two operations. Evaluation fixes $\pi$ and computes $V^\pi$. Improvement selects better actions using that value:

$$\pi_{\mathrm{new}}(s)\in\arg\max_a\sum_{s',r}p(s',r\mid s,a)[r+\gamma V^\pi(s')].$$

The first operation does not change the policy; the second does not treat the old value as the final answer. If actions can improve, evaluate the new policy again. Sufficiently accurate evaluation supports policy-improvement results in standard finite discounted MDPs. These are statements under explicit modeling conditions, not a promise that all approximate neural optimization improves monotonically.

## Value iteration: a little evaluation, then greedy improvement

Value iteration directly applies the optimality backup:

$$V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)[r+\gamma V_k(s')].$$

It tightly interleaves evaluation and improvement. Here $k$ counts computation rounds, not actual environment time. A thousand value-iteration sweeps are not a thousand agent–environment interactions: consulting a known model does not consume new real samples.

${FENCE}python
def value_iteration(model, states, actions, gamma=0.95, tolerance=1e-8):
    v = {state: 0.0 for state in states}
    while True:
        new_v = {}
        for state in states:
            scores = []
            for action in actions[state]:
                score = sum(
                    p * (r + gamma * (0.0 if terminal else v[next_state]))
                    for p, next_state, r, terminal in model[state, action]
                )
                scores.append(score)
            new_v[state] = max(scores) if scores else 0.0
        change = max(abs(new_v[s] - v[s]) for s in states)
        v = new_v
        if change < tolerance:
            return v
${FENCE}

The function assumes valid probabilities, finite action sets and $\gamma<1$. It updates synchronously: every state reads the old $v$ during a sweep. Overwriting values while computing instead gives an asynchronous or in-place update with different propagation speed. Both may be valid, but identify the scheme when comparing iteration counts.

## Work by hand and watch value propagate

Consider a three-cell line A → B → G with only a rightward action. Entering G earns 10; other rewards are 0; $\gamma=0.9$; value after the goal is zero. Start all values at zero. In sweep one, B becomes 10 while A remains 0. In sweep two, A becomes 9. Nothing changes afterward. Distant information must propagate along the graph.

If A also has an “exit immediately for 8” action, early greedy choices favor exiting. Only after B’s value propagates back does A prefer moving right. **A greedy policy extracted during intermediate iterations may be temporarily wrong** because values have not finished propagating, not because the algorithm contradicts itself.

## What should the stopping rule inspect?

$\Delta_k=\max_s|V_{k+1}(s)-V_k(s)|$ measures change between successive calculations, not directly observed error from the true answer. Contraction assumptions give error bounds, but with $\gamma$ near 1, a small change can still correspond to substantial remaining error. Record tolerance, discount factor, iteration count and the extracted policy’s performance together.

A practical check is to recompute every action backup using the final value and verify that selected actions agree. Simulate from all reachable starting states and look for nonterminating loops. Under a poorly designed reward, looping can actually be optimal for the defined environment. Fix that problem definition rather than demanding that the algorithm “use common sense.”

## Why cannot dynamic programming solve the entire industrial task?

First, a complete transition model is usually unknown. Second, multidimensional continuous states are difficult to tabulate. Discretizing ten variables into ten bins each creates $10^{10}$ combinations; a larger array does not solve the curse of dimensionality. Third, planning repeatedly reuses model error: a policy can specifically seek regions where the model is optimistic.

Dynamic programming remains an excellent teaching and debugging baseline. In a small environment it supplies checkable optimal values against which MC, TD and Q-learning can be compared.

Download the tutorial’s [complete tabular experiment](code/tabular_foundations.py) and run **python tabular_foundations.py --method q_learning --seed 42**. Using only the Python standard library, the script first solves a 4×4 grid by dynamic programming, then trains and independently evaluates a learned policy. All outputs are teaching simulations. Model-based RL later reuses the idea of learning a model and planning with it, while confronting model error and out-of-distribution behavior. See [Algorithms for Decision Making](https://algorithmsbook.com/decisionmaking/) for extensions.

## Separate planning budget from model credibility

Ten more backups on the same transition table add computation, not real-world evidence. If that table was estimated from a small historical sample, planning convergence means the table has been solved more accurately, not that the table became a better description of reality. Report model-estimation error separately from planning-solution error.

With many states, a sweep need not visit every state. Updating relevant or high-error states selectively is possible, provided you track which states remain insufficiently processed. Actual backup counts, runtime and model queries make fairer efficiency comparisons than iteration counts with different meanings.

## Exercises and answers

Modify the line example so entering G earns 10 and every nonterminal move earns -1. A can exit immediately for 8. What will A eventually choose when $\gamma=0.9$?

<details><summary>View the worked answer</summary>

Moving from B into G earns 10, so $V(B)=10$. The return from A through B is $-1+0.9\times10=8$, tying the exit. Both actions can be optimal, so specify tie-breaking. An implementation that always takes the first maximum may always display exit; that does not make the other route suboptimal.

</details>
`,
  },
  {
    id: '07', number: 7, module: 2, title: 'MC, TD and n-step: which target are we learning toward?',
    subtitle: 'Complete outcomes, one-step estimates and the choices between them solve the same estimation problem.',
    duration: 45, level: '进阶', prerequisites: ['05', '06'],
    objectives: ['Write the targets of MC and TD(0)', 'Calculate TD errors and n-step returns', 'Bootstrap correctly at trajectory truncation'],
    tags: ['Monte Carlo', 'TD', 'Bootstrapping', 'n-step'], lab: 'td', sources: ['f-td', 'f-sutton', 'f-gym'],
    body: String.raw`
## Estimate values without knowing transition probabilities

Dynamic programming requires a model, whereas practice often supplies only sampled trajectories. First hold the policy fixed and postpone improvement: the goal is to estimate $V^\pi$ from experience. The most direct approach averages complete realized returns from a state. This is Monte Carlo, or MC:

$$V(S_t)\leftarrow V(S_t)+\alpha[G_t-V(S_t)].$$

With $\alpha=1/N(S_t)$ at each visit, this is a sample mean. A state can occur several times within one episode: first-visit MC uses only its first visit per episode, whereas every-visit MC uses all visits. State which variant an experiment uses rather than mixing them unknowingly.

## TD: correct a prediction using the next prediction before the ending arrives

If an industrial trajectory runs for months, waiting for its ending before updating once is unattractive. TD(0) uses immediate reward plus a next-state estimate:

$$\delta_t=R_{t+1}+\gamma(1-d_t)V(S_{t+1})-V(S_t),$$

$$V(S_t)\leftarrow V(S_t)+\alpha\delta_t.$$

$d_t$ indicates true termination only. Updating one estimate using another is **bootstrapping**. [Sutton’s original TD paper](https://jmvidal.cse.sc.edu/library/sutton88a.pdf) studies learning from differences between successive predictions. Neither a differentiable environment nor known transition probabilities are required.

Work it out: current $V(s)=2$, next $V(s')=5$, reward 1, $\gamma=0.9$ and $\alpha=0.1$. The target is 5.5, the TD error is 3.5, and the new value is 2.35. If this is a terminal transition, the target becomes 1 and the new value 1.9. One incorrect Boolean can systematically alter the learning objective.

## Compare MC and TD on the same trajectory

Consider A → B → terminal, with rewards 0 then 4, $\gamma=0.9$, and initial $V(A)=V(B)=0$. After the ending, MC knows A’s return is 3.6 and B’s is 4. Sequential TD sees a zero target at A → B and can initially update only B. A must be revisited, or updated through extra replay, before benefiting from B’s new value.

This explains their different information propagation. MC sends a realized final outcome back to distant states immediately after the episode, but that outcome may be unusually lucky or unlucky. TD updates earlier and reuses statistical information in next-state estimates, but their temporary inaccuracies propagate too. **“MC is unbiased; TD is biased” is shorthand for particular targets and assumptions, not a complete theorem for every setting.**

## n-step: a few observed facts followed by an estimate

If no true termination occurs within the next $n$ steps:

$$G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV(S_{t+n}).$$

$n=1$ gives TD(0); reaching a true endpoint without further bootstrapping gives a full return. With rewards 1 and 2, $V(S_{t+2})=4$ and $\gamma=0.9$, the two-step target is $1+0.9\times2+0.81\times4=6.04$. If step two truly terminates, remove the last term and obtain 2.8.

${FENCE}python
def n_step_target(rewards, gamma, final_value, terminated):
    target = 0.0
    weight = 1.0
    for reward in rewards:
        target += weight * reward
        weight *= gamma
    if not terminated:
        target += weight * final_value
    return target

assert abs(n_step_target([1, 2], 0.9, 4, False) - 6.04) < 1e-9
assert abs(n_step_target([1, 2], 0.9, 4, True) - 2.8) < 1e-9
${FENCE}

The final state must follow the reward sequence. An initial observation returned after a vector environment automatically resets a new episode cannot supply the old episode’s final value.

## Truncation does not give MC a complete outcome

After collecting only twenty steps, the remaining return is unknown. Setting its tail to zero changes what is being estimated. You can explicitly define a twenty-step finite-horizon task or append a value estimate for the final observation. The latter is a bootstrap target, no longer full-trajectory MC. [Gymnasium’s time-limit explanation](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) shows why truncation should not automatically erase future value.

Data provenance also matters in online evaluation. Here both MC and TD assume trajectories generated by the policy being evaluated. Old-policy trajectories change the estimation problem and call for off-policy corrections or dedicated methods. “We have many logs” does not imply “we can evaluate any new policy,” a frequent unsupported leap in industrial offline research.

## What should the experiment measure?

Use a small environment with known true values to compare estimation error, learning steps and variation across seeds. Equalize sampling budgets and tune learning rates separately. TD improving faster in one experiment does not make it universally better. Longer n-step targets also depend on reward delay, estimation error and how quickly the policy changes.

Reporting errors separately for visited and unvisited states is helpful. Many unvisited states can dominate average error and hide progress in common states; reporting only common states can conceal coverage gaps. Explain both groups because they answer different questions.

## The learning rate controls how memory accumulates

A larger $\alpha$ lets the current target overwrite more of the old estimate; it is not an animation-speed control. A small fixed rate may be smoother but adapt slowly. A larger fixed rate may track drift but amplify noise. Asymptotic convergence with decreasing stepsizes in a stationary environment usually also requires conditions such as infinitely many visits. It does not mean “one thousand training steps must be correct.”

Run the same prediction experiment with three different initial-value settings. Gradual correction of optimistic and pessimistic starts shows that evidence is acting on the estimates. An unvisited state retaining its initial value indicates missing evidence, not necessarily algorithmic failure. Diagnose “unvisited,” “inaccurately estimated” and “incorrect target definition” separately to avoid blind tuning.

## Exercises and answers

Let $V(s)=3$, reward be 2, $V(s')=8$, $\gamma=0.5$ and $\alpha=0.2$. Calculate the TD update for an ordinary transition, true termination and an external time truncation.

<details><summary>View the worked answer</summary>

Ordinary transitions and external truncations both retain bootstrapping: the target is 6 and the new value $3+0.2(6-3)=3.6$. True termination gives target 2 and new value 2.8. At truncation, use the actual final observation’s value, not the observation after reset.

</details>
`,
  },
  {
    id: '08', number: 8, module: 2, title: 'SARSA and Q-learning: whose behavior is being learned?',
    subtitle: 'Behavior and target policies matter more than memorizing the update.',
    duration: 45, level: '进阶', prerequisites: ['02', '07'],
    objectives: ['Explain on-policy learning through the SARSA tuple', 'Explain off-policy learning through the max target', 'Interpret cliff walking and convergence conditions correctly'],
    tags: ['SARSA', 'Q-learning', 'On-policy', 'Off-policy'], lab: 'cliff', sources: ['f-qlearning', 'f-sutton', 'f-silver'],
    body: String.raw`
## From evaluation to control

The previous chapter estimated state values for a fixed policy. Now we collect data while improving the policy. Without an environment model, $V(s)$ alone does not readily compare actions because we still do not know where they lead. Directly estimating $Q(s,a)$ and selecting actions from Q values is more natural.

The behavior policy $\mu$ generates data; the target policy $\pi$ is the policy we intend to evaluate or improve. They coincide in on-policy learning and may differ in off-policy learning. Off-policy does not mean fully offline: Q-learning can learn while interacting, but its update target need not follow its exploratory behavior.

## SARSA: what action will actually happen next?

SARSA uses $S_t,A_t,R_{t+1},S_{t+1},A_{t+1}$, with the next action actually selected by the current behavior policy:

$$Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left[R_{t+1}+\gamma(1-d_t)Q(S_{t+1},A_{t+1})-Q(S_t,A_t)\right].$$

For an $\epsilon$-greedy policy, SARSA learns the consequences of behavior including exploration. It accounts for the possibility of a random unfavorable next action instead of assuming optimal choices forever after.

## Q-learning: what if future choices are greedy?

$$Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left[R_{t+1}+\gamma(1-d_t)\max_{a'}Q(S_{t+1},a')-Q(S_t,A_t)\right].$$

Data may still come from an $\epsilon$-greedy behavior policy, but the target uses the largest next-state value. Suppose next-state Q values are 4 and 1, exploration happens to choose the latter, reward is 0 and $\gamma=0.9$. SARSA targets 0.9; Q-learning targets 3.6. Neither has made an arithmetic mistake: they assume different future behavior.

[Watkins and Dayan’s original paper](https://www.gatsby.ucl.ac.uk/~dayan/papers/wd92.html) discusses tabular Q-learning convergence. Retain assumptions including sufficient visits, suitable stepsizes and a stationary MDP. Fixed learning rates, finite data, deep networks and changing industrial conditions do not automatically inherit the result.

## Keep one update skeleton and make the target explicit

${FENCE}python
def td_control_update(q, s, a, reward, next_s, next_a,
                      alpha, gamma, terminated, method):
    if terminated:
        future = 0.0
    elif method == "sarsa":
        future = q[next_s][next_a]
    elif method == "q_learning":
        future = max(q[next_s])
    else:
        raise ValueError("unknown control method")
    target = reward + gamma * future
    q[s][a] += alpha * (target - q[s][a])
${FENCE}

For SARSA, select the next action before the update and then actually execute that action. Sampling again after the update makes the recorded and executed actions inconsistent and silently changes the algorithm. Q-learning’s update does not require the actual next action, though its sampler must still select one to continue gathering experience.

## Why does SARSA often take a detour in cliff walking?

A cliff borders the bottom of a grid. Falling gives a large negative reward and returns the agent to the start; the goal is across the other side. With a fixed exploration rate, the short path along the edge is quick under greedy execution, but one random action can cause a fall. SARSA evaluates the exploratory policy and often learns a route farther from the edge. Q-learning’s target assumes greedy continuation and may value the short route more highly, while exploration during training can make realized training returns worse.

**This is not a general conclusion that SARSA is inherently safe and Q-learning inherently aggressive.** Different exploration rates, rewards, slip probabilities, evaluation rules or state representations can change the outcome. Choosing SARSA does not automatically satisfy safety constraints. Strict industrial constraints need separate modeling and execution protection.

Whether returning to the start after a fall is true termination must be specified by the environment. The classic task can treat it as a nonterminal relocation. A variant can terminate on falling, but these are different MDPs with different values and objectives; do not mix their results.

## Expected SARSA replaces the sampled target with an average

$$y_t=R_{t+1}+\gamma(1-d_t)\sum_{a'}\pi(a'\mid S_{t+1})Q(S_{t+1},a').$$

It explicitly averages next-action values under the exploratory policy, removing randomness from which next action happened to be sampled while retaining exploration’s effect. It requires policy probabilities, which are cheap for tabular discrete actions but not necessarily easy in more complex action spaces.

## Separate training curves from evaluation curves

Alongside the browser cliff experiment, download the [complete tabular script](code/tabular_foundations.py) and run **--method sarsa** and **--method q_learning** on the same ordinary grid. That script’s grid has no cliff and tests basic learning of short paths. Do not combine returns from these two different environments into one comparison table.

Inspect training reward with exploration separately from evaluation reward with exploration disabled. Fix environment, total steps, seeds and starts; record falls, completion rate and path length. Fewer training falls do not establish deployment safety under all disturbances, and a shorter mean path does not imply lower tail risk. If policies have different exploration budgets, not all differences can be attributed to their update equations.

## Network architecture does not determine on-policy or off-policy

A table can learn off-policy, a neural network can learn on-policy, and the Actor–Critic structure alone determines neither. Ask who generated the samples, whose behavior the update evaluates, and what handles any mismatch. This diagnostic will carry through PPO, SAC and offline RL.

With fixed exploration, SARSA continuously evaluates exploratory behavior. Claims about approaching a greedy optimal policy also need suitable exploration decay, visitation and stepsizes. Q-learning targets greedy optimal behavior but still needs sufficient state–action coverage from its behavior policy. An untried action does not gain a reliable value merely because max appears in the equation.

Display visit counts in experiments. An unusually high Q entry may be an uncorrected initial value. Showing only greedy arrows can make unsupported estimates look like learned knowledge.

## Exercises and answers

Next-state Q values are $[5,1]$, $\epsilon=0.2$, and the first action is uniquely greedy. With reward 2 and $\gamma=0.9$, calculate the Q-learning and Expected SARSA targets.

<details><summary>View the worked answer</summary>

The greedy action has probability 0.9 and the other 0.1. Q-learning targets $2+0.9\times5=6.5$. Expected SARSA’s next-state average is $0.9\times5+0.1\times1=4.6$, giving target $2+0.9\times4.6=6.14$. Ordinary SARSA produces 6.5 or 2.9 on one sample; its mean agrees with Expected SARSA.

</details>
`,
  },
  {
    id: '09', number: 9, module: 3, title: 'Function approximation: from Q tables to shared parameters',
    subtitle: 'Neural networks let experience generalize—and errors amplify one another.',
    duration: 40, level: '进阶', prerequisites: ['08'],
    objectives: ['Explain why tables do not scale to large state spaces', 'Distinguish function approximation from learning a model', 'Explain the deadly triad and semi-gradient updates'],
    tags: ['Function approximation', 'Neural networks', 'Deadly Triad'], sources: ['f-triad', 'f-target', 'f-silver'],
    body: String.raw`
## Can states too numerous to tabulate share experience?

A small grid needs only one number per state–action pair. Continuous temperatures, pressures and time-series windows produce enormous or infinite state spaces. Even forced discretization does not automatically let neighboring bins benefit from one another’s samples. Function approximation represents $Q_\theta(s,a)$ with parameters $\theta$, aiming to share learning across similar inputs.

The simplest linear form is $Q_\theta(s,a)=\phi(s,a)^\top\theta$; neural networks provide a more flexible function class. A discrete-action DQN commonly takes one state and outputs a Q value for every action. A continuous-action Critic commonly takes both state and action. These are architecture choices, not new reward definitions.

**A value network is not an environment model.** $Q_\theta$ predicts long-term return, while a dynamics model predicts the next state or reward. Both may coexist, but having a neural network alone does not make an algorithm model-based RL.

## Shared parameters are both a strength and a new risk

Suppose two states have features 1 and 2, with $V_\theta(s)=\theta\phi(s)$. At $\theta=1$, their estimates are 1 and 2. Increasing $\theta$ to fit the first state to 3 also raises the second estimate without new evidence for it. A tabular update usually changes one entry; function approximation can change many state values simultaneously.

Useful generalization depends on whether the representation captures task structure. Concatenating temperature, pressure and assay age does not guarantee that a network identifies lags and missing information. Audit input scales, missing-value indicators, availability times and training/evaluation distributions.

## Why is this less stable than ordinary supervised learning?

Supervised learning usually treats labels as fixed data, whereas a TD target contains a model prediction:

$$y_t=R_{t+1}+\gamma(1-d_t)\max_{a'}Q_{\bar\theta}(S_{t+1},a').$$

Changing parameters changes targets, while changing the policy changes the sampling distribution. Distribution, predictions and targets form a feedback system. Placing a supervised network directly in a Q-learning loop can produce decreasing local loss without an improving policy.

${FENCE}mermaid
flowchart TD
    F["Function approximation shares parameters"] --> C["One update affects many states"]
    B["Bootstrap targets depend on predictions"] --> C
    O["Data policy differs from target policy"] --> C
    C --> U["Error feedback can become unstable"]
    U --> R["Replay improves sample reuse"]
    U --> T["Target networks slow target changes"]
    R --> V["Check value scales and independent evaluation"]
    T --> V
${FENCE}

The combination of function approximation, bootstrapping and off-policy learning is the **deadly triad**. It identifies an instability risk, not inevitable divergence whenever all three occur. [Jiang and colleagues’ research](https://proceedings.mlr.press/v139/jiang21j.html) and [target-network theory](https://proceedings.mlr.press/v202/fellows23a.html) offer more precise discussion.

## Semi-gradients: treat the target as constant for this update

A squared loss is $L(\theta)=\frac12(y-Q_\theta(s,a))^2$. Common TD implementations differentiate the current prediction but do not backpropagate through the next-state estimate inside the target: hence semi-gradient updates. This is not full Bellman-residual minimization. Using gradient descent does not import every property of ordinary supervised regression.

${FENCE}python
# Batched discrete-action Q values in PyTorch: shape [batch, n_actions].
q_values = online_network(states)
chosen_q = q_values.gather(1, actions.long().unsqueeze(1)).squeeze(1)

with torch.no_grad():
    next_q = target_network(next_states).max(dim=1).values
    target = rewards + gamma * (1.0 - terminated.float()) * next_q

loss = torch.nn.functional.smooth_l1_loss(chosen_q, target)
optimizer.zero_grad()
loss.backward()
optimizer.step()
${FENCE}

This is an update fragment requiring defined networks, optimizer and batch. Check shapes: accidental broadcasting between $[B]$ and $[B,1]$ can create an incorrect $[B,B]$ loss without an error message. Also detach the target; its network parameters should not be optimized through this loss.

## How can we tell whether the network learns the right quantity?

First compare network estimates with dynamic-programming values in a solvable small environment, then enlarge the state space. Track mean Q, maximum absolute Q, TD error, gradient norm and independent evaluation return. With rewards bounded in magnitude by $R_{\max}$ and $\gamma<1$, true discounted values are bounded by $R_{\max}/(1-\gamma)$. Predictions far beyond this scale are a debugging signal, not proof of one specific bug.

Eliminate causes systematically: is the environment correct, was normalization fitted only on training data, are termination flags correct, and do action indices consistently identify the same actions? Only then enlarge the network or modify a complex algorithm. A small network can faithfully solve the wrong problem; a large one cannot repair temporal leakage.

## The output layer is not a classification distribution

A discrete Q network outputs values. They may be negative and need not sum to 1. Do not add softmax out of habit merely because several actions exist. Exploration may construct a behavior policy from Q values, but that is an action-selection rule, not the definition of the value function.

Likewise, fit normalization using statistics available during training, then freeze them or explicitly manage subsequent updates. Using mean temperatures from the entire test period to normalize training examples leaks future distribution information. Changing normalization changes the coordinate system seen by an existing network, so record it alongside model versions.

## Exercises and answers

If online and target networks currently have identical parameters, are they equivalent to having only one network? If parameters are fully copied after every gradient update, how much lag does the target network provide?

<details><summary>View the worked answer</summary>

Identical initialization does not imply identical training behavior: freezing target parameters for a while lets the two networks diverge. Copying fully after every update leaves only a very short lag and removes most of the slow-target effect. Whether the target calculation stops gradients remains a separate question. Explain copy periods and soft-update coefficients together with optimization and sampling frequencies.

</details>
`,
  },
  {
    id: '10', number: 10, module: 3, title: 'DQN: separate an unstable learning loop',
    subtitle: 'What do experience replay and target networks solve, and what remains?',
    duration: 45, level: '进阶', prerequisites: ['08', '09'],
    objectives: ['Describe DQN’s complete flow of data and parameters', 'Construct minibatch TD targets correctly', 'Distinguish environment steps, optimization steps and target synchronization'],
    tags: ['DQN', 'Replay Buffer', 'Target Network'], lab: 'replay', sources: ['f-dqn', 'f-pytorch', 'f-target'],
    body: String.raw`
## Why are two simple changes so important?

Updating a value network immediately on each new experience exposes it to strongly correlated neighboring samples. A policy change alters the data distribution, and a network update changes later targets. DQN retains Q-learning’s Bellman target, uses replay to disrupt recent temporal correlation and reuse experience, and uses a target network to slow target drift. [Mnih and colleagues’ original paper](https://doi.org/10.1038/nature14236) is an important source for this combination.

Separate four objects: online network $Q_\theta$ selects actions and is trained; target network $Q_{\bar\theta}$ supplies relatively slow-changing estimates; replay buffer $\mathcal D$ stores transitions; and the environment generates experience. Each has an update clock. “Train DQN” is not a sufficiently precise specification of those clocks.

## How does experience become a batch of learning targets?

Store $(s,a,r,s',d)$ per transition, where $d$ indicates true termination. Sample a random batch and construct:

$$y_i=r_i+\gamma(1-d_i)\max_{a'}Q_{\bar\theta}(s_i',a'),$$

$$L(\theta)=\frac1B\sum_{i=1}^{B}\operatorname{Huber}(Q_\theta(s_i,a_i)-y_i).$$

Huber loss behaves like squared loss near zero and moderates gradient growth for larger errors. It is not a patch for an incorrect reward design. The loss compares the target with the Q value of **the action actually taken in this transition**; do not copy one target blindly to every action output.

With $r=1$, $\gamma=0.9$ and target-network next-action values $[2,4,3]$, the nonterminal target is 4.6. If the online prediction for the actual current action is 3, the TD error is 1.6. True termination gives target 1. An external time truncation still uses future value estimated from the final observation.

## Replay does not magically manufacture IID data

Random sampling reduces adjacency in trajectories, but the buffer still reflects historical policies and environment distributions. Strict independence and identical distribution do not follow. A small buffer may retain strong short-term correlation; a large one may let stale experiences dominate updates. Record capacity, warm-up steps, batch size and updates per environment interaction.

Warm-up means collecting some experience before optimizing, not acting without rewards. Correct rewards and termination flags must be stored from the first transition. A larger offline buffer cannot create trustworthy consequences for actions absent from its coverage.

## How is the target network updated?

A hard update copies every $C$ optimization steps: $\bar\theta\leftarrow\theta$. A soft update uses:

$$\bar\theta\leftarrow(1-\tau)\bar\theta+\tau\theta.$$

Smaller $\tau$ means slower tracking, but implementations may name coefficients in the opposite way, so inspect the equation. Updating too quickly leaves substantial target drift; too slowly can leave stale targets. No universal number is independent of environment, update ratio and learning rate.

${FENCE}python
# One minibatch update; the official PyTorch tutorial supplies full networks.
def dqn_update(online, target_net, optimizer, batch, gamma=0.99):
    states, actions, rewards, next_states, terminated = batch
    prediction = online(states).gather(1, actions[:, None]).squeeze(1)
    with torch.no_grad():
        future = target_net(next_states).max(dim=1).values
        expected = rewards + gamma * (~terminated).float() * future
    assert prediction.shape == expected.shape
    loss = torch.nn.functional.smooth_l1_loss(prediction, expected)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
    return float(loss.detach())
${FENCE}

This fragment assumes integer actions, a Boolean terminated tensor and all tensors on the same device. For runnable training, follow the [official PyTorch DQN tutorial](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html), retaining a CPU fallback in device selection.

## Keep training records that support diagnosis

At minimum record environment steps, optimization steps, exploration rate, buffer size, TD loss, Q scale and independent evaluation return. Label curve axes as interaction steps or gradient steps. Comparing an algorithm updating ten times per interaction with one updating once can otherwise mislead.

During evaluation, fix the policy rule, turn off training exploration and use seeds not involved in training selection. Low training return with high evaluation return may simply reflect exploration. Low loss with low evaluation return can indicate poor coverage or bootstrap bias. Target networks moderate some instability sources but do not guarantee convergence for arbitrary architectures and parameters; see [the relevant theoretical study](https://proceedings.mlr.press/v202/fellows23a.html).

The browser replay/target-network experiment demonstrates sampled indices and numerical target tracking. It does not train a full Atari DQN in the browser. Distinguish a mechanism demonstration from end-to-end training to draw valid conclusions.

## Do not transplant game preprocessing unchanged into an energy objective

Some benchmark implementations clip rewards to control scale, but clipping changes relative benefits and costs. Turning both -1 and -100 into -1 erases severity. Compressing distinct energy-per-tonne differences to the same value can similarly change the optimized objective. Define physical metrics, normalization references and constraints before deciding on numerical scaling.

Separate evaluation mode from learning mode: do not update replay or parameters during evaluation and thereby feed validation experience back into training decisions. Diagnostic logging can continue, but “just testing” must not silently become additional training budget. Environment steps, optimization steps and configuration should refer to the same checkpoint record.

## Exercises and answers

A replay transition ended by external timeout has $r=0$, $\gamma=0.9$ and maximum next-state Q of 6. What is the correct target? What happens if an automatic-reset observation valued at 2 was stored instead?

<details><summary>View the worked answer</summary>

The correct target is 5.4. Using the reset observation gives 1.8; mistaking truncated for terminated gives 0. All three numbers can look plausible. Only a clear environment interface and timeline reveal the mistakes.

</details>
`,
  },
  {
    id: '11', number: 11, module: 3, title: 'Double DQN: do not let the same noise select and evaluate',
    subtitle: 'Use a hand-computable bias to understand separate selection and valuation.',
    duration: 35, level: '进阶', prerequisites: ['03', '10'],
    objectives: ['Explain the source of maximization bias', 'Distinguish DQN and Double DQN targets', 'Describe double-estimator limitations and ablations'],
    tags: ['Double DQN', 'Overestimation bias', 'Ablation experiments'], lab: 'overestimation', sources: ['f-doubleq', 'f-double-dqn'],
    body: String.raw`
## If each estimate is unbiased, why is their maximum biased?

Two actions both have true value zero. Each estimate independently equals -1 or +1 with equal probability. Each estimate has mean zero. Among their four equally likely pairs, however, only $(-1,-1)$ has maximum -1; the other three have maximum +1:

$$\mathbb E[\max(\hat Q_1,\hat Q_2)]=\tfrac14(-1)+\tfrac34(1)=0.5.$$

The environment has not improved. Maximization preferentially selects positive noise. More generally, max is convex, so $\mathbb E[\max_a\hat Q_a]\geq\max_a\mathbb E[\hat Q_a]$. This establishes a direction; the actual gap depends on error magnitude, correlation, action count and true action values.

In Q-learning this maximum enters the TD target and propagates backward to earlier states. A network need not overestimate everywhere, but repeated use of such targets can create substantial bias. The [original Double Q-learning paper](https://proceedings.neurips.cc/paper_files/paper/2010/hash/091d584fced301b442654dd8c23b3fc9-Abstract.html) studies this problem and the double-estimator approach.

## Separate choosing an action from evaluating it

In the idealized version, estimator A selects an action and independent estimator B evaluates that action. If both true values are zero and B’s zero-mean errors are independent of A’s selection, the selected action’s expected estimate under B remains zero. It no longer directly rewards the particular noise A happened to overestimate.

Tabular Double Q-learning typically maintains two tables and alternates updates. Double DQN reuses the online and target networks already present; no third network is needed. [Van Hasselt and colleagues’ Double DQN paper](https://arxiv.org/abs/1509.06461) gives the deep version.

DQN uses:

$$y^{\mathrm{DQN}}=r+\gamma(1-d)\max_{a'}Q_{\bar\theta}(s',a').$$

Double DQN selects with the online network, then evaluates with the target network:

$$a^*=\arg\max_{a'}Q_\theta(s',a'),$$

$$y^{\mathrm{DDQN}}=r+\gamma(1-d)Q_{\bar\theta}(s',a^*).$$

Both use a target network, so “there are two networks” does not identify Double DQN. Ask **which network supplies argmax and which supplies the evaluation**.

## Check an implementation using two arrays

Online next-state Q values are $[4,3]$, target values are $[2,5]$, $r=1$ and $\gamma=0.9$. DQN uses the target maximum 5 and obtains 5.5. Double DQN selects the first action online, then reads its target value 2 and obtains 2.8.

This does not prove 2.8 is closer to truth, which has not been supplied. The change aims to reduce systematic selection bias, not to make every sample target more accurate. If the true value is higher, this Double DQN target may underestimate it.

${FENCE}python
with torch.no_grad():
    # Select with the online network. Shape: [batch, 1].
    best_actions = online(next_states).argmax(dim=1, keepdim=True)
    # Evaluate the selected action with the target network. Shape: [batch].
    next_values = target_net(next_states).gather(1, best_actions).squeeze(1)
    td_target = rewards + gamma * (~terminated).float() * next_values

# Current-state Q(s,a) and the loss remain the same as in DQN.
${FENCE}

A common mistake uses the online network in both places, losing the stable target, or the target network in both places, reverting to ordinary DQN. Also ensure argmax operates over actions, not over the batch dimension.

## The two networks are not actually independent

Target parameters come from past online parameters, so their errors are generally correlated. The ideal independent-estimator analysis is not an unbiasedness guarantee for Double DQN. Synchronizing every step makes the networks almost identical and weakens their selection/evaluation separation. Synchronizing too rarely can make estimates stale.

Double DQN can underestimate and cannot remove coverage gaps, function-approximation error, termination mistakes or reward-design problems. It addresses a specific bias source, not every DQN problem. A Dueling Network instead decomposes the architecture into state value and action advantage. That is a different idea, compatible with Double DQN but not interchangeable with it.

## Design a credible comparison

Keep network size, replay, exploration schedule, learning rate, interaction budget and target-update rule fixed; replace only the TD target. Verify estimation bias on a small task with known values, then inspect independent evaluation returns and distributions across seeds. A lower maximum Q alone does not establish improved accuracy because the true value might also be high.

The browser experiment first isolates the synthetic estimation problem with zero true values and independent noise. It demonstrates maximization bias, not complete DQN training or industrial energy savings. Predict how action count and noise amplitude affect it before running the experiment.

## Less bias does not mean less of every kind of error

When actions have different true values, a noisy selection estimator can choose the genuinely worse action. An independent evaluation estimator then accurately assigns that worse action a lower value, so the double estimate can lie below the optimal true value. Avoiding positive selection bias and accurately identifying the optimal action are related but distinct goals.

In synthetic experiments, first keep true values equal to isolate maximization of noise. Next separate true values to inspect wrong selections. Finally increase correlation between estimator noises to see debiasing weaken. Change one factor at a time to explain the curves. Simultaneously increasing action count, noise and correlation may yield an attractive chart without identifying the cause.

This method of isolating factors is more useful than memorizing a curve’s shape. Reuse it later for GAE parameters, PPO clipping and SAC temperature.

## Exercises and answers

If the estimators have identical errors, can separate selection and evaluation eliminate the 0.5 overestimate above? With only one action, is there additional selection bias from action maximization?

<details><summary>View the worked answer</summary>

Identical errors reuse the selected positive noise, so the independent-estimator debiasing effect is lost. With one action, max does not choose the larger of multiple estimates, so this source of extra bias disappears. The estimator can still have fitting bias or bootstrap error.

</details>
`,
  },
  {
    id: '12', number: 12, module: 4, title: 'REINFORCE: learn action probabilities directly',
    subtitle: 'Find a policy-improvement direction without backpropagating through the environment.',
    duration: 45, level: '进阶', prerequisites: ['03', '05', '09'],
    objectives: ['Understand the log-derivative trick through trajectory probabilities', 'Explain reward-to-go and state baselines', 'Distinguish gradient-ascent objectives from gradient-descent losses'],
    tags: ['Policy gradients', 'REINFORCE', 'Baseline'], lab: 'policy-gradient', sources: ['f-reinforce', 'f-policy-gradient'],
    body: String.raw`
## Why not always estimate values first and take argmax?

Value methods learn what each action is worth and then choose the maximum. Maximization itself can be difficult with continuous actions, and some tasks need stochastic policies. Policy gradients directly represent behavior as a parameterized distribution $\pi_\theta(a\mid s)$ and train its parameters to make high-return behavior more likely. A Critic is not essential: basic REINFORCE can use realized trajectory returns directly.

Discrete actions can use logits and softmax; continuous actions can use a parameterized density. Parameters change a distribution, not a hard-coded “correct” label for each action. [Williams’s 1992 paper](https://doi.org/10.1007/BF00992696) is the original REINFORCE source.

## Where does a gradient come from if the environment is not differentiable?

Begin with the finite-horizon, undiscounted objective $J(\theta)=\mathbb E_{\tau\sim p_\theta}[R(\tau)]$. A trajectory’s probability multiplies its initial-state, policy and transition probabilities:

$$p_\theta(\tau)=\rho_0(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t).$$

Using $\nabla p=p\nabla\log p$ gives:

$$\nabla_\theta J=\mathbb E\left[R(\tau)\nabla_\theta\log p_\theta(\tau)\right]=\mathbb E\left[R(\tau)\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right].$$

We assume the environment transitions and initial distribution do not directly depend on the policy parameters being optimized. After taking logs, their derivatives with respect to $\theta$ vanish. There is no need to backpropagate through simulator internals. The gradient concerns how the probability of sampling this trajectory changes with the policy. See the full derivation in [Spinning Up’s policy-optimization tutorial](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html).

## An action should not claim credit for past rewards

An action at time $t$ cannot change rewards that have already happened. Replace the full trajectory reward with reward-to-go beginning after that action. For the undiscounted finite task above, its weight is $G_t=\sum_{k=t}^{T-1}R_{k+1}$.

If the objective becomes $J=\mathbb E[\sum_t\gamma^tR_{t+1}]$ and $G_t$ uses discounting relative to time $t$, the exact finite-trajectory gradient contains $\gamma^tG_t$. Some implementations absorb time weighting into their sampling distribution or use an approximate objective. Fix one convention while learning; do not retain $\gamma^t$ in the derivation and silently omit it from the code.

## A baseline asks whether an outcome was better than expected

Replace a zero baseline with $b(s_t)$, which depends on state but not the currently sampled action:

$$\nabla_\theta J=\mathbb E\left[\sum_t\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\big(G_t-b(S_t)\big)\right].$$

The crucial zero-mean identity is $\sum_a\pi(a\mid s)\nabla\log\pi(a\mid s)=\nabla\sum_a\pi(a\mid s)=0$. A baseline can reduce variance, but arbitrary choices are not necessarily optimal. Hidden action dependence or inappropriate gradients flowing back to the Actor through the weights violate the derivation’s conditions.

${FENCE}mermaid
flowchart TD
    P["Sample actions from the policy"] --> T["Collect complete task trajectories"]
    T --> G["Compute reward-to-go at each step"]
    G --> B["Subtract a state baseline"]
    B --> L["Weight action log probabilities by return"]
    L --> U["Update policy parameters"]
    U --> P
    B --> C["Next chapter: learn the baseline with a Critic"]
${FENCE}

## Which probability does one update increase?

In a one-step task, an action has probability $p=0.25$, reward 2 and baseline 1. For its logit, $\partial\log p/\partial z=1-p=0.75$. Its weight is 1, so the positive gradient is 0.75. Gradient ascent with learning rate 0.1 increases that logit by 0.075. If reward changes to 0, the weight becomes -1 and the direction reverses.

One bad reward does not prove an action is bad; it supplies one stochastic gradient sample. Batches, suitable stepsizes and independent evaluation prevent high-variance feedback from dominating conclusions.

${FENCE}python
# logits: [T, n_actions]; actions, returns and baselines: [T].
distribution = torch.distributions.Categorical(logits=logits)
log_prob = distribution.log_prob(actions)
steps = torch.arange(len(returns), device=returns.device)
discounts = gamma ** steps
weights = (returns - baselines).detach()
# The optimizer descends, so negate the objective we want to maximize.
loss = -(discounts * log_prob * weights).sum()
optimizer.zero_grad(set_to_none=True)
loss.backward()
optimizer.step()
${FENCE}

With multiple trajectories, summing within each and then averaging over trajectories differs in normalization from averaging all time steps together, especially when lengths vary. Specify the objective so batch refactoring does not silently change its weights.

## Why is REINFORCE not enough?

Complete returns contain much future randomness and can produce high-variance training. Waiting for an episode’s ending is inconvenient for continuing tasks, and a large update can damage an effective policy. Actor–Critic next uses value estimates to reduce waiting and variance; GAE adjusts the bias–variance trade-off; PPO further moderates incentives for policy updates in beneficial directions. Each addresses a specific problem, rather than becoming better merely because it has a newer name.

## Why not reuse old trajectories arbitrarily?

The derivation samples trajectories from the current policy. After many parameter updates, older trajectories no longer follow that distribution. Treating them as samples of the current expectation changes the gradient estimate. Importance sampling is possible, but ratios can have high variance and require sufficient old-policy support for actions relevant to the new policy.

This distinguishes off-policy replay from simply training REINFORCE repeatedly on old data. PPO performs a limited number of updates on a recent batch and explicitly uses new-to-old probability ratios and other stabilizing measures; it still cannot reuse arbitrarily stale logs without conditions. Knowing which distribution an expectation averages over helps determine whether training code uses data consistently with its algorithm.

## Exercises and answers

An action obtains return 5 but the state baseline is 7. Should this policy-gradient sample increase or decrease its probability? Why does “positive reward means increase probability” fail when all rewards are shifted by a constant?

<details><summary>View the worked answer</summary>

Its baseline-relative weight is -2, so this sample decreases its probability. The direction depends on performance relative to the reference, not the sign of raw reward. Under fixed length and particular objectives, adding a constant may leave the optimal policy unchanged. With variable lengths, it may also change preferences over task duration. Analyze reward shifts within the task definition.

</details>
`,
  },
];
