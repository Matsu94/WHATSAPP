$(document).ready(function () {
  // Check for saved theme in localStorage
  if (localStorage.getItem("theme") === "dark") {
      $("html").attr("data-theme", "dark");
      $("#themeCheckbox").prop("checked", true);
  }

  // 1) Toggle Light/Dark Theme
  $("#themeCheckbox").on("change", function () {
      if ($(this).is(":checked")) {
          $("html").attr("data-theme", "dark");
          localStorage.setItem("theme", "dark");
      } else {
          $("html").attr("data-theme", "light");
          localStorage.setItem("theme", "light");
      }
  });

  // 2) Toggle Show/Hide Password
  $("#togglePassword").on("click", function () {
    const passwordInput = $("#password");
    const eyeOpen = $("#eyeOpen");
    const eyeSlash = $("#eyeSlash");
  
    if (passwordInput.attr("type") === "password") {
      // Cambiar a texto y alternar iconos:
      passwordInput.attr("type", "text");
      eyeOpen.addClass("hidden");      // Ocultar el icono de ojo abierto
      eyeSlash.removeClass("hidden");  // Mostrar el icono de ojo cerrado
    } else {
      // Volver a contraseña y alternar iconos:
      passwordInput.attr("type", "password");
      eyeOpen.removeClass("hidden");   // Mostrar el icono de ojo abierto
      eyeSlash.addClass("hidden");     // Ocultar el icono de ojo cerrado
    }
  });
  
});