export interface Movie {
  _id: string;
  title: string;
  publishYear: number;
}

export interface MoviePage {
  movies: Movie[];
  page: number;
  pageSize: number;
  total: number;
}
