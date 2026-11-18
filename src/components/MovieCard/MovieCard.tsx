import "./MovieCard.css";
import { HIGH_RATING_THRESHOLD } from "../../movieConfig";
import type { Movie } from "../../types";
import { useState } from "react";

type MovieCardProps = {
  movie: Movie;
  onSelect: (movie: Movie) => void;
};

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  const handleImageError = () => {
    setImageFailed(true);
  };

  const releaseYear = movie.release_date?.match(/^\d{4}/)?.[0] ?? null;
  const ratingText = movie.vote_average.toFixed(1);
  const isRated = movie.vote_count > 0;

  // Match the rounded rating shown on the card.
  const isHighlyRated =
    isRated && Number(ratingText) >= HIGH_RATING_THRESHOLD;

  return (
    <li className="movie-card">
      <div className="movie-poster">
        {imageFailed || !movie.poster_path ? (
          <div className="image-failed">
            <p>{imageFailed ? "Image failed to load" : "Poster unavailable"}</p>
          </div>
        ) : (
          <img src={posterUrl} alt="" onError={handleImageError} />
        )}
      </div>
      <div className="movie-info">
        <h2>{movie.title}</h2>
        <p className="movie-year">{releaseYear ?? "Year unavailable"}</p>
        <p
          className="movie-rating"
          data-rating={isHighlyRated ? "high" : "standard"}>
          {isRated ? `Rating: ${ratingText} / 10` : "Not rated"}
        </p>
      </div>
      <div className="movie-actions">
        <button
          className="button button--secondary"
          type="button"
          aria-label={`View details for ${movie.title}`}
          onClick={() => onSelect(movie)}>
          View Details
        </button>
      </div>
    </li>
  );
}
