import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-loader.component.html',
  styleUrl: './language-loader.component.css'
})
export class LanguageLoaderComponent {
  @Input() visible = false;
  @Input() targetLang = 'en';

  get isArabic(): boolean {
    return this.targetLang === 'ar';
  }

  get primaryName(): string {
    return this.isArabic ? 'نظام AMF الأساسي' : 'AMF Core Systems';
  }

  get secondaryName(): string {
    return this.isArabic ? 'AMF Core Systems' : 'نظام AMF الأساسي';
  }

  get loadingText(): string {
    return this.isArabic ? 'جاري تبديل اللغة...' : 'Switching language...';
  }
}
