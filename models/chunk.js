const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  fileName: String,
  // userId: String, // Optional: add later
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chunk", chunkSchema);
