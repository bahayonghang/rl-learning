import { chapters, modules, primerUnits } from './content/localized';
import { getLabs } from './labs';
import { getFormulaCases } from './formula-cases';
import { researchPages } from './research/content';
import { allSources } from './source-catalogue';
import { illustratedFigure } from './figures';
import { renderLearningPathCards } from './learning-path-view';
import { navigationLabels } from './navigation';
import { text as t } from './i18n';
import { escapeHtml as esc } from './html';
import { icon, refreshIcons } from './ui';
import './home.css';

interface HierarchyLayer {
  number: string;
  label: string;
  description: string;
  href: string;
  action: string;
  top: number;
  height: number;
}

/** Match the existing artwork's reading order; the numbers are not lesson steps. */
function hierarchyLayers(): HierarchyLayer[] {
  return [
    {
      number: '04', label: t('信息', 'Information'),
      description: t('先看现在能知道什么。在线测量和延迟公布的质量化验有不同时间，未来才发布的结果不能提前使用。', 'Start with what is available now. Online measurements and delayed quality assays have different timestamps; future releases cannot be used early.'),
      href: '#/primer/language', action: t('读懂观测与时间', 'Understand observations and time'), top: 1, height: 24,
    },
    {
      number: '03', label: t('决策', 'Decisions'),
      description: t('策略建议下一步的目标变化，例如把分解炉出口温度设定值从 880°C 调到 881°C。建议还需经过独立的执行检查。', 'A policy proposes a target change, such as moving the calciner-outlet setpoint from 880°C to 881°C. Independent execution checks still apply.'),
      href: '#/cases/setpoint-response', action: t('计算一次设定值调整', 'Calculate a setpoint change'), top: 26, height: 24,
    },
    {
      number: '02', label: t('控制', 'Control'),
      description: t('下层 PID/APC 控制器负责跟踪目标。设定值是希望达到的温度，测量值是实际温度，两者不会瞬间相等。', 'The lower-level PID/APC controllers track the target. A setpoint is the desired temperature; a measurement is the actual temperature. They do not change together instantly.'),
      href: '#/kiln', action: t('在工作台观察跟踪过程', 'Observe tracking in the workbench'), top: 51, height: 19,
    },
    {
      number: '01', label: t('过程', 'Process'),
      description: t('预热、分解、烧成和冷却决定真实响应。教学工作台用简化动态展示惯性与扰动，不能据此推断现场节能效果。', 'Preheating, calcination, burning and cooling determine the physical response. The workbench illustrates inertia and disturbances with simplified teaching dynamics.'),
      href: '#/research/history', action: t('理解工业决策的控制层级', 'Explore the industrial control hierarchy'), top: 71, height: 28,
    },
  ];
}

function renderSourceStrip(): string {
  const sources = allSources();
  const links = [
    { id: 'r2-rlbook', label: 'Sutton & Barto · 2018' },
    { id: 'r2-skogestad', label: 'Skogestad · 2000' },
  ].map(item => {
    const source = sources.find(entry => entry.ids.includes(item.id));
    return source ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" title="${esc(source.title)}">${esc(item.label)}${icon('ArrowUpRight')}<span class="sr-only">${t('，在新标签页打开', ', opens in a new tab')}</span></a>` : '';
  }).join('');
  return `<div class="home-source-strip"><span>${t('基础来源', 'Reading foundations')}</span>${links}</div>`;
}

function renderLearningTools(): string {
  const labels = navigationLabels();
  const tools = [
    {
      href: '#/curriculum', icon: 'BookOpen', title: labels.curriculum,
      count: t(`${modules.length} 个模块 · ${chapters.length} 章`, `${modules.length} modules · ${chapters.length} chapters`),
      outcome: t('系统理解 RL：从交互与回报，一步步推到价值学习、PPO、SAC 和离线决策。', 'Build the full RL picture: work from interaction and returns through value learning, PPO, SAC and offline decisions.'),
    },
    {
      href: '#/primer', icon: 'Lightbulb', title: labels.primer,
      count: t(`${primerUnits.length} 个数学单元`, `${primerUnits.length} mathematics units`),
      outcome: t('补齐读公式时需要的概率、期望与梯度；先看小例子，再回到对应章节。', 'Fill gaps in probability, expectation and gradients with small examples, then return to the relevant chapter.'),
    },
    {
      href: '#/cases', icon: 'Calculator', title: labels.cases,
      count: t(`${getFormulaCases().length} 组可计算案例`, `${getFormulaCases().length} worked cases`),
      outcome: t('修改具体数值，核对公式、逐项代入和结果解释，完成一次可复算的计算。', 'Change numerical inputs and check the equation, substitutions and interpretation in one reproducible calculation.'),
    },
    {
      href: '#/labs', icon: 'FlaskConical', title: labels.labs,
      count: t(`${getLabs().length} 个算法实验`, `${getLabs().length} algorithm experiments`),
      outcome: t('改变参数或运行迭代，观察学习机制怎样变化；随机实验可以固定种子。', 'Change parameters or run iterations to investigate an algorithm. Random experiments support repeatable seeds.'),
    },
    {
      href: '#/kiln', icon: 'Settings2', title: labels.kiln,
      count: t('综合教学推演', 'Integrated teaching simulation'),
      outcome: t('把设定值建议、执行检查、过程响应和延迟化验放在同一次决策中观察。', 'Connect a setpoint proposal, execution checks, process response and delayed assays in the same decision.'),
    },
    {
      href: '#/research', icon: 'Telescope', title: labels.research,
      count: t(`${researchPages.length} 篇研究专题`, `${researchPages.length} research articles`),
      outcome: t('明确指标与约束，比较优化和 RL 方法，并形成有基线、有失败判据的研究问题。', 'Define objectives and constraints, compare optimization with RL, and frame a research question with baselines and failure criteria.'),
    },
  ];
  return tools.map(tool => `<a class="home-tool-card" href="${tool.href}"><div class="home-tool-top">${icon(tool.icon)}<span>${esc(tool.count)}</span></div><h3>${esc(tool.title)}</h3><p>${esc(tool.outcome)}</p><span class="home-tool-action">${t('打开', 'Explore')}${icon('ArrowRight')}</span></a>`).join('');
}

export function renderHomePage(host: HTMLElement): () => void {
  const labels = navigationLabels();
  const layers = hierarchyLayers();
  const figure = illustratedFigure('operations-stack')!;
  const initialLayer = 1;
  const mobileLayout = window.matchMedia('(max-width: 760px)');
  host.innerHTML = `<div class="home-overview">
    <section class="home-intro" aria-labelledby="home-title">
      <div class="home-intro-copy">
        <h1 id="home-title">${t('面向流程工业决策的<br>强化学习', 'Reinforcement learning<br>for process decisions')}</h1>
        <p class="home-intro-description">${t('适合有机器学习或过程控制基础、正在学习 RL 的读者。以水泥烧成为贯穿案例，学会建模、推导公式，并检验有约束的设定值决策。', 'For readers with a machine-learning or process-control background. Use a cement kiln to learn how to model a decision problem, work through the mathematics and test constrained setpoint decisions.')}</p>
        <div class="home-intro-actions"><a class="button primary" href="#/roadmap">${esc(labels.roadmap)}${icon('ArrowRight')}</a><a class="button outline" href="#/kiln">${esc(labels.kiln)}${icon('ArrowRight')}</a></div>
        <p class="home-running-example"><strong>${t('贯穿案例', 'The running example')}</strong>${t('880°C 是分解炉出口温度的教学设定值，即下层控制要跟踪的目标。', '880°C is the teaching setpoint for the calciner-outlet temperature: the target tracked by lower-level control.')}</p>
        ${renderSourceStrip()}
      </div>
      <details class="home-hierarchy-disclosure"${mobileLayout.matches ? '' : ' open'}><summary>${icon('Network')}<span>${t('展开四层决策图解', 'Explore the four decision layers')}</span>${icon('ChevronDown')}</summary><figure class="home-hierarchy">
        <div class="home-hierarchy-art"><img src="${esc(figure.image)}" width="${figure.width}" height="${figure.height}" alt="${t('水泥烧成分层插画，从上到下依次为 04 测量信息、03 设定值决策、02 下层控制、01 实际过程。', 'Cement-process illustration. From top to bottom: 04 measurement information, 03 setpoint decisions, 02 regulatory control, and 01 the physical process.')}" fetchpriority="high"/><span class="home-hierarchy-highlight" aria-hidden="true"></span></div>
        <figcaption>
          <div class="home-hierarchy-caption"><span>${t('按图中从上到下的顺序选择一层', 'Select a layer, in the image’s top-to-bottom order')}</span><a href="#/gallery/operations-stack" aria-label="${t('打开完整的运行决策层级图解', 'Open the complete operational hierarchy illustration')}">${icon('ZoomIn')}<span>${t('完整图解', 'Full figure')}</span></a></div>
          <div class="home-layer-controls" role="group" aria-label="${t('运行决策的四个层级', 'Four layers of operational decisions')}">${layers.map((layer, index) => `<button type="button" data-home-layer="${index}" aria-pressed="${index === initialLayer}" aria-controls="home-layer-explanation"><span>${layer.number}</span>${esc(layer.label)}</button>`).join('')}</div>
          <div class="home-layer-explanation" id="home-layer-explanation" aria-live="polite" aria-atomic="true"></div>
        </figcaption>
      </figure></details>
    </section>
    <section class="home-start" aria-labelledby="home-start-title"><div class="home-section-heading"><h2 id="home-start-title">${t('从你的已有基础开始', 'Start from what you know')}</h2><p>${t('选择适合你的起点；每条路线都有先修说明、练习和明确产出。', 'Choose an entry path with prerequisites, exercises and a concrete outcome.')}</p></div>${renderLearningPathCards()}</section>
    <section class="home-tools" aria-labelledby="home-tools-title"><div class="home-section-heading"><h2 id="home-tools-title">${t('这些学习工具怎样配合', 'How the learning tools fit together')}</h2><p>${t('数学准备补基础，课程建立知识体系；公式案例和算法实验用于验证，工作台用于综合推演。', 'Use the primer for foundations and the curriculum for the full sequence. Check calculations in worked cases, investigate algorithms in labs, and connect them in the workbench.')}</p></div><div class="home-tool-grid">${renderLearningTools()}</div></section>
    <section class="home-reference-links" aria-labelledby="home-reference-title"><div><h2 id="home-reference-title">${t('学习时，随时查阅', 'Reference as you learn')}</h2><p>${t('查清符号、放大图解，或回到支持论述的原始文献。', 'Look up a symbol, inspect a figure, or return to the source behind a claim.')}</p></div><div><a class="button outline" href="#/glossary">${icon('Compass')}${esc(labels.glossary)}${icon('ArrowRight')}</a><a class="button outline" href="#/gallery">${icon('Image')}${esc(labels.gallery)}${icon('ArrowRight')}</a><a class="button outline" href="#/references">${icon('FileText')}${esc(labels.references)}${icon('ArrowRight')}</a></div></section>
  </div>`;

  const controls = host.querySelector<HTMLElement>('.home-layer-controls')!;
  const buttons = [...controls.querySelectorAll<HTMLButtonElement>('button')];
  const explanation = host.querySelector<HTMLElement>('#home-layer-explanation')!;
  const highlight = host.querySelector<HTMLElement>('.home-hierarchy-highlight')!;
  const disclosure = host.querySelector<HTMLDetailsElement>('.home-hierarchy-disclosure')!;
  const summary = disclosure.querySelector<HTMLElement>('summary')!;
  const syncHierarchyLayout = (): void => {
    const focusWillBeHidden = mobileLayout.matches && disclosure.contains(document.activeElement) && document.activeElement !== summary;
    disclosure.open = !mobileLayout.matches;
    if (focusWillBeHidden) summary.focus();
  };
  const selectLayer = (index: number): void => {
    const layer = layers[index];
    if (!layer) return;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
    highlight.style.top = `${layer.top}%`;
    highlight.style.height = `${layer.height}%`;
    explanation.innerHTML = `<p><strong>${layer.number} · ${esc(layer.label)}.</strong> ${esc(layer.description)}</p><a href="${layer.href}">${esc(layer.action)}${icon('ArrowRight')}</a>`;
    refreshIcons();
  };
  const handleClick = (event: Event): void => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-home-layer]');
    if (button) selectLayer(Number(button.dataset.homeLayer));
  };
  const handleKey = (event: KeyboardEvent): void => {
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + buttons.length - 1) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    selectLayer(next);
    buttons[next].focus();
  };
  controls.addEventListener('click', handleClick);
  controls.addEventListener('keydown', handleKey);
  mobileLayout.addEventListener('change', syncHierarchyLayout);
  selectLayer(initialLayer);
  return () => {
    controls.removeEventListener('click', handleClick);
    controls.removeEventListener('keydown', handleKey);
    mobileLayout.removeEventListener('change', syncHierarchyLayout);
  };
}
