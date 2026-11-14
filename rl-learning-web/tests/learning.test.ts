import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { chapters } from '../src/content/index';
import { chapterGuides, guideToMarkdown } from '../src/content/guides';
import { primerUnits } from '../src/content/primer';
import { glossary } from '../src/content/glossary';
import { researchBody } from '../src/content/research';
import { buildBook } from '../scripts/export-book';
import { binaryMoments, probabilityTree, gradientStep, temperatureTransition } from '../src/primer-math';
import { searchLearning } from '../src/search';

const near = (actual: number, expected: number, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, received ${actual}`);
};

test('each chapter has a complete cement derivation and feedback for every answer', t => {
  assert.deepEqual(chapterGuides.map(guide => guide.chapterId), chapters.map(chapter => chapter.id));
  let steps = 0;
  for (const guide of chapterGuides) {
    assert.ok(guide.scenario && guide.decisionQuestion && guide.intuition && guide.takeaway);
    assert.ok(guide.symbols.length > 0, `guide ${guide.chapterId} needs a symbol explanation`);
    assert.ok(guide.steps.length >= 5, `guide ${guide.chapterId} must not skip the intermediate reasoning`);
    for (const step of guide.steps) {
      assert.ok(step.title && step.explanation && step.example && step.why, `incomplete step in ${guide.chapterId}`);
      steps++;
    }
    const { question, options, correctIndex, feedback } = guide.checkpoint;
    assert.ok(question && options.length >= 3);
    assert.equal(feedback.length, options.length);
    assert.ok(Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length);
    assert.equal(new Set(options).size, options.length);
    assert.ok(feedback.every(message => message.trim().length > 0));
  }
  t.diagnostic(`Validated ${chapterGuides.length} guides, ${steps} steps and individual answer explanations.`);
});

test('the complete book includes all interactive steps and new study material', () => {
  const book = buildBook('public');
  for (const guide of chapterGuides) {
    const markdown = guideToMarkdown(guide);
    for (const step of guide.steps) {
      assert.ok(markdown.includes(step.explanation));
      assert.ok(markdown.includes(step.example));
      assert.ok(markdown.includes(step.why));
      // Heading levels and internal links change in the book, formula source must not.
      if (step.formula) assert.ok(book.includes(step.formula));
      assert.ok(book.includes(step.title));
    }
    assert.ok(book.includes(guide.checkpoint.question));
    for (const feedback of guide.checkpoint.feedback) assert.ok(book.includes(feedback));
  }
  assert.equal(primerUnits.length, 8);
  for (const unit of primerUnits) assert.ok(book.includes(`<a id="math-${unit.id}"></a>`));
  assert.ok(book.includes('<a id="research"></a>'));
  assert.ok(researchBody.includes('PG-MOEA'));
  for (const entry of glossary) {
    assert.ok(book.includes(entry.meaning));
    assert.ok(chapters.some(chapter => chapter.id === entry.chapter));
  }
});

test('exported symbol tables keep names and meanings beside TeX norm delimiters', () => {
  for (const guide of chapterGuides) {
    const table = marked.lexer(guideToMarkdown(guide)).find(token => token.type === 'table');
    assert.ok(table && table.type === 'table', `guide ${guide.chapterId} needs its symbol table`);
    assert.equal(table.rows.length, guide.symbols.length);
    for (const [index,row] of table.rows.entries()) {
      assert.equal(row.length, 3, `broken table columns in guide ${guide.chapterId}`);
      assert.equal(row[1].text, guide.symbols[index].name);
      assert.equal(row[2].text, guide.symbols[index].meaning);
    }
  }
});

test('conditional probability recovers the worked 100-record example', () => {
  const result = probabilityTree(40 / 100, 20 / 40, 50 / 60);
  near(result.recovery, 70 / 100);
  near(result.failed, 30 / 100);
  near(result.hardAndFailed, 20 / 100);
  near(result.hardGivenFailed!, 20 / 30);
  assert.equal(probabilityTree(0.4, 1, 1).hardGivenFailed, null, 'an impossible conditioning event has no posterior');
});

test('expected reward, variance and the action switch threshold agree', () => {
  const moments = binaryMoments(0.7, 3, -2);
  near(moments.expected, 1.5);
  near(moments.variance, 5.25);
  near(moments.goodContribution + moments.badContribution, moments.expected);
  near(binaryMoments(0.4, 3, -2).expected, 0);
  assert.ok(binaryMoments(0.39, 3, -2).expected < 0);
  assert.ok(binaryMoments(0.41, 3, -2).expected > 0);
  near(binaryMoments(0.5, -4, 8).variance, 36);
});

test('gradient calculator matches a finite-difference derivative and reveals overshoot', () => {
  const result = gradientStep(0.5, 0.1);
  near(result.prediction, 1);
  near(result.loss, 2);
  near(result.gradient, -4);
  near(result.nextTheta, 0.9);
  near(result.nextLoss, 0.72);
  const epsilon = 1e-5;
  const numerical = (gradientStep(0.5 + epsilon, 0).loss - gradientStep(0.5 - epsilon, 0).loss) / (2 * epsilon);
  near(result.gradient, numerical, 1e-8);
  assert.ok(gradientStep(0.5, 0.6).nextLoss > result.loss, 'a large learning rate increases this quadratic loss');
});

test('a normalized kiln action changes the setpoint before the measured temperature', () => {
  const result = temperatureTransition(0.5, 879, 880);
  near(result.delta, 1);
  near(result.candidate, 881);
  near(result.nextMeasured, 879.4);
  assert.notEqual(result.nextMeasured, result.candidate);
  near(temperatureTransition(5).delta, 2, 1e-12);
  near(temperatureTransition(-5).delta, -2, 1e-12);
});

test('search prioritizes a named algorithm and includes new learning destinations', () => {
  assert.equal(searchLearning('PPO')[0]?.href, '#/chapter/15');
  assert.ok(searchLearning('条件概率').some(result => result.href === '#/primer/probability'));
  assert.ok(searchLearning('SP PV').some(result => result.href === '#/kiln'));
  assert.ok(searchLearning('OAM-Net').some(result => result.href === '#/research/agenda'));
  assert.ok(searchLearning('词典').some(result => result.href === '#/glossary'));
  assert.deepEqual(searchLearning('  '), []);
  assert.deepEqual(searchLearning('zz-no-matching-lecture-zz'), []);
});
