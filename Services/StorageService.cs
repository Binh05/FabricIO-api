using Minio;
using Minio.DataModel.Args;

namespace FabricIO_api.Services;

public class StorageServices(IMinioClient minioClient) : IStorageServices
{
    private readonly string _bucketName = "file";
    public async Task<string> UploadAsync(IFormFile file, CancellationToken token)
    {
        bool found = await minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_bucketName),
            token
        );

        if (!found)
        {
            await minioClient.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(_bucketName),
                token);
        }

        var fileName = Guid.NewGuid() + file.FileName;
        var objectName = $"avatar/{fileName}";

        using var stream = file.OpenReadStream();

        await minioClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(file.ContentType),
            token
        );

        return $"localhost:9000/{_bucketName}/{objectName}";
    }
}