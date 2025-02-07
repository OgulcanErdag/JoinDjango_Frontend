/**
   * This function is called in the task layer to switch to the edit mode.
   * @param {*} taskKey - task key
   */
function showEditTask(taskKey) {
  const task = tasksData[taskKey];
  let content = document.getElementById("show-task-inner-layer");
  let currentHeight = content.scrollHeight;
  content.style.height = currentHeight + "px";
  content.innerHTML = generateEditTaskLayer(task, taskKey);
}

/**
 * Standard put-function for updating tasks. It is used in saveTaskChanges().
 * @param {string} key - task key
 * @param {object} updatedTask - new object to be put
 * @returns response.json
 */
async function updateTask(key, updatedTask) {
  try {
    let response = await fetch(TASKS_URL + key + ".json", {
      method: "PUT",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify(updatedTask),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * This function executes the changes in the task edit layer and shows them.
 * @param {string} key - task key
 */
function saveTaskChanges(key) {
  const selectedContactsData = getSelectedContactsData();
  const subtasksObj = getSubtasksObj();
  const updatedTask = getUpdatedTask(selectedContactsData, subtasksObj);

  updateTask(key, updatedTask)
    .then(() => {
      handleTaskUpdateSuccess();
    })
    .catch((error) => console.error("Error updating task:", error));
}

/**
 * This function updates changes in contacts of edit task layer and shows them.
 * @param {string} key - task key
 */
async function saveEditContacts(key) {
  try {
    const selectedContactsData = getSelectedContactsData();
    const subtasksObj = getSubtasksObj();
    const updatedTask = getUpdatedTask(selectedContactsData, subtasksObj);

    await updateTask(key, updatedTask);
    await boardInit();

    showEditTask(currentTaskKey);
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

/**
 * This function filters all elements of selectedContacts which are true and returns them.
 * @returns true elements as objects
 */
function getSelectedContactsData() {
  return selectedContacts.reduce((acc, isSelected, index) => {
    if (isSelected) {
      acc[`contact${index + 1}`] = contactsArray[index];
    }
    return acc;
  }, {});
}

/**
 * This function filters all elements of subtasks which are dependant to a specific task and returns them.
 * @returns relevant subtasks as objects.
 */
function getSubtasksObj() {
  return subtasks.reduce((acc, subtask, index) => {
    acc[`subtask${index + 1}`] = {
      title: subtask.title,
      completed: subtask.completed,
    };
    return acc;
  }, {});
}

/**
 * This function returns an updated task object.
 * @param {array} selectedContactsData - relevant contacts
 * @param {array} subtasksObj - relevant subtasks
 * @returns updated task object
 */
function getUpdatedTask(selectedContactsData, subtasksObj) {
  return {
    task_category: currentTask.task_category,
    board_category: currentTask.board_category,
    contacts: selectedContactsData,
    subtasks: subtasksObj,
    title: document.getElementById("edit-title-input").value,
    description: document.getElementById("edit-description-input").value,
    due_date: document.getElementById("edit-date-input").value,
    prio: getSelectedPriority(),
  };
}

/**
 * This function returns the marked prio for getUpdatedTask():
 * @returns marked prio
 */
function getSelectedPriority() {
  if (document.querySelector(".prio-buttons.selected-high-button")) {
    return "urgent";
  } else if (document.querySelector(".prio-buttons.selected-medium-button")) {
    return "medium";
  } else if (document.querySelector(".prio-buttons.selected-low-button")) {
    return "low";
  } else {
    return currentTask.prio;
  }
}

/**
 * This function defines the end of saveTaskChanges(). It closes the layer and renders the board.
 */
function handleTaskUpdateSuccess() {
  closeTask();
  boardInit();
  subtasks = [];
}

/**
 * This function generates the edit task layer.
 * @param {object} task
 * @param {string} key - task key
 * @returns the HTML of the relevant edit task layer
 */
function generateEditTaskLayer(task, key) {
  currentTask = task;
  let contacts = task.contacts || {};
  let taskSubtasks = task.subtasks || {};
  let contactsHTML = getEditContactsHTML(contacts);
  let subtasksHTML = getEditSubtasksHTML(taskSubtasks);

  let highSelected = task.prio === "urgent" ? "selected-high-button" : "";
  let highImgSrc = task.prio === "urgent" ? "add_task_img/high-white.svg" : "add_task_img/high.svg";
  let mediumSelected = task.prio === "medium" ? "selected-medium-button" : "";
  let mediumImgSrc = task.prio === "medium" ? "add_task_img/medium-white.svg" : "add_task_img/medium.svg";
  let lowSelected = task.prio === "low" ? "selected-low-button" : "";
  let lowImgSrc = task.prio === "low" ? "add_task_img/low-white.svg" : "add_task_img/low.svg";

  return getEditHTML(task, key, contactsHTML, subtasksHTML, highSelected, highImgSrc, mediumSelected, mediumImgSrc, lowSelected, lowImgSrc);
}

/**
 * This function generates HTML for all subtasks in the edit layer and updates the global subtasks array.
 *
 * @param {Object} taskSubtasks - An object containing all subtasks for a task.
 * @returns {string} The concatenated HTML string for all subtasks.
 */
function getEditSubtasksHTML(taskSubtasks) {
  subtasks = [];

  return Object.keys(taskSubtasks)
    .map((subtaskKey, index) => {
      let subtask = taskSubtasks[subtaskKey];
      subtasks.push({ title: subtask.title, completed: subtask.completed });
      return getSubtaskHTML(subtask, index);
    })
    .join("");
}

/**
 * This function renders the existing contact bubbles in the edit task layer. The first four contacts are shown with initials,
 * followed by a bubble with the number of further connected contacts.
 * @param {array} contacts
 * @returns the HTMLs of the contact bubbles and the number of the rest contacts.
 */
function getEditContactsHTML(contacts) {
  contacts = contacts || {};
  let contactCount = Object.keys(contacts).length;

  let contactsHTML = getFirstFourContacts(contacts);
  contactsHTML += getRestContacts(contactCount);

  return contactsHTML;
}

/**
 * This function renders the existing contact bubbles in the edit task layer. The first four contacts are shown with initials.
 * @param {array} contacts
 * @returns the HTMLs of the first four contact bubbles
 */
function getFirstFourContacts(contacts) {
  let contactsHTML = "";
  let displayedContacts = 0;

  for (let key in contacts) {
    if (contacts.hasOwnProperty(key)) {
      let contact = contacts[key];
      if (displayedContacts < 4) {
        contactsHTML += getContactHTML(contact);
        displayedContacts++;
      } else {
        break;
      }
    }
  }
  return contactsHTML;
}