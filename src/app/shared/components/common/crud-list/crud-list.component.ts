import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentCardComponent } from '../component-card/component-card.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { PaginatedList, RequestFilters } from '../../../../core/models/pagination.model';

export interface CrudColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge';
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

  @Output() search = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() view = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  onSearch(): void {
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
