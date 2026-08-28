import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../../../core/services/tenant.service';
import { TenantSummaryResponse, TenantUserDetailResponse } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-users-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tenant-users-modal.component.html'
})
export class TenantUsersModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() tenant: TenantSummaryResponse | null = null;
  @Output() close = new EventEmitter<void>();

  private tenantService = inject(TenantService);
  public translate = inject(TranslateService);

  users: TenantUserDetailResponse[] = [];
  loading = false;
  searchQuery = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.tenant) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    if (!this.tenant) return;
    this.loading = true;
    this.users = [];
    this.searchQuery = '';

    this.tenantService.getTenantUsers(this.tenant.tenantId).subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredUsers(): TenantUserDetailResponse[] {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.trim().toLowerCase();
    return this.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.code.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some(r => r.toLowerCase().includes(q))
    );
  }

  onClose(): void {
    this.close.emit();
  }
}
