import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MOVIES } from "../data/movies";
import api from "../api";

const MovieDetails = ({ apiCache = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const castRef = useRef(null);

  const [cast, setCast] = useState([]);
  const [movie, setMovie] = useState(null);


  useEffect(() => {
  const localMovie = MOVIES.find((m) => String(m.id) === id);
  const cachedMovie = apiCache.find((m) => String(m.id) === id);

  if (localMovie) {
    setMovie(localMovie);
    return;
  }

  if (cachedMovie) {
    setMovie(cachedMovie);
    return;
  }

  api
    .get(`/shows/${id}`)
    .then((res) => {
      const show = res.data;
      setMovie({
        id: show.id,
        title: show.name,
        year: show.premiered?.split("-")[0],
        genre: show.genres?.join(" • "),
        rating: show.rating?.average ?? null,
        image: show.image?.medium || "/placeholder.jpg",
        backdrop: show.image?.original || show.image?.medium,
        cast: true,
        description: show.summary
          ? show.summary.replace(/<[^>]+>/g, "")
          : "No description available",
      });
    })
    .catch(() => setMovie(null));
}, [id, apiCache]);

useEffect(() => {
  if (!movie?.id) return;

  api
    .get(`/shows/${movie.id}/cast`)
    .then((res) => setCast(res.data.slice(0, 20)))
    .catch(() => setCast([]));
}, [movie?.id]);


  const handleWatch = () => {
    const q = encodeURIComponent(`${movie.title} official trailer`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank");
  };

  const scrollCast = (dir) => {
    castRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center">
        Movie not found
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundImage: `url(${movie.backdrop || movie.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🎬 CINEMATIC GRADIENTS */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />

      {/* ⬅ BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="
          fixed top-5 left-5 z-30
          flex items-center gap-2
          px-4 py-2
          rounded-full
          bg-[#1a0007]/90 backdrop-blur-md
          text-sm font-medium
          text-white
          shadow-xl
          hover:bg-[#36000d]
          transition
        "
      >
        ← Back
      </button>

      {/* CONTENT */}
      <main className="relative z-10 px-4 sm:px-10 pt-24 md:pt-32 pb-16 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-12">
        {/* POSTER */}
        <div className="flex justify-center md:justify-start">
          <div className="w-64 md:w-72">
            <div className="relative aspect-2/3 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
              <img
                src={movie.image}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">
            {movie.title}
          </h1>

          <p className="text-sm md:text-base text-gray-300/90 mb-6">
            {movie.year} • {movie.genre} • ★ {movie.rating ?? "—"}
          </p>

          {/* ACTIONS */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleWatch}
              className="
                px-6 py-2.5
                bg-[#36000d]
                text-white
                font-semibold
                rounded-lg
                shadow-md
                hover:bg-[#8d004b]
                transition
              "
            >
              ▶ Watch Trailer
            </button>

            <button
              className="
                px-6 py-2.5
                border border-white/20
                rounded-lg
                text-gray-200
                hover:bg-white
                hover:text-black
                transition
              "
            >
              + Watch Later
            </button>
          </div>

          {/* OVERVIEW */}
          <p className="text-base md:text-lg text-gray-200/90 leading-relaxed mb-12 max-w-3xl">
            {movie.description}
          </p>

          {/* CAST */}
          {cast.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-5 text-white">Cast</h2>

              <div className="relative max-w-225">
                {cast.length > 5 && (
                  <button
                    onClick={() => scrollCast("left")}
                    className="
                      hidden md:flex
                      absolute -left-5 top-1/2 -translate-y-1/2
                      w-9 h-9
                      rounded-full
                      items-center justify-center
                      bg-[#120005]/80 backdrop-blur
                      text-white text-lg
                      shadow-lg
                      hover:bg-[#36000d]
                      transition
                    "
                  >
                    ◂
                  </button>
                )}

                <div
                  ref={castRef}
                  className="flex gap-4 overflow-x-auto md:overflow-hidden scroll-smooth no-scrollbar"
                >
                  {cast.map(({ person, character }) => (
                    <div
                      key={`${person.id}-${character?.id || character?.name}`}
                      className="w-32 flex-shrink-0 text-center"
                    >
                      <img
                        src={person.image?.medium || "/placeholder.jpg"}
                        alt={person.name}
                        className="w-full h-44 object-cover rounded-lg mb-2 shadow-md"
                      />

                      <p className="text-sm font-medium text-white leading-tight">
                        {person.name}
                      </p>

                      <p className="text-xs text-gray-400 leading-tight">
                        {character?.name}
                      </p>
                    </div>
                  ))}
                </div>

                {cast.length > 5 && (
                  <button
                    onClick={() => scrollCast("right")}
                    className="
                      hidden md:flex
                      absolute -right-5 top-1/2 -translate-y-1/2
                      w-9 h-9
                      rounded-full
                      items-center justify-center
                      bg-[#120005]/80 backdrop-blur
                      text-white text-lg
                      shadow-lg
                      hover:bg-[#36000d]
                      transition
                    "
                  >
                    ▸
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
