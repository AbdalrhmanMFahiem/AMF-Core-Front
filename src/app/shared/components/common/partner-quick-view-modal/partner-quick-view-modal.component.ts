import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { BusinessPartnerService } from '../../../../core/services/business-partner.service';
import { BusinessPartnerQuickViewResponse } from '../../../../core/models/business-partner.model';

@Component({
  selector: 'app-partner-quick-view-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalComponent
  ],
  templateUrl: './partner-quick-view-modal.component.html'
})
export class PartnerQuickViewModalComponent implements OnChanges {
  private bpService = inject(BusinessPartnerService);
  private router = inject(Router);

  @Input() isOpen: boolean = false;
  @Input() partnerId: number | null = null;
  @Output() close = new EventEmitter<void>();

  loading = false;
  quickViewData: BusinessPartnerQuickViewResponse | null = null;
  activeTab: 'all' | 'sales' | 'purchases' = 'all';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.partnerId) {
      this.loadData(this.partnerId);
    }
  }

  loadData(id: number): void {
    this.loading = true;
    this.bpService.getQuickView(id).subscribe({
      next: (res) => {
        this.quickViewData = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onViewStatement(): void {
    if (!this.partnerId) return;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/reports/business-partner-statement'], { queryParams: { id: this.partnerId } })
    );
    window.open(url, '_blank');
  }

  onCreatePayment(): void {
    if (!this.partnerId) return;
    this.onClose();
    this.router.navigate(['/finance/business-partner-payments/add'], { queryParams: { partnerId: this.partnerId } });
  }
}
