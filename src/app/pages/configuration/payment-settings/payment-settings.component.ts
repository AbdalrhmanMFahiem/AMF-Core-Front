import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigPaymentService } from '../../../core/services/config-payment.service';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    ComponentCardComponent
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

  constructor() {
    this.form = this.fb.group({
      autoApprovePayments: [true],
      allowOverAllocation: [false],
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
          this.form.patchValue({
            autoApprovePayments: res.autoApprovePayments ?? true,
            allowOverAllocation: res.allowOverAllocation ?? false,
            notes: res.notes || ''
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'));
      }
    });
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
