import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Budget, Category } from '../../core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private catService    = inject(CategoryService);
  private auth          = inject(AuthService);
  private fb            = inject(FormBuilder);
  private toastr        = inject(ToastrService);

  budgets    = signal<Budget[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(false);
  saving     = signal(false);
  showForm   = signal(false);
  Math       = Math;

  currency = computed(() => this.auth.currentUser()?.currency ?? 'USD');
  expenseCategories = computed(() => this.categories().filter(c => c.type === 'Expense'));

  form = this.buildForm();

  ngOnInit(): void {
    this.loadBudgets();
    this.catService.getAll().subscribe(c => this.categories.set(c));
  }

  buildForm() {
    const today  = new Date();
    const endMon = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return this.fb.group({
      name:           ['', Validators.required],
      amount:         ['', [Validators.required, Validators.min(1)]],
      period:         ['Monthly', Validators.required],
      categoryId:     [''],
      startDate:      [today.toISOString().split('T')[0], Validators.required],
      endDate:        [endMon.toISOString().split('T')[0], Validators.required],
      alertThreshold: [80],
    });
  }

  loadBudgets(): void {
    this.loading.set(true);
    this.budgetService.getAll().subscribe({
      next: data => { this.budgets.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  saveBudget(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = { ...this.form.value, categoryId: this.form.value.categoryId || null };
    this.budgetService.create(payload as any).subscribe({
      next: () => {
        this.toastr.success('Budget created!');
        this.saving.set(false);
        this.showForm.set(false);
        this.form = this.buildForm();
        this.loadBudgets();
      },
      error: () => { this.saving.set(false); this.toastr.error('Failed to create budget'); },
    });
  }

  deleteBudget(id: number): void {
    if (!confirm('Delete this budget?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => { this.toastr.success('Deleted!'); this.loadBudgets(); },
      error: () => this.toastr.error('Failed to delete'),
    });
  }
}
