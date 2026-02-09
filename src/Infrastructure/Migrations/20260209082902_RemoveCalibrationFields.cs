using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCalibrationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KalibrasyonPeriyoduGun",
                table: "Urunler");

            migrationBuilder.DropColumn(
                name: "SonBakimTarihi",
                table: "Urunler");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KalibrasyonPeriyoduGun",
                table: "Urunler",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SonBakimTarihi",
                table: "Urunler",
                type: "datetime(6)",
                nullable: true);
        }
    }
}
