import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";

// Declaramos variables globales para el offset y el límite
let currentOffset = 0;
const limit = 10;
let isLoadingMessages = false;  // Evitar llamadas múltiples simultáneas

// Función que se encargará de inicializar el scroll infinito en el contenedor de mensajes
export function initScrollPagination(senderId, isGroup) {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return;

    messagesContainer.addEventListener("scroll", async function() {
        // Si el scroll está en la parte superior y no se está cargando ya un lote de mensajes
        if (this.scrollTop === 0 && !isLoadingMessages) {
            isLoadingMessages = true;
            currentOffset += limit;  // Incrementamos el offset para cargar mensajes anteriores

            // Llamamos a la función para cargar mensajes antiguos
            await loadOlderMessages(senderId, isGroup);
            isLoadingMessages = false;
        }
    });
}

// Función para cargar y prepender los mensajes antiguos
async function loadOlderMessages(senderId, isGroup) {
    try {
        const messagesContainer = document.getElementById("messagesContainer");
        // Guardamos la altura actual para ajustar el scroll posteriormente
        const previousScrollHeight = messagesContainer.scrollHeight;

        // Se solicita el lote de mensajes antiguos utilizando el offset actualizado
        const olderMessages = await fetchMessages(senderId, isGroup, currentOffset);
        if (!olderMessages.length){
            currentOffset = 0;
            return;
        }

        // Se prepende el lote de mensajes al contenedor sin borrar los existentes
        prependChatMessages(olderMessages);

        // Ajustamos el scroll para mantener la posición en la pantalla,
        // calculando la diferencia de altura tras agregar los mensajes nuevos
        const newScrollHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop = newScrollHeight - previousScrollHeight;
    } catch (error) {
        console.error("Error cargando mensajes antiguos:", error);
    }
}

// Función para crear los elementos de mensajes y agregarlos al inicio del contenedor
function prependChatMessages(messages) {
    const container = document.getElementById("messagesContainer");
    if (!container) return; 
    // Se crea un fragment para optimizar la inserción
    const fragment = document.createDocumentFragment();
    fragment = renderChatMessages(messages);
    

    // Se insertan los nuevos mensajes al principio del contenedor
    container.insertBefore(fragment, container.firstChild);
}
