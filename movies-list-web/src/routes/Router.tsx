import { ROUTES } from "constants/routes";
import { EditMovie } from "pages/EditMovie";
import { Movies } from "pages/Movies";
import { NewMovie } from "pages/NewMovie";
import { Signin } from "pages/Signin";
import { Routes, Route, Navigate } from "react-router-dom";

export const Router = () => {
  return (
    <Routes>
      <Route path={ROUTES.signin} Component={Signin} />
      <Route path={ROUTES.movies} Component={Movies} />
      <Route path={ROUTES.newMovie} Component={NewMovie} />
      <Route path={`${ROUTES.editMovie}/:id/edit`} element={<EditMovie />} />
      <Route path="*" element={<Navigate to={ROUTES.signin} replace />} />
    </Routes>
  );
};
