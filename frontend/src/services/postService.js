import axiosInstance from "../utils/axiosInstance";
import { mockPosts } from "../mocks/postMock";
import { assertAuthenticated } from "@/utils/authGuard";

const USE_MOCK = true;
const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

// Lấy danh sách bài viết với phân trang
export const getPosts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await axiosInstance.get("/Post", {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không lấy được danh sách bài viết"),
    );
  }
};

export const getTrendingPosts = async ({ page = 1, Pagesize = 3 } = {}) => {
  try {
    const res = await axiosInstance.get("/Post/trending", {
      params: { page, Pagesize },
    });
    return res.data;    
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không lấy được danh sách bài viết"),
    );
  }
}

export const getLatestPosts = async () => {
  try {
    if (USE_MOCK) {
      await wait();

      return {
        data: mockPosts,
      };
    }

    const res = await axiosInstance.get("/Post/latest");
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không lấy được bài viết mới nhất"));
  }
};

// Lấy thông tin chi tiết của một bài viết
export const getPostById = async (postId) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để lấy thông tin bài viết");
    }

    const res = await axiosInstance.get(`/Post/${postId}`);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không lấy được bài viết"));
  }
};

// Lấy danh sách bài viết của người dùng hiện tại
export const getMyPosts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    assertAuthenticated();

    const res = await axiosInstance.get("/Post/user/me", {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không lấy được danh sách bài viết"),
    );
  }
};

// Tạo bài viết mới
export const createPost = async (payload) => {
  try {
    assertAuthenticated();

    if (!payload) {
      throw new Error("Dữ liệu bài viết không hợp lệ");
    }

    const formData = new FormData();

    if (payload?.title) {
      formData.append("Title", payload.title);
    }

    if (payload?.content) {
      formData.append("Content", payload.content);
    }

    if (payload?.images?.length) {
      payload.images.forEach((file) => {
        console.log("Appending file to formData:", file.name);
        formData.append("MediaFiles", file);
      });
    }

    const res = await axiosInstance.post("/Post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Tạo bài viết thất bại"));
  }
};

// Cập nhật bài viết
export const updatePost = async (postId, payload) => {
  try {
    assertAuthenticated();

    if (!postId) {
      throw new Error("Thiếu postId để cập nhật bài viết");
    }

    if (!payload) {
      throw new Error("Dữ liệu bài viết không hợp lệ");
    }

    console.log("Updating post with payload:", payload);
    const res = await axiosInstance.put(`/Post/${postId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Cập nhật bài viết thất bại"));
  }
};

// Xóa bài viết
export const deletePost = async (postId) => {
  try {
    assertAuthenticated();

    if (!postId) {
      throw new Error("Thiếu postId để xóa bài viết");
    }

    const res = await axiosInstance.delete(`/Post/${postId}`);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Xóa bài viết thất bại"));
  }
};

// Lấy bình luận của một bài viết với phân trang
export const getPostComments = async ({ postId, Page = 1, PageSize = 5 }) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để lấy bình luận");
    }

    const res = await axiosInstance.get(`/post/${postId}/comment`, {
      params: { Page, PageSize },
    });

    return res.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không lấy được danh sách bình luận"),
    );
  }
};

// Tạo bình luận cho một bài viết
export const createComment = async (postId, payload) => {
  try {
    assertAuthenticated();

    if(!postId) {
      throw new Error("Thiếu postId để tạo bình luận");
    }
    if(!payload || !payload.content) {
      throw new Error("Nội dung bình luận không được để trống");
    }
    const res = await axiosInstance.post(`/post/${postId}/comment`, payload);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Tạo bình luận thất bại"));
  }
}

// Tương tác like/dislike bài viết
export const createReaction= async (postId, reactionType) => {
  try {
    assertAuthenticated();

    if (!postId) {
      throw new Error("Thiếu postId để tương tác");
    }

    if (!reactionType) {
      throw new Error("Thiếu reactionType để tương tác");
    }

    const res = await axiosInstance.post(`/post/reaction`, {
      postId,
      reactionType,
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Tương tác thất bại"));
  }
}

// Xoá tương tác like/dislike bài viết
export const removeReaction = async (postId) => {
  try {
    assertAuthenticated();

    if (!postId) {
      throw new Error("Thiếu postId để xoá tương tác");
    }

    const res = await axiosInstance.delete(`/post/reaction/${postId}`);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Xoá tương tác thất bại"));
  }
}
