import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data");
const BOOKS_DIR = path.join(DATA_DIR, "books");
const MASTER_FILE = path.join(DATA_DIR, "master.json");

const DUMMY_TITLES = ["diesel", "ice", "fish", "rubber"];

const state = {
  books: []
};

function computeBalance(entries) {
  return entries.reduce((sum, entry) => {
    const signedAmount = entry.type === "income" ? entry.amount : -entry.amount;
    return sum + signedAmount;
  }, 0);
}

function sortEntriesByMostRecent(entries) {
  return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function assertIntegerAmount(amount) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive integer with no decimals.");
  }
}

function assertEntryType(type) {
  if (type !== "income" && type !== "spending") {
    throw new Error("Entry type must be either 'income' or 'spending'.");
  }
}

function assertValidDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value.");
  }
  return parsed.toISOString();
}

function isBeforeVerifiedDate(entryDate, verifiedDate) {
  if (!verifiedDate) return false;
  return new Date(entryDate).getTime() < new Date(verifiedDate).getTime();
}

function sanitizeBook(book) {
  return {
    ...book,
    entries: sortEntriesByMostRecent(book.entries),
    balance: computeBalance(book.entries)
  };
}

async function ensureDataFolders() {
  await fs.mkdir(BOOKS_DIR, { recursive: true });
}

async function loadFromDisk() {
  await ensureDataFolders();

  try {
    const masterRaw = await fs.readFile(MASTER_FILE, "utf-8");
    const master = JSON.parse(masterRaw);
    const loadedBooks = [];

    for (const ref of master.books ?? []) {
      const bookPath = path.join(BOOKS_DIR, `${ref.id}.json`);
      const bookRaw = await fs.readFile(bookPath, "utf-8");
      loadedBooks.push(JSON.parse(bookRaw));
    }

    state.books = loadedBooks;
  } catch {
    state.books = DUMMY_TITLES.map((name) => ({
      id: name,
      name,
      description: "",
      verifiedDate: null,
      entries: []
    }));
  }
}

function getBooks() {
  return state.books.map((book) => {
    const clean = sanitizeBook(book);
    return {
      id: clean.id,
      name: clean.name,
      description: clean.description,
      verifiedDate: clean.verifiedDate,
      balance: clean.balance,
      entryCount: clean.entries.length
    };
  });
}

function getBookById(bookId) {
  const found = state.books.find((book) => book.id === bookId);
  if (!found) return null;
  return sanitizeBook(found);
}

function addEntry(bookId, payload) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) throw new Error("Book not found.");

  const amount = Number(payload.amount);
  assertIntegerAmount(amount);
  assertEntryType(payload.type);
  const date = assertValidDate(payload.date);

  const entry = {
    id: randomUUID(),
    name: String(payload.name ?? "").trim(),
    amount,
    type: payload.type,
    date,
    notes: String(payload.notes ?? "")
  };

  if (!entry.name) {
    throw new Error("Entry name is required.");
  }

  book.entries.push(entry);
  return sanitizeBook(book);
}

function updateEntry(bookId, entryId, payload) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) throw new Error("Book not found.");

  const entry = book.entries.find((item) => item.id === entryId);
  if (!entry) throw new Error("Entry not found.");

  if (isBeforeVerifiedDate(entry.date, book.verifiedDate)) {
    throw new Error("Entries before verified date cannot be edited.");
  }

  const amount = Number(payload.amount);
  assertIntegerAmount(amount);
  assertEntryType(payload.type);
  const date = assertValidDate(payload.date);

  const name = String(payload.name ?? "").trim();
  if (!name) {
    throw new Error("Entry name is required.");
  }

  entry.name = name;
  entry.amount = amount;
  entry.type = payload.type;
  entry.date = date;
  entry.notes = String(payload.notes ?? "");

  return sanitizeBook(book);
}

function deleteEntry(bookId, entryId) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) throw new Error("Book not found.");

  const index = book.entries.findIndex((item) => item.id === entryId);
  if (index < 0) throw new Error("Entry not found.");

  if (isBeforeVerifiedDate(book.entries[index].date, book.verifiedDate)) {
    throw new Error("Entries before verified date cannot be edited.");
  }

  book.entries.splice(index, 1);
  return sanitizeBook(book);
}

function setVerifiedDate(bookId, verifiedDate) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) throw new Error("Book not found.");

  book.verifiedDate = verifiedDate ? assertValidDate(verifiedDate) : null;
  return sanitizeBook(book);
}

async function saveToDisk() {
  await ensureDataFolders();

  const master = {
    savedAt: new Date().toISOString(),
    books: state.books.map((book) => ({
      id: book.id,
      name: book.name,
      balance: computeBalance(book.entries)
    })),
    totalBalance: state.books.reduce((sum, book) => sum + computeBalance(book.entries), 0)
  };

  await Promise.all(
    state.books.map(async (book) => {
      const bookPath = path.join(BOOKS_DIR, `${book.id}.json`);
      const clean = sanitizeBook(book);
      await fs.writeFile(bookPath, JSON.stringify(clean, null, 2), "utf-8");
    })
  );

  await fs.writeFile(MASTER_FILE, JSON.stringify(master, null, 2), "utf-8");

  return master;
}

export {
  addEntry,
  deleteEntry,
  getBookById,
  getBooks,
  loadFromDisk,
  saveToDisk,
  setVerifiedDate,
  updateEntry
};
