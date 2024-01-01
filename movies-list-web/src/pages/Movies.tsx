import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "components/Button";
import { LogoutIcon, PlusIcon } from "components/icons";
import { MovieCard } from "components/MovieCard";
import { editMoviePath, PAGE_SIZE, ROUTES } from "constants/routes";
import { logout } from "services/api";
import { clearToken, getToken } from "services/session";
import { useMovies, Movie } from "hooks/useMovies";
import { usePosterUrl } from "hooks/usePosterUrl";

const pageFromQuery = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const Movies = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = pageFromQuery(searchParams.get("page"));
  const { movies, total, isLoading, error } = useMovies(page, PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (next: number) => setSearchParams(next === 1 ? {} : { page: String(next) });

  const handleLogout = async () => {
    try {
      await logout(getToken());
    } catch {
      // Local sign-out must remain available when the API cannot be reached.
    } finally {
      clearToken();
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
      <div className="flex flex-col items-center justify-center h-[100vh] px-6 text-center">
        <h1 className="mb-4 text-3xl text-white">Unable to load movies</h1>
        <p className="mb-6 text-white opacity-80">{error}</p>
        <Button onClick={() => navigate(0)}>Try again</Button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-6 text-3xl sm:text-5xl text-white">Your movie list is empty</h1>
        <Button onClick={() => navigate(ROUTES.newMovie)}>Add a new movie</Button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] gap-4">
        <h1 className="text-3xl text-white">There is no page {page}</h1>
        <Link className="text-white underline" to={ROUTES.movies}>Back to the first page</Link>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex items-center justify-between mb-10">
        <span className="flex gap-2 items-center">
          <h1 className="text-3xl sm:text-5xl text-white">My Movies</h1>
          <button type="button" aria-label="Add movie" className="text-white" onClick={() => navigate(ROUTES.newMovie)}>
            <PlusIcon className="mt-2" />
          </button>
        </span>
        <button type="button" className="flex items-center gap-2 text-white" onClick={handleLogout}>
          Logout <LogoutIcon />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map((movie: Movie) => (
          <MovieWithArtwork key={movie._id} movie={movie} onEdit={() => navigate(editMoviePath(movie._id), { state: { movie } })} />
        ))}
      </div>
      {pageCount > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-center gap-4 mt-12 text-white">
          <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="font-bold disabled:opacity-40">
            Prev
          </button>
          <span aria-current="page">Page {page} of {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => goToPage(page + 1)} className="font-bold disabled:opacity-40">
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

function MovieWithArtwork({ movie, onEdit }: { movie: Movie; onEdit: () => void }) {
  const posterUrl = usePosterUrl(movie._id);
  return <MovieCard title={movie.title} year={String(movie.publishYear)} image={posterUrl || "/poster-placeholder.svg"} onEditClick={onEdit} />;
}
