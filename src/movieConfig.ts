import { LayoutGrid, List } from "lucide-react";

export const HIGH_RATING_THRESHOLD = 8;

// The default year and the year options both come from the clock, so they
// cannot drift apart or go stale in January.
const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from(
  { length: 7 },
  (_, index) => CURRENT_YEAR - index,
);

export const MOVIE_SORT = {
  RATING_DESC: {
    value: "vote_average.desc",
    label: "Rating: high to low",
  },
  RATING_ASC: {
    value: "vote_average.asc",
    label: "Rating: low to high",
  },
  POPULARITY_DESC: {
    value: "popularity.desc",
    label: "Popularity: high to low",
  },
  POPULARITY_ASC: {
    value: "popularity.asc",
    label: "Popularity: low to high",
  },
} as const;

export type MovieSort = (typeof MOVIE_SORT)[keyof typeof MOVIE_SORT]["value"];

export const DEFAULT_MOVIE_QUERY = {
  year: CURRENT_YEAR,
  sortBy: MOVIE_SORT.RATING_DESC.value,
  genreId: null,
};

export const MOVIE_VIEW = {
  GRID: {
    value: "grid",
    label: "Grid view",
    icon: LayoutGrid,
  },
  LIST: {
    value: "list",
    label: "List view",
    icon: List,
  },
} as const;

export type MovieView = (typeof MOVIE_VIEW)[keyof typeof MOVIE_VIEW]["value"];
