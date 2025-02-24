import { postMessage, fetchUsersFromGroup } from "../assets/fetching.js";
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

  if (isGroup) {
    try {
      const usersGroup = await fetchUsersFromGroup(messageObj.Receiver); // Pass `groupId`
      const currentUserId = sessionStorage.getItem("user_id");

      // Check if the user exists in the group
      const userExists = usersGroup.some(user => user.user_id.toString() === currentUserId);
      
      if (!userExists) {
        alert("You are not in the group");
        return;
      }
    } catch (error) {
      console.error("Error fetching group users:", error);
      alert("No estás en el grupo.");
      return;
    }
  }

  try {
    await postMessage(messageObj);
    input.value = "";
    loadMessages(senderId, isGroup);
  } catch (error) {
    console.error(sendMessagesError, error);
  }
}
