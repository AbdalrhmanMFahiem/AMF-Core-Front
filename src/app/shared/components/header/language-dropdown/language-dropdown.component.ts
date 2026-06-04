import { Component, inject, Input } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-dropdown',
  templateUrl: './language-dropdown.component.html',
  imports: [CommonModule, DropdownComponent]
})
export class LanguageDropdownComponent {
  @Input() sizeClass = 'w-10 h-10';
  @Input() openUp = false;

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
    if (lang === this.currentLang) {
      this.closeDropdown();
      return;
    }

    this.closeDropdown();
    localStorage.setItem('lang', lang);

    // Create overlay directly on body so nothing can overlap it
    this.showLoaderOverlay(lang);

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  private showLoaderOverlay(lang: string): void {
    const isAr = lang === 'ar';
    const primary = isAr ? 'نظام AMF الأساسي' : 'AMF Core Systems';
    const secondary = isAr ? 'AMF Core Systems' : 'نظام AMF الأساسي';
    const loadingText = isAr ? 'جاري تبديل اللغة...' : 'Switching language...';

    const overlay = document.createElement('div');
    overlay.id = 'lang-switch-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      animation: lso-fadeIn 0.3s ease-out;
      direction: ${isAr ? 'rtl' : 'ltr'};
    `;

    overlay.innerHTML = `
      <style>
        @keyframes lso-fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lso-slideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes lso-spin { to { transform: rotate(360deg) } }
        @keyframes lso-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes lso-slideBar { 0% { transform: translateX(-100%) } 50% { transform: translateX(250%) } 100% { transform: translateX(-100%) } }
        @keyframes lso-pulse { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
      </style>
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.25rem;animation:lso-slideUp .5s ease-out">
        <div style="position:relative;width:100px;height:100px;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:#6366f1;border-right-color:#818cf8;animation:lso-spin 1.2s linear infinite"></div>
          <div style="position:absolute;inset:8px;border-radius:50%;border:3px solid transparent;border-bottom-color:#a78bfa;border-left-color:#c4b5fd;animation:lso-spin .8s linear infinite reverse"></div>
          <span style="font-size:1.25rem;font-weight:800;letter-spacing:.15em;background:linear-gradient(135deg,#818cf8,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">AMF</span>
        </div>
        <h1 style="font-size:1.75rem;font-weight:700;color:#f1f5f9;letter-spacing:.02em;text-align:center;font-family:system-ui,sans-serif;margin:0">${primary}</h1>
        <p style="font-size:1rem;color:#94a3b8;letter-spacing:.04em;text-align:center;margin-top:-.75rem;font-family:system-ui,sans-serif">${secondary}</p>
        <div style="width:220px;height:4px;background:#1e293b;border-radius:999px;overflow:hidden;margin-top:.5rem">
          <div style="height:100%;width:40%;border-radius:999px;background:linear-gradient(90deg,#6366f1,#a78bfa,#6366f1);background-size:200% 100%;animation:lso-shimmer 1.5s ease-in-out infinite,lso-slideBar 1.8s ease-in-out infinite"></div>
        </div>
        <p style="font-size:.875rem;color:#64748b;letter-spacing:.06em;animation:lso-pulse 1.5s ease-in-out infinite;font-family:system-ui,sans-serif">${loadingText}</p>
      </div>
    `;

    document.body.appendChild(overlay);
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

//     setTimeout(() => {
//       window.location.reload();
//     }, 1500);
//   }

//   private setDirection(lang: string) {
//     if (lang === 'ar') {
//       document.documentElement.dir = 'rtl';
//       document.documentElement.lang = 'ar';
//     } else {
//       document.documentElement.dir = 'ltr';
//       document.documentElement.lang = 'en';
//     }
//   }
// }
