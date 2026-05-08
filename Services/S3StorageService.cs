using Amazon.S3;
using Amazon.S3.Model;
using FabricIO_api.Extensions;
using System.IO.Compression;

namespace FabricIO_api.Services
{
    public class S3StorageService(IAmazonS3 s3Client, IConfiguration configuration) : IStorageService
    {
        private readonly string _domain = configuration["AppSettings:AWS_CloudFrontDomain"] ?? configuration["AppSettings:AWS_BucketDomain"]!;
        private readonly string gameBucket = configuration["Storage:GameBucketName"] ?? "game-assets";
        public async Task DeleteFileByUrlAsync(string bucketName, string key, CancellationToken token)
        {
            await s3Client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key,
            }, token);
        }

        public async Task DeleteFolderAsync(
    string bucketName,
    string prefix,
    CancellationToken token)
        {
            prefix = MediaUrl.ExtractObjectKey(prefix, bucketName);

            if (string.IsNullOrWhiteSpace(prefix))
                return;

            if (!prefix.EndsWith("/"))
                prefix += "/";

            var listRequest = new ListObjectsV2Request
            {
                BucketName = bucketName,
                Prefix = prefix,
                MaxKeys = 1000 // gi?i h?n chu?n c?a S3 batch delete
            };

            ListObjectsV2Response listResponse;

            do
            {
                listResponse = await s3Client.ListObjectsV2Async(
                    listRequest,
                    token
                );

                if (listResponse.S3Objects.Any())
                {
                    var deleteRequest = new DeleteObjectsRequest
                    {
                        BucketName = bucketName,
                        Objects = listResponse.S3Objects
                            .Select(o => new KeyVersion
                            {
                                Key = o.Key
                            })
                            .ToList()
                    };

                    var deleteResponse = await s3Client.DeleteObjectsAsync(
                        deleteRequest,
                        token
                    );

                    if (deleteResponse.DeleteErrors.Any())
                    {
                        throw new Exception(
                            $"Delete folder failed: {string.Join(", ", deleteResponse.DeleteErrors.Select(e => e.Key))}"
                        );
                    }
                }

                listRequest.ContinuationToken =
                    listResponse.NextContinuationToken;

            }
            while (listResponse.IsTruncated == true);
        }

        public async Task<string> DownloadFileAync(string bucketName, string key, CancellationToken token)
        {
            return s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddHours(1)
            });
        }

        public async Task<string> ExtractAndUploadAsync(IFormFile fileZip, string rootPath, CancellationToken token)
        {
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
                    var relativePath = file.Replace(basePath, "").Replace("\\", "/").TrimStart('/');

                    using var stream = File.OpenRead(file);

                    var putRequest = new PutObjectRequest
                    {
                        BucketName = gameBucket,
                        Key = $"{rootPath}/{relativePath}",
                        InputStream = stream,
                        ContentType = GetContentType(file)
                    };

                    await s3Client.PutObjectAsync(putRequest, token);
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
            return $"{_domain}/{rootPath}";
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
            throw new NotImplementedException();
        }

        public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string key, CancellationToken token)
        {
            var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };

            await s3Client.PutObjectAsync(request, token);

            return $"{_domain}/{key}";
        }
    }
}
