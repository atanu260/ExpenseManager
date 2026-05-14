import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingsGoal } from '../models';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  private readonly API = 'https://localhost:7045/api/savings';
  private http = inject(HttpClient);

  getAll(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(this.API);
  }

  create(data: Partial<SavingsGoal>): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(this.API, data);
  }

  update(id: number, data: Partial<SavingsGoal>): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, data);
  }

  addFunds(id: number, amount: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/add-funds`, { amount });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
