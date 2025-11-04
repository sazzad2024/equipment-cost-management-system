const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8083;
const HOST = "0.0.0.0";

// Enable CORS
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.json({ 
    message: "IDOT Backend is running!", 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", health: "Good" });
});

app.listen(PORT, HOST, () => {
  console.log(`Test server is running on http://${HOST}:${PORT}`);
});







