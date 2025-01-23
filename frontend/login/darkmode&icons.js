// 1) Toggle modo claro/oscuro
const htmlEl = document.documentElement;
const themeCheckbox = document.getElementById("themeCheckbox");

themeCheckbox.addEventListener("change", () => {
  if (themeCheckbox.checked) {
    // Checkbox activado => modo oscuro
    htmlEl.setAttribute("data-theme", "dark");
  } else {
    // Checkbox desactivado => modo claro
    htmlEl.setAttribute("data-theme", "light");
  }
});

// 2) Toggle mostrar/ocultar contraseña
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeSlash = document.getElementById("eyeSlash");

function updatePasswordIcons() {
  if (passwordInput.type === "password") {
    eyeOpen.classList.remove("hidden"); 
    eyeSlash.classList.add("hidden");
  } else {
    eyeOpen.classList.add("hidden");
    eyeSlash.classList.remove("hidden");
  }
}

// Al hacer clic en el icono ojo
togglePasswordBtn.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
  updatePasswordIcons();
});

// Ajustar icono de la contraseña al cargar la página
updatePasswordIcons();