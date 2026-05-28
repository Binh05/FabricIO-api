import React from "react";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router";

export default function LatestPostsSection({
  posts = [],
  comments = {},
  currentUser = null,

  onUpdatePost,
  onDeletePost,
  onGetComments,
  onCreateComment,
  createReaction,
  removeReaction,

  deleting = false,
}) {
  const navigate = useNavigate();

  const handleClickOpenFeed = () => {
    navigate(`/posts`);
  };
  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Bài viết mới nhất
          </h2>

          <p className="mt-2 text-base text-sky-200/70">
            Cập nhật cộng đồng từ người chơi và nhà phát triển.
          </p>
        </div>

        <button
          onClick={handleClickOpenFeed}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/10"
        >
          Mở bảng tin
        </button>
      </div>

      <div className="space-y-5">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              comments={comments[post.id] || []}
              onUpdatePost={onUpdatePost}
              onDeletePost={onDeletePost}
              onGetComments={onGetComments}
              onCreateComment={onCreateComment}
              createReaction={createReaction}
              removeReaction={removeReaction}
              deleting={deleting}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
            Chưa có bài viết nào.
          </div>
        )}
      </div>
    </section>
  );
}
