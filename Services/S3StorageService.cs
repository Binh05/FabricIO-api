using Amazon.S3;
using Amazon.S3.Model;

namespace FabricIO_api.Services
{
    public class S3StorageService(IAmazonS3 s3Client, IConfiguration configuration) : IStorageService
    {
        private readonly string _domain = configuration["AppSettings:AWS_CloudFrontDomain"] ?? configuration["AppSettings:AWS_BucketDomain"]!;
        public async Task DeleteFileByUrlAsync(string bucketName, string key, CancellationToken token)
        {
            await s3Client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key,
            }, token);
        }

        public async Task DeleteFolderAsync(string bucketName, string prefix, CancellationToken token)
        {
            prefix = MediaUrl.ExtractObjectKey(prefix, bucketName);
            if (!prefix.EndsWith("/")) prefix += "/";

            var listRequest = new ListObjectsV2Request
            {
                BucketName = bucketName,
                Prefix = prefix
            };

            ListObjectsV2Response listResponse;
            do
            {
                listResponse = await s3Client.ListObjectsV2Async(listRequest, token);

                if (listResponse.S3Objects.Count > 0)
                {
                    var deleteRequest = new DeleteObjectsRequest
                    {
                        BucketName = bucketName,
                        Objects = listResponse.S3Objects.Select(o => new KeyVersion { Key = o.Key }).ToList()
                    };

                    await s3Client.DeleteObjectsAsync(deleteRequest, token);
                }

                listRequest.ContinuationToken = listResponse.NextContinuationToken;

            } while (listResponse.IsTruncated);
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

        public Task<string> ExtractAndUploadAsync(IFormFile fileZip, string rootPath, CancellationToken token)
        {
            throw new NotImplementedException();
        }

        public string GetContentType(string file)
        {
            throw new NotImplementedException();
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
