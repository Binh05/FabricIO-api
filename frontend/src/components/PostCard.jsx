/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import CommentSection from "./CommentSection";
import useRequireAuth from "@/hooks/useRequireAuth";
import { toast } from "sonner";
import { getRoleLabel } from "@/utils/displayLabels";

const getVisibleMediaCount = (count) => {
  if (count <= 4) return count;
  return 5;
};

const getMediaGridClass = (count) => {
  if (count === 1) {
    return "grid-cols-1 h-[360px] sm:h-[440px] lg:h-[520px]";
  }

  if (count === 2) {
    return "grid-cols-2 h-[300px] sm:h-[360px] lg:h-[420px]";
  }

  if (count === 3) {
    return "grid-cols-2 grid-rows-2 h-[340px] sm:h-[400px] lg:h-[460px]";
  }

  if (count === 4) {
    return "grid-cols-2 grid-rows-2 h-[360px] sm:h-[420px] lg:h-[480px]";
  }

  return "grid-cols-6 grid-rows-2 h-[360px] sm:h-[420px] lg:h-[480px]";
};

const getMediaItemClass = (count, index) => {
  if (count === 1) {
    return "h-full";
  }

  if (count === 2) {
    return "h-full";
  }

  if (count === 3) {
    if (index === 0) return "row-span-2 h-full";
    return "h-full";
  }

  if (count === 4) {
    return "h-full";
  }

  if (index === 0 || index === 1) {
    return "col-span-3 h-full";
  }

  return "col-span-2 h-full";
};

export default function PostCard({
  post,
  comments,
  currentUser,
  onUpdatePost,
  onDeletePost,

  onGetComments,
  onCreateComment,
  createReaction,
  removeReaction,
  deleting,
}) {
  const { requireAuth } = useRequireAuth();

  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content || "");

  const [existingImages, setExistingImages] = useState(post.media || []);
  const [newImages, setNewImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [commentLoading, setCommentLoading] = useState(false);
  const [commentPage, setCommentPage] = useState(1);

  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  const selectedMedia =
    selectedMediaIndex !== null ? post.media?.[selectedMediaIndex] : null;

  const closeMediaViewer = () => {
    setSelectedMediaIndex(null);
  };

  const showPreviousMedia = () => {
    if (!post.media?.length) return;

    setSelectedMediaIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? post.media.length - 1 : prev - 1;
    });
  };

  const showNextMedia = () => {
    if (!post.media?.length) return;

    setSelectedMediaIndex((prev) => {
      if (prev === null) return null;
      return prev === post.media.length - 1 ? 0 : prev + 1;
    });
  };

  const handleToggleComments = async () => {
    const nextOpen = !showComments;
    setShowComments(nextOpen);

    if (!nextOpen) return;

    try {
      setCommentLoading(true);
      await onGetComments(post.id, 1, 5);
      setCommentPage(1);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCreateComment = async (postId, content) => {
    if (!requireAuth()) return;

    const oldCommentCount = commentCount;

    try {
      setCommentCount((prev) => prev + 1);

      await onCreateComment(postId, content);
      await onGetComments(postId, 1, 5);
      setCommentPage(1);
    } catch (err) {
      setCommentCount(oldCommentCount);
    }
  };

  const normalizeReaction = (reaction) => {
    if (!reaction) return null;

    const value = reaction.toString().toUpperCase();

    if (value === "LIKE") return "Like";
    if (value === "DISLIKE") return "Dislike";

    return null;
  };

  const [userReaction, setUserReaction] = useState(
    normalizeReaction(post.myReaction),
  );

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [dislikeCount, setDislikeCount] = useState(post.dislikeCount ?? 0);
  const [reacting, setReacting] = useState(false);

  const isEditable = post?.authorId === currentUser?.id;

  useEffect(() => {
    setUserReaction(normalizeReaction(post.myReaction));
    setLikeCount(post.likeCount ?? 0);
    setDislikeCount(post.dislikeCount ?? 0);
    setCommentCount(post.commentCount ?? 0);
  }, [
    post.dislikeCount,
    post.id,
    post.likeCount,
    post.myReaction,
    post.commentCount,
  ]);

  const handleLike = async () => {
    if (reacting) return;
    if (!requireAuth()) return;

    const oldReaction = userReaction;
    const oldLikeCount = likeCount;
    const oldDislikeCount = dislikeCount;

    setReacting(true);

    try {
      if (oldReaction === "Like") {
        setUserReaction(null);
        setLikeCount((prev) => Math.max(prev - 1, 0));

        await removeReaction(post.id);
        return;
      }

      if (oldReaction === "Dislike") {
        setDislikeCount((prev) => Math.max(prev - 1, 0));
      }

      setUserReaction("Like");
      setLikeCount((prev) => prev + 1);

      if (oldReaction === "Dislike") {
        await removeReaction(post.id);
      }

      await createReaction(post.id, "Like");
    } catch (err) {
      setUserReaction(oldReaction);
      setLikeCount(oldLikeCount);
      setDislikeCount(oldDislikeCount);
    } finally {
      setReacting(false);
    }
  };

  const handleDislike = async () => {
    if (reacting) return;
    if (!requireAuth()) return;

    const oldReaction = userReaction;
    const oldLikeCount = likeCount;
    const oldDislikeCount = dislikeCount;

    setReacting(true);

    try {
      if (oldReaction === "Dislike") {
        setUserReaction(null);
        setDislikeCount((prev) => Math.max(prev - 1, 0));

        await removeReaction(post.id);
        return;
      }

      if (oldReaction === "Like") {
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }

      setUserReaction("Dislike");
      setDislikeCount((prev) => prev + 1);

      if (oldReaction === "Like") {
        await removeReaction(post.id);
      }

      await createReaction(post.id, "Dislike");
    } catch (err) {
      setUserReaction(oldReaction);
      setLikeCount(oldLikeCount);
      setDislikeCount(oldDislikeCount);
    } finally {
      setReacting(false);
    }
  };

  const handleSelectEditImages = (e) => {
    if (!requireAuth("Vui lòng đăng nhập để chỉnh sửa bài viết.")) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setExistingImages(post.media || []);
    setNewImages([]);
    setDeletedImageIds([]);
  };

  const handleSaveEdit = async () => {
    if (!requireAuth("Vui lòng đăng nhập để chỉnh sửa bài viết.")) return;

    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Tiêu đề và nội dung bài viết không được để trống.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("Title", editTitle.trim());
      formData.append("Content", editContent.trim());

      deletedImageIds.forEach((id) => {
        formData.append("DeletedImageIds", id);
      });

      newImages.forEach((file) => {
        formData.append("NewImages", file);
      });

      await onUpdatePost(post.id, formData);

      setIsEditing(false);
      setNewImages([]);
      setDeletedImageIds([]);

      toast.success("Cập nhật bài viết thành công!");
    } catch (error) {
      console.error("Update post failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Cập nhật bài viết thất bại. Vui lòng thử lại.";

      toast.error(message);
    }
  };

  const handleRemoveExistingImage = (imageId) => {
    if (!imageId) return;

    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));

    setDeletedImageIds((prev) =>
      prev.includes(imageId) ? prev : [...prev, imageId],
    );
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (selectedMediaIndex === null) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMediaViewer();
      }

      if (event.key === "ArrowLeft") {
        showPreviousMedia();
      }

      if (event.key === "ArrowRight") {
        showNextMedia();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMediaIndex, post.media?.length]);

  const mediaViewer =
    selectedMedia &&
    createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95"
        onClick={closeMediaViewer}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            closeMediaViewer();
          }}
          className="fixed right-5 top-5 z-[100000] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Đóng trình xem ảnh"
        >
          <X className="h-7 w-7" />
        </button>

        {post.media.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousMedia();
              }}
              className="fixed left-5 top-1/2 z-[100000] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextMedia();
              }}
              className="fixed right-5 top-1/2 z-[100000] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        <div
          className="flex h-screen w-screen items-center justify-center px-5 py-16 sm:px-20"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={selectedMedia.mediaUrl}
            alt={`${post.name}-${selectedMedia.id || selectedMediaIndex}`}
            className="max-h-[calc(100vh-128px)] max-w-full object-contain"
            draggable={false}
          />
        </div>

        {post.media.length > 1 && (
          <div className="fixed bottom-5 left-1/2 z-[100000] -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            {selectedMediaIndex + 1} / {post.media.length}
          </div>
        )}
      </div>,
      document.body,
    );

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111113]/95 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <img
                src={post.avatar || "/default-avatar.png"}
                alt={post.name}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/10"
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-lg font-semibold leading-none text-white">
                    {post.name}
                  </h3>
                  <span className="text-sm text-zinc-500">{post.username}</span>
                  <span className="text-sm text-zinc-600">•</span>
                  <span className="text-sm text-zinc-500">{post.time}</span>
                </div>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize text-sky-200/80">
              {getRoleLabel(post.role)}
            </span>
          </div>

          {isEditing ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#151515] p-4 text-sm text-white outline-none focus:border-white/20"
                placeholder="Chỉnh sửa tiêu đề..."
              />

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#151515] p-4 text-sm text-white outline-none focus:border-white/20"
                placeholder="Chỉnh sửa nội dung..."
                rows={5}
              />

              <div className="mt-4">
                <label className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-sm text-blue-300 hover:bg-white/5">
                  Đổi ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleSelectEditImages}
                  />
                </label>
              </div>

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151515]"
                    >
                      <img
                        src={image.mediaUrl}
                        alt={image.id}
                        className="aspect-square w-full object-contain bg-black/40"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 text-xs text-white hover:bg-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {newImages.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151515]"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="aspect-square w-full object-contain bg-black/40"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 text-xs text-white hover:bg-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Lưu
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                >
                  Hủy
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-white">
                {post.title}
              </h2>

              <p className="mt-4 whitespace-pre-line break-words text-base leading-7 text-zinc-100">
                {post.content}
              </p>
            </>
          )}
        </div>

        {!isEditing && !!post.media?.length && (
          <div
            className={`grid gap-1 bg-black ${getMediaGridClass(
              post.media.length,
            )}`}
          >
            {post.media
              .slice(0, getVisibleMediaCount(post.media.length))
              .map((media, index) => {
                const visibleCount = getVisibleMediaCount(post.media.length);
                const hiddenCount = post.media.length - visibleCount;
                const isLastVisible =
                  index === visibleCount - 1 && hiddenCount > 0;

                return (
                  <button
                    key={media.id || index}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`group relative overflow-hidden bg-[#050505] ${getMediaItemClass(
                      post.media.length,
                      index,
                    )}`}
                  >
                    {post.media.length === 1 && (
                      <img
                        src={media.mediaUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
                      />
                    )}

                    <img
                      src={media.mediaUrl}
                      alt={`${post.name}-${media.id || index}`}
                      className={`relative z-10 h-full w-full transition duration-300 group-hover:scale-[1.015] ${
                        post.media.length === 1
                          ? "object-contain"
                          : "object-cover"
                      }`}
                    />

                    <div className="pointer-events-none absolute inset-0 z-20 bg-black/0 transition group-hover:bg-black/10" />

                    {isLastVisible && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 text-4xl font-black text-white">
                        +{hiddenCount}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-5 border-t border-white/10 pt-4 text-sm text-zinc-400">
            <button
              type="button"
              disabled={reacting}
              onClick={handleLike}
              className={`transition hover:text-white disabled:opacity-60 ${
                userReaction === "Like" ? "text-red-500" : ""
              }`}
            >
              ♥ {likeCount}
            </button>

            <button
              type="button"
              disabled={reacting}
              onClick={handleDislike}
              className={`transition hover:text-white disabled:opacity-60 ${
                userReaction === "Dislike" ? "text-yellow-400" : ""
              }`}
            >
              👎 {dislikeCount}
            </button>

            <button
              type="button"
              className="transition hover:text-white"
              onClick={handleToggleComments}
            >
              Bình luận {showComments ? "▲" : "▼"} {commentCount}
            </button>

            {isEditable && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  setExistingImages(post.media || []);
                  setNewImages([]);
                  setDeletedImageIds([]);
                  setIsEditing(true);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          <CommentSection
            postId={post.id}
            isOpen={showComments}
            authorId={post.authorId}
            loading={commentLoading}
            onCreateComment={handleCreateComment}
          />
        </div>
      </article>

      {mediaViewer}
    </>
  );
}
