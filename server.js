const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const sanitizeHTML = require("sanitize-html");

const PORT = 3000;
const app = express();
let db;

// Read non-server files
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// MongoDB Configuration
const connectionString =
  "mongodb+srv://todoAppUser:2242@cluster0-mmps9.mongodb.net/TodoApp?retryWrites=true&w=majority";

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    db = client.db();
    app.listen(PORT, () => {
      console.log("Server is running now on localhost:" + PORT);
    });
  }
);

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic Realm='Simple Todo App'");
  console.log(req.headers.authorization);

  if (req.headers.authorization == "Basic YWhtZWQ6bmFzcg==") {
    next();
  } else {
    res.status(401).send("Authentication required!");
  }
}

app.use(passwordProtected);

// Read items from inside the database
app.get("/", (req, res) => {
  db.collection("items")
    .find()
    .toArray((err, items) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple To-Do App</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        <body>
          <div class="container">
            <h1 class="display-4 text-center py-1">To-Do App!</h1>

            <div class="jumbotron p-4 shadow-sm">
              <form class="js-createTodoItemForm" action="/create-item" method="POST">
                <div class="d-flex align-items-center">
                  <input name="todoItem" autofocus autocomplete="off" class="js-createTodoItemField form-control mr-3" type="text" style="flex: 1;">
                  <button class="btn btn-primary">Add New Item</button>
                </div>
              </form>
            </div>

            <ul class="list-group pb-5 js-todoItemsList"></ul>

          </div>
          <script>
            const items = ${JSON.stringify(items)}
          </script>
          <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
          <script src="/index.js"></script>
        </body>
        </html>
      `);
    });
});

// Create new item in the database
app.post("/create-item", (req, res) => {
  const safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").insertOne({ text: safeText }, (err, info) => {
    res.json(info.ops[0]);
  });
});

// Update current item
app.post("/update-item", (req, res) => {
  const safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectID(req.body.id) },
    { $set: { text: safeText } },
    () => {
      res.send("Success");
    }
  );
});

// Delete current item
app.post("/delete-item", (req, res) => {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectID(req.body.id) },
    () => {
      res.send("Success");
    }
  );
});
