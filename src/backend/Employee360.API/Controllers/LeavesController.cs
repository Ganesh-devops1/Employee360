using Employee360.API.Data;
using Employee360.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Employee360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeavesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeavesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetLeaves([FromQuery] string? status)
    {
        var query = _context.LeaveRequests.Include(l => l.Employee).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(l => l.Status == status);
        }

        return Ok(await query.OrderByDescending(l => l.AppliedAt).ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<LeaveRequest>> CreateLeave([FromBody] CreateLeaveDto dto)
    {
        var emp = await _context.Employees.FindAsync(dto.EmployeeId);
        if (emp == null) return BadRequest(new { message = "Invalid EmployeeId" });

        var days = (int)Math.Max(1, Math.Ceiling((dto.EndDate - dto.StartDate).TotalDays) + 1);

        var leave = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            LeaveType = dto.LeaveType,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            DaysCount = days,
            Reason = dto.Reason,
            Status = "Pending",
            AppliedAt = DateTime.UtcNow
        };

        _context.LeaveRequests.Add(leave);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLeaves), new { id = leave.Id }, leave);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateLeaveStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
    {
        var leave = await _context.LeaveRequests.Include(l => l.Employee).FirstOrDefaultAsync(l => l.Id == id);
        if (leave == null) return NotFound();

        leave.Status = dto.Status;
        leave.ReviewedBy = dto.ReviewedBy;

        // If approved, deduct leave balance
        if (dto.Status == "Approved" && leave.Employee != null)
        {
            leave.Employee.LeaveBalance = Math.Max(0, leave.Employee.LeaveBalance - leave.DaysCount);
            if (leave.StartDate <= DateTime.UtcNow && leave.EndDate >= DateTime.UtcNow)
            {
                leave.Employee.Status = "On Leave";
            }
        }

        _context.AuditLogs.Add(new AuditLog
        {
            Action = $"LEAVE_{dto.Status.ToUpper()}",
            EntityName = "LeaveRequest",
            EntityId = leave.Id,
            Details = $"Leave #{leave.Id} marked as {dto.Status} by {dto.ReviewedBy}",
            PerformedBy = dto.ReviewedBy,
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return Ok(leave);
    }
}
