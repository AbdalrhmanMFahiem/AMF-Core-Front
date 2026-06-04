import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageLoaderComponent } from './shared/components/common/language-loader/language-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LanguageLoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'AMFCore-Front';
  showLanguageLoader = false;
  targetLang = 'en';

  private translateService = inject(TranslateService);

  constructor() {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.targetLang = savedLang;
    this.translateService.setDefaultLang(savedLang);
    this.translateService.use(savedLang);
    this.setDirection(savedLang);
  }

  private setDirection(lang: string) {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }
}
