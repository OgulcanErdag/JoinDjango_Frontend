const API_URL = "http://127.0.0.1:8000/api/";
//Django Backend URL
tasksArray = [];  // Speichert Tasks aus der API

/**
 * This function initializes the summary html.
 */
async function summaryInit() {
    await getUserProfile(); // Jetzt wird das Benutzerprofil hier geladen!
    await fetchTasksJson();
    generateCounts();
    generateGreets();
    generateUpcomingDate();
    generateInitials();
}



/**
 * Fetches task data from Django backend and updates the global tasksArray.
 */
async function fetchTasksJson() {
    try {
        let response = await fetch(API_URL + "tasks/");  // Holt Tasks von Django-API
        let data = await response.json();
        tasksArray = data || [];  // Speichert die API-Daten in tasksArray
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

/**
 * This function defines and generates the numbers for counting the tasks in the different categories.
 */
function generateCounts() {
    document.getElementById('toDoCount').innerHTML = counter('to-do');
    document.getElementById('doneCount').innerHTML = counter('done');
    document.getElementById('inProgressCount').innerHTML = counter('in-progress');
    document.getElementById('awaitFeedbackCount').innerHTML = counter('await-feedback');
    document.getElementById('urgentCount').innerHTML = countUrgentTasks();
    document.getElementById('allTasks').innerHTML = countAllTasks();
    // toDo.innerHTML = counter('to-do');
    // done.innerHTML = counter('done');
    // inProgress.innerHTML = counter('in-progress');
    // awaitFeedback.innerHTML = counter('await-feedback');
    // urgent.innerHTML = countUrgentTasks();
    // allTasks.innerHTML = countAllTasks();
}

/**
 * This function calculates the number of tasks in a category.
 * @param {string} category - board category
 * @returns number of tasks in a category
 */
function counter(category) {
    return tasksArray.filter(task => task.board_category === category).length;
}

/**
 * This function calculates the number of urgent tasks.
 * @returns number of urgent tasks
 */
function countUrgentTasks() {
    return tasksArray.filter(task => task.prio === 'urgent').length;
}

/**
 * This function calculates the number of all tasks.
 * @returns number of all tasks
 */
function countAllTasks() {
    return tasksArray.length;
}


/**
 * This function fills the variables of the greeting container like daytime and name of the logged in user.
 */
function generateGreets() {
    let greetingTime = getGreeting();
    let userName = sessionStorage.getItem("userName");

    if (!userName || userName === "undefined") {
        console.warn("⚠️ Benutzername nicht gefunden, lade neu...");
        getUserProfile();  // 🔥 Profil erneut laden
        userName = "Guest";
    }

    console.log("🔍 Generierte Begrüßung für:", userName);

    let content = document.getElementById('greeting-container');
    content.innerHTML = `<span class="greet-text">Good ${greetingTime},</span>
                         <span class="greet-user-name">${userName}</span>`;
}


async function getUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("❌ Kein Token gefunden, bitte einloggen!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/profiles/", {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const data = await response.json();
        console.log("📌 API Antwort von /profiles/:", data);

        if (data.length > 0) {
            let userProfile = data[0];
            let userName = userProfile.username || userProfile.email;

            // 🔥 Falls username "Anika_Koray" ist, ersetze "_" mit Leerzeichen
            userName = userName.split("_")[0];

            console.log("👤 Gefundener Benutzername:", userName);  // Debugging

            // Speichern in LocalStorage & SessionStorage
            localStorage.setItem("userProfile", JSON.stringify(userProfile));
            sessionStorage.setItem("userName", userName);

            console.log("✅ sessionStorage userName gesetzt:", sessionStorage.getItem("userName"));
        } else {
            console.warn("⚠️ Kein Benutzerprofil gefunden.");
        }
    } catch (error) {
        console.error("❌ Netzwerkfehler beim Laden des Profils:", error);
    }
}



window.getUserProfile = getUserProfile;






/**
 * This function generates the greeting dependant on the date time
 * @returns greeting dependant on the date time
 */
function getGreeting() {
    let now = new Date();
    let hours = now.getHours();
    if (hours >= 5 && hours < 12) return "morning";
    if (hours >= 12 && hours < 18) return "afternoon";
    if (hours >= 18 && hours < 22) return "evening";
    return "night";
}


/**
 * This function generates the due date of the most urgent task.
 */
function generateUpcomingDate() {
    let content = document.getElementById('upcomingDate');
    content.innerHTML = getClosestUrgentDueDate();
}

/**
 * This function calculates the due date of the most urgent task.
 * @returns the due date of the most urgent task.
 */
function getClosestUrgentDueDate() {
    let urgentTasks = tasksArray.filter(task => task.prio === 'urgent');
    if (!urgentTasks.length) return '';
    let closestDate = urgentTasks.reduce((acc, task) => {
        let dueDate = new Date(task.due_date);
        let diff = dueDate - new Date();
        return (diff >= 0 && diff < acc.diff) ? { date: dueDate, diff: diff } : acc;
    }, { date: null, diff: Infinity }).date;

    return closestDate ? closestDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
}



/**
 * Displays a greeting animation.
 */
function showGreeting() {
    const animationScreen = document.getElementById('animationScreen');
    let greetingTime = getGreeting();
    let userName = sessionStorage.getItem('userName');
    animationScreen.innerHTML = userName === "Guest"
        ? `<span class="greet-text">Good ${greetingTime}</span>`
        : `<div class="greeting-user-animation"><span class="greet-text">Good ${greetingTime},</span>
           <span class="greet-user-name">${userName}</div></span>`;
    animationScreen.classList.remove('d-none');
    animationScreen.classList.add('fadeIn');
    setTimeout(hideGreeting, 1000);
}

/**
 * Hides the greeting animation.
 */
function hideGreeting() {
    const animationScreen = document.getElementById('animationScreen');
    const summaryCardContainer = document.querySelector('.summary-card-container');
    animationScreen.classList.remove('fadeIn');
    animationScreen.classList.add('fadeOut');
    setTimeout(() => {
        animationScreen.classList.add('hidden');
        if (summaryCardContainer) summaryCardContainer.classList.add('visible');
    }, 1000);
}

/**
 * Initializes the page based on window width.
 */
function initPage() {
    const animationScreen = document.getElementById('animationScreen');
    const summaryCardContainer = document.querySelector('.summary-card-container');
    if (window.innerWidth >= 800) {
        localStorage.setItem('greetingShown', 'true');
        summaryCardContainer.classList.add('visible');
    } else {
        if (!localStorage.getItem('greetingShown')) {
            localStorage.setItem('greetingShown', 'true');
            showGreeting();
        } else {
            summaryCardContainer.classList.add('visible');
        }
    }
}

/**
 * This function runs initPage when DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', initPage);


/**
 * This function removes local storage item greetingShown.
 */
function logOut() {
    console.log("Logging out...");

    // Entferne alle gespeicherten Benutzerdaten
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("email");
    localStorage.removeItem("password");

    // Leere eventuell vorausgefüllte Felder
    if (document.getElementById("loginEmail")) {
        document.getElementById("loginEmail").value = "";
    }
    if (document.getElementById("loginPassword")) {
        document.getElementById("loginPassword").value = "";
    }

    window.location.href = "index.html";
}