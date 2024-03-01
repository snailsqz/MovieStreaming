const express = require("express");
const Sequelize = require("sequelize");
const app = express();
const fs = require("fs");
const path = require("path");

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
  type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  release_date: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  rating: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  genre: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  running_time: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  imageFile: {
    type: Sequelize.STRING,
    defaultValue: "600x300.png",
    allowNull: true,
  },
  teaser_url: {
    type: Sequelize.STRING,
    defaultValue: "https://www.youtube.com/watch?v=Gu6btHfa0wI",
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
  roles: {
    type: Sequelize.STRING,
    defaultValue: "User",
    allowNull: false,
  },
  profilePicture: {
    type: Sequelize.STRING,
    defaultValue: "noimage.jpg",
    allowNull: true,
  },
});

const Favorite = sequelize.define("favorite", {
  fmovie_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  movie_id: {
    type: Sequelize.INTEGER,
  },
  user_id: {
    type: Sequelize.INTEGER,
  },
});

const Review = sequelize.define("review", {
  review_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  movie_id: {
    type: Sequelize.INTEGER,
  },
  user_id: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  score: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: true,
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
      Review.findAll({ where: { movie_id: req.params.id } }).then((review) => {
        User.findAll().then((users) => {
          let ar = [review, movie, users];
          console.log(review, movie, users);
          res.json(ar);
        });
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/movie/:id", async (req, res) => {
  try {
    const checkingFavorite = await Favorite.findOne({
      where: {
        movie_id: req.params.id,
        user_id: req.body.user_id,
      },
    });
    if (checkingFavorite) res.json({ message: true });
    else res.json({ message: false });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/movies", (req, res) => {
  console.log(req.body);
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
        if (req.body.imageFile != undefined) {
          const imagePath = path.join(
            __dirname,
            `/public/images/${movie.imageFile}`
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
        }
        movie
          .update(req.body)
          .then(() => {
            console.log(req.body);
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
  Favorite.destroy({
    where: {
      movie_id: req.params.id,
    },
  });
  Review.destroy({
    where: {
      movie_id: req.params.id,
    },
  });
  Movies.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        if (movie.imageFile) {
          const imagePath = path.join(
            __dirname,
            `/public/images/${movie.imageFile}`
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
        }
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

app.post("/register", async (req, res) => {
  const exist = await User.findOne({ where: { name: req.body.name } });
  if (exist) return res.json({ message: "al" });
  else {
    User.create(req.body)
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ where: { name } });
    if (!user) return res.json({ message: "User_not_found" });

    if (user.password !== password)
      return res.json({ message: "Wrong_Password" });

    return res.status(200).json({ message: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server_error" });
  }
});

app.get("/users", (req, res) => {
  User.findAll() //select * from
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/user/:id", (req, res) => {
  User.findByPk(req.params.id)
    .then((users) => {
      if (!users) {
        res.status(404).send("users not found");
      } else {
        res.json(users);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.put("/admin/:id", (req, res) => {
  User.findByPk(req.params.id)
    .then((user) => {
      if (!user) res.status(404).send("user not found");
      if (user.roles == "Admin") {
        user
          .update({ roles: "User" })
          .then(() => {
            res.send(user);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      } else {
        user
          .update({ roles: "Admin" })
          .then(() => {
            res.send(user);
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

app.put("/user/:id", (req, res) => {
  User.findByPk(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).send("user not found");
      } else {
        if (
          req.body.profilePicture != undefined &&
          user.profilePicture != "noimage.jpg"
        ) {
          const imagePath = path.join(
            __dirname,
            `/public/images/${user.profilePicture}`
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
        }
        user
          .update(req.body)
          .then(() => {
            console.log(req.body);
            res.send(user);
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

app.delete("/user/:id", (req, res) => {
  User.findByPk(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).send("User not found");
      } else {
        if (user.profilePicture != "noimage.jpg") {
          const imagePath = path.join(
            __dirname,
            `/public/images/${user.profilePicture}`
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
        }
      }
      user
        .destroy()
        .then(() => {
          res.send({ message: "Delete Successfully" });
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/favorite/:id", (req, res) => {
  Favorite.findAll({ where: { user_id: req.params.id } })
    .then((e) => {
      Movies.findAll().then((f) => {
        let moviearr = [];
        for (let i = 0; i < e.length; i++)
          for (let j = 0; j < f.length; j++)
            if (e[i].dataValues.movie_id == f[j].dataValues.movie_id)
              moviearr.push(f[j]);

        res.json(moviearr);
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/favorite", async (req, res) => {
  try {
    const existingFavorite = await Favorite.findOne({
      where: {
        movie_id: req.body.movie_id,
        user_id: req.body.user_id,
      },
    });

    if (existingFavorite) return res.json({ message: "al" });

    const favorite = await Favorite.create({
      movie_id: req.body.movie_id,
      user_id: req.body.user_id,
    });

    res.send(favorite);
  } catch (error) {
    console.error("Error creating favorite:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/favorite", async (req, res) => {
  try {
    const existingFavorite = await Favorite.findOne({
      where: {
        movie_id: req.body.movie_id,
        user_id: req.body.user_id,
      },
    });

    if (!existingFavorite)
      return res.send.json({ message: "Favorite not found" });

    await Favorite.destroy({
      where: {
        movie_id: req.body.movie_id,
        user_id: req.body.user_id,
      },
    });

    res.json({ message: "Favorite successfully deleted" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/typemovie", (req, res) => {
  Movies.findAll({
    where: {
      type: "Movie",
    },
  }) //select * from
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/typeseries", (req, res) => {
  Movies.findAll({
    where: {
      type: "Series",
    },
  }) //select * from
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/review/:id", (req, res) => {
  Review.findAll({ where: { review_id: req.params.id } }) // find where review id = id on URL
    .then((reviews) => {
      res.json(reviews);
      // console.log(reviews);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/review/:id", async (req, res) => {
  try {
    const review = await Review.create({
      movie_id: req.body.movie_id,
      user_id: req.body.user_id,
      score: req.body.score,
      comment: req.body.comment,
    });

    res.send(review);
  } catch (error) {
    console.error("Error creating favorite:", error);
    res.status(500).send("Internal Server Error");
  }
});

// route to delete a review
app.delete("/review/:id", async (req, res) => {
  try {
    await Review.destroy({
      where: {
        review_id: req.params.id,
      },
    });

    res.json({ message: "Review successfully deleted" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port http://localhost:${port}...`)
);
