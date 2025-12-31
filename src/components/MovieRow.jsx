import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const MovieRow = ({ title, movies = [] }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);

  if (!movies.length) return null;

  const scroll = (direction) => {
    if (!rowRef.current) return;

    const scrollAmount = 360;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative mb-10">
      {/* TITLE */}
      <h3 className="text-lg md:text-xl font-semibold mb-4 px-1 flex items-center gap-2">
        {title}
        <span className="text-sm text-gray-400">›</span>
      </h3>

      {/* LEFT ARROW (DESKTOP) */}
      {movies.length > 5 && (
        <button
          onClick={() => scroll("left")}
          className="
            hidden md:flex
            absolute left-2 top-1/2 -translate-y-1/2 z-10
            w-9 h-9
            items-center justify-center
            rounded-full
            bg-[#36000d]
            text-white text-lg
            shadow-lg
            hover:bg-black/80 hover:scale-110
            transition
          "
        >
          ◂
        </button>
      )}

      {/* RIGHT ARROW (DESKTOP) */}
      {movies.length > 5 && (
        <button
          onClick={() => scroll("right")}
          className="
            hidden md:flex
            absolute right-2 top-1/2 -translate-y-1/2 z-10
            w-9 h-9
            items-center justify-center
            rounded-full
            bg-[#36000d]
            text-white text-lg
            shadow-lg
            hover:bg-black/80 hover:scale-110
            transition
          "
        >
          ▸
        </button>
      )}

      {/* MOVIE ROW */}
      <div
        ref={rowRef}
        className="
          flex gap-3 md:gap-5
          overflow-x-auto md:overflow-hidden
          scroll-smooth
          hide-scrollbar
          snap-x snap-mandatory
          px-1
        "
      >
        {movies.map((movie) => {
          const { id, title, image, year, genre, rating } = movie;

          return (
            <div
              key={id}
              className="
                snap-start
                flex-shrink-0
                w-27.5 md:w-48
              "
            >
              {/* POSTER (HOVER ONLY HERE) */}
              <div
                onClick={() => navigate(`/movie/${id}`)}
                className="
                  relative
                  rounded-xl
                  overflow-hidden
                  shadow-lg
                  cursor-pointer
                "
              >
                <img
                  src={image || "/placeholder.jpg"}
                  alt={title}
                  className="
                    w-full
                    h-40 md:h-72
                    object-cover
                    rounded-xl
                    transition-transform duration-300
                    hover:scale-105
                  "
                />

                {/* DESKTOP PLAY OVERLAY */}
                <div className="
                  hidden md:flex
                  absolute inset-0
                  bg-gradient-to-t from-black/80 via-black/20 to-transparent
                  opacity-0 hover:opacity-100
                  transition
                  items-end p-3
                ">
                  <button className="w-full py-2 bg-white text-black text-sm font-semibold rounded">
                    ▶ Play
                  </button>
                </div>
              </div>

              {/* INFO (NO HOVER EFFECTS AT ALL) */}
              <div className="mt-2 px-0.5">
                <h4
                  onClick={() => navigate(`/movie/${id}`)}
                  className="text-xs md:text-sm font-medium leading-tight cursor-pointer"
                >
                  {title}
                </h4>

                {(year || genre || typeof rating === "number") && (
                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                    {year && `${year} • `}
                    {genre && `${genre} • `}
                    {typeof rating === "number" && `★ ${rating.toFixed(1)}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MovieRow;
