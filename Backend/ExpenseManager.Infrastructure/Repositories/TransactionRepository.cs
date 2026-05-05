using ExpenseManager.Core.DTOs;
using ExpenseManager.Core.Interfaces;
using ExpenseManager.Core.Models;
using ExpenseManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManager.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    public TransactionRepository(AppDbContext context) => _context = context;

    public async Task<PagedResult<TransactionResponseDto>> GetAllAsync(int userId, TransactionFilterDto filter)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(t => t.TransactionDate >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(t => t.TransactionDate <= filter.EndDate.Value);
        if (filter.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
        if (!string.IsNullOrEmpty(filter.Type))
            query = query.Where(t => t.Type == filter.Type);
        if (!string.IsNullOrEmpty(filter.PaymentMethod))
            query = query.Where(t => t.PaymentMethod == filter.PaymentMethod);
        if (filter.MinAmount.HasValue)
            query = query.Where(t => t.Amount >= filter.MinAmount.Value);
        if (filter.MaxAmount.HasValue)
            query = query.Where(t => t.Amount <= filter.MaxAmount.Value);
        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(t => t.Description!.Contains(filter.SearchTerm) ||
                                     t.Notes!.Contains(filter.SearchTerm));

        query = filter.SortBy.ToLower() switch
        {
            "amount" => filter.SortOrder == "asc" ? query.OrderBy(t => t.Amount) : query.OrderByDescending(t => t.Amount),
            "category" => filter.SortOrder == "asc" ? query.OrderBy(t => t.Category.Name) : query.OrderByDescending(t => t.Category.Name),
            _ => filter.SortOrder == "asc" ? query.OrderBy(t => t.TransactionDate) : query.OrderByDescending(t => t.TransactionDate)
        };

        var totalCount = await query.CountAsync();
        var transactions = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                CategoryColor = t.Category.Color,
                Amount = t.Amount,
                Type = t.Type,
                Description = t.Description,
                Notes = t.Notes,
                TransactionDate = t.TransactionDate,
                PaymentMethod = t.PaymentMethod,
                Tags = t.Tags,
                IsRecurring = t.IsRecurring,
                CreatedAt = t.CreatedAt
            }).ToListAsync();

        return new PagedResult<TransactionResponseDto>
        {
            Data = transactions,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TransactionResponseDto?> GetByIdAsync(int id, int userId)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                CategoryColor = t.Category.Color,
                Amount = t.Amount,
                Type = t.Type,
                Description = t.Description,
                Notes = t.Notes,
                TransactionDate = t.TransactionDate,
                PaymentMethod = t.PaymentMethod,
                Tags = t.Tags,
                IsRecurring = t.IsRecurring,
                CreatedAt = t.CreatedAt
            }).FirstOrDefaultAsync();
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction == null) return false;
        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId, int month, int year)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);
        var prevStart = startDate.AddMonths(-1);
        var prevEnd = startDate.AddDays(-1);

        var currentTransactions = await _context.Transactions
            .Where(t => t.UserId == userId && t.TransactionDate >= startDate && t.TransactionDate <= endDate)
            .Include(t => t.Category)
            .ToListAsync();

        var prevTransactions = await _context.Transactions
            .Where(t => t.UserId == userId && t.TransactionDate >= prevStart && t.TransactionDate <= prevEnd)
            .ToListAsync();

        var totalIncome = currentTransactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
        var totalExpense = currentTransactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);
        var prevIncome = prevTransactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
        var prevExpense = prevTransactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);

        var user = await _context.Users.FindAsync(userId);
        var topCategories = currentTransactions
            .Where(t => t.Type == "Expense")
            .GroupBy(t => t.Category)
            .Select(g => new CategoryExpenseDto
            {
                CategoryId = g.Key.Id,
                CategoryName = g.Key.Name,
                Icon = g.Key.Icon,
                Color = g.Key.Color,
                Amount = g.Sum(t => t.Amount),
                Percentage = totalExpense > 0 ? Math.Round(g.Sum(t => t.Amount) / totalExpense * 100, 2) : 0
            })
            .OrderByDescending(c => c.Amount)
            .Take(6)
            .ToList();

        var recentTransactions = currentTransactions
            .OrderByDescending(t => t.TransactionDate)
            .Take(5)
            .Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                CategoryColor = t.Category.Color,
                Amount = t.Amount,
                Type = t.Type,
                Description = t.Description,
                TransactionDate = t.TransactionDate,
                PaymentMethod = t.PaymentMethod,
                CreatedAt = t.CreatedAt
            }).ToList();

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.IsActive)
            .Select(b => new BudgetStatusDto
            {
                BudgetId = b.Id,
                Name = b.Name,
                Amount = b.Amount,
                SpentAmount = b.SpentAmount,
                Percentage = b.Amount > 0 ? Math.Round(b.SpentAmount / b.Amount * 100, 2) : 0,
                Status = b.Amount > 0
                    ? (b.SpentAmount / b.Amount * 100 >= 100 ? "Exceeded"
                        : b.SpentAmount / b.Amount * 100 >= b.AlertThreshold ? "Warning" : "Safe")
                    : "Safe"
            }).ToListAsync();

        return new DashboardSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            NetBalance = totalIncome - totalExpense,
            MonthlyBudget = user?.MonthlyBudget ?? 0,
            BudgetUsedPercentage = user?.MonthlyBudget > 0 ? Math.Round(totalExpense / user.MonthlyBudget * 100, 2) : 0,
            TotalTransactions = currentTransactions.Count,
            IncomeChangePercent = prevIncome > 0 ? Math.Round((totalIncome - prevIncome) / prevIncome * 100, 2) : 0,
            ExpenseChangePercent = prevExpense > 0 ? Math.Round((totalExpense - prevExpense) / prevExpense * 100, 2) : 0,
            TopExpenseCategories = topCategories,
            RecentTransactions = recentTransactions,
            BudgetStatuses = budgets
        };
    }

    public async Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int userId, int months)
    {
        var result = new List<MonthlyTrendDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var start = new DateTime(date.Year, date.Month, 1);
            var end = start.AddMonths(1).AddDays(-1);
            var txns = await _context.Transactions
                .Where(t => t.UserId == userId && t.TransactionDate >= start && t.TransactionDate <= end)
                .ToListAsync();
            result.Add(new MonthlyTrendDto
            {
                Month = date.ToString("MMM"),
                Year = date.Year,
                Income = txns.Where(t => t.Type == "Income").Sum(t => t.Amount),
                Expense = txns.Where(t => t.Type == "Expense").Sum(t => t.Amount),
                Net = txns.Where(t => t.Type == "Income").Sum(t => t.Amount) -
                      txns.Where(t => t.Type == "Expense").Sum(t => t.Amount)
            });
        }
        return result;
    }

    public async Task<List<CategoryExpenseDto>> GetExpenseByCategoryAsync(int userId, DateTime startDate, DateTime endDate)
    {
        var totalExpense = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "Expense" &&
                        t.TransactionDate >= startDate && t.TransactionDate <= endDate)
            .SumAsync(t => t.Amount);

        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Type == "Expense" &&
                        t.TransactionDate >= startDate && t.TransactionDate <= endDate)
            .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Icon, t.Category.Color })
            .Select(g => new CategoryExpenseDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Icon = g.Key.Icon,
                Color = g.Key.Color,
                Amount = g.Sum(t => t.Amount),
                Percentage = totalExpense > 0 ? Math.Round(g.Sum(t => t.Amount) / totalExpense * 100, 2) : 0
            })
            .OrderByDescending(c => c.Amount)
            .ToListAsync();
    }
}
