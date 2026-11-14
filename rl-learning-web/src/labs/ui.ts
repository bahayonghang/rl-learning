import { clamp } from './math';
export const COLORS = { green: '#245b4b', orange: '#c47752', blue: '#527b98', purple: '#827094', muted: '#b7c0b6' };
export const fmt = (n: number, digits = 2): string => Number.isFinite(n) ? n.toFixed(digits) : '—';
export const percent = (n: number): string => `${fmt(n * 100, 1)}%`;
export interface Series { name: string; values: number[]; color: string; dashed?: boolean; }
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function chart(series: Series[], label: string, options: { xLabel?: string; yLabel?: string; min?: number; max?: number; xMin?: number; xMax?: number } = {}): string {
  const width = 720, height = 280, left = 60, right = 20, top = 22, bottom = 47;
  const all = series.flatMap(s => s.values).filter(Number.isFinite);
  let low = options.min ?? Math.min(0, ...all);
  let high = options.max ?? Math.max(1, ...all);
  if (high - low < 1e-8) { low -= 1; high += 1; }
  const padding = (high - low) * 0.05;
  if (options.min === undefined) low -= padding;
  if (options.max === undefined) high += padding;
  const x = (i: number, count: number) => left + i / Math.max(1, count - 1) * (width - left - right);
  const y = (v: number) => top + (high - v) / (high - low) * (height - top - bottom);
  const lines = series.map(s => {
    const points = s.values.map((v, i) => `${fmt(x(i, s.values.length), 2)},${fmt(y(v), 2)}`).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.3" ${s.dashed ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`;
  }).join('');
  const grid = Array.from({ length: 5 }, (_, i) => {
    const value = low + (high - low) * i / 4;
    return `<line x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}" stroke="currentColor" opacity=".12"/><text x="${left - 9}" y="${y(value) + 4}" text-anchor="end">${fmt(value, Math.abs(high) > 100 ? 0 : 1)}</text>`;
  }).join('');
  const count = Math.max(2, ...series.map(s => s.values.length));
  const x0 = options.xMin ?? 1, x1 = options.xMax ?? count;
  const xTicks = [0, 0.5, 1].map(f => `<text x="${left + f * (width - left - right)}" y="${height - 25}" text-anchor="middle">${fmt(x0 + f * (x1 - x0), x1 < 5 ? 1 : 0)}</text>`).join('');
  const legend = `<div class="lab-legend">${series.map(s => `<span><i style="background:${s.color}"></i>${escape(s.name)}</span>`).join('')}</div>`;
  return `<figure class="lab-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(label)}"><title>${escape(label)}</title>${grid}${lines}${xTicks}<text x="${left}" y="13" class="lab-axis-name">${escape(options.yLabel ?? '')}</text><text x="${width - right}" y="${height - 4}" text-anchor="end" class="lab-axis-name">${escape(options.xLabel ?? '步数')}</text></svg>${legend}<figcaption>${escape(label)}</figcaption></figure>`;
}

export function bars(items: { label: string; value: number; color?: string }[], label: string, unit = ''): string {
  const low = Math.min(0, ...items.map(i => i.value)), high = Math.max(1e-3, ...items.map(i => i.value));
  const height = 230, top = 25, bottom = 44, left = 28, width = 650;
  const y = (v: number) => top + (high - v) / Math.max(.001, high - low) * (height - top - bottom);
  const slot = (width - left * 2) / items.length;
  return `<figure class="lab-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(label)}"><title>${escape(label)}</title><line x1="${left}" x2="${width - left}" y1="${y(0)}" y2="${y(0)}" stroke="currentColor" opacity=".3"/>${items.map((item, i) => `<rect x="${left + i * slot + slot * .22}" y="${Math.min(y(0), y(item.value))}" width="${slot * .56}" height="${Math.max(1, Math.abs(y(item.value) - y(0)))}" rx="5" fill="${item.color ?? COLORS.green}"/><text x="${left + (i + .5) * slot}" y="${item.value >= 0 ? y(item.value) - 9 : y(item.value) + 16}" text-anchor="middle">${fmt(item.value, 2)}${escape(unit)}</text><text x="${left + (i + .5) * slot}" y="${height - 12}" text-anchor="middle">${escape(item.label)}</text>`).join('')}</svg><figcaption>${escape(label)}</figcaption></figure>`;
}

export function slider(id: string, label: string, value: number, min: number, max: number, step = .01): string {
  return `<label class="lab-control" for="lab-${id}"><span>${label}<output data-output="${id}">${value}</output></span><input id="lab-${id}" data-control="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"/></label>`;
}
export function numberInput(id: string, label: string, value: number, min: number, max: number): string {
  return `<label class="lab-control" for="lab-${id}"><span>${label}</span><input id="lab-${id}" data-control="${id}" type="number" min="${min}" max="${max}" value="${value}"/></label>`;
}
export function select(id: string, label: string, options: [string, string][]): string {
  return `<label class="lab-control" for="lab-${id}"><span>${label}</span><select id="lab-${id}" data-control="${id}">${options.map(([value, name]) => `<option value="${value}">${name}</option>`).join('')}</select></label>`;
}
export function checkbox(id: string, label: string, checked = true): string {
  return `<label class="lab-check" for="lab-${id}"><input id="lab-${id}" data-control="${id}" type="checkbox" ${checked ? 'checked' : ''}/><span>${label}</span></label>`;
}
export function button(action: string, text: string, secondary = false): string {
  return `<button class="lab-button ${secondary ? 'lab-button-secondary' : ''}" type="button" data-action="${action}">${text}</button>`;
}
export const stat = (label: string, value: string, note = ''): string => `<div class="lab-stat"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ''}</div>`;
export const table = (heads: string[], rows: string[][]): string => `<div class="lab-table-wrap"><table class="lab-table"><thead><tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export const note = (title: string, text: string): string => `<aside class="lab-explanation"><strong>${title}</strong><p>${text}</p></aside>`;

export function setup(host: HTMLElement, question: string, intro: string, controls: string, actions = '') {
  host.innerHTML = `<section class="lab-panel"><div class="lab-intro"><span class="lab-eyebrow">浏览器教学模拟 · 可重复计算</span><h2>${question}</h2><p>${intro}</p></div><div class="lab-controls">${controls}</div>${actions ? `<div class="lab-actions">${actions}</div>` : ''}<div class="lab-result" data-result aria-live="polite" aria-atomic="false"></div></section>`;
  const target = host.querySelector<HTMLElement>('[data-result]')!;
  const number = (id: string): number => {
    const el = host.querySelector<HTMLInputElement>(`[data-control="${id}"]`)!;
    const value = Number(el.value);
    return clamp(Number.isFinite(value) ? value : Number(el.min || 0), Number(el.min || -Infinity), Number(el.max || Infinity));
  };
  const value = (id: string): string => host.querySelector<HTMLInputElement>(`[data-control="${id}"]`)!.value;
  const checked = (id: string): boolean => host.querySelector<HTMLInputElement>(`[data-control="${id}"]`)!.checked;
  const bind = (onChange: (id: string) => void, onAction: (action: string) => void = () => {}) => {
    const input = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const id = el.dataset.control;
      if (!id) return;
      const output = host.querySelector<HTMLOutputElement>(`[data-output="${id}"]`);
      if (output) output.value = el.value;
      onChange(id);
    };
    const click = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
      if (el?.dataset.action) onAction(el.dataset.action);
    };
    host.addEventListener('input', input);
    host.addEventListener('click', click);
    return () => { host.removeEventListener('input', input); host.removeEventListener('click', click); };
  };
  return { target, number, value, checked, bind };
}
