export interface User {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string;
  currency: string;
  monthlyBudget: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface Category {
  id: number;
  userId?: number;
  name: string;
  icon: string;
  color: string;
  type: 'Income' | 'Expense';
  isDefault: boolean;
}

export interface Transaction {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  type: 'Income' | 'Expense';
  description?: string;
  notes?: string;
  transactionDate: Date;
  paymentMethod: string;
  tags?: string;
  isRecurring: boolean;
  createdAt: Date;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  type?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  monthlyBudget: number;
  budgetUsedPercentage: number;
  totalTransactions: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  topExpenseCategories: CategoryExpense[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: Transaction[];
  budgetStatuses: BudgetStatus[];
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface Budget {
  id: number;
  categoryId?: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  name: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  period: string;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  isActive: boolean;
  status: 'Safe' | 'Warning' | 'Exceeded';
}

export interface BudgetStatus {
  budgetId: number;
  name: string;
  amount: number;
  spentAmount: number;
  percentage: number;
  status: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  icon: string;
  color: string;
  isCompleted: boolean;
}
