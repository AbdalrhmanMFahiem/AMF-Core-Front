import { Component, EventEmitter, inject, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePaymentRequest, PaymentMethod, InvoiceBasicResponse } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ModalComponent,
    SearchableSelectComponent,
    DatePickerComponent
  ],
  templateUrl: './payment-modal.component.html',
})
export class PaymentModalComponent implements OnChanges {
  private invoiceService = inject(InvoiceService);
  private translate = inject(TranslateService);

  @Input() isOpen = false;
  @Input() invoice: InvoiceBasicResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() paymentAdded = new EventEmitter<void>();

  model: InvoicePaymentRequest = {
    method: PaymentMethod.Cash,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    bankId: undefined,
    bankBranchId: undefined
  };

  loading = false;
  errors: string[] = [];

  paymentMethodOptions: SearchableOption[] = [
    { value: PaymentMethod.Cash, label: this.translate.instant('purchaseInvoices.paymentMethods.Cash') },
    { value: PaymentMethod.BankTransfer, label: this.translate.instant('purchaseInvoices.paymentMethods.BankTransfer') },
    { value: PaymentMethod.Cheque, label: this.translate.instant('purchaseInvoices.paymentMethods.Cheque') },
    { value: PaymentMethod.CreditCard, label: this.translate.instant('purchaseInvoices.paymentMethods.CreditCard') },
    { value: PaymentMethod.PostDatedCheque, label: this.translate.instant('purchaseInvoices.paymentMethods.PostDatedCheque') },
    { value: PaymentMethod.Other, label: this.translate.instant('purchaseInvoices.paymentMethods.Other') }
  ];

  showConfirmation = false;

  ngOnChanges(): void {
    if (this.isOpen && this.invoice) {
      this.model = {
        method: PaymentMethod.Cash,
        amount: this.invoice.remainingAmount || 0,
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
        dueDate: undefined,
        chequeNumber: undefined
      };
      this.errors = [];
      this.showConfirmation = false;
    }
  }

  onSubmit(): void {
    if (this.model.amount <= 0) {
      this.errors = ['Amount must be greater than zero.'];
      return;
    }
    if (this.invoice && this.model.amount > this.invoice.remainingAmount) {
      this.errors = ['Amount cannot be greater than remaining amount.'];
      return;
    }

    // Show confirmation instead of saving directly
    this.showConfirmation = true;
  }

  confirmSave(): void {
    if (!this.invoice) return;

    this.loading = true;
    this.errors = [];

    this.invoiceService.addPayment(this.invoice.id, this.model).subscribe({
      next: () => {
        this.loading = false;
        this.paymentAdded.emit();
        this.close.emit();
      },
      error: (err: any) => {
        this.loading = false;
        if (err?.error?.errors) {
          this.errors = Array.isArray(err.error.errors)
            ? err.error.errors.map((e: any) => e.errorMessage || e.description || JSON.stringify(e))
            : Object.values(err.error.errors).flat() as string[];
        } else if (err?.error?.message) {
          this.errors = [err.error.message];
        } else {
          this.errors = [this.translate.instant('errors.generic')];
        }
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
