import { Component, inject } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-dropdown',
  templateUrl: './language-dropdown.component.html',
  imports: [CommonModule, DropdownComponent]
})
export class LanguageDropdownComponent {
  isOpen = false;
  currentLang = 'en';

  private translateService = inject(TranslateService);

  constructor() {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLang = savedLang;
    this.translateService.setDefaultLang(savedLang);
    this.translateService.use(savedLang);
    this.setDirection(savedLang);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
    this.setDirection(lang);
    this.closeDropdown();
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
