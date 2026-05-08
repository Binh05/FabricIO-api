namespace FabricIO_api.Extensions;

public static class MediaUrl
{
    public static string ExtractObjectKey(string mediaUrl, string? bucketName = null)
    {
        if (string.IsNullOrEmpty(mediaUrl)) return string.Empty;

        string path;
        if (Uri.TryCreate(mediaUrl, UriKind.Absolute, out var uri))
        {
            path = uri.AbsolutePath.TrimStart('/');
        }
        else
        {
            path = mediaUrl.TrimStart('/');
        }

        if (!string.IsNullOrEmpty(bucketName) && path.StartsWith(bucketName + "/"))
        {
            path = path.Substring(bucketName.Length + 1);
        }

        return path;
    }
}
