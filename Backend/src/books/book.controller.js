const Book = require("./book.model");
const path = require('path');
const fs = require('fs');
const db = require('../utils/db');

const booksDataPath = path.join(__dirname, '../../data/books.json');

function readFallbackBooks() {
    try {
        const raw = fs.readFileSync(booksDataPath, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to read fallback books file', e && e.message ? e.message : e);
        return [];
    }
}

const postABook = async (req, res) => {
    if (!db.isConnected()) {
        return res.status(503).send({ message: 'DB not connected — write operations not available in offline mode' });
    }

    try {
        const newBook = await Book({...req.body});
        await newBook.save();
        res.status(200).send({message: "Book posted successfully", book: newBook})
    } catch (error) {
        console.error("Error creating book", error);
        res.status(500).send({message: "Failed to create book"})
    }
}

// get all books
const getAllBooks =  async (req, res) => {
    if (!db.isConnected()) {
        const fallback = readFallbackBooks();
        return res.status(200).send(fallback);
    }

    try {
        const books = await Book.find().sort({ createdAt: -1});
        res.status(200).send(books)
        
    } catch (error) {
        console.error("Error fetching books", error);
        res.status(500).send({message: "Failed to fetch books"})
    }
}

const getSingleBook = async (req, res) => {
    if (!db.isConnected()) {
        const fallback = readFallbackBooks();
        const book = fallback.find(b => String(b._id) === String(req.params.id));
        if (!book) return res.status(404).send({message: 'Book not Found!'})
        return res.status(200).send(book);
    }

    try {
        const {id} = req.params;
        const book =  await Book.findById(id);
        if(!book){
            res.status(404).send({message: "Book not Found!"})
        }
        res.status(200).send(book)
        
    } catch (error) {
        console.error("Error fetching book", error);
        res.status(500).send({message: "Failed to fetch book"})
    }

}

// update book data
const UpdateBook = async (req, res) => {
    if (!db.isConnected()) {
        return res.status(503).send({ message: 'DB not connected — update not available in offline mode' });
    }

    try {
        const {id} = req.params;
        const updatedBook =  await Book.findByIdAndUpdate(id, req.body, {new: true});
        if(!updatedBook) {
            res.status(404).send({message: "Book is not Found!"})
        }
        res.status(200).send({
            message: "Book updated successfully",
            book: updatedBook
        })
    } catch (error) {
        console.error("Error updating a book", error);
        res.status(500).send({message: "Failed to update a book"})
    }
}

const deleteABook = async (req, res) => {
    if (!db.isConnected()) {
        return res.status(503).send({ message: 'DB not connected — delete not available in offline mode' });
    }

    try {
        const {id} = req.params;
        const deletedBook =  await Book.findByIdAndDelete(id);
        if(!deletedBook) {
            res.status(404).send({message: "Book is not Found!"})
        }
        res.status(200).send({
            message: "Book deleted successfully",
            book: deletedBook
        })
    } catch (error) {
        console.error("Error deleting a book", error);
        res.status(500).send({message: "Failed to delete a book"})
    }
};

module.exports = {
    postABook,
    getAllBooks,
    getSingleBook,
    UpdateBook,
    deleteABook
}