import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface SearchableOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './searchable-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ]
})
export class SearchableSelectComponent implements ControlValueAccessor, OnInit {
  @Input() options: SearchableOption[] = [];
  @Input() placeholder: string = 'common.select';
  @Input() searchPlaceholder: string = 'common.searchPlaceholder';
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = true;
  
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;
  searchText = '';
  value: any = undefined;

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}

  get filteredOptions(): SearchableOption[] {
    if (!this.searchText) {
      return this.options;
    }
    const lowerSearch = this.searchText.toLowerCase();
    return this.options.filter(opt => 
      opt.label && opt.label.toLowerCase().includes(lowerSearch)
    );
  }

  get selectedLabel(): string {
    if (this.value === undefined || this.value === null) {
      return '';
    }
    const option = this.options.find(opt => opt.value === this.value);
    return option ? option.label : '';
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
    } else {
      this.onTouch();
    }
  }

  selectOption(optionValue: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.value = optionValue;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.isOpen = false;
    this.onTouch();
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    if (this.disabled) return;
    this.value = undefined;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.onTouch();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        this.onTouch();
      }
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
