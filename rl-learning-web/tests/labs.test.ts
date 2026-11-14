import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discountedReturns, tdTarget, nStepTarget, generalizedAdvantage, ppoObjective, softmax, reinforceUpdate, seededRandom, runBandit, gridTransition, gridSweep, squashedLogProbability, bootstrapMeanInterval, evaluateSafety, trainCliff } from '../src/labs/math';
const near = (a: number, b: number, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} is not approximately ${b}`);

test('discounted returns match a hand-computed trajectory', () => {
  assert.deepEqual(discountedReturns([1, 0, 2], .5), [1.5, 1, 2]);
  assert.deepEqual(discountedReturns([1, 0, 2], .5, 4), [2, 2, 4]);
  assert.deepEqual(discountedReturns([1, 2, 3], 0), [1, 2, 3]);
  assert.deepEqual(discountedReturns([1, 2, 3], 1), [6, 5, 3]);
});
test('termination removes bootstrap while an external timeout preserves it', () => {
  near(tdTarget(2, .9, 10, true), 2); near(tdTarget(2, .9, 10, false), 11);
  near(nStepTarget([1, 2, 3], [0, 5, 6, 7], 0, 2, .5), 3.5);
  near(nStepTarget([1, 2, 3], [0, 5, 6, 7], 0, 3, .5, true), 2.75);
  near(nStepTarget([1, 2, 3], [0, 5, 6, 7], 0, 3, .5, false), 3.625);
});
test('GAE lambda endpoints and reset mask', () => {
  const zero = generalizedAdvantage([1, 2], [.5, 1, 10], .9, 0, [false, true]);
  near(zero[0]!, 1.4); near(zero[1]!, 1);
  const one = generalizedAdvantage([1, 2], [.5, 1, 10], .9, 1, [false, true]);
  near(one[0]!, 2.3); near(one[1]!, 1);
  near(generalizedAdvantage([1, 2], [.5, 1, 10], .9, 1, [false, false], [false, true])[0]!, 10.4);
  // Use final-state value but do not include the next episode's residual.
  near(generalizedAdvantage([1, 50], [0, 2, 0], .9, 1, [false, true], [true, true])[0]!, 2.8);
});
test('PPO clips the helpful direction only, for both signs of advantage', () => {
  near(ppoObjective(.5, 2, .2), 1); near(ppoObjective(1.6, 2, .2), 2.4);
  near(ppoObjective(.5, -2, .2), -1.6); near(ppoObjective(1.6, -2, .2), -3.2);
  near(ppoObjective(2, 0, .2), 0);
});
test('softmax remains stable and REINFORCE adjusts relative probability', () => {
  assert.deepEqual(softmax([1000, 1000]), [.5, .5]);
  const p = softmax(reinforceUpdate([0, 0, 0], 0, 1, .1));
  near(p.reduce((a, b) => a + b, 0), 1); assert.ok(p[0]! > 1 / 3); near(p[1]!, p[2]!);
});
test('bandit reproducibility and pseudo-regret semantics', () => {
  const run = runBandit(500, 42, .1);
  assert.deepEqual(run, runBandit(500, 42, .1));
  assert.notDeepEqual(run.choices, runBandit(500, 43, .1).choices);
  assert.equal(run.counts.reduce((a, b) => a + b, 0), 500);
  assert.ok(run.regret.at(-1)! >= 0 && run.regret.at(-1)! <= 200);
  assert.ok(runBandit(100, 7, .5, 'epsilon', [.5, .5, .5, .5]).regret.every(r => r === 0));
  assert.deepEqual(runBandit(4, 42, 0, 'ucb').counts, [1, 1, 1, 1]);
  assert.deepEqual(Array.from({ length: 10 }, seededRandom(19)), Array.from({ length: 10 }, seededRandom(19)));
});
test('grid value agrees with shortest-path return', () => {
  assert.deepEqual(gridTransition(14, 1), { next: 15, reward: 10, terminated: true });
  assert.deepEqual(gridTransition(1, 2), { next: 1, reward: -1, terminated: false });
  const values = new Array<number>(16).fill(0); values[15] = 10000;
  near(gridSweep(values, .9)[14]!, 10);
  let v = new Array<number>(16).fill(0);
  for (let k = 0; k < 20; k++) v = gridSweep(v, .9);
  near(v[0]!, 1.8098, 1e-8); near(v[15]!, 0);
});
test('tanh-transformed density normalizes and stays stable', () => {
  near(squashedLogProbability(0, 0, 1), -.5 * Math.log(2 * Math.PI));
  assert.ok(Number.isFinite(squashedLogProbability(20, 0, 1)));
  let integral = 0;
  const n = 20000, width = 2 / n;
  for (let i = 0; i < n; i++) integral += Math.exp(squashedLogProbability(Math.atanh(-1 + (i + .5) * width), .2, .7)) * width;
  near(integral, 1, 1e-4);
});
test('seed-level bootstrap handles identical outcomes', () => {
  assert.deepEqual(bootstrapMeanInterval([3, 3, 3, 3, 3], 42), [3, 3]);
  assert.deepEqual(bootstrapMeanInterval([1, 3, 4, 7, 9], 42), bootstrapMeanInterval([1, 3, 4, 7, 9], 42));
});
test('five-layer gate short-circuits with zero increment on any failure', () => {
  const base = { dataValid: true, stateValid: true, oxygen: 1.5, z: 1, action: .3, previousAction: 0, setpoint: .5, apc: true };
  assert.equal(evaluateSafety(base).failedGate, null); near(evaluateSafety(base).output, .3);
  const invalid = evaluateSafety({ ...base, dataValid: false });
  assert.deepEqual(invalid.gates, ['fail', 'pending', 'pending', 'pending', 'pending']); assert.equal(invalid.output, 0);
  assert.equal(evaluateSafety({ ...base, oxygen: NaN }).failedGate, 1);
  assert.equal(evaluateSafety({ ...base, oxygen: 1.1 }).failedGate, 2);
  assert.equal(evaluateSafety({ ...base, oxygen: 1.2, z: 4 }).failedGate, null);
  assert.equal(evaluateSafety({ ...base, z: 4.1 }).failedGate, 3);
  assert.equal(evaluateSafety({ ...base, action: 1, previousAction: -1 }).failedGate, 4);
  assert.equal(evaluateSafety({ ...base, setpoint: .99 }).failedGate, 5);
  assert.equal(evaluateSafety({ ...base, apc: false }).failedGate, 5);
});
test('cliff records are reproducible actual episode samples', () => {
  const r = trainCliff('sarsa', 100, 42, .1);
  assert.deepEqual(r, trainCliff('sarsa', 100, 42, .1));
  assert.equal(r.returns.length, 100); assert.ok(r.returns.every(v => Number.isFinite(v) && v < 0));
  assert.equal(r.path[0], 36); assert.ok(r.falls > 0);
});
