import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserResponse, CreateUserRequest, UpdateUserRequest, UserEmploymentInfoRequest } from '../../../../core/models/user.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { LookupService } from '../../../../core/services/lookup.service';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent, DatePickerComponent, ErrorBannerComponent, ComponentCardComponent],
  templateUrl: './users-form.component.html'
})
export class UsersFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public lookupService = inject(LookupService);
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
  
  genderOptions: SearchableOption[] = [];
  
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  deletedPhoto: string | null = null;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isViewMode = this.route.snapshot.url[0].path === 'view';

    this.initForm();

    if (this.id) {
      this.loadUser();
    }

    this.updateGenderOptions();
    this.translate.onLangChange.subscribe(() => {
      this.updateGenderOptions();
    });
  }

  private updateGenderOptions(): void {
    this.genderOptions = [
      { value: 1, label: this.translate.instant('users.employment.male') },
      { value: 2, label: this.translate.instant('users.employment.female') }
    ];
  }

  initForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        code: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        firstPrimaryName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        lastPrimaryName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        firstForeignName: [{ value: '', disabled: this.isViewMode }],
        lastForeignName: [{ value: '', disabled: this.isViewMode }],
        email: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.email]],
        password: [{ value: '', disabled: this.isViewMode }],
        isActive: [{ value: true, disabled: this.isViewMode }],
        changePassword: [{ value: false, disabled: this.isViewMode }],
        lockAccess: [{ value: false, disabled: this.isViewMode }],
        notes: [{ value: '', disabled: this.isViewMode }],
        roles: [{ value: [], disabled: this.isViewMode }]
      }),
      employment: this.fb.group({
        managerId: [{ value: null, disabled: this.isViewMode }],
        jobTitleId: [{ value: null, disabled: this.isViewMode }],
        hardAnnualLeave: [{ value: 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
        balanceDueDate: [{ value: '', disabled: this.isViewMode }],
        haveBalance: [{ value: false, disabled: this.isViewMode }],
        birthDate: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
        gender: [{ value: 1, disabled: this.isViewMode }, [Validators.required]],
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
    
    if (this.isViewMode) {
      this.form.disable();
    }
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
        this.basicForm.patchValue({
          code: user.code,
          firstPrimaryName: user.firstPrimaryName,
          lastPrimaryName: user.lastPrimaryName,
          firstForeignName: user.firstForeignName,
          lastForeignName: user.lastForeignName,
          email: user.email,
          isActive: user.isActive,
          changePassword: user.changePassword,
          lockAccess: user.lockAccess,
          notes: user.notes,
          roles: user.roles
        });
        
        if (user.photoPath) {
          this.photoPreview = user.photoPath;
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

    let requestData: any = {
      code: bValue.code,
      firstPrimaryName: bValue.firstPrimaryName,
      lastPrimaryName: bValue.lastPrimaryName,
      firstForeignName: bValue.firstForeignName,
      lastForeignName: bValue.lastForeignName,
      email: bValue.email,
      isActive: bValue.isActive,
      changePassword: bValue.changePassword,
      lockAccess: bValue.lockAccess,
      notes: bValue.notes,
      roles: bValue.roles,
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
      this.userService.update(this.id, requestData as UpdateUserRequest).subscribe({
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
      this.userService.create(requestData as CreateUserRequest).subscribe({
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
        
        if (controlErrors['required']) {
          errors.push(this.translate.instant('common.fieldRequired', { field: fieldName }) || `The ${fieldName} field is required`);
        } else if (controlErrors['email']) {
          errors.push(this.translate.instant('common.invalidEmail', { field: fieldName }) || `The ${fieldName} field has an invalid email format`);
        } else {
          errors.push(this.translate.instant('common.invalidField', { field: fieldName }) || `The ${fieldName} field is invalid`);
        }
      }
    });
    return errors;
  }
}
