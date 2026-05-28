import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { uploadGame } from "@/services/gameService";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useNavigate } from "react-router";



export const useUploadGame = () => {
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const schema = yup.object({
    Title: yup.string().required("Tên game bắt buộc"),
    Description: yup.string().required("Mô tả bắt buộc"),
    Price: yup.number().typeError("Giá phải là số").min(0).required(),
    GameType: yup.string().required("Loại game bắt buộc"),
    GameFile: yup.mixed().required("Thiếu file game"),
    Thumbnail: yup.mixed().required("Thiếu thumbnail"),
    TagIds: yup.array().default([]),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Title: "",
      Description: "",
      Price: 0,
      GameType: "Browser",
      TagIds: [],
    },
  });

  const onSubmit = async (data) => {
    if (!requireAuth()) return;

    try {
      await uploadGame(data);
      toast.success("Tải game lên thành công");
      reset();
      // Navigate to game library after successful upload
      navigate("/games");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Tải game lên thất bại");
    }
  };

  const onInvalid = () => {
    requireAuth();
  };

  const handleGameFile = (e) => {
    setValue("GameFile", e.target.files?.[0], { shouldValidate: true });
  };

  const handleThumbnail = (e) => {
    setValue("Thumbnail", e.target.files?.[0], { shouldValidate: true });
  };

  const handleTagIds = (tagId) => {
    const current = getValues("TagIds") || [];
    const exists = current.includes(tagId);
    
    const newTagIds = exists ? current.filter((id) => id !== tagId) : [...current, tagId];
    console.log("Toggle tag:", tagId, "- New TagIds:", newTagIds);

    setValue(
      "TagIds",
      newTagIds,
      { shouldValidate: true },
    );
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit, onInvalid),
    errors,
    isSubmitting,
    handleGameFile,
    handleThumbnail,
    handleTagIds,
    watch,
  };
};
