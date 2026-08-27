import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

export interface ConfigDocumentResponse {
  id: number;
  autoApprovePurchaseOrders: boolean;
  autoApprovePurchaseInvoices: boolean;
  autoApproveSalesOrders: boolean;
  autoApproveSalesInvoices: boolean;
  requireStockBeforeConfirm: boolean;
  allowSaveInvoiceWithoutPayment: boolean;
  requireCostElementPercentage: boolean;
  defaultWarehouseId?: number;
  notes?: string;
}

export interface ConfigDocumentRequest {
  autoApprovePurchaseOrders: boolean;
  autoApprovePurchaseInvoices: boolean;
  autoApproveSalesOrders: boolean;
  autoApproveSalesInvoices: boolean;
  requireStockBeforeConfirm: boolean;
  allowSaveInvoiceWithoutPayment: boolean;
  requireCostElementPercentage: boolean;
  defaultWarehouseId?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigDocumentService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/configuration/document-settings`; }

  getSettings(): Observable<ConfigDocumentResponse> {
    return this.http.get<ConfigDocumentResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigDocumentRequest): Observable<ConfigDocumentResponse> {
    return this.http.put<ConfigDocumentResponse>(this.apiUrl, request);
  }
}
