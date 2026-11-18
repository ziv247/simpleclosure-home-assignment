import "./MovieDialog.css";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { X } from "lucide-react";
import type { Movie } from "../../types";

type MovieDialogProps = {
  movie: Movie;
  onClose: () => void;
};

const RELEASE_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const CLOSE_ANIMATION_MS = 220;

function formatReleaseDate(value: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "Not available";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDate ? RELEASE_DATE.format(date) : "Not available";
}

export default function MovieDialog({ movie, onClose }: MovieDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [imageFailed, setImageFailed] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // React detaches the dialog before this cleanup runs, so the native
    // focus restoration never happens. Remember the opener and restore it.
    const opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    if (!closing) return;

    const dialog = dialogRef.current;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onCloseRef.current();
    };

    const timeout = window.setTimeout(finish, CLOSE_ANIMATION_MS + 40);
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== dialog || event.propertyName !== "opacity") return;
      window.clearTimeout(timeout);
      finish();
    };

    dialog?.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      window.clearTimeout(timeout);
      dialog?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [closing]);

  const requestClose = () => {
    if (closing) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      onClose();
      return;
    }

    setClosing(true);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const insideDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!insideDialog) requestClose();
  };

  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <dialog
      ref={dialogRef}
      className="movie-dialog"
      aria-labelledby="movie-dialog-title"
      data-closing={closing ? "true" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={handleBackdropClick}>
      <div className="movie-dialog-header">
        <div className="movie-dialog-poster">
          {imageFailed || !movie.poster_path ? (
            <div className="image-failed">
              <p>{imageFailed ? "Image failed to load" : "Poster unavailable"}</p>
            </div>
          ) : (
            <img src={posterUrl} alt="" onError={() => setImageFailed(true)} />
          )}
        </div>

        <div className="movie-dialog-heading">
          <div className="movie-dialog-heading-top">
            <p className="movie-dialog-eyebrow">Movie details</p>
            <button
              type="button"
              className="movie-dialog-close"
              onClick={requestClose}
              aria-label="Close movie details"
              autoFocus>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <h2 id="movie-dialog-title">{movie.title}</h2>
        </div>
      </div>

      <dl className="movie-dialog-meta">
        <div>
          <dt>Release date</dt>
          <dd>{formatReleaseDate(movie.release_date)}</dd>
        </div>

        <div>
          <dt>Audience rating</dt>
          <dd>
            {movie.vote_count > 0
              ? `${movie.vote_average.toFixed(1)} / 10`
              : "Not rated"}
          </dd>
        </div>
      </dl>

      <section className="movie-dialog-overview">
        <h3>Overview</h3>
        <p>{movie.overview?.trim() || "No overview available."}</p>
      </section>
    </dialog>
  );
}
