import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

export interface ConfigInvoiceResponse {
  allowSaveInvoiceWithoutPayment: boolean;
  requireCostElementPercentage: boolean;
  notes?: string;
}

export interface ConfigInvoiceRequest {
  allowSaveInvoiceWithoutPayment: boolean;
  requireCostElementPercentage: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigInvoiceService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/configuration/invoices`; }

  getSettings(): Observable<ConfigInvoiceResponse> {
    return this.http.get<ConfigInvoiceResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigInvoiceRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }
}
