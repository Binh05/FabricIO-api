namespace FabricIO_api.DTOs;

public class GamePurchaseResponse
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PurchasedAt { get; set; }
}

public class PaidGameReq
{
    public decimal Amound { get; set; }
}
