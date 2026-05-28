const TAG_LABELS = {
  Racing: "Đua xe",
  Arcade: "Arcade",
  Cyberpunk: "Cyberpunk",
  RPG: "Nhập vai",
  Adventure: "Phiêu lưu",
  Story: "Cốt truyện",
  Puzzle: "Giải đố",
  Cozy: "Thư giãn",
  Simulation: "Mô phỏng",
  Horror: "Kinh dị",
  "Sci-Fi": "Khoa học viễn tưởng",
  Strategy: "Chiến thuật",
  "Turn-Based": "Theo lượt",
  Fantasy: "Kỳ ảo",
  Casual: "Phổ thông",
  Indie: "Độc lập",
  Action: "Hành động",
  "Open World": "Thế giới mở",
  Shooter: "Bắn súng",
  Multiplayer: "Nhiều người chơi",
  Survival: "Sinh tồn",
  PvP: "Đối kháng",
};

const FILTER_LABELS = {
  All: "Tất cả",
  Free: "Miễn phí",
  Paid: "Trả phí",
  Purchased: "Đã mua",
  NotPurchased: "Chưa mua",
  "Not Purchased": "Chưa mua",
  Newest: "Mới nhất",
  Oldest: "Cũ nhất",
  Price: "Giá",
  Rating: "Đánh giá",
  "Price Low to High": "Giá thấp đến cao",
  "Price High to Low": "Giá cao đến thấp",
  "Top Rated": "Đánh giá cao nhất",
};

const GAME_TYPE_LABELS = {
  Browser: "Chơi trên trình duyệt",
  Download: "Tải xuống",
};

const ROLE_LABELS = {
  Author: "Tác giả",
  User: "Người dùng",
  user: "Người dùng",
  Admin: "Quản trị viên",
  admin: "Quản trị viên",
  player: "Người chơi",
  developer: "Nhà phát triển",
};

export const getTagLabel = (tagName = "") => {
  return TAG_LABELS[String(tagName).trim()] || tagName;
};

export const getFilterLabel = (value = "") => {
  return FILTER_LABELS[String(value).trim()] || "";
};

export const getGameTypeLabel = (type = "") => {
  return GAME_TYPE_LABELS[String(type).trim()] || type;
};

export const getRoleLabel = (role = "") => {
  return ROLE_LABELS[String(role).trim()] || role;
};

export const getPriceLabel = (price) => {
  if (price === "Free" || Number(price) === 0) return "Miễn phí";
  if (price === "Paid") return "Trả phí";
  return price;
};
