import { viewGroupMessageStatus } from "./viewGroupMessageStatus.js";

export function renderChatMessages(messages, options = {}) {
  // Si options.prepend es true, no limpia el contenedor
  const { prepend = false } = options;
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

  // Solo limpiamos el contenedor si NO se trata de un prepend
  if (!prepend) {
    container.innerHTML = "";
  }

  // Ordenar de más antiguo a más nuevo según msg.date
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Creamos un fragment para insertar los nuevos mensajes
  const fragment = document.createDocumentFragment();

  // Variable para recordar el último día ya renderizado
  // (Nota: para el prepend puede que quieras evaluar si los encabezados de fechas se duplican)
  let lastRenderedDate = "";
  // Si no se limpia el contenedor, intentamos obtener la última fecha renderizada.
  // Esto es opcional y depende de cómo quieras manejar los encabezados de fecha en mensajes antiguos.
  if (prepend && container.firstChild) {
    // Por ejemplo, podrías obtener el texto del primer header si existe:
    const firstHeader = container.querySelector("div.text-center.text-xs.text-gray-500");
    if (firstHeader) {
      lastRenderedDate = firstHeader.innerText;
    }
  }
  const now = new Date();

  messages.forEach((msg) => {
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
      "overflow-hidden",
      "word-break",
      "break-all",
      "text-[var(--color-text)]",
      isMine ? "bg-[var(--color-other)]" : "bg-[var(--color-user)]"
    );    
    
    // Definir el nombre a mostrar
    let senderDisplay = "";
    if (!msg.is_group) {
      senderDisplay = isMine ? "Yo" : (msg.sender_name || `User ${msg.sender_id}`);
    } else {
      senderDisplay = isMine ? "Yo" : (msg.user_name || `User ${msg.user_name}`);
      msgBubble.addEventListener("click", () => {
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
      status = '<span style="color: #b400b4;">✓✓✓</span>';
    }

    const msgDateObj = new Date(msg.date);
    let displayTime = msgDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Insertar un encabezado de fecha si corresponde y si aún no se ha renderizado para ese día
    if (msgDateObj.toDateString() !== now.toDateString() && msgDateObj.toDateString() !== lastRenderedDate) {
      const dayHeader = document.createElement('div');
      dayHeader.className = "text-center text-xs text-gray-500 my-2";
      dayHeader.innerText = msgDateObj.toLocaleDateString();
      fragment.appendChild(dayHeader);
      lastRenderedDate = msgDateObj.toDateString();
    }

    // Renderizamos el contenido del mensaje
    msgBubble.innerHTML = `
      <div class="font-titles font-bold mb-1">${senderDisplay}</div>
      <div class="flex items-center justify-between">
        <span>${msg.content}</span>
      </div>
      <div class="flex items-center justify-end">
        <span class="text-xs text-[var(--color-text)] font-dates font-light">${displayTime}  ${status}</span>
      </div>
    `;

    msgWrapper.appendChild(msgBubble);
    fragment.appendChild(msgWrapper);
  });
  
  if (prepend) {
    // Si es un prepend, insertamos el fragment al inicio sin limpiar el contenedor
    container.insertBefore(fragment, container.firstChild);
  } else {
    // En un render "normal" agregamos al final y luego desplazamos hacia el final
    container.appendChild(fragment);
    container.scrollTop = container.scrollHeight;
  }
}
