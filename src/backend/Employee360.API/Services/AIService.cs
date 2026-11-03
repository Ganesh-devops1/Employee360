using System.Text.Json;
using Employee360.API.Data;
using Employee360.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Employee360.API.Services;

public interface IAIService
{
    Task<CopilotQueryResponse> ProcessQueryAsync(CopilotQueryRequest request);
    Task<string> GenerateEmployeeSummaryAsync(int employeeId);
}

public class AIService : IAIService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<AIService> _logger;

    public AIService(AppDbContext context, IConfiguration config, ILogger<AIService> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    public async Task<string> GenerateEmployeeSummaryAsync(int employeeId)
    {
        var emp = await _context.Employees
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (emp == null) return "Employee not found.";

        var tenureMonths = Math.Round((DateTime.UtcNow - emp.JoiningDate).TotalDays / 30.4, 1);
        var leaves = await _context.LeaveRequests
            .Where(l => l.EmployeeId == employeeId)
            .ToListAsync();

        return $"**Executive HR Brief for {emp.FirstName} {emp.LastName}:**\n" +
               $"• **Role & Tenure:** Serves as {emp.JobTitle} in {emp.Department?.Name ?? "General"} for {tenureMonths} months (Joined: {emp.JoiningDate:MMM yyyy}).\n" +
               $"• **Performance Track:** Calibrated rating is *{emp.PerformanceRating}* with active status '{emp.Status}'. Current compensation is ${emp.Salary:N0}/yr.\n" +
               $"• **Availability & Leaves:** Currently holds {emp.LeaveBalance} days remaining PTO with {leaves.Count} recorded lifecycle requests.";
    }

    public async Task<CopilotQueryResponse> ProcessQueryAsync(CopilotQueryRequest request)
    {
        var q = request.Query.ToLowerInvariant().Trim();

        // 1. Natural Language Filtering for Employees
        if (q.Contains("show") || q.Contains("list") || q.Contains("find") || q.Contains("engineering") || q.Contains("developer") || q.Contains("joined"))
        {
            var query = _context.Employees.Include(e => e.Department).AsQueryable();

            if (q.Contains("engineering") || q.Contains("cloud") || q.Contains("dev"))
            {
                query = query.Where(e => e.Department!.Code.StartsWith("ENG"));
            }
            if (q.Contains("recent") || q.Contains("6 months") || q.Contains("joined"))
            {
                var cutoff = DateTime.UtcNow.AddMonths(-12);
                query = query.Where(e => e.JoiningDate >= cutoff);
            }

            var results = await query.Select(e => new
            {
                e.Id,
                FullName = $"{e.FirstName} {e.LastName}",
                e.JobTitle,
                Department = e.Department!.Name,
                e.Status,
                JoiningDate = e.JoiningDate.ToString("yyyy-MM-dd")
            }).ToListAsync();

            return new CopilotQueryResponse(
                Answer: $"Found {results.Count} personnel matching your semantic criteria:",
                Intent: "DIRECTORY_SEARCH",
                Data: results,
                ModelUsed: "Employee360-NL-Classifier (Azure OpenAI Ready)"
            );
        }

        // 2. Profile Summary
        if (q.Contains("summarize") || q.Contains("brief") || q.Contains("profile"))
        {
            var emp = await _context.Employees
                .Include(e => e.Department)
                .FirstOrDefaultAsync(e => q.Contains(e.FirstName.ToLower()) || q.Contains(e.LastName.ToLower()));

            if (emp != null)
            {
                var summary = await GenerateEmployeeSummaryAsync(emp.Id);
                return new CopilotQueryResponse(
                    Answer: summary,
                    Intent: "PROFILE_SUMMARY",
                    Data: new { emp.Id, emp.FirstName, emp.LastName, emp.JobTitle },
                    ModelUsed: "Employee360-Summarizer"
                );
            }
        }

        // 3. Leave Policy & Entitlement Inquiries
        if (q.Contains("leave") || q.Contains("vacation") || q.Contains("sick") || q.Contains("policy") || q.Contains("maternity"))
        {
            return new CopilotQueryResponse(
                Answer: "**Employee360 Enterprise Leave Policy Summary:**\n" +
                        "• **Annual Vacation:** 20 paid days allocated yearly, accruing monthly.\n" +
                        "• **Sick Leave:** Up to 10 days per calendar year. Medical certificate required for > 3 consecutive days.\n" +
                        "• **Maternity/Paternity:** 26 weeks paid maternity; 4 weeks paid paternity leave.\n" +
                        "• **Carry Forward:** Maximum of 8 unused leaves may roll over to the next financial year.",
                Intent: "POLICY_LOOKUP",
                Data: null,
                ModelUsed: "Employee360-PolicyEngine"
            );
        }

        // 4. Default Enterprise Assistant Response
        return new CopilotQueryResponse(
            Answer: "I can assist you with workforce queries! Try asking:\n" +
                    "• *'Show employees in Engineering department'* \n" +
                    "• *'Summarize Ravi Kumar's performance and tenure'* \n" +
                    "• *'What is our sick leave and carry-forward policy?'* \n" +
                    "• *'List all employees who joined in the last 12 months'*",
            Intent: "GENERAL_GUIDANCE",
            Data: null,
            ModelUsed: "Employee360-AgentCore"
        );
    }
}
