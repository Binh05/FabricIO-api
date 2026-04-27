namespace FabricIO_api.Services;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string key, CancellationToken token);
    Task<string> ExtractAndUploadAsync(string zipPath, Guid gameId, CancellationToken token);
    string GetPublicUrl(string key);
    string GetContentType(string file);
    Task<string> DownloadFileAync(Guid fileId, CancellationToken token);
    Task DeleteFolderAsync(string bucketName, string prefix, CancellationToken token);
    Task DeleteFileByUrlAsync(string mediaUrl, CancellationToken token);
}