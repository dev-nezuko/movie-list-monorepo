import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, test, vi, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as useMoviesHook from "../hooks/useMovies";
import { getPoster, logout } from "../services/api";
import { Movies } from "./Movies";

vi.mock("../hooks/useMovies");
vi.mock("../services/api", () => ({
  logout: vi.fn(),
  getPoster: vi.fn(),
}));

beforeEach(() => {
  (getPoster as Mock).mockRejectedValue(new Error("no poster in this test"));
});

const renderWithRouter = (path = "/movies") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Movies />
    </MemoryRouter>
  );

describe("Movies page", () => {
  it("shows loading state while movies are being fetched", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({
      movies: [],
      total: 0,
      isLoading: true,
      error: null,
    });

    renderWithRouter();

    expect(
      screen.getByText(/Loading your movies.../i)
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no movies", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({
      movies: [],
      total: 0,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(
      screen.getByText(/Your movie list is empty/i)
    ).toBeInTheDocument();
  });

  it("renders movies when data is available", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({
      movies: [
        {
          _id: "1",
          title: "Movie 1",
          publishYear: 2020,
        },
      ],
      total: 1,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
  });

  it("shows error state when hook reports an error", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({
      movies: [],
      total: 0,
      isLoading: false,
      error: "Failed to load movies",
    });

    renderWithRouter();

    expect(
      screen.getByText(/Unable to load movies/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Failed to load movies/i)
    ).toBeInTheDocument();
  });
});



test('local logout clears the token even when the API is unavailable', async () => {
  (useMoviesHook.useMovies as Mock).mockReturnValue({ movies: [{_id:'one',title:'Synthetic film',publishYear:2024}], total: 1, isLoading:false, error:null });
  (logout as Mock).mockRejectedValueOnce(new Error('offline'));
  localStorage.setItem('userToken','offline-fixture');
  renderWithRouter();
  fireEvent.click(screen.getByRole('button', {name:/Logout/i}));
  await waitFor(() => expect(localStorage.getItem('userToken')).toBeNull());
});

test('poster object URLs are released when the card unmounts', async () => {
  const create = vi.fn(() => 'blob:synthetic-poster');
  const revoke = vi.fn();
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  URL.createObjectURL = create;
  URL.revokeObjectURL = revoke;
  (getPoster as Mock).mockResolvedValueOnce(new Blob([new Uint8Array([1, 2, 3])]));
  (useMoviesHook.useMovies as Mock).mockReturnValue({ movies:[{_id:'one',title:'Synthetic film',publishYear:2024}], total: 1, isLoading:false,error:null });
  try {
    const view = renderWithRouter();
    await waitFor(() => expect(screen.getByAltText('Poster for Synthetic film')).toHaveAttribute('src', 'blob:synthetic-poster'));
    expect(getPoster).toHaveBeenCalledWith('one', null);
    view.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:synthetic-poster');
  } finally { URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; }
});

describe("paging", () => {
  const eight = Array.from({ length: 8 }, (_, i) => ({ _id: `m${i}`, title: `Synthetic ${i}`, publishYear: 2020 }));

  test("shows the page count and asks for the next page", async () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({ movies: eight, total: 20, isLoading: false, error: null });
    renderWithRouter();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(useMoviesHook.useMovies).toHaveBeenLastCalledWith(2, 8);
  });

  test("reads the page from the URL and hides paging for a single page", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({ movies: eight, total: 20, isLoading: false, error: null });
    renderWithRouter("/movies?page=3");
    expect(useMoviesHook.useMovies).toHaveBeenLastCalledWith(3, 8);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  test("offers a way back from a page past the end", () => {
    (useMoviesHook.useMovies as Mock).mockReturnValue({ movies: [], total: 3, isLoading: false, error: null });
    renderWithRouter("/movies?page=9");
    expect(screen.getByText("There is no page 9")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /first page/ })).toHaveAttribute("href", "/movies");
  });
});
