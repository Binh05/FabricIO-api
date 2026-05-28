import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getGameRatings } from "@/services/gameService";

export default function RatingsTab({ game }) {
  const [rating, setRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!game?.id) return;

      try {
        const res = await getGameRatings(game.id);

        setRating(res.average || 0);
        setTotal(res.total || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRatings();
  }, [game?.id]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-10">
      
      <p className="text-zinc-400 mb-8">
        Điểm đánh giá trung bình từ người dùng
      </p>

      {/* ⭐ Stars */}
      <div className="flex items-center gap-3 text-4xl">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;

          return (
            <Star
              key={i}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(null)}
              className={`cursor-pointer transition transform hover:scale-110
                ${
                  value <= (hover || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-600"
                }`}
            />
          );
        })}
      </div>

      {/* ⭐ Info */}
      <p className="mt-4 text-2xl font-semibold text-white">
        {rating.toFixed(1)} / 5
      </p>

      <p className="text-sm text-zinc-500 mt-1">
        {total} lượt đánh giá
      </p>
    </div>
  );
}
