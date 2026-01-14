require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const dbConfig = require("./app/config/db.config");

const app = express();
const path = __dirname + '/app/views/';

app.use(express.static(path));

const corsOptions = {
  origin: [
    "http://localhost:4200"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// Apply CORS for all routes and ensure OPTIONS preflight uses same options
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(cookieSession({
    name: "bezkoder-session",
    secret: process.env.COOKIE_SECRET,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
}));

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    // Do not exit; allow the app to keep serving while DB is unavailable
  });

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

const fuelRoutes = require('./app/routes/fuel-price.routes');
app.use('/api/fuel', fuelRoutes);

async function initial() {
  const count = await Role.estimatedDocumentCount();
  if (count === 0) {
    console.log("Initializing roles...");
    await new Role({ name: "user" }).save();
    await new Role({ name: "moderator" }).save();
    await new Role({ name: "admin" }).save();
    console.log("Roles initialized.");
  }
}

module.exports = app; // Export app instead of listening here
