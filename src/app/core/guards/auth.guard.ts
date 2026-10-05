import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return (
    auth.isAuthenticated() ||
    inject(Router).createUrlTree(["/login"], {
      queryParams: { returnUrl: state.url },
    })
  );
};

export const guestGuard: CanActivateFn = () =>
  !inject(AuthService).isAuthenticated() ||
  inject(Router).createUrlTree(["/solicitudes"]);

export function safeReturnUrl(value: string | null): string {
  return value && /^\/solicitudes(?:\/nueva)?(?:\?[^#]*)?$/.test(value)
    ? value
    : "/solicitudes";
}
