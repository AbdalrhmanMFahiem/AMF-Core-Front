import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-breadcrumb',
  imports: [
    RouterModule,
    TranslateModule,
    NgIf
  ],
  templateUrl: './page-breadcrumb.component.html',
  styles: ``
})
export class PageBreadcrumbComponent {
  @Input() pageTitle = '';
  @Input() parentPageTitle?: string;
  @Input() parentPageUrl?: string;
}
