import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { Router } from "./Router";

vi.mock("pages/Movies", () => ({ Movies: () => <p>movie list</p> }));
vi.mock("pages/Signin", () => ({ Signin: () => <p>sign-in page</p> }));

const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><Router /></MemoryRouter>);

test("signed-out visitors are sent to sign-in", () => {
  renderAt("/movies");
  expect(screen.getByText("sign-in page")).toBeInTheDocument();
});

test("a stored token opens the list, and unknown paths land there", () => {
  localStorage.setItem("userToken", "synthetic-token");
  renderAt("/nowhere");
  expect(screen.getByText("movie list")).toBeInTheDocument();
});
