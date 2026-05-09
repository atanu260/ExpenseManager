import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = 'http://localhost:5000/api/categories';
  private http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API);
  }

  create(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.API, data);
  }

  update(id: number, data: Partial<Category>): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
