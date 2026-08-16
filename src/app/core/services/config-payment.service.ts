import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfigPaymentRequest, ConfigPaymentResponse } from '../models/config-payment.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigPaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/configuration/payments`;

  getSettings(): Observable<ConfigPaymentResponse> {
    return this.http.get<ConfigPaymentResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigPaymentRequest): Observable<ConfigPaymentResponse> {
    return this.http.put<ConfigPaymentResponse>(this.apiUrl, request);
  }
}
