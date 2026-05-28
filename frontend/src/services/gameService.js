/* eslint-disable no-unused-vars */
import axiosInstance from "../utils/axiosInstance";
import { assertAuthenticated } from "@/utils/authGuard";
import {
  gameLibrary,
  mockFeaturedDrop,
  mockFeaturedGames,
  trendingGames,
} from "../mocks/homeMock";

const USE_MOCK = true;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

export const getGameList = async () => {
  try {
    const res = await axiosInstance.get("/Games");
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch game list"));
  }
};

export const getFeaturedGames = async () => {
  try {
    const res = await axiosInstance.get("/Games/featuredGame");

    return res.data;
  } catch (error) {
    if (error) {
      console.log(
        "Featured games endpoint not found (404). Returning mock data.",
      );
      await wait(500);
      return mockFeaturedDrop;
    }
    throw new Error(getErrorMessage(error, "Failed to fetch featured games"));
  }
};



export const getTopRatedGames = async () => {
  try {
    const res = await axiosInstance.get("/Games/topRatingGames");
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch top-rated games"));
  }
};

export const userService = {
  async getMe() {
    try {
      const res = await axiosInstance.get("/Users/me");
      return res.data;
    } catch (error) {
      console.error("getMe error:", error);
      throw error;
    }
  },
};

export const gameLibraryService = {
  // async getGameLibrary({page = 1, pageSize = 100, search = ""} = {}) {
  //   try {
  //     const params = { page, pageSize };

  //     if (search?.trim()) {
  //       params.search = search;
  //     }

  //     const res = await axiosInstance.get("/Games", {
  //       params,
  //     });

  //     console.log("REQUEST PARAMS:", params);
  //     console.log("RESPONSE:", res.data);

  //     return res.data;
  //   } catch (error) {
  //     console.error("API ERROR:", error);

  //     if (error.response) {
  //       console.error("STATUS:", error.response.status);
  //       console.error("DATA:", error.response.data);
  //     }

  //     throw error;
  //   }
  // },
  async getGameLibrary({ page = 1, limit = 12, search = "" } = {}) {
  try {
    const params = { page, limit };

    if (search?.trim()) {
      params.search = search;
    }

    const res = await axiosInstance.get("/Games", { params });

    return res.data;
  } catch (error) {
    throw error;
  }
},
  async getGameById(id) {
    try {
      const res = await axiosInstance.get(`/Games/${id}`);
      return res.data.game;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không lấy được thông tin game"));
    }
  },

  async getGameFavorites() {
    try {
      assertAuthenticated();
      const res = await axiosInstance.get(`/Users/gamefavorite`);
      return res.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Không lấy được danh sách yêu thích"),
      );
    }
  },
  async addGameFavorite(gameId) {
    assertAuthenticated();

    return axiosInstance.post(`/users/${gameId}/favrotite`);
  },

  // async addGameFavorite(id) {
  //   try {
  //     assertAuthenticated();

  //     const res = await axiosInstance.post(`/users/${id}/favrotite`);
  //     return {
  //       success: res.status === 201,
  //     };
  //   } catch (error) {
  //     throw new Error(getErrorMessage(error, "Thêm vào yêu thích thất bại"));
  //   }
  // },
  async removeGameFavorite(gameId) {
    assertAuthenticated();

    return axiosInstance.delete(`/users/${gameId}/favorite`);
  },

  async getMyGames() {
    try {
      assertAuthenticated();
      const res = await axiosInstance.get("/Users/mygame");
      return res.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Không lấy được danh sách game của bạn"),
      );
    }
  },
};

export const uploadGame = async (payload) => {
  try {
    assertAuthenticated();

    const formData = new FormData();

    formData.append("Title", payload.Title ?? "");
    formData.append("Description", payload.Description ?? "");
    formData.append("Thumbnail", payload.Thumbnail);
    formData.append("GameType", payload.GameType);
    formData.append("GameFile", payload.GameFile);
    formData.append("Price", payload.Price ?? 0);

    console.log("Adding TagIds to FormData:");
    payload.TagIds?.forEach((tagId, index) => {
      console.log(`  TagIds[${index}]:`, tagId);
      formData.append("TagIds", tagId);
    });

    console.log("FormData entries:", formData.entries ? Array.from(formData.entries()) : "No entries() method");

    const res = await axiosInstance.post("/Games", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(getErrorMessage(error, "Tải game lên thất bại"));
  }
};

// DELETE GAME
export const deleteGame = async (gameId) => {
  try {
    assertAuthenticated();
    if (!gameId) throw new Error("gameId is required");
    await axiosInstance.delete(`/Games/${gameId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Xóa game thất bại"));
  }
};

// UPDATE GAME
export const updateGame = async (gameId, payload) => {
  try {
    assertAuthenticated();

    if (!gameId) throw new Error("gameId is required");

    const formData = new FormData();

    if (payload.Title !== undefined)
      formData.append("Title", payload.Title ?? "");
    if (payload.Description !== undefined)
      formData.append("Description", payload.Description ?? "");
    if (payload.Price !== undefined)
      formData.append("Price", payload.Price ?? 0);
    if (payload.GameType !== undefined)
      formData.append("GameType", payload.GameType);

    if (payload.Thumbnail instanceof File) {
      formData.append("Thumbnail", payload.Thumbnail);
    }

    if (payload.GameFile instanceof File) {
      formData.append("GameFile", payload.GameFile);
    }

    if (payload.TagIds) {
      payload.TagIds.forEach((tagId) => {
        formData.append("TagIds", tagId);
      });
    }

    const res = await axiosInstance.patch(`/Games/${gameId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Cập nhật game thất bại"));
  }
};

// GET COMMENTS
export const getGameComments = async (
  gameId,
  { page = 1, limit = 10 } = {},
) => {
  try {
    if (!gameId) throw new Error("gameId is required");

    const res = await axiosInstance.get(`/games/${gameId}/comment`, {
      params: { page, limit },
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không lấy được danh sách bình luận"),
    );
  }
};

// POST COMMENT
export const createGameComment = async (gameId, content) => {
  try {
    assertAuthenticated();

    if (!gameId) throw new Error("gameId is required");
    if (!content?.trim()) throw new Error("content is required");

    const res = await axiosInstance.post(`/games/${gameId}/comment`, {
      content: content.trim(),
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Tạo bình luận thất bại"));
  }
};
// GAME RATINGS
export const getGameRatings = async (gameId) => {
  try {
    if (!gameId) throw new Error("gameId is required");

    const res = await axiosInstance.get(`/games/${gameId}/ratings`);

    return res.data; // { total, average }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không lấy được rating"));
  }
};


export const rateGame = async (gameId, rating) => {
  try {
    assertAuthenticated();

    if (!gameId) throw new Error("gameId is required");
    if (rating < 1 || rating > 5) {
      throw new Error("rating must be between 1 and 5");
    }

    const res = await axiosInstance.put(`/games/${gameId}/ratings`, {
      stars: rating,
    });

    return res.data;
  } catch (error) {
    throw new Error("Đánh giá game thất bại");
  }
};


export const purchaseGame = async (gameId, amount) => {
  assertAuthenticated();

  const res = await axiosInstance.post(`/games/${gameId}/purchase`, {
    Amound: amount, // nếu backend đang dùng typo này thì giữ
  });
  return res.data;
};

export const getPurchaseHistory = async () => {
  assertAuthenticated();

  const res = await axiosInstance.get(`/Users/gamepaid`);
  return res.data;
};

export const getPlayUrl = async (gameId) => {
  const res = await axiosInstance.get(`/Games/${gameId}/play`);
  return res.data;
};

export const getDownloadUrl = async (gameId) => {
  const res = await axiosInstance.get(`/Games/${gameId}/download`);
  return res.data;
};

export const getUserGamePurchases = async () => {
  try {
    assertAuthenticated();

    const res = await axiosInstance.get(`/Users/gamepaid`);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không lấy được lịch sử mua game"));
  }
};
