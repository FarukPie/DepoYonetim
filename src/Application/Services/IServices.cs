using DepoYonetim.Application.DTOs;

namespace DepoYonetim.Application.Services;



public interface IMalzemeKalemiService
{
    Task<IEnumerable<MalzemeKalemiDto>> GetAllAsync();
    Task<PagedResultDto<MalzemeKalemiDto>> GetPagedAsync(PaginationRequest request);
    Task<IEnumerable<MalzemeKalemiDto>> SearchAsync(string searchTerm);
    Task<MalzemeKalemiDto?> GetByIdAsync(int id);
    Task<MalzemeKalemiDto> CreateAsync(MalzemeKalemiCreateDto dto);
    Task UpdateAsync(int id, MalzemeKalemiCreateDto dto);
    Task DeleteAsync(int id);
}

public interface IKategoriService
{
    Task<IEnumerable<KategoriDto>> GetAllAsync();
    Task<PagedResultDto<KategoriDto>> GetPagedAsync(PaginationRequest request);
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
    Task<PagedResultDto<PersonelDto>> GetPagedAsync(PaginationRequest request);
    Task<IEnumerable<PersonelDto>> SearchAsync(string searchTerm);
    Task<PersonelDto?> GetByIdAsync(int id);
    Task<PersonelDto> CreateAsync(PersonelCreateDto dto);
    Task UpdateAsync(int id, PersonelCreateDto dto);
    Task DeleteAsync(int id);
}

public interface ICariService
{
    Task<IEnumerable<CariDto>> GetAllAsync();
    Task<PagedResultDto<CariDto>> GetPagedAsync(PaginationRequest request);
    Task<IEnumerable<CariDto>> SearchAsync(string searchTerm);
    Task<CariDto?> GetByIdAsync(int id);
    Task<CariDto> CreateAsync(CariCreateDto dto);
    Task UpdateAsync(int id, CariCreateDto dto);
    Task DeleteAsync(int id);
}

public interface IFaturaService
{
    Task<IEnumerable<FaturaDto>> GetAllAsync();
    Task<PagedResultDto<FaturaDto>> GetPagedAsync(PaginationRequest request);
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
    Task<PagedResultDto<ZimmetDto>> GetPagedAsync(PaginationRequest request);
    Task<IEnumerable<ZimmetDto>> GetSonZimmetlerAsync(int count);
    Task<ZimmetDto?> GetByIdAsync(int id);
    Task<ZimmetDto> CreateAsync(ZimmetCreateDto dto);
    Task UpdateAsync(int id, ZimmetUpdateDto dto);
    Task DeleteAsync(int id);
    Task IadeEtAsync(int id);
    Task<IEnumerable<ZimmetDto>> GetByPersonelIdAsync(int personelId);
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

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetByUsernameAsync(string username);
    Task<UserDto> CreateAsync(UserCreateDto dto);
    Task UpdateAsync(int id, UserUpdateDto dto);
    Task DeleteAsync(int id);
    Task<UserDto?> ValidateUserAsync(string username, string password);
}
