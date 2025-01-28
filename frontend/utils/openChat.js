import { loadMessages } from "./loadMessages.js";
import { sendMessage } from "./sendMessage.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { openChatError } from "../errors/errors.js";

//Abrir chat en la sección derecha
export function openChat(senderId, isGroup, senderName) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;

  // Cargar el contenido de openChat.html
  fetch("/WHATSAPP/frontend/components/openChat.html")
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
      console.error(`${openChatError}`, err);
    });
}