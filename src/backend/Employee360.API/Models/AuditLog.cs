namespace Employee360.API.Models;

public class AuditLog
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Details { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = "system";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
