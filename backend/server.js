const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
// Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  publishedYear: Number,
  availableCopies: Number
});

const Book = mongoose.model("Book", bookSchema);

// Insert book one-by-one
app.post("/books", async (req, res) => {
  try {
    const { title, author, category, publishedYear, availableCopies } = req.body;

    if (!title || !author || !category || !publishedYear || availableCopies == null)
      return res.status(400).json({ message: "All fields required" });

    const book = new Book({ title, author, category, publishedYear, availableCopies });
    await book.save();

    res.json({ message: "Book added", book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Search by title
app.get("/books/title/:title", async (req, res) => {
  const books = await Book.find({ title: new RegExp(req.params.title, "i") });
  if (!books.length) return res.status(404).json({ message: "Book not found" });
  res.json(books);
});

// Filter by category
app.get("/books/category/:category", async (req, res) => {
  const books = await Book.find({ category: req.params.category });
  res.json(books);
});

// Books after 2015
app.get("/books/after/2015", async (req, res) => {
  const books = await Book.find({ publishedYear: { $gt: 2015 } });
  res.json(books);
});

// Increase / Decrease copies
app.put("/books/:id/copies", async (req, res) => {
  const { change } = req.body;

  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.availableCopies + change < 0)
    return res.status(400).json({ message: "Negative stock prevented" });

  book.availableCopies += change;

  if (book.availableCopies === 0) {
    await Book.findByIdAndDelete(req.params.id);
    return res.json({ message: "Book removed because copies became 0" });
  }

  await book.save();
  res.json(book);
});

// Delete manually
app.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
