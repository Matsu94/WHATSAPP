import { openChat } from "./openChat.js";
import { formatDate } from './formatDate.js'; 
import { currentUserId } from "../constants/const.js";

export function renderUserList(chats) {
  const chatListEl = document.getElementById('chatList');
  if (!chatListEl) return;

  chatListEl.innerHTML = '';

  chats.forEach(chat => {
    const isGroupWithoutMessages = !!chat.creator_id; // Groups without messages have `creator_id`
    
    // Create chat item container
    const chatItem = document.createElement('div');
    chatItem.className = "p-3 hover:bg-[var(--color-border)] cursor-pointer border-b border-[var(--color-chats)] flex justify-between items-center";

    // Create info div (name + last message)
    const infoDiv = document.createElement('div');
    infoDiv.className = "flex flex-col";

    // Name of the chat
    const nameEl = document.createElement('div');
    nameEl.className = "font-semibold";
    nameEl.innerText = isGroupWithoutMessages ? chat.name : chat.chat_name;

    // Last message or description
    const lastMessageEl = document.createElement('div');
    lastMessageEl.className = "text-sm text-gray-400 truncate";
    lastMessageEl.innerText = chat.content ?? chat.description ?? "No hay mensajes."; // TECNICAMENTE NO HAY CHATS VACIOS EN PREVIEW

    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(lastMessageEl);

    // Timestamp handling
    const timestampEl = document.createElement('div');
    timestampEl.className = "text-xs text-gray-500";
    if (chat.date || chat.created_at) {
      const date = new Date(chat.date ?? chat.created_at);
      timestampEl.innerText = formatDate(date);
    } else {
      timestampEl.innerText = ""; // TECNICAMENTE TODO TIENE FECHA
    }

    chatItem.appendChild(infoDiv);
    chatItem.appendChild(timestampEl);

    // Click event to open chat
    chatItem.addEventListener("click", () => {
      if (isGroupWithoutMessages) {
        openChat(chat.group_id, 1, chat.name);
      } else {
        const targetId = chat.receiver_id === currentUserId ? chat.sender_id : chat.receiver_id;
        openChat(targetId, chat.is_group, chat.chat_name);
      }

      // Ocultar lista de chats y mostrar ventana de conversación en móviles
      if (window.innerWidth < 768) {
        document.getElementById("userListDiv").classList.add("hidden");
        document.getElementById("chatList").classList.add("hidden");
        document.getElementById("chatWindow").classList.remove("hidden");
      }
    });

    chatListEl.appendChild(chatItem);
  });
}
