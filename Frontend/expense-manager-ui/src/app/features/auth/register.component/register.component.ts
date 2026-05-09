import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading      = signal(false);
  showPassword = signal(false);

  currencies = [
    { code: 'USD', label: 'USD ($)' },
    { code: 'EUR', label: 'EUR (€)' },
    { code: 'GBP', label: 'GBP (£)' },
    { code: 'INR', label: 'INR (₹)' },
    { code: 'JPY', label: 'JPY (¥)' },
    { code: 'CAD', label: 'CAD ($)' },
    { code: 'AUD', label: 'AUD ($)' },
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    currency: ['USD'],
  });

  onRegister(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.toastr.success('Account created!', 'Welcome to ExpenseIQ');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Registration failed. Email may already exist.', 'Error');
      },
    });
  }
}
