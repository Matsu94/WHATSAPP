import { closeChatWindow } from "./closeChatWindow.js";
import { backgroundSelectionError } from "../errors/errors.js";
//JQUERY para la parte de Petrus
export function openChangeBackgroundGrid() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    const userListDiv = document.getElementById("userListDiv");
    const chatList = document.getElementById("chatList");

    $.get("/WHATSAPP/frontend/components/changeBackgroundGrid.html")
        .done((html) => {
            $(chatWindow).html(html);

            userListDiv.classList.add("hidden");
            chatList.classList.add("hidden");
            chatWindow.classList.remove("hidden");
            // Add event listeners for SVG selection
            $(".bg-option").on("click", function (e) {
                e.preventDefault();
                const selectedBackground = $(this).data("bg");
                sessionStorage.setItem("chatBackground", selectedBackground);
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
            
            // Función que mapea el valor del slider a un tamaño de fuente
            function getFontSizeFromSlider(value) {
                let size = "";
                if (value <= 33) {
                    size = "1.125rem"; // Pequeño
                    return size
                } else if (value > 33 && value <= 66) {
                    size = "1.650rem"; // Normal
                    return size;     // Normal
                } else if (value > 66) {
                    size = "2rem"; // Grande
                    return size; // Grande
                } else if (value === 100){
                    size = "2.5rem"; // Muy grande
                    return size; // Muy grande
                }
            }
            // Al pulsar "Aplicar", actualiza el tamaño de fuente del texto de ejemplo
            $("#applyBtn").on("click", function () {
                let value = $("#fontSizeRange").val();
                const newSize = getFontSizeFromSlider(parseInt(value));
                $("#sampleText").css("font-size", newSize);
            });

            // Al pulsar "Reset", se reinicia el slider y se aplica el tamaño normal
            $("#resetBtn").on("click", function () {
                $("#fontSizeRange").val(50);
                $("#sampleText").css("font-size", getFontSizeFromSlider(50));
            });
        })
        .fail((error) => {
            console.error(`${backgroundSelectionError}`, error);
        });


    // Referencias a los elementos
}
