import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-adjustment-type-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full"
          [ngClass]="{
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800': isAddition(),
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800': isDeduction()
          }">
      <!-- Icon for Addition -->
      <svg *ngIf="isAddition()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <!-- Icon for Deduction -->
      <svg *ngIf="isDeduction()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
      </svg>
      
      {{ 'stockAdjustments.types.' + getTranslationKey() | translate }}
    </span>
  `
})
export class AdjustmentTypeBadgeComponent {
  @Input() type: string | null | undefined = null;

  isAddition(): boolean { return this.type === 'Addition'; }
  isDeduction(): boolean { return this.type === 'Deduction'; }

  getTranslationKey(): string {
    if (this.isAddition()) return 'Addition';
    if (this.isDeduction()) return 'Deduction';
    return String(this.type);
  }
}
