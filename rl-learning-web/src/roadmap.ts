import { chapters } from './content/localized';
import { conceptPlateReference } from './concept-plates';
import { escapeHtml as esc } from './html';
import { text as t, editionFilename } from './i18n';
import { chapterProgress, findLearningPath, getLearningPaths, getStudyPlan, studyChecklist, type StudyWeeks } from './learning-paths';
import { renderLearningPathCards, renderLearningPathDetail } from './learning-path-view';
import { downloadFile, renderMarkdown } from './render';
import { icon, pageHeading, refreshIcons } from './ui';
import './learning-paths.css';

export async function renderRoadmapPage(host: HTMLElement, pathId: string, completed: readonly string[]): Promise<void> {
  const selectedPath = findLearningPath(pathId);
  const progress = chapterProgress(completed);
  let weeks: StudyWeeks = 8;
  host.innerHTML = `${pageHeading(t('学习入口与安排', 'ENTRY PATHS & STUDY PLAN'), t('从这里开始', 'Start here'), t('选择与你已有基础相符的起点，再沿先修关系学习。用六到八周串起数学、算法与工业决策。', 'Choose an entry point that fits your background, then follow the prerequisites. Connect mathematics, algorithms and industrial decisions over six to eight weeks.'))}
    <section class="roadmap-progress" aria-labelledby="roadmap-progress-title"><div><h2 id="roadmap-progress-title">${t('章节完成记录', 'Chapter completion')}</h2><p>${t('仅当前浏览器的手动标记；打开一页不会自动计入。', 'Manual marks in this browser only; opening a page does not count.')}</p></div><div class="roadmap-progress-value"><strong>${progress.completed}<span> / ${progress.total}</span></strong><progress value="${progress.completed}" max="${progress.total}" aria-label="${t(`已手动完成 ${progress.completed} / ${progress.total} 章`, `${progress.completed} of ${progress.total} chapters manually completed`)}"></progress></div><a href="#/curriculum" class="text-link">${t('查看课程目录', 'Open the curriculum')}${icon('ArrowRight')}</a></section>
    ${selectedPath ? `<nav class="path-switcher" aria-label="${t('选择已有基础', 'Choose your background')}">${getLearningPaths().map(path => `<a href="#/roadmap/${path.id}" ${selectedPath.id === path.id ? 'aria-current="page"' : ''}>${icon(path.icon)}${esc(path.shortTitle)}</a>`).join('')}</nav>${renderLearningPathDetail(selectedPath.id, completed)}` : `<section class="roadmap-entry" aria-labelledby="roadmap-entry-title"><div class="section-heading"><div><h2 id="roadmap-entry-title">${t('从你的已有基础开始', 'Start from what you know')}</h2><p>${t('每条入口都给出第一轮活动、预备知识与具体产出。', 'Each entry includes a first session, prerequisites and a concrete outcome.')}</p></div></div>${pathId ? `<p class="path-invalid" role="status">${t('未找到这个学习入口，请从下面三条路径中选择。', 'This entry path was not found. Choose one of the three paths below.')}</p>` : ''}${renderLearningPathCards()}</section>`}
    <section class="roadmap-schedule" aria-labelledby="roadmap-schedule-title"><header class="roadmap-schedule-header"><div><span class="eyebrow">${t('完整课程安排', 'THE FULL COURSE')}</span><h2 id="roadmap-schedule-title">${t('把学习变成每周可检查的产出', 'Turn study into weekly outcomes you can check')}</h2><p>${t(`${chapters.length} 章覆盖完整主线。每周 8–12 小时仅作参考；六周计划会合并部分阶段，练习、推导与实验需额外留出时间。`, `${chapters.length} chapters cover the full sequence. Eight to twelve hours per week is a guide; the six-week schedule combines stages. Allow additional time for exercises, derivations and experiments.`)}</p></div><div class="roadmap-schedule-actions"><div class="segmented" role="group" aria-label="${t('选择学习计划', 'Choose study plan')}"><button type="button" data-weeks="8" class="selected" aria-pressed="true">${t('8 周稳步', '8 weeks')}</button><button type="button" data-weeks="6" aria-pressed="false">${t('6 周集中', '6 weeks')}</button></div><button class="button outline" type="button" data-export-plan>${icon('Download')}${t('下载当前学习清单', 'Download this study checklist')}</button></div></header><p class="roadmap-schedule-status" role="status" data-schedule-status></p><div id="weekly-plan" class="weekly-plan"></div></section>
    <details class="roadmap-concept"><summary>${icon('Network')}${t('查看全课程知识关系图', 'View the full-course concept map')}${icon('ChevronDown')}</summary><div class="prose" id="roadmap-diagram"></div></details>
    <section class="roadmap-study-method"><h2>${t('每个阶段，留下四项证据', 'Keep four pieces of evidence from each stage')}</h2><ul><li>${t('用自己的话解释一个原理。', 'Explain a principle in your own words.')}</li><li>${t('独立手算一个最小例子。', 'Calculate a minimal example independently.')}</li><li>${t('在实验中复现一次数值变化。', 'Reproduce a numerical change in an experiment.')}</li><li>${t('指出一个失败条件或适用边界。', 'Identify a failure condition or a boundary.')}</li></ul><a class="text-link" href="#/research/agenda">${t('最终形成一个可被证伪的研究方案', 'Finish with a falsifiable research proposal')}${icon('ArrowRight')}</a></section>`;

  const drawSchedule = () => {
    host.querySelector<HTMLElement>('[data-schedule-status]')!.textContent = t(`当前为 ${weeks} 周计划；下载将包含该安排${selectedPath ? '与所选入口' : ''}。`, `Showing the ${weeks}-week plan. Your download includes this schedule${selectedPath ? ' and the selected entry path' : ''}.`);
    host.querySelector('#weekly-plan')!.innerHTML = getStudyPlan(weeks).map(week => `<a class="week-card" href="#/chapter/${week.chapterIds[0]}"><div><span>${t('周次', 'WEEK')}</span><b>${String(week.week).padStart(2, '0')}</b></div><section><small>${t(`第 ${week.range} 章`, `Chapters ${week.range}`)}</small><h3>${esc(week.title)}</h3><p>${esc(week.outcome)}</p><span class="week-reading-time">${t(`阅读估计合计 ${week.readingMinutes} 分钟 · 练习另计`, `Reading estimate: ${week.readingMinutes} min · plus practice`)}</span></section>${icon('ArrowRight')}</a>`).join('');
    refreshIcons();
  };
  host.querySelectorAll<HTMLButtonElement>('[data-weeks]').forEach(button => button.addEventListener('click', () => {
    weeks = button.dataset.weeks === '6' ? 6 : 8;
    host.querySelectorAll<HTMLButtonElement>('[data-weeks]').forEach(other => {
      const active = other === button;
      other.classList.toggle('selected', active);
      other.setAttribute('aria-pressed', String(active));
    });
    drawSchedule();
  }));
  host.querySelector('[data-export-plan]')!.addEventListener('click', () => downloadFile(editionFilename(`rl-atlas-study-checklist-${weeks}-weeks`), studyChecklist(weeks, completed, selectedPath?.id)));
  drawSchedule();
  await renderMarkdown(host.querySelector('#roadmap-diagram')!, conceptPlateReference('roadmap-learning'));
}
