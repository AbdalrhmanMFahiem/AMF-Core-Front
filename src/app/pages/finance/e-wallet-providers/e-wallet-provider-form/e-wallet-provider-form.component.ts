import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { EWalletProviderService } from '../../../../core/services/e-wallet-provider.service';
import { EWalletProviderRequest } from '../../../../core/models/e-wallet-provider.model';

@Component({
  selector: 'app-e-wallet-provider-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent
  ],
  templateUrl: './e-wallet-provider-form.component.html'
})
export class EWalletProviderFormComponent implements OnInit {
  private service = inject(EWalletProviderService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  model: EWalletProviderRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    notes: '',
    fixedCommission: 0,
    commissionPercent: 0,
    maxCommission: null
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadRecord(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  getNextCode(): void {
    this.service.getNextCode().subscribe(res => {
      this.model.code = res.nextCode;
    });
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (res) => {
        this.model = {
          id: res.id,
          code: res.code,
          aName: res.aName,
          eName: res.eName || '',
          notes: res.notes || '',
          fixedCommission: res.fixedCommission,
          commissionPercent: res.commissionPercent,
          maxCommission: res.maxCommission
        };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.code) {
      const fieldName = this.translate.instant('eWalletProviders.fields.code');
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: fieldName }));
    }
    if (!this.model.aName) {
      const fieldName = this.translate.instant('eWalletProviders.fields.aName');
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: fieldName }));
    }
    if (this.model.fixedCommission < 0) {
      this.validationErrors.push(this.translate.instant('validation.min', { min: 0 }));
    }
    if (this.model.commissionPercent < 0 || this.model.commissionPercent > 100) {
      this.validationErrors.push(this.translate.instant('validation.invalid'));
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;
    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) {
          this.validationErrors = [err.error.message];
        } else if (err?.error?.errors) {
          this.validationErrors = Array.isArray(err.error.errors)
            ? err.error.errors.map((e: any) => e.description || e.errorMessage || JSON.stringify(e))
            : Object.values(err.error.errors).flat() as string[];
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    };

    if (this.mode === 'add') {
      this.service.add(this.model).subscribe(observer);
    } else {
      this.service.update(this.id!, this.model).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/finance/e-wallet-providers']);
  }
}
