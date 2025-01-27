import { fetchUsers, fetchMessages, postMessage, createGroup } from '../assets/fetching.js';
import { currentUserId } from '../constants/const.js';
import { handleCreateGroupFormSubmit } from '../login/validations/groupValidations.js';
// 1) Renderizar la lista de usuarios (panel izquierdo)
function renderUserList(users) {
  const userListEl = document.getElementById('chatList');
  if (!userListEl) return;

  userListEl.innerHTML = '';

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-border)]";
    userItem.innerText = user.username;

    // Al hacer clic => abrimos chat con user_id (isGroup=false)
    userItem.addEventListener("click", () => {
      openChat(user.user_id, false, user.username);
    });

    userListEl.appendChild(userItem);
  });
}
// 2) Abrir chat en la sección derecha
function openChat(senderId, isGroup, senderName) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;

  chatWindow.innerHTML = `
    <div class="flex flex-col w-full h-full">
      <div class="p-4 border-b border-[var(--color-border)] flex items-center bg-[var(--color-user)]">
        <h2 class="text-lg font-bold flex-1 text-[var(--color-headers)]">
          ${senderName} ${isGroup ? "(Grupo)" : ""}
        </h2>
      </div>

      <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-[var(--color-base)] flex flex-col">
      </div>

      <div class="p-3 border-t border-[var(--color-border)] flex items-center bg-[var(--color-user)]">
        <input
          type="text"
          id="newMessageInput"
          class="flex-1 p-2 border border-[var(--color-border)]
                 rounded focus:outline-none focus:ring-2
                 focus:ring-[var(--color-headers)]"
          placeholder="Escribe un mensaje..."
        />
        <button
          id="sendMessageBtn"
          class="ml-2 px-4 py-2 bg-[var(--color-dark)] text-white rounded
                 hover:bg-opacity-90 flex items-center"
        >
          Enviar
          <span class="ml-2">➡️</span>
        </button>
      </div>
    </div>
  `;

  // Cargar y mostrar los mensajes
  loadMessages(senderId, isGroup);

  // Listeners
  const sendBtn = document.getElementById("sendMessageBtn");
  const input = document.getElementById("newMessageInput");

  sendBtn.addEventListener("click", () => {
    sendMessage(senderId, isGroup);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage(senderId, isGroup);
    } else if (e.key === "Escape") {
      closeChatWindow();
    }
  });

  input.focus();
}

// 3) loadMessages llama a fetchMessages y luego renderChatMessages
async function loadMessages(senderId, isGroup) {
  try {
    const messages = await fetchMessages(senderId, isGroup);


    renderChatMessages(messages, currentUserId);
  } catch (error) {
    console.error(getMessagesError, error);
  }
}

// 4) renderChatMessages: pinta las burbujas con los más antiguos arriba
function renderChatMessages(messages, currentUserId) {
  const container = document.getElementById("messagesContainer");
  if (!container) return;

  container.innerHTML = "";

  // --- Ordenar de más antiguo a más nuevo según msg.date ---
  // Asume que msg.date es un string parseable (ej. "2023-05-20T10:00:00")
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

  messages.forEach((msg) => {
    // Comparamos con el username (o ID), dependiendo de tu lógica
    const currentUsername = localStorage.getItem('username') || "";
    const isMine = (msg.sender_name === currentUsername);

    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("mb-2", "flex", isMine ? "justify-end" : "justify-start");

    const msgBubble = document.createElement("div");
    msgBubble.classList.add(
      "p-2",
      "rounded",
      "max-w-xs",
      "min-w-[10rem]",
      "shadow-sm",
      "break-words",
      "text-[var(--color-text)]",
      isMine ? "bg-[var(--color-other)]" : "bg-[var(--color-user)]"
    );

    // Si es mi mensaje => "Yo", si no => msg.sender_name
    const senderDisplay = isMine ? "Yo" : (msg.sender_name || `User ${msg.sender_id}`);

    msgBubble.innerHTML = `
      <div class="font-semibold mb-1">${senderDisplay}</div>
      <div>${msg.content}</div>
      <div class="text-xs text-gray-700 mt-1">${msg.date}</div>
    `;

    msgWrapper.appendChild(msgBubble);
    container.appendChild(msgWrapper);
  });

  // Al final, movemos el scroll al fondo para ver el último mensaje
  container.scrollTop = container.scrollHeight;
}

// 5) sendMessage con POST real a /sendMessage y luego refrescamos
async function sendMessage(senderId, isGroup) {
  const input = document.getElementById("newMessageInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const messageObj = {
    Content: text, 
    Date: null,
    Status: 1,
    Sender: currentUserId.toString(),
    Receiver: senderId.toString(),
    isGroup: isGroup
  };

  try {
    const responseData = await postMessage(messageObj);  // <-- fetch POST

    input.value = "";
    loadMessages(senderId, isGroup);
  } catch (error) {
    console.error(sendMessagesError, error);
  }
}

// 6) Cerrar chat
function closeChatWindow() {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;
  chatWindow.innerHTML = `
    <p class="text-xl text-center px-4">
      Pulsa en una conversación para ver los mensajes
    </p>
  `;
}

// 7) Búsqueda en local (si tuvieras un array de users en memoria)
function searchUsers(users, query) {
  const lowerQuery = query.toLowerCase();
  return users.filter(u => 
    u.username.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Renderiza el formulario para crear un nuevo grupo en el chatWindow.
 */
function openCreateGroupForm() {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;

  // Obtener la lista completa de usuarios para seleccionar miembros
  fetchUsers()
    .then(users => {
      // Excluir al usuario actual de la lista de miembros (asumiendo que no quieres que se autoagregue)
      
      console.log(currentUserId);
      const availableMembers = users.filter(user => user.user_id !== currentUserId);

      // Crear el HTML del formulario
      chatWindow.innerHTML = `
       <div class="flex flex-col w-full h-full p-6 bg-[var(--color-background)] shadow-lg rounded-lg">
        <h2 class="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">Crear Nuevo Grupo</h2>
      <form id="createGroupForm" class="flex flex-col space-y-6">
        <!-- Input para el nombre del grupo -->
        <div>
      <label for="groupNameInput" class="block text-sm font-medium text-[var(--color-text)] mb-2">Nombre del Grupo</label>
      <input
        type="text"
        id="groupNameInput"
        class="w-full p-3 border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        placeholder="Escribe el nombre del grupo"
        required
      />
        </div>
        <!-- Textarea para la descripción del grupo -->
        <div>
      <label for="groupDescriptionInput" class="block text-sm font-medium text-[var(--color-text)] mb-2">Descripción del Grupo</label>
      <textarea
        id="groupDescriptionInput"
        class="w-full p-3 border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        placeholder="Agrega una breve descripción del grupo"
        rows="4"
      ></textarea>
        </div>
        <!-- Checkbox para seleccionar usuarios -->
        <div>
      <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Selecciona miembros:</label>
      <div class="grid grid-cols-2 gap-4 max-h-40 overflow-y-auto border border-[var(--color-border)] p-3 rounded-lg">
        ${availableMembers
          .map(
        (user) => `
          <div class="flex items-center space-x-2">
            <input 
          type="checkbox" 
          id="user-${user.user_id}" 
          value="${user.user_id}" 
          class="form-checkbox text-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded">
            <label for="user-${user.user_id}" class="text-[var(--color-text)]">${user.username}</label>
          </div>
        `
          )
          .join('')}
      </div>
        </div>
        <!-- Botones de acción -->
        <div class="flex justify-between space-x-4">
      <button
        type="submit"
        id="submitCreateGroup"
        class="px-3 py-1 bg-[var(--color-dark)] text-white rounded hover:bg-opacity-90 text-sm">
        Crear Grupo
      </button>
      <button
        type="button"
        id="cancelCreateGroupBtn"
        class="px-3 py-1 bg-[var(--color-dark)] text-white rounded hover:bg-opacity-90 text-sm"
      >
        Cancelar
      </button>
        </div>
        <!-- Mensaje de error -->
        <div id="createGroupError" class="text-red-500 text-sm mt-2 hidden"></div>
      </form>
    </div>
      `;

      // Agregar listeners al formulario y al botón de cancelar
      const createGroupForm = document.getElementById("createGroupForm");
      const cancelCreateGroupBtn = document.getElementById("cancelCreateGroupBtn");

      cancelCreateGroupBtn.addEventListener("click", () => {
        closeChatWindow();
      });

      createGroupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleCreateGroupFormSubmit();
      });
    })
    .catch(error => {
      console.error("Error al obtener usuarios para crear grupo:", error);
      chatWindow.innerHTML = `
        <p class="text-red-500">Error al cargar usuarios para crear el grupo.</p>
      `;
    });
}

/**
 * Maneja el envío del formulario de creación de grupo.
 */



// 8) Inicialización
window.addEventListener("DOMContentLoaded", () => {
  async function init() {
    try {
      const users = await fetchUsers();
      renderUserList(users);

      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const filtered = searchUsers(users, e.target.value);
          renderUserList(filtered);
        });
      }

      const createGroupBtn = document.getElementById("createGroupBtn");
if (createGroupBtn) {
  createGroupBtn.addEventListener("click", () => {
    openCreateGroupForm();
  });
}

    } catch (error) {
      console.error(getUsersError, error);
      // Manejo de error si deseas
    }
  }

  init(); 
});

