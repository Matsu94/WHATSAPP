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
        console.log('Token:', data.token);
        // Aquí puedes redirigir al usuario o guardar el token según sea necesario
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = 'Error en el inicio de sesión.';
    }
}