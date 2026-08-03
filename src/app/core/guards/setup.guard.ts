import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export const setupGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow access if navigated from sign-in form with verified admin credentials in router history state
  const navigation = router.getCurrentNavigation();
  const adminEmail = navigation?.extras?.state?.['adminEmail'] || history.state?.['adminEmail'];
  if (adminEmail) {
    return true;
  }

  if (authService.getToken()) {
    return true;
  }

  router.navigate(['/signin']);
  return false;
};
