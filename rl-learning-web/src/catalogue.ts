import { text as t, getLocale, editionFilename } from './i18n';
import { escapeHtml as esc } from './render';
import { figureImage, figureActions, bindFigureViewer } from './figure-view';
import { conceptPlateNotice } from './concept-plates';
import { icon, refreshIcons, pageHeading, emptyState } from './ui';
import { allSources, filterSources, sourceTopics, sourceKinds, type CatalogueSource } from './source-catalogue';
import { getFigures, figureTopics, type FigureRecord } from './figures';
export { allSources } from './source-catalogue';

const queryState=()=>new URLSearchParams(location.hash.split('?')[1]??'');
function saveFilters(section:string,query:string,topic:string,kind:string){
 const params=new URLSearchParams();if(query)params.set('q',query);if(topic!=='all')params.set('topic',topic);if(kind!=='all')params.set('kind',kind);
 history.replaceState(null,'',`#/${section}${params.size?'?'+params.toString():''}`);
}
function filterControls(id:string,label:string,placeholder:string,categories:Record<string,string>,records:{topic:string}[],kindOptions:Record<string,string>,query:string,topic:string,kind:string):string{
 return `<section class="catalogue-controls" aria-label="${esc(label)}"><div class="catalogue-search-row"><label class="catalogue-search" for="${id}-search">${icon('Search')}<span class="sr-only">${esc(label)}</span><input type="search" id="${id}-search" value="${esc(query)}" placeholder="${esc(placeholder)}" autocomplete="off"/></label><label class="catalogue-kind" for="${id}-kind"><span>${t('类型','Type')}</span><select id="${id}-kind" aria-label="${t('类型','Type')}"><option value="all">${t('所有类型','All types')}</option>${Object.entries(kindOptions).map(([key,name])=>`<option value="${key}" ${kind===key?'selected':''}>${name}</option>`).join('')}</select></label></div><div class="catalogue-chips" role="group" aria-label="${t('按主题筛选','Filter by topic')}"><button data-topic="all" aria-pressed="${topic==='all'}">${t('全部','All')}<span>${records.length}</span></button>${Object.entries(categories).map(([key,name])=>`<button data-topic="${key}" aria-pressed="${topic===key}">${name}<span>${records.filter(item=>item.topic===key).length}</span></button>`).join('')}</div></section>`;
}
function sourceCard(source:CatalogueSource):string{
 const labels=sourceKinds();return `<article class="source-card"><div class="source-card-top"><span class="source-year">${esc(source.year)}</span><span class="source-kind ${source.kind==='deployment'?'field-report':''}">${labels[source.kind]}</span></div><h3><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}${icon('ArrowUpRight')}</a></h3><p class="source-byline">${esc(source.author)}${source.venue?`<span>${esc(source.venue)}</span>`:''}</p><div class="source-reading-note"><span>${t('为什么读它','WHY READ IT')}</span><p>${esc(source.note)}</p></div>${source.related.length?`<div class="source-related"><span>${t('在教程中阅读','READ IN CONTEXT')}</span><div>${source.related.slice(0,5).map(link=>`<a href="${link.href}">${esc(link.label)} →</a>`).join('')}${source.related.length>5?`<span class="source-extra">+${source.related.length-5} ${t('处引用','citations')}</span>`:''}</div></div>`:''}</article>`;
}
export function renderReferences(host:HTMLElement):void{
 const records=allSources(),params=queryState(),topics=sourceTopics(),kinds=sourceKinds();let query=params.get('q')??'',topic=params.get('topic')??'all',kind=params.get('kind')??'all';
 if(!(topic in topics))topic='all';if(!(kind in kinds))kind='all';
 host.innerHTML=`${pageHeading('THE READING ROOM',t('论文与资源','Papers & resources'),t('把基础教材、算法论文、过程优化与运行报告放在同一个可检索的阅读室。每条资料说明它能帮助你理解什么。','Browse textbooks, algorithm papers, process optimization and operational reports together. Every record explains what it contributes to your understanding.'))}<div class="catalogue-intro"><p>${t('同一网址合并展示，章节引用与专题引用仍完整保留。官方运行报告、模拟实验和理论结论采用不同标签。','Duplicate URLs are grouped while chapter and review citation IDs remain intact. Operational reports, simulation studies and theoretical results carry distinct labels.')}</p><span><b>${records.length}</b> ${t('条资料','references')}</span></div>${filterControls('references',t('搜索论文与资源','Search papers and resources'),t('搜索标题、作者、算法、DOI 或关键词…','Search titles, authors, algorithms, DOI or keywords…'),topics,records,kinds,query,topic,kind)}<div class="catalogue-result-bar"><p role="status" aria-live="polite" data-result-count></p><button class="text-button" data-reset>${t('重置筛选','Reset filters')}</button></div><div class="source-groups" data-source-results></div>
 <section class="resource-downloads" aria-labelledby="downloads-heading"><div><span class="eyebrow">TAKE THE FIELDBOOK WITH YOU</span><h2 id="downloads-heading">${t('把完整正文带走。','Take the complete text with you.')}</h2><p>${t('下载完整教材与专题综述的 Markdown 正文、公式和读图说明。配套图片与教学代码随仓库提供；完整离线阅读时请保留 public/ 下的 images/ 与 code/ 相对目录。','Download the complete textbook and review as Markdown with equations and reading guides. Companion images and teaching code are provided in the repository; preserve the relative images/ and code/ folders under public/ for complete offline reading.')}</p></div><div class="download-grid">${[
  [editionFilename('rl-atlas-tutorial'),t('完整强化学习教材','Complete RL textbook'),t('24 章 · 154 步推导 · 数学准备与词典','24 chapters · 154 derivation steps · Primer & glossary'),'BookOpen'],
  ['code/'+editionFilename('research-review'),t('运行指标决策综述','Operational decision research review'),t('9 篇完整专题 · 来源与研究议程','9 complete studies · Sources & research agenda'),'FileText'],
  ['code/tabular_foundations.py',t('表格方法教学代码','Tabular learning examples'),t('动态规划、SARSA 与 Q-learning','Dynamic programming, SARSA and Q-learning'),'Code2'],
  ['code/advanced_math_checks.py',t('高级数学机制核验','Advanced mathematical checks'),t('PPO、SAC 与相关数值机制','PPO, SAC and related numerical mechanisms'),'Calculator'],
 ].map(([file,title,description,symbol])=>`<a class="download-card" href="./${file}" download>${icon(symbol)}<div><b>${title}</b><span>${description}</span></div>${icon('Download')}</a>`).join('')}</div><p class="resource-provenance">${t('教材中的算例与浏览器实验为教学构造。文献结论应连同原文假设、工况与评价协议一起阅读；登记摘要能核验的范围已在条目中标明。','Worked examples and browser experiments are teaching constructions. Read published findings with their assumptions, operating regimes and evaluation protocols; limits of deposited-abstract verification are stated in the relevant entries.')}</p></section>`;
 const input=host.querySelector<HTMLInputElement>('#references-search')!,select=host.querySelector<HTMLSelectElement>('#references-kind')!;
 const draw=()=>{
  const selected=filterSources(records,query,topic,kind);
  host.querySelector('[data-result-count]')!.textContent=t(`显示 ${selected.length} / ${records.length} 条资料`,`${selected.length} of ${records.length} references`);
  host.querySelector('[data-source-results]')!.innerHTML=selected.length?Object.entries(topics).filter(([key])=>selected.some(item=>item.topic===key)).map(([key,label])=>`<section class="source-group"><div class="section-heading"><h2>${label}</h2><span>${selected.filter(item=>item.topic===key).length}</span></div><div class="source-card-grid">${selected.filter(item=>item.topic===key).map(sourceCard).join('')}</div></section>`).join(''):emptyState(t('还没有匹配的资料','No references match'),t('试试更短的关键词，或重置主题和类型筛选。','Try a shorter keyword or reset the topic and type filters.'));
  host.querySelectorAll<HTMLElement>('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===topic)));
  saveFilters('references',query,topic,kind);refreshIcons();
 };
 input.addEventListener('input',()=>{query=input.value;draw();});select.addEventListener('change',()=>{kind=select.value;draw();});
 host.querySelectorAll<HTMLElement>('[data-topic]').forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.topic!;draw();}));
 host.querySelector('[data-reset]')!.addEventListener('click',()=>{query='';topic='all';kind='all';input.value='';select.value='all';draw();input.focus();});draw();
}
export function filterFigures(figures: FigureRecord[], query: string, topic = 'all', kind = 'all'): FigureRecord[] {
 const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 // Latin terms start a word: PPO must not match "support", nor SAC "transactions".
 // Chinese and other non-Latin queries retain substring matching.
 const matchers = terms.map(term => /^[a-z0-9][a-z0-9+./_-]*$/.test(term)
  ? new RegExp(`(?:^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  : term);
 return figures.filter(figure => {
  if ((topic !== 'all' && figure.topic !== topic) || (kind !== 'all' && figure.kind !== kind)) return false;
  const searchable = [figure.title, figure.alt, figure.explanation, figure.relationship ?? '', figure.sourceLabel, ...figure.keywords, ...(figure.regions ?? []).flatMap(region => [region.label, region.description])].join(' ').toLowerCase();
  return matchers.every(matcher => typeof matcher === 'string' ? searchable.includes(matcher) : matcher.test(searchable));
 });
}
async function figureDetail(host: HTMLElement, figure: FigureRecord): Promise<void> {
 host.innerHTML = `<div class="reader-topline"><a class="text-link" href="#/gallery">${icon('ArrowLeft')}${t('全部图解','All figures')}</a><a class="text-link" href="${figure.href}">${t('回到配套正文','Read in context')}${icon('ArrowRight')}</a></div>${pageHeading(figure.kind === 'concept' ? 'ACADEMIC CONCEPT PLATE' : 'ILLUSTRATED FIELD NOTE', esc(figure.title), esc(figure.explanation))}
 <section class="figure-detail"><div class="figure-detail-art">${figureImage(figure, false)}</div><div class="figure-detail-caption"><span>${figureTopics()[figure.topic]}</span><a href="${figure.href}">${esc(figure.sourceLabel)} →</a>${figureActions(figure)}</div></section>
 ${figure.regions ? `<section class="figure-region-section ${figure.kind === 'concept' ? 'concept-regions' : ''}"><div class="section-heading"><h2>${t('读图要点','Reading guide')}</h2></div><div class="figure-region-grid">${figure.regions.map(region => `<article><span>${esc(region.label)}</span><p>${esc(region.description)}</p></article>`).join('')}</div></section>` : ''}
 <section class="figure-reading-connection"><div>${icon('BookOpen')}<h2>${figure.relationship ? t('准确关系与边界','Exact relationships and boundaries') : t('把图放回推理过程。','Put the figure back into the reasoning.')}</h2></div><p>${esc(figure.relationship ?? t('插图帮助辨认模块与角色。关键变量、更新公式、信息权限与执行约束由配套正文和可选择的读图说明精确定义。图中的曲线、节点数量和布局不代表实测结果或具体工程设计。','The illustration identifies modules and roles. The accompanying text and selectable reading guide define variables, updates, information permissions and execution constraints. Curves, node counts and layout are not measured results or an engineering design.'))}</p>${figure.kind === 'concept' ? `<p>${esc(conceptPlateNotice[getLocale()])}</p>` : ''}<a class="button primary" href="${figure.href}">${esc(figure.sourceLabel)}${icon('ArrowRight')}</a></section>`;
 bindFigureViewer(host, figure);
 refreshIcons();
}
export async function renderGallery(host: HTMLElement, id: string): Promise<void> {
 const figures = getFigures();
 if (id) {
  const figure = figures.find(item => item.id === id);
  if (figure) { await figureDetail(host, figure); return; }
  host.innerHTML = emptyState(t('图解不存在','Figure not found'),t('请返回图解知识库重新选择。','Return to the visual library and choose a figure.')) + `<a class="button primary" href="#/gallery">${t('返回图解库','Visual library')}</a>`;
  return;
 }
 const params = queryState(), topics = figureTopics(), kinds = { concept: t('学术概念图解','Academic concept plates'), illustration: t('情境与教学插画','Scene & teaching illustrations') };
 let query = params.get('q') ?? '', topic = params.get('topic') ?? 'all', kind = params.get('kind') ?? 'all';
 // Preserve old bookmarked type filters without retaining the retired rendering mode.
 if (kind === 'diagram') kind = 'concept';
 if (!(topic in topics)) topic = 'all';
 if (!(kind in kinds)) kind = 'all';
 host.innerHTML = `${pageHeading('THE VISUAL LIBRARY',t('图解知识库','Visual library'),t('按问题、算法和网络结构查找图解。图片直接预览，可放大或下载；双语读图说明连接到对应正文。','Find figures by problem, algorithm or architecture. Preview every image directly, enlarge or download it, and follow bilingual reading guides back to the text.'))}<div class="catalogue-intro"><p>${t('21 张学术概念图解解释机制与关系；7 张情境和教学插画保留原有视觉线索。中文界面使用中文图，英文界面使用英文图；无文字的情境插画共用，完整含义由可选择的文字说明。','Twenty-one academic concept plates explain mechanisms and relationships; seven scene and teaching illustrations preserve the original visual cues. Chinese pages use Chinese figure labels and English pages use English labels; text-free scenes are shared. Complete selectable text explains their meaning.')}</p><span><b>${figures.length}</b> ${t('张图解','figures')}</span></div>${filterControls('gallery',t('搜索图解','Search figures'),t('搜索 Bellman、门控、轨迹、SAC、网络…','Search Bellman, gates, trajectories, SAC, networks…'),topics,figures,kinds,query,topic,kind)}<div class="catalogue-result-bar"><p role="status" aria-live="polite" data-result-count></p><button class="text-button" data-reset>${t('重置筛选','Reset filters')}</button></div><div class="figure-grid" data-figure-results></div>`;
 const input = host.querySelector<HTMLInputElement>('#gallery-search')!, select = host.querySelector<HTMLSelectElement>('#gallery-kind')!;
 const draw = () => {
  const selected = filterFigures(figures, query, topic, kind);
  host.querySelector('[data-result-count]')!.textContent = t(`显示 ${selected.length} / ${figures.length} 张图解`, `${selected.length} of ${figures.length} figures`);
  host.querySelector('[data-figure-results]')!.innerHTML = selected.length ? selected.map(figure => `<article class="figure-card"><div class="figure-preview">${figureImage(figure)}</div><div class="figure-card-copy"><div class="figure-card-meta"><span>${topics[figure.topic]}</span><span>${figure.kind === 'concept' ? t('学术概念图解','CONCEPT PLATE') : t('教学插画','ILLUSTRATION')}</span></div><h2><a href="#/gallery/${figure.id}">${esc(figure.title)}${icon('ArrowRight')}</a></h2><p>${esc(figure.explanation)}</p><a class="figure-context" href="${figure.href}">${esc(figure.sourceLabel)} →</a></div></article>`).join('') : emptyState(t('没有匹配的图解','No figures match'),t('可以用算法名、工艺量或更短的关键词搜索，也可以重置筛选。','Search by algorithm, process variable or a shorter keyword, or reset the filters.'));
  selected.forEach(figure => bindFigureViewer(host.querySelector('[data-figure-results]')!, figure));
  host.querySelectorAll<HTMLElement>('[data-topic]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
  saveFilters('gallery', query, topic, kind); refreshIcons();
 };
 input.addEventListener('input', () => { query = input.value; draw(); });
 select.addEventListener('change', () => { kind = select.value; draw(); });
 host.querySelectorAll<HTMLElement>('[data-topic]').forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic!; draw(); }));
 host.querySelector('[data-reset]')!.addEventListener('click', () => { query = ''; topic = 'all'; kind = 'all'; input.value = ''; select.value = 'all'; draw(); input.focus(); });
 draw();
}
