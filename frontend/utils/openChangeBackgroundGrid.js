import { closeChatWindow } from "./closeChatWindow.js";
//JQUERY para la parte de Petrus
export function openChangeBackgroundGrid() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    const userListDiv = document.getElementById("userListDiv");
    const chatList = document.getElementById("chatList");

    $.get("/WHATSAPP/frontend/components/changeBackgroundGrid.html")
        .done((html) => {
            $(chatWindow).html(html);

            if (window.innerWidth < 768) {
                userListDiv.classList.add("hidden");
                chatList.classList.add("hidden");
                chatWindow.classList.remove("hidden");
            }
            // Add event listeners for SVG selection
            $(".bg-option").on("click", function (e) {
                e.preventDefault();
                const selectedBackground = $(this).data("bg");
                localStorage.setItem("chatBackground", selectedBackground); // Save to localStorage
                closeChatWindow(); // Close grid after selection
                userListDiv.classList.remove("hidden");
                chatList.classList.remove("hidden");
                chatWindow.classList.add("hidden");
            });

            // Close grid on cancel
            $("#cancelChangeBackgroundBtn").on("click", function () {
                closeChatWindow();
                
                    userListDiv.classList.remove("hidden");
                    chatList.classList.remove("hidden");
                    chatWindow.classList.add("hidden");
                
            });
        })
        .fail((error) => {
            console.error("Error loading background selection:", error);
        });
}
