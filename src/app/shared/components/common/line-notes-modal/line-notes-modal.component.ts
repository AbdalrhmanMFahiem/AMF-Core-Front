import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-line-notes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './line-notes-modal.component.html'
})
export class LineNotesModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() notes: string = '';
  @Input() readonly: boolean = false;
  @Input() itemCode?: string;
  @Input() itemName?: string;
  @Input() maxLength: number = 500;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  localNotes: string = '';

  quickPresets: { label: string; text: string }[] = [
    { label: 'عاجل', text: 'عاجل' },
    { label: 'ملاحظة جودة', text: 'ملاحظة جودة' },
    { label: 'طلب خاص بالعميل', text: 'طلب خاص بالعميل' },
    { label: 'تغليف خاص', text: 'تغليف خاص' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.localNotes = this.notes || '';
    } else if (changes['notes']) {
      this.localNotes = this.notes || '';
    }
  }

  appendPreset(presetText: string): void {
    if (this.readonly) return;
    if (!this.localNotes) {
      this.localNotes = presetText;
    } else {
      if (!this.localNotes.includes(presetText)) {
        this.localNotes = `${this.localNotes} - ${presetText}`;
      }
    }
  }

  clearNotes(): void {
    if (this.readonly) return;
    this.localNotes = '';
  }

  onSave(): void {
    if (this.readonly) return;
    this.save.emit(this.localNotes);
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
