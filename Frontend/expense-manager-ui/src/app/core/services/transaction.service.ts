import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, MonthlyTrend, PagedResult, Transaction, TransactionFilter, CategoryExpense } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API = 'https://localhost:7045/api/transactions';

  constructor(private http: HttpClient) {}

  getAll(filter: Partial<TransactionFilter>): Observable<PagedResult<Transaction>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val.toString());
      }
    });
    return this.http.get<PagedResult<Transaction>>(this.API, { params });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API}/${id}`);
  }

  create(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(this.API, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

  getDashboard(month: number, year: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API}/dashboard?month=${month}&year=${year}`);
  }

  getTrends(months: number = 6): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.API}/trends?months=${months}`);
  }

  getByCategory(startDate: string, endDate: string): Observable<CategoryExpense[]> {
    return this.http.get<CategoryExpense[]>(`${this.API}/by-category?startDate=${startDate}&endDate=${endDate}`);
  }
}
