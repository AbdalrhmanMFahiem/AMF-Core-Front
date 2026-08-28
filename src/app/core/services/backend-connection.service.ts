import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

export type ConnectionStatus = 'online' | 'offline' | 'checking' | 'idle';

export interface PingResponse {
  message?: string;
  timestamp?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendConnectionService {
  private appConfigService = inject(AppConfigService);
  private router = inject(Router);

  private statusSubject = new BehaviorSubject<ConnectionStatus>('idle');
  private latencySubject = new BehaviorSubject<number | null>(null);
  private lastCheckedSubject = new BehaviorSubject<Date | null>(null);
  private pingDataSubject = new BehaviorSubject<PingResponse | null>(null);

  public status$: Observable<ConnectionStatus> = this.statusSubject.asObservable();
  public latency$: Observable<number | null> = this.latencySubject.asObservable();
  public lastChecked$: Observable<Date | null> = this.lastCheckedSubject.asObservable();
  public pingData$: Observable<PingResponse | null> = this.pingDataSubject.asObservable();

  public get currentStatus(): ConnectionStatus {
    return this.statusSubject.value;
  }

  public get currentLatency(): number | null {
    return this.latencySubject.value;
  }

  public get currentPingData(): PingResponse | null {
    return this.pingDataSubject.value;
  }

  public get apiUrl(): string {
    return this.appConfigService.apiUrl || 'http://localhost:7218';
  }

  public get pingUrl(): string {
    const base = (this.apiUrl || '').replace(/\/+$/, '');
    return `${base}/ping`;
  }

  private inFlightCheck: Promise<boolean> | null = null;
  private autoPingInterval: any = null;

  /**
   * Pings the backend server to check if it is reachable and operational.
   * Debounces multiple simultaneous calls.
   */
  public checkConnection(options?: { timeoutMs?: number; force?: boolean }): Promise<boolean> {
    if (this.inFlightCheck && !options?.force) {
      return this.inFlightCheck;
    }

    const timeoutMs = options?.timeoutMs || 3500;
    this.statusSubject.next('checking');
    const startTime = performance.now();

    this.inFlightCheck = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
          const latency = Math.round(performance.now() - startTime);
          this.latencySubject.next(latency);
          this.statusSubject.next('online');
          this.lastCheckedSubject.next(new Date());

          try {
            const data: PingResponse = await response.json();
            this.pingDataSubject.next(data);
          } catch {
            this.pingDataSubject.next({ message: 'Pong', status: 'Healthy' });
          }
          return true;
        } else {
          // If response status is 500 or any other HTTP code, server is actually reachable (not disconnected)
          if (response.status >= 500 && response.status !== 502 && response.status !== 503 && response.status !== 504) {
            const latency = Math.round(performance.now() - startTime);
            this.latencySubject.next(latency);
            this.statusSubject.next('online');
            this.lastCheckedSubject.next(new Date());
            return true;
          }

          this.markOffline();
          return false;
        }
      } catch {
        // Fallback probe to base API URL
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

          const latency = Math.round(performance.now() - startTime);
          this.latencySubject.next(latency);
          this.statusSubject.next('online');
          this.lastCheckedSubject.next(new Date());
          return true;
        } catch {
          this.markOffline();
          return false;
        }
      } finally {
        this.inFlightCheck = null;
      }
    })();

    return this.inFlightCheck;
  }

  private markOffline(): void {
    this.statusSubject.next('offline');
    this.latencySubject.next(null);
    this.lastCheckedSubject.next(new Date());
    this.pingDataSubject.next(null);
  }

  /**
   * Called when a network failure / status 0 occurs.
   * Performs an immediate ping check to determine if the backend is genuinely offline.
   * If confirmed offline, navigates to /disconnected.
   * If the ping succeeds, leaves the user on current view and returns true.
   */
  public async handlePotentialDisconnection(returnUrl?: string): Promise<boolean> {
    // Avoid re-triggering if already on disconnected page
    if (this.router.url.includes('/disconnected')) {
      return false;
    }

    const isOnline = await this.checkConnection({ timeoutMs: 3000, force: true });
    if (!isOnline) {
      const currentUrl = returnUrl || this.router.url;
      const queryParams: Record<string, string> = {};
      if (currentUrl && !currentUrl.includes('/disconnected') && !currentUrl.includes('/signin')) {
        queryParams['returnUrl'] = currentUrl;
      }
      this.router.navigate(['/disconnected'], { queryParams });
      return false;
    }

    return true;
  }

  /**
   * Starts a background recurring ping check (used primarily in the disconnected screen).
   */
  public startPeriodicPing(intervalMs: number = 6000, onRestored?: () => void): void {
    this.stopPeriodicPing();
    this.autoPingInterval = setInterval(async () => {
      const isOnline = await this.checkConnection({ timeoutMs: 3000 });
      if (isOnline && onRestored) {
        onRestored();
      }
    }, intervalMs);
  }

  /**
   * Stops the recurring ping check.
   */
  public stopPeriodicPing(): void {
    if (this.autoPingInterval) {
      clearInterval(this.autoPingInterval);
      this.autoPingInterval = null;
    }
  }
}
