import { URL, token } from '../constants/const.js';
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
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('user_id', data.user_id);
        window.location.href = '../inicio.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = `${errors.errorStartSession}`;
    }
}

//CARGAR USUARIOS PARA EL LISTADO
export async function fetchUsers() {
    try {

        const response = await fetch(`${URL}/usersWithoutChat`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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

export async function fetchChats() {
    try {
 // Si requieres autenticación

        const response = await fetch(`${URL}/chats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            }
        });

        const response2 = await fetch(`${URL}/get_missing_groups`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            }
        });

        if (!response.ok && !response2.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener chats: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        const data2 = await response2.json();
        return [...data, ...data2]; // Esperamos un array de objetos con usuarios/grupos, el último mensaje y los grps sin msjs
    } catch (error) {
        throw error;
    }
}

export async function fetchUnreadMessages() {
    try {

        // Fetch messages from the backend
        const response = await fetch(`${URL}/check_messages`, {
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

        // Send the IDs to the change_state endpoint
        const changeStateResponse = await fetch(`${URL}/change_state/${2}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messages) // Send the IDs as the body
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

//Para cargar los mensajes
export async function fetchMessages(senderId, isGroup, offset = 0) {
    try {
        const isGroupParam = isGroup ? 'true' : 'false';

        // Fetch messages from the backend
        const response = await fetch(`${URL}/receive_messages/${senderId}/${isGroupParam}?offset=${offset}`, {
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

        // Send the IDs to the change_state endpoint
        const changeStateResponse = await fetch(`${URL}/change_state/${3}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messages) // Send the IDs as the body
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
        const response = await fetch(`${URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageObj)
        });

        if (!response.ok) {
            throw new Error(`${errors.sendMessagesError}, ${response.status}`);
        }
        // El backend responde con el id del mensaje
        const data = await response.json();
        return data; // p. ej. { "message_id": 12 }
    } catch (error) {
        throw error;
    }
}

// estados mensaje grupo
export async function fetchGroupMessageStatus(messageId) {
    try {


        const response = await fetch(`${URL}/group_message_status/${messageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.errorFetchingMessageStatus}, ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// crear grupo
export async function createGroup(groupObj) {
    try {

        const response = await fetch(`${URL}/create_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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


//CARGAR INFO GRUPO
export async function fetchGroupInfo(group_id) {
    try {
 // Si requieres autenticación

        const response = await fetch(`${URL}/group_info/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.getGroupInfoError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// CAMBIAR NOMBRE GRUPO
export async function updateGroupName(group_id, name) {
    try {


        const response = await fetch(`${URL}/update_name/${group_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            throw new Error(`${errors.updateGroupError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// CAMBIAR DESCRIPCION GRUPO
export async function updateGroupDescription(group_id, description) {
    try {


        const response = await fetch(`${URL}/update_description/${group_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            throw new Error(`${errors.updateGroupError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

//CARGAR USUARIOS PARA GRUPO
export async function fetchUsersForGroup() {
    try {


        const response = await fetch(`${URL}/usersForGroup`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
//CARGAR USUARIOS DE GRUPO
export async function fetchUsersFromGroup(group_id) {
    try {


        const response = await fetch(`${URL}/get_members/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
export async function removeUserFromGroup(group_id, userId) {
    try {


        const response = await fetch(`${URL}/remove_user/${group_id}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.removeUserError}, ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateUserToAdmin(group_id, userId)  {
    try {
 

        const response = await fetch(`${URL}/add_admin/${group_id}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.promoteUserError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function addUsersToGroup(group_id, usersIds) {
    try {

        const response = await fetch(`${URL}/add_users/${group_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ Members: usersIds })
        });
        if (!response.ok) {
            throw new Error(`${errors.promoteUserError}, ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function leaveGroup(group_id) {
    try {
        const response = await fetch(`${URL}/leave_group/${group_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail);  // Error means they can't leave
        }

        return { ok: true, data };  // Successful case

    } catch (error) {
        return { ok: false, data: error.message };  // Return error details
    }
}
