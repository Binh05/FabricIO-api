import React, { useMemo, useState } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";
import { toast } from "sonner";
import { getUserAvatarUrl } from "@/utils/userProfile";

export default function CreatePostBox({
  user = {},
  onPostCreated,
  loading = false,
  error = "",
}) {
  const { requireAuth } = useRequireAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [formError, setFormError] = useState("");

  const previewImages = useMemo(() => {
    return images.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleChangeContent = (e) => {
    setContent(e.target.value);
  };

  const handleSelectImages = (e) => {
    if (!requireAuth("Vui lòng đăng nhập để đăng bài.")) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!requireAuth("Vui lòng đăng nhập để đăng bài.")) return;

    if (!title.trim()) {
      const message = "Tiêu đề bài viết không được để trống.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!content.trim()) {
      const message = "Nội dung bài viết không được để trống.";
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setFormError("");

      await onPostCreated({
        title: title.trim(),
        content: content.trim(),
        images,
      });

      setTitle("");
      setContent("");
      setImages([]);

      toast.success("Đăng bài thành công!");
    } catch (error) {
      console.error("Create post failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng bài thất bại. Vui lòng thử lại.";

      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 md:p-6">
      <div className="flex items-center gap-3">
        <img
          src={getUserAvatarUrl(user)}
          alt="avatar"
          className="h-10 w-10 rounded-full object-cover"
        />

        <div>
          <p className="font-semibold">
            {user?.displayName || user?.DisplayName || "Người dùng"}
          </p>

          <p className="text-sm text-blue-400">
            {user?.username || user?.Username || "@nguoidung"}
          </p>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={handleChangeTitle}
        placeholder="Nhập tiêu đề bài viết..."
        className="mt-4 w-full rounded-xl border border-white/10 bg-[#151515] p-4 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
      />

      <textarea
        value={content}
        onChange={handleChangeContent}
        placeholder="Chia sẻ về bản build mới, ghi chú cập nhật hoặc game bạn đang yêu thích..."
        className="mt-4 w-full rounded-xl border border-white/10 bg-[#151515] p-4 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
        rows={5}
      />

      {formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}

      <div className="mt-4 flex gap-3">
        <label className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-sm text-blue-300 hover:bg-white/5">
          Tải ảnh lên
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelectImages}
          />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-linear-to-r from-red-500 to-pink-500 px-6 py-2 font-semibold shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>

      {!!previewImages.length && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {previewImages.map((img, index) => (
            <div
              key={`${img.name}-${index}`}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151515]"
            >
              <img
                src={img.url}
                alt={img.name}
                className="aspect-square w-full object-cover"
              />

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
