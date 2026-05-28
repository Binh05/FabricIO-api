import React from "react";
import { getUserAvatarUrl } from "@/utils/userProfile";
import useAuth from "@/contexts/AuthContext";
import { getRoleLabel } from "@/utils/displayLabels";

function formatTimeAgo(input) {
  if (!input) return "Vừa xong";

  const diffMs = Date.now() - new Date(input).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}

export default function CommentItem({ comment, authorId }) {
  const { user } = useAuth() || {};
  const authorComment = comment.commentator || {};
  const commentatorId =
    authorComment.id || authorComment.userId || comment.commentatorId || comment.userId;
  const currentUserId = user?.id || user?.userId;
  const isCurrentUserComment =
    commentatorId &&
    currentUserId &&
    String(commentatorId) === String(currentUserId);
  const displayCommentator = isCurrentUserComment
    ? { ...authorComment, ...user }
    : authorComment;
  const isAuthor =
    commentatorId && authorId && String(commentatorId) === String(authorId);
  const avatarUrl = getUserAvatarUrl(displayCommentator);
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#111214] px-4 py-3">
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={
            displayCommentator.displayName ||
            displayCommentator.username ||
            "Ảnh đại diện"
          }
          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-semibold ${isAuthor ? "text-red-400" : "text-sky-200"}`}
            >
              {displayCommentator.displayName || displayCommentator.username || "Ẩn danh"}
            </span>
            <span className="text-sm text-zinc-500">
              {formatTimeAgo(comment.createdAt)} -{" "}
              {getRoleLabel(isAuthor ? "Author" : "User")}
            </span>
          </div>

          <p className="mt-1 wrap-break-word text-[15px] leading-6 text-zinc-100">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}
