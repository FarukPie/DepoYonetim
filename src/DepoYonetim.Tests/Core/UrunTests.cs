using Xunit;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using System;

namespace DepoYonetim.Tests.Core;

public class UrunTests
{
    [Fact]
    public void CreateUrun_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var urun = new Urun();

        // Assert
        Assert.False(urun.IsDeleted);
        Assert.True(urun.CreatedAt <= DateTime.UtcNow);
        Assert.True(urun.CreatedAt > DateTime.UtcNow.AddSeconds(-10)); // Created recently
        Assert.Equal(Birim.Adet, urun.Birim);
        Assert.Equal(18, urun.KdvOrani);
        Assert.Equal(12, urun.GarantiSuresiAy);
        Assert.Equal(UrunDurum.Aktif, urun.Durum);
        Assert.Equal(BakimTipi.Bakim, urun.BozuldugundaBakimTipi);
    }

    [Fact]
    public void UpdateUrun_ShouldChangeProperties()
    {
        // Arrange
        var urun = new Urun();
        var ad = "Test Ürün";
        var barkod = "123456789";

        // Act
        urun.Ad = ad;
        urun.Barkod = barkod;
        urun.StokMiktari = 50;

        // Assert
        Assert.Equal(ad, urun.Ad);
        Assert.Equal(barkod, urun.Barkod);
        Assert.Equal(50, urun.StokMiktari);
    }
}
