/* eslint-disable no-unused-vars */
import React, { use } from "react";

import { useNavigate } from "react-router";
import { usePurchase } from "@/hooks/usePurchase";
import { getPlayUrl } from "@/services/gameService";
import { getPriceLabel, getTagLabel } from "@/utils/displayLabels";

export default function GameCard({ game }) {
  const navigate = useNavigate();
  const { purchasedIds } = usePurchase();

  const isPurchased = purchasedIds.includes(String(game.id));

  const handleClickView = () => {
    navigate(`/games/${game.id}`);
  };

  return (
    <article
      onClick={handleClickView}
      className={`cursor-pointer flex h-full flex-col overflow-hidden rounded-[22px] border 
      ${isPurchased ? "border-green-500/40" : "border-white/10"} 
      bg-[#141517] shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-white/15`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={game.image || game.thumbnailUrl}
          alt={game.title}
          className="h-44 w-full object-cover"
        />

        {/* Badge đã mua */}
        {isPurchased && (
          <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
            ✔ Đã mua
          </span>
        )}

        {/* <button
          onClick={(e) => e.stopPropagation()}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[14px] border border-red-500/25 bg-red-500/10 text-sm text-white"
        >
          ♡
        </button> */}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col space-y-3 p-4">
        {/* Title */}
        <div>
          <h3 className="truncate text-lg font-bold text-white">
            {game.title}
            {game.type && (
              <span className="ml-2 text-sm text-white">
                ({game.type})
              </span>
            )}
          </h3>
        </div>

        {/* Tags */}
        <div className="grid grid-cols-2 gap-2 min-h-[88px] content-start">
          {game.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-zinc-300"
            >
              {getTagLabel(tag)}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          {!isPurchased ? (
            <span
              className={`text-2xl font-bold ${
                game.price === "Free"
                  ? "text-[#1ee59b]"
                  : "text-[#ffb14a]"
              }`}
            >
              {getPriceLabel(game.price)}
            </span>
          ) : (
            <span className="text-lg font-semibold text-green-500">
              Đã sở hữu
            </span>
          )}

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200">
            ★ {game.rating}
          </span>
        </div>

        {/* Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClickView();
            }}
            className="w-full rounded-xl bg-linear-to-r from-[#ff6a4a] to-[#ff4d61] px-4 py-2 text-sm font-semibold text-white"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}
