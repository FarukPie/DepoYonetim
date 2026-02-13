using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MalzemeKalemiRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FaturaKalemi_Urunler_UrunId",
                table: "FaturaKalemi");

            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_Urunler_UrunId",
                table: "Zimmetler");

            migrationBuilder.DropTable(
                name: "Urunler");

            migrationBuilder.RenameColumn(
                name: "UrunId",
                table: "Zimmetler",
                newName: "MalzemeKalemiId");

            migrationBuilder.RenameIndex(
                name: "IX_Zimmetler_UrunId",
                table: "Zimmetler",
                newName: "IX_Zimmetler_MalzemeKalemiId");

            migrationBuilder.RenameColumn(
                name: "UrunId",
                table: "FaturaKalemi",
                newName: "MalzemeKalemiId");

            migrationBuilder.RenameColumn(
                name: "UrunAdi",
                table: "FaturaKalemi",
                newName: "MalzemeAdi");

            migrationBuilder.RenameIndex(
                name: "IX_FaturaKalemi_UrunId",
                table: "FaturaKalemi",
                newName: "IX_FaturaKalemi_MalzemeKalemiId");

            migrationBuilder.CreateTable(
                name: "MalzemeKalemleri",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Ad = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DmbNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EkParcaVar = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Birim = table.Column<int>(type: "int", nullable: false),
                    Rutin = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Aciklama = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    State = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MalzemeKalemleri", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_FaturaKalemi_MalzemeKalemleri_MalzemeKalemiId",
                table: "FaturaKalemi",
                column: "MalzemeKalemiId",
                principalTable: "MalzemeKalemleri",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler",
                column: "MalzemeKalemiId",
                principalTable: "MalzemeKalemleri",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FaturaKalemi_MalzemeKalemleri_MalzemeKalemiId",
                table: "FaturaKalemi");

            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler");

            migrationBuilder.DropTable(
                name: "MalzemeKalemleri");

            migrationBuilder.RenameColumn(
                name: "MalzemeKalemiId",
                table: "Zimmetler",
                newName: "UrunId");

            migrationBuilder.RenameIndex(
                name: "IX_Zimmetler_MalzemeKalemiId",
                table: "Zimmetler",
                newName: "IX_Zimmetler_UrunId");

            migrationBuilder.RenameColumn(
                name: "MalzemeKalemiId",
                table: "FaturaKalemi",
                newName: "UrunId");

            migrationBuilder.RenameColumn(
                name: "MalzemeAdi",
                table: "FaturaKalemi",
                newName: "UrunAdi");

            migrationBuilder.RenameIndex(
                name: "IX_FaturaKalemi_MalzemeKalemiId",
                table: "FaturaKalemi",
                newName: "IX_FaturaKalemi_UrunId");

            migrationBuilder.CreateTable(
                name: "Urunler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    KategoriId = table.Column<int>(type: "int", nullable: false),
                    Ad = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Barkod = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Birim = table.Column<int>(type: "int", nullable: false),
                    BozuldugundaBakimTipi = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Durum = table.Column<int>(type: "int", nullable: false),
                    EkParcaVar = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    GarantiSuresiAy = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KdvOrani = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Maliyet = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Marka = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Model = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SeriNumarasi = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StokMiktari = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Urunler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Urunler_Kategoriler_KategoriId",
                        column: x => x.KategoriId,
                        principalTable: "Kategoriler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Urunler_KategoriId",
                table: "Urunler",
                column: "KategoriId");

            migrationBuilder.AddForeignKey(
                name: "FK_FaturaKalemi_Urunler_UrunId",
                table: "FaturaKalemi",
                column: "UrunId",
                principalTable: "Urunler",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_Urunler_UrunId",
                table: "Zimmetler",
                column: "UrunId",
                principalTable: "Urunler",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
