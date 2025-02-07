
/**
 * Sets up the subtask input field to create a new subtask on Enter key press,
 * hides the plus icon, and shows the close subtask option.
 */
function newSubtask() {
  document.getElementById("subtask-field").addEventListener("keydown", function (press) {
    if (press.key === "Enter") {
      createSubtask();
    }
  });

  let subtaskPlus = document.getElementById("subtask-plus");
  subtaskPlus.classList.add("d-none");

  let closeSubtask = document.getElementById("edit-subtask");
  closeSubtask.classList.remove("d-none");

  document.getElementById("edit-subtask").innerHTML = newSubtaskHTML();
}

/**
 * Resets the subtask input field and updates the UI to hide the close subtask option.
 */
function closeSubtask() {
  let input = document.getElementById("subtask-field");
  input.value = "";
  let subtaskPlus = document.getElementById("subtask-plus");
  subtaskPlus.classList.remove("d-none");

  let closeSubtask = document.getElementById("edit-subtask");
  closeSubtask.classList.add("d-none");
}

/**
 * Creates a new subtask and updates the subtask list UI.
 */
function createSubtask() {
  let input = document.getElementById("subtask-field");
  if (input.value.trim() === "") {
    return;
  }
  subtasks.push({ title: input.value, completed: false });
  let createSubtask = document.getElementById("create-subtask");
  createSubtask.innerHTML = "";
  for (let i = 0; i < subtasks.length; i++) {
    let subtask = subtasks[i];
    if (input.value != "") {
      createSubtask.innerHTML += createSubtaskHTML(i, subtask);
    }
  }
  input.value = "";
}

/**
 * Renders the list of subtasks in the UI.
 */
function renderSubtasks() {
  let createSubtask = document.getElementById("create-subtask");
  createSubtask.innerHTML = "";

  for (let i = 0; i < subtasks.length; i++) {
    let subtask = subtasks[i];
    createSubtask.innerHTML += renderSubtasksHTML(i, subtask);
  }
}

/**
 * Changes the subtask layer to the edit state for a specific subtask.
 * @param {number} i - The index of the subtask to edit.
 */
function changeSubtaskLayer(i) {
  document.getElementById(`subtask-tasks${i}`).classList.remove("subtask-tasks");
  document.getElementById(`subtask-tasks${i}`).classList.remove("subtask-tasks:hover");
  document.getElementById(`subtask-tasks${i}`).classList.add("subtask-tasks-edit");
}

/**
 * Changes the subtask content to an editable state for a specific subtask.
 * @param {number} i - The index of the subtask to edit.
 */
function changeSubtask(i) {
  let editLogo = document.getElementById(`edit-logo${i}`);
  let editedSubtask = document.getElementById(`subtask-${i}`).innerText;
  let required = document.getElementById("subtask-required");
  let redBorder = document.getElementById(`subtask-tasks${i}`);
  editLogo.src = "add_task_img/check.svg";
  if (editedSubtask === "") {
    required.innerHTML = "";
    redBorder.style.borderBottom = "1px solid #29abe2";
  }
  changeSubtaskLayer(i);
  let createSubtask = document.getElementById(`subtask-${i}`);
  let currentText = subtasks[i].title;
  createSubtask.innerHTML = `
    <div class="subtask-edit">
      <div contenteditable="true" id="subtask-${i}" class="subtask-edit-div">${currentText}</div>
    </div>
  `;
}

/**
 * Determines whether to update or change the subtask based on the current state.
 * @param {number} i - The index of the subtask to check.
 */
function whichSourceSubtask(i) {
  let editLogo = document.getElementById(`edit-logo${i}`);
  if (editLogo.src.endsWith("add_task_img/check.svg")) {
    updateSubtask(i);
  } else {
    changeSubtask(i);
  }
}

/**
 * Updates the subtask layer to the default state for a specific subtask.
 * @param {number} i - The index of the subtask to update.
 */
function updateSubtaskLayer(i) {
  document.getElementById(`subtask-tasks${i}`).classList.add("subtask-tasks");
  document.getElementById(`subtask-tasks${i}`).classList.add("subtask-tasks:hover");
  document.getElementById(`subtask-tasks${i}`).classList.remove("subtask-tasks-edit");
}

/**
 * Updates the content of a specific subtask.
 * @param {number} i - The index of the subtask to update.
 */
function updateSubtask(i) {
  let editedSubtask = document.getElementById(`subtask-${i}`).innerText;
  let editSubtask = editedSubtask.trim();
  let required = document.getElementById("subtask-required");
  let redBorder = document.getElementById(`subtask-tasks${i}`);
  if (editSubtask === "") {
    required.innerHTML = `<div class="title-required">fill out subtask</div>`;
    redBorder.style.borderBottom = "1px solid #ff8190";
  } updateSubtaskLayer(i);
  subtasks[i].title = editedSubtask;
  let createSubtask = document.getElementById(`subtask-${i}`);
  createSubtask.innerHTML = `${editedSubtask}`;
  let editLogo = document.getElementById(`edit-logo${i}`);
  editLogo.src = "add_task_img/edit.svg";
}

/**
 * Deletes a subtask from the subtasks array and re-renders the subtasks.
 * @param {number} i - Index of the subtask to be deleted.
 */
function deleteSubtask(i) {
  subtasks.splice(i, 1);
  renderSubtasks();
}

/**
* Clears the subtasks array and re-renders the subtasks.
*/
function clearSubtasks() {
  subtasks = [];
  renderSubtasks();
  standardButton();
}

/**
* Collects the data of subtasks.
*
* @returns {Object} An object containing the subtasks data.
*/
function getSubtasksData() {
  return subtasks.reduce((acc, subtask, index) => {
    acc[`subtask${index + 1}`] = {
      title: subtask.title,
      completed: subtask.completed,
    };
    return acc;
  }, {});
}