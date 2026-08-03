import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { LoginRequest, AuthResponse, VerifyCredentialsRequest, VerifyCredentialsResponse, TenantBranchResponse, SetupCompanyRequest, SetupCompanyAdminRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  verifyCredentials(request: VerifyCredentialsRequest): Observable<VerifyCredentialsResponse> {
    return this.http.post<VerifyCredentialsResponse>(`${this.apiUrl}/verify-credentials`, request);
  }

  getTenantBranches(request: LoginRequest): Observable<TenantBranchResponse[]> {
    return this.http.post<TenantBranchResponse[]>(`${this.apiUrl}/tenant-branches`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, request);
  }

  setupCompany(request: SetupCompanyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/setup-company`, request);
  }

  setupCompanyAdmin(request: SetupCompanyAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/setup-company-admin`, request);
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

  setLandingPagePreference(page: 'dashboard' | 'home') {
    localStorage.setItem('userLandingPage', page);
    const authData = this.getAuthResponse();
    if (authData) {
      authData.defaultLandingPage = page;
      localStorage.setItem('authResponse', JSON.stringify(authData));
    }
  }

  getLandingPagePreference(): 'dashboard' | 'home' {
    const authData = this.getAuthResponse();
    const serverPref = authData?.defaultLandingPage?.trim().toLowerCase();

    // Only if server specifies 'dashboard' explicitly, return 'dashboard'
    if (serverPref === 'dashboard') {
      return 'dashboard';
    }

    // If empty (""), null, undefined, 'home', or anything else -> default to 'home'
    return 'home';
  }


  updateLandingPageOnServer(page: 'dashboard' | 'home'): Observable<void> {
    this.setLandingPagePreference(page);
    return this.http.put<void>(`${environment.apiUrl}/me/landing-page`, { landingPage: page });
  }

  hasDashboardPermission(): boolean {
    const authData = this.getAuthResponse();
    if (!authData || !authData.token) return false;
    
    const isRestricted = localStorage.getItem('restrictDashboard') === 'true';
    return !isRestricted;
  }



  revokeRefreshToken(request: { token: string, refreshToken: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/revoke-refresh-token`, request);
  }

  logout(): Observable<void> {
    const authData = this.getAuthResponse();
    
    return new Observable<void>(observer => {
      if (authData && authData.token && authData.refreshToken) {
        this.revokeRefreshToken({
          token: authData.token,
          refreshToken: authData.refreshToken
        }).subscribe({
          next: () => {
            this.clearAuth();
            observer.next();
            observer.complete();
          },
          error: () => {
            this.clearAuth();
            observer.next();
            observer.complete();
          }
        });
      } else {
        this.clearAuth();
        observer.next();
        observer.complete();
      }
    });
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authResponse');
  }
}
