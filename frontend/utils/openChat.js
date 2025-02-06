import { loadMessages } from "./loadMessages.js";
import { sendMessage } from "./sendMessage.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { openChatError } from "../errors/errors.js";
import { fetchChats } from "../assets/fetching.js";
import { renderUserList } from "./renderUserList.js";

//Abrir chat en la sección derecha
export async function openChat(senderId, isGroup, senderName) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;
  const chats = await fetchChats();
  renderUserList(chats);

  // Cargar el contenido de openChat.html
  fetch("/WHATSAPP/frontend/components/openChat.html")
    .then((response) => response.text())
    .then((html) => {
      chatWindow.innerHTML = html;

      // Actualizar dinámicamente el encabezado
      const chatHeader = document.getElementById("chatHeader");
      if (chatHeader) {
        chatHeader.textContent = `${senderName}`;
      }

      // Cargar y mostrar los mensajes
      loadMessages(senderId, isGroup);

      // Agregar eventos a los elementos
      const sendBtn = document.getElementById("sendMessageBtn");
      const input = document.getElementById("newMessageInput");

      sendBtn.addEventListener("click", async () => {
        sendMessage(senderId, isGroup);
        const chats = await fetchChats();
        renderUserList(chats);
      });

      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          sendMessage(senderId, isGroup);
          const chats = await fetchChats();
          renderUserList(chats);
        } else if (e.key === "Escape") {
          closeChatWindow();
        }
      });

      // Esperar a que el DOM actualice y luego llamar la función
      setTimeout(() => {
        const closeBtn = document.getElementById("closeChatBtn");
        const chatList = document.getElementById("chatList");
        const userListDiv = document.getElementById("userListDiv");
        const chatWindow = document.getElementById("chatWindow");
    
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            closeChatWindow();
            chatList.classList.remove("hidden");
            chatWindow.classList.add("hidden");
            userListDiv.classList.remove("hidden");
            closeBtn.classList.add("hidden");
          });
        }
      }, 100);

      // Poner foco en el input
      input.focus();
    })
    .catch((err) => {
      console.error(`${openChatError}`, err);
    });
}