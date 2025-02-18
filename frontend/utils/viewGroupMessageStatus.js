import { fetchGroupMessageStatus } from "../assets/fetching.js";

export async function viewGroupMessageStatus(msg) {
    const messageId = msg.message_id;
    const statuses = await fetchGroupMessageStatus(messageId);
    showPopup(statuses, msg.isMine);
}

function showPopup(data) {
    // Remove existing popup if any
    let existingPopup = document.getElementById("messageStatusPopup");
    if (existingPopup) {
        existingPopup.remove();
    }
    // Create the popup container (semi-transparent background)
    const popup = document.createElement("div");
    popup.id = "messageStatusPopup";
    popup.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-5";

    // Create the actual message box (borderless, centered at the top)
    const popupContent = document.createElement("div");
    popupContent.className = "bg-[var(--color-base)] p-5 rounded-lg shadow-lg max-w-md w-11/12 text-center";

    // Function to convert status to ticks
    function getStatusSymbol(status) {
        if (status === 1) return "✓";
        if (status === 2) return "✓✓";
        if (status === 3) return '<span style="color: #b400b4;">✓✓✓</span>';
        return status; // Fallback in case of unexpected values
    }

    // Populate with status data
    popupContent.innerHTML = `
        <h3 class="title-font font-semibold mb-3">Message Status</h3>
        <ul class="text-left space-y-2">
            ${data.map(user => `<li><strong>${user.username}:</strong> ${getStatusSymbol(user.status)}</li>`).join("")}
        </ul>
        <button id="closePopup" class="mt-4 px-4 py-2 base-font-size font-medium leading-6 text--[var(--color-text)] whitespace-no-wrap bg-[var(--color-user)] border-2 border-[var(--color-dark)] rounded-full shadow-sm hover:bg-[var(--color-dark)]  hover:text-[var(--color-base)]  hover:border-[var(--color-base)] focus:outline-none font-titles">Close</button>
    `;

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    // Close pop-up event listeners
    document.getElementById("closePopup").addEventListener("click", () => popup.remove());
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") popup.remove();
    });

    // Close on outside click
    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.remove();
    });
}
