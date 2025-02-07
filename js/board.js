const TASKS_URL = "https://joindjango-default-rtdb.europe-west1.firebasedatabase.app/tasks/";

let tasksData = {};
let tasksArray = [];
let tasksKeys = [];
currentTaskKey = 0;
currentTask = {};
let currentBoardCategory = "";

/**
 * This function initializes board.html. It is implemented on body onload.
 */
async function boardInit() {
  await fetchTasksJson();
  await fetchDataJson();
  createTaskOnBoard();
  checkAndAddNoTask();
  generateInitials();
}

/**
 * This function fetches all tasks dirctly from the TASK_URL defined in line 1.
 * It saves the data first as objects, then as arrays for rendering, then the keys of the tasks, to identify them.
 * @returns false if there is an error in fetching.
 */
async function fetchTasksJson() {
  try {
    let response = await fetch(TASKS_URL + ".json");
    let responseToJson = await response.json();
    tasksData = responseToJson || {};
    tasksArray = Object.values(tasksData);
    tasksKeys = Object.keys(tasksData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
}

/**
 * This function renders the task cards in board.html. First it defines all board IDs for the different categorys. Then it clears all Boards and renders the cards.
 */
function createTaskOnBoard() {
  const boardIds = { "to-do": "to-do", "in-progress": "in-progress", "await-feedback": "await-feedback", done: "done", };
  clearBoards(boardIds);

  for (let i = 0; i < tasksArray.length; i++) {
    let task = tasksArray[i];
    let key = tasksKeys[i];
    let contactsHTML = generateContactsHTML(task.contacts);
    let boardId = boardIds[task.board_category] || "to-do";
    let content = document.getElementById(boardId);
    let prioSrc = handlePrio(task.prio);
    let categoryClass = task.task_category === "User Story" ? "user-story" : "technical-task";

    content.innerHTML += generateTaskOnBoardHTML(key, categoryClass, task, i, contactsHTML, prioSrc);
  }
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
function renderFilteredTasks(filteredTasks) {
  const boardIds = { "to-do": "to-do", "in-progress": "in-progress", "await-feedback": "await-feedback", done: "done" };
  clearBoards(boardIds);

  for (let i = 0; i < filteredTasks.length; i++) {
    let task = filteredTasks[i];
    let key = tasksKeys[tasksArray.indexOf(task)];
    let contactsHTML = generateContactsHTML(task.contacts);
    let boardId = boardIds[task.board_category] || "to-do";
    let content = document.getElementById(boardId);
    let prioSrc = handlePrio(task.prio);
    let categoryClass = task.task_category === "User Story" ? "user-story" : "technical-task";
    content.innerHTML += generateTaskOnBoardHTML(key, categoryClass, task, i, contactsHTML, prioSrc);
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
function handlePrio(prio) {
  if (prio === "urgent") {
    return "/add_task_img/high.svg";
  } else if (prio === "medium") {
    return "/add_task_img/medium.svg";
  } else if (prio === "low") {
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
function generateTaskOnBoardHTML(key, categoryClass, task, i, contactsHTML, prioSrc) {
  let subtasks = task.subtasks || {};
  let totalSubtasks = Object.keys(subtasks).length;
  let completedSubtasks = Object.values(subtasks).filter((subtask) => subtask.completed).length;
  let progressPercentage = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return getTaskOnBoardHTML(key, categoryClass, task, i, contactsHTML, prioSrc, totalSubtasks, completedSubtasks, progressPercentage);
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
      noTaskDiv.innerHTML = `No tasks ${id.replace(/-/g, " ")}`;
      element.appendChild(noTaskDiv);
    }
  });
}

/**
 * This function starts the dragging activity on tasks on the board.
 * @param {string} key - task key
 */
function startDragging(key) {
  currentDraggedTaskKey = key;
}

/**
 * This function enables dropping an element in the board.
 * @param {event} ev
 */
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
  var taskArea = ev.currentTarget;
  taskArea.classList.remove("hover");
}

/**
 * This ondrop-function changes the category of the relevant task and re-renders the board.
 * @param {string} category
 */
async function moveTo(category, taskKey) {
  if (taskKey) {
    await updateTaskAttribute(taskKey, category, "board_category");
    await fetchTasksJson();
    createTaskOnBoard();
    checkAndAddNoTask();
  }
}

/**
 * Standard drop function
 * @param {event} ev
 * @param {string} category - new board category
 */
function drop(ev, category) {
  ev.preventDefault();
  var taskArea = ev.currentTarget;
  taskArea.classList.remove("hover");
  moveTo(category, currentDraggedTaskKey);
}

/**
 * This function puts a single task attribute on firebase. It can be used for every attribute by choosing urlSuffix.
 * @param {string} key - task key
 * @param {string} newBoardCategory - new attribute to be pushed
 * @param {string} urlSuffix - chooses attribute
 * @returns response
 */
async function updateTaskAttribute(key, newBoardCategory, urlSuffix) {
  try {
    let response = await fetch(TASKS_URL + key + "/" + urlSuffix + ".json", {
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
async function postTask(path = "", data = {}) {
  try {
    let response = await fetch(TASKS_URL + path + ".json", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting data:", error);
  }
}

/**
 * Standard function for deleting tasks on firebase.
 * @param {string} key - task key
 */
async function deleteTask(key) {
  try {
    let response = await fetch(TASKS_URL + key + ".json", {
      method: "DELETE",
    });
    await response.json();
    await boardInit();
    closeTask();
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}

/**
 * This function separates two words and takes the first letters of each as big letters.
 * @param {string} word
 * @returns initials
 */
function capitalize(word) {
  if (!word || typeof word !== "string") {
    console.error("❌ Fehler in capitalize: Wort ist undefined oder kein String!", word);
    return "Unbekannt";  // Standardwert setzen
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}