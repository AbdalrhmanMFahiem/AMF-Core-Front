import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean | Observable<boolean>;
  getUnsavedChangesMessage?(): string;
  confirmDeactivation?(): Observable<boolean> | Promise<boolean> | boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    if (component.confirmDeactivation) {
      return component.confirmDeactivation();
    }
    const message = component.getUnsavedChangesMessage 
      ? component.getUnsavedChangesMessage() 
      : 'You have unsaved changes. Are you sure you want to leave?';
    return confirm(message);
  }
  return true;
};
