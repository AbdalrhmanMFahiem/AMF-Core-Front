import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export const setupGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    const authData = authService.getAuthResponse();
    if (authData?.requiresSetup) {
      return true;
    }
    router.navigate(['/']); // Already setup, go to dashboard
    return false;
  }

  router.navigate(['/signin']);
  return false;
};
