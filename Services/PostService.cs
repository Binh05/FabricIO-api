using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class PostService(IUnitOfWork unitOfWork, IMapper mapper, IStorageService storageService) : IPostService
{
    public async Task<PostResponseDto> CreatePostAsync(Guid userId, PostRequestDto request, CancellationToken token)
    {
        var post = mapper.Map<Post>(request);
        post.AuthorId = userId;

        if (request.MediaFiles != null && request.MediaFiles.Any())
        {
            foreach (var file in request.MediaFiles)
            {
                var mediaUrl = await storageService.UploadFileAsync(file, "file", "post/" + post.Id + "/" + file.FileName, token);
                post.Media.Add(new PostMedia
                {
                    MediaUrl = mediaUrl
                });
            }
        }

        unitOfWork.Posts.Insert(post);
        await unitOfWork.SaveAsync(token);

        var result = await unitOfWork.Posts.FindOneAsync<PostResponseDto>(p => p.Id == post.Id, token);
        return result!;
    }

    public async Task<PostResponseDto> GetPostByIdAsync(Guid id, CancellationToken token)
    {
        var post = await unitOfWork.Posts.FindOneAsync<PostResponseDto>(p => p.Id == id, token);
        if (post == null)
            throw new NotFoundException("Bài đăng không tồn tại");

        await PopulateAuthorAsync(post, token);
        return post;
    }

    public async Task<IEnumerable<PostResponseDto>> GetPostsByUserIdAsync(Guid userId, CancellationToken token)
    {
        var posts = (await unitOfWork.Posts.GetListAsync<PostResponseDto>(p => p.AuthorId == userId && !p.IsDeleted, token)).ToList();
        await PopulateAuthorsAsync(posts, token);
        return posts;
    }

    public async Task<IEnumerable<PostResponseDto>> GetPostsAsync(CancellationToken token)
    {
        var posts = (await unitOfWork.Posts.GetListAsync<PostResponseDto>(p => !p.IsDeleted, token)).ToList();
        await PopulateAuthorsAsync(posts, token);
        return posts;
    }

    public async Task<PostResponseDto> UpdatePostAsync(Guid userId, Guid id, PostRequestDto request, CancellationToken token)
    {
        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == id, token);
        if (post == null || post.IsDeleted)
            throw new NotFoundException("Bài đăng không tồn tại");

        if (post.AuthorId != userId)
            throw new UnauthorizedException("Bạn không có quyền sửa bài đăng này");

        post.Title = request.Title;
        post.Content = request.Content;
        post.UpdatedAt = DateTime.UtcNow;

        if (request.MediaFiles != null && request.MediaFiles.Any())
        {
            foreach (var file in request.MediaFiles)
            {
                var mediaUrl = await storageService.UploadFileAsync(file, "file", "post/" + post.Id + "/" + file.FileName, token);
                post.Media.Add(new PostMedia
                {
                    MediaUrl = mediaUrl
                });
            }
        }

        unitOfWork.Posts.Update(post);
        await unitOfWork.SaveAsync(token);

        var result = await unitOfWork.Posts.FindOneAsync<PostResponseDto>(p => p.Id == id, token);
        return result!;
    }

    public async Task DeletePostAsync(Guid userId, Guid id, CancellationToken token)
    {
        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == id, token);
        if (post == null || post.IsDeleted)
            throw new NotFoundException("Bài đăng không tồn tại");

        if (post.AuthorId != userId)
            throw new UnauthorizedException("Bạn không có quyền xóa bài đăng này");

        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;

        unitOfWork.Posts.Update(post);
        await unitOfWork.SaveAsync(token);
    }

    private async Task PopulateAuthorAsync(PostResponseDto post, CancellationToken token)
    {
        var author = await unitOfWork.Users.FindOneAsync<UserDisplay>(u => u.Id == post.AuthorId, token);
        post.Author = author;
    }

    private async Task PopulateAuthorsAsync(List<PostResponseDto> posts, CancellationToken token)
    {
        if (!posts.Any())
            return;

        var authorIds = posts.Select(p => p.AuthorId).Distinct().ToList();
        var authors = await unitOfWork.Users.GetListAsync<UserDisplay>(u => authorIds.Contains(u.Id), token);
        var authorMap = authors.ToDictionary(a => a.Id);

        foreach (var post in posts)
        {
            if (authorMap.TryGetValue(post.AuthorId, out var author))
                post.Author = author;
        }
    }
}
