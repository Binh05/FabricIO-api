import axiosInstance from "../utils/axiosInstance";
import { mockFeaturedDrop } from "../mocks/homeMock";

const USE_MOCK = true;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getFeaturedDrop = async () => {
  if (USE_MOCK) {
    await wait(400);
    return {
      data: mockFeaturedDrop,
    };
  }

  const res = await axiosInstance.get("/.../featured-drop");
  return res.data;
};