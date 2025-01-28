import { postMessage } from "../assets/fetching.js";
import { loadMessages } from "./loadMessages.js";
import { sendMessagesError } from "../errors/errors.js";
import { currentUserId } from "../constants/const.js";

//sendMessage con POST real a /sendMessage y luego refrescamos
export async function sendMessage(senderId, isGroup) {
    const input = document.getElementById("newMessageInput");
    if (!input) return;
  
    const text = input.value.trim();
    if (!text) return;
  
    const messageObj = {
      Content: text, 
      Date: null,
      Status: 1,
      Sender: currentUserId.toString(),
      Receiver: senderId.toString(),
      isGroup: isGroup
    };
  
    try {
      const responseData = await postMessage(messageObj);  // <-- fetch POST
  
      input.value = "";
      loadMessages(senderId, isGroup);
    } catch (error) {
      console.error(sendMessagesError, error);
    }
  }
  