import type { Genre, Movie, MovieQuery } from "./types";

// The assignment key lets reviewers run the app without extra setup.
// Browser-side VITE_* values are public, including values set through .env.
const API_KEY =
  import.meta.env.VITE_TMDB_API_KEY || "62df2cd3a4881de6558bc68cd67cca20";
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchMovies(
  query: MovieQuery,
  signal: AbortSignal,
): Promise<Movie[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    page: "1",
    primary_release_year: String(query.year),
  });

  if (query.genreId !== null) {
    params.set("with_genres", String(query.genreId));
  }

  const response = await fetch(`${BASE_URL}/discover/movie?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText} ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("results" in data) ||
    !Array.isArray(data.results)
  ) {
    throw new Error("Invalid response format");
  }

  const movies: Movie[] = [];
  for (const movie of data.results) {
    if (!isMovie(movie)) {
      throw new Error("Invalid movie format");
    }
    movies.push(movie);
  }
  return movies;
}

export async function fetchGenres(signal: AbortSignal): Promise<Genre[]> {
  const params = new URLSearchParams({ api_key: API_KEY });
  const response = await fetch(`${BASE_URL}/genre/movie/list?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch genres: ${response.statusText} ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("genres" in data) ||
    !Array.isArray(data.genres)
  ) {
    throw new Error("Invalid response format");
  }

  const genres: Genre[] = [];
  for (const genre of data.genres) {
    if (!isGenre(genre)) {
      throw new Error("Invalid genre format");
    }
    genres.push(genre);
  }
  return genres;
}

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isMovie = (value: unknown): value is Movie =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  Number.isInteger(value.id) &&
  value.id > 0 &&
  "title" in value &&
  typeof value.title === "string" &&
  value.title.trim().length > 0 &&
  "poster_path" in value &&
  isNullableString(value.poster_path) &&
  "release_date" in value &&
  isNullableString(value.release_date) &&
  "overview" in value &&
  isNullableString(value.overview) &&
  "vote_average" in value &&
  typeof value.vote_average === "number" &&
  value.vote_average >= 0 &&
  value.vote_average <= 10 &&
  "vote_count" in value &&
  typeof value.vote_count === "number" &&
  Number.isInteger(value.vote_count) &&
  value.vote_count >= 0 &&
  "popularity" in value &&
  typeof value.popularity === "number" &&
  Number.isFinite(value.popularity) &&
  value.popularity >= 0;

const isGenre = (value: unknown): value is Genre =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  Number.isInteger(value.id) &&
  value.id > 0 &&
  "name" in value &&
  typeof value.name === "string" &&
  value.name.trim().length > 0;
