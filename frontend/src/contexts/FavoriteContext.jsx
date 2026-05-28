import { createContext, useContext, useEffect, useState } from "react";
import { gameLibraryService } from "@/services/gameService";
import useAuth from "@/contexts/AuthContext";
import {
  isAuthenticatedUser,
  notifyAuthRequired,
} from "@/utils/authGuard";
import { toast } from "sonner";

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Load từ localStorage khi refresh
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavoriteIds(new Set(JSON.parse(saved)));
    }
  }, []);

  // Sync khi login/logout
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      localStorage.removeItem("favorites");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const favs = await gameLibraryService.getGameFavorites();
        const ids = new Set(favs.map((g) => g.id));
        setFavoriteIds(ids);
        localStorage.setItem("favorites", JSON.stringify([...ids]));
      } catch (err) {
        console.error("Fetch favorites error:", err);
      }
    };

    fetchFavorites();
  }, [user]);

 const toggleFavorite = async (gameId) => {
  if (!isAuthenticatedUser(user)) {
    notifyAuthRequired("Vui lòng đăng nhập để yêu thích game.");
    return false;
  }

  const isFav = favoriteIds.has(gameId);
  const newSet = new Set(favoriteIds);

  
  if (isFav) {
    newSet.delete(gameId);
  } else {
    newSet.add(gameId);
  }

  setFavoriteIds(newSet);
  localStorage.setItem("favorites", JSON.stringify([...newSet]));

  try {
    //  Gọi API sau
    if (isFav) {
      await gameLibraryService.removeGameFavorite(gameId);
    } else {
      await gameLibraryService.addGameFavorite(gameId);
    }

    toast.success(
      isFav ? "Đã bỏ game khỏi yêu thích." : "Đã thêm game vào yêu thích.",
    );
  } catch (err) {
    console.error("Toggle favorite error:", err);

    // Rollback nếu lỗi
    const rollbackSet = new Set(newSet);

    if (isFav) {
      rollbackSet.add(gameId);
    } else {
      rollbackSet.delete(gameId);
    }

    setFavoriteIds(rollbackSet);
    localStorage.setItem("favorites", JSON.stringify([...rollbackSet]));

    toast.error("Có lỗi xảy ra, đã hoàn tác!");
    return false;
  }

  return true;
};

  const isFavorite = (gameId) => favoriteIds.has(gameId);

  return (
    <FavoriteContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoriteContext);
