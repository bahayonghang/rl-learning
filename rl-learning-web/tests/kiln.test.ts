import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createKiln, stepKiln, advanceKiln, observeKiln, checkKilnGates, conservativeFeedback,
  compareKilnBranches, rewardDecomposition, constraintCosts, MAX_STEPS, type Vec3,
} from '../src/kiln/math';
import { tdTarget } from '../src/labs/math';
const near = (actual: number, expected: number, tolerance = 1e-9): void => {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} is not approximately ${expected}`);
};
const zero: Vec3 = [0, 0, 0];

test('one supervisory action changes setpoints by RATE, with partial first-order PV tracking', () => {
  const start = createKiln(42);
  const change = stepKiln(start, [1, -.5, .2]);
  const hold = stepKiln(start, zero);
  assert.deepEqual(start.setpoints, [880, 1100, -80]);
  assert.equal(start.step, 0, 'transitions must not mutate a shared branching starting point');
  assert.deepEqual(change.setpoints, [882, 1097.5, -79]);
  assert.deepEqual(change.lastTransition?.physicalIncrement, [2, -2.5, 1]);
  // Identical external disturbances cancel; an entire 2°C SP jump is not a 2°C PV jump.
  near(change.pv[0] - hold.pv[0], .56);
  near(change.pv[1] - hold.pv[1], -.45);
  near(change.pv[2] - hold.pv[2], .45);
});

test('published assay availability is distinct from sampling, age remains sampling age', () => {
  let state = createKiln(7);
  assert.deepEqual(observeKiln(state).lab, { sampleStep: -12, releaseStep: 0, value: 1.10 });
  assert.equal(observeKiln(state).vector[11], 1, 'lab age is hours in the existing 13-vector');
  state = advanceKiln(state, 11, 'hold', zero);
  assert.equal(state.step, 11);
  assert.equal(observeKiln(state).lab.sampleStep, -12);
  assert.equal(observeKiln(state).labAgeMinutes, 115);
  state = stepKiln(state, zero);
  assert.equal(observeKiln(state).lab.sampleStep, 0);
  assert.equal(observeKiln(state).lab.releaseStep, 12);
  assert.equal(observeKiln(state).labAgeMinutes, 60);
  assert.equal(state.pendingAssays[0]!.sampleStep, 12);
  assert.equal(state.pendingAssays[0]!.releaseStep, 24);
  assert.equal(state.lastTransition?.published.length, 1);
  state = advanceKiln(state, 11, 'hold', zero);
  assert.equal(observeKiln(state).lab.sampleStep, 0);
  state = stepKiln(state, zero);
  assert.equal(observeKiln(state).lab.sampleStep, 12);
  assert.equal(observeKiln(state).lab.releaseStep, 24);
  for (const p of state.history) assert.ok(p.lab.releaseStep <= p.step, 'future assays cannot be attached to earlier observations');
});

test('future assays and hidden current quality never leak into the policy observation', () => {
  const start = createKiln(42);
  const hiddenChanged = { ...start, thermal: 910, trueQuality: 2.4, pendingAssays: [{ sampleStep: 0, releaseStep: 12, value: 2.3 }] };
  assert.deepEqual(observeKiln(hiddenChanged), observeKiln(start));
  assert.deepEqual(conservativeFeedback(observeKiln(hiddenChanged)), conservativeFeedback(observeKiln(start)));
  const a = advanceKiln(start, 11, 'hold', zero);
  const b = advanceKiln(hiddenChanged, 11, 'hold', zero);
  // Hidden quality affects true evaluation and future samples, not the current soft sensor or latest published lab.
  assert.deepEqual(observeKiln(a), observeKiln(b));
  assert.notEqual(a.trueQuality, b.trueQuality);
  const released = stepKiln(b, zero);
  near(observeKiln(released).lab.value, 2.3);
  assert.equal(observeKiln(released).vector.length, 13);
});

test('a temperature pulse reaches quality only after material delay and reaches available labs later', () => {
  let pulse = createKiln(42), hold = createKiln(42);
  for (let i = 1; i <= 24; i++) {
    pulse = stepKiln(pulse, i === 1 ? [1, 0, 0] : zero);
    hold = stepKiln(hold, zero);
    if (i <= 6) near(pulse.trueQuality, hold.trueQuality);
    if (i === 7) assert.ok(pulse.trueQuality < hold.trueQuality, 'the first changed parcel has now reached the quality proxy');
    if (i < 24) near(observeKiln(pulse).lab.value, observeKiln(hold).lab.value);
  }
  assert.ok(observeKiln(pulse).lab.value < observeKiln(hold).lab.value);
  assert.equal(observeKiln(pulse).lab.sampleStep, 12, 'at 120 min the changed 60 min sample is available');
});

test('each safety layer rejects its own counterexample and later layers remain unexecuted', () => {
  assert.equal(checkKilnGates(createKiln(), [NaN, 0, 0]).failed, 1);
  assert.equal(checkKilnGates(createKiln(42, 'low-oxygen'), zero).failed, 2);
  const ood = checkKilnGates(createKiln(42, 'ood'), zero);
  assert.equal(ood.failed, 3);
  assert.deepEqual(ood.checks, ['pass', 'pass', 'fail', 'pending', 'pending']);
  const priorPositive = stepKiln(createKiln(), [1, 0, 0]);
  assert.equal(checkKilnGates(priorPositive, [-1, 0, 0]).failed, 4);
  assert.equal(checkKilnGates(priorPositive, [-.5, 0, 0]).failed, null, 'the exact infinity-norm limit 1.5 is allowed');
  const atMechanicalLimit = { ...createKiln(), setpoints: [900, 1100, -80] as Vec3 };
  assert.equal(checkKilnGates(atMechanicalLimit, [.5, 0, 0]).failed, 5);
  assert.equal(checkKilnGates(createKiln(42, 'no-apc'), zero).failed, 5);
  assert.equal(checkKilnGates(createKiln(), [1.1, 0, 0]).failed, 4);
});

test('rejection holds the current SP but still advances dynamics, measurements, and assay publication', () => {
  const start = createKiln(42, 'no-apc');
  const next = advanceKiln(start, 12, 'manual', [1, 1, 1]);
  assert.deepEqual(next.setpoints, start.setpoints);
  assert.equal(next.step, 12);
  assert.notDeepEqual(next.pv, start.pv);
  assert.equal(next.latestAssay.sampleStep, 0);
  assert.ok(next.history.slice(1).every(p => p.gateFailed === 5));
  assert.ok(next.history.slice(1).every(p => p.executed.every(x => x === 0)));
  assert.deepEqual(next.previousExecuted, zero);
  const afterPositive = stepKiln(createKiln(), [1, 0, 0]);
  const rejectedReversal = stepKiln(afterPositive, [-1, 0, 0]);
  assert.deepEqual(rejectedReversal.previousExecuted, zero, 'the next curvature check compares with the actual zero fallback');
  assert.equal(checkKilnGates(rejectedReversal, [-1, 0, 0]).failed, null);
});

test('a fixed seed reproduces trajectories; paired branches preserve exogenous disturbances', () => {
  const first = advanceKiln(createKiln(101, 'raw-meal'), 36, 'feedback', zero);
  const repeat = advanceKiln(createKiln(101, 'raw-meal'), 36, 'feedback', zero);
  assert.deepEqual(first, repeat);
  assert.notDeepEqual(first.history, advanceKiln(createKiln(102, 'raw-meal'), 36, 'feedback', zero).history);
  const origin = advanceKiln(createKiln(101), 4, 'hold', zero);
  const branches = compareKilnBranches(origin, 12, [.2, 0, 0]);
  assert.equal(origin.step, 4);
  assert.equal(origin.history.length, 5);
  assert.ok(branches.every(b => b.points.length === 12 && b.state.step === 16));
  assert.deepEqual(branches[0]!.state.lastTransition?.disturbances, branches[2]!.state.lastTransition?.disturbances);
  assert.deepEqual(branches[0]!.state.kh, branches[2]!.state.kh);
  assert.notDeepEqual(branches[0]!.state.pv, branches[2]!.state.pv);
});

test('reward is energy plus action regularity; quality and oxygen remain independent constraint costs', () => {
  const parts = rewardDecomposition(130, 24, [.5, 0, 0], [-.5, 0, 0]);
  near(parts.coalZ, -1);
  near(parts.electricZ, -1);
  near(parts.energyTerm, 1);
  near(parts.actionSquare, .25);
  near(parts.changeSquare, 1);
  near(parts.smoothTerm, -.0625);
  near(parts.reward, .9375);
  const bad = constraintCosts(.2, .9);
  near(bad.quality, .3);
  near(bad.oxygen, .3);
  assert.deepEqual(constraintCosts(.5, 1.2), { quality: 0, oxygen: 0 });
  assert.deepEqual(constraintCosts(1.5, 1.8), { quality: 0, oxygen: 0 });
  const normal = stepKiln(createKiln(17), zero);
  const lowOxygen = stepKiln(createKiln(17, 'low-oxygen'), zero);
  near(normal.lastTransition!.rewardParts.reward, lowOxygen.lastTransition!.rewardParts.reward);
  assert.ok(lowOxygen.lastTransition!.costs.oxygen > normal.lastTransition!.costs.oxygen);
});

test('the teaching stop is a bounded truncation, not a physical terminal state', () => {
  const state = advanceKiln(createKiln(), 1000, 'hold', zero);
  assert.equal(state.step, MAX_STEPS);
  assert.equal(state.history.length, 73);
  assert.equal(state.terminated, false);
  assert.equal(state.truncated, true);
  assert.throws(() => stepKiln(state, zero), /horizon/);
  const reward = state.history.at(-1)!.reward;
  near(tdTarget(reward, .9, 10, state.terminated), reward + 9);
  assert.notEqual(tdTarget(reward, .9, 10, state.truncated), reward + 9, 'using truncated as terminal would wrongly erase the future value');
  assert.ok(state.pendingAssays.length <= 1);
  assert.ok(state.materialQueue.length === 6);
});
