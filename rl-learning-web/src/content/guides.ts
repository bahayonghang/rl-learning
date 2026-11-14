import { foundationGuides } from './foundations-guides';
import { advancedGuides } from './advanced-guides';
import type { ChapterGuide } from '../learning-types';

export const chapterGuides: ChapterGuide[] = [...foundationGuides, ...advancedGuides].sort((a,b)=>a.chapterId.localeCompare(b.chapterId));
export const getChapterGuide = (id: string) => chapterGuides.find(guide=>guide.chapterId===id);
const cell = (value: string) => value.replaceAll('|','\\|').replaceAll('\n',' ');
// TeX pipe delimiters conflict with Markdown table separators even when doubled.
// Equivalent named delimiters preserve both the formula and the three columns.
const symbolCell = (value: string) => cell(value.replaceAll('\\|','\\Vert ').replaceAll('|','\\vert '));

/** Export every derivation step, including content hidden by the interactive stepper. */
export function guideToMarkdown(guide: ChapterGuide): string {
  const lines = [
    '## 跟着水泥案例，一步一步推导',
    '', '### 当前情景', '', guide.scenario,
    '', '**要回答的问题：** '+guide.decisionQuestion,
    '', '**先建立直觉：** '+guide.intuition,
    '', '### 符号与工艺含义', '',
    '| 符号 | 名称 | 在烧成案例中的含义 |', '|---|---|---|',
    ...guide.symbols.map(item=>`| $${symbolCell(item.symbol)}$ | ${cell(item.name)} | ${cell(item.meaning)} |`),
  ];
  guide.steps.forEach((step,index)=>{
    lines.push('',`### 第 ${index+1} 步：${step.title}`,'',step.explanation);
    if(step.formula)lines.push('','$$',step.formula,'$$');
    lines.push('','**代入数字：**','',step.example,'','**为什么需要这一步：**','',step.why);
  });
  lines.push('','### 检查自己的理解','',guide.checkpoint.question,'');
  guide.checkpoint.options.forEach((option,index)=>lines.push(`${index+1}. ${option}`));
  lines.push('',`**正确选项：${guide.checkpoint.correctIndex+1}。**`,'');
  guide.checkpoint.feedback.forEach((feedback,index)=>lines.push(`- 选项 ${index+1}：${feedback}`));
  lines.push('','**带回你的研究：** '+guide.takeaway,'');
  return lines.join('\n');
}

