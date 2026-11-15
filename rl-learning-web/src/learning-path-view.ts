import { getChapter } from './content/localized';
import { escapeHtml as esc } from './html';
import { text as t, levelLabel } from './i18n';
import { chapterProgress, findLearningPath, getLearningPaths } from './learning-paths';
import { icon } from './ui';

/** Shared by the overview and the route planner; no profile or history is recorded. */
export function renderLearningPathCards(): string {
  return `<div class="learning-path-grid">${getLearningPaths().map(path => `<a class="learning-path-card" href="#/roadmap/${path.id}">
    <span class="path-card-top">${icon(path.icon)}<span>${esc(path.level)}</span></span>
    <h3>${esc(path.title)}</h3>
    <p class="path-card-description">${esc(path.description)}</p>
    <p class="path-card-prerequisite"><strong>${t('已有基础', 'Bring')}</strong> ${esc(path.prerequisite)}</p>
    <p class="path-card-outcome"><strong>${t('学会', 'Outcome')}</strong> ${esc(path.outcome)}</p>
    <span class="path-card-footer"><span>${t(`首轮约 ${path.firstSessionMinutes} 分钟`, `First session ≈ ${path.firstSessionMinutes} min`)}</span>${icon('ArrowRight')}</span>
    <span class="path-card-estimate">${t('时间为学习安排参考', 'A planning estimate')}</span>
  </a>`).join('')}</div>`;
}

export function renderLearningPathDetail(id: string, completed: readonly string[] = []): string {
  const path = findLearningPath(id);
  if (!path) return '';
  const progress = chapterProgress(completed, path.chapterIds);
  const marked = new Set(completed);
  return `<section class="learning-path-detail" aria-labelledby="path-detail-title">
    <header class="path-detail-header"><div><span class="eyebrow">${esc(path.level)}</span><h2 id="path-detail-title">${esc(path.title)}</h2><p>${esc(path.description)}</p></div><span class="path-session-duration">${icon('Clock3')}${t(`首轮约 ${path.firstSessionMinutes} 分钟`, `First session ≈ ${path.firstSessionMinutes} min`)}</span></header>
    <dl class="path-detail-context"><div><dt>${t('先确认已有基础', 'Check the prerequisites')}</dt><dd>${esc(path.prerequisite)}</dd></div><div><dt>${t('第一轮完成后，你能够', 'After the first session, you can')}</dt><dd>${esc(path.outcome)}</dd></div></dl>
    <p class="path-session-note">${t('以下是第一轮阅读与操作的计划估计，可按理解程度调整；不是整条课程的完成时间。', 'The times below are estimates for the first reading and practice session. Adjust them to your understanding; they do not cover the full course.')}</p>
    <ol class="path-session-steps">${path.steps.map((step, index) => `<li><a href="${step.href}"><span class="path-step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="path-step-copy"><strong>${esc(step.title)}</strong><span>${esc(step.outcome)}</span></span><span class="path-step-time">${t(`约 ${step.minutes} 分钟`, `≈ ${step.minutes} min`)}</span>${icon('ArrowRight')}</a></li>`).join('')}</ol>
    <div class="path-followup-heading"><div><h3>${t('接着沿章节建立系统理解', 'Continue with the connected chapters')}</h3><p>${path.id === 'rl' ? t('这一组假设你已掌握前 18 章的 RL 基础；缺少哪一块，可通过各章的先修链接补齐。', 'This group assumes the RL foundations in Chapters 01–18. Use each chapter’s prerequisite links to revisit a missing topic.') : t('数学与实践入口帮助你进入主题；正式课程仍按先修关系逐步推进。', 'The entry activities introduce the subject. The formal course still follows its prerequisite sequence.')}</p></div><span>${t(`本组手动完成 ${progress.completed}/${progress.total}`, `Manually completed in this group: ${progress.completed}/${progress.total}`)}</span></div>
    <div class="path-chapter-list">${path.chapterIds.map(id => {
      const chapter = getChapter(id)!;
      return `<article class="path-chapter"><a class="path-chapter-link" href="#/chapter/${id}"><span class="path-chapter-number">${marked.has(id) ? icon('Check') : id}</span><span><strong>${esc(chapter.title)}</strong><small>${levelLabel(chapter.level)} · ${t(`约 ${chapter.duration} 分钟阅读`, `≈ ${chapter.duration} min reading`)}${marked.has(id) ? ` · ${t('已手动标记完成', 'Manually marked complete')}` : ''}</small></span>${icon('ArrowRight')}</a>${chapter.prerequisites.length ? `<p class="path-chapter-prerequisites">${t('先修：', 'Prerequisites: ')}${chapter.prerequisites.map(prerequisite => `<a href="#/chapter/${prerequisite}">${t(`第 ${prerequisite} 章`, `Chapter ${prerequisite}`)}</a>`).join(' · ')}</p>` : `<p class="path-chapter-prerequisites">${t('不需要先修 RL 章节', 'No earlier RL chapter required')}</p>`}</article>`;
    }).join('')}</div>
    <p class="path-progress-note">${t('完成状态仅来自你在章节页的手动标记，保存在当前浏览器；选择路径或打开链接不会自动完成章节。', 'Completion comes only from your manual marks in chapter pages and is stored in this browser. Choosing a path or opening a link does not complete a chapter.')}</p>
    ${path.id === 'rl' ? `<div class="path-research-next"><a class="button outline" href="#/research/evidence">${t('核对研究证据', 'Check the research evidence')}${icon('ArrowRight')}</a><a class="button outline" href="#/research/agenda">${t('提出可证伪的研究问题', 'Form a falsifiable research question')}${icon('ArrowRight')}</a></div>` : ''}
  </section>`;
}
