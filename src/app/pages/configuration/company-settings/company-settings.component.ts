import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanySettingService } from '../../../core/services/company-setting.service';
import { ToastrService } from 'ngx-toastr';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { LookupService } from '../../../core/services/lookup.service';
import { IdNameResponse } from '../../../core/models/lookup.model';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, PageBreadcrumbComponent, ButtonComponent, LabelComponent, InputFieldComponent, ModalComponent],
  templateUrl: './company-settings.component.html'
})
export class CompanySettingsComponent implements OnInit {
  private companySettingService = inject(CompanySettingService);
  private lookupService = inject(LookupService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  logoFile: File | null = null;
  iconFile: File | null = null;
  currentLogoUrl: string | null = null;
  currentIconUrl: string | null = null;
  isOpen = false;
  
  settings: any = {};

  countries: IdNameResponse[] = [];
  governorates: IdNameResponse[] = [];
  cities: IdNameResponse[] = [];
  districts: IdNameResponse[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  openModal(): void {
    this.form.patchValue(this.settings);
    if (this.settings.defaultCountryId) this.loadGovernorates(this.settings.defaultCountryId);
    if (this.settings.defaultGovernorateId) this.loadCities(this.settings.defaultGovernorateId);
    if (this.settings.defaultCityId) this.loadDistricts(this.settings.defaultCityId);
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
    this.logoFile = null;
    this.iconFile = null;
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      companyCode: [{ value: '', disabled: true }],
      companyAName: ['', Validators.required],
      companyEName: [''],
      registrationNumber: [''],
      taxNumber: [''],
      address: [''],
      defaultCountryId: [null],
      defaultGovernorateId: [null],
      defaultCityId: [null],
      defaultDistrictId: [null],
      phoneNumber: [''],
      email: [''],
      website: [''],
      logoPath: ['']
    });
    this.loadCountries();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.companySettingService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          const data = (res as any).value || res;
          this.settings = { ...data };
          
          this.form.patchValue({
            id: data.id,
            companyCode: data.companyCode,
            companyAName: data.companyAName,
            companyEName: data.companyEName,
            registrationNumber: data.registrationNumber,
            taxNumber: data.taxNumber,
            address: data.address,
            defaultCountryId: data.defaultCountryId,
            defaultGovernorateId: data.defaultGovernorateId,
            defaultCityId: data.defaultCityId,
            defaultDistrictId: data.defaultDistrictId,
            phoneNumber: data.phoneNumber,
            email: data.email,
            website: data.website,
            logoPath: data.logoPath
          });

          if (data.logoBinary) {
            this.currentLogoUrl = 'data:image/png;base64,' + data.logoBinary;
          }
          if (data.iconBinary) {
            this.currentIconUrl = 'data:image/png;base64,' + data.iconBinary;
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

  loadCountries(): void {
    this.lookupService.getCountries().subscribe({
      next: (res) => this.countries = res
    });
  }

  loadGovernorates(countryId: number): void {
    this.governorates = [];
    this.cities = [];
    this.districts = [];
    this.lookupService.getGovernoratesByCountry(countryId).subscribe({
      next: (res) => this.governorates = res
    });
  }

  loadCities(governorateId: number): void {
    this.cities = [];
    this.districts = [];
    this.lookupService.getCitiesByGovernorate(governorateId).subscribe({
      next: (res) => this.cities = res
    });
  }

  loadDistricts(cityId: number): void {
    this.districts = [];
    this.lookupService.getDistrictsByCity(cityId).subscribe({
      next: (res) => this.districts = res
    });
  }

  onCountryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const val = target.value ? parseInt(target.value) : null;
    this.form.patchValue({ defaultGovernorateId: null, defaultCityId: null, defaultDistrictId: null });
    if (val) {
      this.loadGovernorates(val);
    } else {
      this.governorates = [];
      this.cities = [];
      this.districts = [];
    }
  }

  onGovernorateChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const val = target.value ? parseInt(target.value) : null;
    this.form.patchValue({ defaultCityId: null, defaultDistrictId: null });
    if (val) {
      this.loadCities(val);
    } else {
      this.cities = [];
      this.districts = [];
    }
  }

  onCityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const val = target.value ? parseInt(target.value) : null;
    this.form.patchValue({ defaultDistrictId: null });
    if (val) {
      this.loadDistricts(val);
    } else {
      this.districts = [];
    }
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
        this.closeModal();
        this.loadSettings();
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('common.errorSavingData'));
        this.isSaving = false;
      }
    });
  }
}
