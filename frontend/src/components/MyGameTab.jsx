import { useEffect, useState } from "react";
import TrendingGameCard from "./TrendingGameCard";
import {
  gameLibraryService,
  getGameRatings,
  getUserGamePurchases,
} from "@/services/gameService";

export default function MyGameTab({ userId }) {
  const [uploadedGames, setUploadedGames] = useState([]);
  const [purchasedGames, setPurchasedGames] = useState([]);
  const [filter, setFilter] = useState("uploaded"); // 'uploaded' | 'purchased'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingsMap, setRatingsMap] = useState({});

  const normalize = (res) =>
    res?.games ?? res?.items ?? res?.data?.items ?? res?.data ?? res ?? [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [uploadedRes, purchasedRes] = await Promise.all([
          gameLibraryService.getMyGames(), // game bạn upload
          getUserGamePurchases(), // game đã mua
        ]);

        setUploadedGames(normalize(uploadedRes));
        setPurchasedGames(normalize(purchasedRes));
      } catch (err) {
        console.error("MyGameTab error:", err);
        setError("Không thể tải danh sách game");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // chọn list theo filter (KHÔNG cần filter lại)
  const displayedGames = filter === "uploaded" ? uploadedGames : purchasedGames;

  useEffect(() => {
    const fetchRatingsForGames = async () => {
      try {
        const games = filter === "uploaded" ? uploadedGames : purchasedGames;

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

        console.log("ratingsMap:", map); // 🔥 debug

        setRatingsMap(map);
      } catch (err) {
        console.error("Fetch ratings list error:", err);
      }
    };

    fetchRatingsForGames();
  }, [uploadedGames, purchasedGames, filter]);
  return (
    <div>
      {/* FILTER */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("uploaded")}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === "uploaded"
              ? "bg-blue-500 text-white"
              : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          Game đã đăng
        </button>

        <button
          onClick={() => setFilter("purchased")}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === "purchased"
              ? "bg-blue-500 text-white"
              : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          Đã mua
        </button>
      </div>

      {/* STATE */}
      {loading && <p className="text-white">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* LIST */}
      {!loading && displayedGames.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
          Chưa có game nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedGames.map((game) => {
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
}
