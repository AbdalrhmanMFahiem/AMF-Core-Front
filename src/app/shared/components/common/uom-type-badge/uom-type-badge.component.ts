import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UomType, UomTypeMeta, getUomTypeConfig } from '../../../../core/models/uom.model';

@Component({
  selector: 'app-uom-type-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-theme-xs"
          [ngClass]="meta.badgeClasses">
      <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="meta.svgPath" />
      </svg>
      <span>{{ meta.translationKey | translate }}</span>
    </span>
  `
})
export class UomTypeBadgeComponent {
  @Input() type: UomType | string | null | undefined = null;

  get meta(): UomTypeMeta {
    return getUomTypeConfig(this.type);
  }
}
