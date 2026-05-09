import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe, NgClass,
    RouterLink, FormsModule,
    MatIconModule, MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private txService = inject(TransactionService);
  auth = inject(AuthService);

  summary    = signal<DashboardSummary | null>(null);
  loading    = signal(true);
  selMonth   = signal(new Date().getMonth() + 1);
  selYear    = signal(new Date().getFullYear());
  barData    = signal<ChartConfiguration['data'] | null>(null);
  donutData  = signal<ChartConfiguration['data'] | null>(null);
  Math       = Math;

  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  currency = computed(() => this.auth.currentUser()?.currency ?? 'USD');

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  });

  firstName = computed(() =>
    this.auth.currentUser()?.fullName.split(' ')[0] ?? ''
  );

  monthLabel = computed(() =>
    new Date(this.selYear(), this.selMonth() - 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' })
  );

  barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { callback: (v: any) => '$' + v },
      },
    },
  };

  donutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    //cutout: '72%',
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.txService.getDashboard(this.selMonth(), this.selYear()).subscribe({
      next: data => {
        this.summary.set(data);
        this.buildCharts();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildCharts(): void {
    this.txService.getTrends(6).subscribe(trends => {
      this.barData.set({
        labels: trends.map(t => t.month),
        datasets: [
          {
            label: 'Income',
            data: trends.map(t => t.income),
            backgroundColor: 'rgba(16,185,129,0.8)',
            borderRadius: 6,
          },
          {
            label: 'Expense',
            data: trends.map(t => t.expense),
            backgroundColor: 'rgba(239,68,68,0.8)',
            borderRadius: 6,
          },
        ],
      });
    });

    const cats = this.summary()?.topExpenseCategories ?? [];
    if (cats.length) {
      this.donutData.set({
        labels: cats.map(c => c.categoryName),
        datasets: [{
          data: cats.map(c => c.amount),
          backgroundColor: cats.map(c => c.color),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      });
    }
  }
}
