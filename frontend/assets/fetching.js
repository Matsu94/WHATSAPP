import { URL } from '../constants/const.js';

export async function fetchToken(username, password) {
    // Realizar la solicitud fetch al endpoint /token
    try {
        const response = await fetch(`${URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        const data = await response.json();
        console.log('Token:', data.access_token);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = 'Error en el inicio de sesión.';
    }
}


export async function fetchUsers() {
    try {
        const response = await fetch(`${URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // Si no hay token requerido, no hace falta 'Authorization'
            }
        });
        if (!response.ok) {
            throw new Error(`Error al obtener usuarios: ${response.status}`);
        }
        return await response.json(); 
        // Esto será un array de objetos: [{ user_id, username, password }, ...]
    } catch (error) {
        throw error; // Relanzamos el error para manejarlo fuera
    }
}