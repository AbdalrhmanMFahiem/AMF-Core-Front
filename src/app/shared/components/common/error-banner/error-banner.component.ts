import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error-banner.component.html',
  styles: []
})
export class ErrorBannerComponent implements OnChanges, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() errors: string[] = [];
  @Input() countdownSeconds: number = 5;
  @Output() close = new EventEmitter<void>();

  private timeoutId: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      this.startCountdown();
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

  private startCountdown(): void {
    this.clearCountdown();
    this.timeoutId = setTimeout(() => {
      this.onClose();
    }, this.countdownSeconds * 1000);
  }

  private clearCountdown(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

