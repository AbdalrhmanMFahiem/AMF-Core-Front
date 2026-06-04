import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if we have the custom problem details structure with an 'errors' array
      if (error.error && Array.isArray(error.error.errors)) {
        const errors = error.error.errors;
        errors.forEach((errItem: any) => {
          const code = errItem.code ? `[${errItem.code}] ` : '';
          const desc = errItem.description || 'Unknown error occurred.';
          toastr.error(`${code}${desc}`, 'Error');
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
