import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedList } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryCountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/inventory-counts`;

  getAll(pageNumber: number = 1, pageSize: number = 10, searchValue?: string): Observable<PaginatedList<any>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchValue) {
      params = params.set('searchValue', searchValue);
    }

    return this.http.get<PaginatedList<any>>(this.apiUrl, { params });
  }

  get(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<{ nextCode: string }> {
    return this.http.get<{ nextCode: string }>(`${this.apiUrl}/next-code`);
  }

  create(req: any): Observable<any> {
    return this.http.post(this.apiUrl, req);
  }

  update(id: number, req: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, req);
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
