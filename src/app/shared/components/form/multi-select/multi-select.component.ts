import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, ElementRef, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface Option {
  value: string;
  text: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './multi-select.component.html',
  styles: ``
})
export class MultiSelectComponent implements OnInit {

  @Input() label: string = '';
  @Input() placeholder: string = 'common.select';
  @Input() options: Option[] = [];
  @Input() defaultSelected: string[] = [];
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<string[]>();

  selectedOptions: string[] = [];
  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  ngOnInit() {
    this.selectedOptions = [...this.defaultSelected];
  }

  toggleDropdown() {
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  handleSelect(optionValue: string) {
    if (this.selectedOptions.includes(optionValue)) {
      this.selectedOptions = this.selectedOptions.filter(v => v !== optionValue);
    } else {
      this.selectedOptions = [...this.selectedOptions, optionValue];
    }
    this.selectionChange.emit(this.selectedOptions);
  }

  removeOption(value: string) {
    this.selectedOptions = this.selectedOptions.filter(opt => opt !== value);
    this.selectionChange.emit(this.selectedOptions);
  }

  get selectedValuesText(): string[] {
    return this.selectedOptions
      .map(value => this.options.find(option => option.value === value)?.text || '')
      .filter(Boolean);
  }

  clearAll(event: Event) {
    event.stopPropagation();
    this.selectedOptions = [];
    this.selectionChange.emit(this.selectedOptions);
  }
}
