import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { marked } from 'marked';
import { bellmanCase, cqlCase, energyCase, gaeCase, lagrangianCase, ppoCase, returnCase, sacCase, setpointCase, tdCase } from '../src/formula-case-math';
import { chapterFormulaCasesMarkdown, defaultFormulaValues, evaluateFormulaCase, formulaCaseIds, formulaCaseMarkdown, formulaCases, getFormulaCases, researchFormulaCasesMarkdown } from '../src/formula-cases';
import { rewardDecomposition } from '../src/kiln/math';
import { getLocale, setLocale, type Locale } from '../src/i18n';
import { chapters } from '../src/content/index';
import { researchPages } from '../src/research/content';

const close = (actual: number, expected: number, epsilon = 1e-10) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} ≠ ${expected}`);

test('three-step return uses the correct reward powers and preserves timeout bootstrapping', () => {
  const result = returnCase([-1, 2, 3], .9, 4, false);
  close(result.observed, 3.23); close(result.tail, 2.916); close(result.target, 6.146);
  close(returnCase([-1, 2, 3], .9, 400, true).target, 3.23);
  close(returnCase([-1, 2, 3], 0, 400, false).target, -1);
  close(returnCase([-1, 2, 3], 1, 4, false).target, 8);
});

test('Bellman expectation is a weighted backup for a fixed action, including zero-probability branches', () => {
  const result = bellmanCase(.7, 3, -2, 5, 1, .9);
  close(result.branchA, 7.5); close(result.branchB, -1.1);
  close(result.contributionA, 5.25); close(result.contributionB, -.33); close(result.target, 4.92);
  close(bellmanCase(1, 3, -2, 5, 1, .9).target, 7.5);
  close(bellmanCase(.7, 3, -2, 5, 1, 0).target, 1.5);
});

test('TD, SARSA and Q-learning select distinct bootstrap values but share terminal semantics', () => {
  const input = { reward: -1, gamma: .9, current: 2, nextA: 4, nextB: 1, rate: .2, selectedNext: 1, terminated: false };
  const sarsa = tdCase({ ...input, method: 'sarsa' }), q = tdCase({ ...input, method: 'q-learning' });
  close(sarsa.target, -.1); close(sarsa.error, -2.1); close(sarsa.updated, 1.58);
  close(q.target, 2.6); close(q.updated, 2.12);
  close(tdCase({ ...input, method: 'td' }).target, 2.6);
  for (const method of ['td', 'sarsa', 'q-learning'] as const) close(tdCase({ ...input, method, terminated: true }).updated, 1.4);
});

test('GAE separates the final bootstrap from the stopped trace and has correct lambda endpoints', () => {
  const rewards = [1, 0, 2], values = [.5, 1, 1.5, 2];
  const result = gaeCase(rewards, values, .9, .8, false);
  [1.4, .35, 2.3].forEach((value, index) => close(result.deltas[index]!, value));
  [2.84432, 2.006, 2.3].forEach((value, index) => close(result.advantages[index]!, value));
  gaeCase(rewards, values, .9, 0, false).advantages.forEach((value, index) => close(value, result.deltas[index]!));
  close(gaeCase(rewards, values, .9, 1, false).advantages[0]!, 3.578);
  close(gaeCase(rewards, values, .9, 1, true).advantages[0]!, 2.12);
  close(gaeCase(rewards, values, .9, .8, true).deltas[2]!, .5);
});

test('PPO clips only the improving side and reverses that side for negative advantages', () => {
  const positive = ppoCase(.2, .3, 2, .2), negative = ppoCase(.2, .1, -2, .2);
  close(positive.ratio, 1.5); close(positive.objective, 2.4); assert.equal(positive.clippingActive, true);
  close(negative.objective, -1.6); assert.equal(negative.clippingActive, true);
  const harmfulPositive = ppoCase(.2, .1, 2, .2), harmfulNegative = ppoCase(.2, .3, -2, .2);
  close(harmfulPositive.objective, 1); assert.equal(harmfulPositive.clippingActive, false);
  close(harmfulNegative.objective, -3); assert.equal(harmfulNegative.clippingActive, false);
  close(ppoCase(.2, 0, 0, .2).objective, 0);
  assert.throws(() => ppoCase(0, .3, 2, .2), RangeError);
});

test('SAC accepts positive continuous log density and masks the whole future term only on termination', () => {
  const result = sacCase(1, .99, 5, 6, -1.2, .2, false);
  close(result.entropyTerm, .24); close(result.softNext, 5.24); close(result.target, 6.1876);
  close(sacCase(1, .99, 5, 6, .5, .2, false).target, 5.851);
  close(sacCase(1, .99, 5, 6, -1.2, .2, true).target, 1);
  close(sacCase(1, .99, 5, 6, -1.2, 0, false).target, 5.95);
});

test('discrete CQL is stable under a large common Q shift and has the expected regularizer gradient', () => {
  const result = cqlCase([1, 4, 0], 0, 1, 1.5), shifted = cqlCase([1001, 1004, 1000], 0, 1, 1001.5);
  close(result.gap, 3.0658839037574293); close(result.tdLoss, .125); close(result.total, 3.1908839037574293);
  close(result.gap, shifted.gap); close(result.total, shifted.total);
  close(cqlCase([1, 4, 0], 0, 0, 1.5).total, .125);
  close(cqlCase([0, 0, 0], 0, 1, 0).gap, Math.log(3));
  close(result.regularizerGradient.reduce((a, b) => a + b, 0), 0);
  assert.ok(result.regularizerGradient[0]! < 0 && result.regularizerGradient[1]! > 0);
  const step = 1e-5;
  close((cqlCase([1, 4 + step, 0], 0, 1, 1.5).conservativeTerm - cqlCase([1, 4 - step, 0], 0, 1, 1.5).conservativeTerm) / (2 * step), result.regularizerGradient[1]!, 1e-8);
});

test('a rejected setpoint action holds SP while the teaching PV keeps tracking', () => {
  const accepted = setpointCase(.5, 880, 879, true), rejected = setpointCase(.5, 880, 879, false);
  close(accepted.nextSetpoint, 881); close(accepted.nextMeasured, 879.56);
  close(rejected.delta, 0); close(rejected.nextSetpoint, 880); close(rejected.nextMeasured, 879.28);
  const bounded = setpointCase(1, 900, 899, true);
  assert.equal(bounded.withinBounds, false); close(bounded.nextSetpoint, 900); close(bounded.nextMeasured, 899.28);
});

test('energy reward agrees with the existing kernel while quality and oxygen stay separate', () => {
  const input = { coal: 130, electric: 25.5, action: .5, previousAction: 0, coalWeight: .6, electricWeight: .4, smoothWeight: .05, quality: 1, oxygen: 1.8 };
  const result = energyCase(input), violation = energyCase({ ...input, quality: 1.8, oxygen: 1.05 });
  close(result.reward, .375); close(result.reward, rewardDecomposition(130, 25.5, [.5, 0, 0], [0, 0, 0]).reward);
  close(violation.reward, result.reward); close(violation.quality, .3); close(violation.oxygen, .15);
  close(energyCase({ ...input, quality: .5, oxygen: 1.2 }).quality, 0);
});

test('relaxed ranking can violate the budget and the dual update follows evaluated policy cost', () => {
  const input = { rewardA: 10, rewardB: 9, costA: .3, costB: .05, budget: .1, multiplier: 2, rate: .5, currentPolicy: 0 };
  const result = lagrangianCase(input);
  assert.equal(result.relaxedWinner, 'A'); assert.equal(result.feasibleWinner, 'B'); close(result.nextMultiplier, 2.1);
  assert.equal(lagrangianCase({ ...input, multiplier: 10 }).relaxedWinner, 'B');
  assert.equal(lagrangianCase({ ...input, costB: .2 }).feasibleWinner, 'none');
  close(lagrangianCase({ ...input, multiplier: 0, currentPolicy: 1 }).nextMultiplier, 0);
  close(lagrangianCase({ ...input, multiplier: 100 }).nextMultiplier, 100);
});

test('ten bilingual cases have valid destinations, complete worked exports and strictly renderable math', () => {
  assert.deepEqual(formulaCases.map(item => item.id), [...formulaCaseIds]);
  const knownChapters = new Set(chapters.map(item => item.id)), knownResearch = new Set(researchPages.map(item => item.id));
  let expressions = 0;
  for (const locale of ['zh-CN', 'en'] as const) for (const item of formulaCases) {
    assert.ok(item.title[locale].length && item.scenario[locale].length);
    item.chapterIds.forEach(id => assert.ok(knownChapters.has(id), `${item.id}: ${id}`));
    item.researchIds.forEach(id => assert.ok(knownResearch.has(id), `${item.id}: ${id}`));
    for (const preset of item.presets) {
      const values = { ...defaultFormulaValues(item.id), ...preset.values };
      const result = evaluateFormulaCase(item.id, values, locale);
      assert.equal(result.ok, true, `${item.id}: ${preset.id}`);
      if (!result.ok) continue;
      const formulas = [...item.formulas, ...result.presentation.steps.map(step => step.equation), ...item.fields.map(field => field.symbol).filter(Boolean)];
      formulas.forEach(formula => { assert.doesNotMatch(formula, /[\x00-\x08\x0b-\x1f]/); assert.ok(katex.renderToString(formula, { throwOnError: true, strict: 'error' })); expressions++; });
      const markdown = formulaCaseMarkdown(item.id, locale, values);
      assert.ok(markdown.includes(item.scenario[locale])); assert.doesNotMatch(markdown, /\]\(#\/cases|<a id=/);
      result.presentation.steps.forEach(step => assert.ok(markdown.includes(step.equation)));
      item.fields.forEach(field => assert.ok(markdown.includes(field.label[locale])));
      marked.walkTokens(marked.lexer(markdown), token => { if (token.type === 'table') assert.ok(token.rows.every((row: unknown[]) => row.length === token.header.length)); });
    }
  }
  assert.ok(expressions > 400);
  assert.ok(chapterFormulaCasesMarkdown('15', 'en').includes('PPO'));
  assert.ok(researchFormulaCasesMarkdown('objectives', 'zh-CN').includes('拉格朗日'));
  assert.equal(chapterFormulaCasesMarkdown('not-a-chapter', 'en'), '');
  assert.equal(formulaCaseMarkdown('not-a-case', 'en'), '');
  const customPPO = formulaCaseMarkdown('ppo-clip', 'en', { ...defaultFormulaValues('ppo-clip'), old: .8, next: .1, advantage: -2 });
  assert.ok(customPPO.includes('Starting scenario (defaults; see the input table for this calculation)'));
  assert.ok(customPPO.includes('| Old-policy action probability | 0.8 |'));
});

test('scientific-notation substitutions remain one factor when raised to a power', () => {
  for (const id of ['return-bootstrap', 'gae', 'sac-target'] as const) {
    const result = evaluateFormulaCase(id, { ...defaultFormulaValues(id), gamma: 1e-7 }, 'zh-CN');
    assert.equal(result.ok, true);
    if (!result.ok) continue;
    for (const step of result.presentation.steps) assert.ok(katex.renderToString(step.equation, { throwOnError: true, strict: 'error' }));
  }
});

test('missing, nonfinite, out-of-domain and forged option inputs never produce a stale success', () => {
  const values = defaultFormulaValues('return-bootstrap');
  for (const gamma of ['', ' ', undefined, NaN, Infinity, 'Infinity', 'wrong', -0.1, 1.1]) {
    const result = evaluateFormulaCase('return-bootstrap', { ...values, gamma }, 'en');
    assert.equal(result.ok, false); if (!result.ok) assert.ok(result.errors.gamma);
  }
  assert.equal(evaluateFormulaCase('return-bootstrap', { ...values, terminal: .5 }).ok, false);
  assert.equal(evaluateFormulaCase('ppo-clip', { ...defaultFormulaValues('ppo-clip'), old: 0 }).ok, false);
  assert.equal(evaluateFormulaCase('sac-target', { ...defaultFormulaValues('sac-target'), logp: 2 }).ok, true);
  assert.throws(() => gaeCase([1], [0], .9, .8, false), RangeError);
  assert.throws(() => cqlCase([1, 2], 3, 1, 0), RangeError);
  assert.throws(() => returnCase([NaN], .9, 1, false), RangeError);
});

test('case controls recalculate, clear invalid results, apply presets, reset and export the current snapshot', async () => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body><main id="host"></main></body></html>', { url: 'https://example.test/#/cases/return-bootstrap' });
  const oldLocale = getLocale(), saved = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ['window', 'document', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement']) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'window' ? dom.window : (dom.window as unknown as Record<string, unknown>)[key] });
  }
  const oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
  let exported: Blob | undefined;
  URL.createObjectURL = blob => { exported = blob as Blob; return 'blob:test-case'; };
  URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = () => {};
  let dispose = () => {};
  try {
    setLocale('zh-CN');
    const { mountFormulaCase, mountFormulaCasesForChapter, renderFormulaCasesPage } = await import('../src/formula-case-view');
    const host = dom.window.document.querySelector<HTMLElement>('#host')!;
    dispose = mountFormulaCase(host, 'return-bootstrap');
    const metric = () => host.querySelector<HTMLElement>('[data-metric-index="2"] strong')!.textContent;
    assert.equal(metric(), '6.146');
    const gamma = host.querySelector<HTMLInputElement>('[data-case-field="gamma"]')!;
    gamma.focus(); gamma.value = '.5'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(metric(), '1.25'); assert.equal(dom.window.document.activeElement, gamma);
    const definition = formulaCases.find(item => item.id === 'return-bootstrap')!;
    const originalPresent = definition.present;
    try {
      definition.present = (values, locale) => {
        const presentation = originalPresent(values, locale);
        return { ...presentation, steps: [{ ...presentation.steps[0]!, equation: String.raw`\invalidFormulaCommand` }] };
      };
      gamma.value = '.6'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      assert.equal(host.querySelector('[data-metric-index]'), null, 'render failure hides previously successful results');
      const download = host.querySelector<HTMLButtonElement>('[data-case-download]')!;
      assert.equal(download.disabled, true);
      assert.ok(host.querySelector('[role="alert"]')?.textContent?.includes('本次结果未能显示'));
      download.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
      assert.equal(Boolean(exported), false, 'render failure also clears the exportable input snapshot');
    } finally { definition.present = originalPresent; }
    gamma.value = '.5'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(metric(), '1.25'); assert.equal(host.querySelector<HTMLButtonElement>('[data-case-download]')!.disabled, false);
    gamma.value = ''; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(host.querySelector('[data-metric-index]'), null);
    assert.equal(gamma.getAttribute('aria-invalid'), 'true');
    assert.equal(host.querySelector<HTMLButtonElement>('[data-case-download]')!.disabled, true);
    assert.ok(host.querySelector('[role="alert"]')?.textContent?.includes('旧结果已隐藏'));
    gamma.value = '1.1'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(host.querySelector('[data-metric-index]'), null);
    host.querySelector<HTMLButtonElement>('[data-case-preset="terminal"]')!.click();
    assert.equal(metric(), '3.23'); assert.equal(gamma.value, '0.9'); assert.equal(gamma.getAttribute('aria-invalid'), 'false');
    host.querySelector<HTMLButtonElement>('[data-case-reset]')!.click();
    assert.equal(metric(), '6.146');
    gamma.value = '.5'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    host.querySelector<HTMLButtonElement>('[data-case-download]')!.click();
    assert.ok(exported); const markdown = await exported!.text();
    assert.ok(markdown.includes('1.25')); assert.ok(markdown.includes('| 折扣因子 | 0.5 |'));
    dispose();
    const previous = metric(); gamma.value = '.2'; gamma.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(metric(), previous, 'cleanup removes calculation listeners');
    dispose = mountFormulaCasesForChapter(host, '01');
    const selector = host.querySelector<HTMLSelectElement>('[data-context-case]')!;
    assert.ok(selector); selector.value = 'setpoint-response'; selector.dispatchEvent(new dom.window.Event('change'));
    assert.ok(host.querySelector('[data-formula-case="setpoint-response"]'));
    dispose(); setLocale('en');
    for (const item of getFormulaCases()) {
      dispose = mountFormulaCase(host, item.id);
      assert.ok(host.querySelector('.katex')); assert.ok(host.querySelector('[data-metric-index]'));
      assert.match(host.textContent ?? '', /Reset case/); dispose();
    }
    dispose = renderFormulaCasesPage(host);
    const search = host.querySelector<HTMLInputElement>('input[type=search]')!;
    search.value = 'PPO:'; search.dispatchEvent(new dom.window.Event('input'));
    assert.equal(host.querySelectorAll('.formula-case-card').length, 1);
    assert.equal(host.querySelector('.formula-case-card')!.getAttribute('href'), '#/cases/ppo-clip');
  } finally {
    dispose(); setLocale(oldLocale); URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke;
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
    dom.window.close();
  }
});
