import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../ui/modal/modal.component';
import { BusinessPartnerPaymentService } from '../../../../core/services/business-partner-payment.service';
import { SuggestedAllocationDto, AllocationRequest } from '../../../../core/models/business-partner-payment.model';

@Component({
  selector: 'app-allocation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './allocation-modal.component.html'
})
export class AllocationModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() paymentId = 0;
  @Input() businessPartnerId = 0;
  @Input() unallocatedAmount = 0;

  @Output() close = new EventEmitter<void>();
  @Output() allocated = new EventEmitter<void>();

  private paymentService = inject(BusinessPartnerPaymentService);
  private toastr = inject(ToastrService);
  public translate = inject(TranslateService);

  loading = false;
  submitting = false;
  suggestions: SuggestedAllocationDto[] = [];
  allocationsMap: { [invoiceId: number]: number } = {};

  ngOnChanges(): void {
    if (this.isOpen && this.paymentId && this.businessPartnerId) {
      this.loadFifoSuggestions();
    }
  }

  loadFifoSuggestions(): void {
    this.loading = true;
    this.paymentService.suggestAllocation(this.businessPartnerId, this.unallocatedAmount).subscribe({
      next: (res) => {
        this.suggestions = res;
        this.allocationsMap = {};
        res.forEach(item => {
          this.allocationsMap[item.invoiceId] = item.suggestedAmount;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalAllocated(): number {
    return Object.values(this.allocationsMap).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  onSubmit(): void {
    if (this.totalAllocated > this.unallocatedAmount) {
      this.toastr.error(this.translate.instant('payments.allocationExceedsError'));
      return;
    }

    const payload: AllocationRequest[] = Object.entries(this.allocationsMap)
      .map(([invId, amt]) => ({ invoiceId: +invId, amount: Number(amt) }))
      .filter(a => a.amount > 0);

    if (payload.length === 0) {
      this.toastr.warning(this.translate.instant('payments.noAllocationSpecified'));
      return;
    }

    this.submitting = true;
    this.paymentService.allocate(this.paymentId, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.translate.instant('payments.allocationSuccess'));
        this.allocated.emit();
        this.onClose();
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'));
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
