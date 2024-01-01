import { ROUTES } from "constants/routes";
import { EditMovie } from "pages/EditMovie";
import { Movies } from "pages/Movies";
import { NewMovie } from "pages/NewMovie";
import { Signin } from "pages/Signin";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";

export const Router = () => {
  return (
    <Routes>
      <Route path={ROUTES.signin} element={<Signin />} />
      <Route path={ROUTES.movies} element={<RequireAuth><Movies /></RequireAuth>} />
      <Route path={ROUTES.newMovie} element={<RequireAuth><NewMovie /></RequireAuth>} />
      <Route path={ROUTES.editMovie} element={<RequireAuth><EditMovie /></RequireAuth>} />
      <Route path="*" element={<Navigate to={ROUTES.movies} replace />} />
    </Routes>
  );
};
