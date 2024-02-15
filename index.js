const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");
var bodyParser = require("body-parser");

const base_url = "http://localhost:3000";

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/movies");
    res.render("movies", { movies: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/movie/:id", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/movie/" + req.params.id);
    res.render("movie", { movie: response.data });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", async (req, res) => {
  try {
    const data = { title: req.body.title, director: req.body.director };
    await axios.post(base_url + "/movies", data);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/update/:id", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/movie/" + req.params.id);
    res.render("update", { movies: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    const data = { title: req.body.title, director: req.body.director };
    await axios.put(base_url + "/movie/" + req.params.id, data);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await axios.delete(base_url + "/movie/" + req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.listen(5500, () => {
  console.log("server started on port 5500");
});
