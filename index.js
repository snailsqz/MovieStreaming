const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");
const multer = require("multer");
var bodyParser = require("body-parser");

const base_url = "http://localhost:3000";

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

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

app.post("/create", upload.single("imageFile"), async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      director: req.body.director,
      imageFile: req.file.filename,
    };
    await axios.post(base_url + "/movies", data);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/movieupdate", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/movieupdate");
    res.render("movieupdate", { movies: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/moviedelete", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/moviedelete");
    res.render("moviedelete", { movies: response.data });
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
    res.redirect("/moviedelete");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      password: req.body.password,
    };
    await axios.post(base_url + "/register", data);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      password: req.body.password,
    };
    const response = await axios.post(base_url + "/login/", data);
    if (response.data.message == "User_not_found") {
      console.log("3");
      res.render("register");
    } else if (response.data.message == true) {
      const response2 = await axios.get(base_url + "/movies");
      // console.log(response.data.user.user_id);
      res.render("movies", { movies: response2.data });
    } else if (res.status() == 401) {
      console.log("401");
      res.render("login");
    }
  } catch (err) {
    console.error(err);
    console.log("500");
  }
});

app.listen(5500, () => {
  console.log("server started on port 5500");
});
