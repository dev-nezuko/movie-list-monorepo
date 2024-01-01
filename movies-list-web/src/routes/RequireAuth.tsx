import { Navigate } from "react-router-dom";
import { ROUTES } from "constants/routes";
import { getToken } from "services/session";

export const RequireAuth = ({ children }: { children: JSX.Element }) =>
  getToken() ? children : <Navigate to={ROUTES.signin} replace />;
