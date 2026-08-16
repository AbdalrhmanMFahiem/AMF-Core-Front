export interface ConfigPaymentRequest {
  autoApprovePayments: boolean;
  allowOverAllocation: boolean;
  notes?: string | null;
}

export interface ConfigPaymentResponse {
  id: number;
  autoApprovePayments: boolean;
  allowOverAllocation: boolean;
  notes: string;
}
