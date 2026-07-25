import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaidStatus, PaymentStatus } from '../../../../core/models/document-status.model';
@Component({
  selector: 'app-payment-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full"
          [ngClass]="getBadgeClasses()">
      <!-- Dynamic Icons Based on Status -->
      <svg *ngIf="isUnpaid() || isPending()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <svg *ngIf="isPartiallyPaid()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <svg *ngIf="isFullyPaid() || isCompleted()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <svg *ngIf="isCancelled() || isBounced()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      
      {{ getTranslationKey() | translate }}
    </span>
  `
})
export class PaymentStatusBadgeComponent {
  @Input() status: PaidStatus | PaymentStatus | string | null | undefined = null;
  isUnpaid(): boolean { return this.status === PaidStatus.Unpaid; }
  isPartiallyPaid(): boolean { return this.status === PaidStatus.PartiallyPaid; }
  isFullyPaid(): boolean { return this.status === PaidStatus.FullyPaid; }
  isPending(): boolean { return this.status === PaymentStatus.Pending; }
  isCompleted(): boolean { return this.status === PaymentStatus.Completed; }
  isCancelled(): boolean { return this.status === PaymentStatus.Cancelled; }
  isBounced(): boolean { return this.status === PaymentStatus.Bounced; }
  getBadgeClasses(): string {
    if (this.isUnpaid() || this.isPending()) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    if (this.isPartiallyPaid()) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    if (this.isFullyPaid() || this.isCompleted()) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
    if (this.isCancelled() || this.isBounced()) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
  getTranslationKey(): string {
    if (!this.status) return '';
    // check if it's PaidStatus
    if (Object.values(PaidStatus).includes(this.status as PaidStatus)) {
      return 'common.paidStatusEnum.' + this.status;
    }
    // check if it's PaymentStatus
    if (Object.values(PaymentStatus).includes(this.status as PaymentStatus)) {
      return 'common.paymentStatusEnum.' + this.status;
    }
    return this.status as string;
  }
}
