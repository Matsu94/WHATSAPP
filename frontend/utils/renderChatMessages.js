
// renderChatMessages: pinta las burbujas con los más antiguos arriba
export function renderChatMessages(messages) {
  const container = document.getElementById("messagesContainer");
  const savedBackground = sessionStorage.getItem("chatBackground");
  if (savedBackground) {
    //JQUERY para la parte de Petrus
    $(container).css({
      "background-image": `url('../frontend/img/${savedBackground}')`,
      "background-repeat": "repeat",
      "background-position": "center"
    });
  }
  if (!container) return;

  container.innerHTML = "";

  // --- Ordenar de más antiguo a más nuevo según msg.date ---
  // Asume que msg.date es un string parseable (ej. "2023-05-20T10:00:00")
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

  messages.forEach((msg) => {
    // Comparamos con el username (o ID), dependiendo de tu lógica
    const currentUsername = sessionStorage.getItem('username') || "";
    let isMine = "";

    if (!msg.is_group) {
      isMine = (msg.sender_name === currentUsername);
    } else {
      isMine = (msg.user_name === currentUsername);
    }

    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("mb-2", "flex", isMine ? "justify-end" : "justify-start");

    const msgBubble = document.createElement("div");
    msgBubble.classList.add(
      "p-2",
      "rounded",
      "max-w-xs",
      "min-w-[10rem]",
      "shadow-sm",
      "break-words",
      "text-[var(--color-text)]",
      isMine ? "bg-[var(--color-other)]" : "bg-[var(--color-user)]"
    );

    // Si es mi mensaje => "Yo", si no => msg.sender_name
    let senderDisplay = "";
    if (!msg.is_group) {
      senderDisplay = isMine ? "Yo" : (msg.sender_name || `User ${msg.sender_id}`);
    } else {
      senderDisplay = isMine ? "Yo" : (msg.user_name || `User ${msg.user_name}`);
    }

    msgBubble.innerHTML = `
      <div class="font-titles font-bold mb-1">${senderDisplay}</div>
      <div>${msg.content}</div>
      <div class="text-xs text-[var(--color-text)] mt-1 font-dates font-light">${msg.date}</div>
    `;


    msgWrapper.appendChild(msgBubble);
    container.appendChild(msgWrapper);
  });

  // Al final, movemos el scroll al fondo para ver el último mensaje
  container.scrollTop = container.scrollHeight;
}