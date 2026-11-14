import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const escapeHtml = (value: unknown): string => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

let diagramNumber = 0;
let markdownNumber = 0;

export async function renderDiagrams(root: HTMLElement): Promise<void> {
  const codeBlocks = Array.from(root.querySelectorAll<HTMLElement>('pre code.language-mermaid'));
  if (!codeBlocks.length) return;
  const { default: mermaid } = await import('mermaid');
  const dark = document.documentElement.dataset.theme === 'dark';
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'system-ui, sans-serif', themeVariables: { primaryColor: dark ? '#254c40' : '#e7efe8', primaryTextColor: dark ? '#eef4ef' : '#24463a', primaryBorderColor: '#648c76', lineColor: '#788e85', secondaryColor: dark ? '#514432' : '#fbf0df', tertiaryColor: dark ? '#273f49' : '#eaf0f4', background: dark ? '#1d2925' : '#ffffff' }, flowchart: { htmlLabels: false, curve: 'basis', useMaxWidth: true } });
  for (const block of codeBlocks) {
    if (!block.isConnected) continue;
    const source = block.textContent || '';
    const pre = block.parentElement!;
    const figure = document.createElement('figure');
    figure.className = 'mermaid-figure';
    try {
      const { svg } = await mermaid.render(`atlas-diagram-${++diagramNumber}`, source);
      if (!pre.isConnected) continue;
      figure.innerHTML = `<div class="diagram-viewport">${svg}</div><figcaption>知识关系图 · Mermaid <button class="text-button diagram-source" type="button">查看图源</button><button class="text-button diagram-download" type="button">下载 SVG</button></figcaption><pre class="diagram-code" hidden>${escapeHtml(source)}</pre>`;
      figure.querySelector('.diagram-source')?.addEventListener('click', (e) => {
        const code = figure.querySelector<HTMLElement>('.diagram-code')!;
        code.hidden = !code.hidden;
        (e.currentTarget as HTMLElement).textContent = code.hidden ? '查看图源' : '收起图源';
      });
      figure.querySelector('.diagram-download')?.addEventListener('click', () => downloadFile('rl-atlas-diagram.svg', svg, 'image/svg+xml'));
      pre.replaceWith(figure);
    } catch (error) {
      console.error('Mermaid rendering failed', error);
      const message = document.createElement('p');
      message.className = 'render-warning';
      message.textContent = '流程图暂时无法渲染，以下保留完整图源。';
      pre.before(message);
    }
  }
}

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
    if (/^(\.\/)?code\//.test(originalHref)) {
      a.setAttribute('download', '');
      return;
    }
    if (a.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    if (a.getAttribute('href')?.startsWith('/code/')) a.href = `.${a.getAttribute('href')}`;
  });
  host.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    table.before(wrapper); wrapper.append(table);
  });
  host.querySelectorAll<HTMLElement>('pre').forEach(pre => {
    if (pre.querySelector('.language-mermaid')) return;
    const code = pre.querySelector('code');
    if (!code) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    const language = code.className.replace('language-', '') || 'code';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    toolbar.innerHTML = `<span>${escapeHtml(language)}</span><button type="button">复制代码</button>`;
    toolbar.querySelector('button')!.addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      try { await navigator.clipboard.writeText(code.textContent ?? ''); button.textContent = '已复制'; }
      catch { button.textContent = '请选择代码复制'; }
    });
    pre.before(wrapper); wrapper.append(toolbar, pre);
  });
  await renderDiagrams(host);
}

export function downloadFile(filename: string, content: string, type = 'text/plain;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
