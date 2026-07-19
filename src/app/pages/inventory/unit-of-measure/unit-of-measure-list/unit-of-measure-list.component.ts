import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { UnitOfMeasureService } from '../../../../core/services/unit-of-measure.service';
import { PaginatedList, RequestFilters } from '../../../../core/models/pagination.model';
import { UnitOfMeasure, UnitOfMeasureFilters, UomType } from '../../../../core/models/uom.model';
import { ToastrService } from 'ngx-toastr';
import { UomTypeBadgeComponent } from '../../../../shared/components/common/uom-type-badge/uom-type-badge.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unit-of-measure-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    CrudListComponent,
    UomTypeBadgeComponent,
    SearchableSelectComponent
  ],
  templateUrl: './unit-of-measure-list.component.html',
  styles: ``
})
export class UnitOfMeasureListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly uomService = inject(UnitOfMeasureService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<UnitOfMeasure> | null = null;
  includeDisabled: boolean = false;
  loading: boolean = false;

  filters: UnitOfMeasureFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  uomTypeOptions: SearchableOption[] = [];

  get hasActiveAdvancedFilters(): boolean {
    return !!(this.filters.type);
  }

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'aName', header: 'common.name', type: 'text' },
    { field: 'uomType', header: 'uom.uomType', type: 'custom' },
    { field: 'isBaseUnit', header: 'uom.isBaseUnit', type: 'boolean' },
    { field: 'conversionFactor', header: 'uom.conversionFactor', type: 'number' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.translate.onLangChange.subscribe(() => this.updateOptions());
    this.updateOptions();
  }

  updateOptions(): void {
    this.uomTypeOptions = Object.values(UomType).map(type => ({
      value: type,
      label: this.translate.instant(`uom.types.${type}`)
    }));
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      sortColumn: 'Id',
      sortDirection: 'DESC',
      type: undefined
    };
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.uomService.getUnitOfMeasures(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load unit of measures', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/unit-of-measure/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/unit-of-measure/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/unit-of-measure/edit', id]);
  }

  onToggleStatus(item: any): void {
    this.uomService.toggleUnitOfMeasureStatus(item.id).subscribe({
      next: () => {
        const msg = item.isActive ?
          this.translate.instant('common.statusChangedToInactive') :
          this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      },
      error: (err) => {
        this.toastr.error('Failed to update status', 'Error');
        console.error(err);
      }
    });
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  onIncludeDisabledChanged(include: boolean): void {
    this.includeDisabled = include;
    this.loadData();
  }
}
