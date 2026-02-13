using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFaturaTotals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AraToplam",
                table: "Faturalar");

            migrationBuilder.DropColumn(
                name: "GenelToplam",
                table: "Faturalar");

            migrationBuilder.DropColumn(
                name: "ToplamIndirim",
                table: "Faturalar");

            migrationBuilder.DropColumn(
                name: "ToplamKdv",
                table: "Faturalar");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AraToplam",
                table: "Faturalar",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GenelToplam",
                table: "Faturalar",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ToplamIndirim",
                table: "Faturalar",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ToplamKdv",
                table: "Faturalar",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
