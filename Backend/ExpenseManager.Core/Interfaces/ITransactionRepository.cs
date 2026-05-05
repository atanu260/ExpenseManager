using ExpenseManager.Core.DTOs;
using ExpenseManager.Core.DTOs.Auth;
using ExpenseManager.Core.Models;

namespace ExpenseManager.Core.Interfaces;

public interface ITransactionRepository
{
    Task<PagedResult<TransactionResponseDto>> GetAllAsync(int userId, TransactionFilterDto filter);
    Task<TransactionResponseDto?> GetByIdAsync(int id, int userId);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(int id, int userId);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId, int month, int year);
    Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int userId, int months);
    Task<List<CategoryExpenseDto>> GetExpenseByCategoryAsync(int userId, DateTime startDate, DateTime endDate);
}

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(int userId);
    Task<Category?> GetByIdAsync(int id);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(int id, int userId);
}

public interface IBudgetRepository
{
    Task<List<BudgetResponseDto>> GetAllAsync(int userId);
    Task<BudgetResponseDto?> GetByIdAsync(int id, int userId);
    Task<Budget> CreateAsync(Budget budget);
    Task<Budget> UpdateAsync(Budget budget);
    Task<bool> DeleteAsync(int id, int userId);
    Task UpdateSpentAmountsAsync(int userId);
}

public interface ISavingsGoalRepository
{
    Task<List<SavingsGoal>> GetAllAsync(int userId);
    Task<SavingsGoal?> GetByIdAsync(int id, int userId);
    Task<SavingsGoal> CreateAsync(SavingsGoal goal);
    Task<SavingsGoal> UpdateAsync(SavingsGoal goal);
    Task<bool> DeleteAsync(int id, int userId);
}

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<UserDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, UserDto dto);
}
