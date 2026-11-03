using Employee360.API.Models;

namespace Employee360.API.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Departments.Any())
        {
            return; // DB has already been seeded
        }

        var departments = new List<Department>
        {
            new() { Name = "Cloud & DevOps Engineering", Code = "ENG-CLOUD", ManagerName = "Vikram Aditya", Location = "Building A, Floor 4" },
            new() { Name = "Full Stack Development", Code = "ENG-DEV", ManagerName = "Ananya Roy", Location = "Building A, Floor 3" },
            new() { Name = "Human Resources & Talent", Code = "HR-TALENT", ManagerName = "Pooja Mehta", Location = "Building B, Floor 1" },
            new() { Name = "Finance & Compliance", Code = "FIN-CORP", ManagerName = "Rajesh Sharma", Location = "Building B, Floor 2" },
            new() { Name = "Product & UI/UX Design", Code = "PROD-DESIGN", ManagerName = "David Chen", Location = "Building A, Floor 2" }
        };

        context.Departments.AddRange(departments);
        context.SaveChanges();

        var employees = new List<Employee>
        {
            new()
            {
                FirstName = "Ravi",
                LastName = "Kumar",
                Email = "ravi.kumar@employee360.internal",
                Phone = "+91 98765 43210",
                JobTitle = "Senior DevOps & Cloud Architect",
                DepartmentId = departments[0].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-24),
                Salary = 125000,
                Status = "Active",
                PerformanceRating = "Exceptional",
                LeaveBalance = 18
            },
            new()
            {
                FirstName = "Sarah",
                LastName = "Jenkins",
                Email = "sarah.j@employee360.internal",
                Phone = "+1 555-019-2834",
                JobTitle = "Staff Frontend Engineer",
                DepartmentId = departments[1].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-14),
                Salary = 110000,
                Status = "Active",
                PerformanceRating = "Exceeds Expectations",
                LeaveBalance = 15
            },
            new()
            {
                FirstName = "Priya",
                LastName = "Sharma",
                Email = "priya.s@employee360.internal",
                Phone = "+91 91234 56789",
                JobTitle = "Senior HR Business Partner",
                DepartmentId = departments[2].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-30),
                Salary = 88000,
                Status = "Active",
                PerformanceRating = "Exceptional",
                LeaveBalance = 22
            },
            new()
            {
                FirstName = "Marcus",
                LastName = "Vance",
                Email = "marcus.v@employee360.internal",
                Phone = "+44 20 7946 0912",
                JobTitle = "Product Lead - AI Workflows",
                DepartmentId = departments[4].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-8),
                Salary = 135000,
                Status = "Active",
                PerformanceRating = "Exceeds Expectations",
                LeaveBalance = 14
            },
            new()
            {
                FirstName = "Aisha",
                LastName = "Khan",
                Email = "aisha.k@employee360.internal",
                Phone = "+91 99887 76655",
                JobTitle = "Financial Risk Analyst",
                DepartmentId = departments[3].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-5),
                Salary = 75000,
                Status = "Active",
                PerformanceRating = "Meets Expectations",
                LeaveBalance = 19
            },
            new()
            {
                FirstName = "Deepak",
                LastName = "Verma",
                Email = "deepak.v@employee360.internal",
                Phone = "+91 97711 22334",
                JobTitle = "Site Reliability Engineer",
                DepartmentId = departments[0].Id,
                JoiningDate = DateTime.UtcNow.AddMonths(-2),
                Salary = 82000,
                Status = "On Leave",
                PerformanceRating = "Meets Expectations",
                LeaveBalance = 12
            }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();

        var leaves = new List<LeaveRequest>
        {
            new()
            {
                EmployeeId = employees[0].Id,
                LeaveType = "Annual",
                StartDate = DateTime.UtcNow.AddDays(10),
                EndDate = DateTime.UtcNow.AddDays(14),
                DaysCount = 5,
                Reason = "Family vacation to Himachal",
                Status = "Approved",
                AppliedAt = DateTime.UtcNow.AddDays(-2),
                ReviewedBy = "Pooja Mehta"
            },
            new()
            {
                EmployeeId = employees[5].Id,
                LeaveType = "Sick",
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(2),
                DaysCount = 3,
                Reason = "Viral fever recovery",
                Status = "Approved",
                AppliedAt = DateTime.UtcNow.AddDays(-3),
                ReviewedBy = "Vikram Aditya"
            },
            new()
            {
                EmployeeId = employees[1].Id,
                LeaveType = "Casual",
                StartDate = DateTime.UtcNow.AddDays(20),
                EndDate = DateTime.UtcNow.AddDays(21),
                DaysCount = 2,
                Reason = "Personal errands and relocation",
                Status = "Pending",
                AppliedAt = DateTime.UtcNow.AddHours(-6)
            }
        };

        context.LeaveRequests.AddRange(leaves);

        var users = new List<User>
        {
            new() { Username = "admin", PasswordHash = "Admin@123", FullName = "System Administrator", Role = "Admin", Email = "admin@employee360.internal" },
            new() { Username = "hr", PasswordHash = "Hr@123", FullName = "Priya Sharma (HR)", Role = "HRManager", Email = "hr@employee360.internal" },
            new() { Username = "ravi", PasswordHash = "User@123", FullName = "Ravi Kumar", Role = "Employee", Email = "ravi.kumar@employee360.internal" }
        };

        context.Users.AddRange(users);

        var auditLogs = new List<AuditLog>
        {
            new() { Action = "DATABASE_INITIALIZATION", EntityName = "System", EntityId = 1, Details = "Seeded enterprise HR directory with departments and staff", PerformedBy = "SYSTEM", Timestamp = DateTime.UtcNow }
        };

        context.AuditLogs.AddRange(auditLogs);
        context.SaveChanges();
    }
}
