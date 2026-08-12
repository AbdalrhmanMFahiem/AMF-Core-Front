export interface ProfitabilityFilter {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: number;
  customerId?: number;
  itemId?: number;
  isManufactured?: boolean;
  invoiceType?: string;
}

export interface InvoiceLineProfitability {
  lineId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  isManufactured: boolean;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  directLineDiscount: number;
  lineDiscount?: number;
  allocatedHeaderDiscount: number;
  allocatedHeaderCost: number;
  lineNetRevenue: number;
  unitCostSnapShot: number;
  costSource: 'ItemCost' | 'LastPurchasePrice' | 'BomCost' | 'InitialPrice' | string;
  lineTotalCOGS: number;
  lineGrossProfit: number;
  profitMarginPercentage: number;
}

export interface InvoiceProfitability {
  invoiceId: number;
  code: string;
  invoiceType: string;
  invoiceDate: string;
  businessPartnerId: number;
  businessPartnerName: string;
  customerName?: string;
  warehouseId?: number;
  warehouseName: string;
  totalNetRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  profitMarginPercentage: number;
  lines: InvoiceLineProfitability[];
}
