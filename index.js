const express = require('express');
const cors = require("cors");
const connection = require("./config");
const port = 3000;
const app = express();

app.use(express.json())
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to my favorite audiobooks list");
});

//1.GET - Retrieve all of the data from your table
app.get("/api/audiobooks", (req, res) => {
  connection.query("SELECT * FROM book", (err, results) => {
    if(err) {
      res.setStatus(500);
    } else {
      res.status(200).json(results);
    }
})});

//2.GET - Retrieve specific fields (i.e. id, names, dates, etc.)
app.get("/api/audiobooks/titles", (req, res) => {
  connection.query(
    `SELECT title FROM book`,
    (err, results) => {
      if (err) {  
        res.status(500).send(err);
      } else {
        res.status(200).json(results);
      }
    }
  );
})

app.get("/api/audiobooks/:id", (req, res) => {
  connection.query(
    `SELECT * FROM book WHERE idbook=?`,
    [req.params.id],
    (err, results) => {
      if (err) {  
        console.log(err);
        res.status(500).send(err);
      } else if (results.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

//3.A filter for data that contains...
app.get("/api/contains", (req, res) => {
  connection.query(
    `SELECT * FROM book WHERE title LIKE ?`,
    ['%' + req.query.title + '%'],
    (err, results) => {
      if (err){
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).json(results);
      }
    }
  )
});

//3.A filter for data that starts with... 
app.get("/api/start", (req, res) => {
  connection.query(
    `SELECT * FROM book WHERE title LIKE ?`,
    [req.query.title + '%'],
    (err, results) => {
      if (err){
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).json(results)
      }
    }
  )
});

//3.A filter for data that is greater than... différence en req.params et req.query? query = pour du filtrage/trier
app.get("/api/search", (req, res) => {
  connection.query(
    "SELECT * FROM book WHERE duration >= ?", [req.query.duration], (err, results) => {
      if (err){
        console.log(err);
        res.status(500).send(err);
      } else {
        results.length > 0 
        ? res.status(200).json(results)
        : res.status(404).send("No audiobooks found for this duration");
      }
    }
  )
});

//4.GET - Ordered data recovery (i.e. ascending, descending) - The order should be passed as a route parameter
app.get("/api/audiobooks/order/:value", (req, res) => {
  let order = 'ASC';
  if (req.params.avlue === 'DESC') {
    order = 'DESC';
  }
  connection.query(
    `SELECT * FROM book ORDER BY title ${order}`,
    (err, results) => {
      if (err) {  
        res.status(500).send(err);
      } else {
        res.status(200).json(results);
      }
    }
  );
});

//5.POST - Insertion of a new entity
app.post("/api/audiobooks", (req, res) => {
  const { title, date, is_active, duration } = req.body;
  connection.query(
    "INSERT INTO book(title, date, is_active, duration) VALUES(?, ?, ?, ?)",
    [title, date, is_active, duration], 
    (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send("Successfully saved");
          }
        }
    ); 
});

//6.PUT - Modification of an entity
app.put("/api/audiobooks/:id", (req, res) => {
  const idBook = req.params.id;
  const newBook = req.body;
  connection.query(
    "UPDATE book SET ? WHERE idbook = ?",
    [newBook, idBook],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).send("Audiobook updated successfully");
      }
    }
  );
});

//7.PUT - Toggle a Boolean value
app.put("/api/toggle/:id", (req, res) => {
  connection.query(
    "UPDATE book SET is_active = !is_active WHERE id = ?",
    [request.params.id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Audiobook updated successfully");
      }
    }
  )
});


//8.DELETE - Delete an entity
app.delete("/api/audiobooks/:id", (req, res) => {
  const idBook = req.params.id;
  connection.query(
    "DELETE FROM book WHERE idbook = ?",
    [idBook],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).send("Audiobook deleted!");
      }
    }
  );
});

//9.DELETE - Delete all entities where boolean value is false
app.delete("/api/audiobooks/", (req, res) => {
  connection.query(
    "DELETE FROM book WHERE is_active = 0",
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).send("Inactives audiobooks  deleted!");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});