import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentCardComponent } from '../component-card/component-card.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { PaginatedList, RequestFilters } from '../../../../core/models/pagination.model';

export interface CrudColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'code';
}

@Component({
  selector: 'app-crud-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComponentCardComponent, BadgeComponent],
  templateUrl: './crud-list.component.html',
  styles: ``
})
export class CrudListComponent {
  @Input() pageTitle!: string;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() addBtnText: string = 'Add New';
  
  @Input() columns: CrudColumn[] = [];
  @Input() data: PaginatedList<any> | null = null;
  @Input() filters!: RequestFilters;
  @Input() includeDisabled: boolean = false;
  @Input() showIncludeDisabledToggle: boolean = true;

  @Output() search = new EventEmitter<void>();
  @Output() includeDisabledChange = new EventEmitter<boolean>();
  @Output() add = new EventEmitter<void>();
  @Output() view = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  openCodePopupId: number | string | null = null;
  openActionPopupId: number | string | null = null;
  copiedState: { id: number | string, type: 'code' | 'id' } | null = null;
  popupStyles: any = {};
  actionPopupStyles: any = {};
  private copyTimeout: any;

  @HostListener('document:click')
  closePopup(): void {
    this.openCodePopupId = null;
    this.openActionPopupId = null;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.openCodePopupId = null;
    this.openActionPopupId = null;
  }

  toggleCodePopup(id: number | string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openCodePopupId === id) {
      this.openCodePopupId = null;
    } else {
      this.openActionPopupId = null;
      this.openCodePopupId = id;
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.popupStyles = {
        position: 'fixed',
        top: `${rect.top - 8}px`,
        left: `${rect.left + (rect.width / 2)}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999
      };
    }
  }

  toggleActionPopup(id: number | string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openActionPopupId === id) {
      this.openActionPopupId = null;
    } else {
      this.openCodePopupId = null;
      this.openActionPopupId = id;
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.actionPopupStyles = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.right}px`,
        transform: 'translate(-100%, 0)', // align right edge
        zIndex: 9999
      };
    }
  }

  copyToClipboard(item: any, field: string, type: 'code' | 'id', event: Event): void {
    event.stopPropagation();
    const value = type === 'code' ? item[field] : item.id;
    navigator.clipboard.writeText(value?.toString() || '');
    
    this.copiedState = { id: item.id, type };
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    
    this.copyTimeout = setTimeout(() => {
      this.copiedState = null;
    }, 5000);
  }

  onSearch(): void {
    this.search.emit();
  }

  onIncludeDisabledChange(value: boolean): void {
    this.includeDisabledChange.emit(value);
    this.search.emit();
  }

  onPreviousPage(): void {
    if (this.data?.hasPreviousPage) {
      this.pageChange.emit(this.data.pageIndex - 1);
    }
  }

  onNextPage(): void {
    if (this.data?.hasNextPage) {
      this.pageChange.emit(this.data.pageIndex + 1);
    }
  }
}
