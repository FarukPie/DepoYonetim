using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMarkaModelZimmetToFaturaKalemi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Marka",
                table: "FaturaKalemi",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "FaturaKalemi",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "ZimmetDurum",
                table: "FaturaKalemi",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Marka",
                table: "FaturaKalemi");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "FaturaKalemi");

            migrationBuilder.DropColumn(
                name: "ZimmetDurum",
                table: "FaturaKalemi");
        }
    }
}
