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
public class BudgetsController : ControllerBase
{
    private readonly IBudgetRepository _repo;
    public BudgetsController(IBudgetRepository repo) => _repo = repo;

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _repo.GetAllAsync(UserId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BudgetCreateDto dto)
    {
        var budget = new Budget
        {
            UserId = UserId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Amount = dto.Amount,
            Period = dto.Period,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            AlertThreshold = dto.AlertThreshold
        };
        await _repo.CreateAsync(budget);
        return Ok(budget);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id, UserId);
        return success ? Ok() : NotFound();
    }
}
