import { viewGroupMessageStatus } from "./viewGroupMessageStatus.js";

export function renderChatMessages(messages, options = {}) {
  const { prepend = false, append = false } = options; // Add `append` option
  const container = document.getElementById("messagesContainer");
  const savedBackground = sessionStorage.getItem("chatBackground");

  if (savedBackground) {
    $(container).css({
      "background-image": `url('../frontend/img/${savedBackground}')`,
      "background-repeat": "repeat",
      "background-position": "center"
    });
  }

  if (!container) return;

  // Only clear the container if it's not a prepend or append operation
  if (!prepend && !append) {
    container.innerHTML = "";
  }

  // Sort messages from oldest to newest based on msg.date
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Create a fragment for the new messages
  const fragment = document.createDocumentFragment();

  // Variable to remember the last rendered date
  let lastRenderedDate = "";

  // If it's a prepend or append operation, try to get the last rendered date
  if ((prepend || append) && container.firstChild) {
    const firstHeader = container.querySelector("div.text-center.mini-font-size.text-gray-500");
    if (firstHeader) {
      lastRenderedDate = firstHeader.innerText;
    }
  }

  const now = new Date();

  messages.forEach((msg) => {
    const currentUsername = sessionStorage.getItem('username') || "";
    let isMine = (msg.sender_name === currentUsername);

    if (msg.is_group) {
      isMine = (msg.user_name === currentUsername);
    }

    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("mb-2", "flex", isMine ? "justify-end" : "justify-start");

    const msgBubble = document.createElement("div");
    msgBubble.classList.add(
      "p-2",
      "rounded",
      "base-font-size",
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

    // Define the sender's display name
    let senderDisplay = isMine ? "Yo" : (msg.sender_name || `User ${msg.sender_id}`);
    if (msg.is_group) {
      senderDisplay = isMine ? "Yo" : (msg.user_name || `User ${msg.user_name}`);
      msgBubble.addEventListener("click", () => {
        viewGroupMessageStatus(msg);
      });
    }

    // Determine the message status (only for my messages)
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

    // Insert a date header if necessary
    if (msgDateObj.toDateString() !== now.toDateString() && msgDateObj.toDateString() !== lastRenderedDate) {
      const dayHeader = document.createElement('div');
      dayHeader.className = "text-center mini-font-size text-gray-500 my-2";
      dayHeader.innerText = msgDateObj.toLocaleDateString();
      fragment.appendChild(dayHeader);
      lastRenderedDate = msgDateObj.toDateString();
    }

    // Render the message content
    msgBubble.innerHTML = `
      <div class="font-titles font-bold mb-1">${senderDisplay}</div>
      <div class="flex items-center justify-between">
        <span>${msg.content}</span>
      </div>
      <div class="flex items-center justify-end">
        <span class="mini-font-size text-[var(--color-text)] font-dates font-light">${displayTime}  ${status}</span>
      </div>
    `;

    msgWrapper.appendChild(msgBubble);
    fragment.appendChild(msgWrapper);
  });

  if (prepend) {
    // Insert the fragment at the beginning of the container
    container.insertBefore(fragment, container.firstChild);
  } else if (append) {
    // Append the fragment to the end of the container
    container.appendChild(fragment);
  } else {
    // Replace the container's content
    container.appendChild(fragment);
    container.scrollTop = container.scrollHeight;
  }
}