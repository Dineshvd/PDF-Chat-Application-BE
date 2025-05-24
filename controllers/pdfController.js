const pdfService = require("../services/pdfService");
const fs = require("fs");

const uploadPdf = async (req, res) => {
  try {
    const filePath = req.file.path;
    const text = await pdfService.extractText(filePath);

    const chunks = pdfService.chunkText(text, 500);
    const embeddings = await pdfService.getEmbeddings(chunks);
    await pdfService.saveChunksToDB(chunks, embeddings, req.file.originalname);

    // TODO: Save chunks + embeddings in MongoDB with metadata

    res.json({
      message: "PDF processed",
      textLength: text.length,
      chunkCount: chunks.length,
      embeddingCount: embeddings.length,
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await pdfService.answerQuestion(question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChunks = async (req, res) => {
  try {
    const chunks = await pdfService.getAllChunks();
    res.json({ count: chunks.length, chunks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadPdf,
  getChunks,
  askQuestion,
};
