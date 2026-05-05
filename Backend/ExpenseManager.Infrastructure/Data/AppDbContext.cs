using ExpenseManager.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseManager.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<SavingsGoal> SavingsGoals => Set<SavingsGoal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e => {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.MonthlyBudget).HasPrecision(18, 2);
        });

        // Category
        modelBuilder.Entity<Category>(e => {
            e.HasOne(c => c.User)
             .WithMany(u => u.Categories)
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Transaction
        modelBuilder.Entity<Transaction>(e => {
            e.Property(t => t.Amount).HasPrecision(18, 2);
            e.HasOne(t => t.User)
             .WithMany(u => u.Transactions)
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Category)
             .WithMany(c => c.Transactions)
             .HasForeignKey(t => t.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Budget
        modelBuilder.Entity<Budget>(e => {
            e.Property(b => b.Amount).HasPrecision(18, 2);
            e.Property(b => b.SpentAmount).HasPrecision(18, 2);
            e.HasOne(b => b.User)
             .WithMany(u => u.Budgets)
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Category)
             .WithMany()
             .HasForeignKey(b => b.CategoryId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // SavingsGoal
        modelBuilder.Entity<SavingsGoal>(e => {
            e.Property(s => s.TargetAmount).HasPrecision(18, 2);
            e.Property(s => s.CurrentAmount).HasPrecision(18, 2);
            e.HasOne(s => s.User)
             .WithMany(u => u.SavingsGoals)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Food & Dining", Icon = "restaurant", Color = "#f59e0b", Type = "Expense", IsDefault = true },
            new Category { Id = 2, Name = "Transportation", Icon = "directions_car", Color = "#3b82f6", Type = "Expense", IsDefault = true },
            new Category { Id = 3, Name = "Shopping", Icon = "shopping_cart", Color = "#ec4899", Type = "Expense", IsDefault = true },
            new Category { Id = 4, Name = "Entertainment", Icon = "movie", Color = "#8b5cf6", Type = "Expense", IsDefault = true },
            new Category { Id = 5, Name = "Healthcare", Icon = "medical_services", Color = "#ef4444", Type = "Expense", IsDefault = true },
            new Category { Id = 6, Name = "Housing & Rent", Icon = "home", Color = "#06b6d4", Type = "Expense", IsDefault = true },
            new Category { Id = 7, Name = "Education", Icon = "school", Color = "#f97316", Type = "Expense", IsDefault = true },
            new Category { Id = 8, Name = "Utilities", Icon = "bolt", Color = "#84cc16", Type = "Expense", IsDefault = true },
            new Category { Id = 9, Name = "Salary", Icon = "account_balance_wallet", Color = "#10b981", Type = "Income", IsDefault = true },
            new Category { Id = 10, Name = "Freelance", Icon = "work", Color = "#22c55e", Type = "Income", IsDefault = true },
            new Category { Id = 11, Name = "Investment", Icon = "trending_up", Color = "#6366f1", Type = "Income", IsDefault = true },
            new Category { Id = 12, Name = "Other Expense", Icon = "remove_circle", Color = "#fb7185", Type = "Expense", IsDefault = true },
            new Category { Id = 13, Name = "Other Income", Icon = "add_circle", Color = "#34d399", Type = "Income", IsDefault = true }
        );
    }
}
