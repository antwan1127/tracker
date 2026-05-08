const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/locations", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch locations.",
        });
      }

      return res.json({
        success: true,
        data: data || [],
      });
    } else {
      return res.json({
        success: true,
        data: [],
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations.",
    });
  }
});

app.post("/location", async (req, res) => {
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
    latitude: lat,
    longitude: lng,
    accuracy: accuracy,
    created_at: new Date().toISOString(),
  };

  try {
    // If Supabase is configured, use it; otherwise just return success
    if (supabase) {
      const { data, error } = await supabase
        .from("locations")
        .insert([entry]);

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to save location to database.",
        });
      }

      return res.json({
        success: true,
        message: "Location saved successfully.",
        data: entry,
      });
    } else {
      // Fallback: just log it
      console.log("Location received:", entry);
      return res.json({
        success: true,
        message: "Location received (database not configured).",
        data: entry,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to save location.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (supabase) {
    console.log("✓ Connected to Supabase");
  } else {
    console.log("⚠ Supabase not configured (set SUPABASE_URL and SUPABASE_ANON_KEY)");
  }
});