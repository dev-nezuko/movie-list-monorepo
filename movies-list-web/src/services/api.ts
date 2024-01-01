import { Movie, MoviePage } from "types/Movie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface Credentials {
  email: string;
  password: string;
}

const UNREACHABLE = "Can't reach the movie server. Check that the API is running and try again.";

const authHeader = (userToken: string | null) => ({ Authorization: `Bearer ${userToken}` });

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, init).catch(() => {
    throw new ApiError(UNREACHABLE, 0);
  });
  if (response.ok) return response;
  const body = await response.json().catch(() => ({}));
  throw new ApiError(typeof body.message === "string" ? body.message : `Request failed (${response.status})`, response.status);
}

export const login = async (values: Credentials): Promise<string> => {
  try {
    const response = await request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, password: values.password }),
    });
    const data: { token: string } = await response.json();
    return data.token;
  } catch (error) {
    // The API's 401 text is deliberately vague; keep it, but say so plainly for any other 4xx.
    if (error instanceof ApiError && error.status === 401) throw new ApiError("Invalid email or password", 401);
    throw error;
  }
};

export const logout = async (userToken: string | null): Promise<void> => {
  await request("/logout", { method: "POST", headers: authHeader(userToken) });
};

export const getMovies = async (page: number, pageSize: number, userToken: string | null): Promise<MoviePage> => {
  const response = await request(`/movies?page=${page}&pageSize=${pageSize}`, { headers: authHeader(userToken) });
  return response.json();
};

export const getMovie = async (movieId: string, userToken: string | null): Promise<Movie> => {
  const response = await request(`/movies/${encodeURIComponent(movieId)}`, { headers: authHeader(userToken) });
  const data: { movie: Movie } = await response.json();
  return data.movie;
};

export const saveMovie = async (formData: FormData, userToken: string | null, movieId?: string): Promise<void> => {
  await request(movieId ? `/movies/${encodeURIComponent(movieId)}` : "/movies", {
    method: movieId ? "PUT" : "POST",
    headers: authHeader(userToken),
    body: formData,
  });
};

export const deleteMovie = async (movieId: string, userToken: string | null): Promise<void> => {
  await request(`/movies/${encodeURIComponent(movieId)}`, { method: "DELETE", headers: authHeader(userToken) });
};

export const getPoster = async (movieId: string, userToken: string | null): Promise<Blob> => {
  const response = await request(`/movies/${encodeURIComponent(movieId)}/poster`, { headers: authHeader(userToken) });
  return response.blob();
};
