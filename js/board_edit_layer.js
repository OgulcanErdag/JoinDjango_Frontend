/**
   * This function is called in the task layer to switch to the edit mode.
   * @param {*} taskKey - task key
   */
window.showEditTask = async function (taskKey) {

  await fetchUpdatedTaskData(taskKey);

  const task = tasksData[taskKey];

  if (!taskKey) {
    console.error(`Fehler: Kein Task mit der ID ${taskKey} gefunden.`);
    return;
  }

  let content = document.getElementById("show-task-inner-layer");
  content.innerHTML = generateEditTaskLayer(task, taskKey);
};

async function fetchUpdatedTaskData(taskKey) {
  try {

    const token = localStorage.getItem("access_token");  // Token abrufen
    if (!token) {
      console.error("Kein Token gefunden! Benutzer ist nicht eingeloggt.");
      return;
    }
    const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskKey}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      }
    });

    if (!response.ok) {
      console.error(`API-Fehler: ${response.status} - ${response.statusText}`);
      return;
    }

    const updatedTask = await response.json();

    if (JSON.stringify(tasksData[taskKey]) === JSON.stringify(updatedTask)) {
      return;
    }

    tasksData[taskKey] = updatedTask;

    if (typeof showEditTask === "function") {
      showEditTask(taskKey);
    }

  } catch (error) {
    console.error("Fehler beim Laden des aktualisierten Tasks:", error);
  }
}

/**
 * Standard put-function for updating tasks. It is used in saveTaskChanges().
 * @param {string} key - task key
 * @param {object} updatedTask - new object to be put
 * @returns response.json
 */
async function updateTask(key, updatedTask) {
  try {
    if (!updatedTask.contact_ids || updatedTask.contact_ids.length === 0) {
      console.warn("WARNUNG: `contact_ids` ist leer! Überprüfe die Auswahl im Frontend.");
    }
    const response = await fetchWithAuth(`tasks/${key}/`, "PATCH", updatedTask);
    if (response) {
      await boardInit();
    }
  } catch (error) {
    console.error("Fehler beim Task-Update:", error);
  }
}

/**
 * This function executes the changes in the task edit layer and shows them.
 * @param {string} key - task key
 */
async function saveTaskChanges(key) {
  try {
    console.log("🔵 Vorherige Kontakte aus currentTask:", currentTask.contact_ids);
    let contactIds = getSelectedContactIds();

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      console.log("⚠️ contact_ids ist leer! Übernehme alte Kontakte...");
      contactIds = currentTask.contact_ids || [];
    }

    console.log("🟢 Kontakte nach Auswahl:", contactIds);

    const updatedTask = getUpdatedTask(contactIds, getSubtasksObj());
    console.log("🔴 Kontakte in updatedTask:", updatedTask.contact_ids);

    await updateTask(key, updatedTask);
    showEditTask(key);
  } catch (error) {
    console.error("Fehler beim Speichern der Task-Änderungen:", error);
  }
}



/**
 * This function updates changes in contacts of edit task layer and shows them.
 * @param {string} key - task key
 */
async function saveEditContacts(key) {
  try {
    const contact_ids = getSelectedContactIds();

    if (!Array.isArray(contact_ids)) {
      throw new Error("❌ `contact_ids` ist kein Array!");
    }

    const updatedTask = { contact_ids: contact_ids };

    await updateTask(key, updatedTask);

    await fetchUpdatedTaskData(key);

    setTimeout(() => showEditTask(key), 100);

  } catch (error) {
    console.error("Fehler beim Speichern der Kontakte:", error);
  }
}

/**
 * This function filters all elements of selectedContacts which are true and returns them.
 * @returns true elements as objects
 */
function getSelectedContactIds() {
  let selectedIds = [];
  document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
    if (checkbox.checked) {
      selectedIds.push(parseInt(checkbox.dataset.contactId));
    }
  });

  console.log("🟠 `contact_ids` aus Checkboxen:", selectedIds);
  return selectedIds;
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
function getUpdatedTask(contactIds, subtasksObj) {
  if (!contactIds || contactIds.length === 0) {
    console.log("⚠️ selectedContacts ist leer, setze auf alte Werte...");
    contactIds = currentTask.contact_ids || [];
  }

  return {
    task_category: currentTask.task_category,
    board_category: currentTask.board_category,
    contact_ids: contactIds, // Hier sicherstellen, dass sie bleiben!
    subtasks: subtasksObj,
    title: document.getElementById("edit-title-input").value,
    description: document.getElementById("edit-description-input").value,
    due_date: document.getElementById("edit-date-input").value,
    priority: getSelectedPriority(),
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

  let contacts = Array.isArray(task.contacts) ? task.contacts : [];
  let taskSubtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  let contactsHTML = getEditContactsHTML(contacts);
  let subtasksHTML = getEditSubtasksHTML(taskSubtasks);
  let highSelected = task.priority === "urgent" ? "selected-high-button" : "";
  let highImgSrc = task.priority === "urgent" ? "add_task_img/high-white.svg" : "add_task_img/high.svg";
  let mediumSelected = task.priority === "medium" ? "selected-medium-button" : "";
  let mediumImgSrc = task.priority === "medium" ? "add_task_img/medium-white.svg" : "add_task_img/medium.svg";
  let lowSelected = task.priority === "low" ? "selected-low-button" : "";
  let lowImgSrc = task.priority === "low" ? "add_task_img/low-white.svg" : "add_task_img/low.svg";

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