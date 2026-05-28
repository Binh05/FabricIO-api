import axiosInstance from "../utils/axiosInstance";
import { assertAuthenticated } from "@/utils/authGuard";
import { normalizeUser } from "@/utils/userProfile";

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const uploadAvatarRequest = async (file) => {
  assertAuthenticated();

  const formData = new FormData();
  formData.append("imgFile", file);

  const res = await axiosInstance.patch("/Users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

const getCurrentUserRequest = async () => {
  assertAuthenticated();

  const res = await axiosInstance.get("/Users/me");
  return normalizeUser(res.data);
};

export const userService = {
  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      return getCurrentUserRequest();
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Không lấy được thông tin người dùng"),
      );
    }
  },

  // Lấy thông tin user theo id
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error("Thiếu userId để lấy thông tin người dùng");
      }

      const res = await axiosInstance.get(`/Users/${userId}`);
      return normalizeUser(res.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Không lấy được thông tin người dùng"),
      );
    }
  },

  // Cập nhật thông tin profile. Backend hiện hỗ trợ bio và avatar.
  async updateProfile(data = {}) {
    try {
      assertAuthenticated();

      const hasBio =
        Object.prototype.hasOwnProperty.call(data, "bio") ||
        Object.prototype.hasOwnProperty.call(data, "description");

      let updatedUser = null;

      if (hasBio) {
        const res = await axiosInstance.patch("/Users/profile", {
          bio: data.bio ?? data.description ?? "",
        });

        updatedUser = normalizeUser(res.data);
      }

      if (data.avatarFile) {
        await uploadAvatarRequest(data.avatarFile);
        updatedUser = await getCurrentUserRequest();
      }

      return updatedUser || (await getCurrentUserRequest());
    } catch (error) {
      throw new Error(getErrorMessage(error, "Cập nhật profile thất bại"));
    }
  },

  // Upload avatar
  async uploadAvatar(file) {
    try {
      assertAuthenticated();

      if (!file) {
        throw new Error("Thiếu file avatar");
      }

      return uploadAvatarRequest(file);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Tải avatar thất bại"));
    }
  },

  // Lấy danh sách bài viết của user. Nếu không có userId thì lấy user hiện tại.
  async getUserPosts(userId, { page = 1, limit = 10 } = {}) {
    try {
      if (!userId) {
        assertAuthenticated();
      }

      const endpoint = userId ? `/Post/user/${userId}` : "/Post/user/me";

      const res = await axiosInstance.get(endpoint, {
        params: {
          Page: page,
          PageSize: limit,
        },
      });

      return res.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Không lấy được danh sách bài viết"),
      );
    }
  },
  async getMyGames() {
    try {
      assertAuthenticated();

      const res = await axiosInstance.get("/Users/mygame");
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không lấy được danh sách game"));
    }
  },
};

// Thay đổi password
export const changePassword = async (
  payloadOrOldPassword,
  nextPassword,
  nextConfirmPassword,
) => {
  try {
    assertAuthenticated();

    const payload =
      typeof payloadOrOldPassword === "object"
        ? payloadOrOldPassword
        : {
            oldPassword: payloadOrOldPassword,
            newPassword: nextPassword,
            confirmPassword: nextConfirmPassword,
          };

    const res = await axiosInstance.patch("/Users/password", payload);
    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể đổi mật khẩu. Vui lòng thử lại."),
    );
  }
};
