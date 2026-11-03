using Employee360.API.Models;
using Employee360.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Employee360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CopilotController : ControllerBase
{
    private readonly IAIService _aiService;

    public CopilotController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("ask")]
    public async Task<ActionResult<CopilotQueryResponse>> Ask([FromBody] CopilotQueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest(new { message = "Query string cannot be empty" });
        }

        var response = await _aiService.ProcessQueryAsync(request);
        return Ok(response);
    }
}
