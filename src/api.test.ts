import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGenres, fetchMovies } from "./api";
import type { Movie } from "./types";

const movie: Movie = {
  id: 1,
  title: "Test movie",
  vote_average: 8.5,
  vote_count: 100,
  popularity: 20,
  poster_path: "/poster.jpg",
  release_date: "2026-01-01",
  overview: "A movie overview.",
};

const query = { year: 2026, genreId: null };
const signal = () => new AbortController().signal;

function respond(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchMovies", () => {
  it("requests page one with year, genre and the caller's abort signal", async () => {
    const fetchMock = respond({ results: [movie] });
    const requestSignal = signal();
    await expect(fetchMovies({ year: 2025, genreId: 35 }, requestSignal)).resolves.toEqual([movie]);
    const [url, options] = fetchMock.mock.calls[0];
    const request = new URL(url);
    expect(request.pathname).toBe("/3/discover/movie");
    expect(request.searchParams.get("page")).toBe("1");
    expect(request.searchParams.get("primary_release_year")).toBe("2025");
    expect(request.searchParams.get("with_genres")).toBe("35");
    expect(request.searchParams.has("sort_by")).toBe(false);
    expect(request.searchParams.get("api_key")).toBeTruthy();
    expect(options.signal).toBe(requestSignal);
  });

  it("omits the genre filter for All", async () => {
    const fetchMock = respond({ results: [] });
    await expect(fetchMovies(query, signal())).resolves.toEqual([]);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has("with_genres")).toBe(false);
  });

  it("accepts nullable movie fields without discarding valid movies", async () => {
    const nullable = { ...movie, id: 2, poster_path: null, release_date: null, overview: null };
    respond({ results: [movie, nullable] });
    await expect(fetchMovies(query, signal())).resolves.toEqual([movie, nullable]);
  });

  it.each([null, {}, { results: null }, { results: {} }])(
    "rejects an invalid response envelope: %j",
    async (body) => {
      respond(body);
      await expect(fetchMovies(query, signal())).rejects.toThrow("Invalid response format");
    },
  );

  it.each([
    { title: " " },
    { id: -1 },
    { vote_average: 11 },
    { vote_count: 1.5 },
    { popularity: -1 },
    { release_date: 123 },
    { overview: {} },
    { poster_path: false },
  ])("rejects invalid movie fields: %j", async (invalid) => {
    respond({ results: [{ ...movie, ...invalid }] });
    await expect(fetchMovies(query, signal())).rejects.toThrow("Invalid movie format");
  });

  it("rejects an HTTP error instead of treating it as an empty result", async () => {
    respond({ status_message: "Unavailable" }, 503);
    await expect(fetchMovies(query, signal())).rejects.toThrow("503");
  });

  it("propagates cancellation to the pending fetch", async () => {
    vi.stubGlobal("fetch", vi.fn((_url: string, options: RequestInit) =>
      new Promise((_resolve, reject) => {
        options.signal?.addEventListener("abort", () => reject(options.signal?.reason), { once: true });
      }),
    ));
    const controller = new AbortController();
    const pending = fetchMovies(query, controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await assertion;
  });
});

describe("fetchGenres", () => {
  it("validates and returns the genre list", async () => {
    const genres = [{ id: 35, name: "Comedy" }];
    const fetchMock = respond({ genres });
    await expect(fetchGenres(signal())).resolves.toEqual(genres);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe("/3/genre/movie/list");
  });

  it("rejects malformed genre records", async () => {
    respond({ genres: [{ id: 35, name: " " }] });
    await expect(fetchGenres(signal())).rejects.toThrow("Invalid genre format");
  });
});
