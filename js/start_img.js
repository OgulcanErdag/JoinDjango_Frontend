/**
 * Updates the source of the responsive image and adjusts styles based on screen width.
 */
function updateImageSource() {
    var image = document.getElementById('responsive-image');
    var startingScreen = document.getElementById('startingScreen');

    if (window.innerWidth <= 720) {
        image.src = './img/Capa.png';
        document.body.style.backgroundColor = '#2A3647';
        startingScreen.style.left = '38px';
        startingScreen.style.top = '37px';
     
    } else {
        image.src = './img/Capa 2.png';
        document.body.style.backgroundColor = '#F6F7F8';
        startingScreen.style.left = '583px';
        startingScreen.style.top = '345px';
    }
}

window.addEventListener('resize', updateImageSource);
window.addEventListener('load', updateImageSource);

const startingScreen = document.getElementById('startingScreen');
const image = document.getElementById('responsive-image');

/**
 * Event handler for the end of the startingScreen animation.
 * Changes the image source and background color if the window width is 720 pixels or less.
 */
startingScreen.addEventListener('animationend', function() {
    if (window.innerWidth <= 720) {
        image.src = './img/Capa 2.png';
        document.body.style.backgroundColor = '#F6F7F8';
    }
});