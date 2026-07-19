import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UomType } from '../../../../core/models/uom.model';

@Component({
  selector: 'app-uom-type-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
          [ngClass]="getBadgeClasses()">
      {{ 'uom.types.' + type | translate }}
    </span>
  `
})
export class UomTypeBadgeComponent {
  @Input() type: UomType | string | null | undefined = null;

  getBadgeClasses(): string {
    switch (this.type) {
      case UomType.Weight:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case UomType.Length:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
      case UomType.Volume:
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800';
      case UomType.Area:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case UomType.Time:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
      case UomType.Other:
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  }
}
