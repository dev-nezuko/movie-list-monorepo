import { afterEach, expect, test, vi } from "vitest";
import { ApiError, getMovies, login } from "./api";

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

afterEach(() => vi.restoreAllMocks());

test("a 401 at sign-in reads as bad credentials", async () => {
  respond(401, { message: "Invalid email or password" });
  await expect(login({ email: "a@example.invalid", password: "x" })).rejects.toMatchObject({ status: 401, message: "Invalid email or password" });
});

test("the API's message and status are kept for other failures", async () => {
  respond(429, { message: "Too many failed sign-in attempts; try again in 15 minutes" });
  await expect(login({ email: "a@example.invalid", password: "x" })).rejects.toMatchObject({ status: 429 });
});

test("an unreachable server is reported as such, not as a wrong password", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
  const error = await login({ email: "a@example.invalid", password: "x" }).catch((e) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(0);
  expect(error.message).toMatch(/Can't reach the movie server/);
});

test("getMovies returns the whole page envelope with the bearer token", async () => {
  const fetchMock = respond(200, { movies: [], page: 2, pageSize: 8, total: 9 });
  await expect(getMovies(2, 8, "synthetic-token")).resolves.toEqual({ movies: [], page: 2, pageSize: 8, total: 9 });
  expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/movies\?page=2&pageSize=8$/), { headers: { Authorization: "Bearer synthetic-token" } });
});
