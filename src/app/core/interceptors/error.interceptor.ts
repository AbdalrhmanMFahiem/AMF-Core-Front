import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const router = inject(Router);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.toLowerCase().includes('/auth');
      const errStr = JSON.stringify(error.error || '').toLowerCase();
      const isTokenExpired =
        error.status === 401 ||
        error.error?.errorCode === 'TOKEN_EXPIRED' ||
        error.headers.get('Token-Expired') === 'true' ||
        errStr.includes('token_expired') ||
        errStr.includes('expired') ||
        errStr.includes('جلسة منتهية') ||
        errStr.includes('انتهت صلاحية الجلسة');

      if (isTokenExpired && !isAuthEndpoint) {
        toastr.error(
          translate.instant('errors.tokenExpired') || 'Your session has expired. Please log in again.',
          translate.instant('errors.sessionExpired') || 'Session Expired'
        );

        localStorage.removeItem('token');
        localStorage.removeItem('authResponse');
        if (!router.url.includes('/signin')) {
          router.navigate(['/signin']);
        }
        return throwError(() => error);
      }

      if (error.status === 403) {
        if (!router.url.includes('/unauthorized')) {
          router.navigate(['/unauthorized'], { queryParams: { attemptedUrl: router.url } });
        }
        return throwError(() => error);
      }

      if (error.error && Array.isArray(error.error.errors)) {
        const errors = error.error.errors;
        const errorTitle = translate.instant('errors.generic') || 'Error';
        errors.forEach((errItem: any) => {
          const code = errItem.code ? `<b>[${errItem.code}]</b><br/>` : '';
          const desc = errItem.description || translate.instant('errors.generic') || 'Unknown error occurred.';
          toastr.error(`${code}${desc}`, errorTitle, { enableHtml: true });
        });
      } else if (error.error && error.error.title) {
        // Fallback for standard ProblemDetails without 'errors' array
        const errorTitle = `${translate.instant('errors.generic') || 'Error'} ${error.status}`;
        toastr.error(error.error.title, errorTitle);
      } else if (error.status === 0) {
        toastr.error(
          translate.instant('errors.networkError') || 'Unable to connect to the server. Please check your connection.',
          translate.instant('errors.networkErrorTitle') || 'Network Error'
        );
      } else {
        // Generic fallback
        toastr.error(
          translate.instant('errors.generic') || 'An unexpected error occurred. Please try again later.',
          translate.instant('errors.generic') || 'Error'
        );
      }

      return throwError(() => error);
    })
  );
};
