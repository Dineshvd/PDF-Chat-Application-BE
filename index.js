require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:5173",
  "https://siviai.netlify.app/",
]; // React dev ports

// 👇 Add CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Connect DB
connectDB();

app.use("/api", pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
