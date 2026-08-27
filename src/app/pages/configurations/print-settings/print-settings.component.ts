import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PrintSettingService } from '../../../core/services/print-setting.service';
import { CompanySettingService } from '../../../core/services/company-setting.service';
import { PrintSettingResponse, PrintSettingRequest } from '../../../core/models/print-setting.model';
import { CompanySettingResponse } from '../../../core/models/company-setting.model';

@Component({
  selector: 'app-print-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './print-settings.component.html'
})
export class PrintSettingsComponent implements OnInit {
  private printSettingService = inject(PrintSettingService);
  private companySettingService = inject(CompanySettingService);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  loading: boolean = false;
  saving: boolean = false;
  activeTab: 'receipt' | 'invoice' | 'company' = 'receipt';
  previewMode: 'receipt' | 'invoice' = 'receipt';

  companyInfo: CompanySettingResponse | null = null;

  model: PrintSettingRequest = {
    showLogo: true,
    showCompanyName: true,
    showTaxNumber: true,
    showRegistrationNumber: true,
    showAddress: true,
    showPhone: true,
    showEmail: false,
    showWebsite: false,

    receiptHeaderTitle: 'إيصال استلام - نقطة بيع',
    receiptHeaderSubtitle: '',
    receiptFooterMessage: 'شكراً لتعاملكم معنا!',
    receiptReturnPolicy: 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بموجب أصل الفاتورة وبحالتها الأصلية',
    receiptShowCustomer: true,
    receiptShowWarehouse: true,
    receiptShowSalesPersonInFooter: true,
    receiptShowPrintedByInFooter: true,
    receiptShowBarcode: true,
    receiptShowQrCode: true,
    receiptShowItemCode: false,
    receiptShowTaxBreakdown: true,
    receiptShowDiscount: true,
    receiptPaperWidthMm: 80,

    invoiceHeaderTitle: '',
    invoiceFooterNotes: 'تعتبر هذه الفاتورة سنداً رسمياً معتمداً.',
    invoiceShowPrintedByInFooter: true,
    invoiceShowSalesPersonInFooter: true,
    invoiceShowCompanyAddressInFooter: true,
    invoiceShowCustomerCode: true,
    invoiceShowWarehouse: true,
    invoiceShowCostElements: true,
    invoiceShowQrCode: true,
    accentColorHex: '#1E40AF'
  };

  todayDate: Date = new Date();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.companySettingService.getSettings().subscribe({
      next: (res: CompanySettingResponse) => {
        this.companyInfo = res;
      },
      error: () => {}
    });

    this.printSettingService.getSettings().subscribe({
      next: (res: PrintSettingResponse) => {
        if (res) {
          this.model = {
            showLogo: res.showLogo ?? true,
            showCompanyName: res.showCompanyName ?? true,
            showTaxNumber: res.showTaxNumber ?? true,
            showRegistrationNumber: res.showRegistrationNumber ?? true,
            showAddress: res.showAddress ?? true,
            showPhone: res.showPhone ?? true,
            showEmail: res.showEmail ?? false,
            showWebsite: res.showWebsite ?? false,

            receiptHeaderTitle: res.receiptHeaderTitle || 'إيصال استلام - نقطة بيع',
            receiptHeaderSubtitle: res.receiptHeaderSubtitle || '',
            receiptFooterMessage: res.receiptFooterMessage || 'شكراً لتعاملكم معنا!',
            receiptReturnPolicy: res.receiptReturnPolicy || 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بموجب أصل الفاتورة وبحالتها الأصلية',
            receiptShowCustomer: res.receiptShowCustomer ?? true,
            receiptShowWarehouse: res.receiptShowWarehouse ?? true,
            receiptShowSalesPersonInFooter: res.receiptShowSalesPersonInFooter ?? true,
            receiptShowPrintedByInFooter: res.receiptShowPrintedByInFooter ?? true,
            receiptShowBarcode: res.receiptShowBarcode ?? true,
            receiptShowQrCode: res.receiptShowQrCode ?? true,
            receiptShowItemCode: res.receiptShowItemCode ?? false,
            receiptShowTaxBreakdown: res.receiptShowTaxBreakdown ?? true,
            receiptShowDiscount: res.receiptShowDiscount ?? true,
            receiptPaperWidthMm: res.receiptPaperWidthMm || 80,

            invoiceHeaderTitle: res.invoiceHeaderTitle || '',
            invoiceFooterNotes: res.invoiceFooterNotes || 'تعتبر هذه الفاتورة سنداً رسمياً معتمداً.',
            invoiceShowPrintedByInFooter: res.invoiceShowPrintedByInFooter ?? true,
            invoiceShowSalesPersonInFooter: res.invoiceShowSalesPersonInFooter ?? true,
            invoiceShowCompanyAddressInFooter: res.invoiceShowCompanyAddressInFooter ?? true,
            invoiceShowCustomerCode: res.invoiceShowCustomerCode ?? true,
            invoiceShowWarehouse: res.invoiceShowWarehouse ?? true,
            invoiceShowCostElements: res.invoiceShowCostElements ?? true,
            invoiceShowQrCode: res.invoiceShowQrCode ?? true,
            accentColorHex: res.accentColorHex || '#1E40AF'
          };
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.printSettingService.updateSettings(this.model).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success(this.translate.instant('printSettings.saveSuccess'));
      },
      error: () => {
        this.saving = false;
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  resetToDefaults(): void {
    this.model = {
      showLogo: true,
      showCompanyName: true,
      showTaxNumber: true,
      showRegistrationNumber: true,
      showAddress: true,
      showPhone: true,
      showEmail: false,
      showWebsite: false,

      receiptHeaderTitle: 'إيصال استلام - نقطة بيع',
      receiptHeaderSubtitle: '',
      receiptFooterMessage: 'شكراً لتعاملكم معنا!',
      receiptReturnPolicy: 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بموجب أصل الفاتورة وبحالتها الأصلية',
      receiptShowCustomer: true,
      receiptShowWarehouse: true,
      receiptShowSalesPersonInFooter: true,
      receiptShowPrintedByInFooter: true,
      receiptShowBarcode: true,
      receiptShowQrCode: true,
      receiptShowItemCode: false,
      receiptShowTaxBreakdown: true,
      receiptShowDiscount: true,
      receiptPaperWidthMm: 80,

      invoiceHeaderTitle: '',
      invoiceFooterNotes: 'تعتبر هذه الفاتورة سنداً رسمياً معتمداً.',
      invoiceShowPrintedByInFooter: true,
      invoiceShowSalesPersonInFooter: true,
      invoiceShowCompanyAddressInFooter: true,
      invoiceShowCustomerCode: true,
      invoiceShowWarehouse: true,
      invoiceShowCostElements: true,
      invoiceShowQrCode: true,
      accentColorHex: '#1E40AF'
    };
    this.toastr.info(this.translate.instant('printSettings.defaultsRestored'));
  }

  getCompanyName(): string {
    if (this.companyInfo) {
      return this.translate.currentLang === 'ar'
        ? (this.companyInfo.companyAName || 'AMF Core')
        : (this.companyInfo.companyEName || this.companyInfo.companyAName || 'AMF Core');
    }
    return 'AMF Core';
  }

  get companyTaxNumber(): string {
    return this.companyInfo?.taxNumber || '';
  }

  get companyPhone(): string {
    return this.companyInfo?.phoneNumber || '';
  }

  get companyAddress(): string {
    return this.companyInfo?.address || '';
  }
}
