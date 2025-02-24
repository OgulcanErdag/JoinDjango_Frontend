
window.onload = function () {
    const rememberMe = localStorage.getItem('rememberMe');
    const checkbox = document.getElementById('checkbox');
    const emailField = document.getElementById('loginEmail');
    const passwordField = document.getElementById('loginPassword');

    if (rememberMe === 'true') {
        checkbox.src = 'img/Rectangle2.png';
        emailField.value = localStorage.getItem('email');
        passwordField.value = localStorage.getItem('password');
    } else {
        checkbox.src = 'img/Rectangle1.png';
    }

    init();
};

/**
 * Initializes the sign-in form.
 */
function init() {
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', login);
    }
}


function setupFormSubmission(form) {
    form.addEventListener('submit', login);
}

document.getElementById('checkbox').addEventListener('click', checkBoxClicked);

/**
 * Handles the login form submission.
 * 
 * @param {Event} event - The form submission event.
 */


/**
 * Stores the user's credentials in local storage.
 * 
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */

function storeCredentials(email, password) {
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
}

/**
 * Handles successful authentication.
 * 
 * @param {string} email - The authenticated user's email.
 */
async function handleSuccess(email, username) {

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", username);
    sessionStorage.setItem("userName", username);
    localStorage.removeItem("greetingShown");
    window.location.href = 'summary.html';
}

/**
 * Displays an error message indicating incorrect password or email.
 */
function showError() {
    document.getElementById('wrongPasswordConteiner').innerHTML = 'Incorrect email or password. Try again.';
    document.getElementById('pasowrdConteiner').classList.add('login-red');
}

/**
 * Validates the user credentials against the Django backend.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<boolean>} True if authentication is successful, false otherwise.
 */
async function validateUser(email, password) {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.username);
            return { success: true, username: data.username };
        } else {
            console.error("Fehler beim Login:", data);
            showError();
            return false;
        }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
        showError();
        return false;
    }
}
window.validateUser = validateUser;

/**
 * Handles the checkbox click event for remembering user credentials.
 */
function checkBoxClicked() {
    const checkbox = document.getElementById('checkbox');
    const rememberMe = localStorage.getItem('rememberMe');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (rememberMe === 'true') {
        checkbox.src = 'img/Rectangle1.png';
        localStorage.setItem('rememberMe', 'false');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
    } else {
        checkbox.src = 'img/Rectangle2.png';
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
    }
}


document.getElementById('checkbox').addEventListener('click', checkBoxClicked);
document.getElementById('signupButton').addEventListener('click', () => window.location.href = 'signup.html');
document.getElementById('guestLoginButton').addEventListener('click', () => {
    localStorage.removeItem('greetingShown');
    window.location.href = 'summary.html';
    sessionStorage.setItem('userName', 'Guest');
});

function checkLoginStatus() {
    const token = localStorage.getItem("token");

    if (token) {
        document.getElementById("signinForm").style.display = "none";
        document.getElementById("signupButton").innerText = "Logout";
        document.getElementById("signupButton").addEventListener("click", logOut);
    }
}

document.addEventListener("DOMContentLoaded", checkLoginStatus);

/**
 * Handles the login form submission.
 *
 * @param {Event} event - The form submission event.
 */
async function login(event) {
    event.preventDefault();

    const username = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const isAuthenticated = await validateUser(username, password);
        if (isAuthenticated.success) {
            handleSuccess(username, isAuthenticated.username);
        } else {
            showError();
        }
    } catch (error) {
        console.error(" Login fehlgeschlagen:", error);
        showError();
    }
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



function guestLogin(event) {
    event.preventDefault();
    localStorage.removeItem('greetingShown');
    goToSummary();
    sessionStorage.setItem('userName', 'Guest');
}