import { useEffect, useState } from "react";
import { getMovies } from "../services/api";

export interface Movie {
  _id: string;
  title: string;
  publishYear: number;
  image?: {
    type: string;
    data: number[];
  };
}

interface UseMoviesResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

export const useMovies = (): UseMoviesResult => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        setError("Missing authentication token");
        setIsLoading(false);
        return;
      }

      try {
        const moviesData = await getMovies(1, 10, userToken);
        setMovies(moviesData);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { movies, isLoading, error };
};

