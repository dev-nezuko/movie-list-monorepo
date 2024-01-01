import { useEffect, useState } from "react";
import { Button } from "components/Button";
import { ReactComponent as PlusIcon } from "assets/plus-icon.svg";
import { ReactComponent as LogoutIcon } from "assets/logout-icon.svg";
import { MovieCard } from "components/MovieCard";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "constants/routes";
import { logout } from "../services/api";
import { useMovies, Movie } from "../hooks/useMovies";

export const Movies = (): JSX.Element => {
  const navigate = useNavigate();
  const { movies, isLoading, error } = useMovies();

  const handleEditClick = (movie: any) => {
    navigate(`${ROUTES.editMovie}/${movie._id}/edit`, { state: { movie } });
  };

  const handleLogout = async () => {
    try {
      const userToken = localStorage.getItem('userToken') || '';
      await logout(userToken);
    } catch {
      // Local sign-out must remain available when the API cannot be reached.
    } finally {
      localStorage.removeItem('userToken');
      navigate(ROUTES.signin);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-6 text-3xl text-white">Loading your movies...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-4 text-3xl text-white">Unable to load movies</h1>
        <p className="mb-6 text-white opacity-80">{error}</p>
        <Button onClick={() => navigate(ROUTES.signin)}>Back to sign in</Button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-6 text-3xl sm:text-5xl text-white">Your movie list is empty</h1>
        <Button onClick={() => navigate(ROUTES.newMovie)}>Add a new movie</Button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex items-center justify-between mb-10">
        <span className="flex gap-2 items-center">
          <h1 className="text-3xl sm:text-5xl text-white">My Movies</h1>
          <button aria-label="Add movie" onClick={() => navigate(ROUTES.newMovie)}>
            <PlusIcon className="mt-2" />
          </button>
        </span>
        <button className="flex items-center gap-2 text-white" onClick={handleLogout}>
          Logout <LogoutIcon />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map((movie: Movie) => (
          <MovieWithArtwork key={movie._id} movie={movie} onEdit={() => handleEditClick(movie)} />
        ))}
      </div>
    </div>
  );
};

function MovieWithArtwork({ movie, onEdit }: { movie: Movie; onEdit: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    if (!movie.image?.data.length) { setImageUrl(''); return; }
    const url = URL.createObjectURL(new Blob([new Uint8Array(movie.image.data)]));
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [movie.image]);
  return <MovieCard title={movie.title} year={String(movie.publishYear)} image={imageUrl || '/poster-placeholder.svg'} onEditClick={onEdit} />;
}
