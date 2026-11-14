import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';
import { conceptPlates, conceptPlateIds, conceptPlateImage, conceptPlateReference, conceptPlateFromImage, localizedConceptPlate, expandConceptPlateReferences } from '../src/concept-plates';
import { loadContentBundle, activateContent } from '../src/content/localized';
import { researchPages } from '../src/research/content';
import { researchBody } from '../src/content/research';
import { getFigures } from '../src/figures';
import { imageLanguage, imageLocaleDirectory, illustrationImage } from '../src/image-locales';
import { setLocale, type Locale } from '../src/i18n';
import { buildBook, buildResearchReview, formatBody } from '../scripts/export-book';
import { chapterDownloadMarkdown, canonicalPublicAssets } from '../src/content-download';

const inventory = JSON.parse(readFileSync('docs/diagram-assets/original-inventory.json', 'utf8')) as { id: string; href: string }[];
const baseline = JSON.parse(readFileSync('tests/fixtures/figure-migration-baseline.json', 'utf8')) as { documents: Record<string, string>; kernels: Record<string, string> };
const editions = { 'zh-CN': await loadContentBundle('zh-CN'), en: await loadContentBundle('en') };
const digest = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
const maskConcept = (body: string): string => body.replace(/!\[[^\n]*\]\(\.\/images\/diagrams\/[a-z0-9-]+\.webp\)/g, '[CONCEPT_PLATE]').replace(/\s+/g, ' ').trim();

function imageLinks(markdown: string): string[] {
  const images: string[] = [];
  marked.walkTokens(marked.lexer(markdown), token => { if (token.type === 'image' && 'href' in token) images.push(token.href); });
  return images;
}

test('the original 40 localized occurrences, legacy occurrence and two roadmap editions are covered', t => {
  assert.deepEqual(conceptPlateIds.filter(id => id !== 'roadmap-learning').slice().sort(), inventory.map(item => item.id).sort());
  let count = 0;
  for (const locale of ['zh-CN', 'en'] as const) {
    for (const item of inventory) {
      const [, type, id] = item.href.split('/');
      const body = type === 'chapter' ? editions[locale].chapters.find(chapter => chapter.id === id)!.body : researchPages.find(page => page.id === id)!.body[locale];
      assert.equal(imageLinks(body).filter(path => path === `./images/diagrams/${item.id}.webp`).length, 1, `${item.id}/${locale}`);
      assert.doesNotMatch(body, /(?:```|~~~)mermaid/i);
      count++;
    }
    assert.equal(imageLinks(conceptPlateReference('roadmap-learning', locale))[0], `./images/diagrams/${imageLocaleDirectory(locale)}roadmap-learning.webp`);
    count++;
  }
  assert.deepEqual(imageLinks(researchBody), ['./images/diagrams/research-agenda-diagram-1.webp']);
  assert.doesNotMatch(researchBody, /mermaid/i);
  assert.match(readFileSync('src/main.ts', 'utf8'), /conceptPlateReference\('roadmap-learning'\)/);
  t.diagnostic(`Covered ${count} active locale occurrences plus the retired research occurrence with ${conceptPlates.length} stable assets.`);
});

test('the migration preserves every non-figure body and all numerical kernels exactly', t => {
  const bodies: Record<string, string> = {};
  for (const locale of ['zh-CN', 'en'] as const) {
    for (const chapter of editions[locale].chapters) bodies[`chapter/${chapter.id}/${locale}`] = chapter.body;
    for (const page of researchPages) bodies[`research/${page.id}/${locale}`] = page.body[locale];
  }
  bodies['retired-research/zh-CN'] = researchBody;
  assert.deepEqual(Object.keys(bodies).sort(), Object.keys(baseline.documents).sort());
  for (const [id, body] of Object.entries(bodies)) assert.equal(digest(maskConcept(body)), baseline.documents[id], `non-figure text changed: ${id}`);
  for (const [file, expected] of Object.entries(baseline.kernels)) assert.equal(digest(readFileSync(file)), expected, `numerical kernel changed: ${file}`);
  t.diagnostic(`Preserved ${Object.keys(bodies).length} body fingerprints and ${Object.keys(baseline.kernels).length} numerical kernels.`);
});

test('every plate has complete bilingual semantic alternatives and a fixed compact image identity', () => {
  assert.equal(conceptPlates.length, 21);
  assert.equal(new Set(conceptPlates.map(plate => plate.id)).size, 21);
  for (const plate of conceptPlates) {
    assert.equal(conceptPlateFromImage(`./images/diagrams/${plate.id}.webp`), plate);
    assert.equal(conceptPlateFromImage(`./images/diagrams/zh-CN/${plate.id}.webp`), plate);
    for (const locale of ['zh-CN', 'en'] as const) {
      const local = localizedConceptPlate(plate.id, locale)!;
      assert.ok(local.title.length > 6 && local.alt.length > 30 && local.explanation.length > 25, `${plate.id}/${locale}`);
      assert.ok(local.regions.length >= 3);
      assert.ok(local.relationship.length > (locale === 'en' ? 100 : 60));
      assert.equal(local.width / local.height, 1.5);
      assert.equal(local.image, `./images/diagrams/${imageLocaleDirectory(locale)}${plate.id}.webp`);
      for (const region of local.regions) assert.ok(region.label && region.description.length > 25);
      if (locale === 'en') assert.doesNotMatch([local.title, local.alt, local.explanation, local.relationship, ...local.regions.flatMap(region => [region.label, region.description])].join('\n'), /[\u3400-\u9fff]/u);
    }
  }
  for (const path of ['https://other.example/images/diagrams/roadmap-learning.webp', './images/diagrams/unknown.webp', './images/diagrams/zh-CN/unknown.webp', './images/diagrams/fr/roadmap-learning.webp', './images/diagrams/../roadmap-learning.webp', 'javascript:alert(1)']) assert.equal(conceptPlateFromImage(path), undefined);
  const fence = '~~~text\n' + conceptPlateReference('roadmap-learning', 'en') + '\n~~~';
  assert.equal(expandConceptPlateReferences(fence, 'en'), fence, 'an image example inside code must stay code');
});

/** Read all standard WebP dimension headers without a test-only imaging dependency. */
function webpDimensions(bytes: Buffer): { width: number; height: number } {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const kind = bytes.toString('ascii', offset, offset + 4), size = bytes.readUInt32LE(offset + 4), start = offset + 8;
    assert.ok(start + size <= bytes.length, 'truncated WebP chunk');
    if (kind === 'VP8X') return { width: 1 + bytes.readUIntLE(start + 4, 3), height: 1 + bytes.readUIntLE(start + 7, 3) };
    if (kind === 'VP8 ') return { width: bytes.readUInt16LE(start + 6) & 0x3fff, height: bytes.readUInt16LE(start + 8) & 0x3fff };
    if (kind === 'VP8L') {
      const packed = bytes.readUInt32LE(start + 1);
      return { width: 1 + (packed & 0x3fff), height: 1 + ((packed >>> 14) & 0x3fff) };
    }
    offset = start + size + (size % 2);
  }
  throw new Error('WebP dimensions were not found');
}

test('both catalogue editions resolve real images with exact dimensions and distinct translated text assets', t => {
  const paths = new Set<string>();
  try {
    for (const locale of ['zh-CN', 'en'] as const) {
      setLocale(locale); activateContent(editions[locale]);
      const figures = getFigures();
      assert.equal(figures.length, 28);
      assert.equal(figures.filter(figure => figure.kind === 'concept').length, 21);
      assert.equal(figures.filter(figure => figure.kind === 'illustration').length, 7);
      for (const figure of figures) {
        const bytes = readFileSync(resolve('public', figure.image));
        assert.ok(bytes.length > 10000, `empty or placeholder asset: ${figure.id}/${locale}`);
        const dimensions = webpDimensions(bytes);
        assert.deepEqual(dimensions, { width: figure.width, height: figure.height }, `${figure.id}/${locale}`);
        if (figure.kind === 'concept') {
          assert.equal(dimensions.width / dimensions.height, 1.5, figure.id);
          assert.equal(figure.image.includes('/zh-CN/'), locale === 'zh-CN');
          if (locale === 'zh-CN') assert.notEqual(digest(bytes), digest(readFileSync(resolve('public/images/diagrams', `${figure.id}.webp`))), 'Chinese text requires a real translated asset');
        }
        paths.add(figure.image);
      }
    }
    assert.equal(paths.size, 50, '21 plate pairs, the journey pair and six language-neutral illustrations');
    t.diagnostic('Verified all 50 distinct catalogue assets across Chinese and English editions.');
  } finally { setLocale('zh-CN'); activateContent(editions['zh-CN']); }
});

test('Chinese image language and the English fallback are explicit and do not follow ambient state', () => {
  for (const locale of ['zh', 'zh-CN', 'zh-Hans', 'zh-TW', 'ZH-cn']) assert.equal(imageLanguage(locale), 'zh-CN');
  for (const locale of ['en', 'en-US', 'ja', 'de', 'fr', 'es', '']) assert.equal(imageLanguage(locale), 'en');
  setLocale('zh-CN');
  assert.equal(conceptPlateImage('chapter-01-diagram-1', 'ja'), './images/diagrams/chapter-01-diagram-1.webp');
  assert.equal(localizedConceptPlate('chapter-01-diagram-1', 'en')!.image, './images/diagrams/chapter-01-diagram-1.webp');
  assert.equal(illustrationImage('journey', 'zh-CN'), './images/zh-CN/journey.webp');
  assert.equal(illustrationImage('journey', 'fr'), './images/journey.webp');
  for (const id of ['foundations', 'industry', 'operations-stack', 'evolution-search', 'safe-agent', 'world-model']) assert.equal(illustrationImage(id, 'zh-CN'), illustrationImage(id, 'en'));
});

test('inline and adjacent images localize without dropping images or rewriting code examples', () => {
  const first = '![First](./images/diagrams/chapter-01-diagram-1.webp)';
  const second = '![Second](./images/diagrams/zh-CN/chapter-04-diagram-1.webp)';
  const inline = `Read ${first} together with ${second}.`;
  const adjacent = `${first} ${second}`;
  const journey = '![Journey](./images/journey.webp)';
  const code = ['`' + first + '`', '``' + first + ' ` example``', '`a\n' + first + '\nb`', '~~~md\n' + first + '\n~~~', '```md\n' + second + '\n```', 'Example:\n\n    ' + first].join('\n\n');
  for (const source of [inline, adjacent]) {
    const expanded = expandConceptPlateReferences(source, 'zh-CN');
    assert.deepEqual(imageLinks(expanded), ['./images/diagrams/zh-CN/chapter-01-diagram-1.webp', './images/diagrams/zh-CN/chapter-04-diagram-1.webp']);
    assert.doesNotMatch(expanded, /<a id="figure-/, 'inline images do not receive standalone guide blocks');
    assert.deepEqual(imageLinks(formatBody(source, 'docs', 'en')), ['../public/images/diagrams/chapter-01-diagram-1.webp', '../public/images/diagrams/chapter-04-diagram-1.webp']);
  }
  assert.equal(expandConceptPlateReferences(code, 'zh-CN'), code);
  assert.equal(formatBody(code, 'docs', 'zh-CN'), code);
  assert.deepEqual(imageLinks(formatBody(journey, 'public', 'zh-CN')), ['./images/zh-CN/journey.webp']);
  const chapter = { ...editions['zh-CN'].chapters[0]!, id: '99', body: `${inline}\n\n${journey}\n\n${code}` };
  const downloaded = chapterDownloadMarkdown(chapter, undefined, 'zh-CN');
  assert.deepEqual(imageLinks(downloaded), [
    `${canonicalPublicAssets}images/diagrams/zh-CN/chapter-01-diagram-1.webp`,
    `${canonicalPublicAssets}images/diagrams/zh-CN/chapter-04-diagram-1.webp`,
    `${canonicalPublicAssets}images/zh-CN/journey.webp`,
  ]);
  assert.ok(downloaded.includes(code), 'chapter export preserves code examples verbatim');
});

test('six exports and individual chapter downloads retain full guides and destination-correct images', () => {
  for (const locale of ['zh-CN', 'en'] as const) {
    for (const destination of ['docs', 'public', 'code'] as const) {
      const body = destination === 'code' ? buildResearchReview(locale) : buildBook(destination, locale);
      const selected = conceptPlates.filter(plate => destination !== 'code' || plate.id.startsWith('research-'));
      const prefix = (destination === 'docs' ? '../public/images/diagrams/' : destination === 'code' ? '../images/diagrams/' : './images/diagrams/') + imageLocaleDirectory(locale);
      assert.equal(imageLinks(body).filter(path => path.includes('/diagrams/')).length, selected.length);
      assert.doesNotMatch(body, /mermaid/i);
      for (const plate of selected) {
        assert.ok(body.includes(`![${plate.alt[locale]}](${prefix}${plate.id}.webp)`), `${destination}/${locale}/${plate.id}`);
        assert.ok(body.includes(`<a id="figure-${plate.id}"></a>`));
        assert.ok(body.includes(plate.relationship[locale]));
        for (const region of plate.regions) assert.ok(body.includes(region.description[locale]));
      }
    }
    for (const chapter of editions[locale].chapters) {
      const download = chapterDownloadMarkdown(chapter, editions[locale].guides.find(guide => guide.chapterId === chapter.id), locale);
      for (const image of imageLinks(download)) assert.ok(image.startsWith(canonicalPublicAssets), `nonportable chapter ${chapter.id} image: ${image}`);
      marked.walkTokens(marked.lexer(download), token => {
        if (token.type === 'link' && 'href' in token) assert.doesNotMatch(token.href, /^(?:\.\/|\/)?(?:code|images)\//);
      });
      const plate = conceptPlates.find(item => item.href === `#/chapter/${chapter.id}`);
      if (plate) {
        assert.ok(download.includes(plate.relationship[locale]));
        assert.ok(imageLinks(download).includes(`${canonicalPublicAssets}images/diagrams/${imageLocaleDirectory(locale)}${plate.id}.webp`));
      }
    }
  }
});

test('the browser source no longer contains the retired renderer or diagram-source controls', () => {
  const visit = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? visit(`${directory}/${entry.name}`) : /\.(ts|css)$/.test(entry.name) ? [`${directory}/${entry.name}`] : []);
  for (const file of visit('src')) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /mermaid|diagram-source|diagram-download|diagram-code/i, file);
  }
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(manifest.dependencies.mermaid, '12.3.0', 'keep the user dependency choice; removing runtime use does not require rewriting the lockfile');
});

test('sanitized images receive accessible guides and viewer events without SVG drawing', async () => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body><main id="test-host"></main></body></html>', { url: 'https://example.test/rl-learning/#/gallery' });
  // JSDOM does not implement the native dialog API. Model its open/close event
  // contract here; actual modal focus trapping and Escape are browser QA gates.
  Object.defineProperties(dom.window.HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute('open', ''); } },
    close: { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new dom.window.Event('close')); } },
  });
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'HTMLDialogElement', 'location', 'history']) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'window' ? dom.window : (dom.window as unknown as Record<string, unknown>)[key] });
  }
  try {
    setLocale('en'); activateContent(editions.en);
    const { renderMarkdown } = await import('../src/render');
    const { renderGallery, filterFigures } = await import('../src/catalogue');
    const host = dom.window.document.querySelector<HTMLElement>('#test-host')!;
    await renderMarkdown(host, conceptPlateReference('chapter-21-diagram-1', 'en') + '\n\n<script>bad()</script>\n\n<img src="x" onerror="bad()">\n\n$x+1$\n\n[Next](#/chapter/02) [Code](/code/tabular_foundations.py) [Relative code](./code/advanced_math_checks.py) [Paper](https://example.org/paper)');
    const figure = host.querySelector<HTMLElement>('.concept-plate')!;
    assert.ok(figure);
    assert.equal(figure.querySelector('svg'), null);
    assert.equal(host.querySelector('script,[onerror]'), null);
    assert.ok(host.querySelector('.katex'));
    assert.equal(host.querySelector('a[href="#/chapter/02"]')!.getAttribute('target'), null, 'internal routes stay in the current tab');
    for (const path of ['tabular_foundations.py', 'advanced_math_checks.py']) {
      const link = host.querySelector(`a[href="./code/${path}"]`)!;
      assert.ok(link.hasAttribute('download'));
      assert.equal(link.getAttribute('target'), null);
    }
    assert.equal(host.querySelector('a[href="https://example.org/paper"]')!.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(figure.querySelector('img')!.getAttribute('alt'), localizedConceptPlate('chapter-21-diagram-1', 'en')!.alt);
    assert.ok(figure.querySelector('details')!.textContent?.includes('Rejection holds SP while time, dynamics and measurements advance'));
    assert.equal(figure.querySelector('a[download]')!.getAttribute('download'), 'chapter-21-diagram-1.en.webp');
    const trigger = figure.querySelector<HTMLButtonElement>('.figure-image-button')!;
    trigger.focus(); trigger.click();
    const dialog = dom.window.document.querySelector<HTMLDialogElement>('.figure-viewer')!;
    assert.ok(dialog.open);
    assert.ok(dialog.getAttribute('aria-labelledby') && dialog.getAttribute('aria-describedby'));
    dialog.querySelector<HTMLButtonElement>('[data-native-size]')!.click();
    assert.ok(dialog.classList.contains('is-original'));
    assert.equal(dialog.querySelector('[data-native-size]')!.getAttribute('aria-pressed'), 'true');
    const closed = new Promise<void>(resolve => dialog.addEventListener('close', () => resolve(), { once: true }));
    dialog.querySelector<HTMLButtonElement>('[data-close]')!.click();
    await closed;
    assert.equal(dom.window.document.querySelector('.figure-viewer'), null);
    assert.equal(dom.window.document.activeElement, trigger);
    await renderGallery(host, '');
    assert.equal(host.querySelectorAll('.figure-preview img').length, 28);
    assert.equal(host.querySelectorAll('.figure-preview svg').length, 0);
    const kind = host.querySelector<HTMLSelectElement>('#gallery-kind')!;
    assert.equal(kind.getAttribute('aria-label'), 'Type');
    assert.ok(host.querySelector('label[for="gallery-kind"]'));
    kind.value = 'concept'; kind.dispatchEvent(new dom.window.Event('change'));
    assert.equal(host.querySelectorAll('.figure-preview img').length, 21);
    assert.ok(filterFigures(getFigures(), 'bootstrap trace').some(item => item.id === 'chapter-13-diagram-1'), 'reading-guide text participates in search');
    const search = host.querySelector<HTMLInputElement>('#gallery-search')!;
    search.value = 'PPO'; search.dispatchEvent(new dom.window.Event('input'));
    assert.deepEqual(Array.from(host.querySelectorAll<HTMLAnchorElement>('.figure-card h2 a')).map(link => link.getAttribute('href')), ['#/gallery/chapter-15-diagram-1', '#/gallery/chapter-18-diagram-1', '#/gallery/roadmap-learning']);
    assert.deepEqual(filterFigures(getFigures(), 'SAC', 'all', 'concept').map(item => item.id), ['chapter-17-diagram-1', 'chapter-18-diagram-1', 'roadmap-learning']);
    const noAlgorithm = { ...getFigures()[0], title: 'Transactions', alt: 'Supported operations', explanation: 'Support for transactions', relationship: '', sourceLabel: '', keywords: [], regions: [] };
    assert.equal(filterFigures([noAlgorithm], 'PPO').length, 0);
    assert.equal(filterFigures([noAlgorithm], 'SAC').length, 0);
    setLocale('zh-CN'); activateContent(editions['zh-CN']);
    dom.window.history.replaceState(null, '', '#/gallery');
    await renderGallery(host, '');
    assert.equal(host.querySelectorAll('img[src*="/diagrams/zh-CN/"]').length, 21);
    const chineseSearch = host.querySelector<HTMLInputElement>('#gallery-search')!;
    chineseSearch.value = '门控'; chineseSearch.dispatchEvent(new dom.window.Event('input'));
    assert.ok(host.querySelector('.figure-card h2 a[href="#/gallery/chapter-21-diagram-1"]'));
    assert.ok(host.querySelector('.figure-card h2 a[href="#/gallery/chapter-15-diagram-1"]'), 'Chinese text within the relationship guide remains searchable');
    // Even an explicitly English authored reference must follow the Chinese edition.
    await renderMarkdown(host, conceptPlateReference('chapter-01-diagram-1', 'en'));
    const localized = host.querySelector<HTMLElement>('.concept-plate')!;
    assert.equal(localized.querySelector('img')!.getAttribute('src'), './images/diagrams/zh-CN/chapter-01-diagram-1.webp');
    assert.equal(localized.querySelector('a[download]')!.getAttribute('href'), './images/diagrams/zh-CN/chapter-01-diagram-1.webp');
    assert.equal(localized.querySelector('a[download]')!.getAttribute('download'), 'chapter-01-diagram-1.zh-CN.webp');
    localized.querySelector<HTMLButtonElement>('.figure-image-button')!.click();
    const zhDialog = dom.window.document.querySelector<HTMLDialogElement>('.figure-viewer')!;
    assert.equal(zhDialog.querySelector('img')!.getAttribute('src'), './images/diagrams/zh-CN/chapter-01-diagram-1.webp');
    zhDialog.close();

  } finally {
    setLocale('zh-CN'); activateContent(editions['zh-CN']);
    for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
    dom.window.close();
  }
});
