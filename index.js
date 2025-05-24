require("dotenv").config();
const express = require("express");
const pdfRoutes = require("./routes/pdfRoutes");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

// Connect DB
connectDB();

app.use("/api", pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
