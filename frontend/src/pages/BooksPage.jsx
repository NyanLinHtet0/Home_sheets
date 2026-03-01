import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "http://localhost:4000/api";

export default function BooksPage() {
  const [booksData, setBooksData] = useState({ books: [], totalBalance: 0 });
  const [message, setMessage] = useState("");

  async function loadBooks() {
    const response = await fetch(`${API}/books`);
    const data = await response.json();
    setBooksData(data);
  }

  async function handleSave() {
    const response = await fetch(`${API}/save`, { method: "POST" });
    const data = await response.json();
    setMessage(`Saved at ${new Date(data.savedAt).toLocaleString()}`);
  }

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <section className="card">
      <div className="row between">
        <h2>Books</h2>
        <button onClick={handleSave}>Save</button>
      </div>
      <p>Master total balance: <strong>{booksData.totalBalance}</strong></p>
      {message ? <p className="success">{message}</p> : null}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Verified date</th>
            <th>Entries</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {booksData.books.map((book) => (
            <tr key={book.id}>
              <td><Link to={`/books/${book.id}`}>{book.name}</Link></td>
              <td>{book.description || "-"}</td>
              <td>{book.verifiedDate ? new Date(book.verifiedDate).toLocaleString() : "-"}</td>
              <td>{book.entryCount}</td>
              <td>{book.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
