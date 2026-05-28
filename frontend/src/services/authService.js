import axiosInstance from "../utils/axiosInstance";
import { normalizeUser } from "@/utils/userProfile";

export const registerUser = async (data) => {
  try {
    const res = await axiosInstance.post("/Auth/register", data);
    return res.data;
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Đăng ký thất bại";

    throw new Error(message);
  }
};

export const loginUser = async (data) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);

    const responseData = res.data;

    return responseData;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Đăng nhập thất bại");
  }
};

export const getMyProfile = async () => {
  try {
    const res = await axiosInstance.get("/Users/me");

    if (res.data?.user) {
      localStorage.setItem("user", JSON.stringify(normalizeUser(res.data.user)));
    }

    return normalizeUser(res.data);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Không lấy được thông tin cá nhân",
    );
  }
};

export const logoutUser = async () => {
  try {
    const res = await axiosInstance.post("/Auth/signout");
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Không thể đăng xuất");
  }
};

export const getUserById = async (userId) => {
  try {
    const res = await axiosInstance.get(`/Users/${userId}`);
    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Không lấy được thông tin cá nhân",
    );
  }
};
