import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Category, PagedResult, Transaction, TransactionFilter } from '../../core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    CurrencyPipe, DatePipe,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  private txService  = inject(TransactionService);
  private catService = inject(CategoryService);
  private auth       = inject(AuthService);
  private fb         = inject(FormBuilder);
  private toastr     = inject(ToastrService);

  pagedResult  = signal<PagedResult<Transaction> | null>(null);
  categories   = signal<Category[]>([]);
  loading      = signal(false);
  saving       = signal(false);
  showForm     = signal(false);
  editingId    = signal<number | null>(null);
  searchTimer: any;

  currency = computed(() => this.auth.currentUser()?.currency ?? 'USD');

  filteredCategories = computed(() => {
    const type = this.txForm.get('type')?.value;
    return this.categories().filter(c => !type || c.type === type);
  });

  filter: Partial<TransactionFilter> = {
    searchTerm: '', type: '', categoryId: '',
    startDate: '', endDate: '',
    page: 1, pageSize: 10,
    sortBy: 'TransactionDate', sortOrder: 'desc',
  };

  txForm = this.fb.group({
    categoryId:      ['', Validators.required],
    amount:          ['', [Validators.required, Validators.min(0.01)]],
    type:            ['Expense', Validators.required],
    description:     [''],
    notes:           [''],
    transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
    paymentMethod:   ['Cash'],
    tags:            [''],
    isRecurring:     [false],
  });

  paymentMethods = ['Cash','Credit Card','Debit Card','Bank Transfer','Digital Wallet','Cheque'];

  ngOnInit(): void {
    this.catService.getAll().subscribe(c => this.categories.set(c));
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.txService.getAll(this.filter).subscribe({
      next: data => { this.pagedResult.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applyFilter(), 380);
  }

  applyFilter(): void {
    this.filter = { ...this.filter, page: 1 };
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filter = { searchTerm:'', type:'', categoryId:'', startDate:'', endDate:'', page:1, pageSize:10, sortBy:'TransactionDate', sortOrder:'desc' };
    this.loadTransactions();
  }

  changePage(page: number): void {
    this.filter = { ...this.filter, page };
    this.loadTransactions();
  }

  openForm(tx?: Transaction): void {
    if (tx) {
      this.editingId.set(tx.id);
      this.txForm.patchValue({
        categoryId:      String(tx.categoryId),
        amount:          String(tx.amount),
        type:            tx.type,
        description:     tx.description ?? '',
        notes:           tx.notes ?? '',
        transactionDate: new Date(tx.transactionDate).toISOString().split('T')[0],
        paymentMethod:   tx.paymentMethod,
        tags:            tx.tags ?? '',
        isRecurring:     tx.isRecurring,
      });
    } else {
      this.editingId.set(null);
      this.txForm.reset({
        type: 'Expense', paymentMethod: 'Cash', isRecurring: false,
        transactionDate: new Date().toISOString().split('T')[0],
      });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveTransaction(): void {
    if (this.txForm.invalid) return;
    this.saving.set(true);
    const raw = this.txForm.value;
    const payload = { ...raw, categoryId: Number(raw.categoryId), amount: Number(raw.amount) };

    if (this.editingId()) {
      this.txService.update(this.editingId()!, payload as any).subscribe({
        next: () => {
          this.toastr.success(`Transaction updated!`);
          this.saving.set(false);
          this.closeForm();
          this.loadTransactions();
        },
        error: () => { this.saving.set(false); this.toastr.error('Failed to save transaction'); },
      });
      return;
    }

    this.txService.create(payload as any).subscribe({
      next: () => {
        this.toastr.success(`Transaction ${this.editingId() ? 'updated' : 'added'}!`);
        this.saving.set(false);
        this.closeForm();
        this.loadTransactions();
      },
      error: () => { this.saving.set(false); this.toastr.error('Failed to save transaction'); },
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm('Delete this transaction?')) return;
    this.txService.delete(id).subscribe({
      next: () => { this.toastr.success('Deleted!'); this.loadTransactions(); },
      error: () => this.toastr.error('Failed to delete'),
    });
  }
}
