/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import MyGameTab from "./MyGameTab";
import MyGameFavoriteTab from "./MyGameFavoriteTab";
import PostCard from "@/components/PostCard";

import { userService } from "@/services/userService";
import {
  createComment,
  createReaction,
  deletePost,
  getPostComments,
  removeReaction,
  updatePost,
} from "@/services/postService";

import useRequireAuth from "@/hooks/useRequireAuth";
import { getImageUrl, getUserAvatarUrl } from "@/utils/userProfile";

const getUserId = (user) => user?.id || user?.Id || "";

const getItemsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;

  return [];
};

export default function ProfileTab({ user }) {
  const { ensureAuth } = useRequireAuth();

  const [activeTab, setActiveTab] = useState("Games");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const userId = getUserId(user);

  const tabs = [
    { id: "Games", label: "Game yêu thích" },
    { id: "Posts", label: "Bài viết của tôi" },
    { id: "My games", label: "Game của tôi" },
  ];

  const mapPostWithAuthor = useCallback(
    (post) => {
      const author = post?.author || {};
      const authorId = post?.authorId || author?.id || author?.Id || userId;

      const isCurrentUserPost =
        authorId && userId && String(authorId) === String(userId);

      /**
       * Nếu bài viết là của user hiện tại:
       * - Ưu tiên dữ liệu user mới nhất sau khi update avatar/profile.
       * - Giữ lại author cũ để không mất field phụ nếu user không có.
       */
      const displayAuthor = isCurrentUserPost
        ? {
            ...author,
            ...user,
          }
        : author;

      const rawUsername =
        displayAuthor?.username ||
        displayAuthor?.Username ||
        user?.username ||
        user?.Username ||
        "";

      const username = rawUsername
        ? `@${rawUsername.toString().replace(/^@/, "")}`
        : user?.email
          ? `@${user.email.split("@")[0]}`
          : "";

      const displayName =
        displayAuthor?.displayName ||
        displayAuthor?.DisplayName ||
        displayAuthor?.fullName ||
        displayAuthor?.name ||
        user?.displayName ||
        user?.DisplayName ||
        user?.username ||
        user?.Username ||
        "Người dùng ẩn danh";

      return {
        ...post,
        authorId,
        name: displayName,
        username,
        avatar: getUserAvatarUrl(displayAuthor),
        role:
          displayAuthor?.role || displayAuthor?.Role || user?.role || "user",
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
        likeCount: post?.likeCount ?? 0,
        dislikeCount: post?.dislikeCount ?? 0,
        commentCount: post?.commentCount ?? 0,
        myReaction: post?.myReaction ?? null,
        stats: {
          likes: post?.likeCount ?? 0,
          comments: post?.commentCount ?? 0,
        },
      };
    },
    [user, userId],
  );

  const fetchUserPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) return;

      try {
        if (!silent) {
          setPostsLoading(true);
        }

        setPostsError("");

        const response = await userService.getUserPosts(userId, {
          page: 1,
          limit: 20,
        });

        const mappedPosts =
          getItemsFromResponse(response).map(mapPostWithAuthor);
        setPosts(mappedPosts);
      } catch (error) {
        setPosts([]);
        setPostsError(error.message || "Không lấy được danh sách bài viết");
      } finally {
        if (!silent) {
          setPostsLoading(false);
        }
      }
    },
    [mapPostWithAuthor, userId],
  );

  /**
   * Fetch bài viết khi vào tab My Posts.
   */
  useEffect(() => {
    if (activeTab !== "Posts") return;

    if (!userId) {
      setPosts([]);
      return;
    }

    fetchUserPosts();
  }, [activeTab, fetchUserPosts, userId]);

  /**
   * Khi user/avatar/profile thay đổi, remap lại posts hiện có.
   * Trường hợp này xử lý lỗi:
   * - Avatar trên profile đã đổi.
   * - Nhưng avatar trong tab My Posts vẫn là avatar cũ.
   */
  useEffect(() => {
    if (activeTab !== "Posts") return;
    if (!userId) return;

    setPosts((prevPosts) => prevPosts.map(mapPostWithAuthor));
  }, [
    activeTab,
    userId,
    mapPostWithAuthor,
    user?.avatar,
    user?.avatarUrl,
    user?.imageUrl,
    user?.image,
    user?.photoURL,
    user?.profilePicture,
    user?.avatarVersion,
    user?.avatarUpdatedAt,
    user?.updatedAt,
  ]);

  const handleUpdatePost = async (postId, payload) => {
    try {
      setPostsError("");
      ensureAuth();

      await updatePost(postId, payload);
      await fetchUserPosts({ silent: true });
    } catch (error) {
      setPostsError(error.message || "Cập nhật bài viết thất bại");
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      ensureAuth();
      setDeleting(true);
      setPostsError("");

      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      setPostsError(error.message || "Xóa bài viết thất bại");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const handleGetPostComments = async (postId, page = 1, pageSize = 5) => {
    try {
      setPostsError("");

      const response = await getPostComments({
        postId,
        Page: page,
        PageSize: pageSize,
      });

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: getItemsFromResponse(response),
      }));

      return response;
    } catch (error) {
      setPostsError(error.message || "Lấy bình luận thất bại");
      throw error;
    }
  };

  const handleCreateComment = async (postId, content) => {
    try {
      setPostsError("");
      ensureAuth();

      await createComment(postId, { content });
      await handleGetPostComments(postId);
    } catch (error) {
      setPostsError(error.message || "Tạo bình luận thất bại");
      throw error;
    }
  };

  const handleCreateReaction = async (postId, reactionType) => {
    try {
      setPostsError("");
      ensureAuth();

      await createReaction(postId, reactionType);
      await fetchUserPosts({ silent: true });
    } catch (error) {
      setPostsError(error.message || "Tương tác thất bại");
      throw error;
    }
  };

  const handleRemoveReaction = async (postId) => {
    try {
      setPostsError("");
      ensureAuth();

      await removeReaction(postId);
      await fetchUserPosts({ silent: true });
    } catch (error) {
      setPostsError(error.message || "Xóa tương tác thất bại");
      throw error;
    }
  };

  const renderPosts = () => {
    if (!userId) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
          Không tìm thấy thông tin người dùng.
        </div>
      );
    }

    if (postsLoading) {
      return <p className="text-sm text-zinc-400">Đang tải bài viết...</p>;
    }

    if (postsError) {
      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {postsError}
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
          Chưa có bài viết nào.
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            comments={comments[post.id] || []}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onGetComments={handleGetPostComments}
            onCreateComment={handleCreateComment}
            createReaction={handleCreateReaction}
            removeReaction={handleRemoveReaction}
            deleting={deleting}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return <p className="text-white">Đang tải hồ sơ...</p>;
  }

  return (
    <div className="mt-16 max-w-7xl mx-auto px-6">
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-8 py-4 text-lg font-medium transition-all ${
              activeTab === tab.id
                ? "text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "Games" && <MyGameFavoriteTab />}

        {activeTab === "Posts" && renderPosts()}

        {activeTab === "My games" && <MyGameTab userId={userId} />}
      </div>
    </div>
  );
}
