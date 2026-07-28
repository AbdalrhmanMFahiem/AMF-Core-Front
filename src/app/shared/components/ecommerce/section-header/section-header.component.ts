import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <div [class]="'p-2.5 rounded-xl flex items-center justify-center ' + badgeBgClass">
          <ng-content select="[slot=icon]"></ng-content>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {{ title }}
            <span *ngIf="count !== undefined" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500">
              {{ count }}
            </span>
          </h2>
          <p *ngIf="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>
      <div>
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </div>
  `
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() count?: number;
  @Input() badgeBgClass: string = 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/20';
}
