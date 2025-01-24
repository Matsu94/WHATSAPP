export function logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = "login/login.html";
}

document.getElementById("logOut").addEventListener("click", logOut);

