
const TASKS_URL = "http://127.0.0.1:8000/api/tasks/";

let selectedBoardCategory = sessionStorage.getItem("selectedBoardCategory") || "to-do";
let tasksData = {};
let tasksArray = [];
let currentTask = {};
let currentDraggedTaskKey = null;
let currentDraggedTaskId = null;
/**
 * This function initializes board.html. It is implemented on body onload.
 */
async function boardInit() {
  await fetchDataJson();
  await fetchTasksJson();
  createTaskOnBoard();
  checkAndAddNoTask();
  generateInitials();

  setTimeout(() => {
    addContactClickListeners();
  }, 500);
}


function addContactClickListeners() {
  let contacts = document.querySelectorAll(".task-on-board-contact");

  contacts.forEach(contact => {
    contact.addEventListener("click", () => {
      contact.classList.toggle("selected-contact");
    });
  });
}

/**
 * This function fetches all tasks dirctly from the TASK_URL defined in line 1.
 * It saves the data first as objects, then as arrays for rendering, then the keys of the tasks, to identify them.
 * @returns false if there is an error in fetching.
 */

async function fetchTasksJson() {
  try {
    const data = await fetchWithAuth(TASKS_URL);

    if (!data) throw new Error("❌ Keine Daten von API erhalten!");

    tasksArray = Object.values(data);
    tasksKeys = Object.keys(data);
    tasksArray.forEach((task, index) => {
      // console.log(`🔍 Task ${index}:`, task);
      // console.log(`👥 Kontakte für Task ${task.id}:`, task.contacts);
    });

  } catch (error) {
    console.error("❌ Fehler beim Laden der Tasks:", error);
  }
}

/**
 * This function renders the task cards in board.html. First it defines all board IDs for the different categorys. Then it clears all Boards and renders the cards.
 */

function createTaskOnBoard() {
  const boardIds = {
    "to-do": "to-do",
    "in-progress": "in-progress",
    "await-feedback": "await-feedback",
    "done": "done",
  };

  clearBoards(boardIds);

  tasksArray.forEach((task, key) => {
    let taskId = task.id || task._id || task.task_id || "undefined";
    let contactsHTML = generateContactsHTML(task.contacts);
    let boardId = boardIds[task.board_category] || selectedBoardCategory;
    let content = document.getElementById(boardId);
    let prioSrc = handlePrio(task.priority);
    let categoryClass = task.task_category.toLowerCase().includes("user") ? "user-story" : "technical-task";

    if (content) {
      content.innerHTML += generateTaskOnBoardHTML(key, taskId, categoryClass, task, contactsHTML, prioSrc);
    }
  });
}

/**
 * This function works by using the input field "Find Task". It is implemented by an oninput-handler in the HTML.
 */
function findTask() {
  let input = document.getElementById("find-task").value.toLowerCase();
  let filteredTasks = tasksArray.filter((task) => {
    return task.title.toLowerCase().includes(input) || task.description.toLowerCase().includes(input);
  });
  renderFilteredTasks(filteredTasks);
}

/**
 * Same function as findTask() but implemented on another div shown on mobile devices.
 */
function findTaskMobile() {
  let input = document.getElementById("find-task2").value.toLowerCase();
  let filteredTasks = tasksArray.filter((task) => {
    return task.title.toLowerCase().includes(input) || task.description.toLowerCase().includes(input);
  });
  renderFilteredTasks(filteredTasks);
}

/**
 * Same functionality as createTaskOnBoard, but for the filtered tasks by the findTask-function.
 * @param {array} filteredTasks - filtered tasks by oniput-handler in findTask().
 */
function renderFilteredTasks(taskId, filteredTasks) {
  const boardIds = { "to-do": "to-do", "in-progress": "in-progress", "await-feedback": "await-feedback", done: "done" };
  clearBoards(boardIds);

  for (let i = 0; i < filteredTasks.length; i++) {
    let task = filteredTasks[i];
    let key = tasksKeys[tasksArray.indexOf(task)];
    let contactsHTML = generateContactsHTML(task.contacts);
    let boardId = boardIds[task.board_category] || "to-do";
    let content = document.getElementById(boardId);
    let prioSrc = handlePrio(task.priority);
    let categoryClass = task.task_category === "User Story" ? "user-story" : "technical-task";
    if (!taskId || taskId === "undefined") {

      if (task.id) {
        taskId = task.id;
      } else if (task._id) {
        taskId = task._id;
      } else if (task.task_id) {
        taskId = task.task_id;
      } else {
        // console.error(" WARNUNG: Keine gültige ID gefunden!");
        return "";
      }
    }
    content.innerHTML += generateTaskOnBoardHTML(key, task.id, categoryClass, task, i, contactsHTML, prioSrc);
  }
  checkAndAddNoTask();
}

/**
 * This function empties all category boards before they are rendert again in other functions.
 * @param {array} boardIds - board categories to-do, in-progress, await-feedback and done
 */
function clearBoards(boardIds) {
  for (let id in boardIds) {
    let content = document.getElementById(boardIds[id]);
    if (content) {
      content.innerHTML = "";
    }
  }
}

/**
 * This function displays the assigned contacts on the cards on the board by initials.
 * @param {array} contacts - task.contacts
 * @returns HTMLs of the first four assigned contacts and the HTML with the number of the further contacts, if there are more.
 */
/**
 * This function displays the assigned contacts on the cards on the board by initials.
 * @param {array} contacts - task.contacts
 * @returns HTMLs of the first four assigned contacts and the HTML with the number of the further contacts, if there are more.
 */

function generateContactsHTML(contacts) {
  contacts = contacts || {};
  const contactCount = Object.keys(contacts).length;
  const displayedContacts = getDisplayedContactsHTML(contacts);
  const remainingContacts = getRemainingContactsHTML(contactCount);

  return displayedContacts + remainingContacts;
}

/**
 * This function renders the first four assigned task contacts on the card on the board.
 * @param {array} contacts - task.contacts
 * @returns HTMLs of the first four assigned contacts
 */
function getDisplayedContactsHTML(contacts) {
  let contactsHTML = "";
  let displayedContacts = 0;

  for (let key in contacts) {
    if (contacts.hasOwnProperty(key) && displayedContacts < 4) {
      const contact = contacts[key];
      contactsHTML += generateContact(contact);
      displayedContacts++;
    } else if (displayedContacts >= 4) {
      break;
    }
  }

  return contactsHTML;
}


/**
 * This function returns a HTML with the number of further contacts if there are more than four on the card on the board..
 * @param {number} contactCount - task.contacts[length]
 * @returns HTML with the number of further contacts or nothing if there are four assigned contacts or less.
 */
function getRemainingContactsHTML(contactCount) {
  if (contactCount > 4) {
    const remainingContacts = contactCount - 4;
    return generateRemainingContactsHTML(remainingContacts);
  }
  return "";
}

/**
 * This function displays the correct image for each prio status on the cards on the board
 * @param {string} prio - task.prio
 * @returns the correct image correspondant to urgent, medium or low
 */
function handlePrio(priority) {
  if (priority === "urgent") {
    return "/add_task_img/high.svg";
  } else if (priority === "medium") {
    return "/add_task_img/medium.svg";
  } else if (priority === "low") {
    return "/add_task_img/low.svg";
  } else {
    return "/add_task_img/medium.svg";
  }
}

/**
 * This function defines and calculates the variables needed for showing the subtask status on the cards on the board and then returns the card HTMLs.
 * @param {string} key - task key
 * @param {string} categoryClass - task.task_category
 * @param {string} task
 * @param {number} i
 * @param {string} contactsHTML - contact initials in the task cards
 * @param {string} prioSrc - source of the image used for prio status
 * @returns the HTML of the task cards
 */
function generateTaskOnBoardHTML(key, taskId, categoryClass, task, contactsHTML, prioSrc) {
  let subtasks = task.subtasks || {};
  let totalSubtasks = Object.keys(subtasks).length;
  let completedSubtasks = Object.values(subtasks).filter((subtask) => subtask.completed).length;
  let progressPercentage = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;
  return getTaskOnBoardHTML(taskId, categoryClass, task, key, contactsHTML, prioSrc, totalSubtasks, completedSubtasks, progressPercentage);
}

/**
 * This function separates the first and the last name, then returns the initials as big letters.
 * @param {string} name - contact.name
 * @returns initials
 */
function getInitials(name) {
  let initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");
  return initials.toUpperCase();
}

/**
 * This function adds a div with "No task in this category", if it is empty.
 */
function checkAndAddNoTask() {
  const taskAreas = ["to-do", "in-progress", "await-feedback", "done"];

  taskAreas.forEach((id) => {
    const element = document.getElementById(id);
    if (element && element.children.length === 0) {
      const noTaskDiv = document.createElement("div");
      noTaskDiv.className = "no-task";
      noTaskDiv.innerHTML = `No tasks in ${id.replace(/-/g, " ")}`;
      element.appendChild(noTaskDiv);
    }
  });
}

/**
 * This function starts the dragging activity on tasks on the board.
 * @param {string} key - task key
 */

function startDragging(key, taskId) {
  if (!taskId || taskId === 0) {
    console.error(" Fehler: Task-ID ist ungültig!", taskId);
    return;
  }
  currentDraggedTaskKey = taskId;
}

function allowDrop(ev) {
  ev.preventDefault();
  var taskArea = ev.currentTarget;
  taskArea.classList.add("hover");
}


/**
 * This function removes the hover-effekt during drag&drop.
 * @param {event} ev
 */
function resetBackground(ev) {
  ev.currentTarget.classList.remove("hover");
}

/**
 * This ondrop-function changes the category of the relevant task and re-renders the board.
 * @param {string} category
 */

async function moveTo(category, taskId) {
  if (!taskId || taskId === 0) {
    console.error(" Fehler: Task-ID ist ungültig!", taskId);
    return;
  }

  try {
    const response = await fetchWithAuth(`${TASKS_URL}${taskId}/`, "PATCH", {
      board_category: category.toLowerCase(),
    });

    await fetchTasksJson();
    createTaskOnBoard();
    checkAndAddNoTask();
  } catch (error) {
    console.error(" Fehler beim Verschieben des Tasks:", error);
  }
}

/**
 * Standard drop function
 * @param {event} ev
 * @param {string} category - new board category
 */

function drop(event, category) {
  event.preventDefault();
  var taskArea = event.currentTarget;
  taskArea.classList.remove("hover");

  if (!currentDraggedTaskKey || currentDraggedTaskKey === 0) {
    // console.error("❌ Kein gültiger Task zum Verschieben gefunden!", currentDraggedTaskKey);
    return;
  }

  moveTo(category, currentDraggedTaskKey);
}

/**
 * This function puts a single task attribute on firebase. It can be used for every attribute by choosing urlSuffix.
 * @param {string} key - task key
 * @param {string} newBoardCategory - new attribute to be pushed
 * @param {string} urlSuffix - chooses attribute
 * @returns response
 */
async function updateTaskAttribute(taskId, newBoardCategory) {
  try {
    let response = await fetchWithAuth(TASKS_URL + taskId + "/", {
      method: "PUT",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify(newBoardCategory),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating board category:", error);
    throw error;
  }
}

/**
 * This function moves task to the previous or next board category by clicking on the arrows shown on the task cards on mobile.
 * @param {string} direction 
 * @param {string} taskKey 
 */
function moveTask(direction, taskKey) {
  const categoryOrder = ["to-do", "in-progress", "await-feedback", "done"];
  const taskElement = document.querySelector(`[data-key="${taskKey}"]`);
  const currentCategoryElement = taskElement.closest(".task-area");
  const currentCategory = currentCategoryElement.id;
  let currentIndex = categoryOrder.indexOf(currentCategory);

  if (direction === "up") {
    currentIndex = currentIndex === 0 ? categoryOrder.length - 1 : currentIndex - 1;
  } else if (direction === "down") {
    currentIndex = currentIndex === categoryOrder.length - 1 ? 0 : currentIndex + 1;
  }

  const newCategory = categoryOrder[currentIndex];
  moveTo(newCategory, taskKey);
}

/**
 * Standard function for posting tasks on firebase.
 * @param {string} path - in this case empty
 * @param {object} data - empty
 * @returns response
 */
async function postTask(data) {
  try {
    await fetchWithAuth(TASKS_URL, "POST", data);
    await boardInit();
  } catch (error) {
    console.error("Fehler beim Erstellen des Tasks:", error);
  }
}

/**
 * Standard function for deleting tasks on firebase.
 * @param {string} key - task key
 */
async function deleteTask(taskId) {
  try {
    await fetchWithAuth(TASKS_URL + taskId + "/", "DELETE");
    await boardInit();
    closeTask();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

/**
 * This function separates two words and takes the first letters of each as big letters.
 * @param {string} word
 * @returns initials
 */
function capitalize(word) {
  if (!word || typeof word !== "string") {
    console.error("Fehler in capitalize: Wort ist undefined oder kein String!", word);
    return "Unbekannt";  // Standardwert setzen
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function logOut() {
  sessionStorage.clear();
  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("email");
  localStorage.removeItem("password");

  if (document.getElementById("loginEmail")) {
    document.getElementById("loginEmail").value = "";
  }
  if (document.getElementById("loginPassword")) {
    document.getElementById("loginPassword").value = "";
  }

  window.location.href = "index.html";
}