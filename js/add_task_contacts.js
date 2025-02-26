/**
 * Resets the selected contacts array to all false values.
 */
function resetSelectedContacts() {
  selectedContacts = {};
}

/**
 * Generates and displays the list of contacts in the "Add Task" section.
 * It fetches the user's name from the session storage, creates the HTML content
 * for each contact, and updates the DOM.
 */
function showContactsInAddTask() {
  let userName = sessionStorage.getItem("userName");

  let contactsAddTask = contactsArray
    .map((contact, i) => generateContactHTML(contact, i, userName))
    .join("");

  let content = document.getElementById("add-task-contacts");
  content.innerHTML = contactsAddTask;

  updateCheckboxStates();
}

function updateCheckboxStates() {
  contactsArray.forEach((contact, i) => {
    let checkboxField = document.getElementById(`checkbox-field${i}`);
    let checkboxImg = document.getElementById(`checkbox-img-${i}`);

    if (!checkboxField || !checkboxImg) {
      // console.warn(`WARNUNG: Checkbox oder Bild für Kontakt ${i} nicht gefunden!`);
      return;
    }

    if (selectedContacts[i]) {
      checkboxField.checked = true;
      checkboxImg.src = "add_task_img/checkbox-normal-checked-white.svg";
    } else {
      checkboxField.checked = false;
      checkboxImg.src = "add_task_img/checkbox-normal.svg";
    }
  });
}


/**
 * Updates the checkbox status and highlights the selected contacts in the "Add Task" section.
 * It iterates over the contacts, checking if the checkbox is selected, and updates the
 * checkbox image and highlights the contact if selected.
 */
function checkbox() {
  contactsArray.forEach((contact) => { // Nutze "contact.id" statt "i"
    let checkboxField = document.getElementById(`checkbox-field${contact.id}`);
    let contactDiv = document.getElementById(`contacts-pos${contact.id}`);

    if (!checkboxField || !contactDiv) {
      // console.warn(` Checkbox oder Kontakt-Div nicht gefunden für ID: ${contact.id}`);
      return;
    }

    if (checkboxField.src.includes("checkbox-normal-checked.svg")) {
      checkboxField.src = "add_task_img/checkbox-normal-checked-white.svg";
      contactDiv.classList.add("contacts-pos-highlight");
    }
  });
}


/**
* Toggles the display of the contacts dropdown and shows the contacts in the add task section.
*/
function showContacts() {
  let contactDropdown = document.querySelector("#add-task-contacts");
  let categoryDropdown = document.querySelector("#category");
  contactDropdown.classList.toggle("d-none");
  showContactsInAddTask();
}
document.addEventListener("DOMContentLoaded", function () {
  addMouseDownListeners();
});

/**
 * Adds event listeners for mouse down events to handle dropdown visibility.
 */
async function addMouseDownListeners() {
  document.addEventListener("mousedown", async function (event) {
    const contactDropdown = document.querySelector("#add-task-contacts");
    const categoryDropdown = document.querySelector("#category");

    if (contactDropdown && !contactDropdown.contains(event.target) && !event.target.matches(".select-contact")) {
      await closeContactDropdown(contactDropdown);
    }

    if (categoryDropdown && !categoryDropdown.contains(event.target) && !event.target.matches(".select-contact")) {
      if (!categoryDropdown.classList.contains("d-none")) {
        categoryDropdown.classList.add("d-none");
      }
    }
  });
}

/**
 * Closes the contact dropdown and performs necessary updates based on the current state.
 * @param {HTMLElement} contactDropdown - The contact dropdown element to be closed.
 */
async function closeContactDropdown(contactDropdown) {
  if (!contactDropdown.classList.contains("d-none")) {
    contactDropdown.classList.add("d-none");

    if (document.getElementById("add-task-contactsHTML")) {
      await getAddContactSiteHTML(selectedContacts);
      standardButton();
    } else {
      if (document.getElementById("add-task-contactsHTML-layer")) {
        showContactsInAddTaskLayer();
        document.getElementById("req-text-layer").classList.add("mt10");
      } else {
        await saveEditContacts(currentTaskKey);
      }
    }
  }
}

/**
 * Displays the contacts in the add task layer.
 */
function showContactsInAddTaskLayer() {
  let contactsHTML = getAddContactsHTML(selectedContacts);
  let content = document.getElementById("show-task-inner-layer");
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = contactsHTML;

  let addTaskLayer = generateAddTaskLayer(currentBoardCategory, contactsHTML);
  let parser = new DOMParser();
  let doc = parser.parseFromString(addTaskLayer, "text/html");
  let newContent = doc.getElementById("add-task-contactsHTML-layer").innerHTML;

  content.querySelector("#add-task-contactsHTML-layer").innerHTML = newContent;

  standardButton();
}

/**
 * Shows the contacts in the edit task section by reusing the add task contact display function.
 */
function showContactsInEdit() {
  showContactsInAddTask();
  contactDropdown.classList.toggle("d-none");
}

/**
 * Toggles the selection of a contact.
 * @param {number} i - Index of the contact to be checked.
 */
function checkContacts(i) {
  let checkbox = document.getElementById(`checkbox-field${i}`);
  let checkboxImg = document.getElementById(`checkbox-img-${i}`);

  if (!checkbox || !checkboxImg) {
    // console.warn(`Checkbox oder Bild für Kontakt ${i} nicht gefunden!`);
    return;
  }

  checkbox.checked = !checkbox.checked;
  selectedContacts[i] = checkbox.checked;
  checkboxImg.src = checkbox.checked
    ? "add_task_img/checkbox-normal-checked-white.svg"
    : "add_task_img/checkbox-normal.svg";
}

/**
 * Clears the selected contacts and resets the contact checkboxes in the add task section.
 */
function clearContacts() {
  let content = document.getElementById("add-task-contactsHTML");
  if (!content) {
    content = document.getElementById("add-task-contactsHTML-layer");
  }

  if (selectedContacts.hasOwnProperty("0")) {
    delete selectedContacts["0"];
  }

  for (let i in selectedContacts) {
    if (selectedContacts.hasOwnProperty(i) && selectedContacts[i]) {
      let checkboxField = document.getElementById(`checkbox-field${i}`);
      let contactDiv = document.getElementById(`contacts-pos${i}`);

      if (!checkboxField) {
        continue;
      }
      if (!contactDiv) {
        continue;
      }

      checkboxField.src = "add_task_img/checkbox-normal.svg";
      contactDiv.classList.remove("contacts-pos-highlight");
      contactDiv.classList.remove("no-hover");
      selectedContacts[i] = false;
    }
  }
}

/**
* Collects the data of selected contacts.
*
* @returns {Object} An object containing the selected contacts data.
*/
function getSelectedContactsData() {
  return selectedContacts.reduce((acc, isSelected, index) => {
    if (isSelected) {
      acc[`contact${index + 1}`] = contactsArray[index];
    }
    return acc;
  }, {});
}