import { toast } from "sonner";

export const LOGIN_REQUIRED_MESSAGE =
  "Bạn cần đăng nhập để thực hiện thao tác này.";
export const SESSION_EXPIRED_MESSAGE =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
export const AUTH_SESSION_CLEARED_EVENT = "auth:session-cleared";

const TOAST_DEBOUNCE_MS = 1200;
let lastAuthToastAt = 0;

export class AuthRequiredError extends Error {
  constructor(message = LOGIN_REQUIRED_MESSAGE) {
    super(message);
    this.name = "AuthRequiredError";
    this.code = "AUTH_REQUIRED";
  }
}

export const isAuthenticatedUser = (user) => {
  return Boolean(user && typeof user === "object" && Object.keys(user).length);
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const hasStoredUser = () => isAuthenticatedUser(getStoredUser());

export const notifyAuthRequired = (message = LOGIN_REQUIRED_MESSAGE) => {
  const now = Date.now();

  if (now - lastAuthToastAt < TOAST_DEBOUNCE_MS) return;

  lastAuthToastAt = now;
  toast.error(message);
};

export const assertAuthenticated = (user, message = LOGIN_REQUIRED_MESSAGE) => {
  const authenticated =
    user === undefined ? hasStoredUser() : isAuthenticatedUser(user);

  if (authenticated) return true;

  notifyAuthRequired(message);
  throw new AuthRequiredError(message);
};

export const clearStoredAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
};

export const isAuthErrorStatus = (status) => status === 401 || status === 403;
