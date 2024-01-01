import { Movie } from "../hooks/useMovies";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

export interface Credentials {
  email: string;
  password: string;
}

const authHeader = (userToken: string | null) => ({ Authorization: `Bearer ${userToken}` });

export const login = async (values: Credentials): Promise<string> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: values.email, password: values.password }),
  }).catch(() => null);

  if (!response?.ok) throw new Error("Invalid email or password");
  const data: { token: string } = await response.json();
  return data.token;
};

export const logout = async (userToken: string | null): Promise<void> => {
  const response = await fetch(`${BASE_URL}/logout`, { method: "POST", headers: authHeader(userToken) });
  if (!response.ok) throw new Error("Failed to logout");
};

export const getMovies = async (page: number, pageSize: number, userToken: string | null): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/movies?page=${page}&pageSize=${pageSize}`, { headers: authHeader(userToken) });
  if (!response.ok) throw new Error("Failed to fetch movies");
  const data: { movies: Movie[] } = await response.json();
  return data.movies;
};

export const createMovie = (formData: FormData, userToken: string | null): Promise<Response> =>
  fetch(`${BASE_URL}/movies`, { method: "POST", headers: authHeader(userToken), body: formData });

export const updateMovie = (movieId: string, formData: FormData, userToken: string | null): Promise<Response> =>
  fetch(`${BASE_URL}/movies/${movieId}`, { method: "PUT", headers: authHeader(userToken), body: formData });

export const getPoster = async (movieId: string, userToken: string | null): Promise<Blob> => {
  const response = await fetch(`${BASE_URL}/movies/${movieId}/poster`, { headers: authHeader(userToken) });
  if (!response.ok) throw new Error("Failed to load poster");
  return response.blob();
};
