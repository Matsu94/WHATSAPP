function validarUsername(username) {
    const errores = [];
    const regex = /^[a-z]{3,}[0-9]*$/;

    if (!regex.test(username)) {
        errores.push("El nombre de usuario debe tener al menos 3 letras, sin mayúsculas ni caracteres especiales, y los números deben estar al final.");
    }

    return errores;
}

function validarPassword(password) {
    const errores = [];
    
    if (password.length < 6) {
        errores.push("La contraseña debe tener al menos 6 caracteres.");
    }

    return errores;
}

function mostrarErrores(idCampo, errores) {
    const errorElemento = document.getElementById(`${idCampo}Error`);
    if (errores.length > 0) {
        errorElemento.textContent = errores[0]; // Mostrar el primer error
        errorElemento.style.display = "block";
    } else {
        errorElemento.textContent = "";
        errorElemento.style.display = "none";
    }
}

function validarLogin(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const errores = {
        username: validarUsername(username),
        password: validarPassword(password),
    };

    // Mostrar errores en el formulario
    mostrarErrores("username", errores.username);
    mostrarErrores("password", errores.password);

    // Si no hay errores, puedes proceder con el envío o lógica adicional
    if (errores.username.length === 0 && errores.password.length === 0) {
        alert("Inicio de sesión exitoso");
        // Aquí puedes añadir lógica para enviar los datos al servidor
    }
}
