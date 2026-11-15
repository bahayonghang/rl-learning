import { isLocale, type Locale } from './i18n';
import { isThemePreference, type ThemePreference } from './theme';
export interface LearningState {
  version: 2;
  completed: string[];
  theme: ThemePreference;
  textSize: 'normal' | 'large';
  locale: Locale;
}
export const STORAGE_KEY = 'rl-atlas-preferences-v2';
const LEGACY_KEY = 'rl-atlas-learning-v1';
const validId = (value: unknown): value is string => typeof value === 'string' && /^(0[1-9]|1[0-9]|2[0-4])$/.test(value);
// New visitors follow the OS; existing explicit light/dark choices remain explicit.
const initial = (): LearningState => ({ version: 2, completed: [], theme: 'system', textSize: 'normal', locale: 'zh-CN' });
/** Preserve v1 preferences; obsolete notes/bookmarks are never read or rewritten. */
export function parseState(raw: string | null): LearningState {
  const base = initial();
  if (!raw) return base;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return base;
    const input = value as Record<string, unknown>;
    if (input.version !== 1 && input.version !== 2) return base;
    base.completed = Array.isArray(input.completed) ? [...new Set(input.completed.filter(validId))] : [];
    if (isThemePreference(input.theme)) base.theme = input.theme;
    if (input.textSize === 'large') base.textSize = 'large';
    if (isLocale(input.locale)) base.locale = input.locale;
    return base;
  } catch { return base; }
}
export function loadState(): LearningState {
  try { return parseState(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)); }
  catch { return initial(); }
}
export function saveState(state: LearningState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
