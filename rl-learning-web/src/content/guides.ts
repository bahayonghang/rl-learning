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
export function guideToMarkdown(guide: ChapterGuide, locale: 'zh-CN' | 'en' = 'zh-CN'): string {
  const t = (zh: string, en: string) => locale === 'en' ? en : zh;
  const lines = [
    t('## 跟着水泥案例，一步一步推导','## Derive it step by step with the cement case'),
    '', t('### 当前情景','### Current scenario'), '', guide.scenario,
    '', t('**要回答的问题：** ','**The question: ** ')+guide.decisionQuestion,
    '', t('**先建立直觉：** ','**Build the intuition: ** ')+guide.intuition,
    '', t('### 符号与工艺含义','### Symbols and process meaning'), '',
    t('| 符号 | 名称 | 在烧成案例中的含义 |','| Symbol | Name | Meaning in the kiln case |'), '|---|---|---|',
    ...guide.symbols.map(item=>`| $${symbolCell(item.symbol)}$ | ${cell(item.name)} | ${cell(item.meaning)} |`),
  ];
  guide.steps.forEach((step,index)=>{
    lines.push('',t(`### 第 ${index+1} 步：${step.title}`,`### Step ${index+1}: ${step.title}`),'',step.explanation);
    if(step.formula)lines.push('','$$',step.formula,'$$');
    lines.push('',t('**代入数字：**','**Substitute numbers:**'),'',step.example,'',t('**为什么需要这一步：**','**Why this step matters:**'),'',step.why);
  });
  lines.push('',t('### 检查自己的理解','### Check your understanding'),'',guide.checkpoint.question,'');
  guide.checkpoint.options.forEach((option,index)=>lines.push(`${index+1}. ${option}`));
  lines.push('',t(`**正确选项：${guide.checkpoint.correctIndex+1}。**`,`**Correct option: ${guide.checkpoint.correctIndex+1}.**`),'');
  guide.checkpoint.feedback.forEach((feedback,index)=>lines.push(t(`- 选项 ${index+1}：${feedback}`,`- Option ${index+1}: ${feedback}`)));
  lines.push('',t('**带回你的研究：** ','**Take it into your research:** ')+guide.takeaway,'');
  return lines.join('\n');
}

