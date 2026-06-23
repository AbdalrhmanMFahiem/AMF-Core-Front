import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanySettingService } from '../../../core/services/company-setting.service';
import { ToastrService } from 'ngx-toastr';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, PageBreadcrumbComponent, ButtonComponent, LabelComponent, InputFieldComponent],
  templateUrl: './company-settings.component.html'
})
export class CompanySettingsComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  logoFile: File | null = null;
  iconFile: File | null = null;
  currentLogoUrl: string | null = null;
  currentIconUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private companySettingService: CompanySettingService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      companyCode: [''],
      companyAName: ['', Validators.required],
      companyEName: [''],
      registrationNumber: [''],
      taxNumber: [''],
      address: [''],
      country: [''],
      phoneNumber: [''],
      email: [''],
      website: [''],
      logoPath: ['']
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.companySettingService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          this.form.patchValue({
            id: res.id,
            companyCode: res.companyCode,
            companyAName: res.companyAName,
            companyEName: res.companyEName,
            registrationNumber: res.registrationNumber,
            taxNumber: res.taxNumber,
            address: res.address,
            country: res.country,
            phoneNumber: res.phoneNumber,
            email: res.email,
            website: res.website,
            logoPath: res.logoPath
          });

          if (res.logoBinary) {
            this.currentLogoUrl = 'data:image/png;base64,' + res.logoBinary;
          }
          if (res.iconBinary) {
            this.currentIconUrl = 'data:image/png;base64,' + res.iconBinary;
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
        this.isLoading = false;
      }
    });
  }

  onLogoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentLogoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onIconChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.iconFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentIconUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const requestData = {
      ...this.form.value,
      logoBinary: this.logoFile,
      iconBinary: this.iconFile
    };

    this.companySettingService.updateSettings(requestData).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('companySettings.success'));
        this.isSaving = false;
        this.logoFile = null;
        this.iconFile = null;
        this.loadSettings();
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('common.errorSavingData'));
        this.isSaving = false;
      }
    });
  }
}
