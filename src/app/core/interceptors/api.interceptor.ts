import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError, timeout } from "rxjs";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const api = new URL(
    environment.apiUrl.replace(/\/$/, "") + "/",
    location.origin,
  );
  const destination = new URL(request.url, location.origin);
  const belongsToApi =
    destination.origin === api.origin &&
    destination.pathname.startsWith(api.pathname);
  if (!belongsToApi) return next(request);

  const auth = inject(AuthService);
  const router = inject(Router);
  const privateRequest = !destination.pathname.startsWith(
    api.pathname + "auth/",
  );
  const token = privateRequest ? auth.getToken() : null;
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    timeout({ each: environment.requestTimeoutMs }),
    catchError((error) => {
      if (privateRequest && error.status === 401) {
        auth.logout("expired");
        void router.navigate(["/login"], { queryParams: { expired: "1" } });
      }
      return throwError(() => error);
    }),
  );
};
