let subtasks = [];
let selectedContacts = {};
let currentTaskIndex = 0;
let lastCreatedTask = null;

const contactDropdown = document.getElementById("add-task-contacts");
const categoryDropdown = document.getElementById("category");

/**
 * Highlights the medium priority button and updates its image.
 */
function standardButton() {
  document.getElementById("mediumButton").classList.add("selected-medium-button");
  document.getElementById("mediumButtonImg").src = "../add_task_img/medium-white.svg";
}

/**
 * Highlights the high priority button, updates its image,
 * and resets the medium and low priority buttons.
 */
function highButton() {
  document.getElementById("highButton").classList.add("selected-high-button");
  document.getElementById("highButtonImg").src = "../add_task_img/high-white.svg";

  document.getElementById("mediumButton").classList.remove("selected-medium-button");
  document.getElementById("mediumButtonImg").src = "../add_task_img/medium.svg";

  document.getElementById("lowButton").classList.remove("selected-low-button");
  document.getElementById("lowButtonImg").src = "../add_task_img/low.svg";
}

/**
 * Highlights the medium priority button, updates its image,
 * and resets the high and low priority buttons.
 */
function mediumButton() {
  document.getElementById("mediumButton").classList.add("selected-medium-button");
  document.getElementById("mediumButtonImg").src = "../add_task_img/medium-white.svg";

  document.getElementById("highButton").classList.remove("selected-high-button");
  document.getElementById("highButtonImg").src = "../add_task_img/high.svg";

  document.getElementById("lowButton").classList.remove("selected-low-button");
  document.getElementById("lowButtonImg").src = "../add_task_img/low.svg";
}

/**
 * Highlights the low priority button, updates its image,
 * and resets the high and medium priority buttons.
 */
function lowButton() {
  document.getElementById("lowButton").classList.add("selected-low-button");
  document.getElementById("lowButtonImg").src = "../add_task_img/low-white.svg";

  document.getElementById("mediumButton").classList.remove("selected-medium-button");
  document.getElementById("mediumButtonImg").src = "../add_task_img/medium.svg";

  document.getElementById("highButton").classList.remove("selected-high-button");
  document.getElementById("highButtonImg").src = "../add_task_img/high.svg";
}

/**
 * Toggles the visibility of the category dropdown and initializes its content.
 */
function category() {
  let categoryDropdown = document.getElementById("category");
  categoryDropdown.classList.toggle("d-none");

  document.getElementById("category").innerHTML = `<div class="category-options">
  <span onclick="technicalTask()">Technical Task</span>
  <span onclick="userStory()">User Story</span>
  </div>`;
  emptyCategory();
}

/**
 * Sets the task category to "Technical Task" and hides the category dropdown.
 */
function technicalTask() {
  let category = document.getElementById("category");
  document.getElementById("task-category").innerHTML = "Technical Task";
  category.classList.add("d-none");
  category.innerHTML = "";
  emptyCategory();
}

/**
 * Sets the task category to "User Story" and hides the category dropdown.
 */
function userStory() {
  let category = document.getElementById("category");
  document.getElementById("task-category").innerHTML = "User Story";
  category.classList.add("d-none");
  category.innerHTML = "";
  emptyCategory();
}

/**
 * Updates the style of the date input field based on its value.
 */
function updateDateStyle() {
  let date = document.getElementById("date-input");
  let required = document.getElementById("date-required");

  if (date.value.length === 0) {
    document.getElementById("date-input").style.color = "#d1d1d1";
    date.style.borderColor = "red";
    required.innerHTML = `<div class="title-required">this field is required</div>`;
  } else if (date.value.length > 0) {
    document.getElementById("date-input").style.color = "black";
    date.style.borderColor = "#29abe2";
    required.innerHTML = "";
  }
}

/**
 * Initializes the add task process by fetching necessary data and setting up the interface.
 */
async function initializeAddTask() {
  await fetchDataJson();
  generateInitials();
  standardButton();
}

/**
 * Clears the task input fields and resets the interface.
 */
function clearTask() {
  let description = document.getElementById("description-input");
  if (description) description.value = "";

  let dueDate = document.getElementById("date-input");
  if (dueDate) {
    dueDate.value = "";
    dueDate.style.color = "#d1d1d1";
  }

  let contactsDiv = document.getElementById("add-task-contacts");
  if (contactsDiv) contactsDiv.classList.add("d-none");

  clearButtons();
  clearSubtasks();
  clearContacts();

  let taskCategory = document.getElementById("task-category");
  if (taskCategory) taskCategory.innerText = "Select task category";

  let title = document.getElementById("title-input");
  if (title) title.value = "";

  let contactContainer = document.getElementById("add-task-contactsHTML");
  if (contactContainer) contactContainer.innerHTML = ""; // Löscht die Kontakte

  let categoryDropdown = document.getElementById("task-category");
  if (categoryDropdown) categoryDropdown.value = ""; // Setzt die Kategorie auf leer zurück

  let subtaskContainer = document.getElementById("subtask-container");
  if (subtaskContainer) subtaskContainer.innerHTML = ""; // Löscht alle Subtasks
}

/**
 * Clears the selection state of priority buttons.
 */
function clearButtons() {
  document.getElementById("mediumButton").classList.remove("selected-medium-button");
  document.getElementById("mediumButtonImg").src = "../add_task_img/medium.svg";

  document.getElementById("highButton").classList.remove("selected-high-button");
  document.getElementById("highButtonImg").src = "../add_task_img/high.svg";

  document.getElementById("lowButton").classList.remove("selected-low-button");
  document.getElementById("lowButtonImg").src = "../add_task_img/low.svg";
}

/**
 * Validates if the task category is selected and displays an error if not.
 */
function emptyCategory() {
  let taskCategoryInput = document.getElementById("category-input");
  let taskCategory = document.getElementById("task-category").innerText;
  let required = document.getElementById("category-required");
  if (taskCategory === "Select task category") {

  } else if (taskCategory === "User Story" || taskCategory === "Technical Task") {
    taskCategoryInput.style.borderColor = "#29abe2";
    required.innerHTML = "";
  }
}

/**
 * Checks if the task category is not selected and indicates that the category field is required.
 * If the task category is "Select task category", the border color of the input field is changed to red
 * and a required message is displayed.
 */
function emptyCategoryRequired() {
  let taskCategoryInput = document.getElementById("category-input");
  let taskCategory = document.getElementById("task-category").innerText;
  let required = document.getElementById("category-required");
  if (taskCategory === "Select task category") {
    taskCategoryInput.style.borderColor = "red";
    required.innerHTML = `<div class="title-required">this field is required</div>`;
  }
}

/**
 * Validates if the title is provided and displays an error if not.
 */
function emptyTitle() {
  let title = document.getElementById("title-input");
  let required = document.getElementById("title-required");

  if (title.value.length === 0) {
    title.style.borderColor = "red";
    required.innerHTML = `<div class="title-required">this field is required</div>`;
  } else if (title.value.length > 0) {
    title.style.borderColor = "#29abe2";
    required.innerHTML = "";
  }
}

/**
 * Sets the minimum date of the input field with the ID 'date-input' to today's date.
 * This ensures that the user can only select dates that are today or in the future.
 */
function futureDate() {
  let today = new Date().toISOString().split("T")[0];
  document.getElementById("date-input").setAttribute("min", today);
}

/**
 * Displays the date picker and updates the date input style.
 */
function emptyDate() {
  futureDate();
  let date = document.getElementById("date-input");
  date.showPicker();
  updateDateStyle();
  document.getElementById("date-input").addEventListener("change", updateDateStyle);
}

/**
 * Animates the "Added to board" message and resolves the promise when the animation ends.
 * @returns {Promise} - A promise that resolves when the animation ends.
 */
function addedToBoard() {
  return new Promise((resolve) => {
    let imgContainer = document.getElementById("added-to-board");
    imgContainer.classList.add("animate");

    imgContainer.addEventListener("transitionend", function handler() {
      imgContainer.removeEventListener("transitionend", handler);
      resolve();
    });
  });
}

/**
 * Validates the task input fields to ensure they are not empty.
 * Calls helper functions to indicate required fields if validation fails.
 *
 * @returns {Promise<boolean>} Returns a promise that resolves to true if validation passes, otherwise false.
 */
async function validateTaskInputs() {
  let title = document.getElementById("title-input").value;
  let dueDate = document.getElementById("date-input").value;
  let taskCategory = document.getElementById("task-category").innerText;

  if (title === "" || dueDate === "" || taskCategory === "Select task category") {
    emptyDate();
    emptyTitle();
    emptyCategoryRequired();
    return false;
  }
  return true;
}

/**
 * Builds a new task object with the provided board category and input data.
 *
 * @param {string} boardCategory - The category of the board to which the task belongs.
 * @returns {Object} A new task object with all the required properties.
 */
function buildNewTask(boardCategory) {
  let description = document.getElementById("description-input").value;
  let dueDate = document.getElementById("date-input").value;
  let priority = getSelectedPrio();
  let taskCategory = document.getElementById("task-category").innerText;
  let title = document.getElementById("title-input").value;

  return {
    board_category: boardCategory,
    contact_ids: getSelectedContactIds(),
    description: description,
    due_date: dueDate,
    priority: priority,
    subtasks: getSubtasksData(),
    task_category: taskCategory,
    title: title,
  };
}

function getSelectedContactIds() {
  let selectedIds = Array.from(document.querySelectorAll(".contact-checkbox:checked"))
    .map(checkbox => parseInt(checkbox.dataset.contactId));

  return selectedIds;
}

/**
 * Creates a new task, adding it to the board if the input validation passes.
 *
 * @param {string} boardCategory - The category of the board to which the task will be added.
 * @returns {Promise<void>} A promise that resolves when the task creation process is complete.
 */
async function createTask(boardCategory) {
  try {
    if (!boardCategory) {
      throw new Error("❌ Fehler: boardCategory ist nicht gesetzt!");
    }

    let contactIds = getSelectedContactIds();

    let newTask = {
      board_category: boardCategory,
      contact_ids: contactIds,
      description: document.getElementById("description-input").value,
      due_date: document.getElementById("date-input").value,
      priority: getSelectedPrio(),
      subtasks: getSubtasksData(),
      task_category: document.getElementById("task-category").innerText,
      title: document.getElementById("title-input").value,
    };

    const response = await fetchWithAuth("tasks/", "POST", newTask);

    if (!response || response.error) {
      throw new Error(`❌ Fehler beim Erstellen des Tasks: ${response?.error || "Unbekannter Fehler"}`);
    }

    await addedToBoard();
    await boardInit();
    clearTask();
    setTimeout(() => {
      document.getElementById("added-to-board").classList.remove("animate");
    }, 1000);
  } catch (error) {
    console.error("❌ Fehler in createTask:", error);
  }
}















/**
 * Gets the selected priority level.
 * @returns {string} - The selected priority level ("urgent", "medium", or "low").
 */
function getSelectedPrio() {
  if (document.getElementById("highButton").classList.contains("selected-high-button")) {
    return "urgent";
  }
  if (document.getElementById("mediumButton").classList.contains("selected-medium-button")) {
    return "medium";
  }
  if (document.getElementById("lowButton").classList.contains("selected-low-button")) {
    return "low";
  }
  return "medium";
}

/**
 * This function returns the HTML code for add task contacts.
 * @param {object} contact 
 * @param {number} i 
 * @param {string} userName 
 * @returns HTML code for add task contacts
 */
function generateContactHTML(contact) {
  let isChecked = selectedContacts[contact.id] ? "checked" : "";
  let displayName = contact.name;

  return `<div id="contacts-pos${contact.id}" class="contacts-pos">
            <div class="show-task-contact-add-task">
                <div class="show-task-contact-letters" style="background-color: ${contact.color};">
                    ${getInitials(contact.name)}
                </div>
                <p>${displayName}</p>
            </div>

            <div class="checkbox" onclick="checkContacts(${contact.id})">
                <input type="checkbox" class="contact-checkbox" id="checkbox-field${contact.id}" 
                data-contact-id="${contact.id}" ${isChecked} hidden">
                <img id="checkbox-img-${contact.id}" src="add_task_img/checkbox-normal.svg" alt="checkbox">
            </div>
        </div>`;
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

