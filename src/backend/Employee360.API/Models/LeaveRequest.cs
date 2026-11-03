namespace Employee360.API.Models;

public class LeaveRequest
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string LeaveType { get; set; } = "Casual"; // Casual, Sick, Annual, Maternity
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysCount { get; set; } = 1;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public string? ReviewedBy { get; set; }
}
