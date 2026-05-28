import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gameLibraryService } from "@/services/gameService";
import { getGameRatings } from "@/services/gameService";

export const useGameDetail = () => {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {

      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // gọi song song
        const [gameRes, ratingRes] = await Promise.all([
          gameLibraryService.getGameById(id),
          getGameRatings(id),
        ]);

        // console.log("Game API:", gameRes);
        // console.log("Rating API:", ratingRes);

        if (!gameRes) {
          setError("Không tìm thấy game");
          return;
        }

        //transform data
        const transformed = {
          id: gameRes.id,
          title: gameRes.title,
          description: gameRes.description,
          type: gameRes.gameType || "Không rõ",

          image: gameRes.thumbnailUrl,

          rawPrice: gameRes.price,

          // UI display
          price:
            gameRes.price === 0
              ? "Miễn phí"
              : `$${Number(gameRes.price).toFixed(2)}`,

          rating: ratingRes?.average ?? 0,
          totalRatings: ratingRes?.total ?? 0,

          tags: gameRes.gameTags?.map((t) => t.name || t.tag?.name) || [],
        };

        setGame(transformed);
      } catch (err) {
        console.error(err);
        setError("Không thể tải game");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  return { game, loading, error };
};
