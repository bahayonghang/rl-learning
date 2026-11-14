import { chapters, chapterGuides, primerUnits, glossary } from './content/localized';
import { researchPages } from './research/content';
import { text as t, getLocale } from './i18n';
export interface LearningSearchResult {href:string;label:string;title:string;subtitle:string;}
interface SearchDocument extends LearningSearchResult{keywords:string;body:string;}
function documents():SearchDocument[]{const locale=getLocale();return[
 ...chapters.map(chapter=>({href:`#/chapter/${chapter.id}`,label:chapter.id,title:chapter.title,subtitle:t(`第 ${chapter.id} 章 · ${chapter.subtitle}`,`Chapter ${chapter.id} · ${chapter.subtitle}`),keywords:chapter.tags.join(' '),body:chapter.body+' '+JSON.stringify(chapterGuides.find(guide=>guide.chapterId===chapter.id)??'')})),
 ...primerUnits.map(unit=>({href:`#/primer/${unit.id}`,label:t('数学','Math'),title:unit.title,subtitle:t('数学准备 · ','Math primer · ')+unit.summary,keywords:'数学 概率 基础 推导 mathematics probability primer '+unit.calculator,body:unit.body})),
 ...researchPages.map(page=>({href:`#/research/${page.id}`,label:t('研究','Research'),title:page.title[locale],subtitle:page.summary[locale],keywords:page.title['zh-CN']+' '+page.title.en+' '+page.id+(page.id==='agenda'?' OAM-Net QC-MTWaveSME PG-MOEA/D-IEpsilon NURBS TCNSO 研究接口':''),body:page.body[locale]})),
 {href:'#/kiln',label:t('水泥','Cement'),title:t('水泥烧成决策工作台','Cement calcination decision workbench'),subtitle:t('调整设定值，观察动态响应、化验延迟与执行门控','Adjust setpoints and inspect dynamic responses, assay delays and execution gates'),keywords:'Tc T2 SP PV 设定值 水泥 烧成 OOD 安全 动作 奖励 f-CaO cement kiln safety gates action reward quality',body:'状态 动作 奖励 成本 转移 五分钟 历史窗口 下层 PID APC 预热器 分解炉 回转窑 篦冷机 state cost history window preheater calciner rotary kiln cooler'},
 {href:'#/glossary',label:t('词典','Glossary'),title:t('概念与符号词典','Concepts and symbols'),subtitle:t('用工艺语言解释 RL 名词与常见误解','Explain RL terminology and misconceptions in process language'),keywords:'术语 符号 名词 词典 glossary terminology symbols',body:JSON.stringify(glossary)},
 ];}
export function searchLearning(query:string):LearningSearchResult[]{
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);if(!terms.length)return[];
 return documents().map(document=>{const title=document.title.toLowerCase(),keywords=document.keywords.toLowerCase(),subtitle=document.subtitle.toLowerCase(),combined=`${title} ${keywords} ${subtitle} ${document.body}`.toLowerCase();if(!terms.every(term=>combined.includes(term)))return{document,score:-1};return{document,score:terms.reduce((sum,term)=>sum+(title.includes(term)?20:0)+(keywords.includes(term)?8:0)+(subtitle.includes(term)?4:0),0)};}).filter(item=>item.score>=0).sort((a,b)=>b.score-a.score).map(({document:{href,label,title,subtitle}})=>({href,label,title,subtitle}));
}
