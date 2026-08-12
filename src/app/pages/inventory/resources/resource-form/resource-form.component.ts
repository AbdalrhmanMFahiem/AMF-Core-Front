import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ResourceService } from '../../../../core/services/resource.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ResourceType, RESOURCE_TYPE_CONFIG_LIST } from '../../../../core/models/resource.model';
import { UomType, UOM_TYPE_CONFIG_LIST } from '../../../../core/models/uom.model';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule, 
    SearchableSelectComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent
  ],
  templateUrl: './resource-form.component.html'
})
export class ResourceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private resourceService = inject(ResourceService);
  private lookupService = inject(LookupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  form: FormGroup;
  isEditMode = false;
  isViewMode = false;
  itemId: number | null = null;
  loading = false;
  submitting = false;
  
  // Status flags
  showSuccess = false;
  showError = false;
  errorMessage = '';

  // Breadcrumb config
  breadcrumbPath: { label: string, url: string }[] = [];

  resourceTypeOptions: SearchableOption[] = [];
  rateUomTypeOptions: SearchableOption[] = [];
  unitOfMeasuresOptions: SearchableOption[] = [];

  constructor() {
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }, Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      resourceType: [ResourceType.Labor, Validators.required],
      costRate: [0, [Validators.required, Validators.min(0)]],
      rateUomType: [UomType.Timing, Validators.required],
      unitOfMeasureId: [null, Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.setupDropdownOptions();
    
    this.translate.onLangChange.subscribe(() => {
      this.setupDropdownOptions();
    });

    // Listen to changes on rateUomType to populate unitOfMeasuresOptions dynamically
    this.form.get('rateUomType')?.valueChanges.subscribe(uomType => {
      this.loadUnitOfMeasuresByType(uomType);
    });

    this.route.url.subscribe(urlSegments => {
      const urlPaths = urlSegments.map(s => s.path);
      this.isViewMode = urlPaths.includes('view');
      this.isEditMode = urlPaths.includes('edit');
      
      if (this.isViewMode) {
        this.form.disable();
      }

      if (this.isEditMode || this.isViewMode) {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
          this.loadData(this.itemId);
        }
      } else {
        this.loadNextCode();
        // Load UOMs for default selected rateUomType (Time)
        const initialRateUomType = this.form.get('rateUomType')?.value;
        if (initialRateUomType) {
          this.loadUnitOfMeasuresByType(initialRateUomType);
        }
      }
    });
  }

  setupDropdownOptions(): void {
    const isAr = this.translate.currentLang === 'ar';
    this.resourceTypeOptions = RESOURCE_TYPE_CONFIG_LIST.map(opt => ({
      value: opt.type,
      label: isAr ? opt.aName : opt.eName
    }));

    this.rateUomTypeOptions = UOM_TYPE_CONFIG_LIST.map(opt => ({
      value: opt.type,
      label: isAr ? opt.aName : opt.eName
    }));
  }

  setupBreadcrumb() {
    this.breadcrumbPath = [
      { label: 'pages.inventory', url: '' },
      { label: 'resources.list.title', url: '/inventory/resources' }
    ];
  }

  loadUnitOfMeasuresByType(uomType: UomType | string): void {
    if (!uomType) {
      this.unitOfMeasuresOptions = [];
      return;
    }

    this.lookupService.getUnitOfMeasureByType(uomType).subscribe({
      next: (res) => {
        this.unitOfMeasuresOptions = res.map(u => ({ value: u.id, label: u.name }));
        
        // Reset selected unitOfMeasureId if not present in the new filtered list
        const currentUomId = this.form.get('unitOfMeasureId')?.value;
        if (currentUomId && !res.some(u => u.id === currentUomId)) {
          this.form.patchValue({ unitOfMeasureId: null }, { emitEvent: false });
        }
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  loadNextCode(): void {
    this.loading = true;
    this.resourceService.getNextCode().subscribe({
      next: (res) => {
        this.form.patchValue({ code: res.nextCode });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadData(id: number): void {
    this.loading = true;
    this.resourceService.get(id).subscribe({
      next: (res) => {
        // First load UOMs for the resource's rateUomType, then patch form values
        this.lookupService.getUnitOfMeasureByType(res.rateUomType).subscribe({
          next: (uomList) => {
            this.unitOfMeasuresOptions = uomList.map(u => ({ value: u.id, label: u.name }));
            this.form.patchValue({
              code: res.code,
              aName: res.aName,
              eName: res.eName,
              resourceType: res.resourceType,
              costRate: res.costRate,
              rateUomType: res.rateUomType,
              unitOfMeasureId: res.unitOfMeasureId,
              notes: res.notes
            }, { emitEvent: false });
            this.loading = false;
          },
          error: () => {
            this.form.patchValue({
              code: res.code,
              aName: res.aName,
              eName: res.eName,
              resourceType: res.resourceType,
              costRate: res.costRate,
              rateUomType: res.rateUomType,
              unitOfMeasureId: res.unitOfMeasureId,
              notes: res.notes
            }, { emitEvent: false });
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.showSuccess = false;
    this.showError = false;
    
    const formData = this.form.getRawValue();

    const request = (this.isEditMode
      ? this.resourceService.update(this.itemId!, formData)
      : this.resourceService.add(formData)) as Observable<any>;

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.submitting = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || this.translate.instant('errors.generic');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/inventory/resources']);
  }
}
