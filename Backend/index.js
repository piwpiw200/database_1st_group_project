const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://book-app-frontend-tau.vercel.app'],
    credentials: true
}))

// routes
const bookRoutes = require('./src/books/book.route');
const orderRoutes = require("./src/orders/order.route")
const userRoutes =  require("./src/users/user.route")
const adminRoutes = require("./src/stats/admin.stats")

app.use("/api/books", bookRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/auth", userRoutes)
app.use("/api/admin", adminRoutes)

const db = require('./src/utils/db');

// attempt to connect (non-blocking, failures are handled inside)
(async () => {
  await db.connect();
  if (db.isConnected()) {
    console.log('Mongodb connect successfully!');
  } else {
    console.warn('Running in offline mode — database not connected');
  }
})();

app.use("/", (req, res) => {
  res.send("Book Store Server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
