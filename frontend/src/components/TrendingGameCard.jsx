import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFavorites } from "@/contexts/FavoriteContext";
import { usePurchase } from "@/hooks/usePurchase";
import { getTagLabel } from "@/utils/displayLabels";

const renderStars = (rating = 0) => {
  return Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;

    if (rating >= starValue) {
      return <FaStar key={i} className="text-yellow-400" />;
    }

    if (rating >= starValue - 0.5) {
      return <FaStarHalfAlt key={i} className="text-yellow-400" />;
    }

    return <FaRegStar key={i} className="text-yellow-400" />;
  });
};

export default function TrendingGameCard({
  game,
  averageRating = 0,
  totalRatings = 0,
}) {
  const navigate = useNavigate();

  const { isFavorite, toggleFavorite } = useFavorites();
  const { purchasedIds } = usePurchase();

  const fav = isFavorite(game.id);
  const isPurchased = purchasedIds.includes(String(game.id));

  const handleClickView = () => {
    navigate(`/games/${game.id}`);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <article
      onClick={handleClickView}
      className="
        group relative flex h-full min-h-[520px] cursor-pointer flex-col overflow-hidden
        rounded-[26px] border border-white/10 bg-[#151619]
        shadow-[0_14px_34px_rgba(0,0,0,0.32)]
        transition duration-300
        hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)]
      "
    >
      {isPurchased && (
        <span
          className="
            absolute left-4 top-4 z-10 rounded-full
            bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white
            shadow-[0_8px_18px_rgba(16,185,129,0.35)]
          "
        >
          ✔ Đã mua
        </span>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={game.thumbnailUrl}
          alt={game.title}
          className="
            h-full w-full object-cover
            transition duration-500 group-hover:scale-105
          "
        />

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#151619] to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 min-h-[56px] text-[22px] font-extrabold leading-tight text-white">
              {game.title}
            </h3>

            {game.studio && (
              <p className="mt-1 truncate text-sm text-zinc-400">
                {game.studio}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border
              transition duration-200 hover:scale-105
              ${
                fav
                  ? "border-red-400/40 bg-red-500/20 text-red-400"
                  : "border-red-500/25 bg-red-500/10 text-white hover:bg-red-500/20"
              }
            `}
            aria-label="Bật/tắt yêu thích"
          >
            {fav ? (
              <Heart className="h-5 w-5 fill-red-400 text-red-400" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mb-4 min-h-[72px]">
          <div className="flex flex-wrap gap-2">
            {game.gameTags?.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="
                  rounded-full border border-white/10 bg-white/[0.06]
                  px-3 py-1.5 text-sm font-medium text-zinc-300
                "
              >
                {getTagLabel(tag.name)}
              </span>
            ))}

            {game.gameTags?.length > 4 && (
              <span
                className="
                  rounded-full border border-white/10 bg-white/[0.06]
                  px-3 py-1.5 text-sm font-medium text-zinc-400
                "
              >
                +{game.gameTags.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          {!isPurchased ? (
            <span
              className={`text-2xl font-extrabold leading-none ${
                Number(game.price) === 0 ? "text-emerald-400" : "text-[#ffb14a]"
              }`}
            >
              {Number(game.price) === 0 ? "Miễn phí" : `$${game.price}`}
            </span>
          ) : (
            <span className="text-sm font-semibold text-emerald-400">
              Trong thư viện
            </span>
          )}

          <span
            className="
              flex shrink-0 items-center gap-1.5 rounded-full border border-white/10
              bg-white/[0.06] px-3 py-1.5 text-sm text-zinc-200
            "
          >
            <span className="flex items-center gap-0.5">
              {renderStars(averageRating)}
            </span>

            <span className="text-zinc-300">
              {Number(averageRating || 0).toFixed(1)} ({totalRatings ?? 0})
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
