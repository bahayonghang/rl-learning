import { chapterFormulaCasesMarkdown } from './formula-cases';
import { expandConceptPlateReferences } from './concept-plates';
import { guideToMarkdown } from './content/guides';
import type { ChapterGuide } from './learning-types';
import type { Chapter } from './types';
import type { Locale } from './i18n';
import { mapMarkdownProse } from './markdown-prose';

export const canonicalPublicAssets = 'https://raw.githubusercontent.com/bahayonghang/rl-learning/main/rl-learning-web/public/';
const canonicalBook = (locale: Locale): string => `https://github.com/bahayonghang/rl-learning/blob/main/rl-learning-web/docs/rl-atlas-tutorial${locale === 'en' ? '.en' : ''}.md`;

/** A downloaded chapter has no adjacent asset folder, so use canonical repository URLs. */
export function chapterDownloadMarkdown(chapter: Chapter, guide: ChapterGuide | undefined, locale: Locale): string {
  const markdown = `# ${chapter.id} ${chapter.title}\n\n${chapter.subtitle}\n\n${guide ? guideToMarkdown(guide, locale) + '\n\n' : ''}${chapterFormulaCasesMarkdown(chapter.id, locale)}\n\n${chapter.body}\n`;
  const expanded = expandConceptPlateReferences(markdown, locale, `${canonicalPublicAssets}images/diagrams/`);
  return mapMarkdownProse(expanded, prose => prose
      .replace(/\]\((?:\.\/|\/)?(images|code)\/([^\s)]+)\)/g, (_, folder: string, path: string) => `](${canonicalPublicAssets}${folder}/${path})`)
      .replace(/\]\(#\/chapter\/(\d\d)\)/g, (_, id: string) => `](${canonicalBook(locale)}#chapter-${id})`)
      .replace(/\]\(#\/research\/([a-z0-9-]+)\)/g, (_, id: string) => `](${canonicalBook(locale)}#research-${id})`)
      .replace(/\]\(#\/gallery\/([a-z0-9-]+)\)/g, (_, id: string) => `](${canonicalBook(locale)}#figure-${id})`)
      .replace(/\]\(#\/primer\/([a-z0-9-]+)\)/g, (_, id: string) => `](${canonicalBook(locale)}#math-${id})`)
      .replace(/\]\(#\/(kiln|primer|glossary|references|research)\)/g, (_, route: string) => `](${canonicalBook(locale)}#${({ kiln: 'kiln-workbench', primer: 'math-primer' } as Record<string, string>)[route] ?? route})`));
}
