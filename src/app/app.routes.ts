import { Routes } from '@angular/router';
import { guestGuard, authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: 'registro', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'solicitudes/nueva', canActivate: [authGuard], loadComponent: () => import('./features/credit-requests/create-credit-request/create-credit-request').then(m => m.CreateCreditRequest) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
