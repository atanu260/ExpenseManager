import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="auth-branding">
          <div class="brand-logo">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <h1>ExpenseIQ</h1>
          <p>Smart money management for modern life. Track expenses, set budgets, and achieve your financial goals.</p>
          <div class="feature-list">
            <div class="feature-item" *ngFor="let f of features">
              <mat-icon>{{ f.icon }}</mat-icon>
              <span>{{ f.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Welcome back!</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <mat-icon>email</mat-icon>
                <input type="email" formControlName="email" placeholder="you@example.com" />
              </div>
              <span class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Valid email is required
              </span>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <mat-icon>lock</mat-icon>
                <input [type]="showPassword ? 'text' : 'password'"
                       formControlName="password" placeholder="••••••••" />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
            </div>

            <button type="submit" class="auth-btn" [disabled]="loading || loginForm.invalid">
              <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!loading">login</mat-icon>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/auth/register">Create one free</a></p>
          </div>

          <div class="demo-credentials">
            <p>Demo: <strong>demo@expense.com</strong> / <strong>Demo@123</strong></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--background);
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: -100px; right: -100px;
        width: 400px; height: 400px;
        background: rgba(99,102,241,0.3);
        border-radius: 50%;
        filter: blur(80px);
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -100px; left: -100px;
        width: 300px; height: 300px;
        background: rgba(167,139,250,0.2);
        border-radius: 50%;
        filter: blur(60px);
      }
    }
    .auth-branding {
      color: white;
      max-width: 400px;
      position: relative;
      z-index: 1;
      .brand-logo {
        width: 64px; height: 64px;
        background: linear-gradient(135deg, #818cf8, #6366f1);
        border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(99,102,241,0.4);
        mat-icon { font-size: 32px; }
      }
      h1 {
        font-size: 36px; font-weight: 800; margin-bottom: 16px;
        background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      p {
        font-size: 15px; color: rgba(255,255,255,0.7);
        line-height: 1.7; margin-bottom: 32px;
      }
    }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 14px;
      mat-icon { color: #818cf8; font-size: 20px; }
      span { font-size: 14px; color: rgba(255,255,255,0.8); }
    }
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .auth-card {
      width: 100%;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
      h2 { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
      p { font-size: 14px; color: var(--text-secondary); }
    }
    .form-group {
      margin-bottom: 20px;
      label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    }
    .input-wrapper {
      display: flex; align-items: center;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 0 14px;
      gap: 10px;
      transition: border-color 0.2s;
      background: #fafafa;
      &:focus-within { border-color: var(--primary); background: white; }
      mat-icon { font-size: 18px; color: var(--text-secondary); flex-shrink: 0; }
      input {
        flex: 1; border: none; background: transparent;
        padding: 12px 0; font-size: 14px; outline: none;
        font-family: 'Inter', sans-serif;
        &::placeholder { color: #cbd5e1; }
      }
      .toggle-password {
        background: none; border: none; cursor: pointer;
        color: var(--text-secondary); padding: 0;
        display: flex; align-items: center;
        mat-icon { font-size: 18px; }
      }
    }
    .error { font-size: 12px; color: var(--danger); margin-top: 4px; display: block; }
    .auth-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; border: none; border-radius: 10px;
      font-size: 15px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s; margin-top: 8px;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
      &:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    }
    .auth-footer {
      text-align: center; margin-top: 24px;
      p { font-size: 14px; color: var(--text-secondary); }
      a { color: var(--primary); font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
    }
    .demo-credentials {
      margin-top: 16px; padding: 12px; background: #f0f9ff;
      border-radius: 8px; text-align: center;
      p { font-size: 12px; color: #0369a1; }
    }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; padding: 24px 16px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  features = [
    { icon: 'track_changes', text: 'Track all income & expenses in one place' },
    { icon: 'pie_chart', text: 'Visualize spending with beautiful charts' },
    { icon: 'account_balance', text: 'Set smart budgets and get alerts' },
    { icon: 'savings', text: 'Plan & achieve your savings goals' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.toastr.success('Welcome back!', 'Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Invalid email or password', 'Login Failed');
      }
    });
  }
}
