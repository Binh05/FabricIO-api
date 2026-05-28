import { useCallback } from "react";
import useAuth from "@/contexts/AuthContext";
import {
  assertAuthenticated,
  isAuthenticatedUser,
  LOGIN_REQUIRED_MESSAGE,
  notifyAuthRequired,
} from "@/utils/authGuard";

export default function useRequireAuth() {
  const auth = useAuth() || {};
  const { user } = auth;
  const isAuthenticated = isAuthenticatedUser(user);

  const requireAuth = useCallback(
    (message = LOGIN_REQUIRED_MESSAGE) => {
      if (isAuthenticatedUser(user)) return true;

      notifyAuthRequired(message);
      return false;
    },
    [user],
  );

  const ensureAuth = useCallback(
    (message = LOGIN_REQUIRED_MESSAGE) => {
      return assertAuthenticated(user, message);
    },
    [user],
  );

  return {
    user,
    isAuthenticated,
    requireAuth,
    ensureAuth,
  };
}
