using DepoYonetim.Core.Entities;

namespace DepoYonetim.Core.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
}

public interface IDepoRepository : IRepository<Depo>
{
    Task<IEnumerable<Depo>> GetActiveDeposAsync();
}

public interface IUrunRepository : IRepository<Urun>
{
    Task<IEnumerable<Urun>> GetByDepoIdAsync(int depoId);
    Task<IEnumerable<Urun>> SearchAsync(string searchTerm);
    Task<IEnumerable<Urun>> GetBakimdakiUrunlerAsync();
    Task<IEnumerable<Urun>> GetTamirBekleyenlerAsync();
}

public interface IKategoriRepository : IRepository<Kategori>
{
    Task<IEnumerable<Kategori>> GetAnaKategorilerAsync();
    Task<IEnumerable<Kategori>> GetAltKategorilerAsync(int ustKategoriId);
}

public interface IPersonelRepository : IRepository<Personel>
{
    Task<IEnumerable<Personel>> GetActivePersonellerAsync();
    Task<int> GetZimmetliPersonelSayisiAsync();
}

public interface ICariRepository : IRepository<Cari>
{
    Task<IEnumerable<Cari>> SearchAsync(string searchTerm);
}

public interface IFaturaRepository : IRepository<Fatura>
{
    Task<IEnumerable<Fatura>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Fatura>> GetByCariIdAsync(int cariId);
}

public interface IZimmetRepository : IRepository<Zimmet>
{
    Task<IEnumerable<Zimmet>> GetSonZimmetlerAsync(int count);
    Task<IEnumerable<Zimmet>> GetByPersonelIdAsync(int personelId);
}

public interface IBolumRepository : IRepository<Bolum>
{
    // Add specific methods if needed, for tree traversal we mostly rely on GetAllAsync
}
