// Without this, import.meta.env.VITE_TMDB_API_KEY is `any` through Vite's
// index signature. "vite/client" itself comes from tsconfig.app.json "types".
interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY?: string;
}
