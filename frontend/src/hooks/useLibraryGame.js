import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { gameLibraryService } from "@/services/gameService";
import { filterProducts } from "../utils/filterProducts";
import { getGameRatings } from "@/services/gameService";
import { usePurchase } from "@/hooks/usePurchase";

const BASE_URL = "http://localhost/";

const normalizePrice = (price) => {
  if (price === null || price === undefined) return 0;

  const num = typeof price === "string" ? parseFloat(price) : price;

  return isNaN(num) ? 0 : num;
};

const transformGameData = (apiGames) => {
  if (!Array.isArray(apiGames)) return [];

  return apiGames.map((game) => {
    const rawPrice = normalizePrice(game.price);

    return {
      ...game,
      thumbnailUrl: game?.thumbnailUrl
        ? game.thumbnailUrl.startsWith("http")
          ? game.thumbnailUrl
          : `${BASE_URL}${game.thumbnailUrl}`
        : "https://via.placeholder.com/400x300",
      price: rawPrice,
      averageRating: game?.averageRating ?? 0,
      totalRatings: game?.totalRatings ?? 0,
    };
  });
};

export const useProducts = (page, limit) => {
  const initialFilters = {
    search: "",
    price: "All",
    tag: "",
    sort: "Newest",
    ownership: "All",
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
    

  const { purchasedIds } = usePurchase();

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams({});
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await gameLibraryService.getGameLibrary({
        page,
        limit,
      });



      const gamesArray = Array.isArray(data) ? data : data?.items || [];

      const gamesWithRatings = await Promise.all(
        gamesArray.map(async (game) => {
          try {
            const ratingRes = await getGameRatings(game.id);

            return {
              ...game,
              averageRating: ratingRes?.average ?? 0,
              totalRatings: ratingRes?.total ?? 0,
            };
          } catch (err) {
            console.warn("Rating error:", game.id);
            return {
              ...game,
              averageRating: 0,
              totalRatings: 0,
            };
          }
        }),
      );

      const transformed = transformGameData(gamesWithRatings);

      setProducts(transformed);
      setFilteredProducts(transformed);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching games:", error);
      setProducts([]);
      setFilteredProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  useEffect(() => {
    const result = filterProducts(products, filters, purchasedIds);
    setFilteredProducts(result);
  }, [filters, products, purchasedIds]);

  return {
    filters,
    setFilters,
    filteredProducts,
    total,
    loading,
    resetFilters,
    refetch: fetchData,
  };
};
