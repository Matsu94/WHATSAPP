import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";
import { currentUserId } from "../constants/const.js";
import { getMessagesError } from "../errors/errors.js";

// loadMessages llama a fetchMessages y luego renderChatMessages
export async function loadMessages(senderId, isGroup) {
    try {
        const messages = await fetchMessages(senderId, isGroup);
        renderChatMessages(messages, currentUserId);

        // Actualiza los mensajes cada segundo
        setInterval(async () => {
            try {
                const updatedMessages = await fetchMessages(senderId, isGroup);
                renderChatMessages(updatedMessages, currentUserId);
            } catch (intervalError) {
                console.error("Error al actualizar mensajes:", intervalError);
            }
        }, 3000);
    } catch (error) {
        console.error(getMessagesError, error);
    }
}