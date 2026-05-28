/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostComments,
  createComment,
  createReaction,
  removeReaction,
  getTrendingPosts as getTrendingPostsApi,
} from "../services/postService";

import useRequireAuth from "@/hooks/useRequireAuth";
import { DEFAULT_AVATAR, getImageUrl, getUserAvatarUrl } from "@/utils/userProfile";

const getUserId = (user) => user?.id || user?.Id || user?.userId || user?.UserId || "";

export default function usePosts({ page = 1, limit = 10 } = {}) {
  const { ensureAuth, user: currentUser } = useRequireAuth();

  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const mapPostWithAuthor = useCallback((post) => {
    try {
      const author = post.author || {};
      const authorId = post?.authorId || author?.id;
      const currentUserId = getUserId(currentUser);
      const isCurrentUserPost =
        authorId && currentUserId && String(authorId) === String(currentUserId);
      const displayAuthor = isCurrentUserPost ? { ...author, ...currentUser } : author;

      return {
        ...post,

        name: displayAuthor?.displayName || displayAuthor?.username || "Người dùng ẩn danh",

        avatar: getUserAvatarUrl(displayAuthor),

        role: displayAuthor?.role || "user",

        time: post.createdAt
          ? new Date(post.createdAt).toLocaleString("vi-VN")
          : "",

        media:
          post.media
            ?.map((item) => {
              if (!item?.mediaUrl) return null;

              return {
                id: item.id,
                mediaUrl: getImageUrl(item.mediaUrl),
              };
            })
            .filter(Boolean) || [],

        stats: {
          likes: post.likeCount ?? 0,
          comments: post.commentCount ?? 0,
        },
      };
    } catch (err) {
      return {
        ...post,

        name: "Người dùng ẩn danh",
        avatar: DEFAULT_AVATAR,

        time: post?.createdAt
          ? new Date(post.createdAt).toLocaleString("vi-VN")
          : "",

        media:
          post?.media
            ?.map((item) => {
              if (!item?.mediaUrl) return null;

              return {
                id: item.id,
                mediaUrl: getImageUrl(item.mediaUrl),
              };
            })
            .filter(Boolean) || [],

        stats: {
          likes: post?.likeCount ?? 0,
          comments: post?.commentCount ?? 0,
        },
      };
    }
  }, [currentUser]);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      setError("");

      const res = await getTrendingPostsApi({ page: 1, limit: 3 });

      const rawTrendingPosts = Array.isArray(res)
        ? res
        : res?.items || res?.data || [];

      const trendingPostsWithAuthor = rawTrendingPosts.map((post) =>
        mapPostWithAuthor(post),
      );

      setTrendingPosts(trendingPostsWithAuthor);

      return trendingPostsWithAuthor;
    } catch (err) {
      setError(err.message || "Không lấy được bài viết thịnh hành");
      throw err;
    }
  }, [mapPostWithAuthor]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getPosts({ page, limit });

      const rawPosts = res?.items || res?.data || [];

      const postsWithAuthor = rawPosts.map((post) => mapPostWithAuthor(post));

      setPosts(postsWithAuthor);
      setPagination(res?.page || null);

      await fetchTrendingPosts();
    } catch (err) {
      setError(err.message || "Không lấy được danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [page, limit, mapPostWithAuthor, fetchTrendingPosts]);

  const handleCreatePost = async (payload) => {
    try {
      ensureAuth();
      setCreating(true);
      setError("");

      const res = await createPost(payload);

      const createdPost = res?.data || res;
      const newPost = mapPostWithAuthor(createdPost);

      setPosts((prevPosts) => [newPost, ...prevPosts]);

      await fetchTrendingPosts();

      return res;
    } catch (err) {
      setError(err.message || "Tạo bài viết thất bại");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePost = async (postId, payload) => {
    try {
      ensureAuth();
      setCreating(true);
      setError("");

      await updatePost(postId, payload);

      await fetchPosts();
    } catch (err) {
      setError(err.message || "Cập nhật bài viết thất bại");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      ensureAuth();
      setDeleting(true);
      setError("");

      await deletePost(postId);

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setTrendingPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId),
      );
    } catch (err) {
      setError(err.message || "Xóa bài viết thất bại");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateReaction = async (postId, type) => {
    try {
      ensureAuth();

      await createReaction(postId, type);

      await fetchTrendingPosts();
    } catch (err) {
      setError(err.message || "Thêm phản ứng thất bại");
      throw err;
    }
  };

  const handleRemoveReaction = async (postId) => {
    try {
      ensureAuth();

      await removeReaction(postId);

      await fetchTrendingPosts();
    } catch (err) {
      setError(err.message || "Xoá phản ứng thất bại");
      throw err;
    }
  };

  const handleGetPostComments = async (postId, page = 1, pageSize = 5) => {
    try {
      setError("");

      const res = await getPostComments({
        postId,
        Page: page,
        PageSize: pageSize,
      });

      setComments((prev) => ({
        ...prev,
        [postId]: res?.items || res || [],
      }));

      return res;
    } catch (err) {
      setError(err.message || "Lấy bình luận thất bại");
      throw err;
    }
  };

  const handleCreateComment = async (postId, content) => {
    try {
      ensureAuth();
      setCreating(true);
      setError("");

      await createComment(postId, { content });

      await fetchTrendingPosts();
    } catch (err) {
      setError(err.message || "Tạo bình luận thất bại");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    trendingPosts,
    comments,
    pagination,

    loading,
    creating,
    deleting,
    error,

    refetch: fetchPosts,
    getTrendingPosts: fetchTrendingPosts,

    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,

    createReaction: handleCreateReaction,
    removeReaction: handleRemoveReaction,

    getPostComments: handleGetPostComments,
    createComment: handleCreateComment,
  };
}
