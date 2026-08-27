import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { Observable } from 'rxjs';
import { AthanDto, AthanSettingsDto } from '../models/athan.models';

@Injectable({
  providedIn: 'root'
})
export class AthanService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/athan`; }

  getDefaultSettings(): Observable<AthanSettingsDto> {
    return this.http.get<AthanSettingsDto>(`${this.apiUrl}/settings/default`);
  }

  getTimes(city: string, country: string, method?: number): Observable<AthanDto[]> {
    let params = new HttpParams()
      .set('city', city)
      .set('country', country);

    if (method !== undefined) {
      params = params.set('method', method);
    }

    return this.http.get<AthanDto[]>(`${this.apiUrl}/times`, { params });
  }
}
