import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { CountryService } from '../../../../core/services/country.service';
import { CountryGroupService } from '../../../../core/services/country-group.service';
import { CountryRequest } from '../../../../core/models/country.model';
import { CountryGroupBasicResponse } from '../../../../core/models/country-group.model';

@Component({
  selector: 'app-country-form',
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
  templateUrl: './country-form.component.html'
})
export class CountryFormComponent implements OnInit {
  private countryService = inject(CountryService);
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
  countryGroups: CountryGroupBasicResponse[] = [];

  model: CountryRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    countryGroupId: null,
    isoCode: '',
    notes: ''
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else {
        this.mode = 'add';
        this.countryService.getNextCode().subscribe({
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
    
    this.loadCountryGroups();
  }

  loadData(): void {
    if (!this.id) return;
    this.loading = true;
    this.countryService.get(this.id).subscribe({
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

  loadCountryGroups(): void {
    // We use a large page size to fetch all active country groups for the dropdown
    this.countryGroupService.getAll({ pageNumber: 1, pageSize: 1000 }, false).subscribe({
      next: (res) => {
        this.countryGroups = res.items;
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'view') return;
    
    this.saving = true;
    this.validationErrors = [];
    this.saveSuccess = false;

    const request = this.mode === 'add' 
      ? this.countryService.add(this.model)
      : this.countryService.update(this.id!, this.model);

    (request as Observable<any>).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        this.validationErrors = err.error?.errors 
          ? Object.values(err.error.errors).flat() as string[]
          : [err.error?.title || this.translate.instant('common.errorSavingData')];
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/master-data/countries']);
  }
}
