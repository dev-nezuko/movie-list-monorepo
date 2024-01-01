import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import { ApiError, saveMovie } from "services/api";
import { MovieForm } from "./MovieForm";

vi.mock("services/api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  saveMovie: vi.fn(),
  getPoster: vi.fn(() => Promise.reject(new Error("no poster"))),
}));

beforeEach(() => {
  vi.mocked(saveMovie).mockReset();
});

const editing = { _id: "m1", title: "Harbour Lights", publishYear: 1999 };

test("an update without a new poster sends only the trimmed fields", async () => {
  vi.mocked(saveMovie).mockResolvedValue(undefined);
  render(<MemoryRouter><MovieForm isEditState initialData={editing} /></MemoryRouter>);
  await userEvent.clear(screen.getByLabelText("Title"));
  await userEvent.type(screen.getByLabelText("Title"), "  Harbour Lights Revisited ");
  await userEvent.click(screen.getByRole("button", { name: "Update" }));
  const [form, , id] = vi.mocked(saveMovie).mock.calls[0];
  expect(id).toBe("m1");
  expect(form.get("title")).toBe("Harbour Lights Revisited");
  expect(form.get("publicationYear")).toBe("1999");
  expect(form.has("image")).toBe(false);
});

test("the API's reason for refusing a save is shown", async () => {
  vi.mocked(saveMovie).mockImplementation(async () => {
    throw new ApiError("Posters must be PNG or JPEG images", 415);
  });
  render(<MemoryRouter><MovieForm isEditState initialData={editing} /></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", { name: "Update" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Posters must be PNG or JPEG images");
});

test("a year before 1888 is caught before any request", async () => {
  render(<MemoryRouter><MovieForm isEditState initialData={editing} /></MemoryRouter>);
  await userEvent.clear(screen.getByLabelText("Publishing year"));
  await userEvent.type(screen.getByLabelText("Publishing year"), "1700");
  await userEvent.click(screen.getByRole("button", { name: "Update" }));
  expect(await screen.findByText("Films start in 1888")).toBeInTheDocument();
  expect(saveMovie).not.toHaveBeenCalled();
});

test("a new movie needs a poster", async () => {
  render(<MemoryRouter><MovieForm /></MemoryRouter>);
  await userEvent.type(screen.getByLabelText("Title"), "Harbour Lights");
  await userEvent.type(screen.getByLabelText("Publishing year"), "1999");
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Choose a poster");
  expect(saveMovie).not.toHaveBeenCalled();
});
