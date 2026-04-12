using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
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

    [HttpGet("owner/{ownerId}")]
    public async Task<ActionResult<List<AssetDto>>> GetAssetsByOwnerId(int ownerId)
    {
        var assets = await _assetService.GetAssetsByOwnerIdAsync(ownerId);
        return Ok(assets);
    }

    [HttpGet("{id}/relationships")]
    public async Task<ActionResult<List<AssetRelationshipDto>>> GetRelationships(int id)
    {
        var relationships = await _assetService.GetRelationshipsAsync(id);
        return Ok(relationships);
    }

    [HttpPost("relationships")]
    public async Task<ActionResult<AssetRelationshipDto>> AddRelationship([FromBody] CreateAssetRelationshipDto dto)
    {
        var relationship = await _assetService.AddRelationshipAsync(dto);
        return Ok(relationship);
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<List<AssetHistoryDto>>> GetHistory(int id)
    {
        var history = await _assetService.GetAssetHistoryAsync(id);
        return Ok(history);
    }

    [HttpGet("statistics/active-count")]
    public async Task<ActionResult<int>> GetActiveAssetsCount()
    {
        var count = await _assetService.GetActiveAssetsCountAsync();
        return Ok(count);
    }
}
