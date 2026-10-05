import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: 'registro', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
