const CONTACTS_API_URL = "http://127.0.0.1:8000/api/contacts/";

let contactsData = {};
let contactsArray = [];
let contactsKeys = [];
let isShowContactExecuted = false;

/**
 * This function initializes contacts.html with body onload.
 * @returns true
 */
async function contactsInit() {
  await fetchDataJson();
  createContactsList();
  generateInitials();

}

function getInitials(name) {
  if (!name) return "";
  let initials = name.split(" ").map(part => part.charAt(0)).join("");
  return initials.toUpperCase();
}

/**
 * This function fetches all contact information from database and saves them as objects, array
 * and an array with the contact keys. Then it sorts the contacts and the keys, so that they
 * can be rendered in alphabetic order in the library.
 * @returns response
 */
async function fetchDataJson() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ Kein Token gefunden! Zugriff verweigert.");
    return;
  }
  try {
    let response = await fetch("http://127.0.0.1:8000/api/contacts/", {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`❌ Fehler beim Laden der Kontakte: ${response.status}`);
    }

    let data = await response.json();
    contactsData = data;
    contactsArray = Object.values(data);
  } catch (error) {
    console.error("❌ Netzwerkfehler beim Laden der Kontakte:", error);
  }
}


/**
 * This function generates the contact library and the letter directories.
 */
function createContactsList() {
  let content = document.getElementById("contacts-list");
  content.innerHTML = "";
  let currentLetter = "";

  contactsArray.sort((a, b) => a.name.localeCompare(b.name));

  for (let contact of contactsArray) {
    let firstLetter = contact.name ? contact.name[0].toUpperCase() : "?";

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      content.innerHTML += `<div class="first-letter">${currentLetter}</div><div class="line"></div>`;
    }

    let initials = getInitials(contact.name);
    content.innerHTML += generateDirectory(contact.id, initials, contact);
  }
}

/**
 * This function returns the bubbles in the contact list.
 * @param {string} content - ID of the list
 * @param {string} currentLetter 
 * @param {string} firstLetter 
 * @returns the bubbles in the contact list
 */
function addLetterSection(content, currentLetter, firstLetter) {
  if (firstLetter !== currentLetter) {
    currentLetter = firstLetter;
    content.innerHTML += `
            <div class="first-letter">${currentLetter}</div>
            <div class="line"></div>
        `;
  }
  return currentLetter;
}


/**
 * Standard function for posting new contacts onto database.
 * @param {string} path
 * @param {object} data
 * @returns response
 */
async function postData(path = "", data = {}) {
  try {
    let response = await fetch(CONTACTS_API_URL + path, {
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
 * This function handles the adding of a new contact. It posts the contact onto database,
 * closes the layer and shows the contact information.
 */
async function addContact() {
  let name = document.getElementById("add-contact-name").value;
  let email = document.getElementById("add-contact-mail").value;
  let phone = document.getElementById("add-contact-phone").value;
  let color = getRandomColor();
  let token = localStorage.getItem("token");
  let newContact = { name, email, phone, color };

  try {
    let response = await fetch(CONTACTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}` // 🔥 Auth-Header hinzufügen
      },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      throw new Error("Fehler beim Erstellen des Kontakts.");
    }

    await contactsInit();
    contactAdded(newContact);
  } catch (error) {
    console.error("Fehler beim Erstellen des Kontakts:", error);
  }
}

/**
 * This function handles the actions if a new contact has been added successfully.
 * @param {object} newContact
 */
function contactAdded(newContact) {
  document.getElementById("add-contact-name").value = "";
  document.getElementById("add-contact-mail").value = "";
  document.getElementById("add-contact-phone").value = "";

  closeAddContactLayer();

  let newKey = Object.keys(contactsData).find((key) => contactsData[key].email === newContact.email && contactsData[key].name === newContact.name);
  let initials = newContact.name.split(" ")[0][0] + newContact.name.split(" ")[1][0];
  showContact(initials, newContact, newKey);
}

/**
 * Standard function for deleting a contact from database
 * @param {string} key - contact key
 */
async function deleteContact(id) {
  let token = localStorage.getItem("token");

  try {
    let response = await fetch(`${CONTACTS_API_URL}${id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Fehler beim Löschen des Kontakts.");
    }

    // ❌ Entferne Kontakt aus dem lokalen Array
    contactsArray = contactsArray.filter(contact => contact.id !== id);

    // ❌ Entferne Kontakt aus der UI (linke Liste)
    let contactElement = document.getElementById(`contact${id}`);
    if (contactElement) {
      contactElement.remove();
    }
    await contactsInit();

    // ❌ Detailansicht (rechte Seite) ausblenden
    let detailView = document.getElementById("contact-profile");
    if (detailView) {
      detailView.innerHTML = ""; // Alternativ: detailView.style.display = "none";
    }

    // 🔄 Die gesamte Kontaktliste NEU generieren
    createContactsList();

  } catch (error) {
    console.error("❌ Fehler beim Löschen des Kontakts:", error);
  }
}



/**
 * This function saves and shows an updated contact after editing it.
 */
async function saveContact() {
  let key = document.getElementById("edit-contact-key").value;
  let name = document.getElementById("edit-contact-name").value;
  let email = document.getElementById("edit-contact-mail").value;
  let phone = document.getElementById("edit-contact-phone").value;
  let token = localStorage.getItem("token");
  // Farbe des bestehenden Kontakts beibehalten oder neue zufällige Farbe setzen
  let color = contactsArray.find((c) => c.id == key)?.color || getRandomColor();

  let updatedContact = { name, email, phone, color };

  try {
    let response = await fetch(`${CONTACTS_API_URL}${key}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}` // 🔥 Auth-Header hinzufügen
      },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error("Fehler beim Aktualisieren des Kontakts.");
    }

    // Kontaktliste neu laden
    await contactsInit();
    location.reload();
    closeEditContactLayer();

  } catch (error) {
    console.error("❌ Fehler beim Speichern des Kontakts:", error);
  }
}

/**
 * This function shows the contact details after editing a contact.
 * @param {string} name 
 * @param {object} updatedContact 
 * @param {string} key 
 */
function displayUpdatedContact(name, updatedContact, key) {
  let initials = name.split(" ")[0][0] + name.split(" ")[1][0];
  showContact(initials, updatedContact, id);
}

/**
 * Standard function for putting an edited contact onto database.
 * @param {string} key -contact key
 * @param {object} updatedContact
 * @returns response
 */
async function updateContact(key, updatedContact) {
  try {
    let response = await fetch(CONTACTS_API_URL + key, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

/**
 * This function shows the contact details when clicking on the contact in the library
 * or after adding or editing a contact.
 * @param {string} initials
 * @param {object} contact
 * @param {string} key - contact key
 */
function showContact(initials, contact, key) {
  highlightContact(key);
  let content = document.getElementById("contact-profile"),
    contentLibrary = document.getElementById("contacts-library");
  content.innerHTML = "";
  if (window.innerWidth <= 1120) {
    contentLibrary.classList.add("d-none");
  } else {
    contentLibrary.classList.remove("d-none");
  }
  content.classList.remove("slide-in-right"), void content.offsetWidth, content.classList.add("slide-in-right");
  content.innerHTML += generateContactHTML(initials, contact, key);
  isShowContactExecuted = true;  // 👉 Hier wird die Variable gesetzt!
}


/**
 * This function ensures that the content library is shown in the correct situations in responsive layout.
 */
window.addEventListener("resize", function () {
  let contentLibrary = document.getElementById("contacts-library");
  if (isShowContactExecuted) window.innerWidth > 1120 ? contentLibrary.classList.remove("d-none") : contentLibrary.classList.add("d-none");
});

/**
 * This function highlights a contact in the library when it is active.
 * @param {string} key - contact key
 */
function highlightContact(key) {
  let contacts = document.getElementsByClassName("contact");

  for (let j = 0; j < contacts.length; j++) {
    contacts[j].classList.remove("selected-contact");
  }

  let currentContact = document.getElementById(`contact${key}`);
  if (currentContact) {
    currentContact.classList.add("selected-contact");
  }
}

/**
 * This function animates and opens the add contact layer.
 */
function openAddContactLayer() {
  document.getElementById("add-contact-layer").classList.remove("d-none");
  let content = document.getElementById("add-contact-inner-layer");

  content.classList.remove("slide-in-right");
  content.classList.remove("slide-out-right");
  void content.offsetWidth;
  content.classList.add("slide-in-right");
}

/**
 * This function animates and opens the edit contact layer.
 * @param {string} key - contact key
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 */
function openEditContactLayer(key, name, email, phone) {
  document.getElementById("edit-contact-layer").classList.remove("d-none");
  let content = document.getElementById("edit-contact-inner-layer");

  content.classList.remove("slide-in-right");
  content.classList.remove("slide-out-right");
  void content.offsetWidth;
  content.classList.add("slide-in-right");

  document.getElementById("edit-contact-key").value = key;
  document.getElementById("edit-contact-name").value = name;
  document.getElementById("edit-contact-mail").value = email;
  document.getElementById("edit-contact-phone").value = phone;
}

/**
 * This function animates and hides the add contact layer.
 */
function closeAddContactLayer() {
  let contentLayer = document.getElementById("add-contact-layer");
  let content = document.getElementById("add-contact-inner-layer");

  content.classList.remove("slide-out-right");
  void content.offsetWidth;
  content.classList.add("slide-out-right");

  content.removeEventListener("animationend", handleAnimationEnd);
  content.addEventListener("animationend", handleAnimationEnd, { once: true });
}

/**
 * This function animates and hides the edit contact layer.
 */
function closeEditContactLayer() {
  let contentLayer = document.getElementById("edit-contact-layer");
  let content = document.getElementById("edit-contact-inner-layer");

  content.classList.remove("slide-out-right");
  void content.offsetWidth;
  content.classList.add("slide-out-right");

  content.removeEventListener("animationend", handleAnimationEnd);
  content.addEventListener("animationend", handleAnimationEnd, { once: true });
}

/**
 * This function only is responsible for hiding the add- and the edit contact layer.
 */
function handleAnimationEnd() {
  document.getElementById("add-contact-layer").classList.add("d-none");
  document.getElementById("edit-contact-layer").classList.add("d-none");
}

/**
 * This function chooses a random color for a new contact added. It is used then in every bubble
 * in every html.
 * @returns random color
 */
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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