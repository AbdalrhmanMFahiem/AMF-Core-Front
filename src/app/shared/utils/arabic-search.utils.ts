import { TranslateService } from '@ngx-translate/core';
import { NavItem } from '../services/sidebar.service';

/**
 * Normalizes Arabic text by unifying alef variants, taa marbuta, alef maqsura, and stripping diacritics.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآء]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, ''); // strip diacritics (tashkeel)
}

export function matchSearchQuery(
  route: NavItem, 
  rawQuery: string, 
  translateService: TranslateService
): boolean {
  if (!rawQuery) return false;
  
  const query = rawQuery.toLowerCase().trim();
  const normalizedQuery = normalizeArabicText(query);

  // 1. Direct name match (English)
  if (route.name && route.name.toLowerCase().includes(query)) {
    return true;
  }

  // 2. Translation key match
  if (route.translationKey) {
    const translatedName = translateService.instant(route.translationKey) || '';
    if (translatedName.toLowerCase().includes(query) || normalizeArabicText(translatedName).includes(normalizedQuery)) {
      return true;
    }
  }

  // 3. Aliases / Keywords match
  if (route.aliases && route.aliases.length > 0) {
    for (const alias of route.aliases) {
      const normAlias = normalizeArabicText(alias);
      if (alias.toLowerCase().includes(query) || normAlias.includes(normalizedQuery) || normalizedQuery.includes(normAlias)) {
        return true;
      }
    }
  }

  // 4. Path match
  if (route.path && route.path.toLowerCase().includes(query)) {
    return true;
  }

  return false;
}
