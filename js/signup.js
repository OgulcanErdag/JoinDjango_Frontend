
function navigateBack() {
    window.location.href = 'index.html';
}

/**
* Add the event listener for the arrow container
*/
document.getElementById('backArrow').addEventListener('click', navigateBack);
document.addEventListener('DOMContentLoaded', init);

/**
 * Initializes the signup form and its elements.
 */
function init() {
    const signupForm = document.getElementById('signupForm');
    const signupButton = document.getElementById('signupButton');
    const acceptPolicyImage = document.getElementById('acceptPolicy');

    if (signupForm && signupButton && acceptPolicyImage) {
        setupFormSubmission(signupForm);
    }
}

/**
 * Toggles the checkbox image and enables/disables the signup button.
 */
function toggleCheckboxImage() {
    const image = document.getElementById('acceptPolicy');
    const signupButton = document.getElementById('signupButton');

    if (image.src.includes('Rectangle1.png')) {
        image.src = 'img/Rectangle2.png';
        signupButton.disabled = false;
    } else {
        image.src = 'img/Rectangle1.png';
        signupButton.disabled = true;
    }
}

/**
 * Sets up the form submission event listener.
 * @param {HTMLFormElement} form - The signup form element.
 */
function setupFormSubmission(form) {
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Handles the form submission event.
 * @param {Event} event - The form submission event.
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!validateName(name)) return alert('Please enter both your first and last name.');
    if (!validateEmail(email)) return alert('Please enter a valid email address.');
    if (password !== confirmPassword) return showPasswordError();

    try {
        await signupUser(name, email, password, confirmPassword);
    } catch (error) {
        console.error("Signup failed:", error);
    }
}

/**
 * Displays a password mismatch error message and applies a CSS class for error styling.
 */
function showPasswordError() {
    document.getElementById('wrongPasswordConteiner').innerHTML = "Your Passwords don't match. Try again.";
    document.getElementById('confirm-conteiner').classList.add('signup-red');
}

/**
 * Validates the name to ensure it contains at least a first and last name.
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name is valid, false otherwise.
 */
function validateName(name) {
    const nameParts = name.split(' ');
    return nameParts.length >= 2 && nameParts[0] && nameParts[1];
}

/**
 * Validates the email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

/**
 * Signs up the user by pushing their data to the Firebase Realtime Database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
async function signupUser(name, email, password, confirmPassword) {
    const sanitizedUsername = name.replace(/ /g, "_");

    const response = await fetch("http://127.0.0.1:8000/api/auth/registration/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: sanitizedUsername,
            email: email,
            password: password,
            repeated_password: confirmPassword
        })
    });

    const data = await response.json();

    if (response.ok) {

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userProfile", JSON.stringify(data.user || {}));
            sessionStorage.setItem("userName", (data.user && data.user.username) || data.email);
        }

        signupSuccessfully();
    } else {
        console.error("Fehler bei der Registrierung:", data);
        alert("Signup failed: " + JSON.stringify(data));
    }
}



/**
 * Displays a success message and redirects to the homepage after a delay.
 */
function signupSuccessfully() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');

    setTimeout(function () {
        successMessage.classList.remove('show');
        localStorage.removeItem("token");
        localStorage.removeItem("userProfile");
        sessionStorage.removeItem("userName");
        window.location.href = 'index.html';
    }, 2000);
};
window.toggleCheckboxImage = toggleCheckboxImage;
window.signupUser = signupUser;