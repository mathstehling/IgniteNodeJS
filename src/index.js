const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    response.status(404).json({ error: "User Name not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userNameAlreadyExists = users.some(
    (users) => users.username === username
  );

  if (userNameAlreadyExists) {
    return response.status(400).json({ error: "User Name Already Exists" });
  }

  const id = uuidv4();

  users.push({
    id,
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  user.todos.push({
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  response.json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((user) => user.id === id);

  if (!todo) {
    response.status(404).json({ error: "Id not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(200).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((user) => user.id === id);

  if (!todo) {
    response.status(404).json({ error: "Id not found" });
  }

  todo.done = true;

  response.status(200).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  user.todos.splice(id, 1);

  response.status(204).send();
});

module.exports = app;
