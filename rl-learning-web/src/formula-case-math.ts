/** Small deterministic calculations for worked examples, never plant control. */
import { clamp, discountedReturns, generalizedAdvantage, ppoObjective, tdTarget } from './labs/math';
import { constraintCosts, RATE, REWARD_REFERENCE, SP_HIGH, SP_LOW, TRACKING } from './kiln/math';

function finite(...values: number[]): void {
  if (!values.every(Number.isFinite)) throw new RangeError('All inputs must be finite.');
}
function interval(value: number, low: number, high: number): void {
  finite(value);
  if (value < low || value > high) throw new RangeError(`Expected a value in [${low}, ${high}].`);
}

export function returnCase(rewards: readonly number[], gamma: number, tailValue: number, terminated: boolean) {
  if (!rewards.length) throw new RangeError('At least one reward is required.');
  finite(...rewards, tailValue); interval(gamma, 0, 1);
  const terms = rewards.map((reward, index) => gamma ** index * reward);
  const observed = terms.reduce((sum, term) => sum + term, 0);
  const tail = terminated ? 0 : gamma ** rewards.length * tailValue;
  const returns = discountedReturns([...rewards], gamma, terminated ? 0 : tailValue);
  return { terms, observed, tail, target: returns[0]!, returns };
}

export function bellmanCase(probability: number, rewardA: number, rewardB: number, valueA: number, valueB: number, gamma: number) {
  interval(probability, 0, 1); interval(gamma, 0, 1); finite(rewardA, rewardB, valueA, valueB);
  const branchA = rewardA + gamma * valueA;
  const branchB = rewardB + gamma * valueB;
  const contributionA = probability * branchA;
  const contributionB = (1 - probability) * branchB;
  return { branchA, branchB, contributionA, contributionB, target: contributionA + contributionB };
}

export type TDMethod = 'td' | 'sarsa' | 'q-learning';
export function tdCase(input: { reward: number; gamma: number; current: number; nextA: number; nextB: number; rate: number; method: TDMethod; selectedNext: number; terminated: boolean }) {
  const { reward, gamma, current, nextA, nextB, rate, method, selectedNext, terminated } = input;
  finite(reward, current, nextA, nextB); interval(gamma, 0, 1); interval(rate, 0, 1);
  if (selectedNext !== 0 && selectedNext !== 1) throw new RangeError('Unknown next action.');
  if (!['td', 'sarsa', 'q-learning'].includes(method)) throw new RangeError('Unknown TD method.');
  const next = method === 'td' ? nextA : method === 'sarsa' ? [nextA, nextB][selectedNext]! : Math.max(nextA, nextB);
  const target = tdTarget(reward, gamma, next, terminated);
  const error = target - current;
  return { next, target, error, change: rate * error, updated: current + rate * error };
}

export function gaeCase(rewards: readonly number[], values: readonly number[], gamma: number, lambda: number, terminated: boolean) {
  if (!rewards.length || values.length !== rewards.length + 1) throw new RangeError('GAE needs one more value than rewards.');
  finite(...rewards, ...values); interval(gamma, 0, 1); interval(lambda, 0, 1);
  const ends = rewards.map((_, index) => index === rewards.length - 1);
  const terminals = ends.map(end => end && terminated);
  const deltas = rewards.map((reward, index) => tdTarget(reward, gamma, values[index + 1]!, terminals[index]!) - values[index]!);
  // A collector boundary always ends the trace; a timeout does not erase V(s_H).
  const advantages = generalizedAdvantage([...rewards], [...values], gamma, lambda, terminals, ends);
  const contributions = deltas.map((delta, index) => (gamma * lambda) ** index * delta);
  return { deltas, advantages, contributions, valueTargets: advantages.map((advantage, index) => advantage + values[index]!) };
}

export function ppoCase(oldProbability: number, newProbability: number, advantage: number, epsilon: number) {
  interval(oldProbability, Number.MIN_VALUE, 1); interval(newProbability, 0, 1);
  interval(epsilon, 0, 1); finite(advantage);
  const ratio = newProbability / oldProbability;
  if (!Number.isFinite(ratio)) throw new RangeError('Probability ratio overflows.');
  const clippedRatio = clamp(ratio, 1 - epsilon, 1 + epsilon);
  const raw = ratio * advantage, clipped = clippedRatio * advantage;
  const objective = ppoObjective(ratio, advantage, epsilon);
  return { ratio, clippedRatio, raw, clipped, objective, loss: -objective, clippingActive: clipped < raw };
}

export function sacCase(reward: number, gamma: number, q1: number, q2: number, logProbability: number, alpha: number, terminated: boolean) {
  finite(reward, q1, q2, logProbability, alpha); interval(gamma, 0, 1);
  if (alpha < 0) throw new RangeError('Entropy temperature must be nonnegative.');
  const minimumQ = Math.min(q1, q2), entropyTerm = -alpha * logProbability;
  const softNext = minimumQ + entropyTerm;
  return { minimumQ, entropyTerm, softNext, bootstrap: terminated ? 0 : gamma * softNext, target: tdTarget(reward, gamma, softNext, terminated) };
}

export function cqlCase(qValues: readonly number[], observedAction: number, alpha: number, bellmanTarget: number) {
  if (!qValues.length || !Number.isInteger(observedAction) || observedAction < 0 || observedAction >= qValues.length) throw new RangeError('Observed action must index the action table.');
  finite(...qValues, alpha, bellmanTarget);
  if (alpha < 0) throw new RangeError('Regularization weight must be nonnegative.');
  const maximum = Math.max(...qValues);
  const shifted = qValues.map(value => Math.exp(value - maximum));
  const sum = shifted.reduce((a, b) => a + b, 0);
  const logSumExp = maximum + Math.log(sum), observedQ = qValues[observedAction]!;
  // Compute the shift-invariant difference directly: avoid cancellation for large Q.
  const gap = (maximum - observedQ) + Math.log(sum);
  const conservativeTerm = alpha * gap;
  const tdLoss = .5 * (observedQ - bellmanTarget) ** 2;
  return { maximum, shifted, logSumExp, observedQ, gap, conservativeTerm, tdLoss, total: conservativeTerm + tdLoss, regularizerGradient: shifted.map((value, index) => alpha * (value / sum - Number(index === observedAction))) };
}

export function setpointCase(action: number, setpoint: number, measured: number, gatesAccepted: boolean) {
  interval(action, -1, 1); interval(setpoint, SP_LOW[0], SP_HIGH[0]); finite(measured);
  const requestedDelta = action * RATE[0], candidate = setpoint + requestedDelta;
  const withinBounds = candidate >= SP_LOW[0] && candidate <= SP_HIGH[0];
  const accepted = gatesAccepted && withinBounds;
  const executedAction = accepted ? action : 0;
  const delta = executedAction * RATE[0], nextSetpoint = setpoint + delta;
  const response = TRACKING[0] * (nextSetpoint - measured);
  return { requestedDelta, candidate, withinBounds, accepted, executedAction, delta, nextSetpoint, response, nextMeasured: measured + response };
}

export function energyCase(input: { coal: number; electric: number; action: number; previousAction: number; coalWeight: number; electricWeight: number; smoothWeight: number; quality: number; oxygen: number }) {
  finite(...Object.values(input)); interval(input.action, -1, 1); interval(input.previousAction, -1, 1);
  if (Math.min(input.coalWeight, input.electricWeight, input.smoothWeight) < 0) throw new RangeError('Weights must be nonnegative.');
  const coalZ = (input.coal - REWARD_REFERENCE.coal) / REWARD_REFERENCE.coalScale;
  const electricZ = (input.electric - REWARD_REFERENCE.electric) / REWARD_REFERENCE.electricScale;
  const coalTerm = -input.coalWeight * coalZ, electricTerm = -input.electricWeight * electricZ;
  const actionSquare = input.action ** 2, changeSquare = (input.action - input.previousAction) ** 2;
  const smoothTerm = -input.smoothWeight * (actionSquare + changeSquare);
  const costs = constraintCosts(input.quality, input.oxygen);
  return { coalZ, electricZ, coalTerm, electricTerm, actionSquare, changeSquare, smoothTerm, reward: coalTerm + electricTerm + smoothTerm, ...costs };
}

export function lagrangianCase(input: { rewardA: number; rewardB: number; costA: number; costB: number; budget: number; multiplier: number; rate: number; currentPolicy: number }) {
  finite(...Object.values(input));
  if (Math.min(input.costA, input.costB, input.budget, input.multiplier, input.rate) < 0) throw new RangeError('Costs, budget, multiplier and rate must be nonnegative.');
  interval(input.multiplier, 0, 100);
  if (input.currentPolicy !== 0 && input.currentPolicy !== 1) throw new RangeError('Unknown current policy.');
  const scoreA = input.rewardA - input.multiplier * (input.costA - input.budget);
  const scoreB = input.rewardB - input.multiplier * (input.costB - input.budget);
  const relaxedWinner = scoreA === scoreB ? 'tie' : scoreA > scoreB ? 'A' : 'B';
  const feasibleA = input.costA <= input.budget, feasibleB = input.costB <= input.budget;
  const feasibleWinner = !feasibleA && !feasibleB ? 'none' : !feasibleA ? 'B' : !feasibleB ? 'A' : input.rewardA === input.rewardB ? 'tie' : input.rewardA > input.rewardB ? 'A' : 'B';
  const violation = (input.currentPolicy === 0 ? input.costA : input.costB) - input.budget;
  const nextMultiplier = clamp(input.multiplier + input.rate * violation, 0, 100);
  return { scoreA, scoreB, relaxedWinner, feasibleA, feasibleB, feasibleWinner, violation, nextMultiplier };
}
