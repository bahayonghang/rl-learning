import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadContentBundle, activateContent } from '../src/content/localized';
import { setLocale, isLocale, type Locale } from '../src/i18n';
import { parseState, loadState, saveState, STORAGE_KEY } from '../src/storage';
import { researchPages } from '../src/research/content';
import { reviewSources } from '../src/research/sources';
import { allSources, filterSources } from '../src/source-catalogue';
import { getFigures } from '../src/figures';
import { searchLearning } from '../src/search';

const zh=await loadContentBundle('zh-CN'),en=await loadContentBundle('en');
async function edition(locale:Locale){setLocale(locale);activateContent(await loadContentBundle(locale));}

test('both editions contain the complete course and keep educational answer/formula identities',()=>{
 assert.deepEqual(en.chapters.map(c=>c.id),zh.chapters.map(c=>c.id));assert.equal(en.chapters.length,24);
 assert.deepEqual(en.sources.map(s=>s.id).sort(),zh.sources.map(s=>s.id).sort());
 assert.deepEqual(en.primerUnits.map(x=>x.id),zh.primerUnits.map(x=>x.id));assert.equal(en.primerUnits.length,8);assert.equal(en.glossary.length,36);
 assert.equal(en.guides.reduce((sum,g)=>sum+g.steps.length,0),154);
 for(const [i,g] of en.guides.entries()){
  const original=zh.guides[i];assert.equal(g.chapterId,original.chapterId);assert.deepEqual(g.steps.map(x=>x.formula),original.steps.map(x=>x.formula));assert.deepEqual(g.symbols.map(x=>x.symbol),original.symbols.map(x=>x.symbol));assert.equal(g.checkpoint.correctIndex,original.checkpoint.correctIndex);assert.equal(g.checkpoint.feedback.length,g.checkpoint.options.length);
 }
 for(const [i,c] of en.chapters.entries()){
  assert.deepEqual(c.sources,zh.chapters[i].sources);assert.deepEqual(c.prerequisites,zh.chapters[i].prerequisites);assert.equal(c.lab,zh.chapters[i].lab);
  assert.ok(c.body.length>2000,`English chapter ${c.id} is not a complete article`);
  assert.doesNotMatch([c.title,c.subtitle,...c.objectives,c.body].join('\n'),/[\u3400-\u9fff]/u,`untranslated English chapter ${c.id}`);
 }
});

test('nine research studies have complete bilingual bodies and all citation IDs resolve',()=>{
 const ids=['history','indicators','objectives','evolution','sequential','architecture','evidence','open-problems','agenda'];assert.deepEqual(researchPages.map(p=>p.id),ids);
 const sources=new Set(reviewSources.map(x=>x.id));assert.equal(sources.size,reviewSources.length);
 for(const [index,page] of researchPages.entries()){
  assert.equal(page.order,index+1);assert.ok(page.sources.length>=3);
  for(const id of page.sources)assert.ok(sources.has(id),`${page.id}: unknown ${id}`);
  for(const locale of ['zh-CN','en'] as const){const body=page.body[locale];assert.ok(body.length>2000,`${page.id}/${locale}: outline instead of full text`);assert.ok((body.match(/^## /gm)??[]).length>=4);assert.match(body,/(?:```|~~~)mermaid/);if(page.group!=='outlook')assert.match(body,/\$/);}
  assert.doesNotMatch(page.body.en,/[\u3400-\u9fff]/u,`untranslated research ${page.id}`);
 }
});

test('source catalogue deduplicates links without losing IDs and supports compound/topic/type search',async()=>{
 for(const locale of ['zh-CN','en'] as const){await edition(locale);const catalogue=allSources(),bundle=await loadContentBundle(locale);
  assert.equal(new Set(catalogue.map(s=>s.url.toLowerCase().replace(/\/$/,''))).size,catalogue.length);
  const allIds=catalogue.flatMap(s=>s.ids);assert.equal(new Set(allIds).size,allIds.length);
  assert.deepEqual(allIds.slice().sort(),[...bundle.sources,...reviewSources].map(s=>s.id).sort());
  assert.ok(filterSources(catalogue,'10.1109/TEVC.2004.831456').some(s=>s.ids.includes('r2-dynamic')));
  assert.ok(filterSources(catalogue,'Kumar conservative','reinforcement').length>=1);
  assert.ok(filterSources(catalogue,'','evaluation','deployment').length>=2);
  assert.equal(filterSources(catalogue,'no-such-reference-2026').length,0);
  const books=filterSources(catalogue,'','all','learning').flatMap(s=>s.ids);assert.ok(books.includes('r2-mpcbook'));assert.ok(books.includes('r2-rlbook'));assert.ok(books.includes('f-policy-gradient'));
 }
 await edition('zh-CN');
});

test('visual library includes real chapter/research diagrams with stable bilingual identities and existing assets',async()=>{
 await edition('zh-CN');const chinese=getFigures();await edition('en');const english=getFigures();
 assert.deepEqual(english.map(x=>x.id),chinese.map(x=>x.id));assert.equal(new Set(english.map(x=>x.id)).size,english.length);
 assert.ok(english.filter(x=>x.kind==='diagram').length>=20);assert.equal(english.filter(x=>x.topic==='orientation').length,3);
 for(const figure of english){assert.ok(figure.explanation.length>50);assert.match(figure.href,/^#\//);if(figure.image)assert.ok(statSync(resolve('public',figure.image)).isFile());if(figure.diagram)assert.match(figure.diagram,/^(flowchart|graph|sequenceDiagram|stateDiagram)/);}
 for(const id of ['operations-stack','evolution-search','safe-agent','world-model'])assert.equal(english.find(x=>x.id===id)?.regions?.length,4);
 await edition('zh-CN');
});

test('changing editions refreshes search documents rather than retaining the old language index',async()=>{
 await edition('en');assert.equal(searchLearning('PPO')[0].href,'#/chapter/15');assert.ok(searchLearning('OAM-Net').some(x=>x.href==='#/research/agenda'));assert.ok(searchLearning('conditional probability').some(x=>x.href.startsWith('#/primer/')));assert.doesNotMatch(searchLearning('Bellman')[0].title,/[\u3400-\u9fff]/u);
 await edition('zh-CN');assert.equal(searchLearning('PPO')[0].href,'#/chapter/15');assert.ok(searchLearning('条件概率').some(x=>x.href.startsWith('#/primer/')));assert.match(searchLearning('Bellman')[0].title,/[\u3400-\u9fff]/u);
});

test('preference migration retains completion/theme while discarding retired note, bookmark and resume fields',()=>{
 const old=JSON.stringify({version:1,completed:['01','24','01','00','99',null],theme:'dark',textSize:'large',bookmarks:['01'],notes:{'01':'private old note'},lastChapter:'09'});
 assert.deepEqual(parseState(old),{version:2,completed:['01','24'],theme:'dark',textSize:'large',locale:'zh-CN'});
 assert.equal(parseState('{broken').locale,'zh-CN');assert.equal(parseState(JSON.stringify({version:2,locale:'__proto__'})).locale,'zh-CN');assert.equal(isLocale('constructor'),false);assert.equal(parseState(JSON.stringify({version:2,locale:'en'})).locale,'en');
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),records=new Map([['rl-atlas-learning-v1',old]]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>records.get(k)??null,setItem:(k:string,v:string)=>records.set(k,v)}});
 try{const migrated=loadState();assert.equal(migrated.theme,'dark');migrated.locale='en';assert.equal(saveState(migrated),true);assert.equal(records.get('rl-atlas-learning-v1'),old);assert.doesNotMatch(records.get(STORAGE_KEY)!,/bookmarks|notes|lastChapter/);assert.equal(loadState().locale,'en');}finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});

test('removed learning modules have no entry points or editor controls in the application shell',()=>{
 const main=readFileSync('src/main.ts','utf8');assert.doesNotMatch(main,/#\/notes|data-bookmark|data-note|continue-card|continue-chapter/);
 const manifest=JSON.parse(readFileSync('package.json','utf8'));assert.equal(manifest.dependencies.vite,undefined);assert.ok(manifest.devDependencies.vite.startsWith('8.'));
});
