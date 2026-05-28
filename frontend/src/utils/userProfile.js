export const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/065/277/981/small_2x/impressive-celebrated-minimalist-geometric-portrait-flat-color-clean-lines-with-scalable-design-png.png";

const DEFAULT_MEDIA_BASE_URL = "http://localhost/";

const getMediaBaseUrl = () => {
  const envBaseUrl =
    typeof import.meta !== "undefined"
      ? import.meta.env?.VITE_MEDIA_URL || import.meta.env?.VITE_API_ORIGIN
      : "";

  return envBaseUrl || DEFAULT_MEDIA_BASE_URL;
};

const joinUrl = (baseUrl, path) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBase}${normalizedPath}`;
};

export const getImageUrl = (url, fallback = "") => {
  if (!url) return fallback;

  const value = String(url).trim();
  if (!value) return fallback;

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  return joinUrl(getMediaBaseUrl(), value);
};

export const appendImageVersion = (url, version) => {
  if (!url || !version) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

export const getAvatarValue = (user) => {
  const safeUser = user || {};

  return (
    safeUser.avatarUrl ||
    safeUser.avatar ||
    safeUser.imageUrl ||
    safeUser.image ||
    safeUser.photoURL ||
    safeUser.profilePicture ||
    ""
  );
};

export const getAvatarVersion = (user) => {
  const safeUser = user || {};

  return (
    safeUser.avatarVersion ||
    safeUser.avatarUpdatedAt ||
    safeUser.updatedAt ||
    ""
  );
};

export const getUserAvatarUrl = (user, fallback = DEFAULT_AVATAR) => {
  const safeUser = user || {};

  const avatarValue = getAvatarValue(safeUser);
  if (!avatarValue) return fallback;

  const avatarUrl = getImageUrl(avatarValue, fallback);
  return appendImageVersion(avatarUrl, getAvatarVersion(safeUser));
};
export const normalizeUser = (payload, previousUser = null) => {
  const source = payload?.user || payload?.data || payload;

  if (!source) return previousUser;

  const avatarUrl = getAvatarValue(source) || previousUser?.avatarUrl || "";
  const bio =
    source.bio ??
    source.description ??
    previousUser?.bio ??
    previousUser?.description ??
    "";
  const displayName =
    source.displayName ?? source.DisplayName ?? previousUser?.displayName ?? "";
  const username =
    source.username ?? source.Username ?? previousUser?.username ?? "";
  const email = source.email ?? source.Email ?? previousUser?.email ?? "";

  return {
    ...previousUser,
    ...source,
    displayName,
    username,
    email,
    avatar: avatarUrl,
    avatarUrl,
    bio,
    description: source.description ?? bio,
  };
};
