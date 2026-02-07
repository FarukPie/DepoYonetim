using DepoYonetim.Application.DTOs;

namespace DepoYonetim.Application.Services;

public interface IDepoService
{
    Task<IEnumerable<DepoDto>> GetAllAsync();
    Task<DepoDto?> GetByIdAsync(int id);
    Task<DepoDto> CreateAsync(DepoCreateDto dto);
    Task UpdateAsync(int id, DepoUpdateDto dto);
    Task DeleteAsync(int id);
}

public interface IUrunService
{
    Task<IEnumerable<UrunDto>> GetAllAsync();
    Task<IEnumerable<UrunDto>> GetByDepoIdAsync(int depoId);
    Task<IEnumerable<UrunDto>> SearchAsync(string searchTerm);
    Task<UrunDto?> GetByIdAsync(int id);
    Task<UrunDto> CreateAsync(UrunCreateDto dto);
    Task UpdateAsync(int id, UrunCreateDto dto);
    Task DeleteAsync(int id);
}

public interface IKategoriService
{
    Task<IEnumerable<KategoriDto>> GetAllAsync();
    Task<IEnumerable<KategoriDto>> GetAnaKategorilerAsync();
    Task<IEnumerable<KategoriDto>> GetAltKategorilerAsync(int ustKategoriId);
    Task<KategoriDto?> GetByIdAsync(int id);
    Task<KategoriDto> CreateAsync(KategoriCreateDto dto);
    Task UpdateAsync(int id, KategoriCreateDto dto);
    Task DeleteAsync(int id);
    Task<IEnumerable<CategoryDto>> GetCategoryTreeAsync();
}

public interface IPersonelService
{
    Task<IEnumerable<PersonelDto>> GetAllAsync();
    Task<IEnumerable<PersonelDto>> SearchAsync(string searchTerm);
    Task<PersonelDto?> GetByIdAsync(int id);
    Task<PersonelDto> CreateAsync(PersonelCreateDto dto);
    Task UpdateAsync(int id, PersonelCreateDto dto);
    Task DeleteAsync(int id);
}

public interface ICariService
{
    Task<IEnumerable<CariDto>> GetAllAsync();
    Task<IEnumerable<CariDto>> SearchAsync(string searchTerm);
    Task<CariDto?> GetByIdAsync(int id);
    Task<CariDto> CreateAsync(CariCreateDto dto);
    Task UpdateAsync(int id, CariCreateDto dto);
    Task DeleteAsync(int id);
}

public interface IFaturaService
{
    Task<IEnumerable<FaturaDto>> GetAllAsync();
    Task<IEnumerable<FaturaDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<FaturaDto>> GetByCariIdAsync(int cariId);
    Task<FaturaDto?> GetByIdAsync(int id);
    Task<FaturaDto> CreateAsync(FaturaCreateDto dto);
    Task DeleteAsync(int id);
    Task<FaturaCreateDto> CreateFromPdfAsync(Stream pdfStream);
}

public interface IZimmetService
{
    Task<IEnumerable<ZimmetDto>> GetAllAsync();
    Task<IEnumerable<ZimmetDto>> GetSonZimmetlerAsync(int count);
    Task<ZimmetDto?> GetByIdAsync(int id);
    Task<ZimmetDto> CreateAsync(ZimmetCreateDto dto);
    Task UpdateAsync(int id, ZimmetUpdateDto dto);
    Task DeleteAsync(int id);
    Task IadeEtAsync(int id);
}

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync();
}

public interface ITalepService
{
    Task<IEnumerable<TalepDto>> GetAllAsync(string? durum = null);
    Task<IEnumerable<TalepDto>> GetByUserIdAsync(int userId);
    Task<TalepDto?> GetByIdAsync(int id);
    Task<TalepDto> CreateAsync(CreateTalepDto dto);
    Task<TalepDto> OnaylaAsync(int id, int onaylayanUserId);
    Task<TalepDto> ReddetAsync(int id, int onaylayanUserId, string redNedeni);
    Task DeleteAsync(int id);
    Task<int> GetBekleyenSayisiAsync();
}

public interface IBolumService
{
    Task<IEnumerable<BolumDto>> GetAllAsync();
    Task<IEnumerable<BolumDto>> GetTreeAsync();
    Task<BolumDto?> GetByIdAsync(int id);
    Task<BolumDto> CreateAsync(BolumCreateDto dto);
    Task UpdateAsync(int id, BolumCreateDto dto);
    Task DeleteAsync(int id);
}
