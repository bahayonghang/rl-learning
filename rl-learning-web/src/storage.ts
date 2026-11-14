export interface LearningState {
  version: 1;
  completed: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  lastChapter: string;
  theme: 'light' | 'dark';
  textSize: 'normal' | 'large';
}

export const STORAGE_KEY = 'rl-atlas-learning-v1';
const validId = (x: unknown): x is string => typeof x === 'string' && /^(0[1-9]|1[0-9]|2[0-4])$/.test(x);
const initial = (): LearningState => ({ version: 1, completed: [], bookmarks: [], notes: {}, lastChapter: '01', theme: 'light', textSize: 'normal' });

export function parseState(raw: string | null): LearningState {
  const base = initial();
  if (!raw) return base;
  try {
    const input = JSON.parse(raw);
    if (!input || typeof input !== 'object' || input.version !== 1) return base;
    base.completed = Array.isArray(input.completed) ? [...new Set<string>(input.completed.filter(validId))] : [];
    base.bookmarks = Array.isArray(input.bookmarks) ? [...new Set<string>(input.bookmarks.filter(validId))] : [];
    if (validId(input.lastChapter)) base.lastChapter = input.lastChapter;
    if (input.theme === 'dark') base.theme = 'dark';
    if (input.textSize === 'large') base.textSize = 'large';
    if (input.notes && typeof input.notes === 'object') {
      for (const [id, value] of Object.entries(input.notes)) {
        if (validId(id) && typeof value === 'string') base.notes[id] = value.slice(0, 50000);
      }
    }
    return base;
  } catch { return base; }
}

export function loadState(): LearningState {
  try { return parseState(localStorage.getItem(STORAGE_KEY)); } catch { return initial(); }
}
export function saveState(state: LearningState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
