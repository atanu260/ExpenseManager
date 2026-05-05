import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardSummary } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, BaseChartDirective, CurrencyPipe, FormsModule, MatSelectModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = true;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  Math = Math;

  months = ['January','February','March','April','May','June',
            'July','August','September','October','November','December'];

  barChartData: ChartConfiguration['data'] | null = null;
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: (v: any) => '$' + v } }
    }
  };

  doughnutData: ChartConfiguration['data'] | null = null;
  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    //cutout: '70%'
    
  };

  constructor(
    private txService: TransactionService,
    public auth: AuthService
  ) {}

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  get firstName(): string {
    return this.auth.currentUser()?.fullName.split(' ')[0] || '';
  }

  get currency(): string {
    return this.auth.currentUser()?.currency || 'USD';
  }

  get currentMonthYear(): string {
    return new Date(this.selectedYear, this.selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.txService.getDashboard(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.summary = data;
        this.buildCharts();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildCharts(): void {
    if (!this.summary) return;

    this.txService.getTrends(6).subscribe(trends => {
      this.barChartData = {
        labels: trends.map(t => t.month),
        datasets: [
          {
            label: 'Income',
            data: trends.map(t => t.income),
            backgroundColor: 'rgba(16,185,129,0.8)',
            borderRadius: 6
          },
          {
            label: 'Expense',
            data: trends.map(t => t.expense),
            backgroundColor: 'rgba(239,68,68,0.8)',
            borderRadius: 6
          }
        ]
      };
    });

    if (this.summary.topExpenseCategories.length) {
      this.doughnutData = {
        labels: this.summary.topExpenseCategories.map(c => c.categoryName),
        datasets: [{
          data: this.summary.topExpenseCategories.map(c => c.amount),
          backgroundColor: this.summary.topExpenseCategories.map(c => c.color),
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }
  }
}
