import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import katex from 'katex';
import { chapters, modules, sources } from '../src/content/index';
import { foundationSources } from '../src/content/foundations';
import { advancedSources } from '../src/content/advanced';
import { researchSources } from '../src/content/research';
import { researchBody } from '../src/content/research';
import { chapterGuides, guideToMarkdown } from '../src/content/guides';
import { primerIntroduction, primerUnits } from '../src/content/primer';
import { glossary } from '../src/content/glossary';
import { buildBook, groupReferences, workbenchAppendix } from '../scripts/export-book';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = resolve(root, 'public');
const authoredDocuments = [
  ...chapters.map(chapter => ({ name: `chapter ${chapter.id}`, body: chapter.body })),
  ...chapterGuides.map(guide => ({ name: `guide ${guide.chapterId}`, body: guideToMarkdown(guide) })),
  { name: 'math introduction', body: primerIntroduction },
  ...primerUnits.map(unit => ({ name: `math ${unit.id}`, body: unit.body })),
  { name: 'research', body: researchBody },
  { name: 'kiln workbench appendix', body: workbenchAppendix },
  ...glossary.map(entry => ({ name: `glossary ${entry.term}`, body: [entry.symbol ? `$${entry.symbol}$` : '', entry.meaning, entry.kiln, entry.caution].join('\n\n') })),
];

/** Read the canonical metadata without importing its browser-only CSS dependency. */
function labRecords(): { id: string; chapter: string }[] {
  const source = readFileSync(resolve(root, 'src/labs/index.ts'), 'utf8');
  const declaration = source.match(/export const labs\b[\s\S]*?=\s*\[([\s\S]*?)\n\];/);
  assert.ok(declaration, 'canonical laboratory metadata must remain statically inspectable');
  return [...declaration[1].matchAll(/\{([^{}]*)\}/g)].map(match => {
    const fields: Record<string, string> = {};
    for (const property of match[1].matchAll(/(?:^|,)\s*(?:(['"])([^'"]+)\1|([A-Za-z_$][\w$]*))\s*:\s*(['"])(.*?)\4/g)) {
      fields[property[2] ?? property[3]] = property[5];
    }
    assert.ok(fields.id && fields.chapter, 'each lab needs a literal ID and linked chapter');
    return { id: fields.id, chapter: fields.chapter };
  });
}

/** Marked recognizes both backtick and tilde fences, including their nested contexts. */
function markdownWithoutCode(markdown: string): string {
  const fragments: string[] = [];
  marked.walkTokens(marked.lexer(markdown), token => {
    if (token.type === 'code' || token.type === 'codespan') fragments.push(token.raw);
  });
  let result = markdown;
  for (const fragment of fragments.sort((a, b) => b.length - a.length)) {
    result = result.split(fragment).join(fragment.replace(/[^\n]/g, ' '));
  }
  return result;
}

function formulasIn(markdown: string): { expression: string; display: boolean }[] {
  const text = markdownWithoutCode(markdown);
  const formulas: { expression: string; display: boolean }[] = [];
  const escaped = (index: number): boolean => {
    let preceding = 0;
    for (let k = index - 1; k >= 0 && text[k] === '\\'; k--) preceding++;
    return preceding % 2 === 1;
  };
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '$' || escaped(i)) continue;
    const display = text[i + 1] === '$';
    const delimiter = display ? '$$' : '$';
    const start = i + delimiter.length;
    let end = text.indexOf(delimiter, start);
    while (end >= 0 && escaped(end)) end = text.indexOf(delimiter, end + delimiter.length);
    assert.ok(end >= 0, `unclosed ${delimiter} formula near ${text.slice(Math.max(0, i - 30), i + 80)}`);
    const expression = text.slice(start, end);
    assert.ok(expression.trim(), 'empty math expression');
    if (!display) assert.ok(!expression.includes('\n'), 'inline math must not cross a paragraph');
    formulas.push({ expression, display });
    i = end + delimiter.length - 1;
  }
  return formulas;
}

function diagramsIn(markdown: string): string[] {
  const diagrams: string[] = [];
  marked.walkTokens(marked.lexer(markdown), token => {
    if (token.type === 'code' && 'lang' in token && token.lang?.split(/\s+/)[0] === 'mermaid' && 'text' in token) diagrams.push(token.text);
  });
  return diagrams;
}

function assertLocalResources(markdown: string, relativeTo: string): number {
  let checked = 0;
  marked.walkTokens(marked.lexer(markdown), token => {
    if ((token.type !== 'link' && token.type !== 'image') || !('href' in token)) return;
    const href = String(token.href);
    if (/^(https?:|mailto:|#)/.test(href)) return;
    assert.ok(!/^[a-z][a-z\d+.-]*:/i.test(href), `unsupported link protocol: ${href}`);
    const path = decodeURIComponent(href.split(/[?#]/)[0]);
    if (!path) return;
    const absolute = path.startsWith('/') ? resolve(publicDirectory, `.${path}`) : resolve(relativeTo, path);
    assert.ok(absolute.startsWith(publicDirectory + sep), `local resource must resolve inside public/: ${href}`);
    assert.ok(statSync(absolute).isFile(), `missing downloadable resource: ${href}`);
    checked++;
  });
  return checked;
}

test('the complete curriculum has 24 ordered chapters in seven populated modules', () => {
  assert.equal(chapters.length, 24);
  assert.equal(modules.length, 7);
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, chapters.length);
  assert.equal(new Set(modules.map(module => module.id)).size, modules.length);
  const chapterById = new Map(chapters.map(chapter => [chapter.id, chapter]));
  const moduleIds = new Set(modules.map(module => module.id));
  for (const [index, chapter] of chapters.entries()) {
    assert.equal(chapter.number, index + 1);
    assert.equal(chapter.id, String(chapter.number).padStart(2, '0'));
    assert.ok(moduleIds.has(chapter.module), `${chapter.id} has an unknown module`);
    assert.ok(chapter.title.trim() && chapter.subtitle.trim() && chapter.objectives.length > 0);
    assert.ok(chapter.duration > 0 && Number.isFinite(chapter.duration));
    for (const prerequisite of chapter.prerequisites) {
      const previous = chapterById.get(prerequisite);
      assert.ok(previous && previous.number < chapter.number, `invalid prerequisite ${prerequisite} for chapter ${chapter.id}`);
    }
  }
  for (const module of modules) assert.ok(chapters.some(chapter => chapter.module === module.id));
});

test('chapter references and the 14 canonical laboratory entries resolve', t => {
  const labs = labRecords();
  const labIds = new Set(labs.map(lab => lab.id));
  const chapterIds = new Set(chapters.map(chapter => chapter.id));
  assert.equal(labs.length, 14);
  assert.equal(labIds.size, labs.length);
  for (const lab of labs) assert.ok(chapterIds.has(lab.chapter), `lab ${lab.id} links to a missing chapter`);
  for (const chapter of chapters) if (chapter.lab) assert.ok(labIds.has(chapter.lab), `chapter ${chapter.id} links to unknown lab ${chapter.lab}`);
  const allRecords = [...foundationSources, ...advancedSources, ...researchSources];
  assert.equal(new Set(allRecords.map(source => source.id)).size, allRecords.length, 'duplicate source IDs must not be silently discarded');
  assert.equal(sources.length, allRecords.length);
  const sourceIds = new Set(sources.map(source => source.id));
  for (const source of sources) {
    assert.ok(source.id && source.title && source.author && source.note);
    assert.match(source.url, /^https:\/\//);
    assert.doesNotThrow(() => new URL(source.url));
  }
  for (const chapter of chapters) {
    assert.ok(chapter.sources.length > 0, `chapter ${chapter.id} needs source references`);
    for (const id of chapter.sources) assert.ok(sourceIds.has(id), `${chapter.id} references missing source ${id}`);
  }
  t.diagnostic(`Checked ${sources.length} source IDs and ${labs.length} laboratories.`);
});

test('every chapter contains substantive exercise answers, not empty details', () => {
  for (const chapter of chapters) {
    assert.match(chapter.body, /^## 练习与解答\s*$/m, `chapter ${chapter.id} has no exercise section`);
    const details = [...chapter.body.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
    assert.ok(details.length > 0, `chapter ${chapter.id} has no expandable answers`);
    for (const detail of details) {
      assert.ok(detail[1].trim(), 'answer control needs an accessible label');
      assert.ok(detail[2].replace(/<[^>]+>/g, '').trim(), `chapter ${chapter.id} contains an empty answer`);
    }
  }
});

test('math extraction excludes both kinds of fenced code and inline code', () => {
  const fixture = ['~~~python', 'price = "$unclosed"', '~~~', '```mermaid', 'A["$not math$"] --> B', '```', '`$also code$`', '', '$x+1$', '', '$$y^2$$'].join('\n');
  assert.deepEqual(formulasIn(fixture), [{ expression: 'x+1', display: false }, { expression: 'y^2', display: true }]);
  assert.throws(() => formulasIn('A broken formula: $x + 1'), /unclosed/);
});

test('all authored mathematical expressions render with strict KaTeX errors', t => {
  let count = 0;
  for (const document of authoredDocuments) {
    const formulas = formulasIn(document.body);
    for (const formula of formulas) {
      assert.doesNotThrow(() => katex.renderToString(formula.expression.trim(), {
        displayMode: formula.display, throwOnError: true, strict: 'ignore', trust: false,
      }), `KaTeX error in ${document.name}: ${formula.expression}`);
      count++;
    }
  }
  assert.ok(count > 0);
  t.diagnostic(`Rendered ${count} formulas across ${authoredDocuments.length} authored documents, including all guides and mathematics units.`);
});

test('every Mermaid source parses with a real DOM and strict security', async t => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  try {
    // DOMPurify obtains window during import, so Mermaid must load after JSDOM setup.
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', flowchart: { htmlLabels: false } });
    const representedModules = new Set<number>();
    let count = 0;
    for (const chapter of chapters) {
      for (const diagram of diagramsIn(chapter.body)) {
        const parsed = await mermaid.parse(diagram);
        assert.ok(parsed, `invalid Mermaid in chapter ${chapter.id}`);
        representedModules.add(chapter.module);
        count++;
      }
    }
    for (const module of modules) assert.ok(representedModules.has(module.id), `module ${module.id} needs a Mermaid diagram`);
    for (const document of authoredDocuments.slice(chapters.length)) {
      for (const diagram of diagramsIn(document.body)) {
        assert.ok(await mermaid.parse(diagram), `invalid Mermaid in ${document.name}`);
        count++;
      }
    }
    t.diagnostic(`Parsed ${count} Mermaid diagrams covering all ${modules.length} modules and the new learning material.`);
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});

test('downloadable chapter and exported-book links resolve to actual files', t => {
  let checked = 0;
  for (const chapter of chapters) checked += assertLocalResources(chapter.body, publicDirectory);
  checked += assertLocalResources(buildBook('docs'), resolve(root, 'docs'));
  checked += assertLocalResources(buildBook('public'), publicDirectory);
  assert.ok(checked > 0);
  t.diagnostic(`Checked ${checked} local resource references including both book locations.`);
});

test('the complete book preserves chapters and all source mappings while deduplicating URLs', () => {
  const references = groupReferences(sources);
  assert.equal(new Set(references.map(reference => reference.url)).size, references.length);
  assert.deepEqual(references.flatMap(reference => reference.sources.map(source => source.id)).sort(), sources.map(source => source.id).sort());
  const book = buildBook('public');
  for (const chapter of chapters) {
    assert.ok(book.includes(`<a id="chapter-${chapter.id}"></a>`));
    assert.ok(book.includes(`### ${chapter.id} · ${chapter.title}`));
    // Check every formula and code block, so an outline-only export cannot pass.
    for (const formula of formulasIn(chapter.body)) assert.ok(book.includes(formula.expression), `book lost chapter ${chapter.id} formula`);
    marked.walkTokens(marked.lexer(chapter.body), token => {
      if (token.type === 'code' && 'text' in token) assert.ok(book.includes(token.text), `book lost chapter ${chapter.id} code`);
    });
  }
  assert.equal((book.match(/^#### 练习与解答\s*$/gm) ?? []).length, chapters.length);
  for (const source of sources) assert.ok(book.includes(`<a id="source-${source.id}"></a>`));
  for (const destination of ['docs', 'public'] as const) {
    const saved = readFileSync(resolve(root, destination, 'rl-atlas-tutorial.md'), 'utf8');
    assert.ok(saved === buildBook(destination), `${destination} textbook is stale; run npm run export:book after editing chapters`);
  }
});
