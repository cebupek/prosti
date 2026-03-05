const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/ping" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("pong");
    return;
  }

  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Self-ping to keep Render free tier alive - every 14 minutes
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  const url = new URL(SELF_URL + "/ping");
  const mod = url.protocol === "https:" ? require("https") : require("http");
  mod.get(url.toString(), (res) => {
    console.log(`[${new Date().toISOString()}] Self-ping: ${res.statusCode}`);
  }).on("error", (e) => {
    console.error(`Self-ping error: ${e.message}`);
  });
}, 14 * 60 * 1000);
