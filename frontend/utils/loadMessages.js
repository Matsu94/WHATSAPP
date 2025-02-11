import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";
import { currentUserId } from "../constants/const.js";
import { getMessagesError } from "../errors/errors.js";

let offset = 0;
// loadMessages llama a fetchMessages y luego renderChatMessages
export async function loadMessages(senderId, isGroup) {
    try {
        const messages = await fetchMessages(senderId, isGroup, offset);

        renderChatMessages(messages, currentUserId);
    } catch (error) {
        console.error(getMessagesError, error);
    }
}

