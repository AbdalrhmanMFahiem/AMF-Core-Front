import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../modal/modal.component';
import { ItemDetailsModalService } from '../../../../core/services/item-details-modal.service';

@Component({
  selector: 'app-item-details-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalComponent],
  templateUrl: './item-details-modal.component.html'
})
export class ItemDetailsModalComponent {
  public itemDetailsModalService = inject(ItemDetailsModalService);
  public translate = inject(TranslateService);

  activeTab: 'general' | 'stock' | 'bom' = 'general';

  setActiveTab(tab: 'general' | 'stock' | 'bom'): void {
    this.activeTab = tab;
  }

  close(): void {
    this.itemDetailsModalService.close();
    this.activeTab = 'general';
  }
}
