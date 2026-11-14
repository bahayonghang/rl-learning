import katex from 'katex';
import { getChapterGuide, primerUnits, primerIntroduction, glossary } from './content/localized';
import { text as t } from './i18n';
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
    <header class="guide-header"><div><span class="eyebrow">FOLLOW THE REASONING · CEMENT KILN</span><h2 id="guide-title">${t('把这一章，放进水泥烧成系统。','Put this chapter inside the cement kiln.')}</h2></div><span class="guide-count">${guide.steps.length} ${t('步推导','steps')}</span></header>
    <div class="guide-scenario"><span class="lesson-label">${t('当前窑况 / 教学情景','CURRENT KILN / TEACHING SCENARIO')}</span><div class="prose compact-prose" data-scenario></div><div class="guide-question"><b>${t('这一章要回答','THE QUESTION TO ANSWER')}</b><div class="prose compact-prose" data-question></div></div><div class="prose compact-prose" data-intuition></div></div>
    <details class="guide-symbols"><summary>${t('先认清符号','Start with the symbols')} · ${guide.symbols.length} ${t('个量分别代表什么','quantities explained')}</summary><div class="table-scroll"><table><thead><tr><th scope="col">${t('符号','Symbol')}</th><th scope="col">${t('名称','Name')}</th><th scope="col">${t('在这个案例中的含义','Meaning in this example')}</th></tr></thead><tbody>${guide.symbols.map(s=>`<tr><td>${formula(s.symbol)}</td><td>${esc(s.name)}</td><td>${esc(s.meaning)}</td></tr>`).join('')}</tbody></table></div></details>
    <div class="guide-mode-bar"><span>${t('每次看懂一步，再继续。','Understand one step, then move on.')}</span><button class="text-button" data-guide-all aria-expanded="false">${t('展开全部推导','Show all derivation steps')}</button></div>
    <div class="guide-workspace"><nav class="guide-step-nav" aria-label="${t('推导步骤','Derivation steps')}">${guide.steps.map((step,index)=>`<button type="button" data-guide-step="${index}" aria-controls="guide-step-panel" aria-current="${index===0?'step':'false'}"><span>${count(index+1)}</span><b>${esc(step.title)}</b></button>`).join('')}</nav><div id="guide-step-panel" class="guide-step-panel"></div></div>
    <section class="guide-checkpoint" aria-labelledby="checkpoint-title"><div class="lesson-label">CHECK YOUR UNDERSTANDING</div><h3 id="checkpoint-title">${t('先做判断，再看解释','Make a choice, then examine the reasoning')}</h3><div class="prose compact-prose" data-check-question></div><fieldset><legend class="sr-only">${t('选择你认为正确的解释','Choose the explanation you think is correct')}</legend>${guide.checkpoint.options.map((option,index)=>`<label class="checkpoint-option"><input type="radio" name="checkpoint-${chapterId}" value="${index}"/><span class="option-letter">${String.fromCharCode(65+index)}</span><span data-option-text="${index}"></span></label>`).join('')}</fieldset><div class="checkpoint-feedback" role="status" aria-live="polite" hidden></div></section>
    <div class="guide-takeaway"><span class="lesson-label">${t('带回你的研究','TAKE IT INTO YOUR RESEARCH')}</span><div class="prose compact-prose" data-takeaway></div></div>
    <div class="guide-footer"><a href="#/kiln">${t('到水泥工作台验证 →','Try it in the kiln workbench →')}</a>${primers.length?primers.map(unit=>`<a href="#/primer/${unit.id}">${t('数学准备：','Mathematics: ')}${esc(unit.title)} →</a>`).join(''):`<a href="#/glossary">${t('查概念与符号 →','Look up concepts and symbols →')}</a>`}</div>
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
    panel.innerHTML=indexes.map(index=>`<article class="derivation-card"><div class="step-counter">${t('步骤','STEP')} ${index+1} / ${guide.steps.length}</div><h3 tabindex="-1">${esc(guide.steps[index].title)}</h3><div class="prose compact-prose" data-explanation="${index}"></div>${guide.steps[index].formula?`<div class="derivation-equation">${formula(guide.steps[index].formula!,true)}</div>`:''}<div class="derivation-example"><span class="lesson-label">${t('代入数字，看见每一步','SUBSTITUTE NUMBERS, SEE EACH STEP')}</span><div class="prose compact-prose" data-example="${index}"></div></div><div class="derivation-why"><span class="lesson-label">${t('为什么需要这一步','WHY THIS STEP MATTERS')}</span><div class="prose compact-prose" data-why="${index}"></div></div></article>`).join('')+
      (all?'':`<div class="step-controls"><button class="button outline" data-guide-prev ${current===0?'disabled':''}>${t('← 上一步','← Previous step')}</button><span>${current+1} / ${guide.steps.length}</span><button class="button primary" data-guide-next ${current===guide.steps.length-1?'disabled':''}>${t('下一步 →','Next step →')}</button></div>`);
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
    allButton.textContent=all?t('回到逐步阅读','Return to step-by-step reading'):t('展开全部推导','Show all derivation steps');allButton.setAttribute('aria-expanded',String(all));
    void draw().then(()=>{
      if(restoreReadingFocus&&host.isConnected)panel.querySelector<HTMLHeadingElement>('.derivation-card h3')?.focus();
    });
  });
  host.querySelector('fieldset')!.addEventListener('change',async event=>{
    const selected=Number((event.target as HTMLInputElement).value);
    const correct=selected===guide.checkpoint.correctIndex;
    const feedback=host.querySelector<HTMLElement>('.checkpoint-feedback')!;
    feedback.hidden=false;feedback.classList.toggle('is-correct',correct);
    feedback.innerHTML=`<b>${correct?t('这个判断成立。','That reasoning holds.'):t('再想一步：','Think one step further:')}</b><div class="prose compact-prose"></div>`;
    host.querySelectorAll('.checkpoint-option').forEach((option,index)=>option.classList.toggle('is-selected',index===selected));
    await renderMarkdown(feedback.querySelector('.prose')!,guide.checkpoint.feedback[selected]);
  });
  await draw();
}

export async function renderPrimerPage(host: HTMLElement, id: string): Promise<()=>void> {
  const unit=primerUnits.find(item=>item.id===id)??primerUnits[0];
  host.innerHTML=`<header class="page-heading"><div><p class="eyebrow">MATHEMATICS, ONE IDEA AT A TIME</p><h1>${t('先把数学，变成能算的例子。','Turn mathematics into examples you can calculate.')}</h1><p>${esc(primerIntroduction)}</p></div></header>
    <nav class="primer-navigation" aria-label="${t('数学准备单元','Mathematics preparation units')}">${primerUnits.map(item=>`<a href="#/primer/${item.id}" class="primer-unit-link ${item.id===unit.id?'is-active':''}" ${item.id===unit.id?'aria-current="page"':''}><span>${count(item.number)}</span><b>${esc(item.title)}</b><small>${esc(item.summary)}</small></a>`).join('')}</nav>
    <section class="primer-unit"><header><span class="eyebrow">MATH NOTE ${count(unit.number)}</span><h2>${esc(unit.title)}</h2><p>${esc(unit.summary)}</p><a class="text-link" href="#primer-calculator">${t('跳到动手计算 ↓','Jump to the calculator ↓')}</a></header><div class="primer-reading-grid"><article class="prose primer-body" id="primer-body"></article><aside class="primer-calculator-panel" id="primer-calculator"><div class="lesson-label">${t('现在动手算一遍','TRY THE CALCULATION')}</div><div id="primer-calculator-host"></div></aside></div></section>
    <section class="primer-next"><div><span class="lesson-label">${t('把这一块数学用起来','PUT THIS MATHEMATICS TO WORK')}</span><p>${unit.chapters.map(chapter=>`<a href="#/chapter/${chapter}">${t('第 '+chapter+' 章','Chapter '+chapter)} →</a>`).join('')}</p></div>${unit.number<primerUnits.length?`<a class="button primary" href="#/primer/${primerUnits[unit.number].id}">${t('继续下一块数学 →','Next mathematics unit →')}</a>`:`<a class="button primary" href="#/chapter/01">${t('回到强化学习主线 →','Return to the RL course →')}</a>`}</section>
    <p class="learning-sources">${t('数学基础参考 ','Mathematics references: ')}<a href="https://stat110.hsites.harvard.edu/" target="_blank" rel="noopener noreferrer">Harvard Stat 110</a>${t('；RL 符号与递推参考 ','; RL notation and recursions: ')}<a href="https://mitpress.mit.edu/9780262039246/reinforcement-learning/" target="_blank" rel="noopener noreferrer">Sutton & Barto</a>${t('。例题与计算器为本教程独立编写。','. Examples and calculators are original teaching material.')}</p>`;
  host.querySelector<HTMLAnchorElement>('[href="#primer-calculator"]')!.addEventListener('click',event=>{
    event.preventDefault();host.querySelector('#primer-calculator')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const cleanup=mountPrimerCalculator(host.querySelector('#primer-calculator-host')!,unit.calculator);
  await renderMarkdown(host.querySelector('#primer-body')!,unit.body);
  return cleanup;
}

export function renderGlossaryPage(host: HTMLElement): void {
  const groupLabel=(key:string)=>({'全部':t('全部','All'),'决策基本量':t('决策基本量','Decision quantities'),'概率与学习':t('概率与学习','Probability & learning'),'工业与研究':t('工业与研究','Process & research')}[key]??key);
  host.innerHTML=`<header class="page-heading"><div><p class="eyebrow">A SHARED LANGUAGE FOR YOUR RESEARCH</p><h1>${t('看懂符号，也看懂它在窑里代表什么。','Understand the symbol—and its meaning in the kiln.')}</h1><p>${t(glossary.length+' 个概念，连接公式、工艺含义与常见误解。忘记一个词时，可以随时回来查。',glossary.length+' concepts connecting formulas, process meaning and common misconceptions. Return whenever a term needs clarification.')}</p></div></header><div class="glossary-toolbar"><label for="glossary-search">${t('查概念、英文缩写或工艺量','Search a concept, abbreviation or process variable')}</label><input type="search" id="glossary-search" placeholder="${t('试试：动作、f-CaO、SP、概率、离线…','Try: action, f-CaO, SP, probability, offline…')}"/><div class="glossary-groups" role="group" aria-label="${t('概念类别','Concept categories')}">${['全部','决策基本量','概率与学习','工业与研究'].map((group,index)=>`<button class="button ${index===0?'primary':'outline'}" data-group="${group}" aria-pressed="${index===0}">${esc(groupLabel(group))}</button>`).join('')}</div></div><p class="glossary-count" role="status"></p><div class="glossary-grid"></div>`;
  let group='全部';
  const input=host.querySelector<HTMLInputElement>('#glossary-search')!;
  const draw=()=>{
    const query=input.value.trim().toLowerCase();
    const matches=glossary.filter(item=>(group==='全部'||item.group===group)&&`${item.term} ${item.english} ${item.meaning} ${item.kiln} ${item.caution}`.toLowerCase().includes(query));
    host.querySelector('.glossary-count')!.textContent=t(`找到 ${matches.length} 个概念`,`${matches.length} concepts found`);
    host.querySelector('.glossary-grid')!.innerHTML=matches.length?matches.map(item=>`<article class="glossary-card"><header><div><span>${esc(item.english)}</span><h2>${esc(item.term)}</h2></div>${item.symbol?`<div class="glossary-symbol">${formula(item.symbol)}</div>`:''}</header><p>${esc(item.meaning)}</p><div><b>${t('放到水泥烧成系统里','IN THE CEMENT CALCINATION SYSTEM')}</b><p>${esc(item.kiln)}</p></div><aside>${esc(item.caution)}</aside><a href="#/chapter/${item.chapter}">${t('到第 '+item.chapter+' 章进一步理解','Explore in Chapter '+item.chapter)} →</a></article>`).join(''):`<p>${t('没有匹配的概念。试试更短的关键词，或切换到全部类别。','No concepts match. Try a shorter keyword or select all categories.')}</p>`;
  };
  input.addEventListener('input',draw);
  host.querySelectorAll<HTMLButtonElement>('[data-group]').forEach(button=>button.addEventListener('click',()=>{
    group=button.dataset.group!;
    host.querySelectorAll<HTMLButtonElement>('[data-group]').forEach(other=>{const selected=other===button;other.classList.toggle('primary',selected);other.classList.toggle('outline',!selected);other.setAttribute('aria-pressed',String(selected));});
    draw();
  }));
  draw();
}
