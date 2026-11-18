import { describe, expect, it } from "vitest";
import { sortMovies } from "./sortMovie";
import { MOVIE_SORT } from "./movieConfig";
import type { Movie } from "./types";

const movie = (id: number, rating: number, votes: number, popularity = 0): Movie => ({
  id,
  title: `Movie ${id}`,
  vote_average: rating,
  vote_count: votes,
  popularity,
  poster_path: null,
  release_date: null,
  overview: null,
});

const movies = [
  movie(1, 6, 500, 80),
  movie(2, 9.1, 26, 15),
  movie(3, 8.6, 8900, 40),
  movie(4, 0, 0, 2),
];

const ids = (items: Movie[]) => items.map((item) => item.id);

describe("sortMovies", () => {
  it("sorts ratings high to low even when the highest rating has few votes", () => {
    expect(ids(sortMovies(movies, MOVIE_SORT.RATING_DESC.value))).toEqual([2, 3, 1, 4]);
  });

  it("sorts ratings low to high, including zero-vote movies", () => {
    expect(ids(sortMovies(movies, MOVIE_SORT.RATING_ASC.value))).toEqual([4, 1, 3, 2]);
  });

  it.each([MOVIE_SORT.RATING_ASC.value, MOVIE_SORT.RATING_DESC.value])(
    "breaks equal-rating ties by vote count for %s",
    (sort) => {
      const tied = [movie(1, 8, 10), movie(2, 8, 200)];
      expect(ids(sortMovies(tied, sort))).toEqual([2, 1]);
    },
  );

  it("sorts popularity in both directions", () => {
    expect(ids(sortMovies(movies, MOVIE_SORT.POPULARITY_DESC.value))).toEqual([1, 3, 2, 4]);
    expect(ids(sortMovies(movies, MOVIE_SORT.POPULARITY_ASC.value))).toEqual([4, 2, 3, 1]);
  });

  it.each(Object.values(MOVIE_SORT).map(({ value }) => value))(
    "does not mutate the input for %s",
    (sort) => {
      const input = [...movies];
      Object.freeze(input);
      const result = sortMovies(input, sort);
      expect(result).not.toBe(input);
      expect(ids(input)).toEqual([1, 2, 3, 4]);
    },
  );

  it("accepts an empty list", () => {
    expect(sortMovies([], MOVIE_SORT.RATING_DESC.value)).toEqual([]);
  });
});
