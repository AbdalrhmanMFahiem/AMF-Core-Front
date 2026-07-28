import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    if (authService.hasDashboardPermission()) {
      return true;
    }
    // Fallback: If user has no permission for Dashboard, redirect automatically to Homepage
    console.warn('User has no permission for Dashboard. Redirecting to Homepage fallback.');
    router.navigate(['/']);
    return false;
  }

  // Not logged in -> Redirect to sign in page
  router.navigate(['/signin']);
  return false;
};
