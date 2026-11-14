import type { PrimerUnit } from '../primer';

export const primerIntroductionEn = 'Treat mathematics as a language for describing decisions. Start each time with a small cement-kiln problem, identify the symbols, substitute numbers, and adjust the parameters. Explain why the numbers change before moving on to the main chapters. The probabilities, rewards, and response coefficients here are teaching assumptions, not plant statistics or operating advice.';

export const primerUnitsEn: PrimerUnit[] = [
  {
    id: 'language', number: 1, title: 'Read the symbols, units, and timeline first', summary: 'Read a transition as one complete setpoint decision.', calculator: 'timeline', chapters: ['01', '04', '19'],
    body: String.raw`## Begin with a scene you can picture

It is 10:00, and the calciner outlet temperature setpoint is 880°C. You can see temperature, pressure, oxygen content, changes over the last two hours, and quality assays that have already been released. Your task is to propose the next setpoint adjustment. The lower APC/PID layer then determines how to track that setpoint.

Suppose the maximum allowed adjustment is 2°C every 5 minutes. The policy outputs a dimensionless number $a_t=0.5$. This does not mean that the temperature is 0.5°C, or that coal feed increases by 50%. It means half of the allowed adjustment range:

$$\Delta T_t^{sp}=2a_t=2\times0.5=1\;^\circ\mathrm C.$$

The candidate setpoint is therefore $880+1=881^\circ\mathrm C$. The setpoint becomes 881°C only after the gates approve it; the measured temperature does not become 881°C at that same instant. The setpoint is a target, while the process variable is the actual response.

## What subscripts and superscripts mean

| Notation | How to read it | In this example |
|---|---|---|
| $t$ | The current decision step | The instant 10:00 |
| $t+1$ | The next decision step | The instant 10:05 |
| $T_t$ | The temperature measurement at step $t$ | The actual current temperature |
| $T_t^{sp}$ | The temperature setpoint at step $t$ | The superscript sp labels a setpoint; it is **not a power** |
| $a_t$ | The normalized action chosen now | Here, 0.5 |
| $r_{t+1}$ | Immediate feedback received after this action | The energy-use and action-smoothness score for 10:00–10:05 |
| $G_t$ | Cumulative return from now onward | Immediate feedback and more distant consequences considered together |
| $\pi_\theta$ | A policy with parameters $\theta$ | A rule or network that chooses actions from observations |

$\Delta$ means a change. The hat on $\hat q$ means an estimate. The bar in $\bar F$ denotes a reference mean. $\|\mathbf a\|^2$ means squaring each action component and adding the results. These symbols are not a code you must memorize first. Whenever you meet one, ask what quantity it represents, what its units are, and when it becomes available.

## Why an experience sample has this form

$$\bigl(o_t,\;a_t,\;r_{t+1},\;o_{t+1}\bigr).$$

Read it in causal time order: first observe $o_t$, then choose $a_t$. The environment evolves over these 5 minutes, after which you receive $r_{t+1}$ and the new observation $o_{t+1}$. These four items form one transition. Policy learning needs to know what was done under which circumstances and what happened afterward. A temperature table with no action records is therefore insufficient.

When safety gates are present, log the requested action and the action actually executed separately. If a gate rejects a request to increase temperature and the setpoint is held, the subsequent outcome cannot be treated as experience from a successfully executed increase. Store the requested SP, executed SP, MV, gate reason, and takeover flag together.

## Why the latest assay may not describe current quality

A sample is collected at 09:00 and released at 09:40. At 10:00, the policy may already use it, but it describes the quality of earlier material. A sample collected at 10:00 whose result is released at 10:40 cannot appear in the decision input at 10:00.

When something happened and when it became known are two different times. The later discussions of POMDPs, soft sensors, data splitting, and world models all use this distinction.`,
  },
  {
    id: 'probability', number: 2, title: 'Probability and conditional probability', summary: 'Why can the same temperature increase have different consequences?', calculator: 'probability', chapters: ['02', '03', '04'],
    body: String.raw`## Start with counts

Suppose a teaching dataset contains 100 small temperature increases under similar kiln conditions. In 70 cases, the temperature returns to a stable range at the next step; in 30, it remains low. We use the frequency 70/100=0.7 to estimate the probability of recovery. This number describes uncertainty across repeated situations. It does not guarantee that the next attempt will recover.

Let $A$ denote recovery at the next step, so $P(A)=0.7$. Remaining low is another, mutually exclusive outcome, with probability $1-0.7=0.3$. If these two outcomes cover all possibilities, their probabilities must sum to 1.

## The vertical bar is not a division sign

$$P(A\mid B)=\frac{P(A\cap B)}{P(B)},\qquad P(B)>0.$$

Read $P(A\mid B)$ as the probability that $A$ occurs given that we already know $B$. The notation $A\cap B$ means that both events occur.

Suppose 40 of the 100 records involve raw meal that is harder to burn, and 20 of those recover. We now consider only those 40 records, so the denominator changes from 100 to 40:

$$P(\text{recovery}\mid\text{hard to burn})=\frac{20}{40}=0.5.$$

The other 60 records involve normal raw meal, and 50 recover, giving a conditional probability of $50/60\approx0.8333$. There are still 70 recoveries overall, but knowing the raw-meal condition changes the prediction for the next step. That is the value of conditioning information.

## Why transition probabilities include both state and action

$$P(s_{t+1}=s'\mid s_t=s,a_t=a).$$

This is the probability of reaching $s'$ at the next step, given the current kiln condition $s$ and the executed action $a$. The same action may behave differently under different conditions; different actions may also behave differently under the same condition. One fixed success rate for increasing temperature cannot describe the entire operating range.

In real historical data, operators often make large adjustments precisely when conditions are poor. Directly comparing the averages of adjusted and unadjusted records mixes in differences in the original conditions. The conditional probabilities above belong to a teaching model; they do not automatically establish an action's causal effect. Practical modeling requires action information, state coverage, and analysis of confounding factors.

## Where joint probability and Bayes' rule come from

The definition of conditional probability gives $P(A\cap B)=P(A\mid B)P(B)$. Reversing the events, the same joint probability also equals $P(B\mid A)P(A)$, so:

$$P(B\mid A)=\frac{P(A\mid B)P(B)}{P(A)},\qquad P(A)>0.$$

Suppose you know only that recovery did not occur and want to infer how likely hard-to-burn raw meal was. In the teaching data, 20 cases involve both hard-to-burn meal and no recovery, out of 30 cases without recovery in total. The probability is therefore $20/30=2/3$. This revises a judgment after observing an outcome. It does not mean that one failed recovery establishes a raw-meal fault.`,
  },
  {
    id: 'expectation', number: 3, title: 'Expectation and total expectation', summary: 'Weight possible consequences by how likely they are.', calculator: 'expectation', chapters: ['03', '05'],
    body: String.raw`## An action's value is more than its best outcome

In the teaching environment, a small temperature increase can have two outcomes: a return of 3 with probability 0.7, or a return of −2 with probability 0.3. These returns are dimensionless scores we define, not 3 kWh or −2°C. Over 100 repetitions, if observed frequencies are close to the model, roughly 70 trials score 3 and 30 score −2. Their average is:

$$\frac{70\times3+30\times(-2)}{100}=1.5.$$

Replacing each count divided by the total count with its probability gives the expectation:

$$\mathbb E[R]=\sum_i p_i r_i=0.7\times3+0.3\times(-2)=1.5.$$

$\mathbb E$ denotes expectation, and $\sum_i$ means adding the terms for outcomes 1, 2, and so on. An expectation of 1.5 does not require any individual trial to produce exactly 1.5. In this example, an individual trial can produce only 3 or −2.

## Why not simply average the two outcomes?

$(3+(-2))/2=0.5$ silently assumes that the two outcomes each have probability one half. That contradicts the stated probabilities 0.7 and 0.3. To compute an expectation, list all outcomes first, list their probabilities, check that the probabilities sum to 1, and then multiply and add term by term.

For two random quantities, even without independence:

$$\mathbb E[X+\gamma Y]=\mathbb E[X]+\gamma\mathbb E[Y].$$

This is linearity of expectation. It holds because the same weighted sum can be split into two parts. It does not claim that the future and the present have no influence on each other. In contrast, $\mathbb E[XY]=\mathbb E[X]\mathbb E[Y]$ does not hold in general; it requires additional conditions.

## Total expectation: average within regimes, then across regimes

Suppose normal raw meal accounts for 60% of cases and hard-to-burn raw meal for 40%. An action's conditional expected returns in the two regimes are 2 and −1, respectively. Its overall expectation is:

$$\mathbb E[R]=0.6\times2+0.4\times(-1)=0.8.$$

This is the law of total expectation:

$$\mathbb E[R]=\sum_s P(S=s)\mathbb E[R\mid S=s].$$

The outer average weights operating regimes; the inner average weights the possible outcomes within a regime. The Bellman equation repeatedly does the same thing: average the consequences of different branches, first over actions and then over next states.

## How does a sample mean relate to a mathematical expectation?

In a real system, the full probabilities are usually unknown. Instead, we observe $N$ return samples and use:

$$\widehat{\mathbb E[R]}=\frac1N\sum_{i=1}^{N}r_i.$$

The hat reminds us that this is an estimate. Too few samples, correlation in sequential data, and changes in the distribution of operating conditions can all make the estimate unstable. Replay buffers, batch updates, evaluation across multiple seeds, and confidence intervals all take seriously the fact that we have observed only a finite sample.

Energy reward and quality cost can each have an expectation, but they remain different quantities. An attractive average reward cannot replace checking the probability of a quality-limit violation.`,
  },
  {
    id: 'variance', number: 4, title: 'Variance, samples, and uncertainty', summary: 'The same average can hide very different fluctuations.', calculator: 'variance', chapters: ['07', '13', '20'],
    body: String.raw`## Why the mean alone is not enough

Policy A obtains $[2,2,2,2]$ in four teaching rollouts, while policy B obtains $[-4,8,-4,8]$. Both have a mean return of 2, but B's individual outcomes vary substantially. Showing only its best score of 8 would conceal its failures.

First compute the mean $\mu$, then each outcome's deviation from that mean, square each deviation, and finally average using the probabilities:

$$\mathrm{Var}(R)=\mathbb E[(R-\mu)^2].$$

For B, the two possible outcomes each have probability one half:

$$\mathrm{Var}(R)=0.5(-4-2)^2+0.5(8-2)^2=36.$$

The standard deviation is the square root of the variance: $\sigma=\sqrt{36}=6$. It therefore has the same units as the return again. Squaring prevents positive and negative deviations from canceling and gives greater weight to large deviations.

## Two denominators that are easy to confuse

If these four outcomes constitute the entire discrete distribution we have defined, each with probability 1/4, dividing by 4 gives that distribution's variance. If they are only four independent and identically distributed samples from an unknown population, a common choice is the unbiased sample variance:

$$s^2=\frac{1}{N-1}\sum_{i=1}^{N}(r_i-\bar r)^2.$$

Why $N-1$? We first estimated the mean from the same data, so the distances of the samples from their own mean tend to be too small. For independent and identically distributed samples with an existing second moment, this correction exactly removes that bias. Dividing an arbitrary industrial time-series segment by $N-1$ does not automatically solve its correlation problem.

## Why averaging more samples usually improves stability

For independent and identically distributed samples with finite variance:

$$\mathrm{Var}(\bar R)=\frac{\sigma^2}{N},\qquad
\mathrm{SE}(\bar R)\approx\frac{s}{\sqrt N}.$$

Under independence, cross-covariances are zero. The variance of the sum is $N\sigma^2$; dividing by $N^2$ then gives $\sigma^2/N$. Strongly correlated samples require the covariances to be considered as well. Adjacent 5-minute kiln records are usually not independent experiments. All points in one long trajectory cannot be treated as independent seeds.

## Bias, variance, and model uncertainty

Bias is a systematic estimation error; variance is the variation of an estimate across repeated samples. A quality model that consistently reports values 0.2% too low can have little variance but substantial bias. More data with the same bias will not automatically repair instrument bias or temporal leakage.

In RL, a full return contains many random future influences and may have high variance. TD uses an estimated future value and may introduce bias. GAE's $\lambda$ is a tradeoff between these sources, rather than a knob for which larger is always better. Industrial evaluation must also report constraint violations, worst operating regimes, and takeover rates. Variance cannot stand in for safety metrics.`,
  },
  {
    id: 'discount', number: 5, title: 'Sums, discounting, and recursion', summary: 'Why multiply the future by γ, and how can an infinite future become a one-step relation?', calculator: 'discount', chapters: ['01', '05', '07'],
    body: String.raw`## Start with a finite trajectory

Suppose a three-step teaching rollout produces rewards $[-1,2,3]$. The first step incurs a small adjustment cost, and the next two produce benefits. With discount factor $\gamma=0.9$:

$$G_0=-1+0.9\times2+0.9^2\times3=-1+1.8+2.43=3.23.$$

The first term is not discounted: immediate feedback after the current action has weight 1. The second term is one step farther away, so it receives one factor of $\gamma$; the third is two steps farther away, so it receives two factors. The plus one in the subscript of $r_{t+1}$ does not mean that it should receive one factor of $\gamma$.

## A summation sign abbreviates a pattern

$$G_t=\sum_{k=0}^{T-t-1}\gamma^k r_{t+k+1}.$$

Setting $k=0$ gives $r_{t+1}$; setting $k=1$ gives $\gamma r_{t+2}$, and so on. If a summation is hard to read, write out its first three terms. The structure usually becomes clear.

## Derive the recurrence one step at a time

$$G_t=r_{t+1}+\gamma r_{t+2}+\gamma^2r_{t+3}+\cdots.$$

Keep the first term and factor out $\gamma$ from all the others:

$$G_t=r_{t+1}+\gamma\bigl(r_{t+2}+\gamma r_{t+3}+\cdots\bigr).$$

The expression in parentheses is exactly the return starting at the next step, $G_{t+1}$, so:

$$G_t=r_{t+1}+\gamma G_{t+1}.$$

This is only an algebraic rearrangement. It does not yet involve estimation, optimization, or neural networks. Taking its conditional expectation in the later value-function discussion gives the Bellman relationship.

## Why discount, and how does it relate to 5-minute decisions?

Discounting can express decreasing weight on more distant outcomes. With bounded rewards and $0\le\gamma<1$, it also helps the infinite sum converge. Suppose every reward is always 1. Multiplying the finite sum by $\gamma$ and subtracting gives:

$$1+\gamma+\cdots+\gamma^{n-1}=\frac{1-\gamma^n}{1-\gamma}
\longrightarrow\frac1{1-\gamma}.$$

$1/(1-\gamma)$ is a rough effective number of steps corresponding to the total weight. It is not a point beyond which the agent can no longer see. Separating the first $H$ rewards from the remaining tail return gives:

$$G_t=\sum_{k=0}^{H-1}\gamma^kR_{t+k+1}+\gamma^H G_{t+H}.$$

With 5-minute steps and $\gamma=0.98$, 60 minutes corresponds to $H=12$. The coefficient on the **tail value** after that instant is $0.98^{12}\approx0.785$; after 120 minutes, the tail coefficient is approximately 0.616. If the question instead concerns the single reward received at 60 minutes, $R_{t+12}$, that is the twelfth term in the sum and its coefficient is $\gamma^{11}$. The first reward $R_{t+1}$ is undiscounted, which explains the difference of one power. Discounting affects how strongly delayed quality consequences propagate backward. Real delays still require the right states, models, and data.

If preference is expressed through a half-life of $H$ minutes, require $\gamma^{H/5}=1/2$, giving $\gamma=2^{-5/H}$. Choose the discount factor in relation to the evaluation objective and delay analysis, rather than automatically reusing a constant.`,
  },
  {
    id: 'gradient', number: 6, title: 'Derivatives, the chain rule, and gradient updates', summary: 'Turn “reduce prediction error” into an update you can calculate by hand.', calculator: 'gradient', chapters: ['09', '12', '17'],
    body: String.raw`## A derivative asks which way an output moves when a parameter changes

Consider a tiny value network with only one parameter: $\hat V_\theta(x)=\theta x$. The input $x$ is a normalized operating-condition feature, $\theta$ is a learnable weight, and the target is $y=3$. Measure the distance between the prediction and target using squared error:

$$L(\theta)=\frac12\bigl(\theta x-y\bigr)^2.$$

Why a square? Positive and negative errors both become nonnegative, large errors receive a stronger penalty, and the derivative is simple. The factor 1/2 merely cancels the factor 2 produced when differentiating the square.

## Split a complicated expression into two simple functions

First let $z=\theta x-y$, so $L=z^2/2$. The rate at which the inner quantity $z$ changes with $\theta$ is $x$; the rate at which the outer quantity $L$ changes with $z$ is $z$. The chain rule multiplies the rates along this path:

$$\frac{\partial L}{\partial\theta}
=\frac{\partial L}{\partial z}\frac{\partial z}{\partial\theta}
=z\,x=(\theta x-y)x.$$

$\partial$ denotes a partial derivative: when there is more than one parameter, first ask what happens when only one changes. Putting the partial derivatives of all parameters into a vector gives the gradient $\nabla_\theta L$.

## Substitute a complete set of numbers

For $x=2,\theta=0.5,y=3$, the prediction is $0.5\times2=1$, the error is $1-3=-2$, the loss is $(-2)^2/2=2$, and the gradient is $-2\times2=-4$.

Gradient descent moves in the direction opposite to the gradient:

$$\theta_{\mathrm{new}}=\theta-\eta\nabla_\theta L.$$

With learning rate $\eta=0.1$, the new parameter is $0.5-0.1(-4)=0.9$, the new prediction is 1.8, and the new loss is $(1.8-3)^2/2=0.72$. This update reduced the loss. A step that is too large can overshoot the minimum or even increase the loss; the calculator below makes that visible.

## Why the Critic descends while the Actor often ascends

The Critic usually minimizes error, so its update uses a minus sign. The policy aims to maximize expected return $J(\theta)$ and can use $\theta\leftarrow\theta+\eta\nabla_\theta J$. Alternatively, define the loss as $L_\pi=-J$ and use descent throughout. Read the sign in code together with its objective; the word gradient alone does not determine the direction.

A TD target contains an estimate of the next state's value. Treating that target as a differentiable function of the same current parameters changes the update into a different problem. DQN commonly freezes a target network or stops gradients through the target, differentiating only the current prediction. This is the idea behind a semi-gradient update. It has conditions of applicability and does not guarantee stability for every combination of function approximation and off-policy data.`,
  },
  {
    id: 'log', number: 7, title: 'Logarithms, products of probabilities, and policy gradients', summary: 'Why does log_prob appear so often in RL code?', calculator: 'log', chapters: ['12', '14', '15'],
    body: String.raw`## Why a trajectory probability is a product

Consider a teaching policy that chooses a small increase twice in succession, with conditional probabilities 0.6 and 0.7. Each probability already conditions on the observation at its own time step. Looking only at policy choices, the action-probability factor along this given state sequence is $0.6\times0.7=0.42$.

A complete trajectory also includes the initial-state probability and environment transition probabilities. This is not arbitrary multiplication of two marginal probabilities; it repeatedly applies the probability chain rule:

$$P_\theta(\tau)=p(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)\,p(s_{t+1}\mid s_t,a_t).$$

$\prod$ means multiply the terms together. $\tau$ denotes an entire trajectory, not one time instant.

## Logarithms turn products into sums

$$\log(xy)=\log x+\log y,\qquad x,y>0.$$

Here log usually means the natural logarithm. Taking the logarithm of a trajectory probability lets us add the log probabilities at each step. If the environment transition itself does not contain the policy parameters $\theta$, the direct derivatives of those environment terms with respect to $\theta$ are zero:

$$\nabla_\theta\log P_\theta(\tau)
=\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t).$$

This does not mean that actions have no effect on the environment. They still change the distribution of subsequent states. It means that, for a given trajectory, the environment probability function does not contain the policy weights we are training.

## The log-derivative trick is an algebraic identity

For a positive, differentiable probability $p_\theta$:

$$\nabla_\theta\log p_\theta=\frac{\nabla_\theta p_\theta}{p_\theta}
\quad\Longrightarrow\quad
\nabla_\theta p_\theta=p_\theta\nabla_\theta\log p_\theta.$$

Why rewrite it this way? The derivative of expected return originally contains $\nabla P_\theta(\tau)$. After replacing it with the right-hand side, we can put $P_\theta(\tau)$ back into an expectation weighted by trajectory probability, then estimate the gradient from sampled trajectories:

$$\nabla_\theta J(\theta)
=\mathbb E_{\tau\sim P_\theta}\left[G(\tau)\nabla_\theta\log P_\theta(\tau)\right].$$

The derivation assumes conditions under which differentiation can be interchanged with integration or summation. It does not differentiate the reward itself, so the environment need not supply an analytical derivative of temperature with respect to its setpoint.

## Why PPO also needs a new-to-old probability ratio

If the same action has probability 0.2 under the old policy and 0.3 under the new policy, the ratio is $0.3/0.2=1.5$. We can also subtract log probabilities and exponentiate:

$$\rho=\exp\bigl(\log\pi_{\mathrm{new}}-\log\pi_{\mathrm{old}}\bigr).$$

The ratio measures how much more common this sampled action becomes relative to the old policy. It does not multiply temperature by 1.5. If the old probability is zero while the new probability is positive, the old data cannot cover this term at all, and a ratio correction cannot be computed. This connects to the action-support problem in offline RL.`,
  },
  {
    id: 'density', number: 8, title: 'Continuous actions, densities, and change of variables', summary: 'Why can a density exceed 1, and why must tanh change the log probability?', calculator: 'density', chapters: ['16', '17'],
    body: String.raw`## Move from three buttons to a slider

A discrete policy can assign probabilities to three actions: decrease, hold, and increase. A continuous policy allows any action value between −1 and 1. We cannot give every point a positive probability and then add them all. Instead, a probability density $p(a)$ represents probability through area over an interval:

$$P(l\le A\le u)=\int_l^u p(a)\,da.$$

An initial intuition for an integral is to add the areas of many very narrow rectangles. A uniform distribution on $[0,0.5]$ has density 2, but its total area is $2\times0.5=1$. Density 2 is therefore valid; it is not an event probability of 200%.

## Three quantities in a Gaussian policy

$$U=\mu+\sigma\epsilon,\qquad \epsilon\sim\mathcal N(0,1),\quad\sigma>0.$$

$\mu$ determines the center, $\sigma$ the spread, and $\epsilon$ is standard normal noise. Given $\epsilon$, $U$ is a differentiable function of $\mu,\sigma$. This is reparameterization: randomness lives in a noise source separate from the parameters being learned.

A Gaussian has no upper or lower bound. Many continuous-control policies therefore generate $U$ first, then map it into $(-1,1)$ using $A=\tanh U$. Only afterward do they multiply by a physical rate limit, such as $\Delta T^{sp}=2A$.

## Compress coordinates while preserving probability mass

The probability mass of the same small interval must agree before and after transformation:

$$p_A(a)\,da=p_U(u)\,du.$$

Therefore:

$$p_A(a)=p_U(u)\left|\frac{du}{da}\right|
=\frac{p_U(u)}{\left|da/du\right|}.$$

Since $\frac{d}{du}\tanh u=1-\tanh^2u=1-a^2$, we obtain:

$$\log p_A(a)=\log p_U(u)-\log(1-a^2).$$

Near a boundary, tanh compresses a longer interval of $u$ into a shorter interval of $a$. Relative to **the original Gaussian density at that same $u$**, the density must increase by the interval-compression factor. Its absolute value still depends on the Gaussian tail. This does not imply that density must rise as the action approaches $\pm1$; for a Gaussian with finite mean and positive finite variance, the transformed density eventually tends to zero at the boundaries. Without the Jacobian correction, entropy and policy gradients use a distribution other than that of the candidate action after tanh. If a later gate replaces the candidate with a hold action, it changes the distribution of actions actually executed again.

## What changes when the action is expressed in °C?

If $\Delta T=2A$, then $\log p_{\Delta T}(\Delta T)=\log p_A(A)-\log2$. This constant does not change some parameter gradients under a fixed scale, but it affects reported densities and entropies, as well as the units used for the temperature objective.

tanh bounds only the magnitude of the current proposal. Repeated proposals can still move the cumulative setpoint beyond mechanical limits; even small individual actions can lead to unsafe operating conditions. State, data support, execution boundaries, and quality costs therefore require separate checks.`,
  },
];
