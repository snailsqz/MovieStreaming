const express = require("express");
const Sequelize = require("sequelize");
const app = express();

app.use(express.json());

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite", //choose sql to talk with
  storage: "./Database/SQBook.sqlite",
});

const Book = sequelize.define("book", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize.sync(); //if table not exist create

app.get("/books", (req, res) => {
  Book.findAll() //select * from
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/books/:id", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (!book) {
        res.status(404).send("Book not found");
      } else {
        res.json(book);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/books", (req, res) => {
  Book.create(req.body)
    .then((book) => {
      res.send(book);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.put("/books/:id", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (!book) {
        res.status(404).send("Book not found");
      } else {
        book
          .update(req.body)
          .then(() => {
            res.send(book);
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

app.delete("/books/:id", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (!book) {
        res.status(404).send("Book not found");
      } else {
        book
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

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port http://localhost:${port}...`)
);
