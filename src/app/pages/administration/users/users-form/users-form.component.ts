import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserResponse, UserRequest, UserEmploymentInfoRequest } from '../../../../core/models/user.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { SearchableOption, SearchableSelectComponent } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { MultiSelectComponent, Option as MultiSelectOption } from '../../../../shared/components/form/multi-select/multi-select.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { AppConfigService } from '../../../../core/services/app-config.service';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent, DatePickerComponent, ErrorBannerComponent, ComponentCardComponent, SearchableSelectComponent, MultiSelectComponent],
  templateUrl: './users-form.component.html'
})
export class UsersFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public lookupService = inject(LookupService);
  private configService = inject(AppConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  public translate = inject(TranslateService);

  form!: FormGroup;
  id: string | null = null;
  isViewMode = false;
  loading = false;
  saving = false;
  successMode = false;
  validationErrors: string[] = [];
  activeTab: 'basic' | 'employment' = 'basic';
  showPassword = false;
  showConfirmPassword = false;

  genderOptions: SearchableOption[] = [];
  rolesOptions: MultiSelectOption[] = [];
  branchesOptions: MultiSelectOption[] = [];
  warehousesOptions: MultiSelectOption[] = [];
  managersOptions: SearchableOption[] = [];
  countriesOptions: SearchableOption[] = [];
  banksOptions: SearchableOption[] = [];
  sectorsOptions: SearchableOption[] = [];
  departmentsOptions: SearchableOption[] = [];
  sectionsOptions: SearchableOption[] = [];
  jobTitlesOptions: SearchableOption[] = [];
  locationsOptions: SearchableOption[] = [];

  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  deletedPhoto: string | null = null;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isViewMode = this.route.snapshot.url.some(segment => segment.path === 'view') || this.router.url.includes('/view/');

    this.initForm();

    if (this.id) {
      this.loadUser();
    } else {
      this.userService.getNextCode().subscribe(res => {
        this.basicForm.patchValue({ code: res.nextCode });
      });
    }

    this.loadLookups();
    this.updateGenderOptions();
    this.translate.onLangChange.subscribe(() => {
      this.updateGenderOptions();
    });
  }

  private updateGenderOptions(): void {
    this.genderOptions = [
      { value: 'Male', label: this.translate.instant('users.employment.male') },
      { value: 'Female', label: this.translate.instant('users.employment.female') }
    ];
  }

  toStringArray(values: any): string[] {
    if (!values) return [];
    const arr = Array.isArray(values) ? values : [values];
    return arr.map(v => v?.toString() ?? '');
  }

  private loadLookups(): void {
    this.lookupService.getRoles().subscribe(res => {
      this.rolesOptions = res.map(r => ({ value: r.id, text: `[${r.code}] ${r.name}` }));
    });
    this.lookupService.getBranches().subscribe(res => {
      this.branchesOptions = res.map(b => ({ value: b.id.toString(), text: b.name }));
    });
    this.lookupService.getUsers().subscribe(res => {
      this.managersOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getCountries().subscribe(res => {
      this.countriesOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getBanks().subscribe(res => {
      this.banksOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getSectors().subscribe(res => {
      this.sectorsOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getDepartments().subscribe(res => {
      this.departmentsOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getSections().subscribe(res => {
      this.sectionsOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getJobTitles().subscribe(res => {
      this.jobTitlesOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
    this.lookupService.getLocations().subscribe(res => {
      this.locationsOptions = res.map(r => ({ value: r.id, label: r.name }));
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        code: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        firstAName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        lastAName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        firstEName: [{ value: '', disabled: this.isViewMode }],
        lastEName: [{ value: '', disabled: this.isViewMode }],
        email: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.email]],
        password: [{ value: '', disabled: this.isViewMode }, !this.id ? [Validators.required] : []],
        confirmPassword: [{ value: '', disabled: this.isViewMode }, !this.id ? [Validators.required] : []],
        isActive: [{ value: true, disabled: this.isViewMode }],
        changePassword: [{ value: false, disabled: this.isViewMode }],
        lockAccess: [{ value: false, disabled: this.isViewMode }],
        isPosOnly: [{ value: false, disabled: this.isViewMode }],
        defaultLandingPage: [{ value: 'dashboard', disabled: this.isViewMode }],
        notes: [{ value: '', disabled: this.isViewMode }],
        roles: [{ value: [], disabled: this.isViewMode }, [Validators.required, Validators.minLength(1)]],
        branchIds: [{ value: [], disabled: this.isViewMode }, [Validators.required, Validators.minLength(1)]],
        warehouseIds: [{ value: [], disabled: this.isViewMode }, [Validators.required, Validators.minLength(1)]]
      }, { validators: this.passwordMatchValidator }),
      employment: this.fb.group({
        managerId: [{ value: null, disabled: this.isViewMode }],
        jobTitleId: [{ value: null, disabled: this.isViewMode }],
        hardAnnualLeave: [{ value: 0, disabled: this.isViewMode }, [Validators.min(0)]],
        balanceDueDate: [{ value: '', disabled: this.isViewMode }],
        haveBalance: [{ value: false, disabled: this.isViewMode }],
        birthDate: [{ value: '', disabled: this.isViewMode }],
        gender: [{ value: 'Male', disabled: this.isViewMode }],
        nationalityId: [{ value: null, disabled: this.isViewMode }],
        nationalId: [{ value: '', disabled: this.isViewMode }],
        passportNumber: [{ value: '', disabled: this.isViewMode }],
        addressLine1: [{ value: '', disabled: this.isViewMode }],
        addressLine2: [{ value: '', disabled: this.isViewMode }],
        city: [{ value: '', disabled: this.isViewMode }],
        governorate: [{ value: '', disabled: this.isViewMode }],
        postalCode: [{ value: '', disabled: this.isViewMode }],
        country: [{ value: '', disabled: this.isViewMode }],
        bankId: [{ value: null, disabled: this.isViewMode }],
        bankAccount: [{ value: '', disabled: this.isViewMode }],
        socialInsurance: [{ value: '', disabled: this.isViewMode }],
        medicalInsurance: [{ value: '', disabled: this.isViewMode }],
        sectorId: [{ value: null, disabled: this.isViewMode }],
        departmentId: [{ value: null, disabled: this.isViewMode }],
        sectionId: [{ value: null, disabled: this.isViewMode }],
        locationId: [{ value: null, disabled: this.isViewMode }],
        isDeployed: [{ value: false, disabled: this.isViewMode }],
        additionalInfo: [{ value: '', disabled: this.isViewMode }]
      })
    });

    // Reactive listener for POS Only toggle
    this.basicForm.get('isPosOnly')?.valueChanges.subscribe((isPos: boolean) => {
      if (isPos) {
        this.basicForm.patchValue({ defaultLandingPage: 'pos' }, { emitEvent: false });
      } else {
        if (this.basicForm.get('defaultLandingPage')?.value === 'pos') {
          this.basicForm.patchValue({ defaultLandingPage: 'dashboard' }, { emitEvent: false });
        }
      }
    });

    // Reactive branch change listener to dynamically filter available warehouses
    this.basicForm.get('branchIds')?.valueChanges.subscribe((selectedBranchIds: any[]) => {
      const rawBranchIds = selectedBranchIds ? (Array.isArray(selectedBranchIds) ? selectedBranchIds : [selectedBranchIds]) : [];
      const branchIds = rawBranchIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
      if (branchIds.length > 0) {
        this.lookupService.getWarehousesByBranches(branchIds).subscribe(res => {
          this.warehousesOptions = res.map(w => ({ value: w.id.toString(), text: w.name }));
          const validWarehouseIds = res.map(w => w.id);
          const currentWarehouseIds: any[] = this.basicForm.get('warehouseIds')?.value || [];
          const filteredWarehouseIds = currentWarehouseIds.filter(id => validWarehouseIds.includes(Number(id)));
          if (filteredWarehouseIds.length !== currentWarehouseIds.length) {
            this.basicForm.patchValue({ warehouseIds: filteredWarehouseIds }, { emitEvent: false });
          }
        });
      } else {
        this.warehousesOptions = [];
        this.basicForm.patchValue({ warehouseIds: [] }, { emitEvent: false });
      }
    });

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if (pass || confirmPass) {
      return pass === confirmPass ? null : { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  get basicForm(): FormGroup {
    return this.form.get('basic') as FormGroup;
  }

  get employmentForm(): FormGroup {
    return this.form.get('employment') as FormGroup;
  }

  loadUser(): void {
    this.loading = true;
    this.userService.get(this.id!).subscribe({
      next: (user: UserResponse) => {
        const isPos = user.defaultLandingPage === 'pos' || user.isPosOnly === true;
        this.basicForm.patchValue({
          code: user.code,
          firstAName: user.firstAName,
          lastAName: user.lastAName,
          firstEName: user.firstEName,
          lastEName: user.lastEName,
          email: user.email,
          isActive: user.isActive,
          changePassword: user.changePassword,
          lockAccess: user.lockAccess,
          isPosOnly: isPos,
          defaultLandingPage: user.defaultLandingPage || (isPos ? 'pos' : 'dashboard'),
          notes: user.notes,
          roles: user.roles,
          branchIds: user.branchIds || [],
          warehouseIds: user.warehouseIds || []
        });

        if (user.branchIds && user.branchIds.length > 0) {
          this.lookupService.getWarehousesByBranches(user.branchIds).subscribe(res => {
            this.warehousesOptions = res.map(w => ({ value: w.id.toString(), text: w.name }));
          });
        }

        if (user.photoPath) {
          this.photoPreview = user.photoPath.startsWith('http')
            ? user.photoPath
            : `${this.configService.apiUrl}${user.photoPath.startsWith('/') ? '' : '/'}${user.photoPath}`;
        }

        if (user.userEmploymentInfo) {
          const emp = user.userEmploymentInfo;
          this.employmentForm.patchValue({
            managerId: emp.managerId,
            jobTitleId: emp.jobTitleId,
            hardAnnualLeave: emp.hardAnnualLeave,
            balanceDueDate: emp.balanceDueDate,
            haveBalance: emp.haveBalance,
            birthDate: emp.birthDate,
            gender: emp.gender,
            nationalityId: emp.nationalityId,
            nationalId: emp.nationalId,
            passportNumber: emp.passportNumber,
            addressLine1: emp.addressLine1,
            addressLine2: emp.addressLine2,
            city: emp.city,
            governorate: emp.governorate,
            postalCode: emp.postalCode,
            country: emp.country,
            bankId: emp.bankId,
            bankAccount: emp.bankAccount,
            socialInsurance: emp.socialInsurance,
            medicalInsurance: emp.medicalInsurance,
            sectorId: emp.sectorId,
            departmentId: emp.departmentId,
            sectionId: emp.sectionId,
            locationId: emp.locationId,
            isDeployed: emp.isDeployed,
            additionalInfo: emp.additionalInfo
          });
        }

        setTimeout(() => this.form.markAsPristine(), 0);
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
        this.loading = false;
      }
    });
  }

  onFileChange(event: Event): void {
    if (this.isViewMode) return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhoto = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedPhoto);
      this.form.markAsDirty();
    }
  }

  removePhoto(): void {
    if (this.isViewMode) return;
    this.selectedPhoto = null;
    this.photoPreview = null;
    if (this.id) {
      this.deletedPhoto = "true";
    }
    this.form.markAsDirty();
  }

  hasUnsavedChanges(): Observable<boolean> | boolean {
    if (this.successMode || this.isViewMode) return false;
    return this.form.dirty;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationErrors = this.getFormValidationErrors();
      return;
    }

    this.saving = true;
    this.validationErrors = [];
    const bValue = this.basicForm.value;
    const eValue = this.employmentForm.value;

    const empInfo: UserEmploymentInfoRequest = {
      userId: this.id || '', // Handled properly on backend
      managerId: eValue.managerId,
      jobTitleId: eValue.jobTitleId,
      hardAnnualLeave: eValue.hardAnnualLeave,
      balanceDueDate: eValue.balanceDueDate || null,
      haveBalance: eValue.haveBalance,
      birthDate: eValue.birthDate,
      gender: eValue.gender,
      nationalityId: eValue.nationalityId,
      nationalId: eValue.nationalId,
      passportNumber: eValue.passportNumber,
      addressLine1: eValue.addressLine1,
      addressLine2: eValue.addressLine2,
      city: eValue.city,
      governorate: eValue.governorate,
      postalCode: eValue.postalCode,
      country: eValue.country,
      bankId: eValue.bankId,
      bankAccount: eValue.bankAccount,
      socialInsurance: eValue.socialInsurance,
      medicalInsurance: eValue.medicalInsurance,
      sectorId: eValue.sectorId,
      departmentId: eValue.departmentId,
      sectionId: eValue.sectionId,
      locationId: eValue.locationId,
      isDeployed: eValue.isDeployed,
      additionalInfo: eValue.additionalInfo
    };

    // Ensure arrays are properly extracted and converted
    const rolesArray = bValue.roles ? (Array.isArray(bValue.roles) ? bValue.roles : [bValue.roles]) : [];
    const branchIdsArray = bValue.branchIds ? (Array.isArray(bValue.branchIds) ? bValue.branchIds.map(Number) : [Number(bValue.branchIds)]) : [];
    const warehouseIdsArray = bValue.warehouseIds ? (Array.isArray(bValue.warehouseIds) ? bValue.warehouseIds.map(Number) : [Number(bValue.warehouseIds)]) : [];

    let requestData: any = {
      code: bValue.code,
      firstAName: bValue.firstAName,
      lastAName: bValue.lastAName,
      firstEName: bValue.firstEName || '',
      lastEName: bValue.lastEName || '',
      email: bValue.email,
      isActive: bValue.isActive,
      changePassword: bValue.changePassword,
      lockAccess: bValue.lockAccess,
      isPosOnly: bValue.isPosOnly,
      defaultLandingPage: bValue.isPosOnly ? 'pos' : (bValue.defaultLandingPage || 'dashboard'),
      notes: bValue.notes,
      roles: rolesArray,
      branchIds: branchIdsArray,
      warehouseIds: warehouseIdsArray,
      userEmploymentInfo: empInfo
    };

    if (bValue.password) {
      requestData.password = bValue.password;
    }

    if (this.selectedPhoto) {
      requestData.photo = this.selectedPhoto;
    }

    if (this.deletedPhoto) {
      requestData.deletedPhoto = this.deletedPhoto;
    }

    if (this.id) {
      this.userService.update(this.id, requestData as UserRequest).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: (err: any) => {
          this.saving = false;
          if (err?.error?.errors) {
            this.validationErrors = Array.isArray(err.error.errors)
              ? err.error.errors.map((e: any) => e.errorMessage || e.description || JSON.stringify(e))
              : Object.values(err.error.errors).flat() as string[];
          } else if (err?.error?.message) {
            this.validationErrors = [err.error.message];
          } else {
            this.validationErrors = [this.translate.instant('common.errorSavingData') || 'Error saving data'];
          }
        }
      });
    } else {
      this.userService.create(requestData as UserRequest).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: (err: any) => {
          this.saving = false;
          if (err?.error?.errors) {
            this.validationErrors = Array.isArray(err.error.errors)
              ? err.error.errors.map((e: any) => e.errorMessage || e.description || JSON.stringify(e))
              : Object.values(err.error.errors).flat() as string[];
          } else if (err?.error?.message) {
            this.validationErrors = [err.error.message];
          } else {
            this.validationErrors = [this.translate.instant('common.errorSavingData') || 'Error saving data'];
          }
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/administration/users']);
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const controls = { ...this.basicForm.controls, ...this.employmentForm.controls } as any;

    Object.keys(controls).forEach(key => {
      const controlErrors = controls[key].errors;
      if (controlErrors != null) {
        let fieldName = '';
        if (this.basicForm.contains(key)) fieldName = this.translate.instant(`users.fields.${key}`);
        else fieldName = this.translate.instant(`users.employment.${key}`);

        if (key === 'roles' && (controlErrors['required'] || controlErrors['minlength'])) {
          errors.push(this.translate.instant('users.errors.rolesRequired') || 'At least one role must be selected');
        } else if (key === 'branchIds' && (controlErrors['required'] || controlErrors['minlength'])) {
          errors.push(this.translate.instant('users.errors.branchesRequired') || 'At least one branch must be selected');
        } else if (key === 'warehouseIds' && (controlErrors['required'] || controlErrors['minlength'])) {
          errors.push(this.translate.instant('users.errors.warehousesRequired') || 'At least one warehouse must be selected');
        } else if (controlErrors['required']) {
          errors.push(this.translate.instant('common.fieldRequired', { field: fieldName }) || `The ${fieldName} field is required`);
        } else if (controlErrors['email']) {
          errors.push(this.translate.instant('common.invalidEmail', { field: fieldName }) || `The ${fieldName} field has an invalid email format`);
        } else {
          errors.push(this.translate.instant('common.invalidField', { field: fieldName }) || `The ${fieldName} field is invalid`);
        }
      }
    });

    if (this.basicForm.hasError('passwordMismatch')) {
      errors.push(this.translate.instant('users.errors.passwordMismatch') || 'Passwords do not match');
    }

    return errors;
  }
}
