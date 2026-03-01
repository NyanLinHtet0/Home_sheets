import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookForm from "../components/BookForm";

const API = "http://localhost:4000/api";

export default function BookDetailPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [verifiedDateInput, setVerifiedDateInput] = useState("");
  const [bookNameInput, setBookNameInput] = useState("");
  const [bookDescriptionInput, setBookDescriptionInput] = useState("");

  async function loadBook() {
    const response = await fetch(`${API}/books/${bookId}`);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to load book");
      return;
    }

    setBook(data);
    setVerifiedDateInput(data.verifiedDate ? data.verifiedDate.slice(0, 16) : "");
    setBookNameInput(data.name ?? "");
    setBookDescriptionInput(data.description ?? "");
  }

  useEffect(() => {
    loadBook();
  }, [bookId]);

  async function createEntry(payload) {
    const response = await fetch(`${API}/books/${bookId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to create entry");
      return;
    }

    setBook(data);
    setMessage("Entry added.");
    setError("");
  }

  async function updateEntry(entryId, payload) {
    const response = await fetch(`${API}/books/${bookId}/entries/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to update entry");
      return;
    }

    setBook(data);
    setEditingEntryId(null);
    setMessage("Entry updated.");
    setError("");
  }

  async function removeEntry(entryId) {
    const response = await fetch(`${API}/books/${bookId}/entries/${entryId}`, {
      method: "DELETE"
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to delete entry");
      return;
    }

    setBook(data);
    setMessage("Entry deleted.");
    setError("");
  }

  async function updateVerifiedDate(event) {
    event.preventDefault();
    const response = await fetch(`${API}/books/${bookId}/verified-date`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verifiedDate: verifiedDateInput ? new Date(verifiedDateInput).toISOString() : null
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to set verified date");
      return;
    }

    setBook(data);
    setMessage("Verified date updated.");
    setError("");
  }

  async function updateBookMetadata(event) {
    event.preventDefault();

    const response = await fetch(`${API}/books/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bookNameInput,
        description: bookDescriptionInput
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to update book metadata");
      return;
    }

    setBook(data);
    setMessage("Book details updated.");
    setError("");
  }

  const rows = useMemo(() => book?.entries ?? [], [book]);

  if (!book) return <section className="card"><p>Loading...</p></section>;

  return (
    <section className="card">
      <p><Link to="/books">← Back to books</Link></p>
      <div className="row between">
        <h2>{book.name}</h2>
        <strong>Balance: {book.balance}</strong>
      </div>

      <form className="grid-form" onSubmit={updateBookMetadata}>
        <label>
          Book name
          <input
            required
            value={bookNameInput}
            onChange={(event) => setBookNameInput(event.target.value)}
          />
        </label>

        <label>
          Description
          <input
            value={bookDescriptionInput}
            onChange={(event) => setBookDescriptionInput(event.target.value)}
          />
        </label>

        <button type="submit">Update book details</button>
      </form>

      <form className="row" onSubmit={updateVerifiedDate}>
        <label>
          Verified date
          <input
            type="datetime-local"
            value={verifiedDateInput}
            onChange={(event) => setVerifiedDateInput(event.target.value)}
          />
        </label>
        <button type="submit">Set verified date</button>
      </form>

      <h3>Add entry</h3>
      <BookForm onSubmit={createEntry} submitLabel="Add entry" />

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}

      <h3>Entries (most recent first)</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.name}</td>
              <td>{entry.amount}</td>
              <td>{entry.type}</td>
              <td>{new Date(entry.date).toLocaleString()}</td>
              <td>{entry.notes || "-"}</td>
              <td>
                <button type="button" onClick={() => setEditingEntryId(entry.id)}>Edit</button>{" "}
                <button type="button" onClick={() => removeEntry(entry.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingEntryId ? (
        <section>
          <h3>Edit entry</h3>
          <BookForm
            key={editingEntryId}
            defaultValue={rows.find((item) => item.id === editingEntryId)}
            onSubmit={(payload) => updateEntry(editingEntryId, payload)}
            submitLabel="Update entry"
          />
        </section>
      ) : null}
    </section>
  );
}
