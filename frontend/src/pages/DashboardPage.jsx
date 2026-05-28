import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import StatsCards from "../components/dashboard/StatsCards";
import MyGamesList from "../components/dashboard/MyGamesList";
import GameAnalyticsTab from "../components/dashboard/GameAnalyticsTab";
import { userService } from "../services/userService";
import { getGameRatings, getGameComments } from "../services/gameService";
import { toast } from "sonner";

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPosts: 0,
    totalRatings: 0,
    avgRating: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGame, setSelectedGame] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all user games
        const myGames = await userService.getMyGames();

        let tRatings = 0;
        let tComments = 0;
        let sumAvgRating = 0;
        let ratedGamesCount = 0;

        // Fetch stats for each game
        const gamesWithStats = await Promise.all(
          myGames.map(async (game) => {
            let ratingData = { Total: 0, Average: 0 };
            let comments = [];

            try {
              ratingData = await getGameRatings(game.id);
            } catch (e) {
              /* ignore error if no ratings */
            }

            try {
              comments = await getGameComments(game.id);
            } catch (e) {
              /* ignore error if no comments */
            }

            const totalR = ratingData.total || 0;
            const avgR = ratingData.average || 0;
            const totalC = Array.isArray(comments)
              ? comments.length
              : comments.total || 0;

            tRatings += totalR;
            tComments += totalC;

            if (totalR > 0) {
              sumAvgRating += avgR;
              ratedGamesCount++;
            }

            return {
              ...game,
              stats: {
                ratings: totalR,
                avgRating: avgR,
                comments: totalC,
                commentsData: Array.isArray(comments)
                  ? comments
                  : comments.items || [],
              },
            };
          }),
        );

        // Fetch post count
        let totalPosts = 0;
        try {
          const postsData = await userService.getUserPosts(null, {
            page: 1,
            limit: 1,
          });
          // API trả về { total, items, page, pageSize }
          totalPosts = postsData?.total ?? postsData?.Total ?? 0;
        } catch (e) {
          /* ignore */
        }

        setGames(gamesWithStats);
        setStats({
          totalGames: myGames.length,
          totalPosts,
          totalRatings: tRatings,
          avgRating:
            ratedGamesCount > 0
              ? (sumAvgRating / ratedGamesCount).toFixed(1)
              : 0,
          totalComments: tComments,
        });
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setActiveTab("analytics");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex me-4">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1">
          <div className="space-y-8 px-4 py-6 lg:p-0">
            {activeTab === "overview" ? (
              <>
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff6a4a]/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                        Trung tâm nhà sáng tạo
                      </span>

                      <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Bảng điều khiển
                      </h1>

                      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                        Quản lý game đã xuất bản, theo dõi lượt đánh giá, bình
                        luận và hiệu suất nội dung của bạn trên FabricIO.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/uploadgame")}
                        className="rounded-2xl bg-linear-to-r from-[#ff6a4a] to-[#ff5a3b] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,90,59,0.24)] transition hover:brightness-110"
                      >
                        Tải game lên
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  </div>
                </section>

                <StatsCards stats={stats} />

                <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">
                        Game của tôi
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        Danh sách các game bạn đã xuất bản và số liệu tương tác.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400">
                      {games.length} game đã xuất bản
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex min-h-[220px] items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-400" />
                        <p className="text-sm text-zinc-500">
                          Đang tải dữ liệu dashboard...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MyGamesList
                      games={games}
                      onSelectGame={handleSelectGame}
                    />
                  )}
                </section>
              </>
            ) : (
              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
                <GameAnalyticsTab
                  game={selectedGame}
                  onBack={() => setActiveTab("overview")}
                />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
