import { currentUserId } from "../../constants/const.js";
import { createGroup, fetchUsers } from "../../assets/fetching.js";
import { nameGroupError } from "../../errors/errors.js";

export async function handleCreateGroupFormSubmit() {
    const groupNameInput = document.getElementById("groupNameInput");
    const groupDescriptionInput = document.getElementById("groupDescriptionInput");

    const createGroupError = document.getElementById("createGroupError");

    const name = groupNameInput.value.trim();
    const description = groupDescriptionInput.value.trim();
    const selectedMembers = Array.from(
        document.querySelectorAll('input[type="checkbox"]:checked')
      ).map((checkbox) => checkbox.value);
    const members = selectedMembers.map(member => parseInt(member, 10));
    if (!name) {
        createGroupError.textContent = `${nameGroupError}`;
        return;
    }

    const groupObj = {
        Name: name,
        Description: description,
        Creator_ID: currentUserId,
        Members: members
    };

    try {
        const responseData = await createGroup(groupObj);

        // Opcional: Mostrar un mensaje de éxito
        alert(`Grupo "${name}" creado exitosamente.`);

        // Actualizar la lista de chats (usuarios y grupos)
        const users = await fetchUsers();
        renderUserList(users);

        // Abrir el chat del nuevo grupo
        openChat(responseData.group_id, true, name);

    } catch (error) {
        console.error(`${createGroupError}`, error);
        createGroupError.textContent = `${createGroupError}`;
    }
}