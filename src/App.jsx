import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { MOVIES } from "./data/movies";
import MovieRow from "./components/MovieRow";
import MovieDetails from "./pages/MovieDetails";
import api from "./api";

const App = () => {
  const navigate = useNavigate();

  /* ───────── STATE ───────── */
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  const [apiShows, setApiShows] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showMobileSearch, setShowMobileSearch] = useState(false);


  /* HERO */
  const [heroIndex, setHeroIndex] = useState(0);

  /* ───────── WATCHLIST ───────── */
  useEffect(() => {
    setWatchlist(
      JSON.parse(localStorage.getItem("cinevoxa_watchlist") || "[]")
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("cinevoxa_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  /* ───────── FETCH HOME API ───────── */
  useEffect(() => {
    api.get("/shows").then((res) => {
      const normalized = res.data.map((show) => ({
        id: show.id,
        title: show.name,
        year: show.premiered?.split("-")[0],
        genre: show.genres?.join(" • "),
        rating: show.rating?.average ?? null,
        language: show.language,
        image: show.image?.medium || "/placeholder.jpg",
        backdrop: show.image?.original || show.image?.medium,
        description: show.summary
          ? show.summary.replace(/<[^>]+>/g, "")
          : "No description",
      }));

      setApiShows(normalized);
    });
  }, []);

  /* ───────── HERO LIST (LOCAL → API) ───────── */
  const heroList = useMemo(() => {
    const localHeroes = MOVIES.filter((m) => m.isFeatured || m.isTrending);

    return [
      ...localHeroes,
      ...apiShows.filter(
        (api) => !localHeroes.some((local) => local.id === api.id)
      ),
    ];
  }, [apiShows]);

  const heroMovie =
    heroList.length > 0 ? heroList[heroIndex % heroList.length] : null;

  /* ───────── HERO AUTO ROTATE ───────── */
  useEffect(() => {
    if (!heroList.length) return;

    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroList.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [heroList.length]);

  /* ───────── SEARCH ───────── */
  useEffect(() => {
    if (!search.trim()) {
      setApiResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/search/shows?q=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );

        const normalized = res.data.map(({ show }) => ({
          id: show.id,
          title: show.name,
          year: show.premiered?.split("-")[0] || "—",
          genre: show.genres?.join(" • ") || "—",
          rating: show.rating?.average ?? null,
          image: show.image?.medium || "/placeholder.jpg",
          backdrop: show.image?.original || show.image?.medium,
          language: show.language,
          description: show.summary
            ? show.summary.replace(/<[^>]+>/g, "")
            : "No description available",
        }));

        setApiResults(normalized);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setApiResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search]);

  const watchlistMovies = MOVIES.filter((m) => watchlist.includes(m.id));

  const toggleWatchlist = (id) =>
    setWatchlist((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id]
    );

  /* ───────── ROUTES ───────── */
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen bg-[#07060a] text-[#f5f5f7]">
            {/* HEADER */}
<header className="
  sticky top-0 z-50
  flex items-center justify-between
  px-4 sm:px-10 py-4
  backdrop-blur-2xl
  bg-gradient-to-r from-white/10 via-white/5 to-white/10
  border-b border-white/20
  shadow-[0_8px_30px_rgba(0,0,0,0.35)]
">
  {/* LOGO */}
  <h1
    onClick={() => window.location.reload()}
    className="
      cursor-pointer
      text-2xl sm:text-3xl
      font-['Bebas_Neue']
      tracking-[0.25em]
      text-[#b11226]
      drop-shadow-[0_2px_12px_rgba(177,18,38,0.45)]
      hover:tracking-[0.32em]
      transition-all
    "
  >
    CINEVOXA
  </h1>

  {/* SEARCH */}
  <div className="relative flex items-center">
    {/* DESKTOP SEARCH */}
    <input
      type="text"
      placeholder="Search movies, shows..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        hidden sm:block
        w-56 h-9 px-4 text-sm
        bg-[#14121a]/70 backdrop-blur
        border border-white/15
        rounded-full
        text-[#f5f5f7]
        placeholder-gray-400
        focus:outline-none
        focus:border-[#b11226]
        focus:ring-1 focus:ring-[#b11226]/40
        transition
      "
    />

    {/* MOBILE SEARCH ICON */}
    <button
      onClick={() => setShowMobileSearch(true)}
      className="
        sm:hidden
        w-9 h-9
        flex items-center justify-center
        rounded-full
        bg-white/10
        hover:bg-white/20
        transition
      "
    >
      ⌕
    </button>
  </div>

  {/* MOBILE SEARCH OVERLAY */}
  {showMobileSearch && (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 pt-5">
        <input
          autoFocus
          type="text"
          placeholder="Search movies, shows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1 h-10 px-4 text-sm
            bg-[#14121a]
            border border-white/20
            rounded-full
            text-white
            placeholder-gray-400
            focus:outline-none
            focus:border-[#b11226]
          "
        />

        <button
          onClick={() => setShowMobileSearch(false)}
          className="
            text-white text-xl
            px-2
          "
        >
          ✕
        </button>
      </div>
    </div>
  )}
</header>


            {/* HERO */}
            {!search && heroMovie && (
              <section
                key={heroMovie.id}
                className="relative min-h-[65vh] sm:min-h-[75vh] flex items-end px-5 sm:px-10 pb-12 sm:pb-20 bg-cover transition-opacity duration-700"
                style={{
                  backgroundImage: `url(${heroMovie.backdrop})`,
                  backgroundPosition: "center",
                }}
              >
                {/* DARK CINEMATIC GRADIENT */}
                <div className="absolute inset-0 bg-linear-to-t from-[#07060a]/95 via-[#07060a]/70 to-transparent" />

                <div className="relative z-10 max-w-xl">
                  <h2 className="text-3xl sm:text-5xl font-extrabold mb-3">
                    {heroMovie.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 mb-4">
                    {heroMovie.genre && (
                      <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur">
                        {heroMovie.genre}
                      </span>
                    )}

                    {typeof heroMovie.rating === "number" && (
                      <span className="flex items-center gap-1 text-yellow-400 font-medium">
                        ★ {heroMovie.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-gray-300 mb-6 line-clamp-3">
                    {heroMovie.description}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/movie/${heroMovie.id}`)}
                      className="
                        px-6 py-3
                        bg-[#b11226]
                        text-[#f5f5f7]
                        rounded-lg
                        shadow-lg shadow-[#b11226]/30
                        hover:bg-[#8f0f1f]
                        hover:scale-105
                        transition
                      "
                    >
                       More Info
                    </button>

                    <button
                      onClick={() => toggleWatchlist(heroMovie.id)}
                      className="
                        px-6 py-3
                        border border-white/20
                        rounded-lg
                        hover:bg-white hover:text-black
                        transition
                      "
                    >
                      + Watchlist
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* CONTENT */}
            <br></br>
            <section className="px-6 sm:px-10 pb-14 space-y-12">
              {search && (
                <>
                  <h2 className="text-xl font-semibold">
                    Search Results for "{search}"
                  </h2>
                  <MovieRow title="" movies={apiResults} />
                  {!loading && apiResults.length === 0 && (
                    <p className="text-gray-400 text-sm">No results found.</p>
                  )}
                </>
              )}

              {!search && (
                <>
                  {watchlistMovies.length > 0 && (
                    <MovieRow title="My Watchlist" movies={watchlistMovies} />
                  )}

                  <MovieRow title="Trending" movies={apiShows.slice(0, 15)} />

                  <MovieRow title="Personal Favorite" movies={MOVIES} />

                  <MovieRow
                    title="Top Rated"
                    movies={[...apiShows]
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                      .slice(0, 15)}
                  />

                  <MovieRow
                    title="Hidden Gems"
                    movies={apiShows
                      .filter((m) => m.rating && m.rating >= 7)
                      .slice(0, 15)}
                  />

                  <MovieRow
                    title="International Hits"
                    movies={apiShows
                      .filter((m) => m.language && m.language !== "English")
                      .slice(0, 12)}
                  />
                </>
              )}
            </section>

            {/* FOOTER */}
            <footer className="mt-16 pb-6">
              <div className="text-xs text-gray-400 text-center tracking-wide">
                © {new Date().getFullYear()} CINEVOXA <br />
                Made with ❤️ by{" "}
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white underline underline-offset-2 transition"
                >
                  Vishal Rajbhar
                </a>
              </div>
            </footer>
          </main>
        }
      />

      <Route
        path="/movie/:id"
        element={<MovieDetails apiCache={[...apiShows, ...apiResults]} />}
      />
    </Routes>
  );
};

export default App;
