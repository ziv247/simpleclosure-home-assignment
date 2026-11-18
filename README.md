# Movie Explorer

A TMDB movie browser built for the SimpleClosure take-home assignment. Filter by year and genre, sort the results, switch between a grid and a list, and open movie details.

Built with React, TypeScript, Vite and plain CSS. Icons come from `lucide-react`.

## Run locally

Use Node 24 LTS (`nvm use` if you use nvm). Supported versions are listed in `package.json`.

```sh
npm i && npm start
```

Open http://localhost:5173/.

No environment file is required. The TMDB key supplied with the assignment is included as a fallback. To override it, copy `.env.example` to `.env` and set `VITE_TMDB_API_KEY`.

## Checks

```sh
npm test
npm run lint
npm run build
```

Vitest tests cover sorting in both directions, tie-breaking, input immutability, API query parameters, nullable fields, malformed responses, HTTP errors and request cancellation. UI behaviour is checked manually; there is no automated browser test suite.

## Structure

- `src/App.tsx` owns movie data, filters, sorting, layout and selection. It renders loading, error, empty and success states.
- `src/api.ts` builds requests and validates API responses at runtime.
- `src/types.ts` defines the movie, genre and query types.
- `src/movieConfig.ts` contains filter options and display defaults.
- `src/sortMovie.ts` sorts a copy of the fetched movies.
- `src/components/` contains the controls, genre selector, cards and details dialog. Component styles sit alongside their components.
- `src/index.css` contains shared styles and colour tokens; `src/App.css` handles page layout.
- `src/*.test.ts` contains the unit tests.

## Decisions and tradeoffs

**One page, filtered on the API.** Requests use `/discover/movie` with `page=1`, `primary_release_year` and an optional `with_genres`. The genre options come from `/genre/movie/list`. This keeps the scope close to the brief.

**Local sorting.** Rating and popularity sort numerically in either direction without another request. Equal ratings use the larger vote count first. Sorting works on a copy so the fetched array is not mutated. It only reorders the returned page, not the entire TMDB catalogue.

**Ratings.** A movie with no votes displays “Not rated”; its API rating still determines its numeric sort position. A rated movie whose displayed rating is at least 8.0 gets a larger, highlighted badge. There is no minimum vote count for sorting or highlighting.

**Response validation.** Data is checked before entering application state. Null posters, dates and overviews are accepted and get UI fallbacks. An invalid envelope or a record with invalid required data rejects the request and shows a retry action. A future improvement would preserve valid records from a partially malformed response, with logging for the rejected records.

**Request lifecycle.** Each fetch effect has an `AbortController`. Cleanup cancels the old request, and state updates check whether it was aborted so an old response cannot overwrite newer filters.

**Native controls and dialog.** Selects and buttons retain their native keyboard behaviour. The details view uses `<dialog>` for modal focus and Escape handling, restores focus to its opener, and respects reduced-motion preferences.

**API key.** The supplied assignment key makes setup immediate. Both a hardcoded key and a `VITE_*` environment variable are visible in a browser bundle. A production application that needs to keep credentials private would use a server-side proxy.

## With more time

- Add browser tests for rapid filter changes, retries and keyboard navigation.
- Add server-side sorting and pagination if browsing beyond the first page becomes a requirement.
