import React from "react";
import { useNavigate } from "react-router";
import { getTagLabel } from "@/utils/displayLabels";

export default function FeaturedDropSection({ featuredDrop }) {
  if (!featuredDrop.price) return null
  const navigate = useNavigate();
  const handleClickView = () => {
    navigate(`/games/${featuredDrop.id}`);
  };
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,106,74,0.18),transparent_30%),linear-gradient(135deg,rgba(90,23,20,0.95),rgba(18,18,20,0.96))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] lg:p-7">
      <div className="grid items-center gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-orange-100 backdrop-blur">
            Game nổi bật
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl xl:text-6xl">
            {featuredDrop?.title ||
              "Khám phá game indie, cập nhật từ nhà sáng tạo và thảo luận cộng đồng trong một không gian hiện đại."}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
            Mô tả:{" "}
            {featuredDrop?.description ||
              "GameStore kết hợp khám phá game và bảng tin cộng đồng trong một trải nghiệm hiện đại."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handleClickView}
              className="rounded-2xl bg-linear-to-r from-[#ff6a4a] to-[#ff4d61] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff5b4d]/20 hover:scale-[1.02]"
            >
              Xem game
            </button>
          </div>
        </div>

        <div className="relative ml-auto w-full max-w-142.5 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl">
          <img
            src={
              featuredDrop?.thumbnailUrl ||
              "https://cdn.cloudflare.steamstatic.com/steam/apps/2566580/capsule_616x353.jpg?t=1700787845"
            }
            alt={featuredDrop?.title || "Game nổi bật"}
            className="h-75 w-full object-cover md:h-90"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-5 right-5 w-55 rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Đang thịnh hành hôm nay</p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              {featuredDrop?.title || "Ashfall Keep"}
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xl font-semibold text-[#ffb14a]">
                {featuredDrop.price === 0 ? "Miễn phí" : `$${featuredDrop.price.toFixed(2)}`}
              </span>
              <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-200">
                {featuredDrop.gameTags?.map((tag) => getTagLabel(tag.name)).join(", ") ||
                  "Hành động, Phiêu lưu"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
