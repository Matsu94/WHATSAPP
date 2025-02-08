$(document).ready(function () {
  // Comprobar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  $("html").attr("data-theme", savedTheme);
  console.log("Tema guardado inicialmente:", savedTheme);

  // Sincronizar el checkbox según el tema guardado
  if (savedTheme === "dark") {
    $("#themeCheckbox").prop("checked", true);
  } else {
    $("#themeCheckbox").prop("checked", false);
  }

  // 1) Toggle Light/Dark Theme con checkbox
  $(document).on("change", "#themeCheckbox", function () {
    if ($(this).is(":checked")) {
      $("html").attr("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      console.log("Tema cambiado a dark vía checkbox");
    } else {
      $("html").attr("data-theme", "light");
      localStorage.setItem("theme", "light");
      console.log("Tema cambiado a light vía checkbox");
    }
  });

  // 2) Toggle Show/Hide Password
  $(document).on("click", "#togglePassword", function () {
    const passwordInput = $("#password");
    const eyeOpen = $("#eyeOpen");
    const eyeSlash = $("#eyeSlash");

    if (passwordInput.attr("type") === "password") {
      passwordInput.attr("type", "text");
      eyeOpen.addClass("hidden");
      eyeSlash.removeClass("hidden");
      console.log("Mostrar contraseña");
    } else {
      passwordInput.attr("type", "password");
      eyeOpen.removeClass("hidden");
      eyeSlash.addClass("hidden");
      console.log("Ocultar contraseña");
    }
  });

  // Botón "Standard": Modo claro
  $(document).on("click", "#btnStandard", function () {
    $("html").attr("data-theme", "light");
    localStorage.setItem("theme", "light");
    $("#themeCheckbox").prop("checked", false);
    console.log("Botón Standard: tema light guardado");
  });

  // Botón "Modo de alto contraste": Asignar data-theme "highContrast"
  $(document).on("click", "#btnHighContrast", function () {
    $("html").attr("data-theme", "highContrast");
    localStorage.setItem("theme", "highContrast");
    $("#themeCheckbox").prop("checked", false);
    console.log("Botón Alto Contraste: tema highContrast guardado");
  });

  // Botón "Modo oscuro"
  $(document).on("click", "#btnDark", function () {
    $("html").attr("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    $("#themeCheckbox").prop("checked", true);
    console.log("Botón Oscuro: tema dark guardado");
  });
});
