const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Fehlerbehandlung: Felder vorhanden?
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Prüfen, ob Benutzer bereits existiert
    if (!isValid(username)) {
      return res.status(409).json({ message: "Username already exists. Please choose another one." });
    }
  
    // Benutzer registrieren
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully!" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).filter(x => x.isbn === isbn);
    
    if (book) {
        return res.json(book);
    } else {
        return res.status(404).send("Book not found");
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matches = Object.values(books).filter(book => book.author === author);
    if (matches.length > 0) {
      return res.json(matches);
    } else {
      return res.status(404).send("Author not found");
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matches = Object.values(books).filter(book => book.title === title);
    if (matches.length > 0) {
      return res.json(matches);
    } else {
      return res.status(404).send("Title not found");
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const matches = Object.values(books).filter(book => book.isbn === isbn);
    if (matches.length > 0) {
      return res.json(matches[0].reviews);
    } else {
      return res.status(404).send("Reviews not found");
    }
  });

module.exports.general = public_users;
