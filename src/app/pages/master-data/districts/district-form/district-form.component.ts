import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { DistrictService } from '../../../../core/services/district.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DistrictRequest } from '../../../../core/models/district.model';
import { Observable } from 'rxjs';
import { IdNameResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-district-form',
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
  templateUrl: './district-form.component.html'
})
export class DistrictFormComponent implements OnInit {
  private districtService = inject(DistrictService);
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
  cities: IdNameResponse[] = [];

  model: DistrictRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    cityId: 0,
    notes: ''
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else {
        this.mode = 'add';
        this.districtService.getNextCode().subscribe({
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
    
    this.loadCities();
  }

  loadData(): void {
    if (!this.id) return;
    this.loading = true;
    this.districtService.get(this.id).subscribe({
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

  loadCities(): void {
    this.lookupService.getCities({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        this.cities = res;
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'view') return;
    
    this.saving = true;
    this.validationErrors = [];

    const request = this.mode === 'add' 
      ? this.districtService.add(this.model)
      : this.districtService.update(this.id!, this.model);

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
    this.router.navigate(['/master-data/districts']);
  }
}
