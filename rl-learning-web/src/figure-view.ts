import { escapeHtml as esc } from './html';
import { getLocale, text as t } from './i18n';
import { conceptPlateFromImage, conceptPlateNotice, localizedConceptPlate } from './concept-plates';
import { imageDownloadName } from './image-locales';

export interface ImageFigure {
  id: string;
  title: string;
  alt: string;
  image: string;
  width: number;
  height: number;
}

/** The image remains a normal local asset; zoom is an additional keyboard-accessible view. */
export function figureImage(figure: ImageFigure, lazy = true): string {
  return `<button class="figure-image-button" type="button" data-zoom-figure="${esc(figure.id)}" aria-label="${esc(t(`放大查看：${figure.title}`, `Enlarge: ${figure.title}`))}"><img src="${esc(figure.image)}" alt="${esc(figure.alt)}" width="${figure.width}" height="${figure.height}" ${lazy ? 'loading="lazy"' : ''} decoding="async"/><span class="figure-image-hint" aria-hidden="true">${t('放大查看', 'Enlarge figure')} ↗</span></button>`;
}

export function figureActions(figure: ImageFigure): string {
  return `<div class="figure-actions"><button class="text-button" type="button" data-zoom-figure="${esc(figure.id)}">${t('放大查看', 'Enlarge')}</button><a href="${esc(figure.image)}" target="_blank" rel="noopener noreferrer">${t('打开原图', 'Open full-size image')} ↗</a><a href="${esc(figure.image)}" download="${esc(imageDownloadName(figure.id, figure.image))}">${t('下载 WebP', 'Download WebP')} ↓</a></div>`;
}

export function closeFigureViewers(): void {
  document.querySelectorAll<HTMLDialogElement>('.figure-viewer').forEach(dialog => {
    if (dialog.open) dialog.close();
    else dialog.remove();
  });
}

let dialogSequence = 0;
/** One ephemeral native dialog, removed on close or route change, with focus restored. */
export function openFigureViewer(figure: ImageFigure, trigger: HTMLElement): void {
  const existing = document.querySelector<HTMLDialogElement>('.figure-viewer');
  if (existing?.open) existing.close();
  const dialog = document.createElement('dialog');
  const titleId = `figure-viewer-title-${++dialogSequence}`;
  const helpId = `figure-viewer-help-${dialogSequence}`;
  dialog.className = 'figure-viewer';
  dialog.setAttribute('aria-labelledby', titleId);
  dialog.setAttribute('aria-describedby', helpId);
  dialog.innerHTML = `<div class="figure-viewer-header"><h2 id="${titleId}">${esc(figure.title)}</h2><button class="button outline" type="button" data-close autofocus>${t('关闭', 'Close')} <span aria-hidden="true">×</span></button></div><div class="figure-viewer-tools"><button type="button" class="button outline" data-native-size aria-pressed="false">${t('原始尺寸', 'Actual size')}</button><a href="${esc(figure.image)}" target="_blank" rel="noopener noreferrer">${t('打开原图', 'Open full-size image')} ↗</a><a href="${esc(figure.image)}" download="${esc(imageDownloadName(figure.id, figure.image))}">${t('下载 WebP', 'Download WebP')} ↓</a></div><p id="${helpId}" class="figure-viewer-help">${t('按 Esc 关闭。原始尺寸下可滚动查看；下方读图说明可帮助理解图中概念。', 'Press Esc to close. Scroll at actual size; the accompanying reading guide explains the concepts.')}</p><div class="figure-viewer-canvas" tabindex="0" role="region" aria-label="${esc(t('可滚动的完整图片', 'Scrollable full-size image'))}"><img src="${esc(figure.image)}" alt="${esc(figure.alt)}" width="${figure.width}" height="${figure.height}"/></div>`;
  document.body.append(dialog);
  const close = () => dialog.close();
  const dispose = () => {
    window.removeEventListener('hashchange', close);
    dialog.remove();
    if (trigger.isConnected) trigger.focus({ preventScroll: true });
  };
  dialog.addEventListener('close', dispose, { once: true });
  window.addEventListener('hashchange', close, { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-close]')!.addEventListener('click', close);
  dialog.querySelector<HTMLButtonElement>('[data-native-size]')!.addEventListener('click', event => {
    const button = event.currentTarget as HTMLButtonElement;
    const actualSize = dialog.classList.toggle('is-original');
    button.setAttribute('aria-pressed', String(actualSize));
    button.textContent = actualSize ? t('适应窗口', 'Fit to window') : t('原始尺寸', 'Actual size');
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  dialog.showModal();
}

export function bindFigureViewer(host: HTMLElement, figure: ImageFigure): void {
  host.querySelectorAll<HTMLButtonElement>(`[data-zoom-figure="${figure.id}"]`).forEach(button => {
    button.addEventListener('click', () => openFigureViewer(figure, button));
  });
}

/** Upgrade only registered, standalone local images after authored Markdown is sanitized. */
export function decorateConceptPlates(host: HTMLElement): void {
  const locale = getLocale();
  host.querySelectorAll<HTMLImageElement>('img').forEach(image => {
    const record = conceptPlateFromImage(image.getAttribute('src') ?? '');
    if (!record) return;
    const plate = localizedConceptPlate(record.id, locale)!;
    // Resolve the edition even for an inline image that does not receive a card.
    image.setAttribute('src', plate.image);
    image.setAttribute('alt', plate.alt);
    const parent = image.parentElement;
    if (!parent || parent.tagName !== 'P' || parent.children.length !== 1 || parent.textContent?.trim()) return;
    const figure = document.createElement('figure');
    figure.className = 'concept-plate';
    figure.dataset.plateId = plate.id;
    figure.innerHTML = `${figureImage(plate)}<figcaption><div class="concept-plate-heading"><span class="concept-plate-label">${t('学术概念图解', 'ACADEMIC CONCEPT PLATE')}</span><a href="#/gallery/${plate.id}">${t('图解详情', 'Figure details')} ↗</a></div><strong class="concept-plate-title">${esc(plate.title)}</strong><p>${esc(plate.explanation)}</p>${figureActions(plate)}<details class="concept-plate-guide"><summary>${t('读图要点与准确关系', 'Reading guide and exact relationships')}</summary><dl>${plate.regions.map(region => `<div><dt>${esc(region.label)}</dt><dd>${esc(region.description)}</dd></div>`).join('')}</dl><p class="concept-plate-relationship"><b>${t('准确关系与边界', 'Exact relationships and boundaries')}</b>${esc(plate.relationship)}</p><p class="concept-plate-notice">${esc(conceptPlateNotice[locale])}</p></details></figcaption>`;
    parent.replaceWith(figure);
    bindFigureViewer(figure, plate);
  });
}
