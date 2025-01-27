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
            throw new Error(requestError);
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('user_id', data.user_id);
        window.location.href = '../inicio.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = `${errorStartSession}`;
    }
}

//CARGAR USUARIOS PARA EL LISTADO
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
            throw new Error(`${getUsersError}, ${response.status}`);
        }
        return await response.json(); 
        // Esto será un array de objetos: [{ user_id, username, password }, ...]
    } catch (error) {
        throw error; // Relanzamos el error para manejarlo fuera
    }
}

//Para cargar los mensajes
export async function fetchMessages(senderId, isGroup, limit = 10, offset = 0) {
    try {
        const isGroupParam = isGroup ? 'true' : 'false';

        // Aquí obtienes el token del localStorage
        const token = localStorage.getItem('token');

        const response = await fetch(`${URL}/receive_messages/${senderId}/${isGroupParam}?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Si tu endpoint requiere Bearer token:
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${getMessagesError}, ${response.status}`);
        }
        return await response.json();

    } catch (error) {
        throw error;
    }
}
// mandar mensajes
export async function postMessage(messageObj) {
    try {
        // Si requieres token, obténlo:
        // const token = localStorage.getItem('token');

        const response = await fetch(`${URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageObj)
        });

        if (!response.ok) {
            throw new Error(`${sendMessagesError}, ${response.status}`);
        }

        // Tu backend ahora devuelve un JSON con el ID del mensaje insertado, p. ej. { "message_id": 12 }
        const data = await response.json();
        return data; // p. ej. { "message_id": 12 }
    } catch (error) {
        throw error;
    }
}
// crear grupo
export async function createGroup(groupObj) {
    try {
        const token = localStorage.getItem('token'); // Si requieres autenticación

        const response = await fetch(`${URL}/create_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            },
            body: JSON.stringify(groupObj)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al crear grupo: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data; // { "group_id": 5 }
    } catch (error) {
        throw error;
    }
}