import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfigGeneralResponse {
  enableSapIntegration: boolean;
  defaultActivationOnCreate: boolean;
  allowManualWorkorders: boolean;
  addingWorkordersToSAP: boolean;
  enableLocalization: boolean;
  autoFillEnglishName: boolean;
  notes?: string;
}

export interface ConfigGeneralRequest {
  enableSapIntegration: boolean;
  defaultActivationOnCreate: boolean;
  allowManualWorkorders: boolean;
  addingWorkordersToSAP: boolean;
  enableLocalization: boolean;
  autoFillEnglishName: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/configuration/general`;

  getSettings(): Observable<ConfigGeneralResponse> {
    return this.http.get<ConfigGeneralResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigGeneralRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }
}
