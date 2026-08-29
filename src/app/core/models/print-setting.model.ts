export interface PrintSettingResponse {
  id: number;

  // General & Branding Options
  showLogo: boolean;
  showCompanyName: boolean;
  showTaxNumber: boolean;
  showRegistrationNumber: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;

  // Thermal POS Receipt Specific Configuration
  receiptHeaderTitle: string;
  receiptHeaderSubtitle?: string | null;
  receiptFooterMessage: string;
  receiptReturnPolicy?: string | null;
  receiptShowCustomer: boolean;
  receiptShowWarehouse: boolean;
  receiptShowSalesPersonInFooter: boolean;
  receiptShowPrintedByInFooter: boolean;
  receiptShowBarcode: boolean;
  receiptShowQrCode: boolean;
  receiptShowItemCode: boolean;
  receiptShowTaxBreakdown: boolean;
  receiptShowDiscount: boolean;
  receiptPaperWidthMm: number;

  // Standard A4 Invoice PDF Specific Configuration
  invoiceHeaderTitle?: string | null;
  invoiceFooterNotes?: string | null;
  invoiceShowPrintedByInFooter: boolean;
  invoiceShowSalesPersonInFooter: boolean;
  invoiceShowCompanyAddressInFooter: boolean;
  invoiceShowCustomerCode: boolean;
  invoiceShowWarehouse: boolean;
  invoiceShowCostElements: boolean;
  invoiceShowQrCode: boolean;
  accentColorHex: string;

  // POS Print Configuration
  posEnableThermal58: boolean;
  posEnableThermal80: boolean;
  posEnableA4: boolean;
  posAutoPreviewSingleMethod: boolean;
}

export interface PrintSettingRequest {
  showLogo: boolean;
  showCompanyName: boolean;
  showTaxNumber: boolean;
  showRegistrationNumber: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;

  receiptHeaderTitle: string;
  receiptHeaderSubtitle?: string | null;
  receiptFooterMessage: string;
  receiptReturnPolicy?: string | null;
  receiptShowCustomer: boolean;
  receiptShowWarehouse: boolean;
  receiptShowSalesPersonInFooter: boolean;
  receiptShowPrintedByInFooter: boolean;
  receiptShowBarcode: boolean;
  receiptShowQrCode: boolean;
  receiptShowItemCode: boolean;
  receiptShowTaxBreakdown: boolean;
  receiptShowDiscount: boolean;
  receiptPaperWidthMm: number;

  invoiceHeaderTitle?: string | null;
  invoiceFooterNotes?: string | null;
  invoiceShowPrintedByInFooter: boolean;
  invoiceShowSalesPersonInFooter: boolean;
  invoiceShowCompanyAddressInFooter: boolean;
  invoiceShowCustomerCode: boolean;
  invoiceShowWarehouse: boolean;
  invoiceShowCostElements: boolean;
  invoiceShowQrCode: boolean;
  accentColorHex: string;

  // POS Print Configuration
  posEnableThermal58: boolean;
  posEnableThermal80: boolean;
  posEnableA4: boolean;
  posAutoPreviewSingleMethod: boolean;
}
