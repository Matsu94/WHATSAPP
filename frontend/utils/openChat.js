import { loadMessages } from "./loadMessages.js";
import { sendMessage } from "./sendMessage.js";
import { closeChatWindow } from "./closeChatWindow.js"; // Import the function
import { openChatError } from "../errors/errors.js";
import { fetchChats } from "../assets/fetching.js";
import { renderUserList } from "./renderUserList.js";
import { openGroupOptions } from "./openGroupOptions.js";
import { initScrollPagination, resetPagination } from "./scrolling.js";
import { searchChats } from "./searchUsers.js";

let socket = null;

export async function openChat(senderId, isGroup, senderName) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;
    const chats = await fetchChats();
    renderUserList(chats);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const filtered = searchChats(chats, e.target.value);
            renderUserList(filtered);
        });
    }

    // Cargar el contenido de openChat.html
    fetch("/WHATSAPP/frontend/components/openChat.html")
        .then((response) => response.text())
        .then((html) => {
            chatWindow.innerHTML = html;

            const chatHeader = document.getElementById("chatHeader");
            const groupOptions = document.getElementById("groupOptions");
            if (chatHeader) {
                chatHeader.textContent = senderName; // Default header text
            }

            if (isGroup && groupOptions) {
                groupOptions.classList.remove("hidden");
                groupOptions.addEventListener("click", () => {
                    openGroupOptions(senderId);
                });
            }

            // Cargar y mostrar los mensajes
            loadMessages(senderId, isGroup);
            resetPagination();
            initScrollPagination(senderId, isGroup);

            // Establecer conexión WebSocket
            const currentUserId = sessionStorage.getItem('user_id');
            socket = new WebSocket(`ws://127.0.0.1:8000/ws/${currentUserId}`);

            socket.onmessage = (event) => {
              console.log("WebSocket message received:", event.data); // Log the raw message
              const data = JSON.parse(event.data); // Parse the WebSocket message
              if (data.type === "new_message") {
                  console.log("New message detected:", data); // Log the parsed message
                  // Check if the message is for the current chat
                  if (
                      (data.is_group && data.receiver_id === senderId) || // Group chat
                      (!data.is_group && (data.sender_id === senderId || data.receiver_id === senderId)) // Direct chat
                  ) {
                      console.log("Reloading messages for current chat...");
                      loadMessages(senderId, isGroup); // Reload messages for the current chat
                  }
              }
          };

            // Agregar eventos a los elementos
            const sendBtn = document.getElementById("sendMessageBtn");
            const input = document.getElementById("newMessageInput");

            sendBtn.addEventListener("click", async () => {
                await sendMessage(senderId, isGroup);
                const chats = await fetchChats();
                renderUserList(chats);
            });

            input.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    await sendMessage(senderId, isGroup);
                    const chats = await fetchChats();
                    renderUserList(chats);
                } else if (e.key === "Escape") {
                    closeChatWindow(); // Use the imported function
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
                        closeChatWindow(); // Use the imported function
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

// Close WebSocket connection when chat window is closed
export function closeWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}