import React from "react";
// import GameCard from "@/components/GameCard";
import TrendingGameCard from "@/components/TrendingGameCard";
import GameCard from "@/components/GameCard";

export default function GameLibrarySection({ games = [] }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Thư viện game
        </h2>
        
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => (
          <TrendingGameCard
            key={game.id}
            game={game}
            averageRating={game.averageRating}
            totalRatings={game.totalRatings}
          />
        ))}
      </div>
    </section>
  );
}
