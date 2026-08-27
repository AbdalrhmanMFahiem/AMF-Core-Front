import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, forwardRef, inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { Arabic } from './ar-locale';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() enableTime: boolean = false;
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;
  private translate = inject(TranslateService);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private value: any = null;

  get displayPlaceholder(): string {
    const p = this.placeholder || 'common.selectDate';
    // If p contains spaces or Arabic characters, it is already a translated string (passed via | translate)
    if (p.includes(' ') || /[\u0600-\u06FF]/.test(p)) {
      return p;
    }
    return this.translate.instant(p);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const isArabic = this.translate.currentLang === 'ar' || document.documentElement.dir === 'rtl';

    const options: flatpickr.Options.Options = {
      mode: this.mode,
      static: true,
      monthSelectorType: 'static',
      dateFormat: this.enableTime ? 'Y-m-d H:i' : 'Y-m-d',
      enableTime: this.enableTime,
      defaultDate: (this.value && this.value !== 'undefined') ? this.value : ((this.defaultDate && this.defaultDate !== 'undefined') ? this.defaultDate : null),
      onChange: (selectedDates, dateStr, instance) => {
        if (this.value !== dateStr) {
          this.value = dateStr;
          this.onChange(dateStr);
          this.dateChange.emit({ selectedDates, dateStr, instance });
        }
      }
    };

    if (isArabic) {
      options.locale = Arabic;
    }

    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, options);
  }

  writeValue(val: any): void {
    this.value = val === undefined ? null : val;
    if (this.flatpickrInstance) {
      if (!this.value) {
        this.flatpickrInstance.clear(false);
      } else {
        this.flatpickrInstance.setDate(this.value, false);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.dateInput?.nativeElement) {
      this.dateInput.nativeElement.disabled = isDisabled;
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
