import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBasicResponse, UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Users`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<UserBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue);
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<PaginatedList<UserBasicResponse>>(this.apiUrl, { params });
  }

  get(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  private buildFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (key === 'photo' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'roles' && Array.isArray(value)) {
          value.forEach(role => formData.append('roles', role));
        } else if (key === 'userEmploymentInfo' && typeof value === 'object') {
          // Serialize nested object properties for ASP.NET Core model binding
          Object.keys(value).forEach(subKey => {
            const subValue = value[subKey];
            if (subValue !== null && subValue !== undefined) {
              formData.append(`userEmploymentInfo.${subKey}`, String(subValue));
            }
          });
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return formData;
  }

  create(data: CreateUserRequest): Observable<UserResponse> {
    const formData = this.buildFormData(data);
    return this.http.post<UserResponse>(this.apiUrl, formData);
  }

  update(id: string, data: UpdateUserRequest): Observable<void> {
    const formData = this.buildFormData(data);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  toggleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  unlock(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/unlock`, {});
  }
}
