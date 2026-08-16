import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { BusinessPartnerPaymentService } from '../../../../core/services/business-partner-payment.service';
import { SuggestedAllocationDto, AllocationRequest } from '../../../../core/models/business-partner-payment.model';

export interface SelectableInvoiceItem extends SuggestedAllocationDto {
  selected: boolean;
  allocationAmount: number;
}

@Component({
  selector: 'app-invoice-allocation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ModalComponent
  ],
  templateUrl: './invoice-allocation-modal.component.html'
})
export class InvoiceAllocationModalComponent implements OnChanges {
  private paymentService = inject(BusinessPartnerPaymentService);

  @Input() isOpen: boolean = false;
  @Input() partnerId: number | null = null;
  @Input() targetPaymentAmount: number = 0;
  @Input() initialAllocations: AllocationRequest[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirmAllocation = new EventEmitter<{ allocations: AllocationRequest[], totalAllocated: number, selectedInvoices: SelectableInvoiceItem[] }>();

  loading = false;
  invoices: SelectableInvoiceItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.partnerId) {
      this.loadOpenInvoices(this.partnerId);
    }
  }

  loadOpenInvoices(id: number): void {
    this.loading = true;
    this.paymentService.suggestAllocation(id, 99999999).subscribe({
      next: (res) => {
        this.invoices = (res || []).map(inv => {
          const existing = this.initialAllocations.find(a => a.invoiceId === inv.invoiceId);
          const allocAmt = existing ? existing.amount : 0;
          return {
            ...inv,
            selected: allocAmt > 0,
            allocationAmount: allocAmt
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalAllocated(): number {
    return this.invoices
      .filter(i => i.selected)
      .reduce((sum, i) => sum + (Number(i.allocationAmount) || 0), 0);
  }

  toggleInvoice(inv: SelectableInvoiceItem): void {
    inv.selected = !inv.selected;
    if (inv.selected && (!inv.allocationAmount || inv.allocationAmount <= 0)) {
      inv.allocationAmount = inv.invoiceRemaining;
    } else if (!inv.selected) {
      inv.allocationAmount = 0;
    }
  }

  onAmountChange(inv: SelectableInvoiceItem): void {
    if (inv.allocationAmount > inv.invoiceRemaining) {
      inv.allocationAmount = inv.invoiceRemaining;
    }
    inv.selected = inv.allocationAmount > 0;
  }

  autoAllocate(): void {
    let remainingToAllocate = this.targetPaymentAmount > 0 ? this.targetPaymentAmount : 99999999;
    for (const inv of this.invoices) {
      if (remainingToAllocate <= 0) {
        inv.selected = false;
        inv.allocationAmount = 0;
      } else {
        const alloc = Math.min(remainingToAllocate, inv.invoiceRemaining);
        inv.allocationAmount = alloc;
        inv.selected = alloc > 0;
        remainingToAllocate -= alloc;
      }
    }
  }

  clearSelection(): void {
    for (const inv of this.invoices) {
      inv.selected = false;
      inv.allocationAmount = 0;
    }
  }

  onConfirm(): void {
    const selectedItems = this.invoices.filter(i => i.selected && i.allocationAmount > 0);
    const activeAllocations: AllocationRequest[] = selectedItems
      .map(i => ({
        invoiceId: i.invoiceId,
        amount: Number(i.allocationAmount)
      }));

    this.confirmAllocation.emit({
      allocations: activeAllocations,
      totalAllocated: this.totalAllocated,
      selectedInvoices: selectedItems
    });
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
}
