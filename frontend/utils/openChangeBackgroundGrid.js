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
                    localStorage.setItem("chatBackground", selectedBackground); // Save to localStorage
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
    // Guardar en localStorage
    localStorage.setItem("chatBackground", imageName);
}