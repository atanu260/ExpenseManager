import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget } from '../models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly API = 'https://localhost:7045/api/budgets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.API);
  }

  create(data: any): Observable<Budget> {
    return this.http.post<Budget>(this.API, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
