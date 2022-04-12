const express = require("express");
const multer = require("multer");

const route = require("./routes/route.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(multer().any());

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://sonu517825:m0ww1dng9uqrz0ge@cluster0.wgtiy.mongodb.net/group24Database?retryWrites=true&w=majority",
    { useNewUrlParser: true, useFindAndModify: false,useUnifiedTopology: true }
  )
  .then(() => console.log("mongodb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
