/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  getMyProfile,
  logoutUser,
} from "../services/authService";
import { AUTH_SESSION_CLEARED_EVENT } from "@/utils/authGuard";
import { normalizeUser } from "@/utils/userProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? normalizeUser(JSON.parse(rawUser)) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveUser = (userData) => {
    const normalizedUser = normalizeUser(userData);

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    return normalizedUser;
  };

  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      setError("");

      return await registerUser(formData);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const res = await loginUser(formData);

      let loginUserData = res?.user
        ? normalizeUser(res.user)
        : res?.data?.user
          ? normalizeUser(res.data.user)
          : null;

      if (!loginUserData) {
        const profileRes = await getMyProfile();
        loginUserData = normalizeUser(profileRes?.user || profileRes?.data || profileRes);
      }

      if (loginUserData?.isBanned || loginUserData?.IsBanned) {
        await logoutUser();
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error(
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.",
        );
      }

      saveUser(loginUserData);

      return res;
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyProfile();
      const profileUser = normalizeUser(res?.user || res?.data || res);

      saveUser(profileUser);

      return profileUser;
    } catch (err) {
      setError(err.message || "Không lấy được profile");
      setUser(null);
      localStorage.removeItem("user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthUser = (newUserData = {}) => {
    setUser((prev) => {
      const cleanedNewUserData = Object.fromEntries(
        Object.entries(newUserData).filter(([, value]) => value !== undefined),
      );

      const updatedUser = normalizeUser(cleanedNewUserData, prev);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setError("");

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  useEffect(() => {
    const syncLocalUser = () => {
      try {
        const localUser = localStorage.getItem("user");
        if (!localUser) {
          setUser(null);
          return;
        }

        const parsedUser = normalizeUser(JSON.parse(localUser));
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setUser(null);
        localStorage.removeItem("user");
      }
    };

    const clearSession = () => {
      setUser(null);
      setError("");
    };

    syncLocalUser();

    window.addEventListener("storage", syncLocalUser);
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, clearSession);

    return () => {
      window.removeEventListener("storage", syncLocalUser);
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, clearSession);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setUser: saveUser,
        handleRegister,
        handleLogin,
        updateAuthUser,
        fetchMyProfile,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
