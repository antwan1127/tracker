const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Method not allowed" })
    };
  }

  try {
    const { lat, lng, accuracy, consent } = JSON.parse(event.body);

    // Check consent
    if (consent !== true) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Consent is required before storing location data."
        })
      };
    }

    // Validate location data
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      typeof accuracy !== "number"
    ) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Invalid location data."
        })
      };
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("locations")
      .insert([
        {
          latitude: lat,
          longitude: lng,
          accuracy: accuracy,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Failed to save location to database."
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Location saved successfully.",
        data: {
          lat,
          lng,
          accuracy,
          timestamp: new Date().toISOString()
        }
      })
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: "Failed to process location data."
      })
    };
  }
};
