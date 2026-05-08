exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
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

    const entry = {
      lat,
      lng,
      accuracy,
      timestamp: new Date().toISOString()
    };

    // For Netlify, store in a database or external service
    // For now, just return success
    console.log("Location received:", entry);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Location saved successfully.",
        data: entry
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
