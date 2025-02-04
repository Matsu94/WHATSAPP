import { closeChatWindow } from "./closeChatWindow.js";
//JQUERY para la parte de Petrus
export function openChangeBackgroundGrid() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    $.get("/WHATSAPP/frontend/components/changeBackgroundGrid.html")
        .done((html) => {
            $(chatWindow).html(html);

            // Add event listeners for SVG selection
            $(".bg-option").on("click", function (e) {
                e.preventDefault();
                const selectedBackground = $(this).data("bg");
                localStorage.setItem("chatBackground", selectedBackground); // Save to localStorage
                closeChatWindow(); // Close grid after selection
            });

            // Close grid on cancel
            $("#cancelChangeBackgroundBtn").on("click", function () {
                closeChatWindow();
            });
        })
        .fail((error) => {
            console.error("Error loading background selection:", error);
        });
}
