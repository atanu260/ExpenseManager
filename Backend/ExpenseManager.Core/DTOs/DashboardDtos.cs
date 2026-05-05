namespace ExpenseManager.Core.DTOs;

public class DashboardSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetBalance { get; set; }
    public decimal MonthlyBudget { get; set; }
    public decimal BudgetUsedPercentage { get; set; }
    public int TotalTransactions { get; set; }
    public decimal IncomeChangePercent { get; set; }
    public decimal ExpenseChangePercent { get; set; }
    public List<CategoryExpenseDto> TopExpenseCategories { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
    public List<TransactionResponseDto> RecentTransactions { get; set; } = new();
    public List<BudgetStatusDto> BudgetStatuses { get; set; } = new();
}

public class CategoryExpenseDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}

public class MonthlyTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Net { get; set; }
}

public class BudgetStatusDto
{
    public int BudgetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal Percentage { get; set; }
    public string Status { get; set; } = "Safe"; // Safe | Warning | Exceeded
}
