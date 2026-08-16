import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalesRepResponse, SalesRepCustomerResponse, SalesRepWarehouseResponse } from '../models/sales-rep.model';

@Injectable({
  providedIn: 'root'
})
export class SalesRepService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales-reps`;

  getAll(): Observable<SalesRepResponse[]> {
    return this.http.get<SalesRepResponse[]>(this.apiUrl);
  }

  getCustomersByRepId(userId: string): Observable<SalesRepCustomerResponse[]> {
    return this.http.get<SalesRepCustomerResponse[]>(`${this.apiUrl}/${userId}/customers`);
  }

  getWarehousesByRepId(userId: string): Observable<SalesRepWarehouseResponse[]> {
    return this.http.get<SalesRepWarehouseResponse[]>(`${this.apiUrl}/${userId}/warehouses`);
  }

  getMyCustomers(): Observable<SalesRepCustomerResponse[]> {
    return this.http.get<SalesRepCustomerResponse[]>(`${this.apiUrl}/me/customers`);
  }

  getMyWarehouses(): Observable<SalesRepWarehouseResponse[]> {
    return this.http.get<SalesRepWarehouseResponse[]>(`${this.apiUrl}/me/warehouses`);
  }

  quickSale(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/me/quick-sale`, data);
  }

  getMyDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/dashboard`);
  }

  getInsights(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/insights`);
  }
}
