import { fetchToken } from "../../assets/fetching.js";
import * as errors from "../../errors/errors.js";

function validarUsername(username) {
    const errores = [];
    const regex = /^[a-z]{3,}[0-9]*$/;

    if (!regex.test(username)) {
        errores.push(`${errors.validateUsernameError}`);
    }

    return errores;
}

function validarPassword(password) {
    const errores = [];
    
    if (password.length < 6) {
        errores.push(`${errors.validatePasswordError}`);
    }

    return errores;
}

function mostrarErrores(idCampo, errores) {
    const errorElemento = document.getElementById(idCampo + "Error");
    if (errores.length > 0) {
        errorElemento.textContent = errores[0]; // Mostrar el primer error
        errorElemento.style.display = "block";
    } else {
        errorElemento.textContent = "";
        errorElemento.style.display = "none";
    }
}

async function validarLogin(event) {
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

    // Si no hay errores, llamar a fetchToken
    if (errores.username.length === 0 && errores.password.length === 0) {
        try {
            await fetchToken(username, password);
        } catch (error) {
            document.getElementById('passwordError').textContent = `${errors.loginError}`;
        }
    }
}

// Asociamos el evento de validación al formulario
document.getElementById("loginForm").addEventListener("submit", validarLogin);
