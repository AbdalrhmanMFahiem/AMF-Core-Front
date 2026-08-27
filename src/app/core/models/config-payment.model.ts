export enum CommissionCalculationMode {
  DeductFromAmount = 1, // خصم من أصل المبلغ (الصافي = المبلغ - العمولة)
  AddOnTop = 2          // إضافة فوق المبلغ (الإجمالي = المبلغ + العمولة)
}

export interface ConfigPaymentRequest {
  autoApprovePayments: boolean;
  allowOverAllocation: boolean;
  commissionMode?: CommissionCalculationMode;
  notes?: string | null;
}

export interface ConfigPaymentResponse {
  id: number;
  autoApprovePayments: boolean;
  allowOverAllocation: boolean;
  commissionMode: CommissionCalculationMode;
  notes: string;
}
