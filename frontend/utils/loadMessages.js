import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";
import { currentUserId } from "../constants/const.js";
import { getMessagesError } from "../errors/errors.js";

// loadMessages llama a fetchMessages y luego renderChatMessages
export async function loadMessages(senderId, isGroup) {
    try {
        const messages = await fetchMessages(senderId, isGroup);

        renderChatMessages(messages, currentUserId);
    } catch (error) {
        console.error(getMessagesError, error);
    }
}

