import katex from 'katex';
import { escapeHtml as esc } from './html';
import { getLocale, type Locale } from './i18n';
import { defaultFormulaValues, evaluateFormulaCase, formatFormulaNumber, formulaCaseMarkdown, getFormulaCase, getFormulaCaseDefinition, getFormulaCases, type FormulaField, type FormulaPresentation, type FormulaValues } from './formula-cases';

let mountSequence = 0;
const translate = (locale: Locale) => (zh: string, en: string) => locale === 'zh-CN' ? zh : en;
const math = (expression: string, display = true): string => katex.renderToString(expression, { displayMode: display, throwOnError: true, trust: false, strict: 'error', output: 'htmlAndMathml' });
const cell = (value: string | number): string => esc(typeof value === 'number' ? formatFormulaNumber(value) : value);

function fieldHtml(field: FormulaField, prefix: string, locale: Locale): string {
  const id = `${prefix}-${field.key}`, unit = field.unit[locale];
  const control = field.options
    ? `<select id="${id}" data-case-field="${field.key}" aria-describedby="${id}-help ${id}-error">${field.options.map(option => `<option value="${option.value}" ${option.value === field.value ? 'selected' : ''}>${esc(option.label[locale])}</option>`).join('')}</select>`
    : `<div class="formula-input-wrap"><input id="${id}" data-case-field="${field.key}" type="number" inputmode="decimal" step="any" min="${field.min}" max="${field.max}" value="${field.value}" aria-describedby="${id}-help ${id}-error"/>${unit ? `<span aria-hidden="true">${esc(unit)}</span>` : ''}</div>`;
  return `<div class="formula-field"><label for="${id}"><span>${esc(field.label[locale])}${unit ? `<span class="sr-only"> (${esc(unit)})</span>` : ''}</span>${field.symbol ? `<span class="formula-field-symbol" aria-hidden="true">${math(field.symbol, false)}</span>` : ''}</label>${control}<small id="${id}-help" class="formula-field-help">${esc(field.help[locale])}</small><span class="formula-field-error" id="${id}-error" data-error-for="${field.key}"></span></div>`;
}

function resultHtml(p: FormulaPresentation, locale: Locale): string {
  const t = translate(locale);
  const table = p.table ? `<div class="formula-table-scroll" tabindex="0" role="region" aria-label="${esc(p.table.caption)}"><table><caption>${esc(p.table.caption)}</caption><thead><tr>${p.table.headers.map(value => `<th scope="col">${esc(value)}</th>`).join('')}</tr></thead><tbody>${p.table.rows.map(row => `<tr>${row.map(value => `<td>${cell(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  return `<div class="formula-metrics">${p.metrics.map((metric, index) => `<div class="formula-result-metric${metric.warning ? ' has-warning' : ''}" data-metric-index="${index}"><span>${esc(metric.label)}</span><strong>${cell(metric.value)}</strong>${metric.unit ? `<small>${esc(metric.unit)}</small>` : ''}</div>`).join('')}</div><p class="formula-rounding">${t('数值以完整精度计算，显示最多六位小数；“≈”表示显示近似。', 'Calculations use full precision. Displayed values have up to six decimals; “≈” marks a displayed approximation.')}</p><ol class="formula-steps">${p.steps.map((step, index) => `<li><div class="formula-step-title"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h4>${esc(step.title)}</h4></div><div class="formula-equation" tabindex="0" role="region" aria-label="${esc(step.title)}">${math(step.equation)}</div><p>${esc(step.explanation)}</p></li>`).join('')}</ol>${table}<section class="formula-interpretation"><h4>${t('结果怎样理解？', 'How should you read the result?')}</h4><ul>${p.interpretation.map(line => `<li>${esc(line)}</li>`).join('')}</ul></section>`;
}

/** Mount one editable case; modifying results never replaces the focused input. */
export function mountFormulaCase(host: HTMLElement, id: string): () => void {
  const definition = getFormulaCaseDefinition(id), locale = getLocale(), t = translate(locale);
  if (!definition) { host.innerHTML = `<p class="formula-empty">${t('未找到这个公式案例。', 'This formula case was not found.')}</p>`; return () => {}; }
  const prefix = `formula-${id}-${++mountSequence}`;
  host.innerHTML = `<section class="formula-case" data-formula-case="${id}" aria-labelledby="${prefix}-title"><header class="formula-case-heading"><div><span class="eyebrow">${t('改变参数 · 展开计算 · 解释结果', 'CHANGE INPUTS · FOLLOW THE CALCULATION · EXPLAIN')}</span><h3 id="${prefix}-title">${esc(definition.title[locale])}</h3><p>${esc(definition.description[locale])}</p></div><a class="text-link" href="#/cases/${id}">${t('独立打开', 'Open case')} →</a></header><div class="formula-scenario"><span>${t('起始案例背景', 'Starting scenario')}</span><p>${esc(definition.scenario[locale])}</p></div><div class="formula-preset-row" role="group" aria-label="${t('选择案例情景', 'Choose a scenario')}">${definition.presets.map((preset, index) => `<button type="button" data-case-preset="${esc(preset.id)}" class="${index === 0 ? 'selected' : ''}" aria-pressed="${index === 0}">${esc(preset.title[locale])}</button>`).join('')}</div><p class="formula-preset-description" data-preset-description>${esc(definition.presets[0]?.description[locale] ?? '')}</p><div class="formula-case-layout"><div class="formula-input-panel"><div class="formula-input-title"><h4>${t('1. 输入参数', '1. Enter inputs')}</h4><button class="text-button" type="button" data-case-reset>${t('重置案例', 'Reset case')}</button></div><div class="formula-field-grid">${definition.fields.map(field => fieldHtml(field, prefix, locale)).join('')}</div><p class="formula-input-footnote">${t('输入后即时重算。超出教学范围或清空输入时，会隐藏旧结果并说明原因。', 'Results update as you type. Empty or out-of-range inputs hide old results and show the reason.')}</p></div><div class="formula-output-panel"><div class="formula-input-title"><h4>${t('2. 看公式与代入', '2. Follow equations and substitution')}</h4><button type="button" class="text-button" data-case-download>${t('导出当前算例', 'Export this calculation')} ↓</button></div><div class="formula-originals">${definition.formulas.map(formula => `<div class="formula-equation" tabindex="0" role="region" aria-label="${t('原始公式', 'Original equation')}">${math(formula)}</div>`).join('')}</div><p class="formula-calculation-status sr-only" data-case-status aria-live="polite" aria-atomic="true"></p><div data-case-result></div></div></div><footer class="formula-case-footer"><span>${t('核对来源与假设', 'Check sources and assumptions')}</span>${definition.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join('')}</footer></section>`;
  const root = host.querySelector<HTMLElement>('[data-formula-case]')!;
  const inputs = [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-case-field]')];
  const result = root.querySelector<HTMLElement>('[data-case-result]')!;
  const status = root.querySelector<HTMLElement>('[data-case-status]')!;
  const download = root.querySelector<HTMLButtonElement>('[data-case-download]')!;
  let validValues: FormulaValues | undefined;
  const read = () => Object.fromEntries(inputs.map(input => [input.dataset.caseField!, input.value]));
  const draw = () => {
    // A new calculation is not exportable until every part of its view renders.
    validValues = undefined;
    download.disabled = true;
    const evaluation = evaluateFormulaCase(id, read(), locale);
    inputs.forEach(input => {
      const error = !evaluation.ok ? evaluation.errors[input.dataset.caseField!] : undefined;
      input.setAttribute('aria-invalid', String(Boolean(error)));
      root.querySelector<HTMLElement>(`[data-error-for="${input.dataset.caseField}"]`)!.textContent = error ?? '';
    });
    if (!evaluation.ok) {
      result.innerHTML = `<div class="formula-invalid" role="alert"><strong>${t('先检查输入，再继续计算', 'Check the inputs before calculating')}</strong><p>${esc(evaluation.errors.calculation ?? t('旧结果已隐藏，请修正标出的参数。', 'Old results are hidden. Correct the marked inputs.'))}</p></div>`;
      status.textContent = t('输入有误，暂不显示计算结果。', 'An input is invalid. Calculation results are hidden.');
      return;
    }
    try {
      const rendered = resultHtml(evaluation.presentation, locale);
      const announcement = t('已按当前参数重新计算。', 'Recalculated using the current inputs.') + ' ' + evaluation.presentation.metrics.map(metric => `${metric.label}: ${typeof metric.value === 'number' ? formatFormulaNumber(metric.value) : metric.value}${metric.unit ?? ''}`).join('; ');
      result.innerHTML = rendered;
      status.textContent = announcement;
      validValues = evaluation.values;
      download.disabled = false;
    } catch {
      validValues = undefined;
      download.disabled = true;
      result.innerHTML = `<div class="formula-invalid" role="alert"><strong>${t('本次结果未能显示', 'This result could not be displayed')}</strong><p>${t('旧结果已隐藏，导出已停用。请重置案例或调整输入后重试。', 'Old results are hidden and export is disabled. Reset the case or adjust an input to try again.')}</p></div>`;
      status.textContent = t('结果显示失败，旧结果已隐藏且导出已停用。', 'Result display failed. Old results are hidden and export is disabled.');
    }
  };
  const selectPreset = (presetId: string) => {
    const selected = definition.presets.find(preset => preset.id === presetId) ?? definition.presets[0]!;
    const values = { ...defaultFormulaValues(id), ...selected.values };
    inputs.forEach(input => { input.value = String(values[input.dataset.caseField!]); });
    root.querySelectorAll<HTMLButtonElement>('[data-case-preset]').forEach(button => { const active = button.dataset.casePreset === selected.id; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); });
    root.querySelector<HTMLElement>('[data-preset-description]')!.textContent = selected.description[locale];
    draw();
  };
  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    if (!input.dataset.caseField) return;
    root.querySelectorAll<HTMLButtonElement>('[data-case-preset]').forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
    root.querySelector<HTMLElement>('[data-preset-description]')!.textContent = t('自定义输入：改一个参数，观察它影响了哪一步。', 'Custom inputs: change one parameter and inspect which step changes.');
    draw();
  };
  const urls = new Set<string>();
  const onClick = (event: Event) => {
    const target = event.target as Element;
    const preset = target.closest<HTMLButtonElement>('[data-case-preset]');
    if (preset) { selectPreset(preset.dataset.casePreset!); return; }
    if (target.closest('[data-case-reset]')) { selectPreset(definition.presets[0]!.id); return; }
    if (target.closest('[data-case-download]') && validValues) {
      const markdown = formulaCaseMarkdown(id, locale, validValues);
      const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
      urls.add(url);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `rl-formula-${id}${locale === 'en' ? '.en' : ''}.md`; document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => { if (urls.delete(url)) URL.revokeObjectURL(url); }, 1000);
    }
  };
  root.addEventListener('input', onInput); root.addEventListener('change', onInput); root.addEventListener('click', onClick);
  draw();
  return () => { root.removeEventListener('input', onInput); root.removeEventListener('change', onInput); root.removeEventListener('click', onClick); urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
}

function mountContextCases(host: HTMLElement, ids: string[]): () => void {
  const locale = getLocale(), t = translate(locale);
  if (!ids.length) { host.replaceChildren(); return () => {}; }
  const selectorId = `formula-context-${++mountSequence}`;
  host.innerHTML = `<section class="formula-context" aria-labelledby="${selectorId}-heading"><header class="formula-context-heading"><div><span class="eyebrow">${t('在当前问题里算一遍', 'CALCULATE IT IN CONTEXT')}</span><h2 id="${selectorId}-heading">${t('把公式变成可计算的案例', 'Turn the equation into a worked case')}</h2><p>${t('先预想变化方向，再调整参数，最后对照每一步的数值解释。', 'Predict the direction, change an input, then explain each numerical step.')}</p></div><a class="text-link" href="#/cases">${t('全部 10 个公式案例', 'All 10 formula cases')} →</a></header>${ids.length > 1 ? `<label class="formula-context-select" for="${selectorId}">${t('本节相关案例', 'Cases for this section')}<select id="${selectorId}" data-context-case>${ids.map(id => `<option value="${id}">${esc(getFormulaCase(id, locale)!.title)}</option>`).join('')}</select></label>` : ''}<div data-context-case-host></div></section>`;
  const target = host.querySelector<HTMLElement>('[data-context-case-host]')!;
  let dispose = mountFormulaCase(target, ids[0]!);
  const selector = host.querySelector<HTMLSelectElement>('[data-context-case]');
  const change = () => { dispose(); dispose = mountFormulaCase(target, selector!.value); };
  selector?.addEventListener('change', change);
  return () => { selector?.removeEventListener('change', change); dispose(); };
}
export function mountFormulaCasesForChapter(host: HTMLElement, chapterId: string): () => void {
  return mountContextCases(host, getFormulaCases().filter(item => item.chapterIds.includes(chapterId)).map(item => item.id));
}
export function mountFormulaCasesForResearch(host: HTMLElement, researchId: string): () => void {
  return mountContextCases(host, getFormulaCases().filter(item => item.researchIds.includes(researchId)).map(item => item.id));
}

export function renderFormulaCasesPage(host: HTMLElement, id = ''): () => void {
  const locale = getLocale(), t = translate(locale), cases = getFormulaCases(locale);
  if (id) {
    const item = getFormulaCase(id, locale);
    if (!item) { host.innerHTML = `<section class="formula-empty"><h1>${t('未找到该案例', 'Case not found')}</h1><a class="text-link" href="#/cases">${t('返回公式案例', 'Return to formula cases')} →</a></section>`; return () => {}; }
    host.innerHTML = `<nav class="formula-page-links" aria-label="${t('公式案例导航', 'Formula-case navigation')}"><a class="text-link" href="#/cases">← ${t('全部公式案例', 'All formula cases')}</a><div>${item.chapterIds.map(chapter => `<a class="text-link" href="#/chapter/${chapter}">${t('第', 'Chapter ')}${chapter}${t('章', '')}</a>`).join('')}</div></nav><header class="formula-page-heading"><span class="eyebrow">${esc(item.topic)}</span><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p></header><div data-formula-detail></div>`;
    return mountFormulaCase(host.querySelector('[data-formula-detail]')!, id);
  }
  const searchId = `formula-search-${++mountSequence}`;
  host.innerHTML = `<header class="formula-page-heading"><span class="eyebrow">${t('边读边算', 'WORKED FORMULA CASES')}</span><h1>${t('改一个数字，看懂一条公式。', 'Change one number. Understand the equation.')}</h1><p>${t('10 个案例连接抽象符号与具体决策。输入可编辑，计算可展开，结果有解释，也能导出当前算例。', 'Ten cases connect abstract symbols with concrete decisions. Edit inputs, follow the calculation, read the interpretation and export your current example.')}</p></header><div class="formula-catalogue-toolbar"><label for="${searchId}">${t('查找公式或案例', 'Find an equation or case')}</label><input type="search" id="${searchId}" placeholder="${t('例如：PPO、回报、能耗、约束', 'For example: PPO, return, energy, constraints')}"/></div><p class="formula-catalogue-count" aria-live="polite" data-formula-count></p><div class="formula-catalogue" data-formula-cards></div><p class="formula-catalogue-footnote">${t('这些是确定性的教学计算。数学准备里的 8 个计算器和交互实验室里的 14 个实验仍可分别使用；完整过程响应见水泥决策工作台。', 'These are deterministic teaching calculations. The eight math-primer calculators and fourteen laboratory experiments remain available; explore fuller process dynamics in the cement decision workbench.')}</p>`;
  const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
  const draw = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const matches = cases.filter(item => !query || `${item.title} ${item.description} ${item.tags.join(' ')}`.toLocaleLowerCase().includes(query));
    host.querySelector<HTMLElement>('[data-formula-count]')!.textContent = t(`显示 ${matches.length} / ${cases.length} 个案例`, `Showing ${matches.length} of ${cases.length} cases`);
    host.querySelector<HTMLElement>('[data-formula-cards]')!.innerHTML = matches.length ? matches.map(item => `<a class="formula-case-card" href="#/cases/${item.id}"><span class="eyebrow">${esc(item.topic)}</span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><div><span>${t('可改参数 · 分步计算', 'Editable inputs · worked steps')}</span><span aria-hidden="true">→</span></div></a>`).join('') : `<p class="formula-empty">${t('没有匹配的案例，请尝试更短的关键词。', 'No matching cases. Try a shorter search.')}</p>`;
  };
  input.addEventListener('input', draw); draw();
  return () => input.removeEventListener('input', draw);
}
