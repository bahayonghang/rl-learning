import katex from 'katex';
import { getChapterGuide } from './content/guides';
import { primerUnits, primerIntroduction } from './content/primer';
import { glossary } from './content/glossary';
import { researchBody, researchSources } from './content/research';
import { escapeHtml as esc, renderMarkdown } from './render';
import { mountPrimerCalculator } from './primer-calculators';
import './learning.css';

const formula = (source: string, display = false) => katex.renderToString(source, { displayMode:display, throwOnError:false, trust:false, strict:'ignore' });
const count = (value: number) => String(value).padStart(2,'0');

export async function mountChapterGuide(host: HTMLElement, chapterId: string): Promise<void> {
  const guide=getChapterGuide(chapterId);
  if(!guide)return;
  const primers=primerUnits.filter(unit=>unit.chapters.includes(chapterId));
  host.innerHTML=`<section class="chapter-guide" aria-labelledby="guide-title">
    <header class="guide-header"><div><span class="eyebrow">FOLLOW THE REASONING · CEMENT KILN</span><h2 id="guide-title">把这一章，放进水泥烧成系统。</h2></div><span class="guide-count">${guide.steps.length} 步推导</span></header>
    <div class="guide-scenario"><span class="lesson-label">当前窑况 / 教学情景</span><div class="prose compact-prose" data-scenario></div><div class="guide-question"><b>这一章要回答</b><div class="prose compact-prose" data-question></div></div><div class="prose compact-prose" data-intuition></div></div>
    <details class="guide-symbols"><summary>先认清符号 · ${guide.symbols.length} 个量分别代表什么</summary><div class="table-scroll"><table><thead><tr><th scope="col">符号</th><th scope="col">名称</th><th scope="col">在这个案例中的含义</th></tr></thead><tbody>${guide.symbols.map(s=>`<tr><td>${formula(s.symbol)}</td><td>${esc(s.name)}</td><td>${esc(s.meaning)}</td></tr>`).join('')}</tbody></table></div></details>
    <div class="guide-mode-bar"><span>每次看懂一步，再继续。</span><button class="text-button" data-guide-all aria-expanded="false">展开全部推导</button></div>
    <div class="guide-workspace"><nav class="guide-step-nav" aria-label="推导步骤">${guide.steps.map((step,index)=>`<button type="button" data-guide-step="${index}" aria-controls="guide-step-panel" aria-current="${index===0?'step':'false'}"><span>${count(index+1)}</span><b>${esc(step.title)}</b></button>`).join('')}</nav><div id="guide-step-panel" class="guide-step-panel"></div></div>
    <section class="guide-checkpoint" aria-labelledby="checkpoint-title"><div class="lesson-label">CHECK YOUR UNDERSTANDING</div><h3 id="checkpoint-title">先做判断，再看解释</h3><div class="prose compact-prose" data-check-question></div><fieldset><legend class="sr-only">选择你认为正确的解释</legend>${guide.checkpoint.options.map((option,index)=>`<label class="checkpoint-option"><input type="radio" name="checkpoint-${chapterId}" value="${index}"/><span class="option-letter">${String.fromCharCode(65+index)}</span><span data-option-text="${index}"></span></label>`).join('')}</fieldset><div class="checkpoint-feedback" role="status" aria-live="polite" hidden></div></section>
    <div class="guide-takeaway"><span class="lesson-label">带回你的研究</span><div class="prose compact-prose" data-takeaway></div></div>
    <div class="guide-footer"><a href="#/kiln">到水泥工作台验证 →</a>${primers.length?primers.map(unit=>`<a href="#/primer/${unit.id}">补一块数学：${esc(unit.title)} →</a>`).join(''):'<a href="#/glossary">查概念与符号 →</a>'}</div>
  </section>`;
  await Promise.all([
    renderMarkdown(host.querySelector('[data-scenario]')!,guide.scenario),
    renderMarkdown(host.querySelector('[data-question]')!,guide.decisionQuestion),
    renderMarkdown(host.querySelector('[data-intuition]')!,guide.intuition),
    renderMarkdown(host.querySelector('[data-check-question]')!,guide.checkpoint.question),
    renderMarkdown(host.querySelector('[data-takeaway]')!,guide.takeaway),
    ...guide.checkpoint.options.map((option,index)=>renderMarkdown(host.querySelector(`[data-option-text="${index}"]`)!,option)),
  ]);
  let current=0,all=false;
  const panel=host.querySelector<HTMLElement>('#guide-step-panel')!;
  const draw=async()=>{
    const indexes=all?guide.steps.map((_,index)=>index):[current];
    panel.innerHTML=indexes.map(index=>`<article class="derivation-card"><div class="step-counter">步骤 ${index+1} / ${guide.steps.length}</div><h3 tabindex="-1">${esc(guide.steps[index].title)}</h3><div class="prose compact-prose" data-explanation="${index}"></div>${guide.steps[index].formula?`<div class="derivation-equation">${formula(guide.steps[index].formula!,true)}</div>`:''}<div class="derivation-example"><span class="lesson-label">代入数字，看见每一步</span><div class="prose compact-prose" data-example="${index}"></div></div><div class="derivation-why"><span class="lesson-label">为什么需要这一步</span><div class="prose compact-prose" data-why="${index}"></div></div></article>`).join('')+
      (all?'':`<div class="step-controls"><button class="button outline" data-guide-prev ${current===0?'disabled':''}>← 上一步</button><span>${current+1} / ${guide.steps.length}</span><button class="button primary" data-guide-next ${current===guide.steps.length-1?'disabled':''}>下一步 →</button></div>`);
    host.querySelectorAll<HTMLElement>('[data-guide-step]').forEach((button,index)=>button.setAttribute('aria-current',!all&&index===current?'step':'false'));
    await Promise.all(indexes.flatMap(index=>[
      renderMarkdown(panel.querySelector(`[data-explanation="${index}"]`)!,guide.steps[index].explanation),
      renderMarkdown(panel.querySelector(`[data-example="${index}"]`)!,guide.steps[index].example),
      renderMarkdown(panel.querySelector(`[data-why="${index}"]`)!,guide.steps[index].why),
    ]));
  };
  const allButton=host.querySelector<HTMLButtonElement>('[data-guide-all]')!;
  host.addEventListener('click',event=>{
    const button=(event.target as HTMLElement).closest<HTMLElement>('button');
    if(!button)return;
    const restoreReadingFocus=button.hasAttribute('data-guide-next')||button.hasAttribute('data-guide-prev');
    if(button.hasAttribute('data-guide-step')){current=Number(button.dataset.guideStep);all=false;}
    else if(button.hasAttribute('data-guide-next'))current=Math.min(current+1,guide.steps.length-1);
    else if(button.hasAttribute('data-guide-prev'))current=Math.max(0,current-1);
    else if(button.hasAttribute('data-guide-all'))all=!all;
    else return;
    allButton.textContent=all?'回到逐步阅读':'展开全部推导';allButton.setAttribute('aria-expanded',String(all));
    void draw().then(()=>{
      if(restoreReadingFocus&&host.isConnected)panel.querySelector<HTMLHeadingElement>('.derivation-card h3')?.focus();
    });
  });
  host.querySelector('fieldset')!.addEventListener('change',async event=>{
    const selected=Number((event.target as HTMLInputElement).value);
    const correct=selected===guide.checkpoint.correctIndex;
    const feedback=host.querySelector<HTMLElement>('.checkpoint-feedback')!;
    feedback.hidden=false;feedback.classList.toggle('is-correct',correct);
    feedback.innerHTML=`<b>${correct?'这个判断成立。':'再想一步：'}</b><div class="prose compact-prose"></div>`;
    host.querySelectorAll('.checkpoint-option').forEach((option,index)=>option.classList.toggle('is-selected',index===selected));
    await renderMarkdown(feedback.querySelector('.prose')!,guide.checkpoint.feedback[selected]);
  });
  await draw();
}

export async function renderPrimerPage(host: HTMLElement, id: string): Promise<()=>void> {
  const unit=primerUnits.find(item=>item.id===id)??primerUnits[0];
  host.innerHTML=`<header class="page-heading"><div><p class="eyebrow">MATHEMATICS, ONE IDEA AT A TIME</p><h1>先把数学，变成能算的例子。</h1><p>${esc(primerIntroduction)}</p></div></header>
    <nav class="primer-navigation" aria-label="数学准备单元">${primerUnits.map(item=>`<a href="#/primer/${item.id}" class="primer-unit-link ${item.id===unit.id?'is-active':''}" ${item.id===unit.id?'aria-current="page"':''}><span>${count(item.number)}</span><b>${esc(item.title)}</b><small>${esc(item.summary)}</small></a>`).join('')}</nav>
    <section class="primer-unit"><header><span class="eyebrow">MATH NOTE ${count(unit.number)}</span><h2>${esc(unit.title)}</h2><p>${esc(unit.summary)}</p><a class="text-link" href="#primer-calculator">跳到动手计算 ↓</a></header><div class="primer-reading-grid"><article class="prose primer-body" id="primer-body"></article><aside class="primer-calculator-panel" id="primer-calculator"><div class="lesson-label">现在动手算一遍</div><div id="primer-calculator-host"></div></aside></div></section>
    <section class="primer-next"><div><span class="lesson-label">把这一块数学用起来</span><p>${unit.chapters.map(chapter=>`<a href="#/chapter/${chapter}">第 ${chapter} 章 →</a>`).join('')}</p></div>${unit.number<primerUnits.length?`<a class="button primary" href="#/primer/${primerUnits[unit.number].id}">继续下一块数学 →</a>`:'<a class="button primary" href="#/chapter/01">回到强化学习主线 →</a>'}</section>
    <p class="learning-sources">数学基础参考 <a href="https://stat110.hsites.harvard.edu/" target="_blank" rel="noopener noreferrer">Harvard Stat 110</a>；RL 符号与递推参考 <a href="https://mitpress.mit.edu/9780262039246/reinforcement-learning/" target="_blank" rel="noopener noreferrer">Sutton & Barto</a>。例题与计算器为本教程独立编写。</p>`;
  host.querySelector<HTMLAnchorElement>('[href="#primer-calculator"]')!.addEventListener('click',event=>{
    event.preventDefault();host.querySelector('#primer-calculator')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const cleanup=mountPrimerCalculator(host.querySelector('#primer-calculator-host')!,unit.calculator);
  await renderMarkdown(host.querySelector('#primer-body')!,unit.body);
  return cleanup;
}

export function renderGlossaryPage(host: HTMLElement): void {
  host.innerHTML=`<header class="page-heading"><div><p class="eyebrow">A SHARED LANGUAGE FOR YOUR RESEARCH</p><h1>看懂符号，也看懂它在窑里代表什么。</h1><p>${glossary.length} 个概念，连接公式、工艺含义与常见误解。忘记一个词时，可以随时回来查。</p></div></header><div class="glossary-toolbar"><label for="glossary-search">查概念、英文缩写或工艺量</label><input type="search" id="glossary-search" placeholder="试试：动作、f-CaO、SP、概率、离线…"/><div class="glossary-groups" role="group" aria-label="概念类别">${['全部','决策基本量','概率与学习','工业与研究'].map((group,index)=>`<button class="button ${index===0?'primary':'outline'}" data-group="${group}" aria-pressed="${index===0}">${group}</button>`).join('')}</div></div><p class="glossary-count" role="status"></p><div class="glossary-grid"></div>`;
  let group='全部';
  const input=host.querySelector<HTMLInputElement>('#glossary-search')!;
  const draw=()=>{
    const query=input.value.trim().toLowerCase();
    const matches=glossary.filter(item=>(group==='全部'||item.group===group)&&`${item.term} ${item.english} ${item.meaning} ${item.kiln} ${item.caution}`.toLowerCase().includes(query));
    host.querySelector('.glossary-count')!.textContent=`找到 ${matches.length} 个概念`;
    host.querySelector('.glossary-grid')!.innerHTML=matches.length?matches.map(item=>`<article class="glossary-card"><header><div><span>${esc(item.english)}</span><h2>${esc(item.term)}</h2></div>${item.symbol?`<div class="glossary-symbol">${formula(item.symbol)}</div>`:''}</header><p>${esc(item.meaning)}</p><div><b>放到水泥烧成系统里</b><p>${esc(item.kiln)}</p></div><aside>${esc(item.caution)}</aside><a href="#/chapter/${item.chapter}">到第 ${item.chapter} 章进一步理解 →</a></article>`).join(''):'<p>没有匹配的概念。试试更短的关键词，或切换到全部类别。</p>';
  };
  input.addEventListener('input',draw);
  host.querySelectorAll<HTMLButtonElement>('[data-group]').forEach(button=>button.addEventListener('click',()=>{
    group=button.dataset.group!;
    host.querySelectorAll<HTMLButtonElement>('[data-group]').forEach(other=>{const selected=other===button;other.classList.toggle('primary',selected);other.classList.toggle('outline',!selected);other.setAttribute('aria-pressed',String(selected));});
    draw();
  }));
  draw();
}

export async function renderResearchPage(host: HTMLElement): Promise<void> {
  host.innerHTML=`<header class="research-hero"><div><p class="eyebrow">FROM YOUR CURRENT MODELS TO SEQUENTIAL DECISIONS</p><h1>让已有研究，接上强化学习。</h1><p>从软测量、时序预测和多目标轨迹优化出发，提出可以验证、也可能被推翻的研究问题。</p><div><a class="button primary" href="#/kiln">先到水泥工作台 →</a><a class="button outline" href="#/chapter/22">从离线 RL 开始</a></div></div><img src="./images/industry.webp" alt="研究者围绕水泥烧成系统的模型、设定轨迹和控制边界展开协作"/></header><div class="research-layout"><article id="research-body" class="prose"></article><aside class="research-toc"><span class="lesson-label">研究路线导航</span><nav aria-label="研究专题目录"></nav></aside></div><section class="research-references"><h2>专题原始资料</h2>${researchSources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(source.title)}</b><span>${esc(source.author)} · ${esc(source.year)}</span><small>${esc(source.note)}</small></a>`).join('')}</section>`;
  await renderMarkdown(host.querySelector('#research-body')!,researchBody);
  if(!host.isConnected)return;
  const headings=Array.from(host.querySelectorAll<HTMLElement>('#research-body h2'));
  host.querySelector('.research-toc nav')!.innerHTML=headings.map(heading=>`<a href="#${heading.id}" data-research-heading="${heading.id}">${esc(heading.textContent)}</a>`).join('');
  host.querySelectorAll<HTMLAnchorElement>('[data-research-heading]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();host.querySelector('#'+link.dataset.researchHeading)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }));
}

