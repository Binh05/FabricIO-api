using Minio;
using Minio.DataModel.Args;
using System.IO.Compression;

namespace FabricIO_api.Services;

public class StorageServices(IMinioClient minioClient, IConfiguration configuration) : IStorageService
{
    private readonly string gameBucket = "game-assets";
    private readonly string _domain = configuration["AppSettings:Domain"] ?? "http://localhost:9000";
    public async Task<string> ExtractAndUploadAsync(IFormFile fileZip, string rootPath, CancellationToken token)
    {
        await CheckBucketAsync(gameBucket, token);

        var zipPath = Path.GetTempFileName();

        using (var stream = File.Create(zipPath))
        {
            await fileZip.CopyToAsync(stream);
        }

        var extractPath = Path.Combine(Path.GetTempPath(), rootPath);

        try
        {
            ZipFile.ExtractToDirectory(zipPath, extractPath);

            var files = Directory.GetFiles(extractPath, "*", SearchOption.AllDirectories);

            var rootDir = Directory.GetDirectories(extractPath).FirstOrDefault();

            var basePath = rootDir ?? extractPath;

            foreach (var file in files)
            {
                var relativePath = file.Replace(basePath, "").Replace("\\", "/");

                using var stream = File.OpenRead(file);

                await minioClient.PutObjectAsync(new PutObjectArgs()
                    .WithBucket(gameBucket)
                    .WithObject($"{rootPath}/{relativePath}")
                    .WithStreamData(stream)
                    .WithObjectSize(stream.Length)
                    .WithContentType(GetContentType(file)),
                    token);
            }
        } 
        finally
        {
            if (Directory.Exists(extractPath))
            {
                Directory.Delete(extractPath, true);
            }
            if (File.Exists(zipPath))
            {
                File.Delete(zipPath);
            }
        }
        return $"{_domain}/{gameBucket}/{rootPath}";
    }

    public string GetContentType(string file)
    {
        return Path.GetExtension(file) switch
        {
            ".html" => "text/html",
            ".js" => "application/javascript",
            ".wasm" => "application/wasm",
            ".data" => "application/octet-stream",
            ".json" => "application/json",
            ".css" => "text/css",
            _ => "application/octet-stream"
        };
    }

    public string GetPublicUrl(string objectName) 
    {
        return $"{_domain}/{objectName}";
    }

    public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string key, CancellationToken token)
    {
        await CheckBucketAsync(bucketName, token);

        using var stream = file.OpenReadStream();

        await minioClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(key)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(file.ContentType),
            token
        );

        return $"{_domain}/{bucketName}/{key}";
    }
    public async Task DeleteFolderAsync(string bucketName, string prefix, CancellationToken token)
    {
        await CheckBucketAsync(bucketName, token);
        
        prefix = ExtractObjectKey(prefix);
        var parts = prefix.Split('/', 2);
        if (parts.Length > 1 && parts[0] == bucketName) 
        {
            prefix = parts[1];
        }

        prefix = prefix.TrimEnd('/');

        var objects = minioClient.ListObjectsEnumAsync(
            new ListObjectsArgs()
            .WithBucket(bucketName)
            .WithPrefix(prefix)
            .WithRecursive(true));

        await foreach (var obj in objects) {
            await minioClient.RemoveObjectAsync(
                new RemoveObjectArgs()
                .WithBucket(bucketName)
                .WithObject(obj.Key), 
                token);
        }
    }

    private async Task CheckBucketAsync(string bucket, CancellationToken token)
    {
        bool found = await minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(bucket),
            token
        );

        if (!found)
        {
            //throw new NotFoundException("Storage không tồn tại");
            await minioClient.MakeBucketAsync(
                new MakeBucketArgs()
                .WithBucket(bucket)
                , token);
        }
    }

    public async Task<string> DownloadFileAync(Guid fileId, CancellationToken token)
    {
        await CheckBucketAsync(gameBucket, token);

        var url = await minioClient.PresignedGetObjectAsync( 
            new PresignedGetObjectArgs()
            .WithBucket(gameBucket)
            .WithObject($"{fileId}/source-{fileId}.zip")
            .WithExpiry(60 * 60));

        return url;
    }

    public async Task DeleteFileByUrlAsync(string mediaUrl, CancellationToken token)
    {
        var objectKey = ExtractObjectKey(mediaUrl);

        Console.WriteLine($"Extracted object key: {objectKey}");
        
        var parts = objectKey.Split('/', 2);
        if (parts.Length < 2) return;
        var bucket = parts[0];
        var key = parts[1];

        await minioClient.RemoveObjectAsync(
            new RemoveObjectArgs()
                .WithBucket(bucket)
                .WithObject(key),
            token);
    }

    private string ExtractObjectKey(string mediaUrl)
    {
        if (string.IsNullOrEmpty(mediaUrl)) return string.Empty;

        if (Uri.TryCreate(mediaUrl, UriKind.Absolute, out var uri))
        {
            var path = uri.AbsolutePath.TrimStart('/');
            return path;
        }

        return mediaUrl.TrimStart('/');
    }

}