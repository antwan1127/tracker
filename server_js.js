const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "locations.json");

function saveLocation(entry) {
  let data = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (err) {
    data = [];
  }

  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.send("Location API is running.");
});

app.post("/location", (req, res) => {
  const { lat, lng, accuracy, consent } = req.body;

  if (consent !== true) {
    return res.status(400).json({
      success: false,
      message: "Consent is required before storing location data.",
    });
  }

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof accuracy !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid location data.",
    });
  }

  const entry = {
    lat,
    lng,
    accuracy,
    timestamp: new Date().toISOString(),
  };

  try {
    saveLocation(entry);
    return res.json({
      success: true,
      message: "Location saved successfully.",
      data: entry,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to save location.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});