import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        toastr.error('Your session has expired. Please log in again.', 'Unauthorized');
        localStorage.removeItem('token');
        localStorage.removeItem('authResponse');
        const returnUrl = router.url;
        router.navigate(['/Auth'], { queryParams: { returnUrl } });
      } else if (error.error && Array.isArray(error.error.errors)) {
        const errors = error.error.errors;
        errors.forEach((errItem: any) => {
          const code = errItem.code ? `<b>[${errItem.code}]</b><br/>` : '';
          const desc = errItem.description || 'Unknown error occurred.';
          toastr.error(`${code}${desc}`, 'Error', { enableHtml: true });
        });
      } else if (error.error && error.error.title) {
        // Fallback for standard ProblemDetails without 'errors' array
        toastr.error(error.error.title, `Error ${error.status}`);
      } else if (error.status === 0) {
          toastr.error('Unable to connect to the server. Please check your connection.', 'Network Error');
      } else {
        // Generic fallback
        toastr.error('An unexpected error occurred. Please try again later.', 'Error');
      }

      return throwError(() => error);
    })
  );
};
