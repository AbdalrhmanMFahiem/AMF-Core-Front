import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-print-preview-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalComponent],
  templateUrl: './print-preview-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintPreviewModalComponent implements OnDestroy, OnChanges {
  private sanitizer = inject(DomSanitizer);

  @Input() isOpen = false;
  @Input() pdfBlobUrl: string | null = null;
  @Input() loading = false;
  @Input() title = 'printPreview.title';

  @Output() close = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() downloadPdf = new EventEmitter<void>();

  @ViewChild('pdfIframe') pdfIframe!: ElementRef<HTMLIFrameElement>;

  get safePdfUrl(): SafeResourceUrl | null {
    return this.pdfBlobUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfBlobUrl) : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen === false) {
      this.clearIframe();
    }
  }

  onClose() {
    this.close.emit();
  }

  onPrint() {
    if (this.pdfIframe && this.pdfIframe.nativeElement && this.pdfBlobUrl) {
      try {
        const iframeWindow = this.pdfIframe.nativeElement.contentWindow;
        if (iframeWindow) {
          iframeWindow.focus();
          iframeWindow.print();
        } else {
          this.print.emit();
        }
      } catch (error) {
        console.error('Direct print failed, emitting print event fallback', error);
        this.print.emit();
      }
    } else {
      this.print.emit();
    }
  }

  onDownloadPdf() {
    if (this.pdfBlobUrl) {
      // Use the provided blob url to download
      const a = document.createElement('a');
      a.href = this.pdfBlobUrl;
      a.download = `document_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    this.downloadPdf.emit();
  }

  private clearIframe() {
    if (this.pdfIframe && this.pdfIframe.nativeElement) {
      // Empty the iframe to free memory when closed
      this.pdfIframe.nativeElement.src = 'about:blank';
    }
  }

  ngOnDestroy() {
    this.clearIframe();
  }
}
