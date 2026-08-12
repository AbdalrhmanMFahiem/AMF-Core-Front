import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { GovernorateService } from '../../../../core/services/governorate.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { GovernorateRequest } from '../../../../core/models/governorate.model';
import { Observable } from 'rxjs';
import { IdNameResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-governorate-form',
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
  templateUrl: './governorate-form.component.html'
})
export class GovernorateFormComponent implements OnInit {
  private governorateService = inject(GovernorateService);
  private lookupService = inject(LookupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];
  countries: IdNameResponse[] = [];

  model: GovernorateRequest = {
    id: 0,
    countryId: 0,
    code: '',
    aName: '',
    eName: '',
    notes: ''
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else {
        this.mode = 'add';
        this.governorateService.getNextCode().subscribe({
          next: (res) => this.model.code = res.nextCode,
          error: (err) => console.error('Failed to get next code', err)
        });
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadData();
    }
    
    this.loadCountries();
  }

  loadData(): void {
    if (!this.id) return;
    this.loading = true;
    this.governorateService.get(this.id).subscribe({
      next: (data) => {
        this.model = { ...data };
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.validationErrors = [this.translate.instant('common.errorLoadingData')];
      }
    });
  }

  loadCountries(): void {
    this.lookupService.getCountries().subscribe({
      next: (res) => {
        this.countries = res;
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'view') return;
    
    this.saving = true;
    this.validationErrors = [];

    const request = this.mode === 'add' 
      ? this.governorateService.add(this.model)
      : this.governorateService.update(this.id!, this.model);

    (request as Observable<any>).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        if (err.error?.errors) {
          this.validationErrors = Object.values(err.error.errors).flat() as string[];
        } else if (err.error?.detail) {
          this.validationErrors = [err.error.detail];
        } else {
          this.validationErrors = [this.translate.instant('common.errorSavingData')];
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/master-data/governorates']);
  }
}
