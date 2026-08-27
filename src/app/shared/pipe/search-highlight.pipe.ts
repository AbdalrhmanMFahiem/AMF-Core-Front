import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { normalizeArabicText } from '../utils/arabic-search.utils';

@Pipe({
  name: 'searchHighlight',
  standalone: true
})
export class SearchHighlightPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, query: string): SafeHtml {
    if (!query || !text) {
      return text;
    }

    const normalizedText = normalizeArabicText(text);
    const normalizedQuery = normalizeArabicText(query);

    // Try to find the match position in the normalized text
    const matchIndex = normalizedText.indexOf(normalizedQuery);
    
    if (matchIndex === -1) {
      // Fallback: try case-insensitive match on original text
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const fallbackIndex = lowerText.indexOf(lowerQuery);
      
      if (fallbackIndex === -1) {
        return text;
      }
      
      const before = text.substring(0, fallbackIndex);
      const match = text.substring(fallbackIndex, fallbackIndex + query.length);
      const after = text.substring(fallbackIndex + query.length);
      
      return this.sanitizer.bypassSecurityTrustHtml(
        `${this.escapeHtml(before)}<mark class="bg-brand-100 dark:bg-brand-500/25 text-brand-700 dark:text-brand-300 rounded px-0.5">${this.escapeHtml(match)}</mark>${this.escapeHtml(after)}`
      );
    }

    // Map normalized match position back to original text
    // Since normalization can change character lengths, we use a mapping approach
    const before = text.substring(0, matchIndex);
    const matchLength = this.getOriginalMatchLength(text, matchIndex, normalizedQuery.length);
    const match = text.substring(matchIndex, matchIndex + matchLength);
    const after = text.substring(matchIndex + matchLength);

    return this.sanitizer.bypassSecurityTrustHtml(
      `${this.escapeHtml(before)}<mark class="bg-brand-100 dark:bg-brand-500/25 text-brand-700 dark:text-brand-300 rounded px-0.5">${this.escapeHtml(match)}</mark>${this.escapeHtml(after)}`
    );
  }

  private getOriginalMatchLength(originalText: string, startIndex: number, normalizedLength: number): number {
    // Count original characters that map to normalizedLength normalized characters
    let normalizedCount = 0;
    let originalCount = 0;
    
    for (let i = startIndex; i < originalText.length && normalizedCount < normalizedLength; i++) {
      const char = originalText[i];
      // Diacritics (tashkeel) are removed during normalization, so they don't count
      if (!/[\u064B-\u0652]/.test(char)) {
        normalizedCount++;
      }
      originalCount++;
    }
    
    return originalCount;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
}
