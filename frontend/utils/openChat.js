import { loadMessages } from "./loadMessages.js";
import { sendMessage } from "./sendMessage.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { openChatError } from "../errors/errors.js";
import { fetchChats, fetchMessages } from "../assets/fetching.js";
import { renderUserList } from "./renderUserList.js";
import { openGroupOptions } from "./openGroupOptions.js";
import { initScrollPagination, resetPagination } from "./scrolling.js";
import { searchChats } from "./searchUsers.js";
import { renderChatMessages } from "./renderChatMessages.js";

let socket = null;

export async function openChat(senderId, isGroup, senderName) {
    closeWebSocket();
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    // Load messages first before updating chat list so alerts are deleted
    await fetchMessages(senderId, isGroup, 0);

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
            const roomId = isGroup ? ("Group_"+senderId) : currentUserId;
            socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);
            
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);  // Parse the JSON array
                if (data[0].sender_id == senderId && !isGroup) {
                    renderChatMessages(data, { append: true });
                    /* Si queremos que no se muestre el msj en alertas habría que hacer fetch(`${URL}/change_state/${3}`*/
                } if (isGroup) {
                    renderChatMessages(data, { append: true });
                }
                fetchMessages(senderId, isGroup, 0);
            };

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

// Close WebSocket connection when chat window is closed
export function closeWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}