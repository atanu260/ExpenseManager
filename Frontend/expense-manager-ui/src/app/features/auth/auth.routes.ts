import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login.component/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register.component/register.component').then(c => c.RegisterComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
