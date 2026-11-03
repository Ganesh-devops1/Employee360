using Employee360.API.Data;
using Employee360.API.Models;
using Employee360.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Employee360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAIService _aiService;

    public EmployeesController(AppDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees([FromQuery] string? search, [FromQuery] int? departmentId, [FromQuery] string? status)
    {
        var query = _context.Employees.Include(e => e.Department).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(e => e.FirstName.ToLower().Contains(s) || 
                                     e.LastName.ToLower().Contains(s) || 
                                     e.JobTitle.ToLower().Contains(s) ||
                                     e.Email.ToLower().Contains(s));
        }

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(e => e.Status == status);
        }

        return Ok(await query.OrderBy(e => e.FirstName).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var emp = await _context.Employees.Include(e => e.Department).FirstOrDefaultAsync(e => e.Id == id);
        if (emp == null) return NotFound(new { message = $"Employee #{id} not found" });
        return Ok(emp);
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            JobTitle = dto.JobTitle,
            DepartmentId = dto.DepartmentId,
            Salary = dto.Salary,
            Status = dto.Status,
            PerformanceRating = dto.PerformanceRating,
            JoiningDate = DateTime.UtcNow,
            LeaveBalance = 20
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        _context.AuditLogs.Add(new AuditLog
        {
            Action = "EMPLOYEE_CREATED",
            EntityName = "Employee",
            EntityId = employee.Id,
            Details = $"Onboarded {employee.FirstName} {employee.LastName} as {employee.JobTitle}",
            PerformedBy = "HR_ADMIN",
            Timestamp = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var emp = await _context.Employees.FindAsync(id);
        if (emp == null) return NotFound();

        emp.FirstName = dto.FirstName;
        emp.LastName = dto.LastName;
        emp.Email = dto.Email;
        emp.Phone = dto.Phone;
        emp.JobTitle = dto.JobTitle;
        emp.DepartmentId = dto.DepartmentId;
        emp.Salary = dto.Salary;
        emp.Status = dto.Status;
        emp.PerformanceRating = dto.PerformanceRating;
        emp.LeaveBalance = dto.LeaveBalance;

        _context.AuditLogs.Add(new AuditLog
        {
            Action = "EMPLOYEE_UPDATED",
            EntityName = "Employee",
            EntityId = emp.Id,
            Details = $"Updated record for {emp.FirstName} {emp.LastName}",
            PerformedBy = "HR_ADMIN",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var emp = await _context.Employees.FindAsync(id);
        if (emp == null) return NotFound();

        _context.Employees.Remove(emp);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "EMPLOYEE_DELETED",
            EntityName = "Employee",
            EntityId = id,
            Details = $"Removed record of employee #{id}",
            PerformedBy = "HR_ADMIN",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/summary")]
    public async Task<ActionResult<object>> GetEmployeeSummary(int id)
    {
        var summary = await _aiService.GenerateEmployeeSummaryAsync(id);
        return Ok(new { employeeId = id, summary });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var total = await _context.Employees.CountAsync();
        var active = await _context.Employees.CountAsync(e => e.Status == "Active");
        var onLeave = await _context.Employees.CountAsync(e => e.Status == "On Leave");
        var pendingLeaves = await _context.LeaveRequests.CountAsync(l => l.Status == "Pending");
        var departmentsCount = await _context.Departments.CountAsync();
        var avgSalary = total > 0 ? await _context.Employees.AverageAsync(e => e.Salary) : 0;

        return Ok(new
        {
            TotalEmployees = total,
            ActiveEmployees = active,
            OnLeaveEmployees = onLeave,
            PendingLeaves = pendingLeaves,
            DepartmentsCount = departmentsCount,
            AverageSalary = Math.Round(avgSalary, 2)
        });
    }
}
