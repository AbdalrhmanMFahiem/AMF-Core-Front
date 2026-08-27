import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { AuthService } from '../../../../core/services/auth.service';

export type ConnectionStatus = 'online' | 'offline' | 'checking' | 'idle';

export interface PingResponse {
  message?: string;
  timestamp?: string;
  status?: string;
}

@Component({
  selector: 'app-backend-connection-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule, DropdownComponent],
  templateUrl: './backend-connection-dropdown.component.html',
})
export class BackendConnectionDropdownComponent implements OnInit {
  @Input() sizeClass = 'h-10 w-10 lg:h-11 lg:w-11';
  @Input() openUp = false;
  @Input() tenantId?: string;

  private appConfigService = inject(AppConfigService);
  private authService = inject(AuthService, { optional: true });
  private toastr = inject(ToastrService, { optional: true });

  isOpen = false;
  copied = false;
  tenantCopied = false;
  status: ConnectionStatus = 'idle';
  latency: number | null = null;
  lastChecked: Date | null = null;
  pingData: PingResponse | null = null;

  get currentTenantId(): string | null {
    if (this.tenantId) return this.tenantId;
    return this.authService?.getAuthResponse()?.tenantId || null;
  }

  get apiUrl(): string {
    return this.appConfigService.apiUrl || 'http://localhost:7218';
  }

  get pingUrl(): string {
    const base = (this.apiUrl || '').replace(/\/+$/, '');
    return `${base}/ping`;
  }

  get parsedUrl(): { protocol: string; host: string; port: string; pathname: string } {
    try {
      const url = new URL(this.apiUrl);
      return {
        protocol: url.protocol.replace(':', '').toUpperCase(),
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        pathname: url.pathname
      };
    } catch {
      return {
        protocol: 'HTTP',
        host: this.apiUrl,
        port: '—',
        pathname: '/'
      };
    }
  }

  get isSecure(): boolean {
    return this.parsedUrl.protocol === 'HTTPS';
  }

  ngOnInit(): void {
    // Perform initial ping check
    this.checkConnection();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.status === 'idle') {
      this.checkConnection();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  async copyUrl(): Promise<void> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.apiUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = this.apiUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.copied = true;
      if (this.toastr) {
        this.toastr.success(this.apiUrl, 'Backend URL Copied', { timeOut: 2000 });
      }

      setTimeout(() => {
        this.copied = false;
      }, 2500);
    } catch (err) {
      console.error('Failed to copy API URL', err);
    }
  }

  async copyTenantId(): Promise<void> {
    const tid = this.currentTenantId;
    if (!tid) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(tid);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = tid;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.tenantCopied = true;
      if (this.toastr) {
        this.toastr.success(tid, 'Database Tenant ID Copied', { timeOut: 2000 });
      }

      setTimeout(() => {
        this.tenantCopied = false;
      }, 2500);
    } catch (err) {
      console.error('Failed to copy Tenant ID', err);
    }
  }

  async checkConnection(): Promise<void> {
    if (!this.apiUrl) return;

    this.status = 'checking';
    const startTime = performance.now();

    try {
      // Send a ping request to PingController (/ping)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(this.pingUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.latency = Math.round(performance.now() - startTime);
        this.status = 'online';
        this.lastChecked = new Date();
        try {
          this.pingData = await response.json();
        } catch {
          this.pingData = { message: 'Pong', status: 'Healthy' };
        }
      } else {
        this.status = 'offline';
        this.latency = null;
        this.lastChecked = new Date();
        this.pingData = null;
      }
    } catch (error: any) {
      // Fallback test on base API URL
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 2000);
        await fetch(this.apiUrl, {
          method: 'GET',
          mode: 'no-cors',
          signal: fallbackController.signal,
          cache: 'no-store'
        });
        clearTimeout(fallbackTimeout);
        this.latency = Math.round(performance.now() - startTime);
        this.status = 'online';
        this.lastChecked = new Date();
      } catch {
        this.status = 'offline';
        this.latency = null;
        this.lastChecked = new Date();
        this.pingData = null;
      }
    }
  }

  openUrl(): void {
    if (this.apiUrl) {
      window.open(this.apiUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
