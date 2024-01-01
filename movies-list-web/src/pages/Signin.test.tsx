import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { ApiError, login } from "services/api";
import { Signin } from "./Signin";

vi.mock("services/api", async (importOriginal) => ({ ...(await importOriginal<object>()), login: vi.fn() }));

const renderSignin = () =>
  render(
    <MemoryRouter initialEntries={["/signin"]}>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/movies" element={<p>movie list</p>} />
      </Routes>
    </MemoryRouter>
  );

const fillAndSubmit = async (remember: boolean) => {
  await userEvent.type(screen.getByLabelText("Email"), "demo@example.invalid");
  await userEvent.type(screen.getByLabelText("Password"), "synthetic-password");
  if (remember) await userEvent.click(screen.getByLabelText("Remember email"));
  await userEvent.click(screen.getByRole("button", { name: "Login" }));
};

beforeEach(() => {
  (login as Mock).mockReset();
});

test("the remember-email label toggles its checkbox and the email is kept", async () => {
  (login as Mock).mockResolvedValue("synthetic-token");
  renderSignin();
  await fillAndSubmit(true);
  expect(await screen.findByText("movie list")).toBeInTheDocument();
  expect(localStorage.getItem("userToken")).toBe("synthetic-token");
  expect(localStorage.getItem("rememberedEmail")).toBe("demo@example.invalid");
});

test("an unticked box forgets a previously remembered email", async () => {
  localStorage.setItem("rememberedEmail", "old@example.invalid");
  (login as Mock).mockResolvedValue("synthetic-token");
  renderSignin();
  expect(screen.getByLabelText("Remember email")).toBeChecked();
  await userEvent.clear(screen.getByLabelText("Email"));
  await userEvent.click(screen.getByLabelText("Remember email"));
  await fillAndSubmit(false);
  await screen.findByText("movie list");
  expect(localStorage.getItem("rememberedEmail")).toBeNull();
});

test("the server's reason is shown when sign-in fails", async () => {
  (login as Mock).mockImplementation(async () => {
    throw new ApiError("Too many failed sign-in attempts; try again in 15 minutes", 429);
  });
  renderSignin();
  await fillAndSubmit(false);
  expect(await screen.findByRole("alert")).toHaveTextContent("Too many failed sign-in attempts");
  expect(localStorage.getItem("userToken")).toBeNull();
});

test("a signed-in visitor skips the form", () => {
  localStorage.setItem("userToken", "synthetic-token");
  renderSignin();
  expect(screen.getByText("movie list")).toBeInTheDocument();
});
