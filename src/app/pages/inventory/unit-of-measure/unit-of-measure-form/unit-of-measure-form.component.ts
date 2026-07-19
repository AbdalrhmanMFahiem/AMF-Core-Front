import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { UnitOfMeasureService } from '../../../../core/services/unit-of-measure.service';
import { ToastrService } from 'ngx-toastr';
import { UnitOfMeasureRequest, UomType } from '../../../../core/models/uom.model';

@Component({
  selector: 'app-unit-of-measure-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent],
  templateUrl: './unit-of-measure-form.component.html',
  styles: ``
})
export class UnitOfMeasureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly uomService = inject(UnitOfMeasureService);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  form!: FormGroup;
  id: number = 0;
  isEditMode: boolean = false;
  isView: boolean = false;
  isSaving: boolean = false;
  loading: boolean = false;
  showSuccessBanner: boolean = false;

  uomTypes = Object.values(UomType);
  baseUnitForSelectedType: UnitOfMeasureRequest | null = null;

  get isEdit(): boolean {
    return this.isEditMode;
  }

  get pageTitle(): string {
    if (this.isView) return 'pages.UnitOfMeasure.ViewTitle';
    if (this.isEdit) return 'pages.UnitOfMeasure.EditTitle';
    return 'pages.UnitOfMeasure.AddTitle';
  }

  ngOnInit(): void {
    this.initForm();
    this.checkMode();
    this.setupSubscriptions();
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [0],
      code: ['', Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      uomType: [null, Validators.required],
      isBaseUnit: [false],
      conversionFactor: [1, [Validators.required, Validators.min(0.00001)]],
      notes: ['']
    });
  }

  private setupSubscriptions(): void {
    this.form.get('isBaseUnit')?.valueChanges.subscribe(isBase => {
      if (isBase) {
        this.form.get('conversionFactor')?.setValue(1);
        this.form.get('conversionFactor')?.disable();
      } else if (!this.isView) {
        this.form.get('conversionFactor')?.enable();
      }
    });

    // Warning if a base unit already exists for the selected type, and also fetch the base unit for reference
    this.form.get('uomType')?.valueChanges.subscribe(type => {
      if (type) {
        this.fetchBaseUnit(type as UomType, this.isEditMode ? this.id : undefined);
        
        if (this.form.get('isBaseUnit')?.value) {
          this.checkBaseUnit(type as UomType, this.isEditMode ? this.id : undefined);
        }
      }
    });

    this.form.get('isBaseUnit')?.valueChanges.subscribe(isBase => {
      const type = this.form.get('uomType')?.value;
      if (isBase && type) {
        this.checkBaseUnit(type as UomType, this.isEditMode ? this.id : undefined);
      }
    });
  }

  private checkBaseUnit(type: UomType, excludeId?: number): void {
    this.uomService.checkBaseUnitExistsAsync(type, excludeId).subscribe({
      next: (exists) => {
        if (exists) {
          this.toastr.warning(this.translate.instant('uom.warnings.baseUnitExistsForType'));
        }
      }
    });
  }

  private fetchBaseUnit(type: UomType, excludeId?: number): void {
    this.uomService.getBaseUnit(type, excludeId).subscribe({
      next: (baseUnit) => {
        this.baseUnitForSelectedType = baseUnit;
        
        // Disable isBaseUnit checkbox if a base unit already exists for this type
        // Note: we don't disable it if we are currently editing the base unit itself (baseUnit will be null because of excludeId)
        if (baseUnit) {
           this.form.get('isBaseUnit')?.disable();
           this.form.get('isBaseUnit')?.setValue(false);
        } else if (!this.isView) {
           this.form.get('isBaseUnit')?.enable();
        }
      }
    });
  }

  private checkMode(): void {
    const url = this.router.url;
    this.isView = url.includes('/view/');
    this.isEditMode = url.includes('/edit/');

    if (this.isEditMode || this.isView) {
      this.id = Number(this.route.snapshot.paramMap.get('id'));
      if (this.id) {
        this.loading = true;
        this.loadData();
      }
      if (this.isView) {
        this.form.disable();
      }
    } else {
      this.uomService.getNextCode().subscribe({
        next: (res) => {
          this.form.patchValue({ code: res.nextCode });
        }
      });
    }
  }

  private loadData(): void {
    this.uomService.getUnitOfMeasureById(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({
          id: res.id,
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          uomType: res.uomType,
          isBaseUnit: res.isBaseUnit,
          conversionFactor: res.conversionFactor,
          notes: res.notes
        });
        this.loading = false;

        if (res.isBaseUnit) {
          this.form.get('conversionFactor')?.disable();
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load unit of measure details', 'Error');
        this.loading = false;
        this.router.navigate(['/inventory/unit-of-measure']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isView) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const request: UnitOfMeasureRequest = this.form.getRawValue();

    if (this.isEditMode) {
      this.uomService.updateUnitOfMeasure(this.id, request).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSuccessBanner = true;
        },
        error: (err) => {
          this.toastr.error('Failed to update unit of measure', 'Error');
          this.isSaving = false;
        }
      });
    } else {
      this.uomService.addUnitOfMeasure(request).subscribe({
        next: () => {
          this.toastr.success('Unit of measure added successfully', 'Success');
          this.router.navigate(['/inventory/unit-of-measure']);
        },
        error: (err) => {
          this.toastr.error('Failed to add unit of measure', 'Error');
          this.isSaving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/unit-of-measure']);
  }
}
