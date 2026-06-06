import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-redirect-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div *ngIf="isVisible" class="mb-6 overflow-hidden rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 shadow-theme-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        
        <!-- Icon & Message -->
        <div class="flex items-center gap-4">
          <div class="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400 ring-4 ring-success-50 dark:ring-success-500/10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-success-800 dark:text-success-400">
              {{ message | translate }}
            </h3>
            <p class="text-sm text-success-600 dark:text-success-500 mt-1 flex items-center gap-1.5 font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ 'Common.RedirectingIn' | translate: { seconds: remainingSeconds } }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button (click)="onStay()" type="button"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-success-500/10 text-success-700 dark:text-success-400 text-sm font-medium rounded-lg border border-success-200 dark:border-success-500/20 hover:bg-success-50 dark:hover:bg-success-500/20 transition-colors shadow-theme-xs">
            {{ 'Common.StayHere' | translate }}
          </button>
          <button (click)="onRedirect()" type="button"
            class="relative overflow-hidden flex-1 sm:flex-none px-5 py-2.5 bg-success-600 text-white text-sm font-medium rounded-lg border border-success-600 hover:bg-success-700 transition-colors shadow-theme-xs group">
            <div class="absolute inset-y-0 left-0 bg-black/15 transition-all ease-linear"
                 [style.width.%]="(remainingSeconds / countdownSeconds) * 100"
                 [style.transitionDuration.ms]="1000"></div>
            <span class="relative z-10 flex items-center justify-center gap-2">
              {{ 'Common.BackToList' | translate }}
              <span class="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-xs font-bold">{{ remainingSeconds }}</span>
            </span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class SuccessRedirectBannerComponent implements OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Input() message = 'Common.SavedSuccessfully';
  @Input() redirectUrl = '';
  @Input() countdownSeconds = 5;

  @Output() stay = new EventEmitter<void>();
  @Output() redirect = new EventEmitter<void>();

  remainingSeconds = 5;
  private intervalId: any;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }
  }

  private startTimer(): void {
    this.remainingSeconds = this.countdownSeconds;
    this.stopTimer(); // Clear any existing
    
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.onRedirect();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onStay(): void {
    this.stopTimer();
    this.isVisible = false;
    this.stay.emit();
  }

  onRedirect(): void {
    this.stopTimer();
    this.isVisible = false;
    this.redirect.emit();
    if (this.redirectUrl) {
      this.router.navigateByUrl(this.redirectUrl);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
