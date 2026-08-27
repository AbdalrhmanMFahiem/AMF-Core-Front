import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideTranslateService, MissingTranslationHandler, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, firstValueFrom } from 'rxjs';
import arTranslations from '../../public/i18n/ar.json';
import enTranslations from '../../public/i18n/en.json';

class SyncTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    if (lang === 'ar') {
      return of(arTranslations);
    } else if (lang === 'en') {
      return of(enTranslations);
    }
    return of({});
  }
}
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CustomMissingTranslationHandler } from './core/handlers/missing-translation.handler';
import { PermissionsService } from './core/services/permissions.service';
import { AuthService } from './core/services/auth.service';
import { AppConfigService } from './core/services/app-config.service';

export function initializeApp(appConfigService: AppConfigService, permissionsService: PermissionsService, authService: AuthService) {
  return () => {
    return appConfigService.loadConfig()
      .then(() => {
        if (authService.getToken()) {
          return firstValueFrom(permissionsService.loadPermissions());
        }
        return Promise.resolve([]);
      })
      .then(() => {});
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, languageInterceptor, errorInterceptor])),
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'yyyy-MM-dd hh:mm a' } },
    provideAnimations(),
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    provideTranslateService({
      fallbackLang: 'ar',
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler
      },
      loader: {
        provide: TranslateLoader,
        useClass: SyncTranslateLoader
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService, PermissionsService, AuthService],
      multi: true
    }
  ]
};
