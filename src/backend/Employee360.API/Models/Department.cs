namespace Employee360.API.Models;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string ManagerName { get; set; } = string.Empty;
    public string Location { get; set; } = "HQ - Hyderabad";
}
