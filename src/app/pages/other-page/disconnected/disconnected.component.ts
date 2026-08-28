import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { BackendConnectionService, ConnectionStatus, PingResponse } from '../../../core/services/backend-connection.service';

@Component({
  selector: 'app-disconnected',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit, OnDestroy {
  public connectionService = inject(BackendConnectionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private toastr = inject(ToastrService, { optional: true });

  status: ConnectionStatus = 'offline';
  latency: number | null = null;
  pingData: PingResponse | null = null;

  returnUrl: string = '';
  countdown: number = 8;
  readonly COUNTDOWN_INITIAL: number = 8;
  readonly MAX_AUTO_RETRIES: number = 3;
  autoRetryCount: number = 0;
  autoRetryExhausted: boolean = false;
  isRetrying: boolean = false;
  restored: boolean = false;
  copied: boolean = false;
  currentYear: number = new Date().getFullYear();

  private subscriptions: Subscription = new Subscription();
  private countdownTimer: any = null;
  private redirectTimer: any = null;

  get apiUrl(): string {
    return this.connectionService.apiUrl;
  }

  get pingUrl(): string {
    return this.connectionService.pingUrl;
  }

  get countdownProgress(): number {
    return Math.max(0, Math.min(100, ((this.COUNTDOWN_INITIAL - this.countdown) / this.COUNTDOWN_INITIAL) * 100));
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Subscribe to connection service state
    this.subscriptions.add(
      this.connectionService.status$.subscribe(status => {
        this.status = status;
        if (status === 'online' && !this.restored) {
          this.handleConnectionRestored();
        }
      })
    );

    this.subscriptions.add(
      this.connectionService.latency$.subscribe(lat => {
        this.latency = lat;
      })
    );

    this.subscriptions.add(
      this.connectionService.pingData$.subscribe(data => {
        this.pingData = data;
      })
    );

    // Initial ping check
    this.checkConnectionNow();

    // Start countdown ticker for maximum 3 auto-retries
    this.startCountdown();
  }

  startCountdown(): void {
    this.stopCountdown();
    if (this.autoRetryExhausted) return;

    this.countdown = this.COUNTDOWN_INITIAL;

    this.countdownTimer = setInterval(async () => {
      if (this.restored) return;

      this.countdown--;
      if (this.countdown <= 0) {
        this.autoRetryCount++;
        this.countdown = this.COUNTDOWN_INITIAL;
        await this.checkConnectionNow();

        // If after 3 auto retries still offline, stop auto countdown and switch to manual mode
        if (this.autoRetryCount >= this.MAX_AUTO_RETRIES && !this.restored) {
          this.autoRetryExhausted = true;
          this.stopCountdown();
        }
      }
    }, 1000);
  }

  stopCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  async checkConnectionNow(isManual: boolean = false): Promise<void> {
    if (this.isRetrying || this.restored) return;
    this.isRetrying = true;

    try {
      const isOnline = await this.connectionService.checkConnection({ force: true, timeoutMs: 3000 });
      if (isOnline) {
        this.handleConnectionRestored();
      }
    } finally {
      this.isRetrying = false;
    }
  }

  handleConnectionRestored(): void {
    this.restored = true;
    this.stopCountdown();

    this.redirectTimer = setTimeout(() => {
      if (this.returnUrl && !this.returnUrl.includes('/disconnected')) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.router.navigate(['/']);
      }
    }, 1400);
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
      console.error('Failed to copy URL', err);
    }
  }

  openUrl(): void {
    if (this.apiUrl) {
      window.open(this.apiUrl, '_blank', 'noopener,noreferrer');
    }
  }

  goBack(): void {
    if (this.returnUrl && !this.returnUrl.includes('/disconnected')) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.location.back();
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
    this.subscriptions.unsubscribe();
  }
}
