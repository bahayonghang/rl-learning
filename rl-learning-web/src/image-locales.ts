import { getLocale } from './i18n';

export type ImageLanguage = 'zh-CN' | 'en';

/** Image editions are independent of future UI locales: Chinese or English. */
export function imageLanguage(locale: string = getLocale()): ImageLanguage {
  return /^zh(?:-|$)/i.test(locale) ? 'zh-CN' : 'en';
}

export const imageLocaleDirectory = (locale: string = getLocale()): string => imageLanguage(locale) === 'zh-CN' ? 'zh-CN/' : '';

/** The other six scene illustrations contain only pictures and numbered regions. */
export const translatedIllustrationIds = ['journey'] as const;

export function illustrationImage(id: string, locale: string = getLocale()): string {
  const translated = (translatedIllustrationIds as readonly string[]).includes(id);
  return `./images/${translated ? imageLocaleDirectory(locale) : ''}${id}.webp`;
}

export function imageDownloadName(id: string, image: string): string {
  return `${id}${image.includes('/zh-CN/') ? '.zh-CN' : '.en'}.webp`;
}
