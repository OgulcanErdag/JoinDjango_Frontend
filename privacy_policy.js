
/**
 * Toggles the display of the user content menu.
 * If the user content is currently displayed, it hides it.
 * If the user content is currently hidden, it shows it.
 */
function toggleMenu() {
    const userContent = document.getElementById('user-content');
    if (userContent.style.display === 'block') {
        userContent.style.display = 'none';
    } else {
        userContent.style.display = 'block';
    }
}

/**
 * Hides the user content menu if the user clicks outside of it.
 * @param {Event} event - The event triggered by clicking on the window.
 */
window.onclick = function(event) {
    if (!event.target.matches('#user-logo')) {
        const userContent = document.getElementById('user-content');
        if (userContent.style.display === 'block') {
            userContent.style.display = 'none';
        }
    }
}