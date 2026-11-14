import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import { text as t } from './i18n';

export { escapeHtml } from './html';
import { escapeHtml } from './html';
import { decorateConceptPlates } from './figure-view';

let markdownNumber = 0;

export async function renderMarkdown(host: HTMLElement, markdown: string): Promise<void> {
  const formulas: { expression: string; display: boolean }[] = [];
  // Protect code before math so Python dollar signs and TeX backslashes are unchanged.
  const prepared = markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/g).map((part, i) => {
    if (i % 2) return part;
    return part.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, block: string | undefined, inline: string | undefined) => {
      const index = formulas.push({ expression: block ?? inline ?? '', display: block !== undefined }) - 1;
      return block !== undefined ? `\n\n<div data-formula="${index}"></div>\n\n` : `<span data-formula="${index}"></span>`;
    });
  }).join('');
  host.innerHTML = DOMPurify.sanitize(marked.parse(prepared, { async: false, gfm: true }), { ADD_ATTR: ['data-formula'] });
  host.querySelectorAll<HTMLElement>('[data-formula]').forEach(node => {
    const formula = formulas[Number(node.dataset.formula)];
    if (!formula) return;
    katex.render(formula.expression.trim(), node, { displayMode: formula.display, throwOnError: false, trust: false, strict: 'ignore', output: 'htmlAndMathml' });
  });
  const headingPrefix = host.id || `markdown-${++markdownNumber}`;
  host.querySelectorAll('h2, h3').forEach((node, index) => { node.id = `${headingPrefix}-section-${index}`; });
  host.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    const originalHref = a.getAttribute('href') ?? '';
    if (/^(?:\.\/|\/)?code\//.test(originalHref)) {
      if (originalHref.startsWith('/')) a.setAttribute('href', `.${originalHref}`);
      a.setAttribute('download', '');
      a.removeAttribute('target');
      return;
    }
    if (originalHref.startsWith('#')) { a.removeAttribute('target'); return; }
    if (/^https?:\/\//i.test(originalHref)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });
  host.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    table.before(wrapper); wrapper.append(table);
  });
  host.querySelectorAll<HTMLElement>('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    const language = code.className.replace('language-', '') || 'code';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    toolbar.innerHTML = `<span>${escapeHtml(language)}</span><button type="button">${t('复制代码','Copy code')}</button>`;
    toolbar.querySelector('button')!.addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      try { await navigator.clipboard.writeText(code.textContent ?? ''); button.textContent = t('已复制','Copied'); }
      catch { button.textContent = t('请选择代码复制','Select the code to copy'); }
    });
    pre.before(wrapper); wrapper.append(toolbar, pre);
  });
  decorateConceptPlates(host);
}

export function downloadFile(filename: string, content: string, type = 'text/plain;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
