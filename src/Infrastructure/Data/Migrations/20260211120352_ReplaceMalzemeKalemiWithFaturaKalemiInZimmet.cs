using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceMalzemeKalemiWithFaturaKalemiInZimmet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler");

            migrationBuilder.AlterColumn<int>(
                name: "MalzemeKalemiId",
                table: "Zimmetler",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "FaturaKalemiId",
                table: "Zimmetler",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Zimmetler_FaturaKalemiId",
                table: "Zimmetler",
                column: "FaturaKalemiId");

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_FaturaKalemi_FaturaKalemiId",
                table: "Zimmetler",
                column: "FaturaKalemiId",
                principalTable: "FaturaKalemi",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler",
                column: "MalzemeKalemiId",
                principalTable: "MalzemeKalemleri",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_FaturaKalemi_FaturaKalemiId",
                table: "Zimmetler");

            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler");

            migrationBuilder.DropIndex(
                name: "IX_Zimmetler_FaturaKalemiId",
                table: "Zimmetler");

            migrationBuilder.DropColumn(
                name: "FaturaKalemiId",
                table: "Zimmetler");

            migrationBuilder.AlterColumn<int>(
                name: "MalzemeKalemiId",
                table: "Zimmetler",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_MalzemeKalemleri_MalzemeKalemiId",
                table: "Zimmetler",
                column: "MalzemeKalemiId",
                principalTable: "MalzemeKalemleri",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
