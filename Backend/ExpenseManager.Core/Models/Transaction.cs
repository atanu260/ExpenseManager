namespace ExpenseManager.Core.Models;

public class Transaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = "Expense"; // Income | Expense
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? Tags { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
