import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SavingsService } from '../../core/services/savings.service';
import { AuthService } from '../../core/services/auth.service';
import { SavingsGoal } from '../../core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.scss',
})
export class SavingsComponent implements OnInit {
  private savingsService = inject(SavingsService);
  private auth           = inject(AuthService);
  private fb             = inject(FormBuilder);
  private toastr         = inject(ToastrService);

  goals    = signal<SavingsGoal[]>([]);
  loading  = signal(false);
  saving   = signal(false);
  showForm = signal(false);
  addingFundsId = signal<number | null>(null);
  Math     = Math;

  currency = computed(() => this.auth.currentUser()?.currency ?? 'USD');

  goalIcons   = ['savings','home','directions_car','flight','school','card_giftcard','laptop','fitness_center','account_balance','business'];
  goalColors  = ['#10b981','#6366f1','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#ef4444','#84cc16','#f97316'];

  form = this.fb.group({
    name:         ['', Validators.required],
    targetAmount: ['', [Validators.required, Validators.min(1)]],
    currentAmount:['', [Validators.required, Validators.min(0)]],
    targetDate:   ['', Validators.required],
    icon:         ['savings'],
    color:        ['#10b981'],
  });

  fundsForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.loading.set(true);
    this.savingsService.getAll().subscribe({
      next: data => { this.goals.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  progressOf(g: SavingsGoal): number {
    return g.targetAmount > 0 ? Math.min(g.currentAmount / g.targetAmount * 100, 100) : 0;
  }

  daysLeft(g: SavingsGoal): number {
    const diff = new Date(g.targetDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  saveGoal(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.savingsService.create(this.form.value as any).subscribe({
      next: () => {
        this.toastr.success('Goal created!');
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ icon: 'savings', color: '#10b981' });
        this.loadGoals();
      },
      error: () => { this.saving.set(false); this.toastr.error('Failed to create goal'); },
    });
  }

  addFunds(id: number): void {
    if (this.fundsForm.invalid) return;
    const amount = Number(this.fundsForm.value.amount);
    this.savingsService.addFunds(id, amount).subscribe({
      next: () => {
        this.toastr.success(`Added ${amount} to goal!`);
        this.addingFundsId.set(null);
        this.fundsForm.reset();
        this.loadGoals();
      },
      error: () => this.toastr.error('Failed to add funds'),
    });
  }

  deleteGoal(id: number): void {
    if (!confirm('Delete this goal?')) return;
    this.savingsService.delete(id).subscribe({
      next: () => { this.toastr.success('Deleted!'); this.loadGoals(); },
      error: () => this.toastr.error('Failed to delete'),
    });
  }
}
