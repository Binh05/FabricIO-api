import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { rateGame, getGameRatings } from "@/services/gameService";
import { toast } from "sonner";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getPriceLabel, getTagLabel } from "@/utils/displayLabels";

export default function GameInfo({ game }) {
  const { user, requireAuth } = useRequireAuth();

  const [showRating, setShowRating] = useState(false);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const [localRating, setLocalRating] = useState(0);
  const [localTotal, setLocalTotal] = useState(0);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    if (!game) return;

    setLocalRating(game.averageRating || 0);
    setLocalTotal(game.totalRatings || 0);

    // ✅ KEY QUAN TRỌNG: user + game
    if (user?.id) {
      const saved = localStorage.getItem(`rating_${user.id}_${game.id}`);

      if (saved) {
        setUserRating(Number(saved));
      } else {
        setUserRating(null);
      }
    } else {
      setUserRating(null);
    }
  }, [game, user]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await getGameRatings(game.id);

        if (res) {
          setLocalRating(res.average || 0);
          setLocalTotal(res.total || 0);
        }
      } catch (err) {
        console.error("Fetch rating error:", err);
      }
    };

    if (game?.id) fetchRatings();
  }, [game?.id]);
  if (!game) {
    return <p className="text-zinc-400">Không có game</p>;
  }

  const tags = game.tags || [];

  const openRating = () => {
    if (!requireAuth("Vui lòng đăng nhập để đánh giá game.")) return;

    setStars(userRating || 0);
    setHover(0);
    setShowRating(true);
  };

  const handleRate = async () => {
    if (!requireAuth("Vui lòng đăng nhập để đánh giá game.")) return;

    try {
      setLoading(true);

      await rateGame(game.id, stars);

      // Lưu rating theo user (để disable button)
      localStorage.setItem(`rating_${user.id}_${game.id}`, stars);
      setUserRating(stars);

      const res = await getGameRatings(game.id);

      setLocalRating(res.average || 0);
      setLocalTotal(res.total || 0);

      setShowRating(false);
      toast.success("Đánh giá game thành công!");
    } catch (err) {
      toast.error(err.message || "Đánh giá game thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {/* TITLE */}
      <h1 className="text-5xl font-bold text-white">{game.title}</h1>

      {/* PRICE + BUTTON */}
      <div className="flex items-center gap-8 mt-8">
        <div>
          <div className="text-4xl font-bold text-emerald-400">
            {getPriceLabel(game.price)}
          </div>
          <p className="text-sm text-zinc-500">Thanh toán một lần</p>
        </div>

        <button
          onClick={openRating}
          className="bg-yellow-500 px-6 py-3 rounded-xl font-semibold"
        >
          {userRating !== null ? "⭐ Cập nhật đánh giá" : "⭐ Đánh giá game"}
        </button>
      </div>

      {/* RATING DISPLAY */}
      <div className="flex items-center gap-3 mt-10">
        <div className="flex text-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < Math.round(localRating)
                  ? "text-amber-400 fill-current"
                  : "text-zinc-600"
              }
            />
          ))}
        </div>

        <span className="text-3xl font-semibold">{localRating.toFixed(1)}</span>

        <span className="text-sm text-zinc-500">({localTotal} đánh giá)</span>
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-3 mt-10">
        {tags.length > 0 ? (
          tags.map((tag, i) => (
            <span key={i} className="bg-zinc-900 px-4 py-2 rounded-full">
              {getTagLabel(tag)}
            </span>
          ))
        ) : (
          <p className="text-zinc-500">Không có tags</p>
        )}
      </div>

      {/* POPUP */}
      {showRating && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#1c1d20] p-6 rounded-xl w-[400px]">
            <h2 className="text-xl text-white text-center mb-4">Đánh giá game</h2>

            <div className="flex justify-center gap-2 text-4xl">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = n <= (hover || stars);

                return (
                  <Star
                    key={n}
                    onClick={() => setStars(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className={`cursor-pointer ${
                      active
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-500"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 bg-zinc-600 py-2 rounded"
              >
                Hủy
              </button>

              <button
                onClick={handleRate}
                disabled={loading || stars === 0}
                className="flex-1 bg-yellow-500 py-2 rounded"
              >
                {loading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
