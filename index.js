// server.js or index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");
const connectDB = require("./config/db");

const app = express();

// ✅ Allowed origins (no trailing slash!)
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:5173",
  "https://siviai.netlify.app",
  "https://siviai.netlify.app/",
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Only use if you are sending cookies or auth headers
  })
);

// ✅ Preflight request handling (important for PUT/DELETE/POST requests)
app.options("*", cors());

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Connect to MongoDB or your database
connectDB();

// ✅ Use your PDF routes
app.use("/api", pdfRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
