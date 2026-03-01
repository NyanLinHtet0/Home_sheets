import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";

export default function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Home Sheets</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
