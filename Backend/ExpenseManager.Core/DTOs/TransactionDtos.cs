namespace ExpenseManager.Core.DTOs;

public class TransactionCreateDto
{
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = "Expense";
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? Tags { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
}

public class TransactionUpdateDto : TransactionCreateDto
{
    public int Id { get; set; }
}

public class TransactionResponseDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public bool IsRecurring { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TransactionFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public string? Type { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "TransactionDate";
    public string SortOrder { get; set; } = "desc";
}

public class PagedResult<T>
{
    public IEnumerable<T> Data { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

