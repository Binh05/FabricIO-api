import React from "react";
import TrendingGameCard from "../components/TrendingGameCard";
import GameCard from "@/components/GameCard";

export default function TrendingNowSection({ games = [] }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Đang thịnh hành
        </h2>
        <p className="mt-2 text-base text-sky-200/70">
          Khám phá nhanh những game đang được cộng đồng chú ý.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((item) => (
          <TrendingGameCard
            key={item.game.id}
            game={item.game}
            averageRating={item.averageRating}
            totalRatings={item.totalRating}
          />
        ))}
      </div>
    </section>
  );
}
