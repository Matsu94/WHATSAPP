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

  // Cargar el contenido de openChat.html
  fetch("components/openChat.html")
    .then((response) => response.text())
    .then((html) => {
      chatWindow.innerHTML = html;

      // Actualizar dinámicamente el encabezado
      const chatHeader = document.getElementById("chatHeader");
      if (chatHeader) {
        chatHeader.textContent = `${senderName} ${isGroup ? "(Grupo)" : ""}`;
      }

      // Cargar y mostrar los mensajes
      loadMessages(senderId, isGroup);

      // Agregar eventos a los elementos
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

      // Poner foco en el input
      input.focus();
    })
    .catch((err) => {
      console.error("Error cargando openChat.html:", err);
    });
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

//Renderiza el formulario para crear un nuevo grupo en el chatWindow.

function openCreateGroupForm() {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;

  // Obtener la lista completa de usuarios para seleccionar miembros
  fetchUsers()
    .then(users => {
      // Excluir al usuario actual de la lista de miembros
      console.log(currentUserId);
      const availableMembers = users.filter(user => user.user_id !== currentUserId);

      // Cargar el contenido de createGroupForm.html
      fetch("components/createGroupForm.html")
        .then((response) => response.text())
        .then((html) => {
          chatWindow.innerHTML = html;

          // Insertar los usuarios disponibles en el formulario
          const membersContainer = document.getElementById("availableMembers");
          membersContainer.innerHTML = availableMembers
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
            .join('');

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
          console.error("Error al cargar el formulario de creación de grupo:", error);
          chatWindow.innerHTML = `
            <p class="text-red-500">Error al cargar el formulario de creación de grupo.</p>
          `;
        });
    })
    .catch(error => {
      console.error("Error al obtener usuarios para crear grupo:", error);
      chatWindow.innerHTML = `
        <p class="text-red-500">Error al cargar usuarios para crear el grupo.</p>
      `;
    });
}


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