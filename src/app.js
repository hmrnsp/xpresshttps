"use strict";

const express = require("express");

const HOST = process.env.HOST || "127.0.0.1"; // hanya dengar di localhost, publik lewat nginx
const PORT = Number(process.env.PORT) || 6969;

const app = express();

// Percayai proxy di loopback (nginx). Dengan ini req.ip, req.protocol, req.secure
// diambil dari X-Forwarded-For / X-Forwarded-Proto yang dikirim nginx.
app.set("trust proxy", "loopback");
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.json({
    message: "Hello World dari Express di belakang Nginx + Cloudflare",
    clientIp: req.headers["cf-connecting-ip"] || req.ip, // IP asli pengunjung
    country: req.headers["cf-ipcountry"] || null,
    cfRay: req.headers["cf-ray"] || null,
    protocol: req.protocol, // harus "https"
    secure: req.secure,
    host: req.hostname,
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server jalan di http://${HOST}:${PORT}`);
});

// Graceful shutdown (systemd / pm2 / docker stop)
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`${sig} diterima, menutup server...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
