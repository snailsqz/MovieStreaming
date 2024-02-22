const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");
const multer = require("multer");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

const base_url = "http://localhost:3000";

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.locals.moviedata = "";
app.locals.checkLogin = "";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

const authenticateUser = (req, res, next) => {
  if (req.cookies && req.cookies.userSession) {
    // User is authenticated
    next();
  } else {
    res.redirect("/login");
  }
};

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
    // console.log(response.data);
    res.render("movie", { movie: response.data });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.get("/create", (req, res) => {
  if (req.cookies && req.cookies.userSession) {
    console.log("hell22o");
    res.render("create");
  } else {
    console.log("hello");
    res.redirect("/login");
  }
});

app.post("/create", upload.single("imageFile"), async (req, res, next) => {
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
    if (response.data.message == true) {
      res.cookie("userSession", response.data.user.name, { httpOnly: true });
      console.log(response.data.user.name, "Login Successful");
      app.locals.moviedata = {
        user_id: response.data.user.user_id,
        userName: response.data.user.name,
        roles: response.data.user.roles,
      };
      app.locals.checkLogin = "";
      res.redirect("/");
    } else if (response.data.message == "User_not_found") {
      console.log("User Not Found");
      app.locals.checkLogin = "User not found";
      res.redirect("login");
    } else if (response.data.message == "Wrong_Password") {
      console.log("Wrong Password");
      app.locals.checkLogin = "Wrong Password";
      res.redirect("login");
    }
  } catch (err) {
    console.error(err);
    console.log("500");
  }
});

app.get("/favorite/:id", authenticateUser, async (req, res) => {
  try {
    const response = await axios.get(base_url + "/favorite/" + req.params.id);

    let array = [];
    for (let i = 0; i < response.data.length; i++) {
      array.push(response.data[i].movie_id);
    }
    app.locals.favoriteMovie = {
      favoriteArray: array,
    };

    const response2 = await axios.get(base_url + "/movies");
    res.render("favorite", { movies: response2.data });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.post("/favorite", async (req, res) => {
  const data = {
    movie_id: req.body.movie_id,
    user_id: req.body.user_id,
  };
  await axios.post(base_url + "/favorite/", data);
  res.redirect("/movie/" + req.body.movie_id);
});

app.get("/logout", (req, res) => {
  res.clearCookie("userSession");
  app.locals.moviedata = "";
  res.redirect("/");
});

const port = 5500;
app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}...`);
});
