import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private catService = inject(CategoryService);
  private fb         = inject(FormBuilder);
  private toastr     = inject(ToastrService);

  categories = signal<Category[]>([]);
  showForm   = signal(false);
  editingId  = signal<number | null>(null);

  form = this.fb.group({
    name:  ['', Validators.required],
    type:  ['Expense', Validators.required],
    icon:  ['receipt'],
    color: ['#6366f1'],
  });

  popularIcons = [
    'restaurant','shopping_cart','directions_car','movie','medical_services',
    'home','school','bolt','flight','local_grocery_store','work','trending_up',
    'account_balance_wallet','savings','card_giftcard','sports_esports','fitness_center',
    'local_cafe','build','pets',
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.catService.getAll().subscribe(c => this.categories.set(c));
  }

  getCategoriesByType(type: string): Category[] {
    return this.categories().filter(c => c.type === type);
  }

  openForm(cat?: Category): void {
    if (cat) {
      this.editingId.set(cat.id);
      this.form.patchValue({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color });
    } else {
      this.editingId.set(null);
      this.form.reset({ type: 'Expense', icon: 'receipt', color: '#6366f1' });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveCategory(): void {
    if (this.form.invalid) return;
    if (this.editingId()) {
      this.catService.update(this.editingId()!, this.form.value as any).subscribe({
        next: () => {
          this.toastr.success(`Category updated!`);
          this.closeForm();
          this.loadCategories();
        },
        error: () => this.toastr.error('Failed to save'),
      });
      return;
    }

    this.catService.create(this.form.value as any).subscribe({
      next: () => {
        this.toastr.success(`Category ${this.editingId() ? 'updated' : 'created'}!`);
        this.closeForm();
        this.loadCategories();
      },
      error: () => this.toastr.error('Failed to save'),
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.catService.delete(id).subscribe({
      next: () => { this.toastr.success('Deleted!'); this.loadCategories(); },
      error: () => this.toastr.error('Cannot delete — it may be in use'),
    });
  }

  setIcon(icon: string): void {
    this.form.patchValue({ icon });
  }
}
