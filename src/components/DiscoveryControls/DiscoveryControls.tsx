import "./DiscoveryControls.css";
import GenreSelect from "../GenreSelect";
import {
  DEFAULT_MOVIE_QUERY,
  MOVIE_SORT,
  MOVIE_VIEW,
  YEAR_OPTIONS,
  type MovieSort,
  type MovieView,
} from "../../movieConfig";

type DiscoveryControlsProps = {
  year: number;
  sortBy: MovieSort;
  onYearChange: (year: number) => void;
  onSortChange: (sortBy: MovieSort) => void;
  genreId: number | null;
  onGenreChange: (genreId: number | null) => void;
  onResetFilters: () => void;
  view: MovieView;
  onViewChange: (view: MovieView) => void;
};

export default function DiscoveryControls({
  year,
  sortBy,
  onYearChange,
  onSortChange,
  genreId,
  onGenreChange,
  onResetFilters,
  view,
  onViewChange,
}: DiscoveryControlsProps) {
  const isDefaultQuery =
    year === DEFAULT_MOVIE_QUERY.year &&
    sortBy === DEFAULT_MOVIE_QUERY.sortBy &&
    genreId === DEFAULT_MOVIE_QUERY.genreId;
  return (
    <div className="filters">
      <div className="filters-fields">
        <div className="filter-group">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}>
            {YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <GenreSelect value={genreId} onChange={onGenreChange} />
        </div>
        <div className="filter-group filter-group--sort">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(event) => {
              const selectedOption = Object.values(MOVIE_SORT).find(
                (option) => option.value === event.currentTarget.value,
              );

              if (selectedOption) {
                onSortChange(selectedOption.value);
              }
            }}>
            {Object.values(MOVIE_SORT).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="filters-actions">
        <div
          className="view-toggle"
          role="group"
          aria-label="Movie layout"
          data-view={view}>
          {Object.values(MOVIE_VIEW).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={view === value}
              onClick={() => onViewChange(value)}>
              <Icon size={20} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={onResetFilters}
          disabled={isDefaultQuery}>
          Reset Filters
        </button>
      </div>
    </div>
  );
}
