const express = require("express");
const axios = require("axios");

const router = express.Router();

// Get all shows
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.tvmaze.com/shows");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shows" });
  }
});

// Search shows
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(
      `https://api.tvmaze.com/search/shows?q=${q}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Show details
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.tvmaze.com/shows/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Show not found" });
  }
});

const [cast, setCast] = useState([]);

useEffect(() => {
  api
    .get("/shows") 
    .then((res) => {
      const normalized = res.data.slice(0, 50).map((show) => ({
        id: show.id,
        title: show.name,
        year: show.premiered
          ? show.premiered.split("-")[0]
          : null,
        genre: show.genres?.join(" • "),
        category: show.genres?.[0] || "Series",
        rating: show.rating?.average ?? null,
        image: show.image?.medium || "/placeholder.jpg",
        backdrop:
          show.image?.original ||
          show.image?.medium ||
          "/placeholder.jpg",
        description: show.summary
          ? show.summary.replace(/<[^>]+>/g, "")
          : "No description available",
      }));

      setApiShows(normalized);
    })
    .catch(console.error);
}, []);


module.exports = router;
