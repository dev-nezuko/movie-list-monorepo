import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { ApiError, deleteMovie, getMovie, getPoster } from "services/api";
import { EditMovie } from "./EditMovie";

vi.mock("services/api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getMovie: vi.fn(),
  getPoster: vi.fn(),
  deleteMovie: vi.fn(),
}));

const ID = "658edbd57ff3ddead43bc705";

const renderAt = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: `/movies/${ID}/edit`, state }]}>
      <Routes>
        <Route path="/movies/:id/edit" element={<EditMovie />} />
        <Route path="/movies" element={<p>movie list</p>} />
        <Route path="/signin" element={<p>sign-in page</p>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.mocked(getMovie).mockReset();
  vi.mocked(deleteMovie).mockReset();
  (getPoster as Mock).mockRejectedValue(new Error("no poster in this test"));
  localStorage.setItem("userToken", "synthetic-token");
});

test("a pasted edit link loads the movie by ID", async () => {
  vi.mocked(getMovie).mockResolvedValue({ _id: ID, title: "The Lantern Keeper", publishYear: 2002 });
  renderAt();
  expect(await screen.findByDisplayValue("The Lantern Keeper")).toBeInTheDocument();
  expect(screen.getByDisplayValue("2002")).toBeInTheDocument();
  expect(getMovie).toHaveBeenCalledWith(ID, "synthetic-token");
});

test("navigation state is used without another request", () => {
  renderAt({ movie: { _id: ID, title: "Harbour Lights", publishYear: 1999 } });
  expect(screen.getByDisplayValue("Harbour Lights")).toBeInTheDocument();
  expect(getMovie).not.toHaveBeenCalled();
});

test("a movie that is not the user's shows a way back", async () => {
  vi.mocked(getMovie).mockRejectedValue(new ApiError("Movie not found", 404));
  renderAt();
  expect(await screen.findByText(/not in your list/)).toBeInTheDocument();
});

test("an expired session goes back to sign-in", async () => {
  vi.mocked(getMovie).mockRejectedValue(new ApiError("Unauthorized - Invalid token", 401));
  renderAt();
  expect(await screen.findByText("sign-in page")).toBeInTheDocument();
  expect(localStorage.getItem("userToken")).toBeNull();
});

test("deleting asks for confirmation before calling the API", async () => {
  vi.mocked(deleteMovie).mockResolvedValue(undefined);
  renderAt({ movie: { _id: ID, title: "Harbour Lights", publishYear: 1999 } });
  await userEvent.click(screen.getByRole("button", { name: "Delete movie" }));
  expect(deleteMovie).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
  expect(deleteMovie).toHaveBeenCalledWith(ID, "synthetic-token");
  expect(await screen.findByText("movie list")).toBeInTheDocument();
});
