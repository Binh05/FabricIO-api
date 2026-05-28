import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreatePostBox from "@/components/CreatePostBox";
import PostCard from "../components/PostCard";
import useAuth from "@/contexts/AuthContext";
import usePosts from "../hooks/usePost";
import { ShieldAlert, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";

const POST_PAGE_SIZE = 5;

const PostPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetPostId = searchParams.get("postId");

  const {
    posts,
    comments,
    loading,
    creating,
    deleting,
    error,
    createPost,
    updatePost,
    deletePost,
    getPostComments,
    createComment,
    createReaction,
    removeReaction,
    refetch,
  } = usePosts({ page: 1, limit: 100 });

  const { user } = useAuth();

  const latestPostsRef = useRef(null);
  const isFirstPostPageRender = useRef(true);

  const [postPage, setPostPage] = useState(1);

  const totalPostPages = Math.max(1, Math.ceil(posts.length / POST_PAGE_SIZE));

  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * POST_PAGE_SIZE;
    const end = start + POST_PAGE_SIZE;

    return posts.slice(start, end);
  }, [posts, postPage]);

  useEffect(() => {
    setPostPage(1);
  }, [posts.length]);

  useEffect(() => {
    if (isFirstPostPageRender.current) {
      isFirstPostPageRender.current = false;
      return;
    }

    if (!latestPostsRef.current) return;

    latestPostsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [postPage]);

  useEffect(() => {
    if (!loading && targetPostId && posts.length > 0) {
      const targetPostIndex = posts.findIndex(
        (post) => String(post.id) === String(targetPostId),
      );

      if (targetPostIndex !== -1) {
        const targetPage = Math.floor(targetPostIndex / POST_PAGE_SIZE) + 1;
        setPostPage(targetPage);
      }

      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${targetPostId}`);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });

          element.classList.add(
            "ring-2",
            "ring-violet-500",
            "ring-offset-4",
            "ring-offset-black",
          );

          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-violet-500",
              "ring-offset-4",
              "ring-offset-black",
            );
          }, 3000);
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [loading, targetPostId, posts]);

  const handleCreatePost = async (payload) => {
    await createPost({
      ...payload,
    });

    await refetch();
  };

  const handleUpdatePost = async (postId, payload) => {
    await updatePost(postId, payload);

    await refetch();
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    await refetch();
  };

  const handleCreateComment = async (postId, payload) => {
    await createComment(postId, payload);
  };

  const handleChangePostPage = (pageNumber) => {
    setPostPage(pageNumber);
  };

  const handlePrevPostPage = () => {
    handleChangePostPage(Math.max(postPage - 1, 1));
  };

  const handleNextPostPage = () => {
    handleChangePostPage(Math.min(postPage + 1, totalPostPages));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="flex me-4">
        <Sidebar />

        <main className="flex-1">
          <div className="space-y-8 px-4 py-6 lg:p-0">
            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff6a4a]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                    Bảng tin cộng đồng
                  </span>

                  <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Không gian bài viết cho người chơi và nhà phát triển
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                    Chia sẻ cập nhật, chúc mừng ngày ra mắt, thảo luận gameplay
                    và kết nối với nhà sáng tạo cùng người chơi trên FabricIO.
                  </p>
                </div>

                <div className="hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right lg:block">
                  <p className="text-3xl font-black text-white">
                    {posts?.length || 0}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Tổng bài viết
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Tạo bài viết
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Chia sẻ cập nhật, câu hỏi hoặc cảm nhận mới với cộng đồng.
                  </p>
                </div>

                <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400">
                  {user
                    ? `Đăng với tên ${user?.displayName || user?.username}`
                    : "Chế độ khách"}
                </span>
              </div>

              {user?.isPostBanned || user?.IsPostBanned ? (
                <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-rose-500/5 p-10 text-center backdrop-blur-xl group">
                  <div className="absolute top-0 left-0 h-1 w-full bg-rose-600/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-rose-600/20 bg-rose-600/10 transition-transform duration-500 group-hover:rotate-12">
                      <ShieldAlert className="h-10 w-10 text-rose-500" />
                    </div>

                    <h3 className="mb-3 text-2xl font-black tracking-tight text-white">
                      Tính năng bị hạn chế
                    </h3>

                    <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-zinc-400">
                      Tài khoản của bạn đã bị{" "}
                      <span className="font-bold text-rose-400">
                        chặn quyền đăng bài viết
                      </span>
                      . Vui lòng liên hệ Admin qua số điện thoại để mở lại tính
                      năng này.
                    </p>

                    <div className="inline-flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-6 py-4 transition-all">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Phone className="h-5 w-5 text-emerald-500" />
                      </div>

                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Hỗ trợ
                        </p>
                        <p className="text-xl font-black tracking-tighter text-white">
                          0123 456 789
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <CreatePostBox
                  user={user}
                  onPostCreated={handleCreatePost}
                  loading={creating}
                  error={error}
                />
              )}
            </section>

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </p>
            )}

            <section
              ref={latestPostsRef}
              className="scroll-mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6"
            >
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Bài viết mới nhất
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Những bài viết mới nhất từ người chơi và nhà phát triển.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {posts.length > 0 && (
                    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400">
                      Trang {postPage} / {totalPostPages}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={refetch}
                    className="w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-400" />
                    <p className="text-sm text-zinc-500">
                      Đang tải bài viết...
                    </p>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {paginatedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onUpdatePost={handleUpdatePost}
                        onDeletePost={handleDeletePost}
                        onGetComments={getPostComments}
                        comments={comments[post.id] || []}
                        onCreateComment={handleCreateComment}
                        createReaction={createReaction}
                        removeReaction={removeReaction}
                        deleting={deleting}
                      />
                    ))}
                  </div>

                  {totalPostPages > 1 && (
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-zinc-500">
                        Hiển thị{" "}
                        <span className="font-semibold text-zinc-300">
                          {(postPage - 1) * POST_PAGE_SIZE + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-semibold text-zinc-300">
                          {Math.min(postPage * POST_PAGE_SIZE, posts.length)}
                        </span>{" "}
                        trên{" "}
                        <span className="font-semibold text-zinc-300">
                          {posts.length}
                        </span>{" "}
                        bài viết
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={postPage === 1}
                          onClick={handlePrevPostPage}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Trước
                        </button>

                        {Array.from({ length: totalPostPages }).map(
                          (_, index) => {
                            const pageNumber = index + 1;

                            return (
                              <button
                                key={pageNumber}
                                type="button"
                                onClick={() => handleChangePostPage(pageNumber)}
                                className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                                  postPage === pageNumber
                                    ? "bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.25)]"
                                    : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          },
                        )}

                        <button
                          type="button"
                          disabled={postPage === totalPostPages}
                          onClick={handleNextPostPage}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 py-14 text-center">
                  <p className="text-lg font-bold text-white">
                    Chưa có bài viết nào
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Hãy là người đầu tiên chia sẻ điều gì đó với cộng đồng.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostPage;
