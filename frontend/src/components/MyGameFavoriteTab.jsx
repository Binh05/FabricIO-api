import { useEffect, useState } from "react";
import TrendingGameCard from "./TrendingGameCard";
import { gameLibraryService, getGameRatings } from "@/services/gameService";

const MyGameFavoriteTab = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await gameLibraryService.getGameFavorites();
        setGames(res);
      } catch (err) {
        console.error("MyGameFavoriteTab error:", err);
        setError("Không thể tải danh sách game");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        if (!games || games.length === 0) return;

        const results = await Promise.all(
          games.map(async (g) => {
            const gameId = g.id || g.gameId;

            try {
              const r = await getGameRatings(gameId);

              return {
                gameId,
                average: r.average ?? 0,
                total: r.total ?? 0,
              };
            } catch (err) {
              console.error("Rating error:", gameId, err);
              return {
                gameId,
                average: 0,
                total: 0,
              };
            }
          }),
        );

        const map = {};
        results.forEach((r) => {
          map[r.gameId] = r;
        });

        setRatingsMap(map);
      } catch (err) {
        console.error("Fetch ratings error:", err);
      }
    };

    fetchRatings();
  }, [games]);

  return (
    <div className="container mx-auto">
      {loading ? (
        <p className="text-white">Đang tải...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : games.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
          Chưa có game yêu thích nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {games.map((game) => {
            const ratingData = ratingsMap[game.id] || {
              average: 0,
              total: 0,
            };

            return (
              <TrendingGameCard
                key={game.id}
                game={game}
                averageRating={ratingData.average}
                totalRatings={ratingData.total}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGameFavoriteTab;
