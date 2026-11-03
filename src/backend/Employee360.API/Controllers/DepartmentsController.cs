using Employee360.API.Data;
using Employee360.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Employee360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
    {
        return Ok(await _context.Departments.OrderBy(d => d.Name).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(int id)
    {
        var dept = await _context.Departments.FindAsync(id);
        if (dept == null) return NotFound();
        return Ok(dept);
    }

    [HttpPost]
    public async Task<ActionResult<Department>> CreateDepartment([FromBody] Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
    }
}
