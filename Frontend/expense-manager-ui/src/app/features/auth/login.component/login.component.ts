import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private toastr  = inject(ToastrService);

  loading      = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  features = [
    { icon: 'track_changes',   text: 'Track every income & expense'          },
    { icon: 'pie_chart',       text: 'Visualize spending with rich charts'    },
    { icon: 'account_balance', text: 'Set smart budgets with alerts'          },
    { icon: 'savings',         text: 'Plan and reach your savings goals'      },
  ];

  onLogin(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.toastr.success('Welcome back!', 'Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Invalid email or password.', 'Login Failed');
      },
    });
  }
}
