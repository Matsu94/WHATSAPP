import { viewGroupMessageStatus } from "./viewGroupMessageStatus.js";

export function renderChatMessages(messages) {
  const container = document.getElementById("messagesContainer");
  const savedBackground = sessionStorage.getItem("chatBackground");
  if (savedBackground) {
    // Usamos jQuery para establecer el background
    $(container).css({
      "background-image": `url('../frontend/img/${savedBackground}')`,
      "background-repeat": "repeat",
      "background-position": "center"
    });
  }
  if (!container) return;

  container.innerHTML = "";

  // --- Ordenar de más antiguo a más nuevo según msg.date ---
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Variable para recordar el último día que se mostró en un encabezado
  let lastRenderedDate = "";
  const now = new Date();

  messages.forEach((msg) => {
    // Determinar si el mensaje es mío, según username o ID
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

    // Definir el nombre a mostrar
    let senderDisplay = "";
    if (!msg.is_group) {
      senderDisplay = isMine ? "Yo" : (msg.sender_name || `User ${msg.sender_id}`);
    } else {
      senderDisplay = isMine ? "Yo" : (msg.user_name || `User ${msg.user_name}`);
      msgBubble.addEventListener("dblclick", () => {
        viewGroupMessageStatus(msg);
      });
    }

    // Determinar el estado del mensaje (solo para mis mensajes)
    let status = "";
    if (msg.status === 1 && isMine) {
      status = "✓";
    } else if (msg.status === 2 && isMine) {
      status = "✓✓";
    } else if (msg.status === 3 && isMine) {
      status = "✓✓✓";
    }

    const msgDateObj = new Date(msg.date);
    // Formateamos la hora (por ejemplo, "14:30")
    let displayTime = msgDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Si el mensaje no es de hoy Y aún no se ha renderizado el encabezado para ese día, lo insertamos
    if (msgDateObj.toDateString() !== now.toDateString() && msgDateObj.toDateString() !== lastRenderedDate) {
      const dayHeader = document.createElement('div');
      dayHeader.className = "text-center text-xs text-gray-500 my-2";
      dayHeader.innerText = msgDateObj.toLocaleDateString(); // Puedes ajustar el formato si lo deseas
      container.appendChild(dayHeader);
      lastRenderedDate = msgDateObj.toDateString();
    }

    // Renderizamos el mensaje: contenido y, en la misma línea, hora y estado
    msgBubble.innerHTML = `
      <div class="font-titles font-bold mb-1">${senderDisplay}</div>
      <div class="flex items-center justify-between">
        <span>${msg.content}</span>
        <span class="text-xs text-[var(--color-text)] font-dates font-light">${displayTime}  ${status}</span>
      </div>
    `;

    msgWrapper.appendChild(msgBubble);
    container.appendChild(msgWrapper);
  });

  // Al final, desplazamos el scroll al fondo para ver el último mensaje
  container.scrollTop = container.scrollHeight;
}
