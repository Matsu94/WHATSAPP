export function logOut() {
    localStorage.removeItem('token');
    window.location.href = "login/login.html";
}

document.getElementById("logOut").addEventListener("click", logOut);

