using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDepolar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Urunler_Depolar_DepoId",
                table: "Urunler");

            migrationBuilder.DropTable(
                name: "Depolar");

            migrationBuilder.DropIndex(
                name: "IX_Urunler_DepoId",
                table: "Urunler");

            migrationBuilder.DropColumn(
                name: "DepoId",
                table: "Urunler");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepoId",
                table: "Urunler",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Depolar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SorumluPersonelId = table.Column<int>(type: "int", nullable: true),
                    Aciklama = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Ad = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Aktif = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depolar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Depolar_Personeller_SorumluPersonelId",
                        column: x => x.SorumluPersonelId,
                        principalTable: "Personeller",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Urunler_DepoId",
                table: "Urunler",
                column: "DepoId");

            migrationBuilder.CreateIndex(
                name: "IX_Depolar_SorumluPersonelId",
                table: "Depolar",
                column: "SorumluPersonelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Urunler_Depolar_DepoId",
                table: "Urunler",
                column: "DepoId",
                principalTable: "Depolar",
                principalColumn: "Id");
        }
    }
}
