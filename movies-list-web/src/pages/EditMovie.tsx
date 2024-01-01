import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "components/Button";
import { MovieForm } from "components/MovieForm";
import { ROUTES } from "constants/routes";
import { useSignOutOn401 } from "hooks/useSignOutOn401";
import { ApiError, deleteMovie, getMovie } from "services/api";
import { getToken } from "services/session";
import { Movie } from "types/Movie";

export const EditMovie = (): JSX.Element => {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const signOutOn401 = useSignOutOn401();
  const fromList: Movie | undefined = location.state?.movie?._id === id ? location.state.movie : undefined;
  const [fetched, setFetched] = useState<Movie | null>(null);
  const [loadError, setLoadError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const movie = fromList ?? (fetched?._id === id ? fetched : undefined);

  // A refreshed page or pasted link has no navigation state, so the movie is loaded by ID.
  useEffect(() => {
    if (fromList) return;
    let cancelled = false;
    getMovie(id, getToken())
      .then((loaded) => !cancelled && setFetched(loaded))
      .catch((error: unknown) => {
        if (cancelled || signOutOn401(error)) return;
        setLoadError(error instanceof ApiError && error.status === 404 ? "This movie is not in your list." : "The movie could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [fromList, id, signOutOn401]);

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteMovie(id, getToken());
      navigate(ROUTES.movies);
    } catch (error) {
      if (!signOutOn401(error)) setDeleteError("The movie could not be deleted. Try again.");
    }
  };

  return (
    <div className="main-container">
      <h1 className="mb-10 text-5xl text-white">Edit</h1>
      {movie ? (
        <>
          <MovieForm isEditState initialData={movie} />
          <section aria-label="Delete movie" className="flex flex-wrap items-center gap-3 mt-12 text-white">
            {confirmingDelete ? (
              <>
                <p>Delete “{movie.title}” for good?</p>
                <Button onClick={handleDelete} className="bg-error">Delete permanently</Button>
                <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>Keep it</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmingDelete(true)}>Delete movie</Button>
            )}
            {deleteError && <p role="alert" className="text-red-300">{deleteError}</p>}
          </section>
        </>
      ) : loadError ? (
        <p className="text-white">
          {loadError} <Link className="underline" to={ROUTES.movies}>Back to movies</Link>
        </p>
      ) : (
        <p className="text-white">Loading movie...</p>
      )}
    </div>
  );
};
