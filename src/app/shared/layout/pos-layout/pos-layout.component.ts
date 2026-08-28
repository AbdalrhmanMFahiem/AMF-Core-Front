import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ExportLoadingOverlayComponent } from '../../components/ui/export-loading-overlay/export-loading-overlay.component';
import { ItemDetailsModalComponent } from '../../components/ui/item-details-modal/item-details-modal.component';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ExportLoadingOverlayComponent,
    ItemDetailsModalComponent
  ],
  templateUrl: './pos-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
  `]
})
export class PosLayoutComponent {}
