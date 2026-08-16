import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BusinessPartnerService } from '../../../../core/services/business-partner.service';
import { PartnerQuickViewModalComponent } from '../partner-quick-view-modal/partner-quick-view-modal.component';

@Component({
  selector: 'app-partner-balance-badge',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PartnerQuickViewModalComponent
  ],
  templateUrl: './partner-balance-badge.component.html'
})
export class PartnerBalanceBadgeComponent implements OnChanges {
  private bpService = inject(BusinessPartnerService);

  @Input() partnerId: number | null = null;
  @Input() showLabel: boolean = true;

  balance: number | null = null;
  loading = false;
  isModalOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partnerId']) {
      if (this.partnerId) {
        this.loadBalance(this.partnerId);
      } else {
        this.balance = null;
      }
    }
  }

  loadBalance(id: number): void {
    this.loading = true;
    this.bpService.getBalanceSummary(id).subscribe({
      next: (res) => {
        this.balance = res.currentBalance;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openQuickView(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.partnerId) {
      this.isModalOpen = true;
    }
  }

  closeQuickView(): void {
    this.isModalOpen = false;
  }
}
