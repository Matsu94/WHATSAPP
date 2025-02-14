// Cerrar chat
export function closeChatWindow() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;
    chatWindow.innerHTML = `
      <p class="title-font text-center px-4">
        Pulsa en una conversación para ver los mensajes
      </p>
    `;
  }