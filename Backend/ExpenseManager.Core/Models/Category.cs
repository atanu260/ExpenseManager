using System.Transactions;

namespace ExpenseManager.Core.Models;

public class Category
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "receipt";
    public string Color { get; set; } = "#6366f1";
    public string Type { get; set; } = "Expense"; // Income | Expense
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
