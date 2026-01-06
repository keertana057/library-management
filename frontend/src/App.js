import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// USE YOUR RENDER BACKEND URL HERE
const API = "https://library-backend-7g2y.onrender.com";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [copies, setCopies] = useState("");

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const [showAdd, setShowAdd] = useState(false);

  const fetchBooks = async () => {
    const res = await axios.get(`${API}/books`);
    setBooks(res.data);
  };

  useEffect(() => { 
    fetchBooks(); 
  }, []);

  const addBook = async () => {
    await axios.post(`${API}/books`, {
      title,
      author,
      category,
      publishedYear: year,
      availableCopies: Number(copies)
    });
    fetchBooks();
    setShowAdd(false);
  };

  const changeCopies = async (id, value) => {
    await axios.put(`${API}/books/${id}/copies`, { change: value });
    fetchBooks();
  };

  const deleteBook = async (id) => {
    await axios.delete(`${API}/books/${id}`);
    fetchBooks();
  };

  const searchBooks = async () => {
    const res = await axios.get(`${API}/books/title/${search}`);
    setBooks(res.data);
  };

  const filterBooks = async () => {
    const res = await axios.get(`${API}/books/category/${filterCat}`);
    setBooks(res.data);
  };

  return (
    <div className="app">
      <div className="container">

        <h1 className="heading">📚 Library Book Management</h1>

        <div className="dashboard">
          <div className="stat">Total Books <span>{books.length}</span></div>
          <div className="stat">Books After 2015 <span>{books.filter(b => b.publishedYear > 2015).length}</span></div>
          <div className="stat">Categories <span>{new Set(books.map(b=>b.category)).size}</span></div>
        </div>

        <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add Book</button>

        {showAdd && (
          <div className="modal">
            <div className="modal-box">

              <h3>Add New Book</h3>

              <input placeholder="Title" onChange={e=>setTitle(e.target.value)} />
              <input placeholder="Author" onChange={e=>setAuthor(e.target.value)} />
              <input placeholder="Category" onChange={e=>setCategory(e.target.value)} />
              <input placeholder="Published Year" type="number" onChange={e=>setYear(e.target.value)} />
              <input placeholder="Available Copies" type="number" onChange={e=>setCopies(e.target.value)} />

              <button className="save" onClick={addBook}>Save</button>
              <button className="cancel" onClick={()=>setShowAdd(false)}>Cancel</button>

            </div>
          </div>
        )}

        <div className="search-row">
          <input placeholder="Search Title..." onChange={e=>setSearch(e.target.value)} />
          <button onClick={searchBooks}>Search</button>

          <input placeholder="Filter Category..." onChange={e=>setFilterCat(e.target.value)} />
          <button onClick={filterBooks}>Filter</button>
        </div>

        <h2 className="section-title">📖 All Books</h2>

        <div className="book-grid">
          {books.map(b=>(
            <div key={b._id} className="book-card">
              <h3>{b.title}</h3>
              <p><b>Author:</b> {b.author}</p>
              <p><b>Category:</b> {b.category}</p>
              <p><b>Year:</b> {b.publishedYear}</p>
              <p><b>Copies:</b> {b.availableCopies}</p>

              <div className="button-row">
                <button onClick={()=>changeCopies(b._id,1)}>+ Copies</button>
                <button onClick={()=>changeCopies(b._id,-1)}>- Copies</button>
                <button className="delete" onClick={()=>deleteBook(b._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;
