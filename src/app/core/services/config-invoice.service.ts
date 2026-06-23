import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/api/configuration/invoices`;

  getSettings(): Observable<ConfigInvoiceResponse> {
    return this.http.get<ConfigInvoiceResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigInvoiceRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }
}
