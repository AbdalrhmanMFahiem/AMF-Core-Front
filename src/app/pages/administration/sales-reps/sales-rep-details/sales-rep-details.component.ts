import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesRepService } from '../../../../core/services/sales-rep.service';
import { SalesRepCustomerResponse, SalesRepWarehouseResponse } from '../../../../core/models/sales-rep.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-sales-rep-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageBreadcrumbComponent, ComponentCardComponent],
  templateUrl: './sales-rep-details.component.html'
})
export class SalesRepDetailsComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public translate = inject(TranslateService);

  userId: string | null = null;
  repName: string = '';
  customers: SalesRepCustomerResponse[] = [];
  warehouses: SalesRepWarehouseResponse[] = [];
  loading = false;
  activeTab: 'customers' | 'warehouses' = 'customers';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadDetails(this.userId);
    }
  }

  loadDetails(userId: string): void {
    this.loading = true;
    this.salesRepService.getCustomersByRepId(userId).subscribe({
      next: (res) => {
        this.customers = res;
      }
    });

    this.salesRepService.getWarehousesByRepId(userId).subscribe({
      next: (res) => {
        this.warehouses = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.salesRepService.getAll().subscribe({
      next: (reps) => {
        const found = reps.find(r => r.userId === userId);
        if (found) {
          this.repName = found.userName;
        }
      }
    });
  }

  setTab(tab: 'customers' | 'warehouses'): void {
    this.activeTab = tab;
  }

  onBack(): void {
    this.router.navigate(['/administration/sales-reps']);
  }
}
