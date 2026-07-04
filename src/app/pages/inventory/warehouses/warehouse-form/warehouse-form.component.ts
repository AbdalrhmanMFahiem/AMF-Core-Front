import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { WarehouseService } from '../../../../core/services/warehouse.service';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule, 
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent
  ],
  templateUrl: './warehouse-form.component.html'
})
export class WarehouseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private warehouseService = inject(WarehouseService);
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

  constructor() {
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }, Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      maxVolumeCapacity: [0, [Validators.min(0)]],
      maxWeightCapacity: [0, [Validators.min(0)]],
      maxPalletsCount: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.setupBreadcrumb();
    
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
      }
    });
  }

  setupBreadcrumb() {
    this.breadcrumbPath = [
      { label: 'inventory.title', url: '' },
      { label: 'warehouses.list.title', url: '/inventory/warehouses' }
    ];
  }

  loadNextCode(): void {
    this.loading = true;
    this.warehouseService.getNextCode().subscribe({
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
    this.warehouseService.get(id).subscribe({
      next: (res) => {
        this.form.patchValue({
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          maxVolumeCapacity: res.maxVolumeCapacity,
          maxWeightCapacity: res.maxWeightCapacity,
          maxPalletsCount: res.maxPalletsCount,
          notes: res.notes
        });
        this.loading = false;
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
    
    // We need to get the raw value because 'code' is disabled
    const formData = this.form.getRawValue();

    const request = (this.isEditMode
      ? this.warehouseService.update(this.itemId!, formData)
      : this.warehouseService.add(formData)) as Observable<any>;

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
    this.router.navigate(['/inventory/warehouses']);
  }
}
