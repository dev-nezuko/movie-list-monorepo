import { MovieForm } from "components/MovieForm";
import { useLocation } from "react-router-dom";

export const EditMovie = (): JSX.Element => {
  const location = useLocation();
  const movie = location.state?.movie;

  return (
    <div className="main-container">
      <h1 className="mb-32 text-5xl text-white">Edit</h1>
      {movie && <MovieForm isEditState initialData={movie} />}
    </div>
  );
};
