# Offline Reinforcement Learning Guidelines

> Guidance for learning decision-making policies from historical process logs without online exploration.

---

## 1. Problem Context: The Industrial Distribution Shift

In a cement clinker manufacturing system, historical data is generated under human operator supervision or legacy APC systems. This introduces two critical challenges:
1. **Narrow Action Coverage**: Historical setpoint adjustments are tightly clustered around conservative operating zones.
2. **Extrapolation Error (Distribution Shift)**: Standard Q-learning queries $Q(s, a')$ for out-of-distribution (OOD) actions, leading to catastrophic overestimation.

All offline algorithms in this repository must constrain the learned policy to stay within the support of the behavioral distribution $\mathcal{D}$.

---

## 2. Algorithm Standards

### 2.1 TD3+BC (Lightweight Baseline)
Adds a behavior cloning regularizer to TD3's actor loss:
$$\pi^* = \arg\max_\pi \mathbb{E}_{(s, a) \sim \mathcal{D}} \left[ \frac{\lambda}{(\frac{1}{N}\sum |Q(s, a)|)} Q(s, \pi(s)) - (\pi(s) - a)^2 \right]$$
- **When to use**: Quick baseline verification, low computational overhead.
- **Normalization**: Observations and actions must be normalized before calculating Euclidean distance.

### 2.2 In-Sample Learning: IQL (Implicit Q-Learning)
Avoids querying out-of-sample actions entirely by using expectile regression:
$$L_V(\psi) = \mathbb{E}_{(s, a) \sim \mathcal{D}} \left[ L_2^\tau \left( \min_j Q_{\hat{\theta}_j}(s, a) - V_\psi(s) \right) \right]$$
$$\pi_\phi(s) = \arg\max_\phi \mathbb{E}_{(s, a) \sim \mathcal{D}} \left[ \exp\left(\beta (Q_{\hat{\theta}}(s, a) - V_\psi(s))\right) \log \pi_\phi(a|s) \right]$$
- **When to use**: Highly conservative dataset with multi-modal operator behaviors. Expectile $\tau \in [0.7, 0.9]$.

### 2.3 Conservative Value Estimation: CQL
Penalizes Q-values on out-of-distribution actions while maximizing Q-values on the dataset actions:
$$\min_Q \alpha \cdot \left( \mathbb{E}_{s \sim \mathcal{D}, a \sim \mu(a|s)} [Q(s, a)] - \mathbb{E}_{(s, a) \sim \mathcal{D}} [Q(s, a)] \right) + \frac{1}{2} \mathcal{E}_{\text{TD}}(Q)$$

---

## 3. Dataset Pipeline & d3rlpy Integration

Datasets collected from DCS/OPC or simulation (`SimpleKilnEnv.collect_dataset`) should be structured into `d3rlpy.dataset.MDPDataset`:

```python
import numpy as np
import d3rlpy
from simple_kiln_env import collect_dataset

# Collect or load dataset
raw_data = collect_dataset(n_episodes=50, horizon=72, seed=42)

dataset = d3rlpy.dataset.MDPDataset(
    observations=raw_data["obs"],
    actions=raw_data["act"],
    rewards=raw_data["rew"],
    terminals=np.zeros(len(raw_data["rew"]), dtype=bool),  # continuing process
    timeouts=raw_data["timeout"],
)

# Initialize TD3+BC or IQL
model = d3rlpy.algos.IQLConfig(
    batch_size=256,
    actor_learning_rate=3e-4,
    critic_learning_rate=3e-4,
    expectile=0.7,
    weight_temp=3.0,
).create(device="cuda:0")

model.fit(dataset, n_steps=20000)
```

---

## 4. Off-Policy Policy Evaluation (OPE / FQE)

Never evaluate an offline RL model solely by its training loss:
- Always run **Fitted Q-Evaluation (FQE)** on an independent validation dataset.
- Correlate FQE predicted values against rollouts executed in the validated world model ($W_\psi$).

---

## 5. Anti-Patterns & Pitfalls

- **Do NOT use standard online DDPG/SAC without offline regularization**: They will exploit Q-function extrapolation errors and output extreme setpoint requests.
- **Do NOT mark time-limit steps as `terminals=True`**: Industrial kiln operation is a continuing task ($T_{max}$ indicates timeout truncation, not a terminal state). Setting `terminal=True` zero-outs future bootstrapping and distorts value estimates.
