$(document).ready(function () {
  // Comprobar si hay un tema guardado en sessionStorage
  const savedTheme = sessionStorage.getItem("theme") || "light";
  $("html").attr("data-theme", savedTheme);

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
      sessionStorage.setItem("theme", "dark");
    } else {
      $("html").attr("data-theme", "light");
      sessionStorage.setItem("theme", "light");
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
    } else {
      passwordInput.attr("type", "password");
      eyeOpen.removeClass("hidden");
      eyeSlash.addClass("hidden");
    }
  });

  // Botón "Standard": Modo claro
  $(document).on("click", "#btnStandard", function () {
    $("html").attr("data-theme", "light");
    sessionStorage.setItem("theme", "light");
    $("#themeCheckbox").prop("checked", false);
  });

  // Botón "Modo de alto contraste": Asignar data-theme "highContrast"
  $(document).on("click", "#btnHighContrast", function () {
    $("html").attr("data-theme", "highContrast");
    sessionStorage.setItem("theme", "highContrast");
    $("#themeCheckbox").prop("checked", false);
  });

  // Botón "Modo oscuro"
  $(document).on("click", "#btnDark", function () {
    $("html").attr("data-theme", "dark");
    sessionStorage.setItem("theme", "dark");
    $("#themeCheckbox").prop("checked", true);
  });
});
