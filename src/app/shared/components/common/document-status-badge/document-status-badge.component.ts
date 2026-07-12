import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-document-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full"
          [ngClass]="{
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800': isDraft(),
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800': isConfirmed(),
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800': isCancelled()
          }">
      <!-- Icon for Draft -->
      <svg *ngIf="isDraft()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <!-- Icon for Confirmed -->
      <svg *ngIf="isConfirmed()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <!-- Icon for Cancelled -->
      <svg *ngIf="isCancelled()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      
      {{ 'common.documentStatus.' + getTranslationKey() | translate }}
    </span>
  `
})
export class DocumentStatusBadgeComponent {
  @Input() status: number | string | null | undefined = null;

  isDraft(): boolean { return this.status === 0 || this.status === '0' || this.status === 'Draft'; }
  isConfirmed(): boolean { return this.status === 1 || this.status === '1' || this.status === 'Confirmed'; }
  isCancelled(): boolean { return this.status === 2 || this.status === '2' || this.status === 'Cancelled'; }

  getTranslationKey(): string {
    if (this.isDraft()) return '0';
    if (this.isConfirmed()) return '1';
    if (this.isCancelled()) return '2';
    return String(this.status);
  }
}
