namespace FabricIO_api.Services;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string key, CancellationToken token);
    Task<string> ExtractAndUploadAsync(IFormFile fileZip, string rootPath, CancellationToken token);
    string GetPublicUrl(string objectName);
    string GetContentType(string file);
    Task<string> DownloadFileAync(string bucketName, string key, CancellationToken token);
    Task DeleteFolderAsync(string bucketName, string prefix, CancellationToken token);
    Task DeleteFileByUrlAsync(string bucketName, string key, CancellationToken token);
}