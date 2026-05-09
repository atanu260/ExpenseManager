import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CategoryExpense, DashboardSummary, MonthlyTrend,
  PagedResult, Transaction, TransactionFilter
} from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API = 'http://localhost:5000/api/transactions';
  private http = inject(HttpClient);

  getAll(filter: Partial<TransactionFilter>): Observable<PagedResult<Transaction>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<PagedResult<Transaction>>(this.API, { params });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API}/${id}`);
  }

  create(data: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(this.API, data);
  }

  update(id: number, data: Partial<Transaction>): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getDashboard(month: number, year: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API}/dashboard`, {
      params: new HttpParams().set('month', month).set('year', year)
    });
  }

  getTrends(months = 6): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.API}/trends`, {
      params: new HttpParams().set('months', months)
    });
  }

  getByCategory(startDate: string, endDate: string): Observable<CategoryExpense[]> {
    return this.http.get<CategoryExpense[]>(`${this.API}/by-category`, {
      params: new HttpParams().set('startDate', startDate).set('endDate', endDate)
    });
  }
}
