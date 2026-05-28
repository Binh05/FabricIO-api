import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { registerUser } from "../services/authService";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    const { username, displayName, email, password, confirmPassword } =
      formData;

    if (!username || !displayName || !email || !password || !confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không đúng định dạng";
    }

    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (password !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      };

      const result = await registerUser(payload);

      if (result?.token) {
        localStorage.setItem("token", result.token);
      }

      if (result?.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      setFormData({
        username: "",
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");

      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        error?.message ||
        "Đăng ký thất bại";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,90,59,0.18),transparent_29%),radial-gradient(circle_at_top_right,rgba(255,90,59,0.12),transparent_22%),linear-gradient(180deg,#050505_0%,#0a0a0c_45%,#040404_100%)] px-4 py-4 md:px-6 flex items-center justify-center text-white">
      <Link
        to="/"
        className="group absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-orange-400/30 hover:bg-orange-400/10 hover:text-white md:left-6 md:top-5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-orange-400/20">
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
        </span>
        <span>
          Về <span className="text-[#ff7a59]">FabricIO</span>
        </span>
      </Link>

      <div className="w-full max-w-6xl overflow-hidden rounded-[22px] border border-white/10 bg-[#141418]/70 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.45)] grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:flex flex-col justify-center border-r border-white/10 px-8 py-9 xl:px-10 bg-[radial-gradient(circle_at_top_left,rgba(255,95,65,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
          <span className="inline-block w-fit rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
            Tham gia cộng đồng FabricIO
          </span>

          <h1 className="mt-4 text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-zinc-100">
            Tạo tài khoản người chơi và bước vào cộng đồng.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
            Khám phá game indie, theo dõi nhà sáng tạo, tương tác với bài viết
            cộng đồng và đăng nội dung game của riêng bạn.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Khám phá game mới",
              "Theo dõi nhà sáng tạo",
              "Tham gia thảo luận cộng đồng",
              "Đăng bài viết của bạn",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-center bg-linear-to-b from-white/2 to-white/1">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl font-extrabold text-white">Đăng ký</h2>

            <p className="mt-1.5 text-sm leading-5 text-zinc-400">
              Bắt đầu xây dựng hồ sơ và khám phá những game mới nhất.
            </p>

            {error && (
              <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-300">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange("username")}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-300">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    placeholder="Tên hiển thị"
                    value={formData.displayName}
                    onChange={handleChange("displayName")}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="block text-xs font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-300">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange("password")}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-300">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="Xác nhận"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-linear-to-r from-[#ff6a4a] to-[#ff5a3b] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,90,59,0.22)] transition hover:from-[#ff7a59] hover:to-[#ff4d4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <div className="h-px flex-1 bg-white/10"></div>
              <span>hoặc tiếp tục</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <button className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/5">
              Tiếp tục với Google
            </button>

            <p className="mt-4 text-center text-sm text-zinc-400">
              Đã có tài khoản?{" "}
              <Link
                to="/signin"
                className="font-bold text-[#ff7a59] cursor-pointer"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
