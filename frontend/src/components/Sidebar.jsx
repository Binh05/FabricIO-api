import { Link, NavLink } from "react-router-dom";
import { X } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import { getTags } from "@/services/tagService";
import { useEffect, useState } from "react";
import usePosts from "@/hooks/usePost";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getUserAvatarUrl } from "@/utils/userProfile";
import { getTagLabel } from "@/utils/displayLabels";

const mainNavItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Game", path: "/games" },
  { label: "Bài viết", path: "/posts" },
  { label: "Đăng game", path: "/uploadgame", requiresAuth: true },
];

const discoverItems = [
  { label: "Bảng điều khiển", path: "/dashboard", requiresAuth: true },
  { label: "Tải game lên", path: "/uploadgame", requiresAuth: true },
];

const navClass = ({ isActive }) =>
  [
    "flex w-full items-center rounded-full px-4 py-3 text-left text-[15px] transition",
    isActive
      ? "bg-white/6 text-zinc-100"
      : "text-zinc-400 hover:bg-white/4 hover:text-white",
  ].join(" ");

const SidebarContent = ({ onClose }) => {
  const { user, handleLogout } = useAuth();
  const { requireAuth } = useRequireAuth();

  const [tags, setTags] = useState([]);

  const { posts } = usePosts({ page: 1, limit: 5 });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getTags();

        setTags(res?.data || res || []);
      } catch (error) {
        console.error("Get tags failed:", error);
        setTags([]);
      }
    };

    fetchTags();
  }, []);

  const authNavItems = user
    ? [
        { label: "Hồ sơ", path: "/profile" },
        ...((user.role?.toLowerCase() === "admin" || user.Role?.toLowerCase() === "admin" || user.role === 1 || user.Role === 1 || user.role === "1" || user.Role === "1") ? [{ label: "Admin", path: "/admin" }] : []),
      ]
    : [{ label: "Đăng nhập", path: "/signin" }];

  const handleNavClick = (event, item) => {
    if (item.requiresAuth && !requireAuth()) {
      event.preventDefault();
      return;
    }

    onClose?.();
  };

  const handleSignOut = () => {
    handleLogout();
    onClose?.();
  };

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 py-7 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Menu
        </p>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {user && (
        <section className="mb-8 lg:hidden">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/3 px-4 py-4 transition hover:bg-white/5"
          >
            <img
              src={getUserAvatarUrl(user)}
              alt={user?.username || "user"}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-white">
                {user?.displayName || user?.username || "Người dùng"}
              </p>
              <p className="truncate text-sm text-zinc-400">
                @{user?.username || "tai-khoan"}
              </p>
            </div>
          </Link>
        </section>
      )}

      <section className="lg:hidden">
        <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Điều hướng
        </p>

        <nav className="space-y-2.5">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={(event) => handleNavClick(event, item)}
              className={navClass}
            >
              {item.label}
            </NavLink>
          ))}

          {!user ? (
            <NavLink to="/signin" onClick={onClose} className={navClass}>
              Đăng nhập
            </NavLink>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center rounded-full px-4 py-3 text-left text-[15px] text-zinc-400 transition hover:bg-white/4 hover:text-white"
            >
              Đăng xuất
            </button>
          )}
        </nav>
      </section>

      <section className="mt-10 lg:mt-0">
        <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Khám phá
        </p>

        <nav className="space-y-2.5">
          {discoverItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(event) => handleNavClick(event, item)}
              className={navClass}
            >
              {item.label}
            </NavLink>
          ))}

          {authNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={navClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </section>

      <section className="mt-10">
        <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Tag phổ biến
        </p>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/games?tag=${encodeURIComponent(tag.name)}`}
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-[14px] text-zinc-300 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              {getTagLabel(tag.name)}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Nhịp cộng đồng
        </p>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/3 px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="text-[15px] text-zinc-400">Người chơi online</p>
            <p className="mt-5 text-[20px] font-bold text-white">125K</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/3 px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="text-[15px] text-zinc-400">Tổng bài viết</p>
            <p className="mt-5 text-[20px] font-bold text-white">{posts.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <aside className="ms-5 me-5 hidden w-[285px] shrink-0 lg:block">
        <div className="sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      <div
        className={[
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      >
        <aside
          className={[
            "h-full w-[85vw] max-w-[340px] overflow-y-auto bg-[#050505] p-4 transition-transform",
            isOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
