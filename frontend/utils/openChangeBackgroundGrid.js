import { closeChatWindow } from "./closeChatWindow.js";
import { backgroundSelectionError } from "../errors/errors.js";

// JQUERY para la parte de Petrus
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

            // Variables globales para almacenar los valores originales
            let originalTitleFont, originalBaseFontSize, originalMiniFontSize;

            // Función que inicializa los valores originales al cargar la página
            function storeOriginalFontSizes() {
                const rootStyles = getComputedStyle(document.documentElement);
                originalTitleFont = parseFloat(rootStyles.getPropertyValue('--title-font'));
                originalBaseFontSize = parseFloat(rootStyles.getPropertyValue('--base-font-size'));
                originalMiniFontSize = parseFloat(rootStyles.getPropertyValue('--mini-font-size'));
            }

            // Función que mapea el valor del slider a un tamaño de fuente
            function getFontSizeFromSlider(value) {
                let scaleFactor;

                if (value <= 31) {
                    scaleFactor = 0.7;  // Pequeño
                } else if (value >= 32 && value <= 50) {
                    scaleFactor = 1;    // Normal
                } else if (value > 50 && value <= 64) {
                    scaleFactor = 1.3;  // Grande
                } else if (value > 64) {
                    scaleFactor = 1.6;  // Muy grande
                }

                // Aplicar la escala a los tamaños originales (sin acumular)
                document.documentElement.style.setProperty('--title-font', `${originalTitleFont * scaleFactor}rem`);
                document.documentElement.style.setProperty('--base-font-size', `${originalBaseFontSize * scaleFactor}rem`);
                document.documentElement.style.setProperty('--mini-font-size', `${originalMiniFontSize * scaleFactor}rem`);
            }

            // Evento para aplicar cambios al pulsar el botón "Aplicar"
            $("#applyBtn").on("click", function () {
                let value = parseInt($("#fontSizeRange").val());
                getFontSizeFromSlider(value);
            });

            // Evento para restablecer tamaños al pulsar "Reset"
            $("#resetBtn").on("click", function () {
                $("#fontSizeRange").val(32).change(); // Forzar la bolita a la posición "Normal" y disparar el cambio

                // Aplicar manualmente el tamaño normal
                getFontSizeFromSlider(32);
            });

            // Llamamos a la función al cargar la página
            storeOriginalFontSizes();
        })
        .fail((error) => {
            console.error(`${backgroundSelectionError}`, error);
        });
}
