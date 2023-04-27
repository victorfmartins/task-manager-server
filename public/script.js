async function fetchTasks() {
  const response = await fetch("/tasks");
  const tasks = await response.json();
  return tasks;
}

async function saveTasks(tasks) {
  const response = await fetch("/tasks", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasks),
  });
  return response.ok;
}

document.addEventListener("DOMContentLoaded", async () => {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const resetButton = document.getElementById("resetButton");

  // Load tasks from tasks.json
  const preloadTasks = await fetchTasks();

  preloadTasks.forEach((task) => {
    addTask(task.name, task.duration);
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
  });

  resetButton.addEventListener("click", resetAllTasks);

  async function addTask(taskNameValue, taskDurationValue) {
    const taskName = document.getElementById("taskName");
    const taskDuration = document.getElementById("taskDuration");

    const name = taskNameValue || taskName.value;
    const duration = taskDurationValue || taskDuration.value;

    // Create task elements
    const task = document.createElement("div");
    task.className = "task";
    task.setAttribute("draggable", "true");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    const label = document.createElement("label");
    label.textContent = `${taskName.value} (${taskDuration.value} min)`;
    const timer = document.createElement("span");
    timer.textContent = taskDuration.value * 60;
    const playPauseButton = document.createElement("button");
    playPauseButton.textContent = "Play";
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    // Add elements to the task
    task.appendChild(checkBox);
    task.appendChild(label);
    task.appendChild(timer);
    task.appendChild(playPauseButton);
    task.appendChild(deleteButton);

    // Add event listeners
    checkBox.addEventListener("change", () => {
      task.classList.toggle("finished");
    });

    let intervalId = null;
    let timeRemaining = parseInt(timer.textContent, 10);

    playPauseButton.addEventListener("click", () => {
      if (!intervalId) {
        playPauseButton.textContent = "Pause";
        intervalId = setInterval(() => {
          timeRemaining -= 1;
          timer.textContent = timeRemaining;

          if (timeRemaining <= 0) {
            clearInterval(intervalId);
            intervalId = null;
            task.classList.add("finished");
            checkBox.checked = true;
            playPauseButton.disabled = true;
            const nextTask = task.nextElementSibling;
            if (nextTask && !nextTask.querySelector("input[type='checkbox']").checked) {
              nextTask.querySelector("button").click();
            }
          }
        }, 1000);
      } else {
        playPauseButton.textContent = "Play";
        clearInterval(intervalId);
        intervalId = null;
      }
    });

    deleteButton.addEventListener("click", () => {
      if (intervalId) {
          clearInterval(intervalId);
      }
      task.remove();
      const taskIndex = preloadTasks.findIndex(
        (t) => t.name === label.textContent.split(" (")[0]
      );
      if (taskIndex !== -1) {
        preloadTasks.splice(taskIndex, 1);
        localStorage.setItem("tasks", JSON.stringify(preloadTasks));
      }
    });

    // Append the task to the task list
    taskList.appendChild(task);

    // Save the task to tasks.json
    if (!taskNameValue && !taskDurationValue) {
      preloadTasks.push({ name, duration });
      await saveTasks(preloadTasks);
    }

    // Clear the input fields
    taskName.value = "";
    taskDuration.value = "";
  }

  function resetAllTasks() {
    const tasks = document.querySelectorAll(".task");
    tasks.forEach((task) => {
      const checkBox = task.querySelector("input[type='checkbox']");
      const timer = task.querySelector("span");
      const playPauseButton = task.querySelector("button");

      checkBox.checked = false;
      task.classList.remove("finished");

      const durationText = task.querySelector("label").textContent;
      const duration = parseInt(durationText.match(/\d+/)[0], 10) * 60;
      timer.textContent = duration;

      if (playPauseButton.textContent === "Pause") {
        playPauseButton.click();
      }
      playPauseButton.disabled = false;
    });
  }

  // Drag and drop functionality
  let draggedTask = null;

  taskList.addEventListener("dragstart", (e) => {
    draggedTask = e.target;
    e.target.style.opacity = 0.5;
  });

  taskList.addEventListener("dragend", (e) => {
    e.target.style.opacity = "";
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  taskList.addEventListener("dragenter", (e) => {
    if (e.target.className === "task") {
      e.target.style.border = "2px dashed #ccc";
    }
  });

  taskList.addEventListener("dragleave", (e) => {
    if (e.target.className === "task") {
      e.target.style.border = "";
    }
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.target.className === "task") {
      e.target.style.border = "";
    taskList.insertBefore(draggedTask, e.target.nextElementSibling);
    }
  });
});
