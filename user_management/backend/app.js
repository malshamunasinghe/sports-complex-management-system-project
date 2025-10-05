const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./Routes/UserRoutes");

const app = express();

// Middleware 
app.use(express.json());
app.use(cors());
app.use("/users", router);

// Ensure you specify the db name after .net/ (for example: /sportsdb?...)
const mongoUri = "mongodb+srv://admin:FOpu5Uk2n4z6131i@cluster0.jpenjs6.mongodb.net/sportsdb?retryWrites=true&w=majority";

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5003, () => console.log("Server running on port 5003"));
  })
  .catch((err) => console.log(err));
