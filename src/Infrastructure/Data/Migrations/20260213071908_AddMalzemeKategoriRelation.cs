using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DepoYonetim.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMalzemeKategoriRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KategoriId",
                table: "MalzemeKalemleri",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MalzemeKalemleri_KategoriId",
                table: "MalzemeKalemleri",
                column: "KategoriId");

            migrationBuilder.AddForeignKey(
                name: "FK_MalzemeKalemleri_Kategoriler_KategoriId",
                table: "MalzemeKalemleri",
                column: "KategoriId",
                principalTable: "Kategoriler",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MalzemeKalemleri_Kategoriler_KategoriId",
                table: "MalzemeKalemleri");

            migrationBuilder.DropIndex(
                name: "IX_MalzemeKalemleri_KategoriId",
                table: "MalzemeKalemleri");

            migrationBuilder.DropColumn(
                name: "KategoriId",
                table: "MalzemeKalemleri");
        }
    }
}
