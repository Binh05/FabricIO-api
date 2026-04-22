using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FabricIO_api.Migrations
{
    /// <inheritdoc />
    public partial class FixFKGamePurchase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GamePurchases_Users_Id",
                table: "GamePurchases");

            migrationBuilder.CreateIndex(
                name: "IX_GamePurchases_BuyerId",
                table: "GamePurchases",
                column: "BuyerId");

            migrationBuilder.AddForeignKey(
                name: "FK_GamePurchases_Users_BuyerId",
                table: "GamePurchases",
                column: "BuyerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GamePurchases_Users_BuyerId",
                table: "GamePurchases");

            migrationBuilder.DropIndex(
                name: "IX_GamePurchases_BuyerId",
                table: "GamePurchases");

            migrationBuilder.AddForeignKey(
                name: "FK_GamePurchases_Users_Id",
                table: "GamePurchases",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
