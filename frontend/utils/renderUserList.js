import { openChat } from "./openChat.js";

// Renderizar la lista de usuarios (panel izquierdo)
export function renderUserList(users) {
  const userListEl = document.getElementById("chatList");
  if (!userListEl) return;

  userListEl.innerHTML = "";

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className =
      "p-3 hover:bg-gray-100 cursor-pointer border-b border-[var(--color-border)]";
    userItem.innerText = user.username;

    // Al hacer clic => abrimos chat con user_id (isGroup=false)
    userItem.addEventListener("click", () => {
      openChat(user.user_id, false, user.username);
    });

    userListEl.appendChild(userItem);
  });
}
