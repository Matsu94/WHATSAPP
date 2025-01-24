export function getLoggedUsername() {
    const username = localStorage.getItem('username');

    if (username) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `¡Bienvenido, ${username}!`;
    }
}

getLoggedUsername();