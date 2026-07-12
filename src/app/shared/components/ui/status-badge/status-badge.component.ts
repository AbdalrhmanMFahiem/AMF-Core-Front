import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule, BadgeComponent],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent implements OnChanges {
  @Input() status: string | undefined;
  
  // Optional translation prefix. If provided, translation key will be prefix + '.' + status
  // Otherwise, the translation key will just be the status string.
  @Input() translationPrefix?: string;

  color: any = 'light';
  variant: any = 'light';

  ngOnChanges(): void {
    this.updateColor();
  }

  private updateColor(): void {
    if (!this.status) {
      this.color = 'light';
      return;
    }

    const s = this.status.toLowerCase();

    // Map common status words to BadgeColors
    // BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark'
    switch (s) {
      case 'draft':
      case 'notrequired':
      case 'inactive':
        this.color = 'light';
        break;
      case 'pending':
      case 'inprogress':
        this.color = 'warning';
        break;
      case 'open':
        this.color = 'info';
        break;
      case 'approved':
      case 'completed':
      case 'active':
      case 'success':
        this.color = 'success';
        break;
      case 'closed':
        this.color = 'dark';
        break;
      case 'rejected':
      case 'failed':
      case 'cancelled':
      case 'canceled':
      case 'error':
        this.color = 'error';
        break;
      default:
        this.color = 'primary';
        break;
    }
  }
}
