namespace FabricIO_api.Services;

public interface IStorageServices
{
    Task<string> UploadAsync(IFormFile file, CancellationToken token);
}