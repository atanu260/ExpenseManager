import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { PagedResult, Transaction, Category } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule, CurrencyPipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  // Template_PLACEHOLDER
    <div class="transactions-page fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-subtitle">Manage all your income and expenses</p>
        </div>
        <button class="btn-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Add Transaction
        </button>
      </div>

      <!-- Filters -->
      <div class="em-card filters-card">
        <div class="filters-row">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input [(ngModel)]="filter.searchTerm" (ngModelChange)="onSearch()"
                   placeholder="Search transactions..." />
          </div>
          <select [(ngModel)]="filter.type" (change)="applyFilter()" class="filter-select">
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <select [(ngModel)]="filter.categoryId" (change)="applyFilter()" class="filter-select">
            <option value="">All Categories</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
          </select>
          <input type="date" [(ngModel)]="filter.startDate" (change)="applyFilter()" class="filter-select" />
          <input type="date" [(ngModel)]="filter.endDate" (change)="applyFilter()" class="filter-select" />
          <button class="clear-btn" (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Clear
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="em-card table-card">
        <div *ngIf="loading" class="table-loading"><mat-spinner diameter="32"></mat-spinner></div>

        <table class="tx-table" *ngIf="!loading">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Type</th>
              <th class="text-right">Amount</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of pagedResult?.data" class="tx-row">
              <td>
                <div class="category-cell">
                  <div class="cat-icon" [style.background]="tx.categoryColor + '20'">
                    <mat-icon [style.color]="tx.categoryColor">{{ tx.categoryIcon }}</mat-icon>
                  </div>
                  <span>{{ tx.categoryName }}</span>
                </div>
              </td>
              <td><span class="tx-desc">{{ tx.description || '—' }}</span></td>
              <td>{{ tx.transactionDate | date:'MMM d, y' }}</td>
              <td><span class="payment-badge">{{ tx.paymentMethod }}</span></td>
              <td><span class="badge" [class]="tx.type.toLowerCase()">{{ tx.type }}</span></td>
              <td class="text-right">
                <span [class.amount-income]="tx.type === 'Income'" [class.amount-expense]="tx.type === 'Expense'">
                  {{ tx.type === 'Income' ? '+' : '-' }}{{ tx.amount | currency:currency }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="icon-btn edit" (click)="editTransaction(tx)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="icon-btn delete" (click)="deleteTransaction(tx.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!pagedResult?.data?.length">
              <td colspan="7">
                <div class="no-data">
                  <mat-icon>receipt_long</mat-icon>
                  <p>No transactions found</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagedResult && pagedResult.totalPages > 1">
          <button [disabled]="filter.page === 1" (click)="changePage(filter.page - 1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span>Page {{ filter.page }} of {{ pagedResult.totalPages }}</span>
          <button [disabled]="filter.page === pagedResult.totalPages" (click)="changePage(filter.page + 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <!-- Modal Overlay -->
      <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Edit' : 'Add' }} Transaction</h3>
            <button class="close-btn" (click)="closeForm()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="txForm" (ngSubmit)="saveTransaction()" class="tx-form">
            <!-- Type Toggle -->
            <div class="type-toggle">
              <button type="button"
                      [class.active-income]="txForm.get('type')?.value === 'Income'"
                      (click)="txForm.patchValue({type: 'Income'})">
                <mat-icon>trending_up</mat-icon> Income
              </button>
              <button type="button"
                      [class.active-expense]="txForm.get('type')?.value === 'Expense'"
                      (click)="txForm.patchValue({type: 'Expense'})">
                <mat-icon>trending_down</mat-icon> Expense
              </button>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Amount *</label>
                <div class="input-wrapper">
                  <mat-icon>attach_money</mat-icon>
                  <input type="number" formControlName="amount" placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>

              <div class="form-group">
                <label>Category *</label>
                <div class="input-wrapper">
                  <mat-icon>category</mat-icon>
                  <select formControlName="categoryId">
                    <option value="">Select category...</option>
                    <option *ngFor="let c of filteredCategories" [value]="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Date *</label>
                <div class="input-wrapper">
                  <mat-icon>calendar_today</mat-icon>
                  <input type="date" formControlName="transactionDate" />
                </div>
              </div>

              <div class="form-group">
                <label>Payment Method</label>
                <div class="input-wrapper">
                  <mat-icon>payment</mat-icon>
                  <select formControlName="paymentMethod">
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div class="form-group full-width">
                <label>Description</label>
                <div class="input-wrapper">
                  <mat-icon>notes</mat-icon>
                  <input type="text" formControlName="description" placeholder="What was this for?" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Notes</label>
                <textarea formControlName="notes" placeholder="Additional notes..." rows="2"></textarea>
              </div>

              <div class="form-group full-width">
                <label>Tags (comma separated)</label>
                <div class="input-wrapper">
                  <mat-icon>label</mat-icon>
                  <input type="text" formControlName="tags" placeholder="food, personal, work" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="txForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="16"></mat-spinner>
                {{ editingId ? 'Update' : 'Save' }} Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-card { margin-bottom: 16px; padding: 16px 24px; }
    .filters-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      border: 1.5px solid var(--border); border-radius: 8px;
      padding: 8px 12px; background: #fafafa; flex: 1; min-width: 200px;
      mat-icon { font-size: 18px; color: var(--text-secondary); }
      input { border: none; background: transparent; outline: none; font-size: 13px; font-family: 'Inter', sans-serif; width: 100%; }
    }
    .filter-select {
      border: 1.5px solid var(--border); border-radius: 8px;
      padding: 9px 12px; font-size: 13px; font-family: 'Inter', sans-serif;
      outline: none; background: white; cursor: pointer;
    }
    .clear-btn {
      display: flex; align-items: center; gap: 4px;
      border: 1.5px solid var(--border); border-radius: 8px;
      padding: 8px 12px; background: white; cursor: pointer;
      font-size: 13px; color: var(--text-secondary);
      mat-icon { font-size: 16px; }
      &:hover { background: #f1f5f9; }
    }
    .table-card { padding: 0; overflow: hidden; }
    .table-loading { display: flex; justify-content: center; padding: 48px; }
    .tx-table {
      width: 100%; border-collapse: collapse;
      thead tr { background: #f8fafc; }
      th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
      td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
      .tx-row:hover { background: #f8fafc; }
    }
    .category-cell { display: flex; align-items: center; gap: 10px; }
    .cat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; mat-icon { font-size: 18px; } }
    .tx-desc { color: var(--text-secondary); }
    .payment-badge { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .action-btns { display: flex; align-items: center; justify-content: center; gap: 4px; }
    .icon-btn { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; transition: all 0.2s; mat-icon { font-size: 18px; } &.edit:hover { background: rgba(99,102,241,0.1); mat-icon { color: var(--primary); } } &.delete:hover { background: rgba(239,68,68,0.1); mat-icon { color: var(--danger); } } }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--border); button { background: white; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; padding: 8px; display: flex; mat-icon { font-size: 18px; } &:disabled { opacity: 0.4; cursor: not-allowed; } } span { font-size: 13px; font-weight: 500; } }
    .no-data { text-align: center; padding: 48px; color: var(--text-secondary); mat-icon { font-size: 40px; opacity: 0.3; display: block; margin: 0 auto 12px; } }

    // Modal
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-content { background: white; border-radius: 16px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; h3 { font-size: 18px; font-weight: 700; } }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; border-radius: 6px; display: flex; &:hover { background: #f1f5f9; } mat-icon { font-size: 22px; } }
    .tx-form { padding: 24px; }
    .type-toggle { display: flex; gap: 8px; margin-bottom: 20px; background: #f1f5f9; border-radius: 10px; padding: 4px; button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; background: transparent; color: var(--text-secondary); transition: all 0.2s; &.active-income { background: white; color: #10b981; box-shadow: var(--shadow); mat-icon { color: #10b981; } } &.active-expense { background: white; color: #ef4444; box-shadow: var(--shadow); mat-icon { color: #ef4444; } } } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; label { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; } &.full-width { grid-column: span 2; } }
    .input-wrapper { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 8px; padding: 0 12px; gap: 8px; background: #fafafa; &:focus-within { border-color: var(--primary); background: white; } mat-icon { font-size: 16px; color: var(--text-secondary); flex-shrink: 0; } input, select { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; } }
    textarea { border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: 'Inter', sans-serif; resize: vertical; outline: none; width: 100%; background: #fafafa; &:focus { border-color: var(--primary); } }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px; }
    .btn-cancel { border: 1.5px solid var(--border); background: white; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; &:hover { background: #f1f5f9; } }
  `]
})
export class TransactionsComponent implements OnInit {
  pagedResult: PagedResult<Transaction> | null = null;
  categories: Category[] = [];
  loading = false;
  showForm = false;
  saving = false;
  editingId: number | null = null;
  txForm!: FormGroup;

  filter = {
    searchTerm: '',
    type: '',
    categoryId: '' as any,
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10,
    sortBy: 'TransactionDate',
    sortOrder: 'desc'
  };

  constructor(
    private txService: TransactionService,
    private catService: CategoryService,
    public auth: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  get currency(): string { return this.auth.currentUser()?.currency || 'USD'; }

  get filteredCategories(): Category[] {
    const type = this.txForm?.get('type')?.value;
    return this.categories.filter(c => !type || c.type === type);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
    this.initForm();
  }

  initForm(tx?: Transaction): void {
    this.txForm = this.fb.group({
      categoryId: [tx?.categoryId || '', Validators.required],
      amount: [tx?.amount || '', [Validators.required, Validators.min(0.01)]],
      type: [tx?.type || 'Expense', Validators.required],
      description: [tx?.description || ''],
      notes: [tx?.notes || ''],
      transactionDate: [tx ? new Date(tx.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], Validators.required],
      paymentMethod: [tx?.paymentMethod || 'Cash'],
      tags: [tx?.tags || ''],
      isRecurring: [tx?.isRecurring || false]
    });
  }

  loadCategories(): void {
    this.catService.getAll().subscribe(cats => this.categories = cats);
  }

  loadTransactions(): void {
    this.loading = true;
    this.txService.getAll(this.filter).subscribe({
      next: (data) => { this.pagedResult = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    clearTimeout((this as any)._searchTimeout);
    (this as any)._searchTimeout = setTimeout(() => this.applyFilter(), 400);
  }

  applyFilter(): void {
    this.filter.page = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filter = { ...this.filter, searchTerm: '', type: '', categoryId: '', startDate: '', endDate: '', page: 1 };
    this.loadTransactions();
  }

  changePage(page: number): void {
    this.filter.page = page;
    this.loadTransactions();
  }

  openForm(): void {
    this.editingId = null;
    this.initForm();
    this.showForm = true;
  }

  editTransaction(tx: Transaction): void {
    this.editingId = tx.id;
    this.initForm(tx);
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveTransaction(): void {
    if (this.txForm.invalid) return;
    this.saving = true;
    const data = { ...this.txForm.value, categoryId: +this.txForm.value.categoryId };

    const obs = this.editingId
      ? this.txService.update(this.editingId, { ...data, id: this.editingId })
      : this.txService.create(data);

    obs.subscribe({
      next: () => {
        this.toastr.success(`Transaction ${this.editingId ? 'updated' : 'added'} successfully!`);
        this.saving = false;
        this.closeForm();
        this.loadTransactions();
      },
      error: () => { this.saving = false; this.toastr.error('Failed to save transaction'); }
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm('Delete this transaction?')) return;
    this.txService.delete(id).subscribe({
      next: () => { this.toastr.success('Transaction deleted'); this.loadTransactions(); },
      error: () => this.toastr.error('Failed to delete')
    });
  }
}
