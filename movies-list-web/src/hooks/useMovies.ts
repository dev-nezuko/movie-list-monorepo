import { useEffect, useState } from "react";
import { getMovies } from "services/api";
import { getToken } from "services/session";
import { Movie } from "types/Movie";
import { useSignOutOn401 } from "./useSignOutOn401";

export type { Movie } from "types/Movie";

interface LoadedPage {
  key: string;
  movies: Movie[];
  total: number;
  error: string | null;
}

interface UseMoviesResult {
  movies: Movie[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export const useMovies = (page = 1, pageSize = 10): UseMoviesResult => {
  const signOutOn401 = useSignOutOn401();
  const key = `${page}/${pageSize}`;
  const [loaded, setLoaded] = useState<LoadedPage | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMovies(page, pageSize, getToken())
      .then((data) => {
        if (!cancelled) setLoaded({ key, movies: data.movies, total: data.total, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled || signOutOn401(error)) return;
        setLoaded({ key, movies: [], total: 0, error: error instanceof Error ? error.message : "Failed to load movies" });
      });
    return () => {
      cancelled = true;
    };
  }, [key, page, pageSize, signOutOn401]);

  // Loading is derived from whether the stored result belongs to the requested page.
  if (!loaded || loaded.key !== key) return { movies: [], total: 0, isLoading: true, error: null };
  return { movies: loaded.movies, total: loaded.total, isLoading: false, error: loaded.error };
};
