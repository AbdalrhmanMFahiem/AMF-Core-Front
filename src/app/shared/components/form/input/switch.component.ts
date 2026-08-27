import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-switch',
  imports: [
    CommonModule
  ],
  template: `
   <label
      class="flex cursor-pointer select-none items-center gap-3 text-sm font-medium"
      [ngClass]="disabled ? 'text-gray-400 opacity-60 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300'"
      (click)="handleToggle()"
    >
      <div class="relative">
        <div
          class="block transition-all duration-300 ease-in-out h-6.5 w-12 rounded-full border"
          [ngClass]="
            (disabled
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pointer-events-none'
              : switchColors.background)
          "
        ></div>
        <div
          class="absolute left-0.75 top-0.75 h-5 w-5 rounded-full shadow-md dark:shadow-black/50 duration-300 ease-in-out transform"
          [ngClass]="switchColors.knob"
        ></div>
      </div>
      {{ label }}
    </label>
  `
})
export class SwitchComponent {

  @Input() label!: string;
  @Input() defaultChecked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() color: 'blue' | 'gray' = 'blue';

  @Output() valueChange = new EventEmitter<boolean>();

  isChecked: boolean = false;

  ngOnInit() {
    this.isChecked = this.defaultChecked;
  }

  handleToggle() {
    if (this.disabled) return;
    this.isChecked = !this.isChecked;
    this.valueChange.emit(this.isChecked);
  }

  get switchColors() {
    if (this.color === 'blue') {
      return {
        background: this.isChecked
          ? 'bg-brand-600 dark:bg-brand-500 border-brand-600 dark:border-brand-500 shadow-sm dark:shadow-[0_0_14px_rgba(70,95,255,0.45)]'
          : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-750',
        knob: this.isChecked
          ? 'translate-x-5.5 bg-white'
          : 'translate-x-0 bg-white dark:bg-gray-100',
      };
    } else {
      return {
        background: this.isChecked
          ? 'bg-gray-800 dark:bg-gray-600 border-gray-800 dark:border-gray-600 shadow-sm'
          : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-750',
        knob: this.isChecked
          ? 'translate-x-5.5 bg-white'
          : 'translate-x-0 bg-white dark:bg-gray-100',
      };
    }
  }
}
