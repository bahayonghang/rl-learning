/** Export the complete authored curriculum, not a navigation-only outline. */
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chapters, modules, sources } from '../src/content/index';
import type { Source } from '../src/types';
import { getChapterGuide, guideToMarkdown, chapterGuides } from '../src/content/guides';
import { primerUnits, primerIntroduction } from '../src/content/primer';
import { glossary } from '../src/content/glossary';
import { researchBody } from '../src/content/research';

/** Preserve the simulator's full mathematical contract in the downloadable book. */
export const workbenchAppendix = readFileSync(new URL('../docs/kiln-workbench.md', import.meta.url), 'utf8')
  .replace(/^# [^\n]+\n/, '')
  .replace(/^\\\[$|^\\\]$/gm, '$$$$')
  .replace(/\]\(\.\.\/\.\.\/([^\s)]+)\)/g, ']\u0028https://github.com/bahayonghang/rl-learning/blob/main/$1)');

export type BookDestination = 'docs' | 'public';

export interface BookReference {
  number: number;
  url: string;
  sources: Source[];
}

/** Only URL identity is deduplicated; every original source ID remains addressable. */
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

function formatBody(markdown: string, destination: BookDestination): string {
  let fence: { marker: string; length: number } | undefined;
  return markdown.trim().split('\n').map(line => {
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (delimiter) {
      const marker = delimiter[1][0];
      if (!fence) fence = { marker, length: delimiter[1].length };
      else if (marker === fence.marker && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = undefined;
      return line;
    }
    if (fence) return line;
    // Book -> module -> chapter -> authored section. Do not rewrite Python comments.
    let formatted = line.replace(/^(#{1,4}) /, (_, hashes: string) => `${'#'.repeat(Math.min(hashes.length + 2, 6))} `);
    formatted = formatted.replace(/\]\((?:\.\/|\/)?code\/([^\s)]+)\)/g, (_, filename: string) =>
      `](${destination === 'docs' ? '../public/' : './'}code/${filename})`);
    formatted = formatted.replace(/\]\(#\/chapter\/(\d\d)\)/g, '](#chapter-$1)')
      .replace(/\]\(#\/primer\/([a-z-]+)\)/g, '](#math-$1)')
      .replace(/\]\(#\/research\)/g, '](#research)')
      .replace(/\]\(#\/kiln\)/g, '](#kiln-workbench)')
      .replace(/\]\(#\/primer\)/g, '](#math-primer)')
      .replace(/\]\(#\/glossary\)/g, '](#glossary)');
    return formatted;
  }).join('\n');
}

const unique = (items: string[]) => [...new Set(items.filter(Boolean))].join('；');

export function buildBook(destination: BookDestination): string {
  const references = groupReferences(sources);
  const sourceReferences = new Map(references.flatMap(reference => reference.sources.map(source => [source.id, reference] as const)));
  const chapterById = new Map(chapters.map(chapter => [chapter.id, chapter]));
  const parts: string[] = [
    '# RL Atlas｜强化学习：从直觉到决策',
    '',
    '> 完整中文教程 · 8 个数学准备单元 · 24 组水泥案例逐步推导 · 7 个模块 / 24 章 · 研究专题、概念词典、公式、Mermaid、代码与练习解答。',
    '',
    '本教程沿着“问题 → 数学 → 算法 → 代码 → 实验 → 可信结论”的路径组织。先学会解释一个决策问题，再理解每一种算法为什么出现、解决什么问题、还留下哪些限制。',
    '',
    '教程结构受到用户提供的公开推文[《强化学习难点，90% 初学者都搞错了！！》](https://mp.weixin.qq.com/s/x3Jb7imrQtbavvU1vH8Tww)启发；正文、数值例题、练习与代码为独立编写，参考资料列在各章及文末。此文件包含完整教材正文，不依赖购买原推文中的课程。',
    '',
    '## 如何使用这本教程',
    '',
    '- **先预测，再验证。** 每章先手算例题、解释更新方向，再打开网页中对应的交互实验。',
    '- **按依赖学习。** 具备神经网络基础可以略读网络入门，但不要跳过条件期望、Bellman 方程与终止语义。',
    '- **区分机制与证据。** 浏览器实验用于理解数值机制；小型模拟结果不代表工业现场的节能效果。',
    '- **保留单位与时间。** 工业案例使用运行指标设定值增量，保留下层控制与安全门控，不连接真实设备。',
    '- **检查原始资料。** 数学与接口来源均可追溯；阅读时保留定理假设和实验边界。',
    '',
    '建议按个人时间在六至八周内完成一轮：第一至二周处理交互、概率和表格方法；第三周理解 DQN；第四至五周学习 Actor-Critic、PPO 与 SAC；第六周完成环境和评估设计；最后一至二周将离线、模型与约束方法连接到自己的课题。该安排是学习建议，不是学习效果或课时保证。',
    '',
    '数学保留为 LaTeX，流程图保留为 Mermaid 图源。使用支持这些格式的 Markdown 阅读器，可直接渲染；不支持时仍可阅读完整公式与图源。',
    '',
    '## 目录',
    '',
    '- [数学准备：从符号到可计算的例子](#math-primer)',
  ];
  for (const module of modules) {
    parts.push(`- [模块 ${module.id} · ${module.title}](#module-${module.id})`);
    for (const chapter of chapters.filter(item => item.module === module.id)) {
      parts.push(`  - [${chapter.id} · ${chapter.title}](#chapter-${chapter.id})`);
    }
  }
  parts.push('- [水泥工作台：模型、时间与实验](#kiln-workbench)', '- [衔接已有研究：流程工业强化学习](#research)', '- [概念与符号词典](#glossary)', '- [完整参考资料](#references)', '- [来源标识索引](#source-index)', '', '---', '');

  parts.push('<a id="math-primer"></a>', '', '## 数学准备：从符号到可计算的例子', '', primerIntroduction, '');
  for (const unit of primerUnits) {
    parts.push(`<a id="math-${unit.id}"></a>`, '', `### 数学 ${unit.number} · ${unit.title}`, '', unit.summary, '', formatBody(unit.body,destination), '', `**应用到章节：** ${unit.chapters.map(id=>`[第 ${id} 章](#chapter-${id})`).join('；')}`, '', '**网页动手部分：** 对应数学准备单元提供同题参数计算器。纸面推导与初始数字均保留在本节中。', '', '---', '');
  }

  for (const module of modules) {
    parts.push(`<a id="module-${module.id}"></a>`, '', `## 模块 ${module.id} · ${module.title}`, '', module.description, '', `**完成本模块后：** ${module.outcome}`, '');
    for (const chapter of chapters.filter(item => item.module === module.id)) {
      parts.push(`<a id="chapter-${chapter.id}"></a>`, '', `### ${chapter.id} · ${chapter.title}`, '', `*${chapter.subtitle}*`, '', `**程度：** ${chapter.level}　**建议阅读与推演：** ${chapter.duration} 分钟（按个人基础调整）`, '');
      if (chapter.prerequisites.length) {
        parts.push(`**先修章节：** ${chapter.prerequisites.map(id => `[${id} · ${chapterById.get(id)?.title ?? id}](#chapter-${id})`).join('；')}`, '');
      }
      parts.push('**学习目标**', '', ...chapter.objectives.map(objective => `- ${objective}`), '');
      if (chapter.lab) parts.push(`**配套网页实验：** ${chapter.lab}（在网页“交互实验室”打开）`, '');
      const guide = getChapterGuide(chapter.id);
      if (guide) parts.push(formatBody(guideToMarkdown(guide),destination), '', '#### 从案例走向系统正文', '');
      parts.push(formatBody(chapter.body, destination), '', '#### 本章参考资料', '');
      for (const id of chapter.sources) {
        const reference = sourceReferences.get(id);
        const source = reference?.sources.find(item => item.id === id);
        if (!reference || !source) throw new Error(`Chapter ${chapter.id} refers to unknown source: ${id}`);
        parts.push(`- [R${reference.number}](#reference-${reference.number}) · [${source.title}](${source.url}) — ${source.author}，${source.year}。来源标识：${id}。`);
      }
      parts.push('', '---', '');
    }
  }

  parts.push('<a id="kiln-workbench"></a>', '', '## 水泥工作台：模型、时间与实验', '', formatBody(workbenchAppendix,destination), '', '<a id="research"></a>', '', '## 衔接已有研究：流程工业强化学习', '', formatBody(researchBody,destination), '', '<a id="glossary"></a>', '', '## 概念与符号词典', '');
  for (const entry of glossary) {
    parts.push(`### ${entry.term} · ${entry.english}`, '', entry.symbol ? `**符号：** $${entry.symbol}$` : '', '', entry.meaning, '', `**在烧成系统中：** ${entry.kiln}`, '', `**容易混淆：** ${entry.caution}`, '', `**继续阅读：** [第 ${entry.chapter} 章](#chapter-${entry.chapter})`, '');
  }
  parts.push('<a id="references"></a>', '', '## 完整参考资料', '', `以下按网址去重，共 ${references.length} 条资料；保留全部 ${sources.length} 个来源标识，便于与网页章节对应。相同网址的不同来源记录合并展示，未丢弃原有映射。`, '');
  for (const reference of references) {
    const first = reference.sources[0];
    parts.push(`<a id="reference-${reference.number}"></a>`, ...reference.sources.map(source => `<a id="source-${source.id}"></a>`), '', `### R${reference.number} · ${first.title}`, '', `**作者：** ${unique(reference.sources.map(source => source.author))}`, '', `**年份或维护状态：** ${unique(reference.sources.map(source => source.year))}`, '', `**链接：** [查看原始资料](${reference.url})`, '', `**阅读提示：** ${unique(reference.sources.map(source => source.note))}`, '', `**来源标识：** ${reference.sources.map(source => source.id).join('、')}`, '');
  }
  parts.push('<a id="source-index"></a>', '', '## 来源标识索引', '', '| 网页来源标识 | 本书资料编号 | 原始资料 |', '|---|---|---|');
  for (const source of sources) {
    const reference = sourceReferences.get(source.id)!;
    parts.push(`| ${source.id} | [R${reference.number}](#reference-${reference.number}) | [${source.title}](${source.url}) |`);
  }
  parts.push('', '## 配套代码与复现', '', '以下代码均为教学实现。网页示例中的局部 PyTorch 更新片段需要所在章节说明的网络、优化器和数据；不要将片段误当作已经执行的完整训练。', '');
  const codePrefix = destination === 'docs' ? '../public/code/' : './code/';
  parts.push(`- [tabular_foundations.py](${codePrefix}tabular_foundations.py)：仅用 Python 标准库的表格动态规划与 SARSA / Q-learning 实验。`, `- [advanced_math_checks.py](${codePrefix}advanced_math_checks.py)：高级章节的数学机制核验。`, `- [advanced_toy_env.py](${codePrefix}advanced_toy_env.py)：归一化设定值教学环境；需要 Gymnasium 和 NumPy，非真实水泥窑模型。`, '', '实验结果应连同环境版本、参数、随机种子、评估协议、失败情况和约束指标一起保存。教学仿真只验证所声明的机制，不构成现场闭环收益证据。', '');
  return parts.join('\n');
}

export async function exportBook(): Promise<void> {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const outputs = [
    { destination: 'docs' as const, path: resolve(root, 'docs/rl-atlas-tutorial.md') },
    { destination: 'public' as const, path: resolve(root, 'public/rl-atlas-tutorial.md') },
  ];
  const results = [];
  for (const output of outputs) {
    const content = buildBook(output.destination);
    await mkdir(dirname(output.path), { recursive: true });
    await writeFile(output.path, content, 'utf8');
    results.push({ file: output.path.slice(root.length + 1), characters: Array.from(content).length, bytes: Buffer.byteLength(content, 'utf8') });
  }
  console.log(JSON.stringify({ chapters: chapters.length, modules: modules.length, mathUnits: primerUnits.length, guides: chapterGuides.length, derivationSteps: chapterGuides.reduce((sum,guide)=>sum+guide.steps.length,0), glossaryTerms: glossary.length, sourceIds: sources.length, uniqueReferenceUrls: groupReferences(sources).length, chapterBodyCharacters: chapters.reduce((sum, chapter) => sum + Array.from(chapter.body).length, 0), outputs: results }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await exportBook();
}
