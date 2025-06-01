const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const Chunk = require("../models/chunk");
const cosineSimilarity = require("../utils/cosineSimilarity");

// Step 1: Get embedding of question
async function getEmbedding(text) {
  const response = await axios.post(process.env.EMBEDDING_API_URL, {
    texts: [text],
  });
  return response.data.embeddings[0]; // single vector
}

// Step 2: Find most relevant chunks
async function findRelevantChunks(questionEmbedding, topK = 3) {
  const chunks = await Chunk.find({});
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

// Step 3: Send to LLM
async function callLLM(question, contextChunks) {
  const context = contextChunks.map((c) => c.text).join("\n\n");
  const prompt = `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${question}`;
  const response = await axios.post(process.env.LLM_API_URL, {
    prompt,
  });
  console.log("LLM Answer:-", response?.data);
  return response?.data?.answer;
}

async function answerQuestion(question) {
  console.log("User Question :-", question);
  const questionEmbedding = await getEmbedding(question);
  const relevantChunks = await findRelevantChunks(questionEmbedding);
  const answer = await callLLM(question, relevantChunks);
  return answer;
}

const extractText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

const getAllChunks = async () => {
  return await Chunk.find().limit(20); // or add filters later
};

// Save chunks + embeddings

const saveChunksToDB = async (chunks, embeddings, fileName) => {
  if (chunks.length !== embeddings.length) {
    throw new Error("Chunk and embedding length mismatch");
  }

  const chunkDocs = chunks.map((chunk, index) => ({
    text: chunk,
    embedding: embeddings[index],
    fileName,
  }));

  await Chunk.insertMany(chunkDocs);
};

// You can add other functions here for chunking, embedding API calls, etc.
const chunkText = (text, chunkSize = 500) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at the last space to avoid cutting words
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks;
};

const getEmbeddings = async (chunks) => {
  try {
    const response = await axios.post(process.env.EMBEDDING_API_URL, {
      texts: chunks,
    });
    console.log("Embedding API response:", response.data);
    return response.data.embeddings; // Array of vectors
  } catch (error) {
    console.error("Embedding API rror:", error.message);
    throw new Error("Failed to get embeddings");
  }
};

module.exports = {
  extractText,
  getAllChunks,
  answerQuestion,
  chunkText,
  saveChunksToDB,
  getEmbeddings,
};
