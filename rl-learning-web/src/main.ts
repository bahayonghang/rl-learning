import { createIcons, ArrowUpRight, ArrowRight, ArrowLeft, BookOpen, Bookmark, BrainCircuit, ChartNoAxesCombined, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, Clock3, Code2, Compass, Download, ExternalLink, FileText, FlaskConical, GraduationCap, Grid2X2, Image, LayoutDashboard, Lightbulb, ListChecks, Menu, Moon, Network, NotebookPen, Play, Route, Search, Settings2, ShieldCheck, Sparkles, Sun, Telescope, TrendingUp, Waves, X, ZoomIn } from 'lucide';
import { chapters, modules, sources, getChapter, getModule, moduleChapters } from './content';
import { labs } from './labs';
import { downloadFile, escapeHtml as esc, renderMarkdown } from './render';
import { loadState, saveState, parseState, type LearningState } from './storage';
import type { Chapter } from './types';
import './style.css';

const iconSet = { ArrowUpRight, ArrowRight, ArrowLeft, BookOpen, Bookmark, BrainCircuit, ChartNoAxesCombined, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, Clock3, Code2, Compass, Download, ExternalLink, FileText, FlaskConical, GraduationCap, Grid2X2, Image, LayoutDashboard, Lightbulb, ListChecks, Menu, Moon, Network, NotebookPen, Play, Route, Search, Settings2, ShieldCheck, Sparkles, Sun, Telescope, TrendingUp, Waves, X, ZoomIn };
const icon = (name: string, className = '') => `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
const refreshIcons = () => createIcons({ icons: iconSet, attrs: { 'stroke-width': 1.65 } });
const app = document.querySelector<HTMLDivElement>('#app')!;
let state: LearningState = loadState();
let cleanup: (() => void) | undefined;
let pageToken = 0;
let toastTimer: ReturnType<typeof setTimeout>;
const repository = 'https://github.com/bahayonghang/rl-learning/tree/main/rl-learning-web';
const percentage = () => Math.round(state.completed.length / chapters.length * 100);
const chapterUrl = (id: string) => `#/chapter/${id}`;
const nextChapter = () => chapters.find(c => !state.completed.includes(c.id)) ?? chapters[0];
const storageNotice = () => toast('未能写入浏览器存储，当前改动仅在本页保留。请导出备份后再刷新。');
const persist = (): boolean => {
  const saved = saveState(state);
  if (!saved) storageNotice();
  return saved;
};

function toast(message: string) {
  const element = document.getElementById('toast')!;
  element.textContent = message; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 3200);
}

function applyPreferences() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.textSize = state.textSize;
}

function syncMenuAccessibility() {
  const sidebar = app.querySelector<HTMLElement>('.sidebar');
  const expanded = document.body.classList.contains('menu-open');
  if (sidebar) {
    sidebar.inert = window.innerWidth <= 760 && !expanded;
    if (sidebar.inert) sidebar.setAttribute('aria-hidden', 'true');
    else sidebar.removeAttribute('aria-hidden');
  }
  app.querySelector('[data-open-menu]')?.setAttribute('aria-expanded', String(expanded));
}

function closeMenu() {
  document.body.classList.remove('menu-open');
  syncMenuAccessibility();
  app.querySelector<HTMLButtonElement>('[data-open-menu]')?.focus();
}

function navItem(route: string, label: string, name: string, active: string, extra = '') {
  return `<a href="#/${route}" class="nav-link ${active === route ? 'active' : ''}" ${active === route ? 'aria-current="page"' : ''}>${icon(name)}<span>${label}</span>${extra}</a>`;
}

function shell(section: string, breadcrumb: string) {
  app.innerHTML = `
    <div class="sidebar-overlay" data-close-menu></div>
    <aside class="sidebar" aria-label="主导航">
      <a href="#/home" class="brand"><span class="brand-mark">${icon('Route')}</span><span>RL Atlas<small>强化学习 · 决策之路</small></span></a>
      <div class="workspace-label"><span class="live-dot"></span> 你的开放学习空间 <span class="edition">01</span></div>
      <nav class="main-nav">
        ${navItem('home', '学习总览', 'LayoutDashboard', section)}
        ${navItem('curriculum', '课程目录', 'BookOpen', section, '<span class="nav-count">24</span>')}
        ${navItem('labs', '交互实验室', 'FlaskConical', section, '<span class="nav-count">14</span>')}
        ${navItem('roadmap', '学习路线', 'Route', section)}
        <div class="nav-divider"></div><div class="nav-caption">我的学习</div>
        ${navItem('notes', '笔记与收藏', 'NotebookPen', section)}
        ${navItem('references', '论文与资源', 'FileText', section)}
        ${navItem('gallery', '图解画廊', 'Image', section)}
      </nav>
      <div class="sidebar-progress"><div><span>一点一点，建立直觉</span><b data-progress-label>${percentage()}%</b></div><div class="progress-track"><span data-progress-bar style="width:${percentage()}%"></span></div><p><span data-completed-count>${state.completed.length}</span> / 24 章已完成</p><a href="${chapterUrl(state.lastChapter)}">继续上次学习 ${icon('ArrowUpRight')}</a></div>
      <div class="sidebar-footer"><a href="${repository}" target="_blank" rel="noopener noreferrer">${icon('Code2')} 在 GitHub 查看源码 ${icon('ArrowUpRight')}</a><div>为理解而学，为决策而用。<span>OPEN LEARNING · 2026</span></div></div>
    </aside>
    <div class="app-main">
      <header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" aria-label="打开导航" data-open-menu>${icon('Menu')}</button><span class="breadcrumb-root">学习空间</span>${icon('ChevronRight')}<span>${esc(breadcrumb)}</span></div><div class="topbar-actions"><button class="search-trigger" data-search>${icon('Search')}<span>搜索知识、算法、章节…</span><kbd>Ctrl K</kbd></button><button class="icon-button theme-toggle" data-theme aria-label="${state.theme === 'light' ? '切换深色主题' : '切换浅色主题'}">${icon(state.theme === 'light' ? 'Moon' : 'Sun')}</button><span class="avatar" title="本地学习者">研</span></div></header>
      <main id="main" class="page-content" tabindex="-1"></main>
      <footer class="site-footer"><span>RL ATLAS <span class="footer-dot">·</span> 理解原理，亲手验证。</span><span>原创开放教程 <span class="footer-dot">/</span> 学习记录保存在当前浏览器</span></footer>
    </div>
    <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title"><div class="search-dialog-top">${icon('Search')}<label class="sr-only" id="search-title" for="global-search">搜索课程</label><input id="global-search" type="search" placeholder="试试 Bellman、概率、PPO、工业…" autocomplete="off"/><button class="icon-button" data-close-search aria-label="关闭搜索">${icon('X')}</button></div><div class="search-meta">搜索 24 章正文、标题与关键词</div><div id="search-results" class="search-results"></div><div class="search-help"><span>Enter 打开结果 · Tab 切换</span><span>Esc 关闭</span></div></dialog>
    <dialog class="note-dialog" id="note-dialog" aria-labelledby="note-title"><div class="dialog-heading"><div><span class="eyebrow">THINK IN YOUR OWN WORDS</span><h2 id="note-title">这一章，你理解了什么？</h2></div><button class="icon-button" data-close-note aria-label="关闭笔记">${icon('X')}</button></div><label for="chapter-note" id="note-chapter-label"></label><textarea id="chapter-note" placeholder="用自己的话复述一个概念，记录一个还没解决的问题，或者写下实验观察…" maxlength="50000"></textarea><div class="dialog-footer"><small>保存在当前浏览器，可随时导出。</small><button class="button primary" data-save-note>保存笔记 ${icon('Check')}</button></div></dialog>`;
  bindShell();
}

function pageHeading(eyebrow: string, title: string, subtitle: string, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function chapterRow(c: Chapter, compact = false) {
  const completed = state.completed.includes(c.id);
  return `<a class="chapter-row ${compact ? 'compact' : ''}" href="${chapterUrl(c.id)}"><span class="chapter-number ${completed ? 'done' : ''}">${completed ? icon('Check') : c.id}</span><span class="chapter-row-copy"><b>${esc(c.title)}</b>${compact ? '' : `<small>${esc(c.subtitle)}</small>`}</span><span class="chapter-time">${c.duration} 分钟</span>${state.bookmarks.includes(c.id) ? icon('Bookmark', 'bookmark-indicator') : ''}${icon('ChevronRight')}</a>`;
}

function moduleCard(id: number, open = false) {
  const module = getModule(id);
  const list = moduleChapters(id);
  const done = list.filter(c => state.completed.includes(c.id)).length;
  return `<details class="module-card ${module.color}" ${open ? 'open' : ''}><summary><span class="module-icon">${icon(module.icon)}</span><span class="module-summary"><small>模块 ${String(id).padStart(2, '0')} <span>· ${list.length} 章</span></small><b>${module.title}</b><span>${module.description}</span></span><span class="module-state">${done}/${list.length} 已完成</span>${icon('ChevronDown', 'module-chevron')}</summary><div class="module-chapters">${list.map(c => chapterRow(c)).join('')}<div class="module-outcome">${icon('GraduationCap')}<span>学完你可以：${module.outcome}</span></div></div></details>`;
}

function renderHome(host: HTMLElement) {
  const next = state.completed.includes(state.lastChapter) ? nextChapter() : getChapter(state.lastChapter)!;
  host.innerHTML = `
    ${pageHeading('THE ART OF LEARNING TO DECIDE', '每一次反馈，都让决策更好一点。', '把问题、数学、算法与实验，连成一条真正走得通的路。', '<span class="small-badge">开放教程 · 持续可学</span>')}
    <div class="home-top-grid">
      <section class="hero-card"><div class="hero-copy"><span class="hero-label"><span></span> REINFORCEMENT LEARNING</span><h2>强化学习，<br>从直觉到<span>决策。</span></h2><p>先理解为什么，再推导怎么做。<br>从第一次交互，走向独立建模与可信实验。</p><div class="hero-actions"><a class="button primary" href="${chapterUrl(next.id)}">${state.completed.length ? '继续学习' : '开启学习之旅'} ${icon('ArrowRight')}</a><a class="hero-secondary" href="#/roadmap">看看学习路线 ${icon('ArrowUpRight')}</a></div><div class="hero-footnote">理论讲解 <span>＋</span> 可视化实验 <span>＋</span> 流程工业案例</div></div><div class="hero-art"><img src="./images/journey.webp" alt="原创概念插画：机器人研究者从网格世界和学习笔记走向流程工业模型" fetchpriority="high"/><span class="art-caption">OBSERVE. ACT. LEARN.</span></div></section>
      <aside class="continue-card"><div class="continue-heading">${icon('BookOpen')}<span>你的下一站</span><span class="tiny-dot"></span></div><div class="continue-index">${next.id}<span> / 24</span></div><span class="eyebrow">模块 ${String(next.module).padStart(2, '0')}</span><h3>${esc(next.title)}</h3><p>${esc(next.subtitle)}</p><div class="continue-meta">${icon('Clock3')}${next.duration} 分钟阅读 <span>·</span> ${next.level}</div><a class="button outline" href="${chapterUrl(next.id)}">进入章节 ${icon('ArrowRight')}</a><div class="continue-progress"><span>学习进度</span><b>${percentage()}%</b></div><div class="progress-track"><span style="width:${percentage()}%"></span></div></aside>
    </div>
    <section class="stats-strip" aria-label="课程组成"><div>${icon('Grid2X2')}<span><b>7 <small>个模块</small></b><small>循序渐进的知识体系</small></span></div><div>${icon('BookOpen')}<span><b>24 <small>章教程</small></b><small>推导 · 示例 · 练习与答案</small></span></div><div>${icon('FlaskConical')}<span><b>14 <small>个实验</small></b><small>调参数，看见算法怎么工作</small></span></div><div>${icon('Compass')}<span><b>1 <small>条完整主线</small></b><small>从问题定义到研究复现</small></span></div></section>
    <div class="home-lower-grid"><section><div class="section-heading"><div><span class="eyebrow">BUILD YOUR KNOWLEDGE, STEP BY STEP</span><h2>七个阶段，建立完整认知</h2></div><a href="#/curriculum">全部章节 ${icon('ArrowUpRight')}</a></div><div class="module-list">${moduleCard(1, true)}${moduleCard(2)}${moduleCard(3)}</div><a class="remaining-modules" href="#/curriculum">继续探索 PPO、SAC、独立实验与研究专题 ${icon('ArrowRight')}</a></section><aside class="home-side"><section class="lab-promo"><div class="section-heading"><span class="eyebrow">LEARN BY DOING</span>${icon('FlaskConical')}</div><h3>让抽象概念，<br>在你手里动起来。</h3><p>改变一个参数，先预测结果，再用实验检验你的直觉。</p><a href="#/lab/bandit" class="lab-preview" aria-label="打开多臂老虎机实验"><div class="mini-bars"><span style="height:36%"></span><span style="height:64%"></span><span style="height:48%"></span><span style="height:88%"></span><span style="height:58%"></span></div><div><span>探索，还是利用？</span>${icon('ArrowUpRight')}</div></a><div class="featured-labs"><a href="#/lab/bellman">${icon('Network')} 看价值如何传播 ${icon('ChevronRight')}</a><a href="#/lab/ppo">${icon('TrendingUp')} 拆开 PPO 裁剪 ${icon('ChevronRight')}</a></div><a class="text-link" href="#/labs">进入交互实验室 ${icon('ArrowRight')}</a></section><section class="industry-note"><span class="pill">贯穿案例</span><h3>从算法走向流程工业</h3><p>用烧成系统的设定值决策，练习延迟反馈、部分可观测与约束建模。</p><a href="${chapterUrl('21')}">查看实践专题 ${icon('ArrowUpRight')}</a></section></aside></div>
    <section class="learning-principle">${icon('Lightbulb')}<div><b>不要急着记住算法名字。</b><p>每学一个方法，都问自己：它解决了前一个方法的什么问题？又留下了什么问题？</p></div><a href="${chapterUrl('01')}">从第一个问题开始 ${icon('ArrowRight')}</a></section>`;
}

function renderCurriculum(host: HTMLElement) {
  host.innerHTML = `${pageHeading('THE COMPLETE CURRICULUM', '让知识，长成一张地图。', '按顺序建立基础，也可以从一个具体问题出发。每章都包含讲解、示例与自检练习。')}<div class="catalog-toolbar"><label class="input-with-icon">${icon('Search')}<input type="search" id="catalog-search" placeholder="搜索章节、算法或关键词" aria-label="搜索课程目录"/></label><label class="sr-only" for="catalog-filter">按学习状态筛选</label><select id="catalog-filter"><option value="all">全部章节</option><option value="todo">待学习</option><option value="done">已完成</option><option value="bookmarked">已收藏</option></select><button class="button subtle" id="expand-all">展开全部 ${icon('ChevronDown')}</button></div><div id="catalog-results" class="module-list">${modules.map(m => moduleCard(m.id, m.id === 1)).join('')}</div>`;
  const input = host.querySelector<HTMLInputElement>('#catalog-search')!;
  const select = host.querySelector<HTMLSelectElement>('#catalog-filter')!;
  const update = () => {
    const query = input.value.trim().toLowerCase();
    const results = host.querySelector<HTMLElement>('#catalog-results')!;
    if (!query && select.value === 'all') results.innerHTML = modules.map(m => moduleCard(m.id, m.id === 1)).join('');
    else {
      const matches = chapters.filter(c => `${c.title} ${c.subtitle} ${c.tags.join(' ')} ${c.body}`.toLowerCase().includes(query) && (select.value === 'all' || select.value === 'todo' && !state.completed.includes(c.id) || select.value === 'done' && state.completed.includes(c.id) || select.value === 'bookmarked' && state.bookmarks.includes(c.id)));
      results.innerHTML = matches.length ? `<p class="results-count">找到 ${matches.length} 章</p><div class="chapter-list-card">${matches.map(c => chapterRow(c)).join('')}</div>` : emptyState('没有找到对应章节', '试试更短的关键词，或切换学习状态筛选。', 'Search');
    }
    refreshIcons();
  };
  input.addEventListener('input', update); select.addEventListener('change', update);
  host.querySelector('#expand-all')?.addEventListener('click', () => {
    const details = Array.from(host.querySelectorAll<HTMLDetailsElement>('details'));
    const open = details.some(d => !d.open);
    details.forEach(d => { d.open = open; });
    host.querySelector('#expand-all')!.innerHTML = `${open ? '收起全部' : '展开全部'} ${icon('ChevronDown')}`; refreshIcons();
  });
}

function emptyState(title: string, description: string, name: string) {
  return `<div class="empty-state">${icon(name)}<h3>${title}</h3><p>${description}</p></div>`;
}

async function renderChapter(host: HTMLElement, id: string, token: number) {
  const chapter = getChapter(id);
  if (!chapter) return renderNotFound(host);
  state.lastChapter = id; persist();
  const module = getModule(chapter.module);
  const prior = chapters[chapter.number - 2];
  const next = chapters[chapter.number];
  host.innerHTML = `<div class="reader-topline"><a class="text-link" href="#/curriculum">${icon('ArrowLeft')} 全部章节</a><div class="reader-controls"><button class="icon-button" data-text-size aria-label="切换正文字号" title="切换正文字号">${icon('ZoomIn')}</button><button class="icon-button ${state.bookmarks.includes(id) ? 'selected' : ''}" data-bookmark="${id}" aria-label="${state.bookmarks.includes(id) ? '取消收藏' : '收藏章节'}" aria-pressed="${state.bookmarks.includes(id)}">${icon('Bookmark')}</button><button class="button subtle" data-note="${id}">${icon('NotebookPen')} 写笔记</button><button class="icon-button" data-download-chapter="${id}" aria-label="下载本章 Markdown">${icon('Download')}</button></div></div><div class="reader-layout"><div class="reader-main"><header class="chapter-header"><div class="eyebrow">MODULE ${String(chapter.module).padStart(2, '0')} <span> / </span> ${module.title}</div><h1><span>${id}</span>${esc(chapter.title)}</h1><p>${esc(chapter.subtitle)}</p><div class="chapter-meta"><span>${icon('Clock3')} 约 ${chapter.duration} 分钟阅读</span><span>${chapter.level}</span>${chapter.lab ? `<a href="#/lab/${chapter.lab}">${icon('FlaskConical')} 配套交互实验</a>` : ''}</div></header><section class="objectives"><h2>${icon('Compass')} 读完这一章，你将能够</h2><ul>${chapter.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>${chapter.prerequisites.length ? `<p class="prerequisites">预备知识：${chapter.prerequisites.map(p => /^\d\d$/.test(p) ? `<a href="${chapterUrl(p)}">第 ${p} 章</a>` : esc(p)).join(' · ')}</p>` : ''}</section><article class="prose" id="chapter-body" aria-label="章节正文"></article>${chapter.lab ? `<section class="chapter-lab-cta">${icon('FlaskConical')}<div><b>把这一章的直觉，放进实验里。</b><p>先预测，再调整参数，最后用自己的话解释结果。</p></div><a class="button primary" href="#/lab/${chapter.lab}">打开实验 ${icon('ArrowUpRight')}</a></section>` : ''}<section class="chapter-references"><h2>本章参考资料</h2>${chapter.sources.map(sourceId => { const source = sources.find(s => s.id === sourceId); return source ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(source.title)}<small>${esc(source.author)} · ${esc(source.year)}</small></span>${icon('ArrowUpRight')}</a>` : ''; }).join('')}</section><div class="chapter-finish"><div><span class="eyebrow">ONE MORE STEP FORWARD</span><h3>能用自己的话解释了吗？</h3><p>完成练习、记录疑问，再继续下一站。</p></div><button class="button ${state.completed.includes(id) ? 'outline' : 'primary'}" data-complete="${id}">${icon(state.completed.includes(id) ? 'CheckCheck' : 'Check')} ${state.completed.includes(id) ? '已完成 · 撤销' : '标记为已完成'}</button></div><div class="chapter-navigation">${prior ? `<a href="${chapterUrl(prior.id)}">${icon('ArrowLeft')}<span><small>上一章</small>${esc(prior.title)}</span></a>` : '<span></span>'}${next ? `<a href="${chapterUrl(next.id)}"><span><small>下一章</small>${esc(next.title)}</span>${icon('ArrowRight')}</a>` : '<a href="#/roadmap"><span><small>完成主线之后</small>回顾学习路线</span>'+icon('ArrowRight')+'</a>'}</div></div><aside class="reader-aside"><div class="toc-panel"><div class="toc-heading">${icon('ListChecks')} 本章导航</div><nav id="chapter-toc" aria-label="本章目录"></nav><div class="toc-tip"><span class="pill">学习提示</span><p>遇到公式，先读每个符号，再代入一个具体数字。</p></div><button class="button subtle" data-note="${id}">${icon('NotebookPen')} 记下一个想法</button></div></aside></div>`;
  bindContentActions(host);
  const body = host.querySelector<HTMLElement>('#chapter-body')!;
  const rendering = renderMarkdown(body, chapter.body);
  // Headings are available synchronously; Mermaid loads independently.
  const headings = Array.from(body.querySelectorAll<HTMLHeadingElement>('h2,h3'));
  const toc = host.querySelector('#chapter-toc')!;
  toc.innerHTML = headings.map(h => `<button data-scroll="${h.id}" class="${h.tagName === 'H3' ? 'toc-sub' : ''}">${esc(h.textContent)}</button>`).join('');
  toc.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.scroll!)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })));
  const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { toc.querySelectorAll('button').forEach(b => b.classList.toggle('current', (b as HTMLElement).dataset.scroll === entry.target.id)); } }, { rootMargin: '-90px 0px -65% 0px' });
  headings.forEach(h => observer.observe(h)); cleanup = () => observer.disconnect();
  refreshIcons();
  await rendering;
  if (token !== pageToken) return;
}

function renderLabs(host: HTMLElement) {
  host.innerHTML = `${pageHeading('THE INTERACTIVE LABORATORY', '不止看懂，更要亲手验证。', '14 个浏览器实验，用真实计算连接直觉与公式。所有随机实验均可固定种子。', '<span class="small-badge">无需安装 Python</span>')}<section class="lab-intro-banner"><div><span class="eyebrow">A BETTER WAY TO LEARN</span><h2>先猜想，再实验，最后解释。</h2><p>实验是概念的放大镜。这里的数值是教学模拟，不代表真实训练或工业效果。</p></div><div class="lab-method"><span><b>01</b> 做出预测</span>${icon('ArrowRight')}<span><b>02</b> 调整参数</span>${icon('ArrowRight')}<span><b>03</b> 记录发现</span></div></section><div class="lab-cards">${labs.map((lab, i) => `<a href="#/lab/${lab.id}" class="lab-card ${getModule(Math.min(7, Math.floor(i / 2) + 1)).color}"><div class="lab-card-top"><span class="module-icon">${icon(lab.icon in iconSet ? lab.icon : 'FlaskConical')}</span><span>EXPERIMENT ${String(lab.number).padStart(2, '0')}</span>${icon('ArrowUpRight')}</div><h2>${esc(lab.title)}</h2><p>${esc(lab.subtitle)}</p><div class="lab-card-bottom"><span>浏览器教学模拟</span><span>打开实验 ${icon('ArrowRight')}</span></div></a>`).join('')}</div>`;
}

function renderLab(host: HTMLElement, id: string) {
  const lab = labs.find(l => l.id === id);
  if (!lab) return renderNotFound(host);
  host.innerHTML = `<div class="reader-topline"><a class="text-link" href="#/labs">${icon('ArrowLeft')} 全部实验</a><a class="text-link" href="${chapterUrl(lab.chapter)}">${icon('BookOpen')} 阅读配套章节 ${icon('ArrowUpRight')}</a></div>${pageHeading(`EXPERIMENT ${String(lab.number).padStart(2, '0')} / INTERACTIVE LAB`, esc(lab.title), esc(lab.subtitle))}<div class="lab-workspace"><aside class="lab-mini-nav"><h2>实验目录</h2>${labs.map(l => `<a class="${l.id === id ? 'active' : ''}" href="#/lab/${l.id}" ${l.id === id ? 'aria-current="page"' : ''}><span>${String(l.number).padStart(2, '0')}</span>${esc(l.title)}</a>`).join('')}</aside><section class="lab-host" id="lab-host" aria-label="交互实验"></section></div>`;
  const dispose = lab.render(host.querySelector<HTMLElement>('#lab-host')!);
  if (typeof dispose === 'function') cleanup = dispose;
}

const roadmapMermaid = `flowchart TD
    Start["定义序列决策问题"] --> Foundation["交互、概率与 MDP"]
    Foundation --> Value["Bellman 与表格控制"]
    Value --> DQN["价值路线：DQN"]
    Value --> PG["策略路线：策略梯度"]
    PG --> PPO["优势估计与 PPO"]
    PG --> SAC["连续策略与 SAC"]
    DQN --> Evidence["环境建模与可信实验"]
    PPO --> Evidence
    SAC --> Evidence
    Evidence --> Offline["只有历史数据：离线 RL"]
    Evidence --> Model["可以模拟：模型学习"]
    Offline --> Constrained["约束、独立评估与安全门控"]
    Model --> Constrained`;

async function renderRoadmap(host: HTMLElement) {
  host.innerHTML = `${pageHeading('A ROUTE, NOT A RACE', '用六到八周，走通一条主线。', '适合已有神经网络基础、希望补齐强化学习概率直觉，并连接流程工业研究的学习者。')}<div class="roadmap-top"><section class="roadmap-map"><div class="section-heading"><h2>知识如何连接？</h2><span class="pill">可下载图源与 SVG</span></div><div class="prose" id="roadmap-diagram"></div></section><aside class="study-contract"><span class="eyebrow">YOUR LEARNING RHYTHM</span><h2>理解比赶进度重要。</h2><p>建议每周安排 8–12 小时。正文的阅读时间是估计，推导、编码和实验需要额外留出空间。</p><ul><li>先写一个直观解释</li><li>手算一个最小例子</li><li>复现一次数值变化</li><li>记录一个失败与边界</li></ul><button class="button outline" data-export-plan>${icon('Download')} 导出学习清单</button></aside></div><div class="section-heading"><div><span class="eyebrow">A FLEXIBLE STUDY PLAN</span><h2>把路线变成每周的产出</h2></div><div class="segmented" role="group" aria-label="选择学习计划"><button data-weeks="8" class="selected" aria-pressed="true">8 周稳步</button><button data-weeks="6" aria-pressed="false">6 周集中</button></div></div><div id="weekly-plan" class="weekly-plan"></div><section class="capstone-callout"><img src="./images/industry.webp" alt="机器人研究者与工程师围绕烧成系统模型讨论设定值决策的概念插画" loading="lazy"/><div><span class="eyebrow">THE CAPSTONE PROJECT</span><h2>最终交付一份可信的研究方案。</h2><p>给定工况历史，提出有界的设定值增量；明确延迟反馈、代价约束、回退规则、基线和独立测试集。所有结果仅限模拟推演。</p><a class="button primary" href="${chapterUrl('21')}">开始工业决策案例 ${icon('ArrowRight')}</a></div></section>`;
  renderWeeks(8);
  host.querySelectorAll<HTMLButtonElement>('[data-weeks]').forEach(button => button.addEventListener('click', () => { host.querySelectorAll('[data-weeks]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderWeeks(Number(button.dataset.weeks)); }));
  host.querySelector('[data-export-plan]')?.addEventListener('click', exportPlan);
  await renderMarkdown(host.querySelector('#roadmap-diagram')!, `\`\`\`mermaid\n${roadmapMermaid}\n\`\`\``);
}

function renderWeeks(count: number) {
  const plans = count === 8 ? [
    ['01–03', '建立交互与概率直觉', '画出交互闭环；手算折扣回报；解释探索的代价。', '01'],
    ['04–06', '用 Bellman 方程看未来', '写出 MDP；完成一次策略评估和价值迭代。', '04'],
    ['07–08', '从样本里学会估值', '比较 MC、TD、SARSA 与 Q-learning 的目标。', '07'],
    ['09–12', '走向深度学习与策略梯度', '解释 DQN 的三个不稳定来源；推导 REINFORCE。', '09'],
    ['13–15', '把 PPO 一项项拆开', '手算 GAE、概率比和正负优势下的裁剪目标。', '13'],
    ['16–18', '掌握连续动作与 SAC', '理解 tanh 密度修正，写出双 Critic 的目标。', '16'],
    ['19–21', '独立建模与可信实验', '写环境契约、基线矩阵与工业决策实验协议。', '19'],
    ['22–24', '形成可执行的研究方向', '区分离线、模型与约束 RL；提交完整研究方案。', '22'],
  ] : [
    ['01–04', '交互、概率与建模', '完成概率补习，写出通用任务与工业案例的 MDP/POMDP。', '01'],
    ['05–08', '价值估计与表格控制', '复现 Bellman、MC/TD 和悬崖漫步实验。', '05'],
    ['09–12', 'DQN 与策略梯度', '整理经验回放、目标网络和 REINFORCE 的推导笔记。', '09'],
    ['13–17', 'PPO 与 SAC 核心机制', '重点手算 GAE、裁剪函数和连续策略对数概率。', '13'],
    ['18–21', '独立建模与实验设计', '完成环境契约与多种子评估表，制定工业案例基线。', '18'],
    ['22–24', '离线、模型与约束专题', '选择一个可验证的研究假设，设计最小消融实验。', '22'],
  ];
  document.querySelector('#weekly-plan')!.innerHTML = plans.map((p, i) => `<a class="week-card" href="${chapterUrl(p[3])}"><div><span>WEEK</span><b>${String(i + 1).padStart(2, '0')}</b></div><section><small>第 ${p[0]} 章</small><h3>${p[1]}</h3><p>${p[2]}</p></section>${icon('ArrowUpRight')}</a>`).join(''); refreshIcons();
}

function exportPlan() {
  downloadFile('rl-atlas-study-checklist.md', `# RL Atlas 学习清单\n\n建议周期：6–8 周；每周 8–12 小时，仅作计划参考。\n\n${modules.map(m => `## ${m.id}. ${m.title}\n\n${moduleChapters(m.id).map(c => `- [${state.completed.includes(c.id) ? 'x' : ' '}] ${c.id} ${c.title}`).join('\n')}\n\n阶段产出：${m.outcome}`).join('\n\n')}\n\n## 每章自检\n\n- 能解释为什么需要这个方法。\n- 能手算一个小例子。\n- 能指出至少一个限制。\n- 能解释实验现象，而非只运行代码。\n`);
}

function renderReferences(host: HTMLElement) {
  host.innerHTML = `${pageHeading('GO BACK TO THE SOURCE', '把每个结论，放回它的出处。', '优先阅读原始论文、作者教材与官方文档。每章还提供了与当前知识点直接相关的引用。')}<section class="reference-intro"><div>${icon('BookOpen')}<h2>先建立主干，再读论文</h2><p>教材帮助连接概念，论文回答方法为什么出现，官方实现帮助核对细节。</p></div><div>${icon('ShieldCheck')}<h2>分清三种证据</h2><p>论文结论有实验条件；浏览器演示是教学模拟；工业阈值来自项目约定。</p></div></section><label class="input-with-icon resource-search">${icon('Search')}<input id="resource-search" type="search" placeholder="搜索论文、作者或主题" aria-label="搜索参考资料"/></label><div class="reference-grid" id="reference-list"></div><section class="source-note"><h2>教程的来源与边界</h2><p>教学组织受到「机器学习实战ML」公众号文章《强化学习难点，90% 初学者都搞错了！！》启发。本文仅使用公开推文的教学主线与视觉组织作为参考，正文、代码、实验和配图为本项目重新编写与创作，未访问或复刻付费课程内容。</p><p>原文中的“PPO 限制更新”“SARSA 更保守”等简化，在相关章节补充了成立条件与局限。研究案例的具体阈值以仓库 AGENTS.md 为项目约定；并非普遍工业标准。</p><a href="https://mp.weixin.qq.com/s/x3Jb7imrQtbavvU1vH8Tww" target="_blank" rel="noopener noreferrer">阅读原始公开推文 ${icon('ArrowUpRight')}</a></section>`;
  host.querySelector('.reference-intro')!.insertAdjacentHTML('afterend', `<section class="downloads-panel"><h2>${icon('Download')} 完整教程与可运行代码</h2><div><a href="./rl-atlas-tutorial.md" download>整本教程 · Markdown ${icon('ArrowUpRight')}</a><a href="./code/tabular_foundations.py" download>表格算法 · Python ${icon('ArrowUpRight')}</a><a href="./code/advanced_math_checks.py" download>GAE / PPO / tanh 数值验证 ${icon('ArrowUpRight')}</a><a href="./code/advanced_toy_env.py" download>Gymnasium 教学环境 ${icon('ArrowUpRight')}</a></div></section>`);
  const render = (query = '') => {
    const list = [...new Map(sources.map(source => [source.url, source])).values()].filter(s => `${s.title} ${s.author} ${s.note}`.toLowerCase().includes(query.toLowerCase()));
    host.querySelector('#reference-list')!.innerHTML = list.length ? list.map((source, i) => `<a class="reference-card" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><div><span class="reference-number">${String(i + 1).padStart(2, '0')}</span><span class="pill">${esc(source.year)}</span>${icon('ArrowUpRight')}</div><h2>${esc(source.title)}</h2><span class="reference-author">${esc(source.author)}</span><p>${esc(source.note)}</p></a>`).join('') : emptyState('没有找到这份资料', '试试算法名称或作者姓氏。', 'FileText'); refreshIcons();
  }; render();
  host.querySelector<HTMLInputElement>('#resource-search')!.addEventListener('input', e => render((e.target as HTMLInputElement).value.trim()));
}

function renderNotes(host: HTMLElement) {
  const notes = chapters.filter(c => state.notes[c.id]?.trim());
  const bookmarks = chapters.filter(c => state.bookmarks.includes(c.id));
  host.innerHTML = `${pageHeading('MAKE THE KNOWLEDGE YOURS', '用自己的话，再理解一次。', '学习记录保存在这个浏览器中。导出一份备份，让你的思考可以跟随你。', '<button class="button outline" data-export-notes>'+icon('Download')+' 导出全部笔记</button>')}<div class="notes-layout"><section><div class="section-heading"><h2>我的笔记 <span class="count-badge">${notes.length}</span></h2></div>${notes.length ? notes.map(c => `<article class="note-card"><div><a href="${chapterUrl(c.id)}">第 ${c.id} 章 · ${esc(c.title)}</a><button class="text-button" data-note="${c.id}">编辑 ${icon('NotebookPen')}</button></div><p>${esc(state.notes[c.id])}</p></article>`).join('') : emptyState('给今天的理解，留一个位置。', '打开任意章节，点击「写笔记」，记录你自己的解释、疑问与实验发现。', 'NotebookPen')}</section><aside><div class="section-heading"><h2>收藏的章节 <span class="count-badge">${bookmarks.length}</span></h2></div>${bookmarks.length ? `<div class="chapter-list-card">${bookmarks.map(c => chapterRow(c, true)).join('')}</div>` : emptyState('把想再读的内容留下', '在章节右上角点击书签，即可加入收藏。', 'Bookmark')}<div class="backup-card"><h3>保存你的学习足迹</h3><p>笔记导出为 Markdown，学习数据可导出为 JSON 并恢复到另一台设备。</p><div><button class="button subtle" data-export-state>导出数据</button><button class="button subtle" data-import-state>导入数据</button><input type="file" id="import-state-file" accept="application/json,.json" hidden/></div></div></aside></div>`;
  bindContentActions(host);
  host.querySelector('[data-export-notes]')!.addEventListener('click', () => downloadFile('rl-atlas-notes.md', `# 我的 RL Atlas 学习笔记\n\n${notes.length ? notes.map(c => `## ${c.id} ${c.title}\n\n${state.notes[c.id]}`).join('\n\n---\n\n') : '尚未添加笔记。'}\n`));
  host.querySelector('[data-export-state]')!.addEventListener('click', () => downloadFile('rl-atlas-progress.json', JSON.stringify(state, null, 2), 'application/json'));
  const fileInput = host.querySelector<HTMLInputElement>('#import-state-file')!;
  host.querySelector('[data-import-state]')!.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]; if (!file) return;
    // Covers 24 × 50,000 characters, including JSON escapes, from our own exporter.
    if (file.size > 8_000_000) { toast('文件过大，请选择 RL Atlas 导出的学习数据。'); return; }
    try {
      const raw = await file.text(); const parsed = JSON.parse(raw);
      if (parsed.version !== 1 || !Array.isArray(parsed.completed) || !Array.isArray(parsed.bookmarks) || typeof parsed.notes !== 'object' || parsed.notes === null) throw new Error('Invalid data');
      const imported = parseState(raw);
      // Merge, preserving current notes where both files contain the same chapter.
      state.completed = [...new Set([...state.completed, ...imported.completed])];
      state.bookmarks = [...new Set([...state.bookmarks, ...imported.bookmarks])];
      const conflicts = Object.keys(imported.notes).filter(id => state.notes[id]?.trim() && imported.notes[id] !== state.notes[id]).length;
      for (const [id, note] of Object.entries(imported.notes)) if (!state.notes[id]?.trim()) state.notes[id] = note;
      const saved = persist(); renderNotes(host); updateProgress(); refreshIcons();
      if (saved) toast(conflicts ? `已合并数据；${conflicts} 章已有笔记，保留本机版本。` : '学习数据已合并。');
    } catch { toast('无法读取该文件，请选择有效的 RL Atlas 学习数据。'); }
  });
}

function renderGallery(host: HTMLElement) {
  const images = [
    { file: 'journey', title: '从反馈中，学会决策', subtitle: '课程总览', description: '从小小的选择与网格世界，走向神经网络和工业系统。学习的主线始终是：行动如何改变未来。' },
    { file: 'foundations', title: '把看不见的价值，变成直觉', subtitle: '基础与探索', description: '老虎机、网格世界与学习笔记，把抽象的探索、回报和价值估计放到可观察的场景中。' },
    { file: 'industry', title: '让决策走进真实问题', subtitle: '工业决策专题', description: '研究者与工程师围绕烧成系统模型协作。策略建议、模型可信度和执行边界，需要被一起考虑。' },
  ];
  host.innerHTML = `${pageHeading('IDEAS, ILLUSTRATED', '先有一幅图，再建立一套理解。', '为这份教程重新创作的概念介绍图。精确公式、算法结构与流程请以正文和 Mermaid 图为准。')}<div class="gallery-list">${images.map((image, i) => `<figure class="gallery-card"><a href="./images/${image.file}.webp" target="_blank" rel="noopener noreferrer" aria-label="查看${image.title}原图"><img src="./images/${image.file}.webp" alt="${image.description}" loading="${i ? 'lazy' : 'eager'}"/></a><figcaption><div><span class="eyebrow">FIGURE ${String(i + 1).padStart(2, '0')} / ${image.subtitle}</span><h2>${image.title}</h2><p>${image.description}</p></div><a class="button outline" href="./images/${image.file}.webp" download>${icon('Download')} 下载配图</a></figcaption></figure>`).join('')}</div><p class="gallery-provenance">配图由 imagegen 为本项目原创生成，仅作概念引入；创作提示词见项目 docs/illustrations.md。</p>`;
}

function renderNotFound(host: HTMLElement) {
  host.innerHTML = `${emptyState('这一页还没有坐标。', '链接可能不完整，可以回到课程目录寻找下一站。', 'Compass')}<div class="center"><a class="button primary" href="#/curriculum">返回课程目录 ${icon('ArrowRight')}</a></div>`;
}

function bindShell() {
  app.querySelector('.sidebar')?.setAttribute('id', 'main-navigation');
  app.querySelector('[data-open-menu]')?.setAttribute('aria-controls', 'main-navigation');
  app.querySelector('[data-search]')?.setAttribute('aria-label', '搜索课程');
  app.querySelector('[data-open-menu]')?.addEventListener('click', () => { document.body.classList.add('menu-open'); syncMenuAccessibility(); app.querySelector<HTMLAnchorElement>('.sidebar .nav-link')?.focus(); });
  app.querySelector('[data-close-menu]')?.addEventListener('click', closeMenu);
  syncMenuAccessibility();
  app.querySelector('[data-theme]')?.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light'; persist(); applyPreferences();
    const button = app.querySelector<HTMLElement>('[data-theme]')!;
    button.innerHTML = icon(state.theme === 'light' ? 'Moon' : 'Sun');
    button.setAttribute('aria-label', state.theme === 'light' ? '切换深色主题' : '切换浅色主题'); refreshIcons();
    // Keep the current reading position. Existing diagrams retain their high-contrast palette.
  });
  app.querySelector('[data-search]')?.addEventListener('click', openSearch);
  const searchDialog = app.querySelector<HTMLDialogElement>('#search-dialog')!;
  app.querySelector('[data-close-search]')?.addEventListener('click', () => searchDialog.close());
  const searchInput = app.querySelector<HTMLInputElement>('#global-search')!;
  searchInput.addEventListener('input', () => renderSearch(searchInput.value));
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const link = document.querySelector<HTMLAnchorElement>('#search-results a'); if (link) { searchDialog.close(); location.hash = link.hash; } }
    if (e.key === 'ArrowDown') { e.preventDefault(); document.querySelector<HTMLAnchorElement>('#search-results a')?.focus(); }
  });
  for (const dialog of app.querySelectorAll<HTMLDialogElement>('dialog')) dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  app.querySelector('[data-close-note]')?.addEventListener('click', () => app.querySelector<HTMLDialogElement>('#note-dialog')!.close());
}

function openSearch() {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement;
  if (dialog.open) return;
  const input = document.querySelector<HTMLInputElement>('#global-search')!;
  renderSearch(input.value); dialog.showModal(); input.focus();
}

function renderSearch(query: string) {
  const normalized = query.trim().toLowerCase();
  const matches = normalized ? chapters.filter(c => `${c.title} ${c.subtitle} ${c.tags.join(' ')} ${c.body}`.toLowerCase().includes(normalized)) : [getChapter(state.lastChapter)!, ...chapters.filter(c => c.id !== state.lastChapter).slice(0, 5)];
  document.getElementById('search-results')!.innerHTML = matches.length ? matches.map(c => `<a class="search-result" href="${chapterUrl(c.id)}"><span class="chapter-number">${c.id}</span><span><b>${esc(c.title)}</b><small>模块 ${c.module} · ${esc(c.subtitle)}</small></span>${icon('ArrowUpRight')}</a>`).join('') : emptyState('没有找到相关内容', '试试中文概念、英文算法名或更短的关键词。', 'Search');
  document.querySelectorAll('#search-results a').forEach(link => link.addEventListener('click', () => (document.getElementById('search-dialog') as HTMLDialogElement).close())); refreshIcons();
}

function bindContentActions(host: HTMLElement) {
  host.querySelectorAll<HTMLButtonElement>('[data-note]').forEach(button => button.addEventListener('click', () => openNote(button.dataset.note!)));
  host.querySelectorAll<HTMLButtonElement>('[data-bookmark]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.bookmark!;
    const exists = state.bookmarks.includes(id); state.bookmarks = exists ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id]; const saved = persist();
    button.classList.toggle('selected', !exists); button.setAttribute('aria-pressed', String(!exists)); button.setAttribute('aria-label', exists ? '收藏章节' : '取消收藏');
    if (saved) toast(exists ? '已取消收藏' : '已加入收藏');
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-complete]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.complete!; const exists = state.completed.includes(id);
    state.completed = exists ? state.completed.filter(x => x !== id) : [...state.completed, id]; const saved = persist(); updateProgress();
    button.classList.toggle('outline', !exists); button.classList.toggle('primary', exists); button.innerHTML = `${icon(exists ? 'Check' : 'CheckCheck')} ${exists ? '标记为已完成' : '已完成 · 撤销'}`; refreshIcons();
    if (saved) toast(exists ? '已取消完成标记' : `又走完一站。已完成 ${state.completed.length} / 24 章。`);
  }));
  host.querySelector('[data-text-size]')?.addEventListener('click', () => { state.textSize = state.textSize === 'normal' ? 'large' : 'normal'; const saved = persist(); applyPreferences(); if (saved) toast(state.textSize === 'large' ? '已使用大字号' : '已使用标准字号'); });
  host.querySelectorAll<HTMLButtonElement>('[data-download-chapter]').forEach(button => button.addEventListener('click', () => { const chapter = getChapter(button.dataset.downloadChapter!)!; downloadFile(`${chapter.id}-${chapter.title}.md`, `# ${chapter.id} ${chapter.title}\n\n${chapter.subtitle}\n\n${chapter.body}\n`); }));
}

function openNote(id: string) {
  const dialog = document.getElementById('note-dialog') as HTMLDialogElement;
  const textarea = document.getElementById('chapter-note') as HTMLTextAreaElement;
  document.getElementById('note-chapter-label')!.textContent = `第 ${id} 章 · ${getChapter(id)!.title}`;
  textarea.value = state.notes[id] ?? '';
  const status = dialog.querySelector<HTMLElement>('.dialog-footer small')!;
  status.textContent = '保存在当前浏览器，可随时导出。';
  status.setAttribute('role', 'status');
  const saveButton = dialog.querySelector<HTMLButtonElement>('[data-save-note]')!;
  saveButton.onclick = () => {
    state.notes[id] = textarea.value;
    if (!persist()) {
      status.textContent = '保存未成功。请先复制笔记，或关闭此窗后导出备份；刷新会丢失当前改动。';
      return;
    }
    dialog.close(); toast('笔记已保存');
    if (location.hash === '#/notes') { renderNotes(document.getElementById('main')!); refreshIcons(); }
  };
  dialog.showModal(); textarea.focus();
}

function updateProgress() {
  document.querySelectorAll('[data-progress-label]').forEach(e => { e.textContent = `${percentage()}%`; });
  document.querySelectorAll<HTMLElement>('[data-progress-bar]').forEach(e => { e.style.width = `${percentage()}%`; });
  document.querySelectorAll('[data-completed-count]').forEach(e => { e.textContent = String(state.completed.length); });
}

function prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

async function route() {
  const token = ++pageToken;
  cleanup?.(); cleanup = undefined;
  document.body.classList.remove('menu-open');
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const section = parts[0] || 'home'; const id = parts[1] || '';
  const labels: Record<string, string> = { home: '学习总览', curriculum: '课程目录', chapter: getChapter(id)?.title ?? '章节阅读', labs: '交互实验室', lab: labs.find(l => l.id === id)?.title ?? '交互实验', roadmap: '学习路线', references: '论文与资源', notes: '笔记与收藏', gallery: '图解画廊' };
  shell(section === 'chapter' ? 'curriculum' : section === 'lab' ? 'labs' : section, labels[section] ?? '页面未找到');
  document.title = `${labels[section] ?? '页面未找到'} · RL Atlas 强化学习教程`;
  const host = document.getElementById('main')!;
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    switch (section) {
      case 'home': renderHome(host); break;
      case 'curriculum': renderCurriculum(host); break;
      case 'chapter': await renderChapter(host, id, token); break;
      case 'labs': renderLabs(host); break;
      case 'lab': renderLab(host, id); break;
      case 'roadmap': await renderRoadmap(host); break;
      case 'references': renderReferences(host); break;
      case 'notes': renderNotes(host); break;
      case 'gallery': renderGallery(host); break;
      default: renderNotFound(host);
    }
  } catch (error) {
    console.error('Page rendering failed', error);
    if (token === pageToken) host.innerHTML = `${emptyState('页面加载遇到问题', '请刷新后重试；你的已保存学习记录不会因此丢失。', 'Compass')}<a class="button primary" href="#/home">返回学习总览</a>`;
  }
  if (token === pageToken) refreshIcons();
}

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  if (event.key === 'Tab' && document.body.classList.contains('menu-open') && window.innerWidth <= 760) {
    const focusable = Array.from(app.querySelectorAll<HTMLElement>('.sidebar a, .sidebar button'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
document.querySelector('.skip-link')?.addEventListener('click', event => { event.preventDefault(); document.getElementById('main')?.focus(); });
window.addEventListener('hashchange', () => { void route(); });
window.addEventListener('resize', syncMenuAccessibility);
applyPreferences();
void route();
