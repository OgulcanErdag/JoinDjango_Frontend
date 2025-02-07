document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("🛑 Kein Token gefunden, zeige Login-Seite.");
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.style.display = "none"; // Versteckt Logout-Button
    }
  }
});



function navigateTo(linkId, imgSrc, url) {
  if (url) {
    // Speichern des Zustands in sessionStorage
    sessionStorage.setItem("activeLink", linkId);
    sessionStorage.setItem("activeLinkImgSrc", imgSrc);
    sessionStorage.setItem("activeLinkBgColor", "#091931");
    sessionStorage.setItem("activeLinkColor", "#FFFFFF");
    window.location.href = url;
  } else {
    // Nur den Link aktivieren ohne Weiterleitung
    resetLinks();
    resetBottomLinks();
    const link = document.getElementById(linkId);
    const link2 = document.getElementById(linkId2);
    if (link) {
      link.classList.add("active");
    }
    if (link2) {
      link2.classList.add("active");
    }
  }
}

function resetLinks() {
  const defaultLinks = [
    { id: "link-summary", imgSrc: "../img/sidebar_summary.svg" },
    { id: "link-task", imgSrc: "../img/edit_square.svg" },
    { id: "link-board", imgSrc: "../img/sidebar_board.svg" },
    { id: "link-contacts", imgSrc: "../img/sidebar_contacts.svg" },
  ];

  defaultLinks.forEach((linkInfo) => {
    const link = document.getElementById(linkInfo.id);
    if (link) {
      const img = link.querySelector("img");
      if (img) {
        img.src = linkInfo.imgSrc;
      }
      link.style.backgroundColor = "";
      link.style.color = "";
    }
  });
}

function resetBottomLinks() {
  const links = document.querySelectorAll(".sidebar-menu-bottom a");
  links.forEach((link) => {
    link.classList.remove("active");
  });
}

function activateLink(linkId, imgSrc) {
  const link = document.getElementById(linkId);
  if (link) {
    link.classList.add("active");
    const img = link.querySelector("img");
    if (img && imgSrc) {
      img.src = imgSrc;
    }
    link.style.backgroundColor = "#091931";
    link.style.color = "#FFFFFF";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Lade den gespeicherten Zustand
  const activeLinkId = sessionStorage.getItem("activeLink");
  const activeLinkImgSrc = sessionStorage.getItem("activeLinkImgSrc");
  const activeLinkBgColor = sessionStorage.getItem("activeLinkBgColor");
  const activeLinkColor = sessionStorage.getItem("activeLinkColor");

  if (activeLinkId) {
    resetLinks();
    resetBottomLinks();

    const link = document.getElementById(activeLinkId);
    if (link) {
      const img = link.querySelector("img");
      if (img) {
        img.src = activeLinkImgSrc;
      }
      link.style.backgroundColor = activeLinkBgColor;
      link.style.color = activeLinkColor;
    }
  }
});

// Spezifische Funktionen für die Navigation
function goToSummary() {
  navigateTo("link-summary", "img/sidebar_summary_white.svg", "summary.html");
}

function goToTask() {
  navigateTo("link-task", "img/edit_square_white.svg", "add_task.html");
}

function goToBoard() {
  navigateTo("link-board", "img/sidebar_board_white.svg", "board.html");
}

function goToContacts() {
  navigateTo(
    "link-contacts",
    "img/sidebar_contacts_white.svg",
    "contacts.html"
  );
}

function goToPrivacyPolicy() {
  navigateTo("link-privacy-policy", null, "privacy_policy.html");
}

function goToLegalNotice() {
  navigateTo("link-legal-notice", null, "legal_notice.html");
}

function goToHelp() {
  navigateTo("link-help", null, "help.html");
}

function toggleMenu() {
  const userContent = document.getElementById("user-content");
  if (userContent.style.display === "block") {
    userContent.style.display = "none";
  } else {
    userContent.style.display = "block";
  }
}

function checkBoxClicked() {
  var checkbox = document.getElementById("checkbox");

  if (checkbox.src.endsWith("Rectangle1.png")) {
    checkbox.src = "img/Rectangle2.png";
    localStorage.setItem("rememberMe", "true");
  } else {
    checkbox.src = "img/Rectangle1.png";
    localStorage.setItem("rememberMe", "false");
  }
}

function goToSignUp() {
  window.location.href = "signup.html";
}

function logout() {
  console.log("🔴 Logging out...");

  // Entferne alle Benutzerdaten
  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");
  sessionStorage.removeItem("userName");
  localStorage.removeItem("greetingShown");

  // Zur Login-Seite weiterleiten
  window.location.href = "index.html";
}


function generateInitials() {
  let content = document.getElementById("user-logo");
  let userName = sessionStorage.getItem("userName");

  content.innerHTML = "";

  if (userName) {
    let nameParts = userName.split(" ");
    if (nameParts.length >= 2) {
      let initials = nameParts[0][0] + nameParts[1][0];
      content.innerHTML = initials;
    } else if (nameParts.length === 1) {
      let initials = nameParts[0][0];
      content.innerHTML = initials;
    } else {
      content.innerHTML = "G";
    }
  } else {
    content.innerHTML = "G";
  }
}
