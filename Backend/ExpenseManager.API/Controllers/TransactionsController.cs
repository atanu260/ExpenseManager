using ExpenseManager.Core.DTOs;
using ExpenseManager.Core.Interfaces;
using ExpenseManager.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _repo;

    public TransactionsController(ITransactionRepository repo) => _repo = repo;

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] TransactionFilterDto filter)
    {
        var result = await _repo.GetAllAsync(UserId, filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _repo.GetByIdAsync(id, UserId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TransactionCreateDto dto)
    {
        var transaction = new Transaction
        {
            UserId = UserId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Type = dto.Type,
            Description = dto.Description,
            Notes = dto.Notes,
            TransactionDate = dto.TransactionDate,
            PaymentMethod = dto.PaymentMethod,
            Tags = dto.Tags,
            IsRecurring = dto.IsRecurring,
            RecurrencePattern = dto.RecurrencePattern
        };
        var result = await _repo.CreateAsync(transaction);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TransactionUpdateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id, UserId);
        if (existing == null) return NotFound();

        var transaction = new Transaction
        {
            Id = id,
            UserId = UserId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Type = dto.Type,
            Description = dto.Description,
            Notes = dto.Notes,
            TransactionDate = dto.TransactionDate,
            PaymentMethod = dto.PaymentMethod,
            Tags = dto.Tags,
            IsRecurring = dto.IsRecurring,
            RecurrencePattern = dto.RecurrencePattern
        };
        await _repo.UpdateAsync(transaction);
        return Ok(new { message = "Updated successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id, UserId);
        return success ? Ok(new { message = "Deleted." }) : NotFound();
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] int month, [FromQuery] int year)
    {
        if (month == 0) month = DateTime.UtcNow.Month;
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await _repo.GetDashboardSummaryAsync(UserId, month, year);
        return Ok(result);
    }

    [HttpGet("trends")]
    public async Task<IActionResult> GetTrends([FromQuery] int months = 6)
    {
        var result = await _repo.GetMonthlyTrendsAsync(UserId, months);
        return Ok(result);
    }

    [HttpGet("by-category")]
    public async Task<IActionResult> GetByCategory([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var end = endDate ?? DateTime.UtcNow;
        var result = await _repo.GetExpenseByCategoryAsync(UserId, start, end);
        return Ok(result);
    }
}
