import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AthanService } from '../../core/services/athan.service';
import { AthanDto, AthanSettingsDto } from '../../core/models/athan.models';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-page.component.html',
  styles: ``
})
export class HomePageComponent implements OnInit, OnDestroy {
  private athanService = inject(AthanService);
  public translate = inject(TranslateService);

  currentTime: Date = new Date();
  gregorianDate: string = '';
  hijriDate: string = '';

  settings: AthanSettingsDto | null = null;
  prayers: AthanDto[] = [];
  nextPrayer: AthanDto | null = null;

  private clockSubscription?: Subscription;

  private langSubscription?: Subscription;

  ngOnInit(): void {
    this.updateDateStrings();
    this.startClock();
    this.loadAthanData();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateDateStrings();
    });
  }

  ngOnDestroy(): void {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private startClock(): void {
    this.clockSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
      this.updateNextPrayer();

      // Update dates at midnight
      if (this.currentTime.getHours() === 0 && this.currentTime.getMinutes() === 0 && this.currentTime.getSeconds() === 0) {
        this.updateDateStrings();
        this.loadAthanData(); // Reload prayer times for the new day
      }
    });
  }

  private updateDateStrings(): void {
    const now = new Date();
    const isEn = (this.translate.currentLang || this.translate.defaultLang) === 'en';
    
    // Gregorian
    this.gregorianDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);

    // Hijri
    this.hijriDate = new Intl.DateTimeFormat(isEn ? 'en-US-u-ca-islamic' : 'ar-SA-u-ca-islamic', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);
  }

  private loadAthanData(): void {
    this.athanService.getDefaultSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.athanService.getTimes(settings.city, settings.country, settings.method).subscribe({
          next: (prayers) => {
            this.prayers = prayers;
            this.updateNextPrayer();
          },
          error: (err) => console.error('Failed to load prayer times', err)
        });
      },
      error: (err) => console.error('Failed to load athan settings', err)
    });
  }

  private updateNextPrayer(): void {
    if (!this.prayers || this.prayers.length === 0) return;

    const now = this.currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;
    for (const prayer of this.prayers) {
      const parts = prayer.time.split(':');
      if (parts.length === 2) {
        const prayerMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (prayerMinutes > currentMinutes) {
          this.nextPrayer = prayer;
          foundNext = true;
          break;
        }
      }
    }

    // If no next prayer found today, it means the next prayer is Fajr tomorrow
    if (!foundNext && this.prayers.length > 0) {
      this.nextPrayer = this.prayers[0];
    }
  }
}
