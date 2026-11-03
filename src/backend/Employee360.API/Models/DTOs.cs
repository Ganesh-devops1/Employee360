namespace Employee360.API.Models;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Username, string FullName, string Role);

public record CreateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string JobTitle,
    int DepartmentId,
    decimal Salary,
    string Status,
    string PerformanceRating
);

public record UpdateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string JobTitle,
    int DepartmentId,
    decimal Salary,
    string Status,
    string PerformanceRating,
    int LeaveBalance
);

public record CreateLeaveDto(
    int EmployeeId,
    string LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    string Reason
);

public record UpdateLeaveStatusDto(
    string Status, // Approved, Rejected
    string ReviewedBy
);

public record CopilotQueryRequest(
    string Query,
    int? EmployeeId
);

public record CopilotQueryResponse(
    string Answer,
    string Intent,
    object? Data,
    string ModelUsed
);
