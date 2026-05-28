/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Phone } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import { toast } from "sonner";

const FormField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === "rememberMe" ? e.target.checked : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { username, password } = formData;

    if (!username || !password) {
      return "Vui lòng nhập tên đăng nhập và mật khẩu";
    }

    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return "";
  };
  const onSubmit = async (e) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    toast.error(validationError);
    return;
  }

  try {
    await handleLogin(formData);

    toast.success("Đăng nhập thành công!");

    setTimeout(() => {
      navigate("/");
    }, 800);
  } catch (err) {
    const data = err?.response?.data;

    const message =
      data?.message ||
      data?.title ||
      data?.error ||
      (typeof data === "string" ? data : "") ||
      err?.message ||
      "Đăng nhập thất bại";

    if (message.toLowerCase().includes("khóa")) {
      setIsBanned(true);
    }

    toast.error(message);
  }
};

  const onClick = () => {
    navigate("/");
  };

  if (isBanned) {
    return (
      <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-rose-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15),transparent_70%)]" />
        
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 backdrop-blur-md transition hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="max-w-xl w-full bg-zinc-900/50 border border-white/10 rounded-[40px] p-12 text-center backdrop-blur-2xl shadow-2xl relative overflow-hidden group animate-in fade-in zoom-in duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.4)]" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-rose-600/10 border border-rose-600/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-500">
              <ShieldAlert className="w-12 h-12 text-rose-500" />
            </div>
            
            <h1 className="text-3xl font-black mb-4 tracking-tight text-white uppercase">Truy cập bị từ chối</h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10">
              Tài khoản của bạn đã bị <span className="text-rose-400 font-bold">khóa vĩnh viễn</span> do vi phạm chính sách cộng đồng.
            </p>
            
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-center gap-6 group/btn hover:bg-white/10 transition-all cursor-default">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Phone className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1">Liên hệ Admin giải quyết</p>
                <p className="text-3xl font-black text-white tracking-tighter">0123 456 789</p>
              </div>
            </div>

            <button
              onClick={() => setIsBanned(false)}
              className="mt-10 text-sm font-bold text-zinc-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-white/30"
            >
              Thử lại bằng tài khoản khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,90,59,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,90,59,0.12),transparent_22%),linear-gradient(180deg,#050505_0%,#0a0a0c_45%,#040404_100%)] px-4 py-6 md:px-6 flex items-center justify-center text-white">
      <Link
        to="/"
        className="group absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-orange-400/30 hover:bg-orange-400/10 hover:text-white md:left-6 md:top-6"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-orange-400/20">
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
        </span>
        <span>
          Về <span className="text-[#ff7a59]">FabricIO</span>
        </span>
      </Link>
      <div className="w-full max-w-7xl overflow-hidden rounded-[22px] md:rounded-[28px] border border-white/10 bg-[#141418]/70 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.45)] grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 lg:order-1 px-4 py-5 sm:px-6 md:px-8 lg:px-9 flex items-center justify-center bg-linear-to-b from-white/2 to-white/1">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-5 sm:p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Chào mừng trở lại
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Đăng nhập để tiếp tục hành trình, theo dõi game yêu thích và
              tham gia các cuộc thảo luận mới nhất.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <FormField
                label="Tên đăng nhập"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange("username")}
                disabled={loading}
              />

              <div className="flex flex-col gap-2 text-left">
                <label className="block text-sm font-medium text-zinc-300">
                  Mật khẩu
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange("password")}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 transition hover:text-zinc-200"
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange("rememberMe")}
                    className="h-4 w-4 rounded border-white/10 bg-transparent accent-orange-500"
                  />
                  Ghi nhớ đăng nhập
                </label>

                <span className="cursor-pointer font-medium text-[#ff7a59] hover:text-[#ff8b6d]">
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-linear-to-r from-[#ff6a4a] to-[#ff5a3b] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,90,59,0.22)] transition hover:from-[#ff7a59] hover:to-[#ff4d4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <div className="h-px flex-1 bg-white/10"></div>
              <span>hoặc tiếp tục</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/5"
            >
              Tiếp tục với Google
            </button>

            <p className="mt-5 text-center text-sm text-zinc-400">
              Chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="cursor-pointer font-bold text-[#ff7a59]"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10 px-5 py-8 sm:px-8 md:px-10 lg:px-12 lg:py-14 bg-[radial-gradient(circle_at_top_right,rgba(255,95,65,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] flex flex-col justify-center">
          <span
            onClick={() => navigate("/")}
            className="inline-block rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-300 w-fit cursor-pointer transition hover:bg-orange-400/20"
          >
            Về FabricIO
          </span>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-100">
            Quay lại thế giới game và cộng đồng của bạn.
          </h1>

          <p className="mt-5 max-w-xl text-sm sm:text-base leading-7 text-zinc-400">
            Truy cập hồ sơ, tiếp tục thảo luận, khám phá bản phát hành mới và
            kết nối với nhà sáng tạo cùng người chơi trên nền tảng.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Theo dõi game yêu thích",
              "Lưu game vào danh sách",
              "Tham gia trò chuyện cùng người chơi",
              "Theo dõi nhà sáng tạo và cập nhật",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/3 px-4 py-4 text-sm text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-orange-400/10 bg-orange-400/5 p-5">
            <p className="text-sm leading-7 text-zinc-300">
              “Khám phá thế giới mới, chia sẻ suy nghĩ và lưu giữ dấu ấn chơi
              game của bạn trên một nền tảng gọn gàng.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
