import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

import { gameLibraryService } from "@/services/gameService";

import useAuth from "@/contexts/AuthContext";
import useRequireAuth from "@/hooks/useRequireAuth";
import logo from "@/assets/logo.png";
import { getUserAvatarUrl } from "@/utils/userProfile";
import { getTags } from "@/services/tagService";
import { getTagLabel } from "@/utils/displayLabels";

const pages = [
  { label: "Trang chủ", path: "/" },
  { label: "Game", path: "/games" },
  { label: "Bài viết", path: "/posts" },
  { label: "Đăng game", path: "/uploadgame", requiresAuth: true },
];

const Header = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const { requireAuth } = useRequireAuth();

  const avatarSrc = getUserAvatarUrl(user);

  const [searchValue, setSearchValue] = useState("");
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [tagRes, gameRes] = await Promise.all([
          getTags(),
          gameLibraryService.getGameLibrary(),
        ]);

        setTags(tagRes?.data || tagRes || []);

        const gamesArray = Array.isArray(gameRes)
          ? gameRes
          : gameRes?.items || gameRes?.data || [];

        setGames(gamesArray);
      } catch (error) {
        console.error("Get search data failed:", error);
        setTags([]);
        setGames([]);
      }
    };

    fetchSearchData();
  }, []);

  const matchedTags = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return tags.slice(0, 6);

    return tags
      .filter((tag) => tag.name?.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [searchValue, tags]);

  const matchedGames = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return [];

    return games
      .filter((game) => {
        const title = game.title?.toLowerCase() || "";
        const name = game.name?.toLowerCase() || "";
        const studio = game.studio?.toLowerCase() || "";

        return (
          title.includes(keyword) ||
          name.includes(keyword) ||
          studio.includes(keyword)
        );
      })
      .slice(0, 6);
  }, [searchValue, games]);

  const handleNavClick = (event, item) => {
    if (item.requiresAuth && !requireAuth()) {
      event.preventDefault();
    }
  };

  const handleSignOut = async () => {
    navigate("/", { replace: true });

    await handleLogout();

    toast.success("Đăng xuất thành công!");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const keyword = searchValue.trim();

    if (!keyword) {
      navigate("/games");
      return;
    }

    navigate(`/games?search=${encodeURIComponent(keyword)}`);
    setIsSearchFocused(false);
  };

  const handleSearchByTag = (tagName) => {
    navigate(`/games?tag=${encodeURIComponent(tagName)}`);
    setSearchValue("");
    setIsSearchFocused(false);
  };

  const handleSearchByGame = (game) => {
    navigate(`/games/${game.id}`);
    setSearchValue("");
    setIsSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    navigate("/games");
  };

  return (
    <header className="sticky top-0 z-50 mb-5 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center gap-4 px-4 lg:h-21.5 lg:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="FabricIO Logo"
            className="h-12 w-12 rounded-2xl border border-orange-400/40 object-cover p-1 shadow-[0_0_24px_rgba(255,106,92,0.18)] lg:h-14 lg:w-14"
          />

          <span className="truncate bg-linear-to-r from-[#ff8a5c] to-[#ff5a3d] bg-clip-text text-[1.6rem] font-extrabold tracking-tight text-transparent lg:text-[1.8rem]">
            FabricIO
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <form
            onSubmit={handleSearchSubmit}
            className="relative mx-auto w-full max-w-[980px]"
          >
            <div className="flex h-14 w-full items-center rounded-full border border-white/10 bg-white/3 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-within:border-white/20">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />

              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Tìm game hoặc tag..."
                className="ml-4 min-w-0 flex-1 bg-transparent text-[1.05rem] text-white placeholder:text-zinc-500 outline-none"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="ml-3 rounded-full p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>

            {isSearchFocused && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+10px)] z-[60] overflow-hidden rounded-3xl border border-white/10 bg-[#111113] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
                onMouseDown={(event) => event.preventDefault()}
              >
                <div>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <Search className="h-4 w-4 text-zinc-500" />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Tìm game
                      </p>
                      <p className="truncate text-sm text-zinc-400">
                        {searchValue.trim()
                          ? searchValue.trim()
                          : "Xem tất cả game"}
                      </p>
                    </div>
                  </button>

                  {searchValue.trim() && (
                    <>
                      <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Game
                      </p>

                      {matchedGames.length > 0 ? (
                        <div className="space-y-1">
                          {matchedGames.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => handleSearchByGame(game)}
                              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                                {game.thumbnailUrl ? (
                                  <img
                                    src={
                                      game.thumbnailUrl.startsWith("http")
                                        ? game.thumbnailUrl
                                        : `http://localhost/${game.thumbnailUrl}`
                                    }
                                    alt={game.title || game.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Search className="h-4 w-4 text-zinc-500" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {game.title || game.name}
                                </p>

                                {game.studio && (
                                  <p className="truncate text-xs text-zinc-500">
                                    {game.studio}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-4 py-3 text-sm text-zinc-500">
                          Không tìm thấy game phù hợp.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="my-2 h-px bg-white/10" />

                <p className="px-4 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Tags
                </p>

                {matchedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 px-1 pb-1">
                    {matchedTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleSearchByTag(tag.name)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        {getTagLabel(tag.name)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-sm text-zinc-500">
                    Không tìm thấy tag phù hợp.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <nav className="flex items-center gap-1">
            {pages.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={(event) => handleNavClick(event, item)}
                className={({ isActive }) =>
                  [
                    "rounded-full px-5 py-3 text-[1.05rem] font-medium transition",
                    isActive
                      ? "bg-white/10 text-white shadow-[0_0_30px_rgba(255,98,77,0.12)]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {!user ? (
            <Link
              to="/signin"
              className="ml-2 px-3 text-[1.05rem] font-medium text-zinc-300 transition hover:text-white"
            >
              Đăng nhập
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-2 px-3 text-[1.05rem] font-medium text-zinc-300 transition hover:text-white"
              >
                Đăng xuất
              </button>

              <Link
                to="/profile"
                className="ml-1 flex items-center gap-3 rounded-[20px] bg-linear-to-r from-[#ff6a5c] to-[#ff5a3d] px-4 py-3 text-white shadow-[0_0_30px_rgba(255,98,77,0.25)] transition hover:brightness-105"
              >
                <img
                  src={avatarSrc}
                  alt={user?.username || "user"}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                />

                <span className="text-[1.05rem] font-semibold">
                  {user?.username || "Người dùng"}
                </span>
              </Link>
            </>
          )}
        </div>

        <Button
          onClick={onOpenSidebar}
          variant="ghost"
          size="icon"
          className="ml-auto text-white hover:bg-white/10 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
