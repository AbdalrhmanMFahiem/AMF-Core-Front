import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
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

  dropdownStyle: { [key: string]: string } = {};

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

  isOptionMatch(opt: SearchableOption, val: any): boolean {
    if (val === undefined || val === null) return false;
    if (opt.value === val || String(opt.value).toLowerCase() === String(val).toLowerCase()) {
      return true;
    }
    if ((opt.value === 'Item' || opt.value === 'I') && (val === 'Item' || val === 'I' || val === 1 || val === 73)) {
      return true;
    }
    if ((opt.value === 'Resource' || opt.value === 'R') && (val === 'Resource' || val === 'R' || val === 2 || val === 82)) {
      return true;
    }
    return false;
  }

  get selectedLabel(): string {
    if (this.value === undefined || this.value === null) {
      return '';
    }
    const option = this.options.find(opt => this.isOptionMatch(opt, this.value));
    return option ? option.label : '';
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.updateDropdownPosition();
    } else {
      this.onTouch();
    }
  }

  updateDropdownPosition(): void {
    const el = this.elementRef.nativeElement.querySelector('.select-trigger');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownMaxHeight = 280; // approximate max-h
    const openUpward = spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight;

    if (openUpward) {
      this.dropdownStyle = {
        position: 'fixed',
        bottom: `${window.innerHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        'z-index': '9999'
      };
    } else {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        'z-index': '9999'
      };
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isOpen) {
      this.updateDropdownPosition();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.isOpen) {
      this.updateDropdownPosition();
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
