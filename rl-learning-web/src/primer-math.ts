import { clamp } from './labs/math';

export function binaryMoments(p: number, good: number, bad: number) {
  const probability = clamp(p, 0, 1);
  const expected = probability * good + (1 - probability) * bad;
  const variance = probability * (good - expected) ** 2 + (1 - probability) * (bad - expected) ** 2;
  return { expected, variance, goodContribution: probability * good, badContribution: (1 - probability) * bad };
}

export function probabilityTree(hardPrior: number, recoverHard: number, recoverNormal: number) {
  const p = clamp(hardPrior, 0, 1), h = clamp(recoverHard, 0, 1), n = clamp(recoverNormal, 0, 1);
  const recovery = p * h + (1 - p) * n;
  const failed = 1 - recovery;
  return { recovery, failed, hardAndFailed: p * (1 - h), hardGivenFailed: failed > 1e-12 ? p * (1 - h) / failed : null };
}

export function gradientStep(theta: number, rate: number, x = 2, target = 3) {
  const prediction = theta * x;
  const loss = 0.5 * (prediction - target) ** 2;
  const gradient = (prediction - target) * x;
  const nextTheta = theta - rate * gradient;
  const nextPrediction = nextTheta * x;
  return { prediction, loss, gradient, nextTheta, nextPrediction, nextLoss: 0.5 * (nextPrediction - target) ** 2 };
}

export function temperatureTransition(action: number, measured = 879, currentSetpoint = 880) {
  const normalized = clamp(action, -1, 1);
  const delta = normalized * 2;
  const candidate = currentSetpoint + delta;
  return { normalized, delta, candidate, nextMeasured: measured + 0.2 * (candidate - measured) };
}

