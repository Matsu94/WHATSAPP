/******************************************************
 * Datos de prueba
 ******************************************************/
/*
const mockChats = [
  {
    id: 1,
    name: "Juan Pérez",
    isGroup: false,
    messages: [
      { sender: "Juan", content: "Hola, ¿cómo estás?", date: "10:30 AM" },
      { sender: "Yo", content: "Todo bien, ¿y tú?", date: "10:31 AM" },
    ],
  },
  {
    id: 2,
    name: "Familia",
    isGroup: true,
    messages: [
      { sender: "Mamá", content: "No olvides la cena a las 20h", date: "09:00 AM" },
      { sender: "Yo", content: "Claro, estaré puntual", date: "09:15 AM" },
    ],
  },
  {
    id: 3,
    name: "María Delgado",
    isGroup: false,
    messages: [
      { sender: "María", content: "¿Viste la peli nueva?", date: "11:00 AM" },
      { sender: "Yo", content: "Todavía no, ¿la recomiendas?", date: "11:02 AM" },
    ],
  },
];
*/
/******************************************************
 * Renderizar la lista de chats en el panel izquierdo
 ******************************************************/
import { fetchUsers } from './assets/fetching.js'; // Ajusta la ruta si está en otra carpeta

// Función para renderizar en el DOM la lista de usuarios
function renderUserList(users) {
  const userListEl = document.getElementById('chatList');
  // Asumiendo que tienes <div id="userList"> en tu HTML
  if (!userListEl) return;

  // Limpia contenido previo
  userListEl.innerHTML = '';

  // Itera cada usuario y crea un elemento en la UI
  users.forEach(user => {
    // Por ejemplo, mostrará "ID: 0 - Username: user1"
    const userItem = document.createElement('div');
    userItem.className =  "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-border)]";
    userItem.innerText =`${user.username}`;
    userListEl.appendChild(userItem);
  });
}

/*
function renderChatList(chats) {
  const chatListEl = document.getElementById("chatList");
  chatListEl.innerHTML = "";

  chats.forEach((chat) => {
    const chatItem = document.createElement("div");
    chatItem.className =
      "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-border)]";
    chatItem.innerText = chat.name;

    // Al hacer clic, abrimos la ventana de chat
    chatItem.addEventListener("click", () => {
      openChat(chat.id);
    });

    chatListEl.appendChild(chatItem);
  });
}*/
/******************************************************
 * Abrir una conversación
 ******************************************************/
function openChat(chatId) {
  const chat = mockChats.find((c) => c.id === chatId);
  if (!chat) return;

  const chatWindow = document.getElementById("chatWindow");

  // Generamos el contenido de la ventana de chat
  chatWindow.innerHTML = `
    <div class="flex flex-col w-full h-full">
      <!-- Encabezado con nombre del chat -->
      <div class="p-4 border-b border-[var(--color-border)] flex items-center bg-[var(--color-user)]">
        <h2 class="text-lg font-bold flex-1 text-[var(--color-headers)]">
          ${chat.name}${chat.isGroup ? " (Grupo)" : ""}
        </h2>
      </div>

      <!-- Contenedor de mensajes -->
      <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-[var(--color-base)] flex flex-col">
      </div>

      <!-- Zona de enviar mensaje -->
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

  // Renderizamos los mensajes del chat
  renderChatMessages(chat);

  // Listeners
  const sendBtn = document.getElementById("sendMessageBtn");
  const input = document.getElementById("newMessageInput");

  // Al pulsar el botón "Enviar"
  sendBtn.addEventListener("click", () => {
    sendMessage(chatId);
  });

  // Al pulsar Enter en el input
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage(chatId);
    } else if (e.key === "Escape") {
      closeChatWindow();
    }
  });

  // Foco en el input inmediatamente
  input.focus();
}

/******************************************************
 * Renderizar los mensajes en el contenedor
 ******************************************************/
function renderChatMessages(chat) {
  const container = document.getElementById("messagesContainer");
  container.innerHTML = "";

  chat.messages.forEach((msg) => {
    const isMine = msg.sender === "Yo";

    // Contenedor para alinear a izq o der
    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("mb-2", "flex");

    // Si es mío -> justify-end (burbujas a la derecha)
    // Si es del otro -> justify-start
    if (isMine) {
      msgWrapper.classList.add("justify-end");
    } else {
      msgWrapper.classList.add("justify-start");
    }

    // Burbujas
    const msgBubble = document.createElement("div");
    msgBubble.classList.add(
      "p-2",
      "rounded",
      "max-w-xs", // ancho máximo
      "min-w-[10rem]", // ancho mínimo (~160px)
      "shadow-sm",
      "break-words",
      "text-[var(--color-text)]" // para que el texto adopte el color de var(--color-text)
    );

    // Color del fondo según sea mío u otro
    if (isMine) {
      msgBubble.classList.add("bg-[var(--color-other)]");
    } else {
      msgBubble.classList.add("bg-[var(--color-user)]");
    }

    // Contenido
    msgBubble.innerHTML = `
      <div class="font-semibold mb-1">${msg.sender}</div>
      <div>${msg.content}</div>
      <div class="text-xs text-gray-700 mt-1">${msg.date}</div>
    `;

    msgWrapper.appendChild(msgBubble);
    container.appendChild(msgWrapper);
  });

  // Opcional: Scroll al final de los mensajes
  container.scrollTop = container.scrollHeight;
}

/******************************************************
 * Enviar un nuevo mensaje
 ******************************************************/
function sendMessage(chatId) {
  const chat = mockChats.find((c) => c.id === chatId);
  if (!chat) return;

  const input = document.getElementById("newMessageInput");
  const text = input.value.trim();
  if (!text) return;

  // Añadimos un nuevo mensaje al array (asumiendo que el usuario logueado es "Yo")
  const newMsg = {
    sender: "Yo",
    content: text,
    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  chat.messages.push(newMsg);

  // Volvemos a mostrar los mensajes
  renderChatMessages(chat);

  // Limpiar el input
  input.value = "";
}

/******************************************************
 * Cerrar la ventana de chat (ESC)
 ******************************************************/
function closeChatWindow() {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = `
    <p class="text-xl text-center px-4">
      Pulsa en una conversación para ver los mensajes
    </p>
  `;
}

/******************************************************
 * Función para buscar chats
 ******************************************************/
function searchChats(query) {
  const lowerQuery = query.toLowerCase();
  return mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(lowerQuery)
  );
}

/******************************************************
 * Inicialización
 ******************************************************/
window.addEventListener("DOMContentLoaded", () => {
  // Pintamos la lista de chats
  async function init() {
    try {
      const users = await fetchUsers(); 
      console.log('Usuarios recibidos:', users);
      // Por ejemplo: [ {user_id:0, username:"user1", ...}, { ... }, ... ]
  
      renderUserList(users);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Podrías mostrar un mensaje de error en la interfaz
    }
  }
  init();
  // Búsqueda en la barra
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const filtered = searchChats(e.target.value);
    renderUserList(filtered);
  });

  // Botón "Crear grupo" (sólo muestra un alert, a modo de ejemplo)
  const createGroupBtn = document.getElementById("createGroupBtn");
  createGroupBtn.addEventListener("click", () => {
    alert("Aquí abrirías un formulario para crear un nuevo grupo.");
  });
});
