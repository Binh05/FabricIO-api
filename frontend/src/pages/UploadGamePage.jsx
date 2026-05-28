import { useUploadGame } from "@/hooks/useUploadGame";
import { useTag } from "@/hooks/useTag";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import useRequireAuth from "@/hooks/useRequireAuth";
import { ShieldAlert, Phone } from "lucide-react";
import { getGameTypeLabel, getTagLabel } from "@/utils/displayLabels";

const TAGS = [
  "Racing",
  "Arcade",
  "Cyberpunk",
  "RPG",
  "Adventure",
  "Story",
  "Puzzle",
  "Cozy",
  "Simulation",
  "Horror",
  "Sci-Fi",
  "Strategy",
  "Turn-Based",
  "Fantasy",
  "Casual",
  "Indie",
];

export default function UploadGamePage() {
  const { user } = useRequireAuth();
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    handleGameFile,
    handleThumbnail,
    handleTagIds,
    watch,
  } = useUploadGame();

  const { tags } = useTag();

  const gameFile = watch("GameFile");
  const thumbnail = watch("Thumbnail");
  const selectedTagIds = watch("TagIds") || [];

  const isGameBanned = user?.isGameBanned || user?.IsGameBanned;

  if (isGameBanned) {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-start justify-center pt-16 min-h-screen">
            <div className="max-w-xl w-full bg-zinc-900/50 border border-white/10 rounded-[40px] p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.4)]" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-rose-600/10 border border-rose-600/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-500">
                  <ShieldAlert className="w-12 h-12 text-rose-500" />
                </div>
                <h1 className="text-3xl font-black mb-4 tracking-tight">Truy cập bị chặn</h1>
                <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                  Tài khoản của bạn đã bị <span className="text-rose-400 font-bold">khóa quyền đăng game</span>. Vui lòng liên hệ Admin để được hỗ trợ.
                </p>
                
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-center gap-4 group/btn hover:bg-white/10 transition-all cursor-default">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Hỗ trợ 24/7</p>
                    <p className="text-2xl font-black text-white tracking-tighter">0123 456 789</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                    Trung tâm đăng game
                  </span>

                  <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Đăng game mới
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                    Tải build chơi trên trình duyệt hoặc bản tải xuống, thêm
                    ảnh thumbnail, mô tả, tag và giá bán để đưa game của bạn lên FabricIO.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="text-sm font-semibold text-zinc-300">
                    Trạng thái đăng tải
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {isSubmitting ? "Đang tải lên..." : "Sẵn sàng"}
                  </p>
                </div>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                <SectionHeader
                  title="Thông tin cơ bản"
                  description="Nhập tên game, mô tả, loại game và giá bán."
                />

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Input label="Tên game" error={errors.Title?.message}>
                    <input
                      {...register("Title")}
                      placeholder="Cozy Circuit"
                      className={inputCls}
                    />
                  </Input>

                  <Input label="Giá ($)" error={errors.Price?.message}>
                    <input
                      type="number"
                      step="0.01"
                      {...register("Price")}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </Input>

                  <Input label="Loại game" error={errors.GameType?.message}>
                    <select {...register("GameType")} className={inputCls}>
                      <option value="Browser">{getGameTypeLabel("Browser")}</option>
                      <option value="Download">{getGameTypeLabel("Download")}</option>
                    </select>
                  </Input>

                  <div className="lg:col-span-3">
                    <Input label="Mô tả" error={errors.Description?.message}>
                      <textarea
                        {...register("Description")}
                        rows={5}
                        placeholder="Mô tả gameplay, điểm nổi bật, controls hoặc thông tin phát hành..."
                        className={textareaCls}
                      />
                    </Input>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                  <SectionHeader
                    title="File game"
                    description="Tải build game hoặc file package của bạn."
                  />

                  <div className="mt-6">
                    <UploadBox
                      onChange={handleGameFile}
                      file={gameFile}
                      label="Click để chọn file game"
                    />
                    {errors.GameFile && (
                      <div className="mt-3">
                        <Error text={errors.GameFile.message} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                  <SectionHeader
                    title="Thumbnail"
                    description="Ảnh đại diện sẽ xuất hiện trong danh sách game."
                  />

                  <div className="mt-6">
                    <UploadBox
                      onChange={handleThumbnail}
                      file={thumbnail}
                      label="Click để chọn thumbnail"
                      preview
                    />
                    {errors.Thumbnail && (
                      <div className="mt-3">
                        <Error text={errors.Thumbnail.message} />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                <SectionHeader
                  title="Tags"
                  description="Chọn các tag phù hợp để người chơi dễ tìm game của bạn."
                />

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagIds(tag.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "border-orange-400/30 bg-linear-to-r from-[#ff6a4a] to-[#ff5a3b] text-white shadow-[0_10px_24px_rgba(255,90,59,0.22)]"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:border-orange-400/30 hover:bg-orange-400/10 hover:text-white"
                        }`}
                      >
                        {getTagLabel(tag.name)}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="sticky bottom-4 z-20 rounded-[28px] border border-white/10 bg-[#111113]/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Sẵn sàng đăng game?
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Kiểm tra lại thông tin trước khi gửi.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-linear-to-r from-[#ff6a4a] to-[#ff5a3b] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,90,59,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Đang tải lên..." : "Đăng game"}
                  </button>
                </div>
              </section>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////
function SectionHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      {description && (
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
      )}
    </div>
  );
}

function Input({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 block">
          <Error text={error} />
        </span>
      )}
    </label>
  );
}

function UploadBox({
  onChange,
  multiple = false,
  file,
  label,
  preview = false,
}) {
  const selectedFile = Array.isArray(file) ? file[0] : file;
  const previewUrl =
    preview && selectedFile instanceof File
      ? URL.createObjectURL(selectedFile)
      : "";

  return (
    <label className="group flex min-h-[230px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-white/15 bg-black/25 p-6 text-center transition hover:border-orange-400/40 hover:bg-orange-400/5">
      <input
        type="file"
        className="hidden"
        onChange={onChange}
        multiple={multiple}
      />

      {selectedFile ? (
        <div className="flex w-full flex-col items-center gap-4">
          {preview && previewUrl ? (
            <img
              src={previewUrl}
              alt={selectedFile.name}
              className="h-36 w-full max-w-sm rounded-2xl border border-white/10 object-cover shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-orange-400/10 text-3xl">
              🎮
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-emerald-300">Đã chọn file</p>
            <p className="mt-1 max-w-md truncate text-sm text-zinc-300">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Click để đổi file khác</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-2xl transition group-hover:border-orange-400/30 group-hover:bg-orange-400/10">
            +
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              {label || "Click hoặc kéo file"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              File sẽ được lưu sau khi bạn gửi form.
            </p>
          </div>
        </div>
      )}
    </label>
  );
}

function Error({ text }) {
  return <p className="text-xs font-medium text-red-300">{text}</p>;
}

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400/40 focus:bg-black/35";

const textareaCls = `${inputCls} resize-none`;
