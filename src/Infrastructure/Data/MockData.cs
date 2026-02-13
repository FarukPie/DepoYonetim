using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;

namespace DepoYonetim.Infrastructure.Data;

/// <summary>
/// Static mock data for testing purposes.
/// This will be replaced with actual database context when MySQL is connected.
/// </summary>
public static class MockData
{
    // OPTIMIZATION: This file is now deprecated as the application uses the Database.
    // Keeping empty lists to prevent compilation errors if any remnant references exist.

    public static List<Personel> Personeller { get; } = new();
    public static List<Kategori> Kategoriler { get; } = new();
    public static List<MalzemeKalemi> MalzemeKalemleri { get; } = new();
    public static List<Cari> Cariler { get; } = new();
    public static List<Fatura> Faturalar { get; } = new();
    public static List<FaturaKalemi> FaturaKalemleri { get; } = new();
    public static List<Zimmet> Zimmetler { get; } = new();
    public static List<Role> Roller { get; } = new();
    public static List<User> Users { get; } = new();
    public static List<Talep> Talepler { get; } = new();
    public static List<SystemLog> SystemLogs { get; } = new();
}
