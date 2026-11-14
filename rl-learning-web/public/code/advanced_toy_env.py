"""Normalized setpoint teaching simulation; NOT a kiln or a safety controller.

Install: pip install gymnasium numpy
Run:     python advanced_toy_env.py

The three observations are abstract process value, current setpoint and target.
These are dimensionless teaching variables, not the project's industrial POMDP.
"""
from __future__ import annotations

import gymnasium as gym
import numpy as np
from gymnasium import spaces
from gymnasium.utils.env_checker import check_env


class SetpointTeachingEnv(gym.Env):
    """Continuing abstract tracking task, cut into finite teaching windows."""

    metadata = {"render_modes": []}

    def __init__(self, horizon: int = 72, noise_std: float = 0.01):
        if horizon < 1 or noise_std < 0:
            raise ValueError("horizon must be positive; noise_std must be nonnegative")
        super().__init__()
        self.horizon = int(horizon)
        self.noise_std = float(noise_std)
        self.action_space = spaces.Box(-1.0, 1.0, shape=(1,), dtype=np.float32)
        self.observation_space = spaces.Box(-1.0, 1.0, shape=(3,), dtype=np.float32)
        self._ready = False
        self.t = 0
        self.x = 0.0
        self.setpoint = 0.0
        self.target = 0.0

    def _observation(self):
        return np.array([self.x, self.setpoint, self.target], dtype=np.float32)

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self.t = 0
        self.x = float(self.np_random.uniform(-0.3, 0.3))
        self.setpoint = 0.0
        self.target = 0.2
        self._ready = True
        return self._observation(), {"simulation": "dimensionless_teaching_only"}

    def step(self, action):
        if not self._ready:
            raise RuntimeError("Call reset before step and after truncation")
        candidate = np.asarray(action, dtype=np.float32)
        if not self.action_space.contains(candidate) or not np.isfinite(candidate).all():
            raise ValueError("action must be one finite normalized increment in [-1, 1]")
        delta = float(candidate[0])
        self.setpoint = float(np.clip(self.setpoint + 0.1 * delta, -1, 1))
        disturbance = float(self.np_random.normal(0.0, self.noise_std))
        self.x = float(np.clip(0.8 * self.x + 0.2 * self.setpoint + disturbance, -1, 1))
        self.t += 1
        reward = -float((self.x - self.target) ** 2 + 0.01 * delta ** 2)
        terminated = False
        truncated = self.t >= self.horizon
        self._ready = not truncated
        info = {"simulation": "dimensionless_teaching_only", "tracking_error": self.x - self.target}
        return self._observation(), reward, terminated, truncated, info


def rollout(seed=42, feedback=True):
    env = SetpointTeachingEnv()
    obs, _ = env.reset(seed=seed)
    total = 0.0
    while True:
        increment = np.clip((float(obs[2]) - float(obs[1])) / 0.1, -1, 1) if feedback else 0.0
        obs, reward, terminated, truncated, _ = env.step(np.array([increment], dtype=np.float32))
        total += reward
        if terminated or truncated:
            break
    env.close()
    return total


if __name__ == "__main__":
    check_env(SetpointTeachingEnv(), skip_render_check=True)
    print("Gymnasium interface check passed. Dimensionless simulation only.")
    for seed in range(42, 47):
        print(f"seed={seed}: hold={rollout(seed, False):.5f}, feedback={rollout(seed, True):.5f}")
    print("These are teaching rollouts, not industrial energy or quality results.")
