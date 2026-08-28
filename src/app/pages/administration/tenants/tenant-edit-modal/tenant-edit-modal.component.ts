import { Component, EventEmitter, Input, Output, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TenantService } from '../../../../core/services/tenant.service';
import { TenantSummaryResponse, UpdateTenantRequest } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './tenant-edit-modal.component.html'
})
export class TenantEditModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() tenant: TenantSummaryResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TenantSummaryResponse>();

  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private toastr = inject(ToastrService);
  public translate = inject(TranslateService);

  form!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tenant'] && this.tenant) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(256)]],
      maxUsers: [5, [Validators.required, Validators.min(1), Validators.max(100000)]],
      supportExpiryDate: [''],
      isActive: [true]
    });

    if (this.tenant) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (!this.form || !this.tenant) return;

    let formattedDate = '';
    if (this.tenant.supportExpiryDate) {
      try {
        formattedDate = new Date(this.tenant.supportExpiryDate).toISOString().split('T')[0];
      } catch {
        formattedDate = '';
      }
    }

    this.form.patchValue({
      name: this.tenant.name,
      maxUsers: this.tenant.maxUsers,
      supportExpiryDate: formattedDate,
      isActive: this.tenant.isActive
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || !this.tenant) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.form.value;

    const request: UpdateTenantRequest = {
      name: formVal.name,
      maxUsers: Number(formVal.maxUsers),
      supportExpiryDate: formVal.supportExpiryDate ? new Date(formVal.supportExpiryDate).toISOString() : undefined,
      isActive: Boolean(formVal.isActive)
    };

    this.tenantService.update(this.tenant.tenantId, request).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastr.success(
          this.translate.instant('tenants.editSuccess') || 'Company details updated successfully'
        );
        this.saved.emit(res);
        this.onClose();
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || err?.error?.title || this.translate.instant('errors.generic');
        this.toastr.error(msg);
      }
    });
  }
}
