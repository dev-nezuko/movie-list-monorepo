export const ROUTES = {
  signin: "/signin",
  movies: "/movies",
  newMovie: "/movies/new",
  editMovie: "/movies/:id/edit",
};

export const editMoviePath = (id: string) => `/movies/${encodeURIComponent(id)}/edit`;

export const PAGE_SIZE = 8;
