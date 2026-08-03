import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dropdown-item-two',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="to"
      [routerLinkActive]="activeClass"
      [routerLinkActiveOptions]="{ exact: exact }"
      [ngClass]="combinedClasses"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class DropdownItemTwoComponent {
  @Input() to!: string; // Required route path
  @Input() baseClassName = 'flex items-center gap-3 w-full ltr:text-left rtl:text-right px-3.5 py-2.5 font-medium text-gray-700 dark:text-gray-300 rounded-xl group text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all';
  @Input() className = '';
  @Input() activeClass = 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-bold shadow-2xs ltr:border-l-4 ltr:border-brand-600 rtl:border-r-4 rtl:border-brand-600';
  @Input() exact = false;
  @Output() itemClick = new EventEmitter<void>();
  @Output() click = new EventEmitter<void>();

  get combinedClasses(): string {
    return `${this.baseClassName} ${this.className}`.trim();
  }

  handleClick(event: Event) {
    this.click.emit();
    this.itemClick.emit();
  }
}
