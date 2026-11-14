/** Export complete authored editions, including material hidden by interactive steppers. */
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chapters, modules, sources } from '../src/content/index';
import { chapterGuides, guideToMarkdown } from '../src/content/guides';
import { primerUnits, primerIntroduction } from '../src/content/primer';
import { glossary } from '../src/content/glossary';
import { foundationChaptersEn, foundationSourcesEn } from '../src/content/en/foundations';
import { advancedChaptersEn, advancedSourcesEn } from '../src/content/en/advanced';
import { foundationGuidesEn } from '../src/content/en/foundations-guides';
import { advancedGuidesEn } from '../src/content/en/advanced-guides';
import { primerUnitsEn, primerIntroductionEn } from '../src/content/en/primer';
import { glossaryEn } from '../src/content/en/glossary';
import { modulesEn } from '../src/content/en/modules';
import { researchSourcesEn } from '../src/content/en/research-sources';
import { researchPages, reviewSources } from '../src/research/content';
import { illustratedFigure } from '../src/figures';
import { conceptPlates, conceptPlateReference, expandConceptPlateReferences } from '../src/concept-plates';
import { getLocale, setLocale, type Locale } from '../src/i18n';
import { chapterFormulaCasesMarkdown, researchFormulaCasesMarkdown, getFormulaCases } from '../src/formula-cases';
import { mapMarkdownProse } from '../src/markdown-prose';
import type { ContentBundle } from '../src/content/localized';
import type { ResearchPage } from '../src/research/types';
import type { Source } from '../src/types';

export type BookDestination = 'docs' | 'public';
export type OfflineDestination = BookDestination | 'code';

const editions: Record<Locale, ContentBundle> = {
  'zh-CN': { chapters, modules, sources, guides: chapterGuides, primerUnits, primerIntroduction, glossary },
  en: {
    chapters: [...foundationChaptersEn, ...advancedChaptersEn].sort((a, b) => a.number - b.number),
    modules: modulesEn,
    sources: [...foundationSourcesEn, ...advancedSourcesEn, ...researchSourcesEn],
    guides: [...foundationGuidesEn, ...advancedGuidesEn].sort((a, b) => a.chapterId.localeCompare(b.chapterId)),
    primerUnits: primerUnitsEn, primerIntroduction: primerIntroductionEn, glossary: glossaryEn,
  },
};
const label = (locale: Locale) => (zh: string, en: string): string => locale === 'en' ? en : zh;
const suffix = (locale: Locale): string => locale === 'en' ? '.en' : '';

/** Preserve the full model contract. Resolve repository links independently of output location. */
function readWorkbench(locale: Locale): string {
  return readFileSync(new URL(`../docs/kiln-workbench${suffix(locale)}.md`, import.meta.url), 'utf8')
    .replace(/^# [^\n]+\n/, '')
    .replace(/^\\\[$|^\\\]$/gm, '$$$$')
    .replace(/\]\(\.\.\/\.\.\/([^\s)]+)\)/g, ']\u0028https://github.com/bahayonghang/rl-learning/blob/main/$1)');
}
export const workbenchAppendix = readWorkbench('zh-CN');
export const workbenchAppendixEn = readWorkbench('en');
export const getWorkbenchAppendix = (locale: Locale = 'zh-CN'): string => locale === 'en' ? workbenchAppendixEn : workbenchAppendix;

export interface BookReference {
  number: number;
  url: string;
  sources: Source[];
}

/** Deduplicate URL identity only; every original source ID remains addressable. */
export function groupReferences(records: readonly Source[]): BookReference[] {
  const byUrl = new Map<string, BookReference>();
  for (const source of records) {
    const url = new URL(source.url).href;
    const existing = byUrl.get(url);
    if (existing) existing.sources.push(source);
    else byUrl.set(url, { number: byUrl.size + 1, url, sources: [source] });
  }
  return [...byUrl.values()];
}
const referenceMap = (references: BookReference[]) => new Map(references.flatMap(reference => reference.sources.map(source => [source.id, reference] as const)));
const localizedReviewSources = (locale: Locale): Source[] => reviewSources.map(source => ({ ...source, note: locale === 'en' ? source.noteEn : source.note }));
const unique = (items: string[], locale: Locale): string => [...new Set(items.filter(Boolean))].join(locale === 'en' ? '; ' : '；');
const assetPrefix = (destination: OfflineDestination): string => destination === 'docs' ? '../public/' : destination === 'code' ? '../' : './';
const codePrefix = (destination: OfflineDestination): string => destination === 'code' ? './' : `${assetPrefix(destination)}code/`;
const bookAnchor = (id: string, destination: OfflineDestination, locale: Locale): string => `${destination === 'code' ? `../rl-atlas-tutorial${suffix(locale)}.md` : ''}#${id}`;

/** Rewrite authored links and heading depth, while preserving both fenced-code syntaxes verbatim. */
export function formatBody(markdown: string, destination: OfflineDestination, locale: Locale = 'zh-CN', headingShift = 2): string {
  return mapMarkdownProse(expandConceptPlateReferences(markdown, locale).trim(), (prose, boundary) => {
    let formatted = prose.replace(/(^|\n)(#{1,6}) /g, (match, before: string, hashes: string, offset: number) => offset === 0 && !boundary.startsLine ? match : `${before}${'#'.repeat(Math.min(hashes.length + headingShift, 6))} `);
    formatted = formatted.replace(/\]\((?:\.\/|\/)?code\/([^\s)]+)\)/g, (_, filename: string) => `](${codePrefix(destination)}${filename})`)
      .replace(/\]\((?:\.\/|\/)?images\/([^\s)]+)\)/g, (_, filename: string) => `](${assetPrefix(destination)}images/${filename})`)
      .replace(/\]\(#\/research\/([a-z0-9-]+)\)/g, '](#research-$1)')
      .replace(/\]\(#\/research\)/g, '](#research)')
      .replace(/\]\(#\/gallery\/([a-z0-9-]+)\)/g, '](#figure-$1)')
      .replace(/\]\(#\/chapter\/(\d\d)\)/g, (_, id: string) => `](${bookAnchor(`chapter-${id}`, destination, locale)})`)
      .replace(/\]\(#\/primer\/([a-z-]+)\)/g, (_, id: string) => `](${bookAnchor(`math-${id}`, destination, locale)})`)
      .replace(/\]\(#\/kiln\)/g, `](${bookAnchor('kiln-workbench', destination, locale)})`)
      .replace(/\]\(#\/primer\)/g, `](${bookAnchor('math-primer', destination, locale)})`)
      .replace(/\]\(#\/glossary\)/g, `](${bookAnchor('glossary', destination, locale)})`)
      .replace(/\]\(#\/references\)/g, '](#references)');
    return formatted;
  });
}

/** Use the same authored captions and region explanations as the web figure catalogue. */
function conceptFigure(page: ResearchPage, destination: OfflineDestination, locale: Locale): string {
  if (!page.figure) return '';
  const previousLocale = getLocale();
  // illustratedFigure is synchronous; restore the caller's locale even if lookup fails.
  let figure: ReturnType<typeof illustratedFigure>;
  try { setLocale(locale); figure = illustratedFigure(page.figure); }
  finally { setLocale(previousLocale); }
  if (!figure?.image) throw new Error(`Missing concept illustration: ${page.figure}`);
  const t = label(locale);
  return [
    `<a id="figure-${figure.id}"></a>`, '',
    `![${figure.title}](${assetPrefix(destination)}${figure.image.replace(/^\.\//, '')})`, '',
    `**${figure.title}**`, '', figure.explanation, '',
    `**${t('逐区读图', 'Read the regions')}**`, '',
    ...(figure.regions ?? []).map(region => `- **${region.label}** · ${region.description}`), '',
    t('这些是原创概念插图，不是实测曲线、辨识模型或工程施工图；精确关系以本篇公式和可选择的双语读图说明为准。', 'These original concept illustrations are not measured curves, identified models, or engineering drawings. The equations and selectable bilingual reading guides specify the exact relationships.'), '',
  ].join('\n');
}

function sourceList(ids: readonly string[], references: BookReference[], locale: Locale): string[] {
  const t = label(locale), byId = referenceMap(references);
  return ids.map(id => {
    const reference = byId.get(id), source = reference?.sources.find(item => item.id === id);
    if (!reference || !source) throw new Error(`Unknown source ID in export: ${id}`);
    return `- [R${reference.number}](#reference-${reference.number}) · [${source.title}](${source.url}) — ${source.author}; ${source.year}. ${t('来源标识', 'Source ID')}: ${id}.`;
  });
}

function appendResearch(parts: string[], destination: OfflineDestination, locale: Locale, references: BookReference[], standalone = false): void {
  const t = label(locale), heading = standalone ? '##' : '###';
  parts.push('<a id="research"></a>', '', ...(standalone ? [] : [`## ${t('运行指标决策研究：九篇完整专题', 'Operational decision research: nine complete studies')}`, '']),
    t('以下保留全部九篇专题正文。按顺序可串起控制层级、运行指标、目标约束、进化优化、序贯学习、网络结构、证据边界与研究议程；也可按目录直接进入一个问题。', 'All nine complete studies follow. Read them in order to connect control hierarchy, operating indicators, objectives and constraints, evolutionary optimization, sequential learning, architecture, evidence boundaries, and the research agenda; or enter through a particular question.'), '',
    t('已发表证据、教学假设与本教程提出的研究设计分别说明。登记摘要不等于独立复现，官方现场报告不等于本项目现场收益，候选结构不等于已训练或已部署的方法。', 'Published evidence, teaching assumptions, and proposed research designs are identified separately. A deposited abstract is not independent replication; an official field report is not a result for this project; a proposed architecture is not a trained or deployed method.'), '');
  for (const page of researchPages) {
    parts.push(`<a id="research-${page.id}"></a>`, '', `${heading} ${String(page.order).padStart(2, '0')} · ${page.title[locale]}`, '', page.summary[locale], '',
      `**${t('建议阅读', 'Reading estimate')}:** ${page.minutes} ${t('分钟（按个人基础调整）', 'minutes (adjust to your background)')}`, '',
      conceptFigure(page, destination, locale),
      formatBody(page.body[locale], destination, locale, standalone ? 1 : 2), '',
      formatBody(researchFormulaCasesMarkdown(page.id, locale), destination, locale, standalone ? 1 : 2), '',
      `${heading}# ${t('本篇原始资料与阅读边界', 'Primary references and evidence boundaries')}`, '',
      ...sourceList(page.sources, references, locale), '');
    for (const id of page.sources) {
      const source = reviewSources.find(item => item.id === id);
      if (!source) throw new Error(`Research ${page.id} refers to unknown review source ${id}`);
      parts.push(`**${id} · ${source.venue}:** ${locale === 'en' ? source.noteEn : source.note}`, '');
    }
    parts.push('---', '');
  }
}

function appendReferences(parts: string[], records: Source[], references: BookReference[], locale: Locale): void {
  const t = label(locale), byId = referenceMap(references);
  parts.push('<a id="references"></a>', '', `## ${t('完整参考资料', 'Complete references')}`, '',
    t(`以下按网址去重，共 ${references.length} 条资料；保留全部 ${records.length} 个来源标识，便于与网页章节及研究专题对应。相同网址的不同来源记录合并展示，未丢弃原有映射。`, `References are deduplicated by URL into ${references.length} records, preserving all ${records.length} source IDs used by chapters and research studies. Records sharing a URL are displayed together without discarding their original mappings.`), '');
  for (const reference of references) {
    const first = reference.sources[0];
    parts.push(`<a id="reference-${reference.number}"></a>`, ...reference.sources.map(source => `<a id="source-${source.id}"></a>`), '', `### R${reference.number} · ${first.title}`, '',
      `**${t('作者', 'Authors')}:** ${unique(reference.sources.map(source => source.author), locale)}`, '',
      `**${t('年份或维护状态', 'Year or maintenance status')}:** ${unique(reference.sources.map(source => source.year), locale)}`, '',
      `**${t('链接', 'Link')}:** [${t('查看原始资料', 'Open the original source')}](${reference.url})`, '',
      `**${t('阅读提示', 'Reading notes')}:** ${unique(reference.sources.map(source => source.note), locale)}`, '',
      `**${t('来源标识', 'Source IDs')}:** ${reference.sources.map(source => source.id).join(', ')}`, '');
  }
  parts.push('<a id="source-index"></a>', '', `## ${t('来源标识索引', 'Source-ID index')}`, '', t('| 网页来源标识 | 本书资料编号 | 原始资料 |', '| Web source ID | Reference number | Original source |'), '|---|---|---|');
  for (const source of records) {
    const reference = byId.get(source.id)!;
    parts.push(`| ${source.id} | [R${reference.number}](#reference-${reference.number}) | [${source.title}](${source.url}) |`);
  }
  parts.push('');
}

/** Synchronous API retained: one argument still produces the complete Chinese edition. */
export function buildBook(destination: BookDestination, locale: Locale = 'zh-CN'): string {
  const edition = editions[locale], t = label(locale);
  const records = [...edition.sources, ...localizedReviewSources(locale)];
  const references = groupReferences(records);
  const chapterById = new Map(edition.chapters.map(chapter => [chapter.id, chapter]));
  const guideById = new Map(edition.guides.map(guide => [guide.chapterId, guide]));
  const parts: string[] = [
    t('# RL Atlas｜强化学习：从直觉到决策', '# RL Atlas | Reinforcement Learning: From Intuition to Decisions'), '',
    t('> 完整中文教程 · 8 个数学准备单元 · 24 组水泥案例逐步推导 · 7 个模块 / 24 章 · 9 篇完整研究专题 · 概念词典、工作台模型、公式、学术概念图解、代码与练习解答。', '> Complete English edition · 8 mathematics units · 24 guided cement-case derivations · 7 modules / 24 chapters · 9 complete research studies · Glossary, workbench model, equations, academic concept plates, code, exercises, and answers.'), '',
    t('本教程沿着“问题 → 数学 → 算法 → 代码 → 实验 → 可信结论”的路径组织。先学会解释一个决策问题，再理解每一种算法为什么出现、解决什么问题、还留下哪些限制。', 'The learning path is problem → mathematics → algorithm → code → experiment → credible conclusion. First explain the decision problem, then understand why each algorithm exists, what it addresses, and which limitations remain.'), '',
    t('教程结构受到用户提供的公开推文[《强化学习难点，90% 初学者都搞错了！！》](https://mp.weixin.qq.com/s/x3Jb7imrQtbavvU1vH8Tww)启发；正文、数值例题、练习与代码为独立编写，参考资料列在各章及文末。此文件包含完整教材正文，不依赖购买原推文中的课程。', 'The structure was inspired by the user-provided public article [“Reinforcement-learning pitfalls that 90% of beginners misunderstand”](https://mp.weixin.qq.com/s/x3Jb7imrQtbavvU1vH8Tww). The text, worked examples, exercises, and code were independently authored, with references in each chapter and at the end. This file contains the complete textbook and requires no purchase of the article’s advertised course.'), '',
    `## ${t('如何使用这本教程', 'How to use this tutorial')}`, '',
    t('- **先预测，再验证。** 每章先手算例题、解释更新方向，再打开网页中对应的交互实验。', '- **Predict, then verify.** Calculate each example and explain the update direction before opening its interactive web experiment.'),
    t('- **按依赖学习。** 具备神经网络基础可以略读网络入门，但不要跳过条件期望、Bellman 方程与终止语义。', '- **Follow the dependencies.** Readers familiar with neural networks may skim that introduction, but should retain conditional expectation, Bellman equations, and termination semantics.'),
    t('- **区分机制与证据。** 浏览器实验用于理解数值机制；小型模拟结果不代表工业现场的节能效果。', '- **Separate mechanisms from evidence.** Browser experiments explain numerical behavior. Small simulations do not establish industrial energy savings.'),
    t('- **保留单位与时间。** 工业案例使用运行指标设定值增量，保留下层控制与安全门控，不连接真实设备。', '- **Preserve units and timing.** Industrial examples use operational setpoint increments, retain inner control and execution gates, and have no connection to real equipment.'),
    t('- **检查原始资料。** 数学与接口来源均可追溯；阅读时保留定理假设和实验边界。', '- **Inspect primary sources.** Mathematical and interface references are traceable; retain theorem assumptions and experimental limits.'), '',
    t('建议按个人时间在六至八周内完成一轮：第一至二周处理交互、概率和表格方法；第三周理解 DQN；第四至五周学习 Actor-Critic、PPO 与 SAC；第六周完成环境和评估设计；最后一至二周将离线、模型与约束方法连接到自己的课题。该安排是学习建议，不是学习效果或课时保证。', 'A suggested first pass takes six to eight weeks, adjusted to your schedule: interaction, probability, and tabular methods in weeks one and two; DQN in week three; actor–critic, PPO, and SAC in weeks four and five; environment and evaluation design in week six; then one or two weeks connecting offline, model-based, and constrained methods to your research. This is a planning suggestion, not a learning-outcome or completion-time guarantee.'), '',
    t('数学保留为 LaTeX，概念图解以 WebP 图片配合完整双语读图说明呈现。图片使用相对路径，移动文件时请保留配套 images（包括 diagrams 子目录）与 code 目录结构。中文版本使用中文图，其他语言使用英文图；全部推导与读图说明保留为可选择的文字。', 'Mathematics remains in LaTeX; concept plates use WebP images with complete bilingual reading guides. Preserve the relative images directory (including diagrams) and code directory when moving files. The Chinese edition uses Chinese figures; other editions use English figures. All derivations and reading guides remain selectable text.'), '',
    `## ${t('目录', 'Contents')}`, '', `- [${t('课程学习路线', 'Course learning roadmap')}](#roadmap)`, `- [${t('数学准备：从符号到可计算的例子', 'Mathematics: from symbols to calculable examples')}](#math-primer)`,
  ];
  for (const module of edition.modules) {
    parts.push(`- [${t('模块', 'Module')} ${module.id} · ${module.title}](#module-${module.id})`);
    for (const chapter of edition.chapters.filter(item => item.module === module.id)) parts.push(`  - [${chapter.id} · ${chapter.title}](#chapter-${chapter.id})`);
  }
  parts.push(`- [${t('水泥工作台：模型、时间与实验', 'Cement workbench: model, timing, and experiments')}](#kiln-workbench)`, `- [${t('运行指标决策研究', 'Operational decision research')}](#research)`);
  for (const page of researchPages) parts.push(`  - [${String(page.order).padStart(2, '0')} · ${page.title[locale]}](#research-${page.id})`);
  parts.push(`- [${t('概念与符号词典', 'Concept and symbol glossary')}](#glossary)`, `- [${t('完整参考资料', 'Complete references')}](#references)`, `- [${t('来源标识索引', 'Source-ID index')}](#source-index)`, '', '---', '');

  parts.push('<a id="roadmap"></a>', '', `## ${t('课程学习路线', 'Course learning roadmap')}`, '', formatBody(conceptPlateReference('roadmap-learning', locale), destination, locale), '', '---', '');

  parts.push('<a id="math-primer"></a>', '', `## ${t('数学准备：从符号到可计算的例子', 'Mathematics: from symbols to calculable examples')}`, '', edition.primerIntroduction, '');
  for (const unit of edition.primerUnits) {
    parts.push(`<a id="math-${unit.id}"></a>`, '', `### ${t('数学', 'Math')} ${unit.number} · ${unit.title}`, '', unit.summary, '', formatBody(unit.body, destination, locale), '',
      `**${t('应用到章节', 'Applied in chapters')}:** ${unit.chapters.map(id => `[${t('第 ', 'Chapter ')}${id}${t(' 章', '')}](#chapter-${id})`).join(locale === 'en' ? '; ' : '；')}`, '',
      t('**网页动手部分：** 对应数学准备单元提供同题参数计算器。纸面推导与初始数字均保留在本节中。', '**Interactive web component:** The corresponding math unit provides a parameter calculator for the same problem. Its written derivation and initial values are preserved here.'), '', '---', '');
  }

  for (const module of edition.modules) {
    parts.push(`<a id="module-${module.id}"></a>`, '', `## ${t('模块', 'Module')} ${module.id} · ${module.title}`, '', module.description, '', `**${t('完成本模块后', 'After this module')}:** ${module.outcome}`, '');
    for (const chapter of edition.chapters.filter(item => item.module === module.id)) {
      const level = locale === 'en' ? { '入门': 'Foundation', '进阶': 'Advanced', '实践': 'Applied' }[chapter.level] : chapter.level;
      parts.push(`<a id="chapter-${chapter.id}"></a>`, '', `### ${chapter.id} · ${chapter.title}`, '', `*${chapter.subtitle}*`, '',
        `**${t('程度', 'Level')}:** ${level} · **${t('建议阅读与推演', 'Reading and calculation estimate')}:** ${chapter.duration} ${t('分钟（按个人基础调整）', 'minutes (adjust to your background)')}`, '');
      if (chapter.prerequisites.length) parts.push(`**${t('先修章节', 'Prerequisites')}:** ${chapter.prerequisites.map(id => `[${id} · ${chapterById.get(id)?.title ?? id}](#chapter-${id})`).join(locale === 'en' ? '; ' : '；')}`, '');
      parts.push(`**${t('学习目标', 'Learning objectives')}**`, '', ...chapter.objectives.map(objective => `- ${objective}`), '');
      if (chapter.lab) parts.push(`**${t('配套网页实验', 'Companion web experiment')}:** ${chapter.lab}${t('（在网页“交互实验室”打开）', ' (open in the website’s Interactive Labs)')}`, '');
      const guide = guideById.get(chapter.id);
      if (!guide) throw new Error(`Missing ${locale} guide for chapter ${chapter.id}`);
      parts.push(formatBody(guideToMarkdown(guide, locale), destination, locale), '', formatBody(chapterFormulaCasesMarkdown(chapter.id, locale), destination, locale), '', `#### ${t('从案例走向系统正文', 'From the case to the full explanation')}`, '',
        formatBody(chapter.body, destination, locale), '', `#### ${t('本章参考资料', 'Chapter references')}`, '', ...sourceList(chapter.sources, references, locale), '', '---', '');
    }
  }

  parts.push('<a id="kiln-workbench"></a>', '', `## ${t('水泥工作台：模型、时间与实验', 'Cement workbench: model, timing, and experiments')}`, '', formatBody(getWorkbenchAppendix(locale), destination, locale), '');
  appendResearch(parts, destination, locale, references);
  parts.push('<a id="glossary"></a>', '', `## ${t('概念与符号词典', 'Concept and symbol glossary')}`, '');
  for (const entry of edition.glossary) {
    const term = entry.term === entry.english ? entry.term : `${entry.term} · ${entry.english}`;
    parts.push(`### ${term}`, '', entry.symbol ? `**${t('符号', 'Symbol')}:** $${entry.symbol}$` : '', '', entry.meaning, '',
      `**${t('在烧成系统中', 'In the kiln system')}:** ${entry.kiln}`, '', `**${t('容易混淆', 'Common confusion')}:** ${entry.caution}`, '',
      `**${t('继续阅读', 'Read further')}:** [${t('第 ', 'Chapter ')}${entry.chapter}${t(' 章', '')}](#chapter-${entry.chapter})`, '');
  }
  appendReferences(parts, records, references, locale);
  parts.push(`## ${t('配套代码与复现', 'Companion code and reproducibility')}`, '',
    t('以下代码均为教学实现。网页示例中的局部 PyTorch 更新片段需要所在章节说明的网络、优化器和数据；不要将片段误当作已经执行的完整训练。', 'The following programs are teaching implementations. Local PyTorch update snippets require the networks, optimizers, and data described in their chapters; a snippet is not a completed training run.'), '',
    `- [tabular_foundations.py](${codePrefix(destination)}tabular_foundations.py): ${t('仅用 Python 标准库的表格动态规划与 SARSA / Q-learning 实验。', 'Tabular dynamic programming and SARSA / Q-learning using the Python standard library.')}`,
    `- [advanced_math_checks.py](${codePrefix(destination)}advanced_math_checks.py): ${t('高级章节的数学机制核验。', 'Numerical mechanism checks for the advanced chapters.')}`,
    `- [advanced_toy_env.py](${codePrefix(destination)}advanced_toy_env.py): ${t('归一化设定值教学环境；需要 Gymnasium 和 NumPy，非真实水泥窑模型。', 'A normalized-setpoint teaching environment requiring Gymnasium and NumPy, not a real cement-kiln model.')}`,
    `- [${t('独立九篇研究综述', 'Standalone nine-study research review')}](${codePrefix(destination)}research-review${suffix(locale)}.md)`, '',
    t('实验结果应连同环境版本、参数、随机种子、评估协议、失败情况和约束指标一起保存。教学仿真只验证所声明的机制，不构成现场闭环收益证据。', 'Save results with environment versions, parameters, seeds, evaluation protocols, failures, and constraint metrics. A teaching simulation checks its stated mechanism; it does not establish plant closed-loop benefit.'), '');
  return parts.join('\n');
}

/** A complete research-only edition, located in public/code beside the existing downloads. */
export function buildResearchReview(locale: Locale = 'zh-CN'): string {
  const t = label(locale), records = localizedReviewSources(locale), references = groupReferences(records);
  const parts = [t('# 运行指标决策研究：从目标、进化优化到强化学习', '# Operational Decision Research: From Objectives and Evolutionary Optimization to Reinforcement Learning'), '',
    t('> 九篇完整双语专题的中文版本。原理、算例、公式、九张学术概念图解、四幅既有研究插画及完整读图说明、原始资料与研究议程全部保留。', '> English edition of nine complete bilingual studies. Includes reasoning, worked examples, equations, nine academic concept plates, four existing research illustrations with complete reading guides, primary references, and a research agenda.'), '',
    t('本文件可以独立阅读。章节、数学与工作台链接指向同目录树中的完整教材；插图位于上一级 images 目录。复制离线资料时请保留这些相对位置。', 'This review can be read independently. Chapter, mathematics, and workbench links lead to the complete textbook in the same directory tree; illustrations are in the parent images directory. Preserve these relative locations when copying the offline materials.'), '',
    `- [${t('完整强化学习教材', 'Complete reinforcement-learning textbook')}](../rl-atlas-tutorial${suffix(locale)}.md)`,
    `- [${t('完整烧成工作台模型', 'Complete kiln workbench model')}](${bookAnchor('kiln-workbench', 'code', locale)})`, '',
    `## ${t('专题目录', 'Studies')}`, '', ...researchPages.map(page => `- [${String(page.order).padStart(2, '0')} · ${page.title[locale]}](#research-${page.id})`),
    `- [${t('完整参考资料', 'Complete references')}](#references)`, `- [${t('来源标识索引', 'Source-ID index')}](#source-index)`, '', '---', ''];
  appendResearch(parts, 'code', locale, references, true);
  appendReferences(parts, records, references, locale);
  return parts.join('\n');
}

export async function exportBook(): Promise<void> {
  if (researchPages.length !== 9 || new Set(researchPages.map(page => page.id)).size !== 9) throw new Error('Export requires all nine distinct research studies.');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const results: { file: string; characters: number; bytes: number }[] = [];
  for (const locale of ['zh-CN', 'en'] as const) {
    for (const page of researchPages) if (!page.body[locale].trim()) throw new Error(`Missing ${locale} research body: ${page.id}`);
    const outputs = [
      { path: resolve(root, `docs/rl-atlas-tutorial${suffix(locale)}.md`), content: buildBook('docs', locale) },
      { path: resolve(root, `public/rl-atlas-tutorial${suffix(locale)}.md`), content: buildBook('public', locale) },
      { path: resolve(root, `public/code/research-review${suffix(locale)}.md`), content: buildResearchReview(locale) },
    ];
    for (const output of outputs) {
      await mkdir(dirname(output.path), { recursive: true });
      await writeFile(output.path, output.content, 'utf8');
      results.push({ file: output.path.slice(root.length + 1), characters: Array.from(output.content).length, bytes: Buffer.byteLength(output.content, 'utf8') });
    }
  }
  const allSources = [...sources, ...localizedReviewSources('zh-CN')];
  console.log(JSON.stringify({ locales: ['zh-CN', 'en'], chapters: chapters.length, modules: modules.length, mathUnits: primerUnits.length,
    guides: chapterGuides.length, derivationSteps: chapterGuides.reduce((sum, guide) => sum + guide.steps.length, 0), glossaryTerms: glossary.length,
    researchStudies: researchPages.length, formulaCases: getFormulaCases().length, academicConceptPlates: conceptPlates.length, conceptIllustrations: researchPages.filter(page => page.figure).length,
    sourceIds: allSources.length, uniqueReferenceUrls: groupReferences(allSources).length, reviewSourceIds: reviewSources.length, outputs: results }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await exportBook();
