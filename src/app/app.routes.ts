import { Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/login/login").then((m) => m.Login),
  },
  {
    path: "registro",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/register/register").then((m) => m.Register),
  },
  {
    path: "solicitudes",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/credit-requests/credit-request-list/credit-request-list").then(
        (m) => m.CreditRequestList,
      ),
  },
  {
    path: "solicitudes/nueva",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/credit-requests/create-credit-request/create-credit-request").then(
        (m) => m.CreateCreditRequest,
      ),
  },
  { path: "", pathMatch: "full", redirectTo: "solicitudes" },
  { path: "**", redirectTo: "solicitudes" },
];
