import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Star,
  Heart,
  MessageSquare,
  Gamepad2,
  ImagePlus,
  Loader2,
  UploadCloud,
  FileArchive,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getUserAvatarUrl } from "@/utils/userProfile";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CommentItem from "@/components/CommentItem";
import {
  gameLibraryService,
  updateGame,
  deleteGame,
  getGameComments,
  getGameRatings,
} from "@/services/gameService";
import { useTag } from "@/hooks/useTag";
import { getGameTypeLabel, getTagLabel } from "@/utils/displayLabels";

/* ─────────────── helpers ─────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/70 focus:bg-black/35 focus:ring-4 focus:ring-violet-500/10";

const textareaCls = inputCls + " resize-none";

/* ─────────────── main page ─────────────── */
export default function DashboardGameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  /* edit state */
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const thumbnailRef = useRef(null);
  const [newGameFile, setNewGameFile] = useState(null);
  const gameFileRef = useRef(null);

  /* delete modal state */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { tags } = useTag();

  /* ── Clean ID ── */
  const cleanId = id?.replace(/^:/, "").split(":")[0];

  /* ── fetch game + stats ── */
  useEffect(() => {
    if (!cleanId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const g = await gameLibraryService.getGameById(cleanId);
        setGame(g);
        setForm({
          Title: g.title ?? "",
          Description: g.description ?? "",
          Price: g.price ?? 0,
          GameType: g.gameType ?? "Browser",
        });
        setSelectedTagIds((g.tags ?? []).map((t) => t.id ?? t));
      } catch (err) {
        // Nếu lỗi là do game không tồn tại (có thể vừa xóa xong) thì không hiện toast lỗi
        if (
          !err.message?.includes("404") &&
          !err.message?.toLowerCase().includes("not found")
        ) {
          toast.error("Không thể tải thông tin game");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        setCommentsLoading(true);
        const [ratingData, commentData] = await Promise.allSettled([
          getGameRatings(cleanId),
          getGameComments(cleanId, { page: 1, limit: 50 }),
        ]);
        if (ratingData.status === "fulfilled") setRatings(ratingData.value);
        if (commentData.status === "fulfilled") {
          const raw = commentData.value;
          setComments(
            Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []),
          );
        }
      } catch {
        /* silent */
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchAll();
    fetchStats();
  }, [cleanId]);

  /* ── edit handlers ── */
  const startEdit = () => {
    setIsEditing(true);
    setNewThumbnail(null);
    setThumbnailPreview(null);
    setNewGameFile(null);
    setForm({
      Title: game.title ?? "",
      Description: game.description ?? "",
      Price: game.price ?? 0,
      GameType: game.gameType ?? "Browser",
    });
    setSelectedTagIds((game.tags ?? []).map((t) => t.id ?? t));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewThumbnail(null);
    setThumbnailPreview(null);
    setNewGameFile(null);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSave = async () => {
    if (!form.Title?.trim()) {
      toast.error("Tên game không được trống");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        Title: form.Title,
        Description: form.Description,
        Price: parseFloat(form.Price) || 0,
        GameType: form.GameType,
        TagIds: selectedTagIds,
      };
      if (newThumbnail) payload.Thumbnail = newThumbnail;
      if (newGameFile) payload.GameFile = newGameFile;

      await updateGame(cleanId, payload);
      toast.success("Cập nhật game thành công!");

      /* refresh game data */
      const updated = await gameLibraryService.getGameById(cleanId);
      setGame(updated);
      setIsEditing(false);
      setNewThumbnail(null);
      setThumbnailPreview(null);
      setNewGameFile(null);
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete handler ── */
  const handleDelete = async () => {
    if (!game || !cleanId) return;
    if (deleteInput.trim() !== game.title.trim()) {
      toast.error("Tên game không khớp, vui lòng nhập đúng tên");
      return;
    }
    try {
      setDeleting(true);
      await deleteGame(cleanId);
      toast.success("Xóa game thành công!");

      // Chuyển hướng ngay lập tức để tránh re-render khi game đã mất
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Nếu game không tồn tại (404) hoặc gặp lỗi null source của backend (nhưng vẫn xóa xong)
      // thì vẫn coi là thành công theo yêu cầu của người dùng
      const errMsg = err.message?.toLowerCase() || "";
      const isActuallySuccess =
        errMsg.includes("not found") ||
        errMsg.includes("404") ||
        errMsg.includes("cannot be found") ||
        errMsg.includes("value cannot be null") ||
        errMsg.includes("parameter 'source'");

      if (isActuallySuccess) {
        toast.success("Xóa game thành công!");
        navigate("/dashboard", { replace: true });
        return;
      }

      toast.error(err.message || "Xóa game thất bại");
      setDeleting(false);
    }
  };

  /* ─────────── render ─────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Đang tải thông tin game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <p>Không tìm thấy game.</p>
      </div>
    );
  }

  const displayThumbnail = thumbnailPreview || game.thumbnailUrl;
  const currentTags = game.tags ?? [];
  const gameTagIds = currentTags.map((t) => t.id ?? t);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 py-0 pl-4 pr-6 lg:pl-6 lg:pr-8">
          <div className="w-full max-w-none space-y-6 pb-20">
            {/* Breadcrumb + title */}
            <section className="rounded-[28px] border border-white/10 bg-[#0f1014]/80 px-5 py-5 shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-300"
                    aria-label="Quay lại bảng điều khiển"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                      <span
                        onClick={() => navigate("/dashboard")}
                        className="cursor-pointer transition-colors hover:text-white"
                      >
                        Bảng điều khiển
                      </span>
                      <span className="text-zinc-600">/</span>
                      <span className="truncate font-medium text-violet-400">
                        {game.title}
                      </span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                      Chi tiết game
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                      Quản lý thông tin game, thumbnail, file build, tag, đánh
                      giá và bình luận của người chơi.
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <button
                      onClick={startEdit}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/30"
                    >
                      <Pencil className="h-4 w-4" />
                      Chỉnh sửa
                    </button>

                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDeleteInput("");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition-all hover:-translate-y-0.5 hover:border-red-500/45 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa game
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Lưu thay đổi
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Giá",
                  value: game.price > 0 ? `$${game.price}` : "Miễn phí",
                  color: "text-emerald-400",
                  icon: FileArchive,
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                },
                {
                  label: "Lượt đánh giá",
                  value: ratings.total ?? 0,
                  color: "text-rose-400",
                  icon: Heart,
                  bg: "bg-rose-500/10",
                  border: "border-rose-500/20",
                },
                {
                  label: "Điểm TB",
                  value: `${ratings.average?.toFixed(1) ?? 0}/5`,
                  color: "text-amber-400",
                  icon: Star,
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                },
                {
                  label: "Bình luận",
                  value: comments.length,
                  color: "text-blue-400",
                  icon: MessageSquare,
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                },
              ].map((s) => {
                const Icon = s.icon;

                return (
                  <div
                    key={s.label}
                    className="group rounded-[26px] border border-white/10 bg-[#0f1014]/80 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:border-orange-400/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-zinc-400">
                          {s.label}
                        </p>
                        <p
                          className={`mt-2 text-3xl font-extrabold ${s.color}`}
                        >
                          {s.value}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${s.border} ${s.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Main content */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left card */}
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0f1014]/80 shadow-[0_22px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                <div className="border-b border-white/10 px-5 py-5 md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                      <Gamepad2 className="h-6 w-6 text-violet-400" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Thông tin game
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {isEditing
                          ? "Đang chỉnh sửa thông tin hiển thị của game."
                          : "Thông tin chi tiết đang được hiển thị trên hệ thống."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-5 md:p-7">
                  {/* Thumbnail */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-zinc-300">
                        Ảnh thumbnail
                      </label>

                      {isEditing && newThumbnail && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          Đã chọn ảnh mới
                        </span>
                      )}
                    </div>

                    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-black/30">
                      {displayThumbnail ? (
                        <img
                          src={displayThumbnail}
                          alt={game.title}
                          className="aspect-[16/7] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex aspect-[16/7] w-full items-center justify-center bg-zinc-900">
                          <Gamepad2 className="h-16 w-16 text-zinc-700" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => thumbnailRef.current?.click()}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                            <ImagePlus className="h-7 w-7 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-white">
                            Đổi ảnh thumbnail
                          </span>
                        </button>
                      )}

                      <input
                        ref={thumbnailRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-300">
                          Tên game
                        </label>
                        <input
                          className={inputCls}
                          value={form.Title}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, Title: e.target.value }))
                          }
                          placeholder="Tên game"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-zinc-300">
                            Giá ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={inputCls}
                            value={form.Price}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, Price: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-zinc-300">
                            Loại game
                          </label>
                          <select
                            className={inputCls}
                            value={form.GameType}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                GameType: e.target.value,
                              }))
                            }
                          >
                            <option value="Browser">
                              {getGameTypeLabel("Browser")}
                            </option>
                            <option value="Download">
                              {getGameTypeLabel("Download")}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-300">
                          Mô tả
                        </label>
                        <textarea
                          rows={6}
                          className={textareaCls}
                          value={form.Description}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              Description: e.target.value,
                            }))
                          }
                          placeholder="Mô tả game..."
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-300">
                          Cập nhật build game
                        </label>

                        <div
                          onClick={() => gameFileRef.current?.click()}
                          className="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-black/25 p-5 transition-all hover:border-violet-500/50 hover:bg-violet-500/5"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 transition-transform group-hover:scale-105">
                            <UploadCloud className="h-6 w-6 text-violet-400" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {newGameFile
                                ? newGameFile.name
                                : "Chọn file game mới nếu muốn thay đổi"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              Hỗ trợ .zip, .rar, .7z
                            </p>
                          </div>
                        </div>

                        <input
                          ref={gameFileRef}
                          type="file"
                          accept=".zip,.rar,.7z"
                          className="hidden"
                          onChange={(e) => setNewGameFile(e.target.files?.[0])}
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-semibold text-zinc-300">
                          Tags
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const active = selectedTagIds.includes(tag.id);

                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                                  active
                                    ? "border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
                                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-violet-400/50 hover:text-white"
                                }`}
                              >
                                {getTagLabel(tag.name)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoRow label="Tên game" value={game.title} />

                      <InfoRow
                        label="Giá"
                        value={
                          <span className="font-bold text-emerald-400">
                            {game.price > 0 ? `$${game.price}` : "Miễn phí"}
                          </span>
                        }
                      />

                      <InfoRow
                        label="Loại game"
                        value={getGameTypeLabel(game.gameType)}
                      />

                      <InfoRow
                        label="Ngày cập nhật"
                        value={formatDate(game.updatedAt || game.createdAt)}
                      />

                      <div className="md:col-span-2">
                        <InfoRow
                          label="Mô tả"
                          value={
                            game.description ? (
                              <span className="whitespace-pre-line leading-7">
                                {game.description}
                              </span>
                            ) : (
                              <span className="italic text-zinc-500">
                                Chưa có mô tả
                              </span>
                            )
                          }
                        />
                      </div>

                      {currentTags.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="mb-3 text-sm font-semibold text-zinc-300">
                            Tags
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {currentTags.map((tag) => (
                              <span
                                key={tag.id ?? tag}
                                className="rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300"
                              >
                                {getTagLabel(tag.name ?? tag)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right comments */}
              <aside className="flex max-h-[calc(100vh-150px)] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0f1014]/80 shadow-[0_22px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl xl:sticky xl:top-28">
                <div className="border-b border-white/10 px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Bình luận
                        </h2>
                        <p className="text-sm text-zinc-400">
                          {comments.length} bình luận
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-5 pr-4 custom-scrollbar">
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 animate-pulse rounded-3xl bg-white/5"
                        />
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
                      <MessageSquare className="mb-3 h-11 w-11 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-300">
                        Game này chưa có bình luận nào.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Bình luận của người chơi sẽ được hiển thị tại đây.
                      </p>
                    </div>
                  ) : (
                    comments.map((comment, idx) => {
                      const authorComment = comment?.commentator;
                      const avatarUrl = getUserAvatarUrl(authorComment);

                      const displayName =
                        authorComment?.displayName ||
                        authorComment?.username ||
                        "Ẩn danh";

                      const commentContent =
                        comment?.comment?.content ||
                        comment?.content ||
                        "Không có nội dung";

                      return (
                        <article
                          key={comment.id ?? idx}
                          className="rounded-[24px] border border-white/10 bg-black/25 p-4 transition-all hover:border-orange-400/25 hover:bg-white/[0.04]"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <span className="truncate text-sm font-bold text-sky-200">
                                  {displayName}
                                </span>

                                <span className="shrink-0 text-xs text-zinc-500">
                                  {comment.createdAt
                                    ? new Date(
                                        comment.createdAt,
                                      ).toLocaleDateString("vi-VN")
                                    : ""}
                                </span>
                              </div>

                              <p className="mt-2 text-sm leading-6 text-zinc-200">
                                {commentContent}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          gameName={game.title}
          value={deleteInput}
          onChange={setDeleteInput}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteInput("");
          }}
          deleting={deleting}
        />
      )}
    </div>
  );
}

/* ── Helper sub-component ── */
function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <div className="text-sm font-medium text-zinc-200">{value}</div>
    </div>
  );
}

/* ── Delete confirmation modal ── */
function ConfirmDeleteModal({
  gameName,
  value,
  onChange,
  onConfirm,
  onCancel,
  deleting,
}) {
  const isMatch = value.trim() === gameName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Xóa game?</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Hành động này không thể hoàn tác
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning banner */}
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200/80 leading-relaxed">
            Game{" "}
            <span className="font-semibold text-red-300">"{gameName}"</span> sẽ
            bị xóa vĩnh viễn cùng toàn bộ file game và dữ liệu liên quan.
          </p>
        </div>

        {/* Confirm input */}
        <div className="mb-5">
          <label className="block text-sm text-zinc-300 mb-2">
            Nhập tên game để xác nhận:{" "}
            <span className="font-semibold text-white">{gameName}</span>
          </label>
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && isMatch && !deleting && onConfirm()
            }
            placeholder={`Nhập "${gameName}" để tiếp tục`}
            className="w-full bg-[#1a1c28] border border-[#2a2d3d] rounded-lg px-3 py-2.5 text-sm text-white
              placeholder:text-zinc-600 focus:outline-none transition-colors focus:border-red-500"
          />
          {value.length > 0 && !isMatch && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Tên không khớp
            </p>
          )}
          {isMatch && (
            <p className="text-xs text-emerald-400 mt-1.5">✓ Tên game khớp</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!isMatch || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700
              disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Xác nhận xóa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
