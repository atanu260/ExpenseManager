import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget } from '../models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly API = 'https://localhost:7045/api/budgets';
  private http = inject(HttpClient);

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.API);
  }

  create(data: Partial<Budget>): Observable<Budget> {
    return this.http.post<Budget>(this.API, data);
  }

  update(id: number, data: Partial<Budget>): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
