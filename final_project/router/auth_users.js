const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Prüfe, ob der Username bereits in der Liste existiert
    return !users.some(user => user.username === username);
  }

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // 1) Auth check
    const auth = req.session && req.session.authorization;
    if (!auth || !auth.username) {
      return res.status(401).json({ message: "Unauthorized: please log in first." });
    }
    const username = auth.username;
  
    // 2) ISBN aus URL-Param, Review aus Query (?review=...)
    const isbn = req.params.isbn; 
    const review = req.query.review;
    if (!review) {
      return res.status(400).json({ message: "Missing 'review' query parameter." });
    }
  
    // 3) Buch finden: Suche in allen Werten, weil Schlüssel nicht ISBN ist
    const bookKey = Object.keys(books).find(
      key => books[key].isbn === isbn
    );
    if (!bookKey) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    const book = books[bookKey];
  
    // 4) Reviews initialisieren falls nötig
    if (!book.reviews) book.reviews = {};
  
    // 5) Review upserten
    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review;
  
    return res
      .status(isUpdate ? 200 : 201)
      .json({
        message: isUpdate ? "Review updated." : "Review added.",
        reviews: book.reviews
      });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
