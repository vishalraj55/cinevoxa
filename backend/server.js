const express = require("express");
const cors = require("cors");

const showsRoutes = require("./routes/shows");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/shows", showsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
