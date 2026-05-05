using ExpenseManager.Core.Interfaces;
using ExpenseManager.Core.Models;
using ExpenseManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManager.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    public CategoryRepository(AppDbContext context) => _context = context;

    public async Task<List<Category>> GetAllAsync(int userId)
    {
        return await _context.Categories
            .Where(c => c.UserId == null || c.UserId == userId)
            .OrderBy(c => c.Type).ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id) =>
        await _context.Categories.FindAsync(id);

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (cat == null) return false;
        _context.Categories.Remove(cat);
        await _context.SaveChangesAsync();
        return true;
    }
}
