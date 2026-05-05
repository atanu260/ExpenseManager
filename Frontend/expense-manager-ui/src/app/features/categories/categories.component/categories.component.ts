import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
      <div class="page-header">
        <div>
          <h1 class="page-title">Categories</h1>
          <p class="page-subtitle">Organize your transactions with custom categories</p>
        </div>
        <button class="btn-primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Category
        </button>
      </div>

      <div class="categories-sections">
        <div class="section-block" *ngFor="let type of ['Expense', 'Income']">
          <div class="section-header">
            <div class="section-dot" [style.background]="type === 'Expense' ? '#ef4444' : '#10b981'"></div>
            <h3>{{ type }} Categories</h3>
            <span class="section-count">{{ getCategoriesByType(type).length }}</span>
          </div>
          <div class="categories-grid">
            <div class="category-card em-card" *ngFor="let cat of getCategoriesByType(type)">
              <div class="cat-icon-large" [style.background]="cat.color + '20'">
                <mat-icon [style.color]="cat.color">{{ cat.icon }}</mat-icon>
              </div>
              <div class="cat-info">
                <div class="cat-name">{{ cat.name }}</div>
                <div class="cat-badge" [style.background]="cat.color + '20'" [style.color]="cat.color">{{ cat.type }}</div>
              </div>
              <div class="cat-actions" *ngIf="!cat.isDefault">
                <button class="icon-btn edit" (click)="editCategory(cat)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="icon-btn delete" (click)="deleteCategory(cat.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="default-badge" *ngIf="cat.isDefault">System</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Edit' : 'Add' }} Category</h3>
            <button class="close-btn" (click)="closeForm()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="catForm" (ngSubmit)="saveCategory()" style="padding: 24px">
            <div class="form-group" style="margin-bottom:16px">
              <label>Name *</label>
              <div class="input-wrapper">
                <mat-icon>label</mat-icon>
                <input formControlName="name" placeholder="Category name" />
              </div>
            </div>
            <div class="type-toggle" style="margin-bottom:16px">
              <button type="button" [class.active-income]="catForm.get('type')?.value === 'Income'"
                      (click)="catForm.patchValue({type:'Income'})">
                <mat-icon>trending_up</mat-icon> Income
              </button>
              <button type="button" [class.active-expense]="catForm.get('type')?.value === 'Expense'"
                      (click)="catForm.patchValue({type:'Expense'})">
                <mat-icon>trending_down</mat-icon> Expense
              </button>
            </div>
            <div class="form-group" style="margin-bottom:16px">
              <label>Color</label>
              <div style="display:flex;align-items:center;gap:12px">
                <input type="color" formControlName="color" style="width:48px;height:40px;border:none;cursor:pointer;border-radius:8px" />
                <span>{{ catForm.get('color')?.value }}</span>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:24px">
              <label>Icon (Material Icon Name)</label>
              <div class="input-wrapper">
                <mat-icon [style.color]="catForm.get('color')?.value">{{ catForm.get('icon')?.value }}</mat-icon>
                <input formControlName="icon" placeholder="e.g. restaurant, shopping_cart" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="catForm.invalid">Save Category</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-sections { display: flex; flex-direction: column; gap: 32px; }
    .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .section-dot { width: 10px; height: 10px; border-radius: 50%; }
    .section-header h3 { font-size: 16px; font-weight: 700; }
    .section-count { background: #f1f5f9; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .category-card { display: flex; align-items: center; gap: 12px; padding: 16px; position: relative; }
    .cat-icon-large { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 22px; } }
    .cat-info { flex: 1; min-width: 0; }
    .cat-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cat-badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-top: 4px; }
    .cat-actions { display: flex; gap: 4px; }
    .icon-btn { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; mat-icon { font-size: 16px; } &.edit:hover { background: rgba(99,102,241,0.1); mat-icon { color: var(--primary); } } &.delete:hover { background: rgba(239,68,68,0.1); mat-icon { color: var(--danger); } } }
    .default-badge { font-size: 10px; background: #f1f5f9; color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-content { background: white; border-radius: 16px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; h3 { font-size: 18px; font-weight: 700; } }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; border-radius: 6px; mat-icon { font-size: 22px; } }
    .form-group { label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; } }
    .input-wrapper { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 8px; padding: 0 12px; gap: 8px; background: #fafafa; &:focus-within { border-color: var(--primary); background: white; } mat-icon { font-size: 16px; color: var(--text-secondary); } input { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; } }
    .type-toggle { display: flex; gap: 8px; background: #f1f5f9; border-radius: 10px; padding: 4px; button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; background: transparent; color: var(--text-secondary); transition: all 0.2s; &.active-income { background: white; color: #10b981; box-shadow: var(--shadow); } &.active-expense { background: white; color: #ef4444; box-shadow: var(--shadow); } } }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 16px; }
    .btn-cancel { border: 1.5px solid var(--border); background: white; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  catForm!: FormGroup;

  constructor(
    private catService: CategoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(cat?: Category): void {
    this.catForm = this.fb.group({
      name: [cat?.name || '', Validators.required],
      type: [cat?.type || 'Expense', Validators.required],
      icon: [cat?.icon || 'receipt'],
      color: [cat?.color || '#6366f1']
    });
  }

  loadCategories(): void {
    this.catService.getAll().subscribe(data => this.categories = data);
  }

  getCategoriesByType(type: string): Category[] {
    return this.categories.filter(c => c.type === type);
  }

  openForm(): void { this.editingId = null; this.initForm(); this.showForm = true; }

  editCategory(cat: Category): void {
    this.editingId = cat.id;
    this.initForm(cat);
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editingId = null; }

  saveCategory(): void {
    if (this.catForm.invalid) return;
    const obs = this.editingId
      ? this.catService.update(this.editingId, this.catForm.value)
      : this.catService.create(this.catForm.value);

    obs.subscribe({
      next: () => {
        this.toastr.success(`Category ${this.editingId ? 'updated' : 'created'}!`);
        this.closeForm();
        this.loadCategories();
      },
      error: () => this.toastr.error('Failed to save category')
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.catService.delete(id).subscribe({
      next: () => { this.toastr.success('Category deleted'); this.loadCategories(); },
      error: () => this.toastr.error('Failed to delete')
    });
  }
}
