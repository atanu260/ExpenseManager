namespace ExpenseManager.Core.DTOs;

public class BudgetCreateDto
{
    public int? CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Period { get; set; } = "Monthly";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int AlertThreshold { get; set; } = 80;
}

public class BudgetResponseDto
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryIcon { get; set; }
    public string? CategoryColor { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => Amount - SpentAmount;
    public decimal Percentage => Amount > 0 ? Math.Round((SpentAmount / Amount) * 100, 2) : 0;
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int AlertThreshold { get; set; }
    public bool IsActive { get; set; }
    public string Status => Percentage >= 100 ? "Exceeded" : Percentage >= AlertThreshold ? "Warning" : "Safe";
}
