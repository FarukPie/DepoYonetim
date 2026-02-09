using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBolumToZimmet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_Personeller_PersonelId",
                table: "Zimmetler");

            migrationBuilder.AlterColumn<int>(
                name: "PersonelId",
                table: "Zimmetler",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "BolumId",
                table: "Zimmetler",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Zimmetler_BolumId",
                table: "Zimmetler",
                column: "BolumId");

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_Bolumler_BolumId",
                table: "Zimmetler",
                column: "BolumId",
                principalTable: "Bolumler",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_Personeller_PersonelId",
                table: "Zimmetler",
                column: "PersonelId",
                principalTable: "Personeller",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_Bolumler_BolumId",
                table: "Zimmetler");

            migrationBuilder.DropForeignKey(
                name: "FK_Zimmetler_Personeller_PersonelId",
                table: "Zimmetler");

            migrationBuilder.DropIndex(
                name: "IX_Zimmetler_BolumId",
                table: "Zimmetler");

            migrationBuilder.DropColumn(
                name: "BolumId",
                table: "Zimmetler");

            migrationBuilder.AlterColumn<int>(
                name: "PersonelId",
                table: "Zimmetler",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Zimmetler_Personeller_PersonelId",
                table: "Zimmetler",
                column: "PersonelId",
                principalTable: "Personeller",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
