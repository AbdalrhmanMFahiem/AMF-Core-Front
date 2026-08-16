import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { BusinessPartnerService } from '../../../../core/services/business-partner.service';
import { BusinessPartnerRequest, LedgerEntryType } from '../../../../core/models/business-partner.model';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { CountryService } from '../../../../core/services/country.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { IdNameResponse } from '../../../../core/models/lookup.model';
@Component({
  selector: 'app-business-partner-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComponentCardComponent, PageBreadcrumbComponent, SuccessRedirectBannerComponent, ErrorBannerComponent, DatePickerComponent, SearchableSelectComponent],
  templateUrl: './business-partner-form.component.html',
})
export class BusinessPartnerFormComponent implements OnInit {
  private businessPartnerService = inject(BusinessPartnerService);
  private countryService = inject(CountryService);
  private lookupService = inject(LookupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private location = inject(Location);



  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];

  model: BusinessPartnerRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    notes: '',
    isActive: true,
    isCustomer: true,
    isVendor: false,
    phone: '',
    email: '',
    address: '',
    countryId: null,
    governorateId: null,
    cityId: null,
    districtId: null
  };

  countries: SearchableOption[] = [];
  governorates: SearchableOption[] = [];
  cities: SearchableOption[] = [];
  districts: SearchableOption[] = [];
  users: SearchableOption[] = [];

  activeTab: 'basic' | 'ledger' | 'openingBalance' | 'salesReps' = 'basic';
  ledgerData: any[] = []; // BusinessPartnerLedgerResponse
  loadingLedger = false;
  totalLedgerRecords = 0;
  ledgerTotalPages = 1;
  ledgerHasNextPage = false;
  ledgerHasPreviousPage = false;
  ledgerFilters: any = {
    pageNumber: 1,
    pageSize: 10,
    from: undefined,
    to: undefined,
    entryType: undefined
  };
  ledgerEntryType = LedgerEntryType;
  public ledgerFiltersEntryType: SearchableOption[] = [];

  openingBalanceModel: any = { amount: 0, date: null };
  obType: 'debit' | 'credit' = 'debit';
  savingOpeningBalance = false;
  openingBalanceSuccess = false;

  salesReps: any[] = [];
  loadingSalesReps = false;
  savingSalesRep = false;
  primarySalesRepUserId: string | null = null;
  salesRepModel: any = { userId: null, assignmentDate: null, isPrimary: false, commissionPercentage: null };

  ngOnInit(): void {
    this.initializeLedgerFiltersEntryType();

    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadBusinessPartner(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
    this.loadCountries();
    this.loadUsers();
  }

  loadBusinessPartner(id: number): void {
    this.loading = true;
    this.businessPartnerService.get(id).subscribe({
      next: (res) => {
        this.model = {
          ...res,
          eName: res.eName || '',
          notes: res.notes || '',
          phone: res.phone || '',
          email: res.email || '',
          address: res.address || '',
          countryId: res.countryId,
          governorateId: res.governorateId,
          cityId: res.cityId,
          districtId: res.districtId
        };
        if (this.model.countryId) this.loadGovernorates(this.model.countryId);
        if (this.model.governorateId) this.loadCities(this.model.governorateId);
        if (this.model.cityId) this.loadDistricts(this.model.cityId);
        this.loading = false;
        this.loadLedger();
        this.loadSalesReps();
      },
      error: () => this.loading = false
    });
  }

  loadCountries(): void {
    this.lookupService.getCountries().subscribe({
      next: (res) => this.countries = res.map(x => ({ value: x.id, label: x.name }))
    });
  }

  loadGovernorates(countryId: number): void {
    this.governorates = [];
    this.cities = [];
    this.districts = [];
    this.lookupService.getGovernoratesByCountry(countryId).subscribe({
      next: (res) => this.governorates = res.map(x => ({ value: x.id, label: x.name }))
    });
  }

  loadCities(governorateId: number): void {
    this.cities = [];
    this.districts = [];
    this.lookupService.getCitiesByGovernorate(governorateId).subscribe({
      next: (res) => this.cities = res.map(x => ({ value: x.id, label: x.name }))
    });
  }

  loadDistricts(cityId: number): void {
    this.districts = [];
    this.lookupService.getDistrictsByCity(cityId).subscribe({
      next: (res) => this.districts = res.map(x => ({ value: x.id, label: x.name }))
    });
  }

  loadUsers(): void {
    this.lookupService.getUsers().subscribe({
      next: (res) => this.users = res.map(x => ({ value: x.id, label: x.name }))
    });
  }

  onCountryChange(): void {
    this.model.governorateId = null;
    this.model.cityId = null;
    this.model.districtId = null;
    if (this.model.countryId) {
      this.loadGovernorates(this.model.countryId);
    } else {
      this.governorates = [];
      this.cities = [];
      this.districts = [];
    }
  }

  onGovernorateChange(): void {
    this.model.cityId = null;
    this.model.districtId = null;
    if (this.model.governorateId) {
      this.loadCities(this.model.governorateId);
    } else {
      this.cities = [];
      this.districts = [];
    }
  }

  onCityChange(): void {
    this.model.districtId = null;
    if (this.model.cityId) {
      this.loadDistricts(this.model.cityId);
    } else {
      this.districts = [];
    }
  }

  loadLedger(): void {
    if (!this.id) return;
    this.loadingLedger = true;
    this.businessPartnerService.getLedger(this.id, this.ledgerFilters).subscribe({
      next: (res) => {
        this.ledgerData = res.items;
        this.totalLedgerRecords = res.totalRecords;
        this.ledgerTotalPages = res.totalPages;
        this.ledgerHasNextPage = res.hasNextPage;
        this.ledgerHasPreviousPage = res.hasPreviousPage;
        
        // Extract existing opening balance if it's the only record (or we want to show it anyway)
        if (this.ledgerData.length > 0) {
           const obRecord = this.ledgerData.find(x => x.entryType === LedgerEntryType.OpeningBalance);
           if (obRecord) {
              this.openingBalanceModel.amount = Math.abs(obRecord.amount);
              this.openingBalanceModel.date = obRecord.entryDate;
              this.obType = obRecord.amount >= 0 ? 'debit' : 'credit';
           }
        }

        this.loadingLedger = false;
      },
      error: () => {
        this.loadingLedger = false;
      }
    });
  }

  onLedgerPageChange(pageNumber: number): void {
    this.ledgerFilters.pageNumber = pageNumber;
    this.loadLedger();
  }

  onLedgerPageSizeChange(pageSize: number): void {
    this.ledgerFilters.pageSize = pageSize;
    this.ledgerFilters.pageNumber = 1;
    this.loadLedger();
  }

  applyLedgerFilter(): void {
    this.ledgerFilters.pageNumber = 1;
    this.loadLedger();
  }

  clearLedgerFilter(): void {
    this.ledgerFilters = {
      pageNumber: 1,
      pageSize: 10,
      from: undefined,
      to: undefined,
      entryType: undefined
    };
    this.loadLedger();
  }

  setTab(tab: 'basic' | 'ledger' | 'openingBalance' | 'salesReps'): void {
    this.activeTab = tab;
  }
  
  getAbs(val: number): number {
    return Math.abs(val || 0);
  }

  getEntryTypeName(type: string | number): string {
    if (typeof type === 'string') {
      const key = type.charAt(0).toLowerCase() + type.slice(1);
      return `ledger.typeEnum.${key}`;
    }
    const map: Record<number, string> = {
      1: 'ledger.typeEnum.invoice',
      2: 'ledger.typeEnum.return',
      3: 'ledger.typeEnum.payment',
      4: 'ledger.typeEnum.adjustment',
      5: 'ledger.typeEnum.openingBalance'
    };
    return map[type] || `ledger.typeEnum.${type}`;
  }

  submitOpeningBalance(): void {
    if (!this.id || !this.openingBalanceModel.amount) return;
    this.savingOpeningBalance = true;
    this.validationErrors = [];
    
    // Apply sign based on obType
    const payload = {
       ...this.openingBalanceModel,
       amount: this.obType === 'credit' ? -Math.abs(this.openingBalanceModel.amount) : Math.abs(this.openingBalanceModel.amount)
    };

    this.businessPartnerService.addOpeningBalance(this.id, payload).subscribe({
      next: () => {
        this.savingOpeningBalance = false;
        this.openingBalanceSuccess = true;
        setTimeout(() => this.openingBalanceSuccess = false, 3000);
        this.loadLedger(); // Refresh ledger
      },
      error: (err: any) => {
        this.savingOpeningBalance = false;
      }
    });
  }

  loadSalesReps(): void {
    if (!this.id) return;
    this.loadingSalesReps = true;
    this.businessPartnerService.getSalesReps(this.id).subscribe({
      next: (res: any[]) => {
        this.salesReps = res;
        this.loadingSalesReps = false;
        const primary = this.salesReps.find(x => x.isPrimary && !x.endDate);
        if (primary) {
          this.primarySalesRepUserId = primary.userId;
        }
      },
      error: () => this.loadingSalesReps = false
    });
  }

  onPrimarySalesRepChange(userId: string): void {
    if (!this.id || !userId) return;
    const existing = this.salesReps.find(x => x.userId === userId && !x.endDate);
    const payload = {
      userId: userId,
      assignmentDate: existing?.assignmentDate || new Date().toISOString(),
      isPrimary: true,
      salesRole: existing?.salesRole || null,
      commissionPercentage: existing?.commissionPercentage || null
    };
    this.businessPartnerService.assignSalesRep(this.id, payload).subscribe({
      next: () => this.loadSalesReps()
    });
  }

  addSalesRep(): void {
    if (!this.id || !this.salesRepModel.userId || !this.salesRepModel.assignmentDate) return;
    this.savingSalesRep = true;
    this.businessPartnerService.assignSalesRep(this.id, this.salesRepModel).subscribe({
      next: () => {
        this.savingSalesRep = false;
        this.salesRepModel = { userId: null, assignmentDate: null, isPrimary: false, commissionPercentage: null };
        this.loadSalesReps();
      },
      error: () => {
        this.savingSalesRep = false;
      }
    });
  }

  removeSalesRep(repId: number): void {
    if (!this.id) return;
    if (confirm(this.translate.instant('common.confirmDelete'))) {
      this.businessPartnerService.removeSalesRep(this.id, repId).subscribe({
        next: () => this.loadSalesReps()
      });
    }
  }

  onTypeChange(): void {
    if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  getNextCode(): void {
    this.businessPartnerService.getNextCode(this.model.isCustomer, this.model.isVendor).subscribe(res => {
      if (res && res.nextCode) {
        this.model.code = res.nextCode;
      }
    });
  }

  validate(): boolean {
    this.validationErrors = [];
    let isValid = true;

    if (!this.model.code) {
      this.validationErrors.push(`${this.translate.instant('common.code')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }
    if (!this.model.aName) {
      this.validationErrors.push(`${this.translate.instant('common.arabicName')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    return isValid;
  }

  onSubmit(stay: boolean = false): void {
    if (this.mode === 'view' || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: (res: any) => {
        this.saving = false;
        if (stay) {
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
          if (this.mode === 'add' && res && res.id) {
            this.id = res.id;
            this.mode = 'edit';
            this.location.replaceState(`/master-data/business-partners/edit/${this.id}`);
            this.loadBusinessPartner(this.id!);
          } else if (this.mode === 'edit' && this.id) {
            this.loadBusinessPartner(this.id!);
          }
        } else {
          this.saveSuccess = true;
        }
      },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) {
          this.validationErrors = [err.error.message];
        } else if (err?.error?.errors) {
          if (Array.isArray(err.error.errors)) {
            this.validationErrors = err.error.errors.map((e: any) => e.description || e.errorMessage || (typeof e === 'string' ? e : JSON.stringify(e)));
          } else {
            this.validationErrors = Object.values(err.error.errors).flat() as string[];
          }
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    };

    if (this.mode === 'add') {
      const createModel = { ...this.model };
      if (createModel.openingBalance) {
         createModel.openingBalance = this.obType === 'credit' ? -Math.abs(createModel.openingBalance) : Math.abs(createModel.openingBalance);
      }
      this.businessPartnerService.create(createModel).subscribe(observer);
    } else {
      this.businessPartnerService.update(this.id!, this.model).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/master-data/business-partners']);
  }

  private initializeLedgerFiltersEntryType(): void {
    this.updateLedgerFiltersEntryType();
    this.translate.onLangChange.subscribe(() => {
      this.updateLedgerFiltersEntryType();
    });
  }

  private updateLedgerFiltersEntryType(): void {
    this.translate.get([
      'ledger.typeEnum.payment',
      'ledger.typeEnum.adjustment',
      'ledger.typeEnum.invoice',
      'ledger.typeEnum.return',
      'ledger.typeEnum.openingBalance'
    ]).subscribe(res => {
      this.ledgerFiltersEntryType = [
        { value: LedgerEntryType.Payment, label: res['ledger.typeEnum.payment'] },
        { value: LedgerEntryType.Adjustment, label: res['ledger.typeEnum.adjustment'] },
        { value: LedgerEntryType.Invoice, label: res['ledger.typeEnum.invoice'] },
        { value: LedgerEntryType.Return, label: res['ledger.typeEnum.return'] },
        { value: LedgerEntryType.OpeningBalance, label: res['ledger.typeEnum.openingBalance'] },
      ];
    });
  }

}
