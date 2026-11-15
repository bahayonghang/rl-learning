import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { loadContentBundle, activateContent } from '../src/content/localized';
import { formulaCases } from '../src/formula-cases';
import { researchPages } from '../src/research/content';
import { setLocale, type Locale } from '../src/i18n';
import { chapterProgress, findLearningPath, getLearningPaths, getStudyPlan, studyChecklist } from '../src/learning-paths';
import { renderLearningPathCards, renderLearningPathDetail } from '../src/learning-path-view';

async function edition(locale: Locale) {
  const bundle = await loadContentBundle(locale);
  activateContent(bundle);
  setLocale(locale);
  return bundle;
}

test('entry sessions link to real resources and retain the same prerequisites across editions', async () => {
  const routesByEdition: string[][] = [];
  for (const locale of ['zh-CN', 'en'] as const) {
    const bundle = await edition(locale);
    const paths = getLearningPaths();
    assert.deepEqual(paths.map(path => path.id), ['ml', 'control', 'rl']);
    routesByEdition.push(paths.flatMap(path => path.steps.map(step => step.href)));
    for (const path of paths) {
      assert.ok(path.prerequisite && path.outcome && path.description);
      assert.ok(path.steps.every(step => Number.isFinite(step.minutes) && step.minutes > 0));
      for (const step of path.steps) {
        if (step.kind === 'primer') assert.ok(bundle.primerUnits.some(unit => unit.id === step.id), step.href);
        if (step.kind === 'case') assert.ok(formulaCases.some(item => item.id === step.id), step.href);
        if (step.kind === 'research') assert.ok(researchPages.some(page => page.id === step.id && page.minutes === step.minutes), step.href);
        if (step.kind === 'kiln') assert.equal(step.href, '#/kiln');
      }
      for (const id of path.chapterIds) {
        const chapter = bundle.chapters.find(chapter => chapter.id === id);
        assert.ok(chapter, `${path.id}: ${id}`);
        assert.ok(chapter.prerequisites.every(pre => bundle.chapters.some(item => item.id === pre)));
      }
      if (locale === 'en') assert.doesNotMatch([path.title, path.description, path.prerequisite, path.outcome, ...path.steps.flatMap(step => [step.title, step.outcome])].join('\n'), /[\u3400-\u9fff]/u);
    }
  }
  assert.deepEqual(routesByEdition[0], routesByEdition[1]);
  assert.equal(findLearningPath('rl')!.firstSessionMinutes, 85);
  assert.equal(findLearningPath('not-a-path'), undefined);
  await edition('zh-CN');
});

test('path completion counts only unique manually marked known chapters', async () => {
  await edition('zh-CN');
  const completed = ['01', '01', '19', '24', 'unknown'];
  assert.deepEqual(chapterProgress(completed), { completed: 3, total: 24 });
  assert.deepEqual(chapterProgress(completed, findLearningPath('ml')!.chapterIds), { completed: 1, total: 8 });
  assert.deepEqual(chapterProgress(completed, findLearningPath('rl')!.chapterIds), { completed: 2, total: 6 });
  assert.deepEqual(chapterProgress(completed, ['01', '01', 'unknown']), { completed: 1, total: 1 });
  assert.deepEqual(completed, ['01', '01', '19', '24', 'unknown']);
});

test('both schedules cover all chapters exactly once and exports reflect the selected schedule and edition', async () => {
  for (const locale of ['zh-CN', 'en'] as const) {
    const bundle = await edition(locale);
    for (const weeks of [6, 8] as const) {
      const plan = getStudyPlan(weeks);
      assert.equal(plan.length, weeks);
      assert.deepEqual(plan.flatMap(week => week.chapterIds), bundle.chapters.map(chapter => chapter.id));
      assert.equal(plan.reduce((total, week) => total + week.readingMinutes, 0), bundle.chapters.reduce((total, chapter) => total + chapter.duration, 0));
      const output = studyChecklist(weeks, ['01', '21'], 'control');
      assert.ok(output.startsWith(locale === 'en' ? `# RL Atlas · ${weeks}-week study checklist` : `# RL Atlas · ${weeks} 周学习清单`));
      assert.equal((output.match(/^- \[[ x]\]/gm) ?? []).length, 24);
      assert.equal((output.match(/^- \[x\]/gm) ?? []).length, 2);
      assert.ok(output.includes(bundle.chapters[0].title));
      assert.ok(output.includes(findLearningPath('control')!.title));
      if (locale === 'en') assert.doesNotMatch(output, /[\u3400-\u9fff]/u);
    }
  }
  await edition('zh-CN');
});

test('entry cards and detail expose real links, prior knowledge and original chapter prerequisites', async () => {
  for (const locale of ['zh-CN', 'en'] as const) {
    const bundle = await edition(locale);
    const cards = JSDOM.fragment(renderLearningPathCards());
    assert.equal(cards.querySelectorAll('a.learning-path-card').length, 3);
    assert.equal(cards.querySelectorAll('a a').length, 0);
    assert.equal(cards.querySelectorAll('h1').length, 0);
    for (const path of getLearningPaths()) {
      assert.ok(cards.querySelector(`a[href="#/roadmap/${path.id}"]`));
      const detail = JSDOM.fragment(renderLearningPathDetail(path.id, ['01', '21']));
      assert.equal(detail.querySelectorAll('.path-session-steps a').length, path.steps.length);
      assert.ok(detail.textContent?.includes(path.prerequisite));
      assert.ok(detail.textContent?.includes(path.outcome));
      for (const id of path.chapterIds) {
        const chapter = bundle.chapters.find(chapter => chapter.id === id)!;
        assert.ok(detail.querySelector(`.path-chapter-link[href="#/chapter/${id}"]`));
        for (const pre of chapter.prerequisites) assert.ok(detail.querySelector(`.path-chapter-prerequisites a[href="#/chapter/${pre}"]`));
      }
    }
  }
  assert.equal(renderLearningPathDetail('missing', []), '');
  await edition('zh-CN');
});
