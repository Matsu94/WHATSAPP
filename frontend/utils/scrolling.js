import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";

// Variables globales para el offset y el límite
let currentOffset = 0;
const limit = 10;
let isLoadingMessages = false;  // Para evitar llamadas múltiples simultáneas
//let prepend = true;  // Para saber si se están cargando mensajes antiguos
export function initScrollPagination(senderId, isGroup) {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return;

    messagesContainer.addEventListener("scroll", async function() {
        // Cuando el scroll llegue a la parte superior y no se esté cargando ya otro lote
        if (this.scrollTop === 0 && !isLoadingMessages) {
            isLoadingMessages = true;
            currentOffset += limit;  // Incrementamos el offset para cargar mensajes anteriores

            await loadOlderMessages(senderId, isGroup);
            isLoadingMessages = false;
        }
    });
}

async function loadOlderMessages(senderId, isGroup) {
    try {
        const messagesContainer = document.getElementById("messagesContainer");
        const previousScrollHeight = messagesContainer.scrollHeight;

        // Solicitamos el lote de mensajes antiguos usando el offset actualizado
        const olderMessages = await fetchMessages(senderId, isGroup, currentOffset);
        if (olderMessages.length < limit){
            // Si ya no hay más mensajes, se resetea el offset (o se puede manejar de otra forma)
            currentOffset = 0;
            //prepend = false;
        }

        // Renderizamos y prependemos sin borrar los mensajes existentes
        renderChatMessages(olderMessages, {prepend:true} );

        // Ajustamos el scroll para mantener la posición en la pantalla
        const newScrollHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop = newScrollHeight - previousScrollHeight;
    } catch (error) {
        console.error("Error cargando mensajes antiguos:", error);
    }
}