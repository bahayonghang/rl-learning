import {chapters,modules,getChapter,getModule,moduleChapters,getChapterGuide,loadContentBundle,activateContent} from './content/localized';
import {getLabs,findLab} from './labs';
import {downloadFile,escapeHtml as esc,renderMarkdown} from './render';
import {loadState,saveState,type LearningState} from './storage';
import {text as t,getLocale,setLocale,isLocale,localeRegistry,levelLabel,editionFilename,type Locale} from './i18n';
import type {Chapter} from './types';
import {mountChapterGuide,renderPrimerPage,renderGlossaryPage} from './learning';
import {chapterDownloadMarkdown} from './content-download';
import {closeFigureViewers} from './figure-view';
import {getFormulaCases,getFormulaCase} from './formula-cases';
import {mountFormulaCasesForChapter,renderFormulaCasesPage} from './formula-case-view';
import {searchLearning} from './search';
import {mountKilnWorkbench} from './kiln/workbench';
import {renderResearch,findResearchPage} from './research/pages';
import {renderReferences,renderGallery,allSources} from './catalogue';
import {icon,refreshIcons,pageHeading,emptyState} from './ui';
import {navigationLabels,renderNavigation,searchShortcut} from './navigation';
import {renderHomePage} from './home';
import {renderRoadmapPage} from './roadmap';
import {isThemePreference,resolveTheme} from './theme';
import './style.css';
import './atlas.css';
import './learning-paths.css';
import './home.css';
import './shell-accessibility.css';
import './figure-view.css';
import './formula-cases.css';
import 'katex/dist/katex.min.css';

const app=document.querySelector<HTMLDivElement>('#app')!;
let state:LearningState=loadState();
const systemColorScheme=window.matchMedia('(prefers-color-scheme: dark)');
let cleanup:(()=>void)|undefined;
let pageToken=0,localeRequest=0;
let toastTimer:ReturnType<typeof setTimeout>;
const repository='https://github.com/bahayonghang/rl-learning/tree/main/rl-learning-web';
const chapterUrl=(id:string)=>`#/chapter/${id}`;
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const moveTo=(element:HTMLElement|null)=>element?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});

function toast(message:string){const el=document.getElementById('toast')!;el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
function persist(){const saved=saveState(state);if(!saved)toast(t('浏览器未能保存偏好，本次页面仍可使用。','The browser could not save preferences. This session remains usable.'));return saved;}
function applyPreferences(){
 const theme=resolveTheme(state.theme,systemColorScheme.matches);
 document.documentElement.dataset.theme=theme;
 document.documentElement.style.colorScheme=theme;
 document.documentElement.dataset.textSize=state.textSize;
 document.documentElement.lang=state.locale;
 document.documentElement.dir=localeRegistry[state.locale].direction;
 document.querySelector('meta[name=theme-color]')?.setAttribute('content',theme==='dark'?'#211f1c':'#faf8f3');
 document.querySelector('meta[name=description]')?.setAttribute('content',t('面向流程工业运行决策的强化学习教程。通过水泥工况、数学推导、公式计算与算法实验，学习如何提出可验证的设定值决策。','Learn reinforcement learning for process-industry decisions through cement scenarios, mathematical derivations, worked calculations and algorithm experiments.'));
 document.querySelector('.skip-link')!.textContent=t('跳到正文','Skip to content');
 const control=app.querySelector<HTMLSelectElement>('[data-theme]');
 if(control){control.value=state.theme;control.title=state.theme==='system'?t(`跟随系统：当前为${theme==='dark'?'深色':'浅色'}`,`System theme: currently ${theme}`):t('选择主题外观','Choose appearance');}
}
function syncMenu(){const side=app.querySelector<HTMLElement>('.sidebar');const open=document.body.classList.contains('menu-open');if(side){side.inert=window.innerWidth<=760&&!open;if(side.inert)side.setAttribute('aria-hidden','true');else side.removeAttribute('aria-hidden');}app.querySelector('[data-open-menu]')?.setAttribute('aria-expanded',String(open));}
function closeMenu(){document.body.classList.remove('menu-open');syncMenu();app.querySelector<HTMLButtonElement>('[data-open-menu]')?.focus();}
function shell(section:string,breadcrumb:string){
 const labels=navigationLabels();
 const nested=Boolean(labels[section]&&breadcrumb!==labels[section]);
 const shortcut=searchShortcut(navigator.platform||navigator.userAgent);
 app.innerHTML=`<div class="sidebar-overlay" data-close-menu></div>
 <aside class="sidebar" id="main-navigation" aria-label="${t('主导航','Main navigation')}">
  <a href="#/home" class="brand"><span class="brand-mark"><img src="./images/atlas-mark.webp" alt="" width="40" height="40"/></span><span>RL Atlas<small>${t('强化学习教程','Reinforcement learning')}</small></span></a>
  <div class="workspace-label">${t('数学 · 算法 · 工业决策','MATHEMATICS · ALGORITHMS · DECISIONS')}</div>
  <nav class="main-nav" aria-label="${t('教程目录','Tutorial navigation')}">${renderNavigation(section)}</nav>
  <div class="sidebar-footer"><a href="${repository}" target="_blank" rel="noopener noreferrer">${icon('Code2')}${t('GitHub 源码','Source on GitHub')}${icon('ArrowUpRight')}</a><a href="https://github.com/bahayonghang/rl-learning/blob/main/rl-learning-web/docs/reuse-and-citation.md" target="_blank" rel="noopener noreferrer">${icon('FileText')}${t('来源、引用与复用','Sources, citation & reuse')}${icon('ArrowUpRight')}</a></div>
 </aside>
 <div class="app-main"><header class="topbar">
  <div class="breadcrumb"><button class="icon-button mobile-menu" aria-label="${t('打开导航','Open navigation')}" title="${t('打开导航','Open navigation')}" aria-controls="main-navigation" aria-expanded="false" data-open-menu>${icon('Menu')}</button>${nested?`<a class="breadcrumb-parent" href="#/${section}">${labels[section]}</a>${icon('ChevronRight')}`:''}<span class="breadcrumb-title">${esc(breadcrumb)}</span></div>
  <div class="topbar-actions">
   <button class="search-trigger" data-search title="${t('搜索全部内容','Search all content')} (${shortcut})" aria-label="${t('搜索全部内容','Search all content')}">${icon('Search')}<span>${t('搜索教程…','Search the tutorial…')}</span><kbd>${shortcut}</kbd></button>
   <label class="locale-switch">${icon('Languages')}<span class="sr-only">${t('选择语言','Choose language')}</span><select data-locale aria-label="${t('选择语言','Choose language')}" title="${t('选择语言','Choose language')}">${Object.entries(localeRegistry).map(([key,locale])=>`<option value="${key}" ${key===state.locale?'selected':''}>${locale.name}</option>`).join('')}</select></label>
   <label class="theme-switch"><span class="sr-only">${t('主题外观','Appearance')}</span><select data-theme aria-label="${t('主题外观','Appearance')}" title="${t('选择主题外观','Choose appearance')}">${[['system',t('跟随系统','System')],['light',t('浅色','Light')],['dark',t('深色','Dark')]].map(([value,label])=>`<option value="${value}" ${state.theme===value?'selected':''}>${label}</option>`).join('')}</select></label>
  </div>
 </header>
 <main id="main" class="page-content" data-page="${section}" tabindex="-1"></main>
 <footer class="site-footer"><span>RL Atlas · ${t('面向流程工业决策的强化学习','Reinforcement learning for process decisions')}</span><a href="${repository}" target="_blank" rel="noopener noreferrer">${t('查看源码','View source')}${icon('ArrowUpRight')}</a></footer></div>
 <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title"><div class="search-dialog-top">${icon('Search')}<label class="sr-only" id="search-title" for="global-search">${t('搜索全部内容','Search all content')}</label><input id="global-search" type="search" placeholder="${t('试试 Bellman、质量约束、MOEA/D…','Try Bellman, quality constraints, MOEA/D…')}" autocomplete="off"/><button class="icon-button" data-close-search aria-label="${t('关闭搜索','Close search')}" title="${t('关闭搜索','Close search')}">${icon('X')}</button></div><div class="search-meta">${t('章节、公式案例、数学准备与研究综述','Chapters, worked cases, mathematics and research reviews')}</div><div id="search-results" class="search-results"></div><div class="search-help"><span>${t('Enter 打开结果 · Tab 切换','Enter opens a result · Tab navigates')}</span><span>Esc ${t('关闭','closes')}</span></div></dialog>`;
 bindShell();
 applyPreferences();
}
function chapterRow(c:Chapter){const done=state.completed.includes(c.id);return `<a class="chapter-row" href="${chapterUrl(c.id)}"><span class="chapter-number ${done?'done':''}">${done?icon('Check'):c.id}</span><span class="chapter-row-copy"><b>${esc(c.title)}</b><small>${esc(c.subtitle)}</small></span><span class="chapter-time">${c.duration} ${t('分钟','min')}</span>${icon('ChevronRight')}</a>`;}
function moduleCard(id:number,open=false){const m=getModule(id),list=moduleChapters(id),done=list.filter(c=>state.completed.includes(c.id)).length;return `<details class="module-card ${m.color}" ${open?'open':''}><summary><span class="module-icon">${icon(m.icon)}</span><span class="module-summary"><small>${t('模块','MODULE')} ${String(id).padStart(2,'0')} <span>· ${list.length} ${t('章','chapters')}</span></small><b>${esc(m.title)}</b><span>${esc(m.description)}</span></span><span class="module-state">${done}/${list.length} ${t('已完成','complete')}</span>${icon('ChevronDown','module-chevron')}</summary><div class="module-chapters">${list.map(chapterRow).join('')}<div class="module-outcome">${icon('GraduationCap')}<span>${t('阶段产出：','You will be able to: ')}${esc(m.outcome)}</span></div></div></details>`;}
function renderCurriculum(host:HTMLElement){host.innerHTML=`${pageHeading(t('系统学习','THE COMPLETE COURSE'),navigationLabels().curriculum,t(`${chapters.length} 章原理、推导、代码与练习，按先修顺序学习。完成标记保存在当前浏览器。`,`${chapters.length} chapters of principles, derivations, code and exercises in prerequisite order. Completion marks are saved in this browser.`))}<div class="catalog-toolbar"><label class="input-with-icon">${icon('Search')}<input type="search" id="catalog-search" placeholder="${t('搜索章节、算法或关键词','Search chapters, algorithms or keywords')}" aria-label="${t('搜索课程目录','Search curriculum')}"/></label><select id="catalog-filter" aria-label="${t('学习状态','Completion status')}"><option value="all">${t('全部章节','All chapters')}</option><option value="todo">${t('待学习','Not completed')}</option><option value="done">${t('已完成','Completed')}</option></select><button class="button subtle" id="expand-all">${t('展开全部','Expand all')}${icon('ChevronDown')}</button></div><div id="catalog-results" class="module-list"></div>`;
 const input=host.querySelector<HTMLInputElement>('#catalog-search')!,select=host.querySelector<HTMLSelectElement>('#catalog-filter')!;
 const draw=()=>{const q=input.value.trim().toLowerCase();const results=host.querySelector<HTMLElement>('#catalog-results')!;if(!q&&select.value==='all')results.innerHTML=modules.map(m=>moduleCard(m.id,m.id===1)).join('');else{const matches=chapters.filter(c=>`${c.title} ${c.subtitle} ${c.tags.join(' ')} ${c.body}`.toLowerCase().includes(q)&&(select.value==='all'||select.value==='done'&&state.completed.includes(c.id)||select.value==='todo'&&!state.completed.includes(c.id)));results.innerHTML=matches.length?`<p class="results-count" role="status">${matches.length} ${t('章','chapters')}</p><div class="chapter-list-card">${matches.map(chapterRow).join('')}</div>`:emptyState(t('没有找到对应章节','No matching chapters'),t('试试更短的关键词，或切换筛选条件。','Try a shorter query or another filter.'));}refreshIcons();};
 input.addEventListener('input',draw);select.addEventListener('change',draw);host.querySelector('#expand-all')!.addEventListener('click',()=>{const list=[...host.querySelectorAll('details')];const open=list.some(d=>!d.open);list.forEach(d=>d.open=open);host.querySelector('#expand-all')!.innerHTML=t(open?'收起全部':'展开全部',open?'Collapse all':'Expand all')+icon('ChevronDown');refreshIcons();});draw();}
async function renderChapter(host:HTMLElement,id:string,token:number){const c=getChapter(id);if(!c){renderNotFound(host);return;}const m=getModule(c.module),prior=chapters[c.number-2],next=chapters[c.number],hasCases=getFormulaCases().some(item=>item.chapterIds.includes(id));
 host.innerHTML=`<div class="reader-topline"><a class="text-link" href="#/curriculum">${icon('ArrowLeft')}${t('全部章节','All chapters')}</a><div class="reader-controls"><button class="icon-button" data-text-size aria-label="${t('切换正文字号','Change reading size')}">${icon('ZoomIn')}</button><button class="icon-button" data-download-chapter="${id}" aria-label="${t('下载本章 Markdown','Download this chapter as Markdown')}">${icon('Download')}</button></div></div><div class="reader-layout"><div class="reader-main"><header class="chapter-header"><div class="eyebrow">MODULE ${String(c.module).padStart(2,'0')} <span>/</span> ${esc(m.title)}</div><h1><span>${id}</span>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><div class="chapter-meta"><span>${icon('Clock3')}${c.duration} ${t('分钟阅读','min reading')}</span><span>${levelLabel(c.level)}</span>${c.lab?`<a href="#/lab/${c.lab}">${icon('FlaskConical')}${t('配套实验','Related experiment')}</a>`:''}</div></header><section class="objectives"><h2>${icon('Compass')}${t('读完这一章，你将能够','After this chapter, you can')}</h2><ul>${c.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>${c.prerequisites.length?`<p class="prerequisites">${t('预备知识：','Prerequisites: ')}${c.prerequisites.map(p=>`<a href="${chapterUrl(p)}">${t('第 ','Chapter ')}${p}${t(' 章','')}</a>`).join(' · ')}</p>`:''}</section>
 <nav class="reader-learning-path" aria-label="${t('本章学习顺序','Chapter learning sequence')}"><button data-reader-jump="chapter-guide-host">${t('① 水泥情景与逐步推导','① Cement case & derivation')}</button>${hasCases?`<button data-reader-jump="chapter-formula-cases">${t('② 改参数，算公式','② Adjust inputs & calculate')}</button>`:''}<button data-reader-jump="chapter-body">${hasCases?t('③ 系统正文与练习','③ Full explanation & exercises'):t('② 系统正文与练习','② Full explanation & exercises')}</button><a href="#/glossary">${t('查符号','Symbols')}</a><a href="#/primer">${t('补数学','Mathematics')}</a></nav><div id="chapter-guide-host"></div>${hasCases?'<section id="chapter-formula-cases" class="chapter-formula-cases"></section>':''}<div class="formal-section-label"><span class="eyebrow">CONNECT THE EXAMPLE TO THE GENERAL METHOD</span><h2>${t('从这个例子，走向完整方法。','From a worked example to the general method.')}</h2><p>${t('继续阅读系统定义、算法边界、代码与练习。','Continue with definitions, assumptions, code and exercises.')}</p></div><article class="prose" id="chapter-body" aria-label="${t('章节正文','Chapter text')}"></article>
 ${c.lab?`<section class="chapter-lab-cta">${icon('FlaskConical')}<div><b>${t('把直觉放进实验。','Put your intuition to the test.')}</b><p>${t('先预测，再改参数，最后解释变化。','Predict first, change a parameter, then explain the result.')}</p></div><a class="button primary" href="#/lab/${c.lab}">${t('打开实验','Open experiment')}${icon('ArrowRight')}</a></section>`:''}
 <section class="chapter-references"><h2>${t('本章参考资料','Chapter references')}</h2>${c.sources.map(id=>{const s=allSources().find(item=>item.ids.includes(id));return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(s.title)}<small>${esc(s.author)} · ${esc(s.year)}</small></span>${icon('ArrowUpRight')}</a>`:'';}).join('')}</section>
 <div class="chapter-finish"><div><span class="eyebrow">CHECK YOUR UNDERSTANDING</span><h3>${t('能解释每一步为什么成立吗？','Can you explain why each step holds?')}</h3><p>${t('完成例题与自检，再决定是否掌握。','Work through the examples and checks before marking completion.')}</p></div><button class="button ${state.completed.includes(id)?'outline':'primary'}" data-complete="${id}">${icon(state.completed.includes(id)?'CheckCheck':'Check')}${state.completed.includes(id)?t('已完成 · 撤销','Completed · undo'):t('标记为已完成','Mark complete')}</button></div>
 <div class="chapter-navigation">${prior?`<a href="${chapterUrl(prior.id)}">${icon('ArrowLeft')}<span><small>${t('上一章','Previous chapter')}</small>${esc(prior.title)}</span></a>`:'<span></span>'}${next?`<a href="${chapterUrl(next.id)}"><span><small>${t('下一章','Next chapter')}</small>${esc(next.title)}</span>${icon('ArrowRight')}</a>`:`<a href="#/research"><span><small>${t('完成主线之后','After the curriculum')}</small>${t('进入研究综述','Explore the research review')}</span>${icon('ArrowRight')}</a>`}</div></div>
 <aside class="reader-aside"><div class="toc-panel"><div class="toc-heading">${icon('ListChecks')}${t('本章导航','On this page')}</div><nav id="chapter-toc" aria-label="${t('本章目录','Chapter contents')}"></nav><div class="toc-tip"><span class="pill">${t('学习提示','Reading tip')}</span><p>${t('先读符号，再代入一个数字，最后检查成立条件。','Read the symbols, substitute a number, then check the assumptions.')}</p></div></div></aside></div>`;
 bindContentActions(host);host.querySelectorAll<HTMLButtonElement>('[data-reader-jump]').forEach(button=>button.addEventListener('click',()=>moveTo(host.querySelector('#'+button.dataset.readerJump))));
 const stopCases=hasCases?mountFormulaCasesForChapter(host.querySelector<HTMLElement>('#chapter-formula-cases')!,id):()=>{};
 const body=host.querySelector<HTMLElement>('#chapter-body')!;const rendering=Promise.all([renderMarkdown(body,c.body),mountChapterGuide(host.querySelector('#chapter-guide-host')!,id)]);
 const headings=[...body.querySelectorAll<HTMLHeadingElement>('h2,h3')];const toc=host.querySelector('#chapter-toc')!;toc.innerHTML=`<button data-scroll="chapter-guide-host">${t('水泥情景与逐步推导','Cement case & derivation')}</button>${hasCases?`<button data-scroll="chapter-formula-cases">${t('公式案例计算','Worked formula cases')}</button>`:''}<button data-scroll="chapter-body">${t('系统正文与练习','Full explanation & exercises')}</button>`+headings.map(h=>`<button data-scroll="${h.id}" class="${h.tagName==='H3'?'toc-sub':''}">${esc(h.textContent)}</button>`).join('');toc.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.addEventListener('click',()=>moveTo(document.getElementById(button.dataset.scroll!))));
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)toc.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.classList.toggle('current',b.dataset.scroll===entry.target.id));},{rootMargin:'-90px 0px -65% 0px'});headings.forEach(h=>observer.observe(h));const dispose=()=>{observer.disconnect();stopCases();};await rendering;if(token!==pageToken){dispose();return;}cleanup=dispose;
}
function renderLabs(host:HTMLElement){host.innerHTML=`${pageHeading(t('观察算法行为','EXPLORE ALGORITHM BEHAVIOR'),navigationLabels().labs,t(`${getLabs().length} 个实验展示采样、参数和迭代怎样影响算法。与公式案例的一次代入不同，这里重点观察机制和变化。`,`${getLabs().length} experiments explore how sampling, parameters and iteration affect an algorithm. Use worked formula cases for a single numerical substitution; use these labs to study behavior.`))}<section class="lab-intro-banner"><div><span class="eyebrow">PREDICT · ADJUST · EXPLAIN</span><h2>${t('先猜想，再实验，最后解释。','Predict, experiment, explain.')}</h2><p>${t('这里展示教学数值机制；完整训练与工业效果需要独立验证。','These are numerical teaching mechanisms. Full training and industrial outcomes need separate validation.')}</p></div></section><div class="lab-cards">${getLabs().map((lab,i)=>`<a href="#/lab/${lab.id}" class="lab-card ${getModule(Math.min(7,Math.floor(i/2)+1)).color}"><div class="lab-card-top"><span class="module-icon">${icon(lab.icon)}</span><span>EXPERIMENT ${String(lab.number).padStart(2,'0')}</span>${icon('ArrowRight')}</div><h2>${esc(lab.title)}</h2><p>${esc(lab.subtitle)}</p><div class="lab-card-bottom"><span>${t('浏览器教学模拟','Browser teaching simulation')}</span><span>${t('打开实验','Open experiment')}${icon('ArrowRight')}</span></div></a>`).join('')}</div>`;}
function renderLab(host:HTMLElement,id:string){const lab=findLab(id);if(!lab)return renderNotFound(host);host.innerHTML=`<div class="reader-topline"><a class="text-link" href="#/labs">${icon('ArrowLeft')}${t('全部实验','All experiments')}</a><a class="text-link" href="${chapterUrl(lab.chapter)}">${icon('BookOpen')}${t('阅读配套章节','Read the chapter')}${icon('ArrowRight')}</a></div>${pageHeading(`EXPERIMENT ${String(lab.number).padStart(2,'0')}`,esc(lab.title),esc(lab.subtitle))}<div class="lab-workspace"><aside class="lab-mini-nav"><h2>${t('实验目录','Experiments')}</h2>${getLabs().map(l=>`<a class="${l.id===lab.id?'active':''}" href="#/lab/${l.id}" ${l.id===lab.id?'aria-current="page"':''}><span>${String(l.number).padStart(2,'0')}</span>${esc(l.title)}</a>`).join('')}</aside><section class="lab-host" id="lab-host" aria-label="${t('交互实验','Interactive experiment')}"></section></div>`;const dispose=lab.render(host.querySelector('#lab-host')!);if(typeof dispose==='function')cleanup=dispose;}
function renderNotFound(host:HTMLElement){host.innerHTML=emptyState(t('这一页还没有坐标。','This page is off the map.'),t('链接可能已经变更，请从课程或研究目录重新进入。','The link may have changed. Open the curriculum or research index.'),'Compass')+`<div class="center"><a class="button primary" href="#/home">${t('返回学习总览','Return to overview')}${icon('ArrowRight')}</a></div>`;}
function bindContentActions(host:HTMLElement){host.querySelectorAll<HTMLButtonElement>('[data-complete]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.complete!,exists=state.completed.includes(id);state.completed=exists?state.completed.filter(x=>x!==id):[...state.completed,id];persist();b.classList.toggle('outline',!exists);b.classList.toggle('primary',exists);b.innerHTML=icon(exists?'Check':'CheckCheck')+(exists?t('标记为已完成','Mark complete'):t('已完成 · 撤销','Completed · undo'));refreshIcons();}));host.querySelector('[data-text-size]')?.addEventListener('click',()=>{state.textSize=state.textSize==='normal'?'large':'normal';persist();applyPreferences();});host.querySelector<HTMLButtonElement>('[data-download-chapter]')?.addEventListener('click',event=>{const c=getChapter((event.currentTarget as HTMLButtonElement).dataset.downloadChapter!)!,g=getChapterGuide(c.id);downloadFile(editionFilename(`rl-atlas-chapter-${c.id}`),chapterDownloadMarkdown(c,g,getLocale()));});}
function renderSearch(query:string){const results=searchLearning(query).slice(0,24);document.getElementById('search-results')!.innerHTML=query.trim()?results.length?results.map(result=>`<a class="search-result" href="${result.href}"><span>${esc(result.label)}</span><div><b>${esc(result.title)}</b><small>${esc(result.subtitle)}</small></div>${icon('ArrowRight')}</a>`).join(''):emptyState(t('没有找到相关内容','No matching content'),t('尝试另一个概念或算法名称。','Try another concept or algorithm.')):`<p class="search-empty-hint">${t('输入一个问题，从章节、公式案例和研究中寻找线索。','Type a question to explore chapters, worked cases and research.')}</p>`;refreshIcons();}
function openSearch(){const dialog=document.getElementById('search-dialog') as HTMLDialogElement;if(!dialog||dialog.open)return;const input=document.getElementById('global-search') as HTMLInputElement;renderSearch(input.value);dialog.showModal();input.focus();}
async function changeLocale(locale:Locale){const request=++localeRequest,scroll=window.scrollY;const control=app.querySelector<HTMLSelectElement>('[data-locale]');if(control)control.disabled=true;try{const bundle=await loadContentBundle(locale);if(request!==localeRequest)return;activateContent(bundle);setLocale(locale);state.locale=locale;persist();applyPreferences();await route(false);window.scrollTo({top:scroll,behavior:'instant'});}catch(error){console.error('Locale bundle failed',error);toast(t('语言内容加载失败，请重试。','The language edition could not load. Please try again.'));if(control){control.value=state.locale;control.disabled=false;}}}
function bindShell(){
 syncMenu();
 app.querySelector('[data-open-menu]')?.addEventListener('click',()=>{document.body.classList.add('menu-open');syncMenu();app.querySelector<HTMLAnchorElement>('.sidebar a')?.focus();});
 app.querySelector('[data-close-menu]')?.addEventListener('click',closeMenu);
 app.querySelector<HTMLSelectElement>('[data-theme]')?.addEventListener('change',event=>{
  const preference=(event.target as HTMLSelectElement).value;
  if(isThemePreference(preference)){state.theme=preference;persist();applyPreferences();}
 });
 app.querySelector<HTMLSelectElement>('[data-locale]')?.addEventListener('change',event=>{const locale=(event.target as HTMLSelectElement).value;if(isLocale(locale))void changeLocale(locale);});
 app.querySelector('[data-search]')?.addEventListener('click',openSearch);
 const dialog=app.querySelector<HTMLDialogElement>('#search-dialog')!;
 app.querySelector('[data-close-search]')?.addEventListener('click',()=>dialog.close());
 const input=app.querySelector<HTMLInputElement>('#global-search')!;
 input.addEventListener('input',()=>renderSearch(input.value));
 input.addEventListener('keydown',event=>{if(event.key==='Enter'){const first=dialog.querySelector<HTMLAnchorElement>('.search-result');if(first){event.preventDefault();dialog.close();location.hash=first.hash;}}});
 dialog.addEventListener('click',event=>{if((event.target as HTMLElement).closest('.search-result'))dialog.close();if(event.target===dialog)dialog.close();});
}
async function route(resetScroll=true){const token=++pageToken;closeFigureViewers();cleanup?.();cleanup=undefined;document.body.classList.remove('menu-open');const path=location.hash.replace(/^#\/?/,'').split('?')[0].split('/');const section=path[0]||'home',id=path[1]||'';const labels=navigationLabels();const label=section==='chapter'?getChapter(id)?.title:section==='lab'?findLab(id)?.title:section==='cases'&&id?getFormulaCase(id)?.title:section==='research'&&id?findResearchPage(id)?.title[getLocale()]:labels[section];shell(section==='chapter'?'curriculum':section==='lab'?'labs':section,label??t('页面未找到','Page not found'));document.title=`${label??'RL Atlas'} · RL Atlas`;const host=document.getElementById('main')!;if(resetScroll)window.scrollTo({top:0,behavior:'instant'});
 try{switch(section){
 case 'home':cleanup=renderHomePage(host)??undefined;break;
 case 'curriculum':renderCurriculum(host);break;
 case 'chapter':await renderChapter(host,id,token);break;
 case 'primer':{const dispose=await renderPrimerPage(host,id);if(token===pageToken)cleanup=dispose;else dispose();break;}
 case 'glossary':renderGlossaryPage(host);break;
 case 'cases':cleanup=renderFormulaCasesPage(host,id);break;
 case 'labs':renderLabs(host);break;
 case 'lab':renderLab(host,id);break;
 case 'kiln':host.innerHTML=`${pageHeading(t('综合教学推演','AN INTEGRATED TEACHING SIMULATION'),navigationLabels().kiln,t('把一次设定值建议放回完整过程：检查安全门控，观察动态响应和延迟化验。初始 880°C 指分解炉出口温度设定值。','Follow a setpoint proposal through safety gates, process dynamics and delayed assays. The initial 880°C target is the calciner outlet temperature setpoint.'))}<div class="kiln-page-links"><a class="button outline" href="#/primer/language">${t('先理解动作与时间','Actions and time')}</a><a class="button outline" href="#/chapter/21">${t('完整建模推导','Full modelling derivation')}</a><a class="button outline" href="#/research/architecture">${t('研究架构','Research architecture')}</a></div><div id="kiln-workbench"></div>`;cleanup=mountKilnWorkbench(host.querySelector('#kiln-workbench')!);break;
 case 'research':{const dispose=await renderResearch(host,id);if(token===pageToken)cleanup=dispose;else dispose?.();break;}
 case 'roadmap':await renderRoadmapPage(host,id,state.completed);break;
 case 'references':renderReferences(host);break;
 case 'gallery':await renderGallery(host,id);break;
 default:renderNotFound(host);
 }}catch(error){console.error('Page rendering failed',error);if(token===pageToken)host.innerHTML=emptyState(t('页面加载遇到问题','This page could not load'),t('请刷新后重试，或返回学习总览。','Refresh and try again, or return to the overview.'),'Compass')+`<a class="button primary" href="#/home">${t('返回学习总览','Return to overview')}</a>`;}
 if(token===pageToken)refreshIcons();
}
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}if(event.key==='Escape'&&document.body.classList.contains('menu-open'))closeMenu();if(event.key==='Tab'&&document.body.classList.contains('menu-open')&&window.innerWidth<=760){const focusable=[...app.querySelectorAll<HTMLElement>('.sidebar a,.sidebar button')],first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
document.querySelector('.skip-link')?.addEventListener('click',event=>{event.preventDefault();document.getElementById('main')?.focus();});window.addEventListener('hashchange',()=>{void route();});window.addEventListener('resize',syncMenu);
systemColorScheme.addEventListener('change',()=>{if(state.theme==='system')applyPreferences();});
async function boot(){setLocale(state.locale);applyPreferences();app.innerHTML=`<main class="boot-loading" role="status">${t('正在展开学习地图…','Opening the learning fieldbook…')}</main>`;try{const bundle=await loadContentBundle(state.locale);activateContent(bundle);await route();}catch(error){console.error(error);app.innerHTML=`<main class="boot-loading"><h1>${t('内容加载失败','Content failed to load')}</h1><button id="retry-boot">${t('重试','Try again')}</button></main>`;document.getElementById('retry-boot')!.addEventListener('click',()=>{void boot();});}}
void boot();
