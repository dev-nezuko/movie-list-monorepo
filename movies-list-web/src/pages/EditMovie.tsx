import { MovieForm } from "components/MovieForm";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const EditMovie = (): JSX.Element => {
  const location = useLocation();
  const movie = location.state?.movie;

  return (
    <div className="main-container">
      <h1 className="mb-10 text-5xl text-white">Edit</h1>
      {movie ? <MovieForm isEditState initialData={movie} /> : <p className="text-white">Open a movie from your list to edit it. <Link className="underline" to="/movies">Back to movies</Link></p>}
    </div>
  );
};
