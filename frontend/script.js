import { fetchUsers, fetchMessages, postMessage, fetchToken } from './assets/fetching.js';

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
    console.log("Mensajes recibidos:", messages);

    // Leer currentUserId del localStorage:
    const currentUserId = parseInt(localStorage.getItem('user_id'), 10) || 0;

    renderChatMessages(messages, currentUserId);
  } catch (error) {
    console.error("Error al cargar mensajes:", error);
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

    console.log("Comparando msg.sender_id:", msg.sender_id, "con currentUserId:", currentUserId);

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
  console.log("IsGroup: ", isGroup);
  console.log("SenderID: ", senderId);
  const input = document.getElementById("newMessageInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  console.log("Enviando mensaje:", text);
  const currentUserId = parseInt(localStorage.getItem('user_id'), 10) || 0;
  console.log("CurrentUserID:", currentUserId);
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
    console.log("Mensaje enviado. Respuesta:", responseData);

    input.value = "";
    loadMessages(senderId, isGroup);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
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

// 8) Inicialización
window.addEventListener("DOMContentLoaded", () => {
  async function init() {
    try {
      const users = await fetchUsers();
      console.log('Usuarios recibidos:', users);
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
          alert("Aquí abrirías un formulario para crear un nuevo grupo.");
        });
      }

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Manejo de error si deseas
    }
  }

  init(); 
});
