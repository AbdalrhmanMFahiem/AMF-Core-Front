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

export interface SearchResult extends NavItem {
  breadcrumb?: string;
  matchScore?: number;
}

export function matchSearchQuery(
  route: NavItem, 
  rawQuery: string, 
  translateService: TranslateService
): boolean {
  return getSearchScore(route, rawQuery, translateService) > 0;
}

/**
 * Returns a match score (higher = better match):
 * - 100: Direct English name match
 * - 90: Translated name match
 * - 80: Alias exact match (alias included in query or query included in alias)
 * - 70: Path match
 * - 0: No match
 */
export function getSearchScore(
  route: NavItem,
  rawQuery: string,
  translateService: TranslateService
): number {
  if (!rawQuery) return 0;

  const query = rawQuery.toLowerCase().trim();
  const normalizedQuery = normalizeArabicText(query);

  // 1. Direct name match (English) - highest priority
  if (route.name && route.name.toLowerCase().includes(query)) {
    return 100;
  }

  // 2. Translation key match
  if (route.translationKey) {
    const translatedName = translateService.instant(route.translationKey) || '';
    if (translatedName.toLowerCase().includes(query) || normalizeArabicText(translatedName).includes(normalizedQuery)) {
      return 90;
    }
  }

  // 3. Aliases / Keywords match
  if (route.aliases && route.aliases.length > 0) {
    for (const alias of route.aliases) {
      const normAlias = normalizeArabicText(alias);
      if (alias.toLowerCase().includes(query) || normAlias.includes(normalizedQuery) || normalizedQuery.includes(normAlias)) {
        return 80;
      }
    }
  }

  // 4. Path match
  if (route.path && route.path.toLowerCase().includes(query)) {
    return 70;
  }

  return 0;
}

/**
 * Flattens nav items into a flat list with breadcrumb paths and inherited icons.
 */
export function getFlatRoutesWithBreadcrumb(
  items: NavItem[],
  translateService: TranslateService,
  parentBreadcrumb: string = '',
  parentIcon?: string,
  parentAliases: string[] = []
): SearchResult[] {
  let result: SearchResult[] = [];

  for (const item of items) {
    const currentIcon = item.icon || parentIcon;
    const combinedAliases = [...(item.aliases || []), ...parentAliases];
    
    // Build breadcrumb segment
    const itemName = item.translationKey 
      ? (translateService.instant(item.translationKey) || item.name) 
      : item.name;
    const currentBreadcrumb = parentBreadcrumb 
      ? `${parentBreadcrumb} › ${itemName}` 
      : itemName;

    if (item.path) {
      result.push({
        ...item,
        icon: currentIcon,
        aliases: combinedAliases,
        breadcrumb: parentBreadcrumb || undefined  // Only show parent path, not the item itself
      });
    }

    if (item.subItems) {
      result = [
        ...result,
        ...getFlatRoutesWithBreadcrumb(item.subItems, translateService, currentBreadcrumb, currentIcon, combinedAliases)
      ];
    }
  }

  return result;
}
