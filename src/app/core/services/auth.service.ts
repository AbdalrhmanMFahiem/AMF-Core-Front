import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { LoginRequest, AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, request);
  }

  setupCompany(request: import('../models/auth.models').SetupCompanyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/setup-company`, request);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setAuthResponse(response: AuthResponse) {
    localStorage.setItem('authResponse', JSON.stringify(response));
    if (response.token) {
      this.setToken(response.token);
    }
  }

  getAuthResponse(): AuthResponse | null {
    const data = localStorage.getItem('authResponse');
    return data ? JSON.parse(data) : null;
  }
}
