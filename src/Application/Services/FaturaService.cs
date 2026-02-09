using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class FaturaService : IFaturaService
{
    private readonly IFaturaRepository _faturaRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public FaturaService(
        IFaturaRepository faturaRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _faturaRepository = faturaRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private FaturaDto MapToDto(Fatura f)
    {
        return new FaturaDto(
            f.Id,
            f.FaturaNo,
            f.CariId,
            f.Cari?.FirmaAdi ?? "",
            f.FaturaTarihi,
            f.AraToplam,
            f.ToplamIndirim,
            f.ToplamKdv,
            f.GenelToplam,
            f.Aciklama,
            f.Kalemler.Select(k => new FaturaKalemiDto(
                k.Id,
                k.UrunId,
                k.Urun?.Ad ?? "",
                k.Miktar,
                k.BirimFiyat,
                k.IndirimOrani,
                k.KdvOrani,
                k.Toplam
            )).ToList()
        );
    }

    public async Task<IEnumerable<FaturaDto>> GetAllAsync()
    {
        var list = await _faturaRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<FaturaDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var list = await _faturaRepository.GetByDateRangeAsync(startDate, endDate);
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<FaturaDto>> GetByCariIdAsync(int cariId)
    {
        var list = await _faturaRepository.GetByCariIdAsync(cariId);
        return list.Select(MapToDto);
    }

    public async Task<FaturaDto?> GetByIdAsync(int id)
    {
        var f = await _faturaRepository.GetByIdAsync(id);
        return f == null ? null : MapToDto(f);
    }

    public async Task<FaturaDto> CreateAsync(FaturaCreateDto dto)
    {
        var entity = new Fatura
        {
            FaturaNo = dto.FaturaNo,
            CariId = dto.CariId,
            FaturaTarihi = dto.FaturaTarihi,
            Aciklama = dto.Aciklama,
            Kalemler = dto.Kalemler.Select(k => new FaturaKalemi
            {
                UrunId = k.UrunId,
                Miktar = k.Miktar,
                BirimFiyat = k.BirimFiyat,
                IndirimOrani = k.IndirimOrani,
                KdvOrani = k.KdvOrani,
                Toplam = k.Miktar * k.BirimFiyat * (1 - k.IndirimOrani/100) * (1 + k.KdvOrani/100)
            }).ToList()
        };
        
        // Ensure products created via Fatura are set to Pasif (Available) if Fatura logic creates products.
        // Wait, FaturaService currently references existing UrunId. It doesn't seem to create new Products on the fly.
        // If it creates new products, it would be in a separate logic or implicit.
        // Checking FaturaKalemi... It has UrunId.
        // If the product is NEW, it must have been created via UrunService or implicitly here?
        // Ah, looking at the code, it uses `dto.Kalemler`. If `UrunId` exists, it uses it.
        // If Fatura creation creates NEW definitions, it's not shown here.
        // Assuming products are created separately OR this `Fatura` entry just links them.
        // However, user said: "Bir malzemenin bilg ... halledip zimmetlemediysem otomatik pasif kaydedilsin."
        // This implies when product enters stock (via Invoice), it should be Pasif.
        // Since Fatura links to existing Urun, maybe we should update Urun status here?
        // But `Fatura` adds stock. Adding stock to an existing product doesn't necessarily change its status if it's already Active?
        // But if it's a NEW product, its default status matters.
        // Where are new products created? UrunService?
        // Let's check UrunService too. But for Fatura, maybe we should force status to Pasif if it was something else?
        // Actually, if I buy more of a product, its status is "Available".
        // But `UrunDurum` seems to be per-SKU (Model) or per-Item (Serial)?
        // If `Urun` represents a "Product Definition" (SKU) and we track quantity (`StokMiktari`), then `UrunDurum` is for the Title?
        // If `Urun` is an individual item (Serialized), then `Fatura` adding multiple items implies multiple `Urun` records?
        // Looking at `FaturaKalemi`, it has `Miktar`. This implies `Urun` is an SKU.
        // BUT `Zimmet` links to `UrunId`.
        // If `Zimmet` links to `UrunId` (SKU), then 1 SKU can be assigned to 1 Person?
        // If I have 10 Laptop X, and I assign 1 to User A.
        // Does `Zimmet` take 1 from `StokMiktari`?
        // If so, `Urun.Durum` being "Zimmetli" implies the WHOLE SKU is Zimmetli? That makes no sense for Quantity > 1.
        // **CRITICAL ARCHITECTURE CHECK**: Is `Urun` an SKU or an Individual Asset?
        // `Urun` has `SeriNumarasi`. This implies Individual Asset.
        // If `Urun` has `SeriNumarasi`, then `Miktar` in Fatura should be 1?
        // Or if `Miktar` > 1, then `Urun` represents a batch?
        // Let's check `Urun.cs` again. It has `StokMiktari`.
        // And `SeriNumarasi`.
        // This is a hybrid/confused model.
        // If `SeriNumarasi` is set, it's likely a specific item.
        // If `StokMiktari` > 1, `SeriNumarasi` applies to all? No.
        // User scenario: "Zimmet" usually applies to specific assets (Laptop #123).
        // If `Urun` table mixes SKUs and Assets...
        // Assuming for "Demirbaş" (Inventory), each `Urun` row is a unique asset (Quantity=1).
        // In that case, `Fatura` with `Miktar=10` might mean we just bought 10 of them, but we need 10 `Urun` records?
        // OR `Fatura` just records the financial transaction effectively.
        // Validating Assumption: `Zimmet` requires unique `UrunId`.
        // So `Urun` = Asset.
        // Flow:
        // 1. User defaults to `Urun` = SKU.
        // 2. But for Zimmet, they pick `Urun`.
        // 3. If they create `Laptop` with Qty 10 in Fatura... does it create 10 Urun records?
        // `FaturaService` code:
        // `Kalemler = dto.Kalemler.Select(...)`. It just saves `FaturaKalemi`.
        // It does NOT seem to create `Urun` records automatically.
        // So User must create `Urun` first (via UrunService), then link in Fatura?
        // OR `Fatura` creation logic in Frontend triggers Urun creation?
        // The Prompt says: "Malzeme ekle bölümüne otomatik en son faturalanmış malzemeler... gelsin".
        // It seems `Fatura` -> `Zimmet` flow passes the items.
        // If `Urun` is an SKU, then `UrunDurum` "Zimmetli" marks the SKU as taken?
        // If I have 50 Mice (SKU X), and I assign 1, I don't want the SKU to be "Zimmetli".
        // **Hypothesis**: The system is currently simple. 1 Urun = 1 Asset for Zimmet purposes.
        // If user buys 10 Mice, they might just track them as 1 Urun record "Logitech Mouse" with Stock 10.
        // And Zimmet might decrease stock?
        // Let's check `ZimmetService` `CreateAsync` again.
        // It updates `urun.Durum`.
        // It does NOT decrease `StokMiktari`.
        // This confirms `Urun` is treated as a unique asset when Zimmet is involved.
        // So if I have "Laptop" (Qty 5), and I zimmet it, it becomes "Zimmetli".
        // This implies the WHOLE record is now hidden/assigned?
        // This works if `Urun` is unique (Asset).
        // It breaks if `Urun` is SKU (Qty > 1).
        // Since I am making changes, I will assume the User wants this "Status" tracking on the `Urun` level.
        // If `Urun` represents a single asset (SeriNo), then my logic holds.
        // If `Urun` is an SKU, user will be confused why "Logitech Mouse" is now "Zimmetli" for everyone.
        // Given `SeriNumarasi` on `Urun`, I bet on Asset model (or Hybrid where expensive items are unique).
        // For Low value items (Pens), maybe they don't use Zimmet or don't care about status.
        
        // Back to `FaturaService`:
        // It seems `FaturaService` doesn't touch `Urun` table.
        // So I don't need to update `FaturaService`.
        // I need to update `UrunService.create`.
        // AND `Urun.cs` default value.
        // Let's check `UrunService.cs`.

        
        entity.AraToplam = entity.Kalemler.Sum(k => k.Miktar * k.BirimFiyat);
        entity.ToplamIndirim = entity.Kalemler.Sum(k => k.Miktar * k.BirimFiyat * (k.IndirimOrani/100));
        var araAfterIndirim = entity.AraToplam - entity.ToplamIndirim;
        entity.ToplamKdv = entity.Kalemler.Sum(k => (k.Miktar * k.BirimFiyat * (1 - k.IndirimOrani/100)) * (k.KdvOrani/100));
        entity.GenelToplam = araAfterIndirim + entity.ToplamKdv;

        await _faturaRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "Fatura", entity.Id, 
             $"Yeni fatura oluşturuldu. No: {entity.FaturaNo}, Cari: {entity.CariId}", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _faturaRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _faturaRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Fatura", id, 
                 $"Fatura silindi. No: {entity.FaturaNo}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    public async Task<FaturaCreateDto> CreateFromPdfAsync(Stream pdfStream)
    {
        // Mock processing delay to simulate OCR
        await Task.Delay(1500);

        // Return mock data
        return new FaturaCreateDto(
            "OCR-" + new Random().Next(10000, 99999),
            1, // Default to first Cari
            DateTime.Now,
            "PDF Otomatik Aktarım (Simülasyon)",
            new List<FaturaKalemiCreateDto>
            {
                 new(1, "Ürün 1", 10, 150, 0, 20),
                 new(2, "Ürün 2", 5, 300, 5, 20)
            }
        );
    }
}
