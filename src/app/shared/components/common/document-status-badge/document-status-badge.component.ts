import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentStatus } from '../../../../core/models/document-status.model';

@Component({
  selector: 'app-document-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full"
          [ngClass]="getBadgeClasses()">
      <!-- Dynamic Icons Based on Status -->
      <svg *ngIf="isDraft()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <svg *ngIf="isOpen()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <svg *ngIf="isCancelled()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <svg *ngIf="isClosed()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
      
      {{ 'common.documentStatus.' + status | translate }}
    </span>
  `
})
export class DocumentStatusBadgeComponent {
  @Input() status: DocumentStatus | string | number | null | undefined = null;

  isDraft(): boolean { return this.status === DocumentStatus.Draft; }
  isCancelled(): boolean { return this.status === DocumentStatus.Cancelled; }
  isClosed(): boolean { return this.status === DocumentStatus.Closed; }
  isOpen(): boolean { return this.status === DocumentStatus.Open; }

  getBadgeClasses(): string {
    if (this.isDraft()) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    if (this.isOpen()) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
    if (this.isCancelled() || this.isClosed()) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
}
