import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "constants/routes";
import { ApiError } from "services/api";
import { clearToken } from "services/session";

// An expired or replaced token can only be fixed by signing in again, so every screen sends 401s there.
export const useSignOutOn401 = () => {
  const navigate = useNavigate();
  return useCallback(
    (error: unknown): boolean => {
      if (!(error instanceof ApiError) || error.status !== 401) return false;
      clearToken();
      navigate(ROUTES.signin, { replace: true });
      return true;
    },
    [navigate]
  );
};
