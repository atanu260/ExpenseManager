import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'https://localhost:7045/api/auth';
  private http   = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(this.loadUserFromStorage());

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('em_user');
    return stored ? JSON.parse(stored) : null;
  }

  register(data: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.persistAuth(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res => this.persistAuth(res))
    );
  }

  logout(): void {
    localStorage.removeItem('em_token');
    localStorage.removeItem('em_user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.API}/profile`, data).pipe(
      tap(() => {
        const updated = { ...this.currentUser()!, ...data };
        this.currentUser.set(updated);
        localStorage.setItem('em_user', JSON.stringify(updated));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('em_token');
  }

  getToken(): string | null {
    return localStorage.getItem('em_token');
  }

  private persistAuth(res: AuthResponse): void {
    localStorage.setItem('em_token', res.token);
    localStorage.setItem('em_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }
}
