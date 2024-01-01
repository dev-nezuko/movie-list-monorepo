import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { ApiError, getMovies } from "services/api";
import { useMovies } from "./useMovies";

vi.mock("services/api", async (importOriginal) => ({ ...(await importOriginal<object>()), getMovies: vi.fn() }));

const Probe = () => {
  const { movies, total, isLoading, error } = useMovies(1, 8);
  return <p>{isLoading ? "loading" : error ?? `${movies.length} of ${total}`}</p>;
};

const renderProbe = () =>
  render(
    <MemoryRouter initialEntries={["/movies"]}>
      <Routes>
        <Route path="/movies" element={<Probe />} />
        <Route path="/signin" element={<p>sign-in page</p>} />
      </Routes>
    </MemoryRouter>
  );

test("reports the loaded page and total", async () => {
  vi.mocked(getMovies).mockResolvedValue({ movies: [{ _id: "a", title: "A", publishYear: 2001 }], page: 1, pageSize: 8, total: 5 });
  renderProbe();
  expect(screen.getByText("loading")).toBeInTheDocument();
  expect(await screen.findByText("1 of 5")).toBeInTheDocument();
});

test("a rejected token clears the session and returns to sign-in", async () => {
  localStorage.setItem("userToken", "expired-synthetic-token");
  vi.mocked(getMovies).mockRejectedValue(new ApiError("Unauthorized - Invalid token", 401));
  renderProbe();
  expect(await screen.findByText("sign-in page")).toBeInTheDocument();
  expect(localStorage.getItem("userToken")).toBeNull();
});

test("other failures stay on the page with their message", async () => {
  vi.mocked(getMovies).mockRejectedValue(new ApiError("Can't reach the movie server.", 0));
  renderProbe();
  expect(await screen.findByText("Can't reach the movie server.")).toBeInTheDocument();
});
