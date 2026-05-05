import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ToastrService } from 'ngx-toastr';
import { Budget, Category } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, CurrencyPipe],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  loading = false;
  showForm = false;
  saving = false;
  budgetForm!: FormGroup;
  Math = Math;

  constructor(
    private budgetService: BudgetService,
    private catService: CategoryService,
    public auth: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  get currency(): string { return this.auth.currentUser()?.currency || 'USD'; }
  get expenseCategories(): Category[] { return this.categories.filter(c => c.type === 'Expense'); }

  ngOnInit(): void {
    this.initForm();
    this.loadBudgets();
    this.catService.getAll().subscribe(c => this.categories = c);
  }

  initForm(): void {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.budgetForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      period: ['Monthly', Validators.required],
      categoryId: [''],
      startDate: [today.toISOString().split('T')[0], Validators.required],
      endDate: [endOfMonth.toISOString().split('T')[0], Validators.required],
      alertThreshold: [80]
    });
  }

  loadBudgets(): void {
    this.loading = true;
    this.budgetService.getAll().subscribe({
      next: (data) => { this.budgets = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) return;
    this.saving = true;
    const data = { ...this.budgetForm.value, categoryId: this.budgetForm.value.categoryId || null };
    this.budgetService.create(data).subscribe({
      next: () => {
        this.toastr.success('Budget created!');
        this.saving = false;
        this.showForm = false;
        this.initForm();
        this.loadBudgets();
      },
      error: () => { this.saving = false; this.toastr.error('Failed to create budget'); }
    });
  }

  deleteBudget(id: number): void {
    if (!confirm('Delete this budget?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => { this.toastr.success('Budget deleted'); this.loadBudgets(); },
      error: () => this.toastr.error('Failed to delete')
    });
  }
}
