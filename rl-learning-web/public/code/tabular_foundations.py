"""A dependency-free, reproducible tabular RL teaching experiment.

Run: python tabular_foundations.py --method q_learning --seed 42
Compare: python tabular_foundations.py --method sarsa --seed 42
All values printed are toy gridworld simulation results, not industrial evidence.
No third-party packages, device connections or background training are used.
"""

from __future__ import annotations

import argparse
import json
import random
from typing import Literal

State = tuple[int, int]
Method = Literal["sarsa", "q_learning"]
SIZE = 4
START = (3, 0)
GOAL = (0, 3)
MOVES = ((-1, 0), (0, 1), (1, 0), (0, -1))
GAMMA = 0.95


def discounted_returns(rewards: list[float], gamma: float) -> list[float]:
    result = [0.0] * len(rewards)
    running = 0.0
    for t in range(len(rewards) - 1, -1, -1):
        running = rewards[t] + gamma * running
        result[t] = running
    return result


def transition(state: State, action: int) -> tuple[State, float, bool]:
    """One grid transition. GOAL is a true terminal; boundary collisions stay put."""
    if state == GOAL:
        return GOAL, 0.0, True
    if not 0 <= action < len(MOVES):
        raise ValueError("action must be 0, 1, 2 or 3")
    dr, dc = MOVES[action]
    next_state = (
        min(SIZE - 1, max(0, state[0] + dr)),
        min(SIZE - 1, max(0, state[1] + dc)),
    )
    # Every movement costs one, including the move entering the goal.
    return next_state, -1.0, next_state == GOAL


def value_iteration(gamma: float = GAMMA) -> tuple[dict[State, float], int]:
    states = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    values = {s: 0.0 for s in states}
    for sweep in range(1, 10001):
        updated: dict[State, float] = {}
        for state in states:
            if state == GOAL:
                updated[state] = 0.0
                continue
            scores = []
            for action in range(4):
                nxt, reward, terminal = transition(state, action)
                scores.append(reward + gamma * (0.0 if terminal else values[nxt]))
            updated[state] = max(scores)
        difference = max(abs(updated[s] - values[s]) for s in states)
        values = updated
        if difference < 1e-10:
            return values, sweep
    raise RuntimeError("value iteration did not converge")


def epsilon_greedy(values: list[float], epsilon: float, rng: random.Random) -> int:
    if rng.random() < epsilon:
        return rng.randrange(len(values))
    best = max(values)
    return rng.choice([a for a, value in enumerate(values) if value == best])


def train(method: Method, seed: int, episodes: int) -> tuple[dict[State, list[float]], dict]:
    rng = random.Random(seed)
    q = {(r, c): [0.0] * 4 for r in range(SIZE) for c in range(SIZE)}
    horizon, alpha, epsilon = 100, 0.15, 0.1
    terminations = truncations = 0
    total_steps = 0
    for _ in range(episodes):
        state = START
        action = epsilon_greedy(q[state], epsilon, rng)
        for step in range(horizon):
            nxt, reward, terminated = transition(state, action)
            truncated = step + 1 >= horizon and not terminated
            next_action = epsilon_greedy(q[nxt], epsilon, rng)
            if terminated:
                future = 0.0
            elif method == "sarsa":
                future = q[nxt][next_action]
            else:
                future = max(q[nxt])
            # A time limit resets sampling but does not erase future value.
            target = reward + GAMMA * future
            q[state][action] += alpha * (target - q[state][action])
            total_steps += 1
            state, action = nxt, next_action
            if terminated or truncated:
                terminations += int(terminated)
                truncations += int(truncated)
                break
    return q, {"true_terminations": terminations, "time_limit_truncations": truncations,
               "environment_steps": total_steps, "alpha": alpha, "epsilon": epsilon}


def evaluate(q: dict[State, list[float]], seed: int) -> dict:
    rng = random.Random(seed)
    state, rewards, path = START, [], [list(START)]
    terminated = False
    for _ in range(100):
        action = epsilon_greedy(q[state], 0.0, rng)
        state, reward, terminated = transition(state, action)
        rewards.append(reward)
        path.append(list(state))
        if terminated:
            break
    return {"completed": terminated, "steps": len(rewards),
            "discounted_return": discounted_returns(rewards, GAMMA)[0], "path": path}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--method", choices=["q_learning", "sarsa"], default="q_learning")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--episodes", type=int, default=400)
    args = parser.parse_args()
    if args.episodes < 1:
        parser.error("--episodes must be positive")
    exact, sweeps = value_iteration()
    q, training = train(args.method, args.seed, args.episodes)
    report = {
        "label": "Toy gridworld simulation; not an industrial experiment",
        "method": args.method,
        "training_seed": args.seed,
        "evaluation_seed": args.seed + 10000,
        "episodes": args.episodes,
        "gamma": GAMMA,
        "exact_optimal_start_value": exact[START],
        "dynamic_programming_sweeps": sweeps,
        "training": training,
        "greedy_evaluation": evaluate(q, args.seed + 10000),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
