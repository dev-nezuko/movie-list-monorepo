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
      <div role="status" className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-6 text-3xl text-muted">Loading your movies...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] px-6 text-center">
        <h1 className="mb-4 text-3xl text-ink">Unable to load movies</h1>
        <p role="alert" className="mb-6 text-muted">{error}</p>
        <Button onClick={() => navigate(0)}>Try again</Button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] px-6 text-center">
        <h1 className="mb-3 text-3xl sm:text-5xl text-ink">Your movie list is empty</h1>
        <p className="mb-8 text-muted">Add a title, its year and a poster to start your shelf.</p>
        <Button onClick={() => navigate(ROUTES.newMovie)}>Add a new movie</Button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] gap-4">
        <h1 className="text-3xl text-ink">There is no page {page}</h1>
        <Link className="underline text-primary" to={ROUTES.movies}>Back to the first page</Link>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-10 border-b border-line/40">
        <div>
          <h1 className="text-4xl sm:text-5xl text-ink">My Movies</h1>
          <p className="mt-2 text-sm text-muted">
            {total} {total === 1 ? "title" : "titles"} on your shelf
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(ROUTES.newMovie)} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add movie
          </Button>
          <button type="button" className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg text-muted hover:text-ink" onClick={handleLogout}>
            Logout <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie: Movie) => (
          <MovieWithArtwork key={movie._id} movie={movie} onEdit={() => navigate(editMoviePath(movie._id), { state: { movie } })} />
        ))}
      </div>
      {pageCount > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-center gap-4 mt-12 text-ink">
          <Button variant="secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Prev
          </Button>
          <span aria-current="page" className="text-sm tabular-nums text-muted">Page {page} of {pageCount}</span>
          <Button variant="secondary" disabled={page >= pageCount} onClick={() => goToPage(page + 1)}>
            Next
          </Button>
        </nav>
      )}
    </div>
  );
};

function MovieWithArtwork({ movie, onEdit }: { movie: Movie; onEdit: () => void }) {
  const posterUrl = usePosterUrl(movie._id);
  return <MovieCard title={movie.title} year={String(movie.publishYear)} image={posterUrl || "/poster-placeholder.svg"} onEditClick={onEdit} />;
}
