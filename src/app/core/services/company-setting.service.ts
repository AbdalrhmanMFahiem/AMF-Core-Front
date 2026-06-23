import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanySettingRequest, CompanySettingResponse } from '../models/company-setting.model';

@Injectable({
  providedIn: 'root'
})
export class CompanySettingService {
  private apiUrl = `${environment.apiUrl}/api/configuration/CompanySettings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<CompanySettingResponse> {
    return this.http.get<CompanySettingResponse>(this.apiUrl);
  }

  updateSettings(data: CompanySettingRequest): Observable<void> {
    const formData = new FormData();
    
    formData.append('Id', data.id.toString());
    formData.append('CompanyAName', data.companyAName);
    
    if (data.companyCode) formData.append('CompanyCode', data.companyCode);
    if (data.companyEName) formData.append('CompanyEName', data.companyEName);
    if (data.registrationNumber) formData.append('RegistrationNumber', data.registrationNumber);
    if (data.taxNumber) formData.append('TaxNumber', data.taxNumber);
    if (data.address) formData.append('Address', data.address);
    if (data.country) formData.append('Country', data.country);
    if (data.phoneNumber) formData.append('PhoneNumber', data.phoneNumber);
    if (data.email) formData.append('Email', data.email);
    if (data.website) formData.append('Website', data.website);
    if (data.logoPath) formData.append('LogoPath', data.logoPath);
    
    if (data.logoBinary) {
      formData.append('LogoBinary', data.logoBinary);
    }
    
    if (data.iconBinary) {
      formData.append('IconBinary', data.iconBinary);
    }

    return this.http.put<void>(this.apiUrl, formData);
  }
}
