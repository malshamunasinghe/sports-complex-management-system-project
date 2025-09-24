//3cBNlgTHY0JM8CFh

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./Route/UserRoute");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);


// DB Connection
mongoose
  .connect("mongodb+srv://Admin:3cBNlgTHY0JM8CFh@cluster0.3pojngu.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () =>
      console.log("Server running on http://localhost:5000")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
