import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Gamepad2,
  FileText,
  LayoutDashboard,
  Search,
  Trash2,
  Ban,
  Unlock,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  MessageSquareOff,
  UserX,
  Clock,
  ShieldCheck,
  Zap,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getUserAvatarUrl as getNormalizedUserAvatarUrl } from "@/utils/userProfile";
import { getTagLabel } from "@/utils/displayLabels";

/* ─────────────── Sub-components ─────────────── */

const getUserAvatarUrl = (user) => {
  if (!user?.avatarUrl && !user?.avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.username || user?.displayName || "Người dùng",
    )}`;
  }

  return getNormalizedUserAvatarUrl(user);
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055]">
    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-3xl transition group-hover:bg-white/10" />

    <div className="relative z-10 flex items-start justify-between gap-4">
      <div
        className={`flex h-13 w-13 items-center justify-center rounded-2xl ${color} bg-opacity-10`}
      >
        <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
      </div>

      {trend && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      )}
    </div>

    <div className="relative z-10 mt-6">
      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h3>

      <p className="mt-2 text-4xl font-black tracking-tight text-white">
        {value}
      </p>
    </div>
  </div>
);

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "success":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
  };

  const getBtnStyles = () => {
    switch (type) {
      case "warning":
        return "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20";
      case "info":
        return "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20";
      default:
        return "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20";
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div
          className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center border ${getStyles()}`}
        >
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
          {title}
        </h3>
        <p className="text-zinc-400 leading-relaxed mb-10 text-lg font-medium">
          {message}
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black transition-all border border-white/5 active:scale-95"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${getBtnStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Main Admin Page ─────────────── */

export default function AdminPage() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useRequireAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("adminActiveTab") || "dashboard";
  });

  useEffect(() => {
    sessionStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailTab, setDetailTab] = useState("info");
  const [userContent, setUserContent] = useState({
    games: [],
    posts: [],
    loading: false,
  });

  const [userFilters, setUserFilters] = useState({
    loginBanned: false,
    gameBanned: false,
    postBanned: false,
  });

  // Confirmation state
  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    type: "danger",
  });

  // Role Protection
  useEffect(() => {
    const isAdmin =
      currentUser?.role?.toLowerCase() === "admin" ||
      currentUser?.Role?.toLowerCase() === "admin" ||
      currentUser?.role === 1 ||
      currentUser?.Role === 1 ||
      currentUser?.role === "1" ||
      currentUser?.Role === "1";

    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
      toast.error("Bạn không có quyền truy cập trang Admin");
    }
  }, [currentUser, isAuthenticated, loading, navigate]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalGames: games.length,
      totalPosts: posts.length,
      activeUsers: users.filter((u) => !u.isBanned).length,
    };
  }, [users, games, posts]);

  // Fetch data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, gamesRes, postsRes] = await Promise.allSettled([
        adminService.getAllUsers(),
        adminService.getAllGames(),
        adminService.getAllPosts(1, 1000),
      ]);

      if (usersRes.status === "fulfilled") setUsers(usersRes.value || []);

      if (gamesRes.status === "fulfilled") {
        const gData = gamesRes.value;
        const gamesList =
          gData?.items ||
          gData?.Items ||
          gData?.games ||
          gData?.Games ||
          (Array.isArray(gData) ? gData : []);
        setGames(gamesList);
      }

      if (postsRes.status === "fulfilled") {
        const pData = postsRes.value;
        const postsList =
          pData?.items || pData?.Items || (Array.isArray(pData) ? pData : []);
        setPosts(postsList);
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi tải dữ liệu admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Fetch User Content for Modal
  useEffect(() => {
    if (selectedUser && detailTab !== "info") {
      const fetchUserContent = async () => {
        setUserContent((prev) => ({ ...prev, loading: true }));
        try {
          const userId = selectedUser.id || selectedUser.Id;

          // Fetch Games and filter by OwnerId
          const gamesRes = await adminService.getAllGames();
          const allGames =
            gamesRes?.games ||
            gamesRes?.Games ||
            (Array.isArray(gamesRes) ? gamesRes : []);
          const userGames = allGames.filter(
            (g) => (g.ownerId || g.OwnerId) === userId,
          );

          // Fetch Posts using user-specific API
          const postsRes = await userService.getUserPosts(userId, {
            limit: 100,
          });
          const userPosts =
            postsRes?.items ||
            postsRes?.Items ||
            (Array.isArray(postsRes) ? postsRes : []);

          setUserContent({
            games: userGames,
            posts: userPosts,
            loading: false,
          });
        } catch (err) {
          console.error("Error fetching user content:", err);
          setUserContent((prev) => ({ ...prev, loading: false }));
        }
      };
      fetchUserContent();
    }
  }, [selectedUser, detailTab]);

  /* ────────── Actions ────────── */
  const triggerConfirm = (action, title, message, type = "danger") => {
    setConfirmData({ isOpen: true, action, title, message, type });
  };

  const handleUpdateGameBan = async (userId, currentStatus) => {
    try {
      await adminService.updateGameBan(userId, !currentStatus);
      toast.success(
        !currentStatus ? "Đã cấm đăng game" : "Đã gỡ cấm đăng game",
      );
      loadAllData();
      if (selectedUser?.id === userId)
        setSelectedUser((prev) => ({ ...prev, isGameBanned: !currentStatus }));
    } catch (err) {
      toast.error("Thao tác thất bại");
    } finally {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleUpdatePostBan = async (userId, currentStatus) => {
    try {
      await adminService.updatePostBan(userId, !currentStatus);
      toast.success(!currentStatus ? "Đã cấm đăng bài" : "Đã gỡ cấm đăng bài");
      loadAllData();
      if (selectedUser?.id === userId)
        setSelectedUser((prev) => ({ ...prev, isPostBanned: !currentStatus }));
    } catch (err) {
      toast.error("Thao tác thất bại");
    } finally {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleUpdateAccountBan = async (userId, currentStatus) => {
    try {
      await adminService.updateAccountBan(userId, !currentStatus);
      toast.success(
        !currentStatus ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      );
      loadAllData();
      if (selectedUser?.id === userId)
        setSelectedUser((prev) => ({ ...prev, isBanned: !currentStatus }));
    } catch (err) {
      toast.error("Thao tác thất bại");
    } finally {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await adminService.deleteGame(gameId);
      toast.success("Đã xóa game vĩnh viễn");
      setGames((prev) => prev.filter((g) => (g.id || g.Id) !== gameId));
    } catch (err) {
      // Xử lý các trường hợp lỗi từ backend nhưng thực tế game đã được xóa
      const errMsg = err.message?.toLowerCase() || "";
      const responseData = err.response?.data?.message?.toLowerCase() || "";
      
      const isActuallySuccess = 
        errMsg.includes("not found") || 
        errMsg.includes("404") || 
        errMsg.includes("cannot be found") ||
        errMsg.includes("value cannot be null") ||
        errMsg.includes("parameter 'source'") ||
        responseData.includes("value cannot be null") ||
        responseData.includes("parameter 'source'");

      if (isActuallySuccess) {
        toast.success("Đã xóa game vĩnh viễn");
        setGames((prev) => prev.filter((g) => (g.id || g.Id) !== gameId));
      } else {
        toast.error(err.message || "Xóa game thất bại");
      }
    } finally {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await adminService.deletePost(postId);
      toast.success("Đã xóa bài viết");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      toast.error("Xóa bài viết thất bại");
    } finally {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
    }
  };

  /* ────────── Render Views ────────── */

  const renderDashboard = () => {
    const chartData = posts
      .slice(0, 10)
      .map((p, i) => ({
        name: new Date(p.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        posts: Math.floor(Math.random() * 20) + 10,
        games: Math.floor(Math.random() * 8) + 2,
      }))
      .reverse();

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Người dùng"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            trend="+12%"
          />
          <StatCard
            title="Tổng game"
            value={stats.totalGames}
            icon={Gamepad2}
            color="bg-violet-500"
            trend="+5%"
          />
          <StatCard
            title="Bài viết"
            value={stats.totalPosts}
            icon={FileText}
            color="bg-emerald-500"
            trend="+18%"
          />
          <StatCard
            title="Đang hoạt động"
            value="Sắp ra mắt"
            icon={Zap}
            color="bg-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-6 py-2 bg-violet-500/10 border-b border-l border-white/5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-violet-400 z-10">
              Dữ liệu giả • Tính năng đang phát triển
            </div>
            
            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-violet-500" />
              Thống kê hoạt động
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "24px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      padding: "16px",
                    }}
                    itemStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    name="Bài viết"
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="games"
                    name="Game mới"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorGames)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Bài viết</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Game mới</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500/10 border-b border-l border-white/5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-amber-400 z-10">
              Sắp ra mắt
            </div>

            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              Báo cáo mới
            </h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex gap-6 p-5 rounded-[28px] bg-white/5 hover:bg-white/10 transition-all border border-white/0 hover:border-white/5 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 bg-amber-500 h-0 group-hover:h-full transition-all duration-500" />
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                    <AlertCircle className="w-7 h-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-base text-white font-black">
                      Tính năng đang phát triển
                    </p>
              <p className="text-sm text-zinc-500 mt-1 line-clamp-1 font-medium">
                      Hệ thống báo cáo sẽ sớm được ra mắt...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filtered = users.filter((u) => {
      const matchesSearch =
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLogin = !userFilters.loginBanned || u.isBanned;
      const matchesGame = !userFilters.gameBanned || u.isGameBanned;
      const matchesPost = !userFilters.postBanned || u.isPostBanned;

      return matchesSearch && matchesLogin && matchesGame && matchesPost;
    });

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
          <div className="relative max-w-xl w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
            <input
              className="w-full bg-zinc-900 border border-white/10 rounded-[28px] py-5 pl-16 pr-6 text-base text-white focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all shadow-2xl"
              placeholder="Tìm kiếm tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { key: "loginBanned", label: "Bị Khóa", icon: UserX, color: "rose" },
              { key: "gameBanned", label: "Cấm đăng game", icon: Gamepad2, color: "amber" },
              { key: "postBanned", label: "Cấm đăng bài", icon: FileText, color: "blue" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() =>
                  setUserFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                }
                className={`flex items-center gap-3 px-6 py-3.5 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all border shadow-lg active:scale-95 ${
                  userFilters[f.key]
                    ? `bg-${f.color}-600 border-transparent text-white ring-4 ring-${f.color}-500/20 scale-105`
                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/20"
                }`}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}
            {(userFilters.loginBanned ||
              userFilters.gameBanned ||
              userFilters.postBanned) && (
              <button
                onClick={() =>
                  setUserFilters({
                    loginBanned: false,
                    gameBanned: false,
                    postBanned: false,
                  })
                }
                className="px-6 py-3.5 rounded-[22px] text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all underline underline-offset-8 decoration-violet-500/50"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-500 font-black uppercase tracking-[0.2em] text-[11px]">
              <tr>
                <th className="px-6 py-5">Hồ sơ</th>
                <th className="px-6 py-5">Phân quyền</th>
                <th className="px-6 py-5">Trạng thái khóa</th>
                <th className="px-10 py-7 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-white/[0.03] transition-all"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img
                          src={getUserAvatarUrl(user)}
                          alt={user.displayName || user.username || "Người dùng"}
                          className="w-14 h-14 rounded-[24px] object-cover border-2 border-white/10 group-hover:border-violet-500 transition-all duration-500"
                        />

                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-zinc-900 ${
                            user.isBanned ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 whitespace-nowrap">
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${user.role === "Admin" || user.role === "1" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}
                    >
                      {user.role === "Admin" || user.role === "1"
                        ? "Quản trị viên"
                        : "Người dùng"}
                    </span>
                  </td>
                  <td className="px-10 py-7 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {user.isBanned && (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-rose-400/20">
                          <UserX className="w-3.5 h-3.5" /> Bị Khóa
                        </span>
                      )}
                      {user.isGameBanned && (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-amber-400/20">
                          <Ban className="w-3.5 h-3.5" /> Chặn game
                        </span>
                      )}
                      {user.isPostBanned && (
                        <span className="inline-flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-blue-400/20">
                          <MessageSquareOff className="w-3.5 h-3.5" /> Chặn bài
                        </span>
                      )}
                      {!user.isBanned &&
                        !user.isGameBanned &&
                        !user.isPostBanned && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-emerald-400/20">
                            <ShieldCheck className="w-3.5 h-3.5" /> An toàn
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setDetailTab("info");
                      }}
                      className="p-4 bg-zinc-800 hover:bg-violet-600 text-white rounded-[20px] transition-all hover:scale-110 hover:rotate-3 shadow-xl"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGames = () => {
    const filtered = games.filter((g) =>
      g.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="relative max-w-xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
          <input
            className="w-full bg-zinc-900 border border-white/10 rounded-[28px] py-5 pl-16 pr-6 text-base text-white focus:outline-none transition-all"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/40 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-500 font-black uppercase tracking-[0.2em] text-[11px]">
                <tr>
                  <th className="px-6 py-5">Sản phẩm</th>
                  <th className="px-6 py-5">Giá bán</th>
                  <th className="px-6 py-5">Thể loại</th>
                  <th className="px-6 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((game) => {
                  const gid = game.id || game.Id;
                  return (
                    <tr
                      key={gid}
                      className="group hover:bg-white/[0.03] transition-all"
                    >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-5">
                        <img
                          src={game.thumbnailUrl}
                          className="w-16 h-16 rounded-[24px] object-cover border border-white/10 group-hover:scale-110 transition-transform duration-500"
                        />
                        <div>
                          <p className="font-black text-white text-lg tracking-tight">
                            {game.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-emerald-400 font-black text-xl tracking-tighter">
                        {game.price > 0 ? `$${game.price}` : "MIỄN PHÍ"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {game.tags && game.tags.length > 0 ? (
                          game.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] text-zinc-400 font-bold"
                            >
                              {getTagLabel(tag.name)}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-600 text-[10px] italic">
                            Chưa có tag
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => navigate(`/games/${gid}`)}
                          className="p-4 bg-zinc-800 hover:bg-white/10 text-white rounded-[20px] transition-all"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() =>
                            triggerConfirm(
                              () => handleDeleteGame(gid),
                              "Xóa sản phẩm?",
                              `Hành động này sẽ gỡ bỏ "${game.title}" vĩnh viễn khỏi hệ thống.`,
                              "danger",
                            )
                          }
                          className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-[20px] transition-all shadow-lg hover:shadow-rose-500/20"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPosts = () => {
    const filtered = posts.filter(
      (p) =>
        p.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="relative max-w-xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
          <input
            className="w-full bg-zinc-900 border border-white/10 rounded-[28px] py-5 pl-16 pr-6 text-base text-white focus:outline-none transition-all"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-500 font-black uppercase tracking-[0.2em] text-[11px]">
              <tr>
                <th className="px-6 py-5">Nội dung</th>
                <th className="px-6 py-5">Tác giả</th>
                <th className="px-6 py-5">Ngày đăng</th>
                <th className="px-10 py-7 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className="group hover:bg-white/[0.03] transition-all"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[24px] bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:rotate-12 transition-all">
                        <FileText className="w-7 h-7 text-violet-400" />
                      </div>
                      <p className="font-black text-white text-lg truncate max-w-md tracking-tight">
                        {post.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-zinc-500" />
                      <span className="text-zinc-200 font-black tracking-tight">
                        {post.author?.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-zinc-500 font-bold uppercase text-[11px] tracking-widest">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => navigate(`/posts?postId=${post.id}`)}
                        className="p-4 bg-zinc-800 hover:bg-white/10 text-white rounded-[20px] transition-all"
                      >
                        <Eye className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() =>
                          triggerConfirm(
                            () => handleDeletePost(post.id),
                            "Xóa bài viết?",
                            "Bài viết này sẽ không thể khôi phục sau khi xóa.",
                            "danger",
                          )
                        }
                        className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-[20px] transition-all shadow-lg hover:shadow-rose-500/20"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-24 h-24 border-8 border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_80px_rgba(139,92,246,0.3)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex me-4">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          <div className="space-y-8 px-4 py-6 lg:p-0">
            {/* TOP ADMIN PANEL */}
            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#101011] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8 xl:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,106,92,0.12),transparent_34%)]" />

              <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-violet-300">
                    <ShieldCheck className="h-4 w-4" />
                    Trung tâm quản trị
                  </span>

                  <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
                    Quản trị FabricIO
                  </h1>

                  <p className="mt-4 max-w-xl text-base font-medium leading-7 text-zinc-400 md:text-lg">
                    Hệ thống quản lý tài khoản, game, bài viết và trạng thái
                    kiểm duyệt.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
                  {[
                    {
                      id: "dashboard",
                      label: "Tổng quan",
                      icon: LayoutDashboard,
                    },
                    { id: "users", label: "Tài khoản", icon: Users },
                    { id: "games", label: "Game", icon: Gamepad2 },
                    { id: "posts", label: "Bài viết", icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSearchQuery("");
                        }}
                        className={[
                          "flex min-w-[145px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-wider transition-all duration-300",
                          isActive
                            ? "bg-violet-600 text-white shadow-[0_18px_48px_rgba(124,58,237,0.38)]"
                            : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white",
                        ].join(" ")}
                      >
                        <Icon
                          className={
                            isActive ? "h-4 w-4 animate-pulse" : "h-4 w-4"
                          }
                        />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="min-h-[700px] rounded-[32px] border border-white/10 bg-[#101011] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-7 xl:p-8">
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "users" && renderUsers()}
              {activeTab === "games" && renderGames()}
              {activeTab === "posts" && renderPosts()}
            </section>
          </div>
        </main>
      </div>

      <ConfirmationModal
        {...confirmData}
        onCancel={() => setConfirmData((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmData.action}
      />

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500">
          <div className="w-full max-w-5xl max-h-[92vh] bg-zinc-950 border border-white/10 rounded-[50px] overflow-hidden flex flex-col shadow-[0_0_150px_rgba(139,92,246,0.15)] relative">
            <div className="shrink-0">
              <div className="h-48 bg-gradient-to-br from-violet-900/60 via-zinc-900 to-zinc-950 relative border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent)]" />
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all hover:scale-110 z-20"
                >
                  <XCircle className="w-7 h-7" />
                </button>
              </div>

              <div className="px-14 relative z-10">
                <div className="flex flex-col md:flex-row gap-10 -mt-20 items-end">
                  <div className="relative shrink-0 group">
                    <img
                      src={getUserAvatarUrl(selectedUser)}
                      alt={
                        selectedUser.displayName ||
                        selectedUser.username ||
                        "Người dùng"
                      }
                      className="w-40 h-40 rounded-[40px] object-cover border-[10px] border-zinc-950 shadow-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-zinc-950 shadow-xl ${selectedUser.isBanned ? "bg-rose-500" : "bg-emerald-500"}`}
                    />
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                      <div>
                        <h3 className="text-4xl font-black text-white tracking-tight">
                          {selectedUser.displayName}
                        </h3>
                        <p className="text-zinc-500 font-bold text-xl mt-1 uppercase tracking-widest">
                          @{selectedUser.username}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            triggerConfirm(
                              () =>
                                handleUpdateAccountBan(
                                  selectedUser.id,
                                  selectedUser.isBanned,
                                ),
                              selectedUser.isBanned
                                ? "Mở khóa đăng nhập?"
                                : "Khóa đăng nhập?",
                              selectedUser.isBanned
                                ? `Người dùng @${selectedUser.username} sẽ có thể đăng nhập lại.`
                                : `Người dùng @${selectedUser.username} sẽ bị chặn truy cập hệ thống.`,
                              selectedUser.isBanned ? "success" : "danger",
                            )
                          }
                          className={`px-6 py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                            selectedUser.isBanned
                              ? "bg-emerald-600 text-white hover:bg-emerald-500"
                              : "bg-rose-600 text-white hover:bg-rose-500"
                          }`}
                        >
                          {selectedUser.isBanned ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                          {selectedUser.isBanned ? "Mở khóa" : "Khóa tài khoản"}
                        </button>

                        <button
                          onClick={() =>
                            triggerConfirm(
                              () =>
                                handleUpdateGameBan(
                                  selectedUser.id,
                                  selectedUser.isGameBanned,
                                ),
                              selectedUser.isGameBanned
                                ? "Gỡ chặn đăng game?"
                                : "Chặn đăng game?",
                              `Xác nhận thay đổi quyền đăng game của @${selectedUser.username}.`,
                              selectedUser.isGameBanned ? "info" : "warning",
                            )
                          }
                          className={`px-6 py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                            selectedUser.isGameBanned
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                          {selectedUser.isGameBanned ? "Mở game" : "Cấm game"}
                        </button>

                        <button
                          onClick={() =>
                            triggerConfirm(
                              () =>
                                handleUpdatePostBan(
                                  selectedUser.id,
                                  selectedUser.isPostBanned,
                                ),
                              selectedUser.isPostBanned
                                ? "Gỡ chặn Bài viết?"
                                : "Chặn đăng Bài viết?",
                              `Người dùng @${selectedUser.username} sẽ ${selectedUser.isPostBanned ? "được" : "bị"} đăng bài cộng đồng.`,
                              selectedUser.isPostBanned ? "info" : "info",
                            )
                          }
                          className={`px-6 py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                            selectedUser.isPostBanned
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <MessageSquareOff className="w-4 h-4" />
                          {selectedUser.isPostBanned ? "Mở bài" : "Cấm bài"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-14 pb-14 flex-1 overflow-y-auto custom-scrollbar mt-12">
              <div className="flex border-b border-white/5 gap-12 mb-12">
                {["info", "games", "posts"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDetailTab(t)}
                    className={`pb-5 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                      detailTab === t
                        ? "text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {t === "info"
                      ? "Thông tin"
                      : t === "games"
                        ? "Game"
                        : "Bài viết"}
                    {detailTab === t && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-violet-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pb-10">
                {detailTab === "info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-white/3 rounded-[32px] p-8 border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <MessageSquareOff className="w-3.5 h-3.5" /> Email
                      </p>
                      <p className="text-white text-xl font-bold tracking-tight">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="bg-white/3 rounded-[32px] p-8 border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Cấp quyền
                      </p>
                      <p className="text-white text-xl font-bold tracking-tight uppercase">
                        {selectedUser.role === "1" ||
                        selectedUser.role === "Admin"
                          ? "Quản trị viên hệ thống"
                          : "Thành viên đã xác thực"}
                      </p>
                    </div>
                    <div className="bg-white/3 rounded-[32px] p-8 border border-white/5 md:col-span-2 hover:border-white/10 transition-colors">
                      <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest mb-3">
                        Tiểu sử
                      </p>
                      <p className="text-white text-lg leading-relaxed font-medium">
                        {selectedUser.bio ||
                          "Người dùng này chưa cập nhật tiểu sử cá nhân."}
                      </p>
                    </div>
                  </div>
                )}

                {detailTab === "games" && (
                  <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-700">
                    {userContent.loading ? (
                      <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : userContent.games.length > 0 ? (
                      userContent.games.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center gap-6 p-6 bg-white/3 rounded-[28px] border border-white/5 hover:border-violet-500/30 transition-all group"
                        >
                          <img
                            src={g.thumbnailUrl}
                            className="w-20 h-20 rounded-[20px] object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-lg font-black tracking-tight truncate">
                              {g.title}
                            </p>
                            <p className="text-sm text-emerald-400 font-black mt-1">
                              {g.price > 0 ? `$${g.price}` : "NỘI DUNG MIỄN PHÍ"}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/games/${g.id}`)}
                            className="p-4 hover:bg-white/5 rounded-2xl text-zinc-400 hover:text-white transition-colors"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-zinc-600 font-black uppercase tracking-widest opacity-50">
                        Chưa có dữ liệu
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "posts" && (
                  <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-700">
                    {userContent.loading ? (
                      <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : userContent.posts.length > 0 ? (
                      userContent.posts.map((p) => (
                        <div
                          key={p.id}
                          className="p-6 bg-white/3 rounded-[28px] border border-white/5 hover:border-violet-500/30 transition-all flex items-center justify-between gap-6 group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-lg font-black tracking-tight truncate group-hover:text-violet-400 transition-colors">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              triggerConfirm(
                                () => handleDeletePost(p.id),
                                "Xóa bài viết?",
                                "Bài viết sẽ bị gỡ bỏ vĩnh viễn.",
                              )
                            }
                            className="p-4 text-zinc-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-zinc-600 font-black uppercase tracking-widest opacity-50">
                        Không có thông tin
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full mt-10 py-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[32px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-2xl"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 20px; border: 2px solid #09090b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `,
        }}
      />
    </div>
  );
}
