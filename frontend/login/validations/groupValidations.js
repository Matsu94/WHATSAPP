import { currentUserId } from "../../constants/const.js";
import { createGroup, fetchUsers } from "../../assets/fetching.js";

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
        createGroupError.textContent = "El nombre del grupo es obligatorio.";
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
        console.log("Grupo creado con ID:", responseData.group_id);

        // Opcional: Mostrar un mensaje de éxito
        alert(`Grupo "${name}" creado exitosamente.`);

        // Actualizar la lista de chats (usuarios y grupos)
        const users = await fetchUsers();
        renderUserList(users);

        // Abrir el chat del nuevo grupo
        openChat(responseData.group_id, true, name);

    } catch (error) {
        console.error("Error al crear grupo:", error);
        createGroupError.textContent = "Error al crear el grupo. Intenta de nuevo.";
    }
}