import { closeWebSocket } from "./openChat.js"; // Import the WebSocket cleanup function

// Cerrar chat
export function closeChatWindow() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;
    chatWindow.innerHTML = `
      <p class="text-xl text-center px-4">
        Pulsa en una conversación para ver los mensajes
      </p>
    `;
    closeWebSocket(); // Close the WebSocket connection
}