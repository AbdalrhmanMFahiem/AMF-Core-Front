import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExportLoadingService, ExportLoadingOptions } from '../../../../core/services/export-loading.service';

@Component({
  selector: 'app-export-loading-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './export-loading-overlay.component.html'
})
export class ExportLoadingOverlayComponent {
  public exportLoadingService = inject(ExportLoadingService);
  public translate = inject(TranslateService);

  get defaultTitle(): string {
    const opts = this.currentOptions;
    if (opts.title) return opts.title;
    if (opts.fileType === 'pdf') return 'reports.exportLoading.pdfTitle';
    if (opts.fileType === 'general') return 'reports.exportLoading.generalTitle';
    return 'reports.exportLoading.excelTitle';
  }

  get defaultSubtitle(): string {
    const opts = this.currentOptions;
    if (opts.subtitle) return opts.subtitle;
    if (opts.fileType === 'pdf') return 'reports.exportLoading.pdfSubtitle';
    if (opts.fileType === 'general') return 'reports.exportLoading.generalSubtitle';
    return 'reports.exportLoading.excelSubtitle';
  }

  private currentOptions: ExportLoadingOptions = { fileType: 'excel' };

  constructor() {
    this.exportLoadingService.options$.subscribe(opts => {
      this.currentOptions = opts || { fileType: 'excel' };
    });
  }

  get fileType(): string {
    return this.currentOptions.fileType || 'excel';
  }
}
