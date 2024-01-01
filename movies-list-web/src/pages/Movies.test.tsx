import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as useMoviesHook from "../hooks/useMovies";
import { logout } from "../services/api";
import { Movies } from "./Movies";

jest.mock("../hooks/useMovies");
jest.mock("../services/api", () => ({
  logout: jest.fn(),
}));

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Movies />
    </MemoryRouter>
  );

describe("Movies page", () => {
  it("shows loading state while movies are being fetched", () => {
    (useMoviesHook.useMovies as jest.Mock).mockReturnValue({
      movies: [],
      isLoading: true,
      error: null,
    });

    renderWithRouter();

    expect(
      screen.getByText(/Loading your movies.../i)
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no movies", () => {
    (useMoviesHook.useMovies as jest.Mock).mockReturnValue({
      movies: [],
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(
      screen.getByText(/Your movie list is empty/i)
    ).toBeInTheDocument();
  });

  it("renders movies when data is available", () => {
    (useMoviesHook.useMovies as jest.Mock).mockReturnValue({
      movies: [
        {
          _id: "1",
          title: "Movie 1",
          publishYear: 2020,
          image: { type: "Buffer", data: [] },
        },
      ],
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
  });

  it("shows error state when hook reports an error", () => {
    (useMoviesHook.useMovies as jest.Mock).mockReturnValue({
      movies: [],
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
  (useMoviesHook.useMovies as jest.Mock).mockReturnValue({ movies: [{_id:'one',title:'Synthetic film',publishYear:2024}], isLoading:false, error:null });
  (logout as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  localStorage.setItem('userToken','offline-fixture');
  renderWithRouter();
  fireEvent.click(screen.getByRole('button', {name:/Logout/i}));
  await waitFor(() => expect(localStorage.getItem('userToken')).toBeNull());
});

test('poster object URLs are released when the card unmounts', () => {
  const create = jest.fn(() => 'blob:synthetic-poster');
  const revoke = jest.fn();
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  URL.createObjectURL = create;
  URL.revokeObjectURL = revoke;
  (useMoviesHook.useMovies as jest.Mock).mockReturnValue({ movies:[{_id:'one',title:'Synthetic film',publishYear:2024,image:{type:'Buffer',data:[1,2,3]}}], isLoading:false,error:null });
  try {
    const view = renderWithRouter();
    expect(create).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:synthetic-poster');
  } finally { URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; }
});
