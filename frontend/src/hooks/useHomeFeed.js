import { useCallback, useEffect, useState } from "react";
import { getFeaturedGames, getTopRatedGames } from "../services/gameService";
import { getTrendingPosts } from "../services/postService";
import useAuth from "@/contexts/AuthContext";
import { getImageUrl, getUserAvatarUrl } from "@/utils/userProfile";

const getUserId = (user) => user?.id || user?.Id || user?.userId || user?.UserId || "";

export default function useHomeFeed() {
  const { user: currentUser } = useAuth() || {};

  const [featuredGames, setFeaturedGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapPostWithAuthor = useCallback(
    (post) => {
      const author = post?.author || {};
      const authorId = post?.authorId || author?.id;
      const currentUserId = getUserId(currentUser);
      const isCurrentUserPost =
        authorId && currentUserId && String(authorId) === String(currentUserId);
      const displayAuthor = isCurrentUserPost ? { ...author, ...currentUser } : author;

      return {
        ...post,

        name: displayAuthor?.displayName || displayAuthor?.username || "Người dùng ẩn danh",
        username: displayAuthor?.email ? `@${displayAuthor.email.split("@")[0]}` : "",
        avatar: getUserAvatarUrl(displayAuthor),
        role: displayAuthor?.role || "user",

        authorId,

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
    [currentUser],
  );

  const fetchHomeFeed = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        const [gamesData, topRatedGamesData, postsData] = await Promise.all([
          getFeaturedGames(),
          getTopRatedGames(),
          getTrendingPosts(),
        ]);

        const rawPosts = postsData?.items || postsData?.data || postsData || [];

        const mappedPosts = rawPosts.map((post) => mapPostWithAuthor(post));

        setFeaturedGames(gamesData?.game || gamesData || []);
        setTopRatedGames(topRatedGamesData?.data || topRatedGamesData || []);
        setPosts(mappedPosts);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Tải dữ liệu thất bại");
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [mapPostWithAuthor],
  );

  useEffect(() => {
    fetchHomeFeed();
  }, [fetchHomeFeed]);

  return {
    featuredGames,
    topRatedGames,
    posts,
    loading,
    error,
    refetch: fetchHomeFeed,
  };
}
