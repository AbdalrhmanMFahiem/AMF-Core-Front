import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string | undefined;

  if (!requiredPermission) {
    return true; // If no permission is required, allow access
  }

  if (permissionsService.hasPermission(requiredPermission)) {
    return true;
  }

  // Not authorized, redirect to unauthorized page
  return router.createUrlTree(['/unauthorized'], { queryParams: { attemptedUrl: state.url } });
};
