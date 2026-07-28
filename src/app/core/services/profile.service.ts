import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfileData {
  id: string;
  code: string;
  email: string;
  userName: string;
  firstAName: string;
  lastAName: string;
  firstEName?: string;
  lastEName?: string;
  photoPath?: string;
  changePassword?: boolean;
  defaultLandingPage?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  governorate?: string;
  country?: string;
  postalCode?: string;
}

export interface UpdateProfileRequestData {
  firstAName: string;
  lastAName: string;
  firstEName?: string;
  lastEName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  governorate?: string;
  country?: string;
  postalCode?: string;
}

export interface ChangePasswordRequestData {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/me`;

  getProfile(): Observable<UserProfileData> {
    return this.http.get<UserProfileData>(this.apiUrl);
  }

  updateProfile(data: UpdateProfileRequestData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/info`, data);
  }

  uploadPhoto(file: File): Observable<{ photoPath: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ photoPath: string }>(`${this.apiUrl}/photo`, formData);
  }

  changePassword(data: ChangePasswordRequestData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/change-password`, data);
  }

  updateLandingPage(landingPage: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/landing-page`, { landingPage });
  }
}
