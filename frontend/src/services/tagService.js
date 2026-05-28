import axiosInstance from "../utils/axiosInstance"
import { assertAuthenticated } from "@/utils/authGuard";

const getErrorMessage = (error, fallbackMessage) => {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export const getTags = async () => {
    try {
        const res = await axiosInstance.get("/GameTags");
        return res.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Không thể tải danh sách tag"));
    }
}

export const createTag = async (name) => {
    try {
        assertAuthenticated();

        const res = await axiosInstance.post("/GameTags", { name });
        return res.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Không thể tạo tag"));
    }
}
