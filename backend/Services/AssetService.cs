using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IAssetService
{
    Task<List<AssetDto>> GetAllAssetsAsync();
    Task<AssetDto?> GetAssetByIdAsync(int id);
    Task<AssetDto> CreateAssetAsync(CreateAssetDto dto);
    Task<AssetDto> UpdateAssetAsync(int id, UpdateAssetDto dto);
    Task DeleteAssetAsync(int id);
    Task<List<AssetDto>> GetAssetsByStatusAsync(string status);
    Task<List<AssetDto>> GetAssetsByTypeAsync(string assetType);
    Task<int> GetActiveAssetsCountAsync();
    Task<List<AssetDto>> GetAssetsByOwnerIdAsync(int ownerId);
    Task<AssetRelationshipDto> AddRelationshipAsync(CreateAssetRelationshipDto dto);
    Task<List<AssetRelationshipDto>> GetRelationshipsAsync(int assetId);
    Task<List<AssetHistoryDto>> GetAssetHistoryAsync(int assetId);
}

public class AssetService : IAssetService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AssetService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AssetDto>> GetAllAssetsAsync()
    {
        var assets = await _context.Assets
            .Include(a => a.Owner)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<AssetDto>>(assets);
    }

    public async Task<AssetDto?> GetAssetByIdAsync(int id)
    {
        var asset = await _context.Assets
            .Include(a => a.Owner)
            .FirstOrDefaultAsync(a => a.Id == id);

        return asset == null ? null : _mapper.Map<AssetDto>(asset);
    }

    public async Task<AssetDto> CreateAssetAsync(CreateAssetDto dto)
    {
        var asset = _mapper.Map<Asset>(dto);
        asset.Status = "Active";
        asset.CreatedAt = DateTime.UtcNow;
        asset.UpdatedAt = DateTime.UtcNow;

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        await _context.Entry(asset).Reference(a => a.Owner).LoadAsync();

        return _mapper.Map<AssetDto>(asset);
    }

    public async Task<AssetDto> UpdateAssetAsync(int id, UpdateAssetDto dto)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            throw new ArgumentException("Asset not found");

        var oldStatus = asset.Status;
        var oldOwner = asset.OwnerId;

        _mapper.Map(dto, asset);
        asset.UpdatedAt = DateTime.UtcNow;

        if (oldStatus != asset.Status)
        {
            _context.AssetHistories.Add(new AssetHistory
            {
                AssetId = asset.Id,
                Action = "Status Change",
                OldValue = oldStatus,
                NewValue = asset.Status,
                UserId = 1, // Placeholder: Should be current user
                Timestamp = DateTime.UtcNow
            });
        }

        if (oldOwner != asset.OwnerId)
        {
            _context.AssetHistories.Add(new AssetHistory
            {
                AssetId = asset.Id,
                Action = "Owner Change",
                OldValue = oldOwner?.ToString(),
                NewValue = asset.OwnerId?.ToString(),
                UserId = 1, // Placeholder
                Timestamp = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        await _context.Entry(asset).Reference(a => a.Owner).LoadAsync();

        return _mapper.Map<AssetDto>(asset);
    }

    public async Task DeleteAssetAsync(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            throw new ArgumentException("Asset not found");

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AssetDto>> GetAssetsByStatusAsync(string status)
    {
        var assets = await _context.Assets
            .Where(a => a.Status == status)
            .Include(a => a.Owner)
            .ToListAsync();

        return _mapper.Map<List<AssetDto>>(assets);
    }

    public async Task<List<AssetDto>> GetAssetsByTypeAsync(string assetType)
    {
        var assets = await _context.Assets
            .Where(a => a.AssetType == assetType)
            .Include(a => a.Owner)
            .ToListAsync();

        return _mapper.Map<List<AssetDto>>(assets);
    }

    public async Task<List<AssetDto>> GetAssetsByOwnerIdAsync(int ownerId)
    {
        var assets = await _context.Assets
            .Where(a => a.OwnerId == ownerId)
            .Include(a => a.Owner)
            .ToListAsync();

        return _mapper.Map<List<AssetDto>>(assets);
    }

    public async Task<int> GetActiveAssetsCountAsync()
    {
        return await _context.Assets
            .Where(a => a.Status == "Active")
            .CountAsync();
    }

    public async Task<AssetRelationshipDto> AddRelationshipAsync(CreateAssetRelationshipDto dto)
    {
        var relationship = _mapper.Map<AssetRelationship>(dto);
        _context.AssetRelationships.Add(relationship);
        await _context.SaveChangesAsync();

        var result = await _context.AssetRelationships
            .Include(r => r.SourceAsset)
            .Include(r => r.TargetAsset)
            .FirstOrDefaultAsync(r => r.Id == relationship.Id);

        return _mapper.Map<AssetRelationshipDto>(result);
    }

    public async Task<List<AssetRelationshipDto>> GetRelationshipsAsync(int assetId)
    {
        var relationships = await _context.AssetRelationships
            .Where(r => r.SourceAssetId == assetId || r.TargetAssetId == assetId)
            .Include(r => r.SourceAsset)
            .Include(r => r.TargetAsset)
            .ToListAsync();

        return _mapper.Map<List<AssetRelationshipDto>>(relationships);
    }

    public async Task<List<AssetHistoryDto>> GetAssetHistoryAsync(int assetId)
    {
        var history = await _context.AssetHistories
            .Where(ah => ah.AssetId == assetId)
            .Include(ah => ah.User)
            .OrderByDescending(ah => ah.Timestamp)
            .ToListAsync();

        return _mapper.Map<List<AssetHistoryDto>>(history);
    }
}
