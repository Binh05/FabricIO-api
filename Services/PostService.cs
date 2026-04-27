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
            throw new NotFoundException("Post not found");

        await PopulateAuthorAsync(post, token);
        return post;
    }

    public async Task<PostPaginationResult> GetPostsByUserIdAsync(Guid userId, PaginationDto pagination, CancellationToken token)
    {
        var posts = (await unitOfWork.Posts.GetListAsync<PostResponseDto>(p => p.AuthorId == userId && !p.IsDeleted, token))
            .OrderByDescending(p => p.CreatedAt)
            .ToList();
        await PopulateAuthorsAsync(posts, token);
        return BuildPaginationResult(posts, pagination);
    }

    public async Task<PostPaginationResult> GetPostsAsync(PaginationDto pagination, CancellationToken token)
    {
        var posts = (await unitOfWork.Posts.GetListAsync<PostResponseDto>(p => !p.IsDeleted, token))
            .OrderByDescending(p => p.CreatedAt)
            .ToList();
        await PopulateAuthorsAsync(posts, token);
        return BuildPaginationResult(posts, pagination);
    }

    public async Task<PostResponseDto> UpdatePostAsync(Guid userId, Guid id, UpdatePostRequestDto request, CancellationToken token)
    {
        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == id, token);
        if (post == null || post.IsDeleted)
            throw new NotFoundException("Post not found");

        if (post.AuthorId != userId)
            throw new UnauthorizedException("You are not the owner of this post");

        post.Title = request.Title;
        post.Content = request.Content;
        post.UpdatedAt = DateTime.UtcNow;
        
        if (request.DeletedImageIds != null && request.DeletedImageIds.Any())
        {
            foreach (var imageId in request.DeletedImageIds)
            {
                var media = unitOfWork.PostMedias.GetEntityAsync(m => m.Id == imageId, token).Result;
                if (media != null)
                {
                    await storageService.DeleteFileByUrlAsync(media.MediaUrl, token); 
                    unitOfWork.PostMedias.Delete(media);
                }
            }
        }

        if (request.NewImages != null && request.NewImages.Any())
        {
            foreach (var file in request.NewImages)
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
            throw new NotFoundException("Post not found");

        if (post.AuthorId != userId)
            throw new UnauthorizedException("You are not the owner of this post");

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
        var normalizedAuthorMap = authors
            .Where(a => a.Id.HasValue)
            .ToDictionary(a => a.Id!.Value);

        foreach (var post in posts)
        {
            if (normalizedAuthorMap.TryGetValue(post.AuthorId, out var author))
                post.Author = author;
        }
    }

    private static PostPaginationResult BuildPaginationResult(List<PostResponseDto> posts, PaginationDto pagination)
    {
        var page = pagination.Page < 1 ? 1 : pagination.Page;
        var pageSize = pagination.PageSize < 1 ? 20 : pagination.PageSize;

        var items = posts
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PostPaginationResult
        {
            Total = posts.Count,
            Page = page,
            PageSize = pageSize,
            Items = items
        };
    }
}
