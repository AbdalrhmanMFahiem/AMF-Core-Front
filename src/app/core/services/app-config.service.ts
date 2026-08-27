import { Injectable } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: AppConfig = { apiUrl: '' };

  loadConfig(): Promise<void> {
    return fetch('/assets/config.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load config.json: ${res.status}`);
        }
        return res.json();
      })
      .then((data: AppConfig) => {
        this.config = data;
      })
      .catch(err => {
        console.error('Could not load config.json', err);
      });
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }
}
