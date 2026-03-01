import express from "express";
import cors from "cors";
import {
  addEntry,
  deleteEntry,
  getBookById,
  getBooks,
  loadFromDisk,
  saveToDisk,
  setVerifiedDate,
  updateBookMetadata,
  updateEntry
} from "./dataStore.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.status(200).send(
    "Home Sheets backend is running. Use /api/* endpoints (e.g. /api/health). Frontend runs separately on http://localhost:5173."
  );
});

app.get("/api/books", (_req, res) => {
  const books = getBooks();
  const totalBalance = books.reduce((sum, book) => sum + book.balance, 0);
  res.json({ books, totalBalance });
});

app.get("/api/books/:bookId", (req, res) => {
  const book = getBookById(req.params.bookId);
  if (!book) {
    return res.status(404).json({ error: "Book not found." });
  }
  return res.json(book);
});

app.put("/api/books/:bookId", (req, res) => {
  try {
    const book = updateBookMetadata(req.params.bookId, req.body);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/books/:bookId/entries", (req, res) => {
  try {
    const book = addEntry(req.params.bookId, req.body);
    return res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put("/api/books/:bookId/entries/:entryId", (req, res) => {
  try {
    const book = updateEntry(req.params.bookId, req.params.entryId, req.body);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete("/api/books/:bookId/entries/:entryId", (req, res) => {
  try {
    const book = deleteEntry(req.params.bookId, req.params.entryId);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put("/api/books/:bookId/verified-date", (req, res) => {
  try {
    const book = setVerifiedDate(req.params.bookId, req.body.verifiedDate);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/save", async (_req, res) => {
  try {
    const snapshot = await saveToDisk();
    return res.json(snapshot);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found." });
  }

  return res.status(404).send(
    "Route not found. For the app UI, open http://localhost:5173. For backend health, open /api/health."
  );
});

await loadFromDisk();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
