// Load environment variables FIRST (before anything else)
require('dotenv').config();

const http = require("http");
const { loadSecrets } = require("./app/config/secrets");

const PORT = process.env.PORT || 8083;
const HOST = "0.0.0.0"; // Ensure it's reachable from outside the container

// Start server after loading secrets (if available) from SSM/KMS.
(async () => {
  await loadSecrets();

  const app = require("./app");
  const server = http.createServer(app);

  server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
})();

