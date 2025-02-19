import { openChat } from "./openChat.js";
import { formatDate } from './formatDate.js'; 
import { currentUserId } from "../constants/const.js";


export function renderUserList(chats, unreadLookup = {}) {
  const chatListEl = document.getElementById('chatList');
  if (!chatListEl) return;

  chatListEl.innerHTML = '';

  chats.forEach(chat => {
    const isGroupWithoutMessages = !!chat.creator_id;

    // Create chat item container
    const chatItem = document.createElement('div');
    chatItem.className = "p-3 hover:bg-[var(--color-border)] cursor-pointer border-b border-[var(--color-chats)] flex justify-between items-center relative";
    
    // Create info div (name + last message)
    const infoDiv = document.createElement('div');
    infoDiv.className = "flex flex-col";

    // Name of the chat
    const nameEl = document.createElement('div');
    nameEl.className = "font-semibold text-[var(--color-text)]";
    nameEl.innerText = isGroupWithoutMessages ? chat.name : chat.chat_name;

    // Last message or description
    const lastMessageEl = document.createElement('div');
    lastMessageEl.className = "mini-font-size text-[var(--color-text)] truncate overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[120px]";
    lastMessageEl.innerText = chat.content ?? chat.description ?? "No hay mensajes.";

    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(lastMessageEl);

    // Timestamp handling
    const timestampEl = document.createElement('div');
    timestampEl.className = "mini-font-size text-[var(--color-text)]";
    if (chat.date || chat.created_at) {
      const date = new Date(chat.date ?? chat.created_at);
      timestampEl.innerText = formatDate(date);
    } else {
      timestampEl.innerText = "";
    }

    chatItem.appendChild(infoDiv);
    chatItem.appendChild(timestampEl);

    // Add unread message alert badge
    const unreadCount = unreadLookup[chat.chat_name] || 0;
    if (unreadCount > 0) {
      const unreadBadge = document.createElement('div');
      unreadBadge.className = "absolute right-2 top-1 bg-[var(--color-alert)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full";
      unreadBadge.innerText = unreadCount;
      chatItem.appendChild(unreadBadge);
    }

    // Click event to open chat
    chatItem.addEventListener("click", () => {
      if (isGroupWithoutMessages) {
        openChat(chat.group_id, 1, chat.name);
      } else {
        const targetId = chat.receiver_id === currentUserId ? chat.sender_id : chat.receiver_id;
        openChat(targetId, chat.is_group, chat.chat_name);
      }

      if (window.innerWidth < 768) {
        document.getElementById("userListDiv").classList.add("hidden");
        document.getElementById("chatList").classList.add("hidden");
        document.getElementById("chatWindow").classList.remove("hidden");
      }
    });

    chatListEl.appendChild(chatItem);
  });
}
