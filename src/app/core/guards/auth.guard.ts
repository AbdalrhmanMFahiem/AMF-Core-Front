import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    const authData = authService.getAuthResponse();
    if (authData?.requiresSetup) {
      router.navigate(['/setup-company']);
      return false;
    }
    return true;
  }

  // Not logged in so redirect to login page
  router.navigate(['/signin']);
  return false;
};
