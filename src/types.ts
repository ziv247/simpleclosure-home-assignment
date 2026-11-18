export type Movie = {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
  popularity: number;
};

export type MovieQuery = {
  year: number;
  genreId: number | null;
};

export type Genre = {
  id: number;
  name: string;
};
