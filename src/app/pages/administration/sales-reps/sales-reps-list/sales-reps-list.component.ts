import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesRepService } from '../../../../core/services/sales-rep.service';
import { SalesRepResponse } from '../../../../core/models/sales-rep.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-sales-reps-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageBreadcrumbComponent, ComponentCardComponent],
  templateUrl: './sales-reps-list.component.html'
})
export class SalesRepsListComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  salesReps: SalesRepResponse[] = [];
  filteredSalesReps: SalesRepResponse[] = [];
  loading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.salesRepService.getAll().subscribe({
      next: (res) => {
        this.salesReps = res;
        this.applySearch();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSalesReps = [...this.salesReps];
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredSalesReps = this.salesReps.filter(s =>
      s.userName.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  }

  onViewDetails(userId: string): void {
    this.router.navigate(['/administration/sales-reps/view', userId]);
  }
}
