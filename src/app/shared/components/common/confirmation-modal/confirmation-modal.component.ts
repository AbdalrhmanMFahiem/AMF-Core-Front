import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirmation-modal.component.html',
  styles: ``
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'common.confirm';
  @Input() message: string = 'common.confirmStatusChange';
  @Input() confirmText: string = 'common.save';
  @Input() cancelText: string = 'common.cancel';
  @Input() type: 'warning' | 'danger' | 'info' | 'success' = 'warning';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getIconClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'success':
        return 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400';
      case 'warning':
      default:
        return 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
      case 'success':
        return 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500';
      case 'warning':
      default:
        return 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
