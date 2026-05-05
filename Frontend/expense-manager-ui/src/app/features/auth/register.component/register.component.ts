import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="auth-branding">
          <div class="brand-logo"><mat-icon>account_balance_wallet</mat-icon></div>
          <h1>ExpenseIQ</h1>
          <p>Join thousands of users managing their finances smarter. Create your free account in seconds.</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create Account</h2>
            <p>Start your financial journey today</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="onRegister()" class="auth-form">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <mat-icon>person</mat-icon>
                <input formControlName="fullName" placeholder="John Doe" />
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <mat-icon>email</mat-icon>
                <input type="email" formControlName="email" placeholder="you@example.com" />
              </div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <mat-icon>lock</mat-icon>
                <input type="password" formControlName="password" placeholder="Min 6 characters" />
              </div>
            </div>
            <div class="form-group">
              <label>Currency</label>
              <div class="input-wrapper">
                <mat-icon>currency_exchange</mat-icon>
                <select formControlName="currency">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
            <button type="submit" class="auth-btn" [disabled]="loading || form.invalid">
              <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!loading">person_add</mat-icon>
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login.component/login.component.scss'] // Reuse login styles
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      currency: ['USD']
    });
  }

  onRegister(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.toastr.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Registration failed. Email may already exist.');
      }
    });
  }
}
