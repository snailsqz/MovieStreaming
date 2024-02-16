const express = require("express");
const Sequelize = require("sequelize");
const app = express();

app.use(express.json());

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite", //choose sql to talk with
  storage: "./Database/Movies.sqlite",
});

const Movies = sequelize.define("movie", {
  movie_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  director: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  desc: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  imageFile: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

const User = sequelize.define("user", {
  user_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize.sync(); //if table not exist create

app.get("/movies", (req, res) => {
  Movies.findAll() //select * from
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/movieupdate/", (req, res) => {
  Movies.findAll() //select * from
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/moviedelete/", (req, res) => {
  Movies.findAll() //select * from
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/movie/:id", (req, res) => {
  Movies.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        res.json(movie);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/movies", (req, res) => {
  Movies.create(req.body)
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.put("/movie/:id", (req, res) => {
  Movies.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        movie
          .update(req.body)
          .then(() => {
            res.send(movie);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.delete("/movie/:id", (req, res) => {
  Movies.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        movie
          .destroy()
          .then(() => {
            res.send({});
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/register", (req, res) => {
  User.create(req.body)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ where: { name } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port http://localhost:${port}...`)
);
