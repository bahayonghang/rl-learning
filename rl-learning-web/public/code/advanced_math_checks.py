"""Executable derivations for chapters 13, 15 and 16; Python standard library only.
Run with: python advanced_math_checks.py
These calculations do not train a policy or connect to an environment.
"""
import math


def gae(rewards, values, next_values, terminated, truncated, gamma=0.9, lam=0.8):
    lengths = [len(x) for x in (rewards, values, next_values, terminated, truncated)]
    if len(set(lengths)) != 1:
        raise ValueError("All trajectory arrays must have the same length")
    result = [0.0] * len(rewards)
    tail = 0.0
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * (not terminated[t]) * next_values[t] - values[t]
        continuation = not (terminated[t] or truncated[t])
        tail = delta + gamma * lam * continuation * tail
        result[t] = tail
    return result


def ppo_contribution(ratio, advantage, epsilon=0.2):
    clipped = min(1 + epsilon, max(1 - epsilon, ratio))
    return min(ratio * advantage, clipped * advantage)


def squashed_log_density(u, mu=0.0, sigma=1.0, scale=1.0):
    if sigma <= 0 or scale <= 0:
        raise ValueError("sigma and scale must be positive")
    base = -0.5 * ((u - mu) / sigma) ** 2 - math.log(sigma) - 0.5 * math.log(2 * math.pi)
    # softplus(x) = max(x, 0) + log1p(exp(-abs(x)))
    x = -2 * u
    correction = 2 * (math.log(2) - u - max(x, 0) - math.log1p(math.exp(-abs(x))))
    return base - correction - math.log(scale)


if __name__ == "__main__":
    result = gae([1, -0.5, 2], [0, 0, 0], [0, 0, 0], [False] * 3, [False, False, True])
    assert all(math.isclose(x, y) for x, y in zip(result, [1.6768, 0.94, 2]))
    # Truncation keeps final-observation bootstrap but cannot leak across reset.
    result = gae([1, 100], [5, 0], [10, 0], [False, True], [True, False])
    assert math.isclose(result[0], 5.0)
    result = gae([1], [5], [10], [True], [False])
    assert math.isclose(result[0], -4.0)
    for ratio, advantage, expected in [(1.4, 2, 2.4), (0.6, 2, 1.2), (0.6, -2, -1.6), (1.4, -2, -2.8)]:
        assert math.isclose(ppo_contribution(ratio, advantage), expected)
    assert math.isclose(squashed_log_density(0, scale=2), -0.5 * math.log(2 * math.pi) - math.log(2))
    assert math.isfinite(squashed_log_density(100))
    print("Passed: GAE recursion, truncation vs termination, PPO sign cases, tanh density and scaling.")
