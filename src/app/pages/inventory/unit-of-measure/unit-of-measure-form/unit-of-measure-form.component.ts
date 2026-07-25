import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { UnitOfMeasureService } from '../../../../core/services/unit-of-measure.service';
import { ToastrService } from 'ngx-toastr';
import { PendingDerivedUnit, UnitOfMeasure, UnitOfMeasureRequest, UomType, getUomTypeConfig } from '../../../../core/models/uom.model';

type FormMode = 'base' | 'derived' | null;

@Component({
  selector: 'app-unit-of-measure-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent],
  templateUrl: './unit-of-measure-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitOfMeasureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly uomService = inject(UnitOfMeasureService);
  private readonly toastr = inject(ToastrService);
  public readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals for state
  id = signal<number>(0);
  isEditMode = signal<boolean>(false);
  isView = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  loading = signal<boolean>(false);
  showSuccessBanner = signal<boolean>(false);
  
  // Step 1 State
  selectedType = signal<UomType | null>(null);
  baseUnitExists = signal<boolean>(false);
  baseUnit = signal<UnitOfMeasure | null>(null);
  checkingBaseUnit = signal<boolean>(false);

  // Step 2 State
  mode = signal<FormMode>(null);

  uomTypes = Object.values(UomType);

  // Form for base unit
  baseForm!: FormGroup;
  
  // FormArray for derived units
  derivedFormArray!: FormArray;

  pageTitle = computed(() => {
    if (this.isView()) return 'pages.UnitOfMeasure.ViewTitle';
    if (this.isEditMode()) return 'pages.UnitOfMeasure.EditTitle';
    return 'pages.UnitOfMeasure.AddTitle';
  });

  presets = computed(() => {
    const type = this.selectedType();
    if (type === UomType.Weight) return [5, 10, 25, 50, 100];
    if (type === UomType.Quantity) return [6, 12, 24, 48, 100];
    if (type === UomType.Volume) return [2, 5, 10, 20];
    if (type === UomType.Length) return [10, 50, 100, 1000];
    if (type === UomType.Time) return [60, 24, 7, 30, 365];
    return [];
  });

  constructor() {
    this.initForms();
  }

  ngOnInit(): void {
    this.checkMode();
  }

  private initForms(): void {
    this.baseForm = this.fb.group({
      code: ['', Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      notes: ['']
    });

    this.derivedFormArray = this.fb.array([]);
  }

  private checkMode(): void {
    const url = this.router.url;
    this.isView.set(url.includes('/view/'));
    this.isEditMode.set(url.includes('/edit/'));

    if (this.isEditMode() || this.isView()) {
      const routeId = Number(this.route.snapshot.paramMap.get('id'));
      this.id.set(routeId);
      if (routeId) {
        this.loading.set(true);
        this.loadData();
      }
      if (this.isView()) {
        this.baseForm.disable();
        this.derivedFormArray.disable();
      }
    }
  }

  private loadData(): void {
    this.uomService.getUnitOfMeasureById(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.selectedType.set(res.uomType);
          if (res.isBaseUnit) {
            this.mode.set('base');
            this.baseForm.patchValue({
              code: res.code,
              aName: res.aName,
              eName: res.eName,
              notes: res.notes
            });
          } else {
            this.mode.set('derived');
            this.baseUnitExists.set(true); // Assuming if it's derived, base exists.
            this.uomService.getBaseUnit(res.uomType)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(base => this.baseUnit.set(base));
              
            const row = this.createDerivedRow();
            row.patchValue({
              code: res.code,
              aName: res.aName,
              eName: res.eName,
              conversionFactor: res.conversionFactor
            });
            if (this.isView()) row.disable();
            this.derivedFormArray.push(row);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.toastr.error('Failed to load unit of measure details', 'Error');
          this.loading.set(false);
          this.router.navigate(['/inventory/unit-of-measure']);
        }
      });
  }

  // --- Step 1: Select Type ---
  selectType(type: UomType): void {
    if (this.isEditMode() || this.isView()) return; // Don't allow changing type in edit mode
    this.selectedType.set(type);
    this.mode.set(null); // Reset step 2
    this.baseForm.reset();
    this.derivedFormArray.clear();
    this.checkBaseUnitForSelectedType(type);
  }

  private checkBaseUnitForSelectedType(type: UomType): void {
    this.checkingBaseUnit.set(true);
    
    // Auto-generate a code if we are adding a base unit later, or just to have one ready.
    this.uomService.getNextCode().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.baseForm.patchValue({ code: res.nextCode });
    });

    this.uomService.getBaseUnit(type)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (base) => {
          this.baseUnit.set(base);
          this.baseUnitExists.set(!!base);
          this.checkingBaseUnit.set(false);
        },
        error: () => {
          this.baseUnit.set(null);
          this.baseUnitExists.set(false);
          this.checkingBaseUnit.set(false);
        }
      });
  }

  getIconForType(type: UomType): string {
    return getUomTypeConfig(type).svgPath;
  }

  // --- Step 2: Mode Selection ---
  selectMode(m: FormMode): void {
    if (this.isEditMode() || this.isView()) return;
    if (m === 'base' && this.baseUnitExists()) return;
    if (m === 'derived' && !this.baseUnitExists()) return;
    
    this.mode.set(m);
  }

  // --- Step 3b: Derived Builder ---
  createDerivedRow(): FormGroup {
    return this.fb.group({
      id: [crypto.randomUUID()],
      code: ['', Validators.required],
      aName: ['', Validators.required],
      eName: [''],
      conversionFactor: [null, [Validators.required, Validators.min(0.00001)]]
    });
  }

  addDerivedRow(): void {
    this.uomService.getNextCode().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const row = this.createDerivedRow();
      row.patchValue({ code: res.nextCode });
      this.derivedFormArray.push(row);
    });
  }

  removeDerivedRow(index: number): void {
    this.derivedFormArray.removeAt(index);
    if (this.derivedFormArray.length === 0) {
      this.addDerivedRow();
    }
  }

  applyPreset(presetValue: number): void {
    const row = this.createDerivedRow();
    row.patchValue({ conversionFactor: presetValue });
    
    // Try to prefill a name based on translation or generic name
    const type = this.selectedType();
    const typeLabel = this.translate.instant(`uom.types.${type}`);
    row.patchValue({ aName: `${presetValue} ${this.baseUnit()?.name || typeLabel}` });

    this.uomService.getNextCode().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      row.patchValue({ code: res.nextCode });
      this.derivedFormArray.push(row);
    });
  }

  // --- Submit ---
  onSubmit(): void {
    if (!this.selectedType() || !this.mode()) return;

    if (this.mode() === 'base') {
      if (this.baseForm.invalid) {
        this.baseForm.markAllAsTouched();
        return;
      }
      this.saveBaseUnit();
    } else {
      if (this.derivedFormArray.invalid || this.derivedFormArray.length === 0) {
        this.derivedFormArray.markAllAsTouched();
        return;
      }
      
      // Validate unique Arabic Names in batch
      const names = this.derivedFormArray.controls.map(c => c.get('aName')?.value?.trim());
      const uniqueNames = new Set(names);
      if (names.length !== uniqueNames.size) {
        this.toastr.warning(this.translate.instant('unitOfMeasure.builder.duplicateNamesInBatch'));
        return;
      }

      this.saveDerivedUnits();
    }
  }

  private saveBaseUnit(): void {
    this.isSaving.set(true);
    const formVal = this.baseForm.getRawValue();
    const request: UnitOfMeasureRequest = {
      code: formVal.code,
      aName: formVal.aName,
      eName: formVal.eName,
      uomType: this.selectedType()!,
      isBaseUnit: true,
      conversionFactor: 1,
      notes: formVal.notes,
      isActive: true
    };

    if (this.isEditMode()) {
      this.uomService.updateUnitOfMeasure(this.id(), request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.showSuccessBanner.set(true);
          },
          error: () => this.isSaving.set(false)
        });
    } else {
      this.uomService.addUnitOfMeasure(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('unitOfMeasure.status.baseUnitCreated'));
            this.router.navigate(['/inventory/unit-of-measure']);
          },
          error: () => this.isSaving.set(false)
        });
    }
  }

  private saveDerivedUnits(): void {
    this.isSaving.set(true);
    
    if (this.isEditMode()) {
      // Edit mode only edits ONE row typically. The API is for a single ID.
      const formVal = this.derivedFormArray.at(0).getRawValue();
      const request: UnitOfMeasureRequest = {
        code: formVal.code,
        aName: formVal.aName,
        eName: formVal.eName,
        uomType: this.selectedType()!,
        isBaseUnit: false,
        conversionFactor: formVal.conversionFactor,
        notes: '',
        isActive: true
      };
      
      this.uomService.updateUnitOfMeasure(this.id(), request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.showSuccessBanner.set(true);
          },
          error: () => this.isSaving.set(false)
        });
    } else {
      // Batch add
      const derivedUnits: PendingDerivedUnit[] = this.derivedFormArray.controls.map(c => c.getRawValue());
      
      this.uomService.batchAddDerivedUnits({ uomType: this.selectedType()! }, derivedUnits)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (results) => {
            this.toastr.success(this.translate.instant('unitOfMeasure.builder.batchSuccess', { count: results.length }));
            this.router.navigate(['/inventory/unit-of-measure']);
          },
          error: () => this.isSaving.set(false)
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/unit-of-measure']);
  }

  trackByRow(index: number, item: any): string {
    return item.get('id')?.value;
  }

  asFormGroup(ctrl: any): FormGroup {
    return ctrl as FormGroup;
  }
}
