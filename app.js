const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/EventRoutes");

const app = express();

//Middleware
app.use(express.json());
app.use("/events",router);


mongoose.connect("mongodb+srv://admin:VphE30Kl8PZoBc9B@cluster0.8vmqsmp.mongodb.net/")
.then(()=> console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);

})
.catch((err)=> console.log((err)));