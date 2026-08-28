import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { AuthService } from '../../../../core/services/auth.service';
import { BackendConnectionService, ConnectionStatus, PingResponse } from '../../../../core/services/backend-connection.service';

@Component({
  selector: 'app-backend-connection-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule, DropdownComponent],
  templateUrl: './backend-connection-dropdown.component.html',
})
export class BackendConnectionDropdownComponent implements OnInit, OnDestroy {
  @Input() sizeClass = 'h-10 w-10 lg:h-11 lg:w-11';
  @Input() openUp = false;
  @Input() tenantId?: string;

  public connectionService = inject(BackendConnectionService);
  private authService = inject(AuthService, { optional: true });
  private toastr = inject(ToastrService, { optional: true });

  isOpen = false;
  copied = false;
  tenantCopied = false;
  status: ConnectionStatus = 'idle';
  latency: number | null = null;
  pingData: PingResponse | null = null;

  private subs = new Subscription();

  get currentTenantId(): string | null {
    if (this.tenantId) return this.tenantId;
    return this.authService?.getAuthResponse()?.tenantId || null;
  }

  get apiUrl(): string {
    return this.connectionService.apiUrl;
  }

  get pingUrl(): string {
    return this.connectionService.pingUrl;
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
    this.subs.add(
      this.connectionService.status$.subscribe(s => {
        this.status = s;
      })
    );

    this.subs.add(
      this.connectionService.latency$.subscribe(l => {
        this.latency = l;
      })
    );

    this.subs.add(
      this.connectionService.pingData$.subscribe(p => {
        this.pingData = p;
      })
    );

    // Initial check if not checked yet
    if (this.connectionService.currentStatus === 'idle') {
      this.checkConnection();
    }
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
        this.toastr.success(this.apiUrl, 'Server URL Copied', { timeOut: 2000 });
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
    await this.connectionService.checkConnection({ force: true });
  }

  openUrl(): void {
    if (this.apiUrl) {
      window.open(this.apiUrl, '_blank', 'noopener,noreferrer');
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
