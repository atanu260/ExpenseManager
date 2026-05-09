import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.authRoutes),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component/shell.component').then(c => c.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard.component/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions.component/transactions.component').then(c => c.TransactionsComponent),
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/budgets.component/budgets.component').then(c => c.BudgetsComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories.component/categories.component').then(c => c.CategoriesComponent),
      },
      {
        path: 'savings',
        loadComponent: () => import('./features/savings.component/savings.component').then(c => c.SavingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
