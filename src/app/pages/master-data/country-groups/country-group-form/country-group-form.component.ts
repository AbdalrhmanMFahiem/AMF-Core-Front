import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { CountryGroupService } from '../../../../core/services/country-group.service';
import { CountryGroupRequest } from '../../../../core/models/country-group.model';

@Component({
  selector: 'app-country-group-form',
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
  templateUrl: './country-group-form.component.html'
})
export class CountryGroupFormComponent implements OnInit {
  private countryGroupService = inject(CountryGroupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];

  model: CountryGroupRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    notes: ''
  };

  ngOnInit(): void {
    // Detect mode from URL
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
      this.countryGroupService.getNextCode().subscribe({
        next: (res) => this.model.code = res.nextCode,
        error: (err) => console.error('Failed to get next code', err)
      });
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.countryGroupService.get(id).subscribe({
      next: (res) => {
        this.model = { ...res, eName: res.eName || '', notes: res.notes || '' };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.aName) {
      const fieldName = this.translate.instant('countryGroups.fields.aName');
      this.validationErrors.push(this.translate.instant('validation.required', { field: fieldName }));
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;
    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: () => { this.saving = false; this.saveSuccess = true; },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) this.validationErrors = [err.error.message];
        else if (err?.error?.errors) {
          this.validationErrors = Array.isArray(err.error.errors)
            ? err.error.errors.map((e: any) => e.description || e.errorMessage || JSON.stringify(e))
            : Object.values(err.error.errors).flat() as string[];
        } else this.validationErrors = [this.translate.instant('errors.generic')];
      }
    };

    if (this.mode === 'add') this.countryGroupService.add(this.model).subscribe(observer);
    else this.countryGroupService.update(this.id!, this.model).subscribe(observer);
  }

  onCancel(): void {
    this.router.navigate(['/master-data/country-groups']);
  }
}
