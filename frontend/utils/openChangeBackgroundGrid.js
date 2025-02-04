import { closeChatWindow } from "./closeChatWindow.js";

export function openChangeBackgroundGrid() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    fetch("/WHATSAPP/frontend/components/changeBackgroundGrid.html")
        .then((response) => response.text())
        .then((html) => {
            chatWindow.innerHTML = html;

            // Add event listeners for SVG selection
            document.querySelectorAll(".bg-option").forEach((option) => {
                option.addEventListener("click", (e) => {
                    e.preventDefault();
                    const selectedBackground = option.getAttribute("data-bg");
                    setChatBackground(selectedBackground);
                    closeChatWindow(); // Close grid after selection
                });
            });

            // Close grid on cancel
            document.getElementById("cancelChangeBackgroundBtn").addEventListener("click", () => {
                closeChatWindow();
            });
        })
        .catch(error => {
            console.error("Error loading background selection:", error);
        });
}

// Function to update the chat background and save it
export function setChatBackground(imageName) {
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
        messagesContainer.style.backgroundImage = `url('/WHATSAPP/frontend/assets/${imageName}')`;
        messagesContainer.style.backgroundSize = "cover";
        messagesContainer.style.backgroundPosition = "center";
        localStorage.setItem("chatBackground", imageName); // Save to localStorage
    }
}
