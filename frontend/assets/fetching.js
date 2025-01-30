import { URL } from '../constants/const.js';
import * as errors from '../errors/errors.js';

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
            throw new Error(errors.requestError);
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('user_id', data.user_id);
        window.location.href = '../inicio.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = `${errors.errorStartSession}`;
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
            throw new Error(`${errors.getUsersError}, ${response.status}`);
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

        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');

        // Fetch messages from the backend
        const response = await fetch(`${URL}/receive_messages/${senderId}/${isGroupParam}?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.errorFetchingMessages}, ${response.status}`);
        }

        // Parse the JSON response (this contains all the messages)
        const messages = await response.json();

        // Extract message IDs from the messages array
        const messageIds = messages.map(message => message.message_id);

        // Send the IDs to the change_state endpoint
        const changeStateResponse = await fetch(`${URL}/change_state/${3}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageIds) // Send the IDs as the body
        });

        if (!changeStateResponse.ok) {
            throw new Error(`${errors.errorChangingMessageState} ${changeStateResponse.status}`);
        }

        return messages; // Return the messages for rendering in the frontend
    } catch (error) {
        console.error(error);
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
            throw new Error(`${errors.sendMessagesError}, ${response.status}`);
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
            throw new Error(`${errors.createGroupError} ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data; // { "group_id": 5 }
    } catch (error) {
        throw error;
    }
}

export async function fetchChats() {
    try {
        const token = localStorage.getItem('token'); // Si requieres autenticación

        const response = await fetch(`${URL}/chats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener chats: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data; // Esperamos un array de objetos con usuarios/grupos y el último mensaje
    } catch (error) {
        throw error;
    }
}