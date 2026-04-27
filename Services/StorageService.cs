using FabricIO_api.Middleware;
using Minio;
using Minio.ApiEndpoints;
using Minio.DataModel;
using Minio.DataModel.Args;
using System.IO.Compression;

namespace FabricIO_api.Services;

public class StorageServices(IMinioClient minioClient) : IStorageService
{
    private readonly string gameBucket = "game-assets";
    public async Task<string> ExtractAndUploadAsync(string zipPath, Guid gameId, CancellationToken token)
    {
        await CheckBucketAsync(gameBucket, token);

        var extractPath = Path.Combine(Path.GetTempPath(), gameId.ToString());

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
                    .WithObject($"{gameId}/{relativePath}")
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
        }
        return gameId.ToString();
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

    public string GetPublicUrl(string key)
    {
        return $"http://localhost/{gameBucket}/{key}";
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

        return $"localhost:9000/{bucketName}/{key}";
    }
    public async Task DeleteFolderAsync(string bucketName, string prefix, CancellationToken token)
    {
        await CheckBucketAsync(bucketName, token);

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
            .WithObject($"{fileId}/source.zip")
            .WithExpiry(60 * 60));

        return url;
    }

    public async Task DeleteFileByUrlAsync(string mediaUrl, CancellationToken token)
    {
        var objectKey = ExtractObjectKey(mediaUrl);

        Console.WriteLine($"Extracted object key: {objectKey}");
        
        await minioClient.RemoveObjectAsync(
            new RemoveObjectArgs()
                .WithBucket("file")
                .WithObject(objectKey),
            token);
    }

    private string ExtractObjectKey(string mediaUrl)
    {
        var uri = new Uri(mediaUrl);
        return uri.AbsolutePath.TrimStart('/');
    }

}