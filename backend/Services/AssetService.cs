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

        _mapper.Map(dto, asset);
        asset.UpdatedAt = DateTime.UtcNow;

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

    public async Task<int> GetActiveAssetsCountAsync()
    {
        return await _context.Assets
            .Where(a => a.Status == "Active")
            .CountAsync();
    }
}
