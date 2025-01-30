import { openChat } from "./openChat.js";
import { formatDate } from './formatDate.js'; 
import { currentUserId } from "../constants/const.js";

export function renderUserList(chats) {
  const chatListEl = document.getElementById('chatList');
  if (!chatListEl) return;

  chatListEl.innerHTML = '';

  chats.forEach(chat => {
      const chatItem = document.createElement('div');
      chatItem.className = "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-border)] flex justify-between items-center";

      // Información principal: Nombre y último mensaje
      const infoDiv = document.createElement('div');
      infoDiv.className = "flex flex-col";

      const nameEl = document.createElement('div');
      nameEl.className = "font-semibold";
      nameEl.innerText = chat.chat_name;

      const lastMessageEl = document.createElement('div');
      lastMessageEl.className = "text-sm text-gray-600 truncate";
      lastMessageEl.innerText = chat.content ? chat.content : "No hay mensajes.";

      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(lastMessageEl);

      // Timestamp del último mensaje
      const timestampEl = document.createElement('div');
      timestampEl.className = "text-xs text-gray-500";
      if (chat.last_message && chat.date) {
          const date = new Date(chat.date);
          timestampEl.innerText = formatDate(date);
      } else {
          timestampEl.innerText = "";
      }

      chatItem.appendChild(infoDiv);
      chatItem.appendChild(timestampEl);

      // Al hacer clic, abrir el chat correspondiente
      chatItem.addEventListener("click", () => {
        if(chat.receiver_id == currentUserId){
          openChat(chat.sender_id, chat.is_group, chat.chat_name);
        }
        else{
          openChat(chat.receiver_id, chat.is_group, chat.chat_name);
        }
      });

      chatListEl.appendChild(chatItem);
  });
} 