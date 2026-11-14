/** Registered, complete content editions. Add a bundle before exposing a locale. */
export const localeRegistry = {
  'zh-CN': { name: '简体中文', short: '中文', lang: 'zh-CN', direction: 'ltr' },
  en: { name: 'English', short: 'EN', lang: 'en', direction: 'ltr' },
} as const;
export type Locale = keyof typeof localeRegistry;
export type Localized<T> = Record<Locale, T>;
let activeLocale: Locale = 'zh-CN';
export const getLocale = (): Locale => activeLocale;
export const isLocale = (value: unknown): value is Locale => typeof value === 'string' && Object.hasOwn(localeRegistry, value);
export function setLocale(locale: Locale): void { activeLocale = locale; }
export const localize = <T>(value: Localized<T>): T => value[activeLocale];
/** Small interface messages; long-form content belongs in locale content bundles. */
export const text = (zh: string, en: string): string => localize({ 'zh-CN': zh, en });
export const number = (value: number, options?: Intl.NumberFormatOptions): string => new Intl.NumberFormat(activeLocale, options).format(value);
export const levelLabel = (level: string): string => ({ '入门': text('入门','Foundation'), '进阶': text('进阶','Advanced'), '实践': text('实践','Applied') }[level] ?? level);
export const editionFilename = (base: string): string => `${base}${activeLocale === 'en' ? '.en' : ''}.md`;
