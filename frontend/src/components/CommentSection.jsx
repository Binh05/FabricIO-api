import React, { useEffect, useRef, useState } from "react";
import useInfiniteComments from "../hooks/useInfiniteComments";
import CommentItem from "./CommentItem";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function CommentSection({ postId, isOpen, authorId, onCreateComment }) {
  const { requireAuth } = useRequireAuth();

  const containerRef = useRef(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    comments,
    loading,
    initialLoading,
    error,
    hasNextPage,
    loadMore,
    refetch,
  } = useInfiniteComments(postId, isOpen);

  const handleSubmitComment = async () => {
    if (submitting || !requireAuth()) return;

    const value = content.trim();
    if (!value) return;

    try {
      setSubmitting(true);

      await onCreateComment(postId, value);

      setContent("");

      if (refetch) {
        await refetch();
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const threshold = 80;

      const reachedBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - threshold;

      if (reachedBottom && hasNextPage && !loading) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen, hasNextPage, loading, loadMore]);

  if (!isOpen) return null;

  return (
    <div className="mt-4 rounded-[26px] border border-white/8 bg-[#0d0e10] p-3">
      <div className="mb-4 rounded-2xl border border-white/8 bg-[#151515] p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết comment của bạn..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={!content.trim() || submitting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
          {submitting ? "Đang đăng..." : "Đăng bình luận"}
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="max-h-65 space-y-3 overflow-y-auto pr-1"
        >
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/2 p-4 text-sm text-zinc-400">
              Chưa có bình luận nào.
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} authorId={authorId} />
            ))
          )}

          {loading && (
            <div className="space-y-3 pt-1">
              <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
            </div>
          )}

          {!hasNextPage && comments.length > 0 && (
            <div className="py-2 text-center text-sm text-zinc-500">
              Đã hiển thị hết bình luận
            </div>
          )}
        </div>
      )}
    </div>
  );
}
