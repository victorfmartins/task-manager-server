const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

function readTasks() {
  const data = fs.readFileSync("tasks.json", "utf-8");
  return JSON.parse(data);
}

function writeTasks(tasks) {
  const data = JSON.stringify(tasks, null, 2);
  fs.writeFileSync("tasks.json", data, "utf-8");
}

let tasks = readTasks();

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.put("/tasks", (req, res) => {
  tasks = req.body;
  writeTasks(tasks);
  res.json({ message: "Tasks updated successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
