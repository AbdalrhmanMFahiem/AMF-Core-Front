import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigPaymentService } from '../../../core/services/config-payment.service';
import { CommissionCalculationMode } from '../../../core/models/config-payment.model';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ModalComponent
  ],
  templateUrl: './payment-settings.component.html'
})
export class PaymentSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ConfigPaymentService);
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  form: FormGroup;
  isLoading = false;
  isSaving = false;

  CommissionModes = CommissionCalculationMode;

  // Live Calculator Modal State
  isCalculatorModalOpen = false;
  modalPreviewMode: CommissionCalculationMode = CommissionCalculationMode.DeductFromAmount;
  previewBaseAmount: number = 1000;
  previewCommissionPercent: number = 1.0;
  previewFixedCommission: number = 0;

  constructor() {
    this.form = this.fb.group({
      autoApprovePayments: [true],
      allowOverAllocation: [false],
      commissionMode: [CommissionCalculationMode.DeductFromAmount],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.service.getSettings().subscribe({
      next: (res) => {
        if (res) {
          const mode = res.commissionMode ?? CommissionCalculationMode.DeductFromAmount;
          this.form.patchValue({
            autoApprovePayments: res.autoApprovePayments ?? true,
            allowOverAllocation: res.allowOverAllocation ?? false,
            commissionMode: mode,
            notes: res.notes || ''
          });
          this.modalPreviewMode = mode;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'));
      }
    });
  }

  setCommissionMode(mode: CommissionCalculationMode): void {
    this.form.patchValue({ commissionMode: mode });
  }

  openCalculatorModal(): void {
    this.modalPreviewMode = this.form.value.commissionMode || CommissionCalculationMode.DeductFromAmount;
    this.isCalculatorModalOpen = true;
  }

  closeCalculatorModal(): void {
    this.isCalculatorModalOpen = false;
  }

  setModalPreviewMode(mode: CommissionCalculationMode): void {
    this.modalPreviewMode = mode;
  }

  applyModalMode(): void {
    this.setCommissionMode(this.modalPreviewMode);
    this.closeCalculatorModal();
    this.toastr.info(this.translate.instant('paymentSettings.modeApplied'));
  }

  get previewCommissionAmount(): number {
    const base = Number(this.previewBaseAmount) || 0;
    const pct = Number(this.previewCommissionPercent) || 0;
    const fixed = Number(this.previewFixedCommission) || 0;
    return Number((fixed + (base * (pct / 100))).toFixed(2));
  }

  get previewFinalAmount(): number {
    const base = Number(this.previewBaseAmount) || 0;
    const comm = this.previewCommissionAmount;
    if (this.modalPreviewMode === CommissionCalculationMode.DeductFromAmount) {
      return Number((base - comm).toFixed(2));
    } else {
      return Number((base + comm).toFixed(2));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.service.updateSettings(this.form.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastr.success(this.translate.instant('common.savedSuccessfully'));
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'));
      }
    });
  }
}
