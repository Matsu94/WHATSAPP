import { openChat } from './openChat.js';

export async function showUsers(users){
  const chatListEl = document.getElementById('chatList');
  if (!chatListEl) return;

  chatListEl.innerHTML = '';

  users.forEach(user => {

    // Create chat item container
    const chatItem = document.createElement('div');
    chatItem.className = "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-chats)] flex justify-between items-center";

    // Create info div (name + last message)
    const infoDiv = document.createElement('div');
    infoDiv.className = "flex flex-col";

    // Name of the chat
    const nameEl = document.createElement('div');
    nameEl.className = "font-semibold";
    nameEl.innerText = user.username

    infoDiv.appendChild(nameEl);

    chatItem.appendChild(infoDiv);


    // Click event to open chat
    chatItem.addEventListener("click", () => {
        openChat(user.user_id, false, user.username);
      

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

