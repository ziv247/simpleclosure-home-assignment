import { MOVIE_SORT, type MovieSort } from "./movieConfig";
import type { Movie } from "./types";

// Vote count only breaks ties; the numeric rating determines the order.
const byRating = (direction: 1 | -1) => (a: Movie, b: Movie) =>
  direction * (a.vote_average - b.vote_average) ||
  b.vote_count - a.vote_count;

export const sortMovies = (movies: Movie[], sortBy: MovieSort): Movie[] => {
  const sortedMovies = [...movies];

  switch (sortBy) {
    case MOVIE_SORT.RATING_DESC.value:
      return sortedMovies.sort(byRating(-1));
    case MOVIE_SORT.RATING_ASC.value:
      return sortedMovies.sort(byRating(1));
    case MOVIE_SORT.POPULARITY_DESC.value:
      return sortedMovies.sort((a, b) => b.popularity - a.popularity);
    case MOVIE_SORT.POPULARITY_ASC.value:
      return sortedMovies.sort((a, b) => a.popularity - b.popularity);
  }
};
