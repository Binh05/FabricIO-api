import axiosInstance from "../utils/axiosInstance";

export const adminService = {
  // Account Management (Using new AdminController)
  async getAllUsers() {
    const res = await axiosInstance.get("/Admin/users");
    return res.data;
  },

  async updateGameBan(userId, isGameBanned) {
    const res = await axiosInstance.patch(`/Admin/${userId}/gameban`, { isGameBanned });
    return res.data;
  },

  async updatePostBan(userId, isPostBanned) {
    const res = await axiosInstance.patch(`/Admin/${userId}/postban`, { isPostBanned });
    return res.data;
  },

  async updateAccountBan(userId, isBanned, banExpiresAt = null) {
    const res = await axiosInstance.patch(`/Admin/${userId}/ban`, { isBanned, banExpiresAt });
    return res.data;
  },

  // Game Management
  async getAllGames(search = "") {
    const params = {};
    if (search) params.search = search;
    const res = await axiosInstance.get("/Games", { params });
    return res.data; // { GameTotal, games }
  },

  async deleteGame(gameId) {
    const res = await axiosInstance.delete(`/Games/${gameId}`);
    return res.data;
  },

  // Post Management
  async getAllPosts(Page = 1, PageSize = 100) {
    const res = await axiosInstance.get("/Post", { params: { Page, PageSize } });
    return res.data; // { total, items }
  },

  async deletePost(postId) {
    const res = await axiosInstance.delete(`/Post/admin/${postId}`);
    return res.data;
  }
};
