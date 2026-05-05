using ExpenseManager.Core.DTOs;
using ExpenseManager.Core.Interfaces;
using ExpenseManager.Core.Models;
using ExpenseManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManager.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;
    public BudgetRepository(AppDbContext context) => _context = context;

    public async Task<List<BudgetResponseDto>> GetAllAsync(int userId)
    {
        return await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId)
            .Select(b => new BudgetResponseDto
            {
                Id = b.Id,
                CategoryId = b.CategoryId,
                CategoryName = b.Category != null ? b.Category.Name : null,
                CategoryIcon = b.Category != null ? b.Category.Icon : null,
                CategoryColor = b.Category != null ? b.Category.Color : null,
                Name = b.Name,
                Amount = b.Amount,
                SpentAmount = b.SpentAmount,
                Period = b.Period,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                AlertThreshold = b.AlertThreshold,
                IsActive = b.IsActive
            }).ToListAsync();
    }

    public async Task<BudgetResponseDto?> GetByIdAsync(int id, int userId) =>
        (await GetAllAsync(userId)).FirstOrDefault(b => b.Id == id);

    public async Task<Budget> CreateAsync(Budget budget)
    {
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task<Budget> UpdateAsync(Budget budget)
    {
        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var b = await _context.Budgets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (b == null) return false;
        _context.Budgets.Remove(b);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task UpdateSpentAmountsAsync(int userId)
    {
        var budgets = await _context.Budgets.Where(b => b.UserId == userId && b.IsActive).ToListAsync();
        foreach (var budget in budgets)
        {
            var spent = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Expense" &&
                            t.TransactionDate >= budget.StartDate && t.TransactionDate <= budget.EndDate &&
                            (budget.CategoryId == null || t.CategoryId == budget.CategoryId))
                .SumAsync(t => t.Amount);
            budget.SpentAmount = spent;
        }
        await _context.SaveChangesAsync();
    }
}
