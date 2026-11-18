import "./App.css";
import { useState, useEffect } from "react";
import { fetchMovies } from "./api";
import type { Movie } from "./types";
import MovieCard from "./components/MovieCard/MovieCard";
import { MOVIE_VIEW, type MovieSort, type MovieView } from "./movieConfig";
import DiscoveryControls from "./components/DiscoveryControls/DiscoveryControls";
import { DEFAULT_MOVIE_QUERY } from "./movieConfig";
import MovieDialog from "./components/MovieDialog/MovieDialog";
import { sortMovies } from "./sortMovie";

// One TMDB page, so the loading grid is as tall as the results that replace it.
const SKELETON_CARD_COUNT = 20;

function App() {
  //_______Filters_________
  const [year, setYear] = useState(DEFAULT_MOVIE_QUERY.year);
  const [sortBy, setSortBy] = useState<MovieSort>(DEFAULT_MOVIE_QUERY.sortBy);
  const [view, setView] = useState<MovieView>(MOVIE_VIEW.GRID.value);

  //________Movies_________
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moviesRetryCount, setMoviesRetryCount] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  //________Genres_________
  const [genreId, setGenreId] = useState<number | null>(
    DEFAULT_MOVIE_QUERY.genreId,
  );

  const handleResetFilters = () => {
    setYear(DEFAULT_MOVIE_QUERY.year);
    setSortBy(DEFAULT_MOVIE_QUERY.sortBy);
    setGenreId(DEFAULT_MOVIE_QUERY.genreId);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedMovies = await fetchMovies(
          {
            year,
            genreId,
          },
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setMovies(fetchedMovies);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading movies:", error);
          setError("Movies could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadMovies();
    return () => controller.abort();
  }, [year, genreId, moviesRetryCount]);

  const sortedMovies = sortMovies(movies, sortBy);

  // Text for the always-mounted status region. Empty on error, because the
  // visible role="alert" already announces that.
  const statusMessage = loading
    ? "Loading movies"
    : error
      ? ""
      : movies.length === 0
        ? "No movies found"
        : `${movies.length} ${movies.length === 1 ? "movie" : "movies"} found`;

  return (
    <>
      <header className="page-header">
        <h1>
          Movie <em>Explorer</em>
        </h1>
        <p>Explore movies by year and genre. Sort the results your way.</p>
      </header>
      {selectedMovie && (
        <MovieDialog
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
      <main>
        <DiscoveryControls
          year={year}
          sortBy={sortBy}
          onYearChange={setYear}
          onSortChange={setSortBy}
          genreId={genreId}
          onGenreChange={setGenreId}
          onResetFilters={handleResetFilters}
          view={view}
          onViewChange={setView}
        />
        <p className="sr-only" role="status">
          {statusMessage}
        </p>
        {loading ? (
          <div className={`movie-list movie-list--${view}`} aria-hidden="true">
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
              <div key={index} className="movie-card movie-card--skeleton">
                <div className="movie-poster" />
                <div className="movie-info">
                  <div className="skeleton-line skeleton-line--title" />
                  <div className="skeleton-line skeleton-line--year" />
                  <div className="skeleton-line skeleton-line--rating" />
                </div>
                <div className="movie-actions">
                  <div className="skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="results-state">
            <p role="alert">{error}</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setMoviesRetryCount((prev) => prev + 1)}>
              Try Again
            </button>
          </div>
        ) : sortedMovies.length === 0 ? (
          <div className="results-state">
            <p>No movies match these filters.</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          // role="list" keeps the semantics in Safari, which drops them from a
          // list styled with list-style: none.
          <ul className={`movie-list movie-list--${view}`} role="list">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
              />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export default App;
