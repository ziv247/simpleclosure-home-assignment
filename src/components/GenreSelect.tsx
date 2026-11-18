import { useEffect, useState } from "react";
import type { Genre } from "../types";
import { fetchGenres } from "../api";

type GenreSelectProps = {
  value: number | null;
  onChange: (genreId: number | null) => void;
};

export default function GenreSelect({ value, onChange }: GenreSelectProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadGenres = async () => {
      try {
        setGenresLoading(true);
        setGenresError(null);
        const fetchedGenres = await fetchGenres(controller.signal);
        if (!controller.signal.aborted) {
          setGenres(fetchedGenres);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading genres:", error);
          setGenresError(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setGenresLoading(false);
        }
      }
    };
    loadGenres();
    return () => controller.abort();
  }, [retryCount]);

  return (
    <>
      <label htmlFor="genre">Genre</label>
      <select
        id="genre"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={genresLoading || genresError !== null}>
        <option value="">All</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>

      {genresLoading ? (
        <p role="status">Loading...</p>
      ) : genresError ? (
        <>
          <p role="alert" className="error">
            Genres could not be loaded.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setRetryCount((prev) => prev + 1)}>
            Try Again
          </button>
        </>
      ) : genres.length === 0 ? (
        <p>No genres found</p>
      ) : null}
    </>
  );
}
