const express = require("express");
const multer = require("multer");
const pdfController = require("../controllers/pdfController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-pdf", upload.single("file"), pdfController.uploadPdf);
router.get("/chunks", pdfController.getChunks);
router.post("/ask", pdfController.askQuestion);

module.exports = router;
