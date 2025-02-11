import { fetchGroupMessageStatus } from "../assets/fetching.js";

export async function viewGroupMessageStatus(msg) {
    const messageId = msg.message_id;

    const statuses = await fetchGroupMessageStatus(messageId);
    showPopup(statuses);
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
    popup.classList.add("popup-overlay");

    // Create the actual message box (borderless, centered)
    const popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");

    // Populate with status data
    popupContent.innerHTML = `
        <h3 class="popup-title">Message Status</h3>
        <ul class="popup-list">
            ${data.map(user => `<li><strong>${user.username}:</strong> ${user.status}</li>`).join("")}
        </ul>
        <button id="closePopup" class="popup-close">Close</button>
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