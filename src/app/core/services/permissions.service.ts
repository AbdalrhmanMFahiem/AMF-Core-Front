import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/me/permissions`; }
  
  private permissionsSubject = new BehaviorSubject<Set<string>>(new Set<string>());
  public permissions$ = this.permissionsSubject.asObservable();
  
  private isLoaded = false;

  loadPermissions(): Observable<string[]> {
    if (this.isLoaded) {
      return of(Array.from(this.permissionsSubject.value));
    }
    
    return this.http.get<string[]>(this.apiUrl).pipe(
      tap(permissions => {
        const permissionsSet = new Set<string>(permissions.map(p => p.toLowerCase()));
        this.permissionsSubject.next(permissionsSet);
        this.isLoaded = true;
      }),
      catchError(err => {
        console.error('Failed to load permissions', err);
        this.permissionsSubject.next(new Set<string>());
        return of([]);
      })
    );
  }

  hasPermission(permission?: string): boolean {
    return true; // TEMP: Disabled permissions check temporarily
    /*
    if (!permission) return true; // If no permission is required, return true
    return this.permissionsSubject.value.has(permission.toLowerCase());
    */
  }

  hasAnyPermission(permissions: string[]): boolean {
    return true; // TEMP: Disabled permissions check temporarily
    /*
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(p => this.permissionsSubject.value.has(p.toLowerCase()));
    */
  }

  hasAllPermissions(permissions: string[]): boolean {
    return true; // TEMP: Disabled permissions check temporarily
    /*
    if (!permissions || permissions.length === 0) return true;
    return permissions.every(p => this.permissionsSubject.value.has(p.toLowerCase()));
    */
  }

  clearPermissions(): void {
    this.permissionsSubject.next(new Set<string>());
    this.isLoaded = false;
  }
}
