import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfigInventoryResponse {
  allowNegativeStock: boolean;
  requireStockBeforeConfirm: boolean;
  retroactiveStockMigrationCompleted: boolean;
  valuationMethod: number;
  autoPostInventoryOnSave: boolean;
  invoicesDirectlyAffectInventory: boolean;
  notes?: string;
}

export interface ConfigInventoryRequest {
  allowNegativeStock: boolean;
  requireStockBeforeConfirm: boolean;
  valuationMethod: number;
  autoPostInventoryOnSave: boolean;
  invoicesDirectlyAffectInventory: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigInventoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/configuration/inventory`;

  getSettings(): Observable<ConfigInventoryResponse> {
    return this.http.get<ConfigInventoryResponse>(this.apiUrl);
  }

  updateSettings(request: ConfigInventoryRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }
}
