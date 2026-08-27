import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { PrintSettingResponse, PrintSettingRequest } from '../models/print-setting.model';

@Injectable({
  providedIn: 'root'
})
export class PrintSettingService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/configuration/PrintSettings`; }

  getSettings(): Observable<PrintSettingResponse> {
    return this.http.get<PrintSettingResponse>(this.apiUrl);
  }

  updateSettings(request: PrintSettingRequest): Observable<PrintSettingResponse> {
    return this.http.put<PrintSettingResponse>(this.apiUrl, request);
  }
}
