import { sources, chapters } from './content/localized';
import { reviewSources } from './research/sources';
import { researchPages } from './research/content';
import { text as t, getLocale } from './i18n';
import type { Source } from './types';

export type SourceTopic='mathematics'|'reinforcement'|'process'|'optimization'|'safety'|'evaluation'|'implementation';
export type SourceKind='theory'|'review'|'simulation'|'deployment'|'documentation'|'learning';
export interface CatalogueSource extends Source{
 ids:string[];topic:SourceTopic;kind:SourceKind;venue:string;keywords:string[];
 related:{href:string;label:string}[];
}
export const sourceTopics=():Record<SourceTopic,string>=>({mathematics:t('数学与基础','Mathematics & foundations'),reinforcement:t('强化学习','Reinforcement learning'),process:t('过程与运行决策','Process & operations'),optimization:t('进化与多目标优化','Evolution & multiobjective optimization'),safety:t('约束与安全','Constraints & safety'),evaluation:t('评估与现场证据','Evaluation & field evidence'),implementation:t('实现与接口','Implementation & interfaces')});
export const sourceKinds=():Record<SourceKind,string>=>({theory:t('原理论文','Theory / methods'),review:t('学术综述','Research reviews'),simulation:t('算法与实验','Algorithms & experiments'),deployment:t('一手运行报告','First-party operational reports'),documentation:t('文档 / 登记记录','Documentation / deposited records'),learning:t('教材与课程','Books & courses')});
const canonical=(url:string)=>new URL(url).href.replace(/\/$/,'').toLowerCase();
function classify(source:Source):{topic:SourceTopic;kind:SourceKind}{
 const id=source.id;
 if(['f-sutton','f-silver','f-probability','f-decision','f-policy-gradient'].includes(id))return{topic:'mathematics',kind:'learning'};
 if(/gym|pytorch|spinup|sb3|project-contract/.test(id))return{topic:'implementation',kind:'documentation'};
 if(id==='rliable-paper')return{topic:'evaluation',kind:'theory'};
 if(id==='cpo-paper')return{topic:'safety',kind:'theory'};
 return{topic:'reinforcement',kind:/ucb|td$|qlearning|triad|target|reinforce|doubleq/.test(id)?'theory':'simulation'};
}
/** Deduplicate URLs, never source IDs; both chapter and review citations stay valid. */
export function allSources():CatalogueSource[]{
 const byUrl=new Map<string,CatalogueSource>();
 for(const source of sources){
  const key=canonical(source.url),existing=byUrl.get(key);
  if(existing){existing.ids.push(source.id);continue;}
  byUrl.set(key,{...source,ids:[source.id],...classify(source),venue:'',keywords:[],related:[]});
 }
 for(const source of reviewSources){
  const key=canonical(source.url),existing=byUrl.get(key);
  const note=getLocale()==='en'?source.noteEn:source.note;
  byUrl.set(key,{...source,note,ids:[...new Set([...(existing?.ids??[]),source.id])],topic:source.topic,kind:['r2-mpcbook','r2-rlbook'].includes(source.id)?'learning':source.evidence,keywords:source.keywords,related:[]});
 }
 const locale=getLocale();
 return [...byUrl.values()].map(source=>({...source,related:[
  ...chapters.filter(chapter=>chapter.sources.some(id=>source.ids.includes(id))).map(chapter=>({href:`#/chapter/${chapter.id}`,label:t(`第 ${chapter.id} 章`,`Chapter ${chapter.id}`)})),
  ...researchPages.filter(page=>page.sources.some(id=>source.ids.includes(id))).map(page=>({href:`#/research/${page.id}`,label:page.title[locale]})),
 ]}));
}
export function filterSources(records:CatalogueSource[],query:string,topic='all',kind='all'):CatalogueSource[]{
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return records.filter(source=>{
  if(topic!=='all'&&source.topic!==topic||kind!=='all'&&source.kind!==kind)return false;
  const text=[source.title,source.author,source.year,source.url,source.note,source.venue,...source.keywords,...source.ids].join(' ').toLowerCase();
  return terms.every(term=>text.includes(term));
 });
}
