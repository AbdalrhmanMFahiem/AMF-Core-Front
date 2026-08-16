import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error-banner.component.html',
  styles: [`
    @keyframes progress {
      0% { width: 100%; }
      100% { width: 0%; }
    }
    .animate-progress {
      animation: progress linear forwards;
    }
  `]
})
export class ErrorBannerComponent implements OnChanges, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() errors: string[] = [];
  @Input() countdownSeconds: number = 7;
  @Output() close = new EventEmitter<void>();

  private timeoutId: any;
  isPaused: boolean = false;

  parseError(error: string): { code: string | null; message: string } {
    if (!error) return { code: null, message: '' };
    const match = error.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { code: match[1], message: match[2] };
    }
    return { code: null, message: error };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.startCountdown();
      } else {
        this.clearCountdown();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  onClose(): void {
    this.isVisible = false;
    this.clearCountdown();
    this.close.emit();
  }

  onMouseEnter(): void {
    this.isPaused = true;
    this.clearCountdown();
  }

  onMouseLeave(): void {
    this.isPaused = false;
    this.startCountdown();
  }

  private startCountdown(): void {
    this.clearCountdown();
    if (!this.isPaused && this.isVisible) {
      this.timeoutId = setTimeout(() => {
        this.onClose();
      }, this.countdownSeconds * 1000);
    }
  }

  private clearCountdown(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
