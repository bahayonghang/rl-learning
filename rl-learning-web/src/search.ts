import { chapters } from './content';
import { chapterGuides } from './content/guides';
import { primerUnits } from './content/primer';
import { glossary } from './content/glossary';
import { researchBody } from './content/research';

export interface LearningSearchResult {
  href: string;
  label: string;
  title: string;
  subtitle: string;
}
interface SearchDocument extends LearningSearchResult { keywords: string; body: string; }
const documents: SearchDocument[] = [
  ...chapters.map(chapter=>({
    href:`#/chapter/${chapter.id}`,label:chapter.id,title:chapter.title,
    subtitle:`第 ${chapter.id} 章 · ${chapter.subtitle}`,keywords:chapter.tags.join(' '),
    body:chapter.body+' '+JSON.stringify(chapterGuides.find(guide=>guide.chapterId===chapter.id)??''),
  })),
  ...primerUnits.map(unit=>({
    href:`#/primer/${unit.id}`,label:'数学',title:unit.title,subtitle:'数学准备 · '+unit.summary,
    keywords:'数学 概率 基础 小白 推导 '+unit.calculator,body:unit.body,
  })),
  {href:'#/kiln',label:'水泥',title:'水泥烧成决策工作台',subtitle:'调整设定值，观察动态响应、化验延迟与安全门控',keywords:'Tc T2 SP PV 设定值 水泥 烧成 OOD 安全 动作 奖励 f-CaO',body:'状态 动作 奖励 成本 转移 五分钟 历史窗口 下层 PID APC 预热器 分解炉 回转窑 篦冷机'},
  {href:'#/research',label:'研究',title:'从已有研究走向强化学习',subtitle:'软测量、世界模型、离线决策、约束与可验证课题',keywords:'研究 OAM-Net QC-MTWaveSME PG-MOEA/D-IEpsilon NURBS TCNSO TD3 工业',body:researchBody},
  {href:'#/glossary',label:'词典',title:'概念与符号词典',subtitle:'用工艺语言解释 RL 名词与常见误解',keywords:'术语 符号 名词 词典',body:JSON.stringify(glossary)},
];

export function searchLearning(query: string): LearningSearchResult[] {
  const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length)return[];
  return documents.map(document=>{
    const title=document.title.toLowerCase(),keywords=document.keywords.toLowerCase();
    const combined=`${title} ${keywords} ${document.subtitle} ${document.body}`.toLowerCase();
    if(!terms.every(term=>combined.includes(term)))return{document,score:-1};
    const score=terms.reduce((sum,term)=>sum+(title.includes(term)?20:0)+(keywords.includes(term)?8:0)+(document.subtitle.toLowerCase().includes(term)?4:0),0);
    return{document,score};
  }).filter(item=>item.score>=0).sort((a,b)=>b.score-a.score).map(({document:{href,label,title,subtitle}})=>({href,label,title,subtitle}));
}

