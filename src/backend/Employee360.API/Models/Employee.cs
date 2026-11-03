namespace Employee360.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
    public DateTime JoiningDate { get; set; } = DateTime.UtcNow;
    public decimal Salary { get; set; }
    public string Status { get; set; } = "Active"; // Active, On Leave, Terminated
    public string PerformanceRating { get; set; } = "Meets Expectations"; // Exceptional, Exceeds Expectations, Meets Expectations
    public int LeaveBalance { get; set; } = 20;
}
