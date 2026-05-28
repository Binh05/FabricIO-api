import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FeaturedDropSection from "../sections/FeaturedDropSection";
import FeaturedGamesSection from "../sections/FeaturedGamesSection";
import TrendingNowSection from "../sections/TrendingNowSection";
import LatestPostsSection from "../sections/LatestPostsSection";
import useHomeFeed from "../hooks/useHomeFeed";
import usePosts from "../hooks/usePost";
import useAuth from "@/contexts/AuthContext";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useAuth();

  const { featuredGames, topRatedGames, loading, error, refetch } =
    useHomeFeed();

  const {
    trendingPosts,
    comments,
    deleting,
    updatePost,
    deletePost,
    getTrendingPosts,
    getPostComments,
    createComment,
    createReaction,
    removeReaction,
  } = usePosts({ page: 1, limit: 10 });

  useEffect(() => {
    getTrendingPosts();
  }, [getTrendingPosts]);

  const handleUpdatePost = async (postId, payload) => {
    await updatePost(postId, payload);
    await getTrendingPosts();
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    await getTrendingPosts();
  };

  const handleCreateComment = async (postId, payload) => {
    await createComment(postId, payload);
    await getPostComments(postId, 1, 5);
    await getTrendingPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <div className="flex me-4">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1">
            <div className="space-y-8 px-4 py-6 lg:p-0">
              <div className="h-90 animate-pulse rounded-[30px] bg-white/5" />
              <div className="h-105 animate-pulse rounded-[30px] bg-white/5" />
              <div className="h-80 animate-pulse rounded-[30px] bg-white/5" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <div className="flex me-4">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1">
            <div className="px-4 py-6 lg:p-0">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
                Không thể tải dữ liệu trang chủ: {error}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex me-4">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1">
          <div className="space-y-8 px-4 py-6 lg:p-0">
            <FeaturedDropSection featuredDrop={featuredGames} />

            <FeaturedGamesSection games={topRatedGames.slice(0, 2)} />

            <TrendingNowSection games={topRatedGames.slice(2, 6)} />

            <LatestPostsSection
              posts={trendingPosts || []}
              currentUser={user}
              comments={comments}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              onGetComments={getPostComments}
              onCreateComment={handleCreateComment}
              createReaction={createReaction}
              removeReaction={removeReaction}
              deleting={deleting}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
