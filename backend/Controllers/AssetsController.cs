using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AssetDto>>> GetAllAssets()
    {
        var assets = await _assetService.GetAllAssetsAsync();
        return Ok(assets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssetDto>> GetAssetById(int id)
    {
        var asset = await _assetService.GetAssetByIdAsync(id);
        if (asset == null)
            return NotFound();

        return Ok(asset);
    }

    [HttpPost]
    public async Task<ActionResult<AssetDto>> CreateAsset([FromBody] CreateAssetDto dto)
    {
        var asset = await _assetService.CreateAssetAsync(dto);
        return CreatedAtAction(nameof(GetAssetById), new { id = asset.Id }, asset);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AssetDto>> UpdateAsset(int id, [FromBody] UpdateAssetDto dto)
    {
        try
        {
            var asset = await _assetService.UpdateAssetAsync(id, dto);
            return Ok(asset);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        try
        {
            await _assetService.DeleteAssetAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<AssetDto>>> GetAssetsByStatus(string status)
    {
        var assets = await _assetService.GetAssetsByStatusAsync(status);
        return Ok(assets);
    }

    [HttpGet("type/{assetType}")]
    public async Task<ActionResult<List<AssetDto>>> GetAssetsByType(string assetType)
    {
        var assets = await _assetService.GetAssetsByTypeAsync(assetType);
        return Ok(assets);
    }

    [HttpGet("statistics/active-count")]
    public async Task<ActionResult<int>> GetActiveAssetsCount()
    {
        var count = await _assetService.GetActiveAssetsCountAsync();
        return Ok(count);
    }
}
