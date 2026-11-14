import * as zh from './index';
import { chapterGuides as zhGuides } from './guides';
import { primerUnits as zhPrimer, primerIntroduction as zhIntroduction } from './primer';
import { glossary as zhGlossary } from './glossary';
import type { Chapter, CourseModule, Source } from '../types';
import type { ChapterGuide } from '../learning-types';
import type { PrimerUnit } from './primer';
import type { GlossaryEntry } from './glossary';
import type { Locale } from '../i18n';

export interface ContentBundle {
  chapters: Chapter[]; modules: CourseModule[]; sources: Source[];
  guides: ChapterGuide[]; primerUnits: PrimerUnit[]; primerIntroduction: string; glossary: GlossaryEntry[];
}
const chinese: ContentBundle = { ...zh, guides: zhGuides, primerUnits: zhPrimer, primerIntroduction: zhIntroduction, glossary: zhGlossary };
let english: Promise<ContentBundle> | undefined;
export let chapters = chinese.chapters;
export let modules = chinese.modules;
export let sources = chinese.sources;
export let chapterGuides = chinese.guides;
export let primerUnits = chinese.primerUnits;
export let primerIntroduction = chinese.primerIntroduction;
export let glossary = chinese.glossary;

/** English is a separate chunk: switching never calls a translation service. */
export function loadContentBundle(locale: Locale): Promise<ContentBundle> {
  if (locale === 'zh-CN') return Promise.resolve(chinese);
  return english ??= Promise.all([
    import('./en/foundations'), import('./en/advanced'),
    import('./en/foundations-guides'), import('./en/advanced-guides'),
    import('./en/primer'), import('./en/glossary'), import('./en/modules'), import('./en/research-sources'),
  ]).then(([foundation, advanced, fg, ag, primer, terms, moduleData, research]) => ({
    chapters: [...foundation.foundationChaptersEn,...advanced.advancedChaptersEn].sort((a,b)=>a.number-b.number),
    modules: moduleData.modulesEn,
    sources: [...foundation.foundationSourcesEn,...advanced.advancedSourcesEn,...research.researchSourcesEn],
    guides: [...fg.foundationGuidesEn,...ag.advancedGuidesEn].sort((a,b)=>a.chapterId.localeCompare(b.chapterId)),
    primerUnits: primer.primerUnitsEn, primerIntroduction: primer.primerIntroductionEn, glossary: terms.glossaryEn,
  })).catch(error=>{english=undefined;throw error;});
}
export function activateContent(bundle: ContentBundle): void {
  chapters=bundle.chapters; modules=bundle.modules; sources=bundle.sources; chapterGuides=bundle.guides;
  primerUnits=bundle.primerUnits; primerIntroduction=bundle.primerIntroduction; glossary=bundle.glossary;
}
export const getChapter = (id: string) => chapters.find(item=>item.id===id);
export const getModule = (id: number) => modules.find(item=>item.id===id)!;
export const moduleChapters = (id: number) => chapters.filter(item=>item.module===id);
export const getChapterGuide = (id: string) => chapterGuides.find(item=>item.chapterId===id);
