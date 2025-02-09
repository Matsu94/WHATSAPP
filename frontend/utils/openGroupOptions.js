import {
    fetchUsersFromGroup,
    removeUserFromGroup,
    updateUserToAdmin,
    leaveGroup,
    fetchGroupInfo,
    updateGroupDescription,
    updateGroupName
} from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { currentUserId } from "../constants/const.js";
import { loadingGroupForm, getUsersForGroupsError } from "../errors/errors.js";

/**
 * Renderiza la interfaz de opciones del grupo.
 * Carga la información del grupo y la lista de miembros, configura la vista visual y los botones.
 * @param {number} group_id 
 */
export async function openGroupOptions(group_id) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    try {
        const [group, users] = await Promise.all([
            fetchGroupInfo(group_id),
            fetchUsersFromGroup(group_id),
        ]);

        // Determinar si el usuario actual es administrador
        const isViewerAdmin = users.some(user => user.user_id === currentUserId && user.is_admin);

        // Cargar la estructura HTML (vista de grupo) desde tu componente
        const response = await fetch("/WHATSAPP/frontend/components/viewGroupOptions.html");
        const html = await response.text();
        chatWindow.innerHTML = html;

        // Ocultar la lista de usuarios y chats, y mostrar la vista de opciones del grupo
        document.getElementById("userListDiv").classList.add("hidden");
        document.getElementById("chatList").classList.add("hidden");
        chatWindow.classList.remove("hidden");

        // Configurar la vista visual: asignar nombre y descripción
        const groupNameContainer = document.getElementById("groupName");
        if (groupNameContainer) {
            // Usa group.group_id o group.id según corresponda y asígnalo en un data attribute
            const groupId = group.group_id || group.id;
            groupNameContainer.dataset.groupId = groupId;
            groupNameContainer.innerHTML = `
            <span id="groupNameText" class="text-2xl font-bold">${group.name}</span>
        `;
        }
        const groupDescriptionContainer = document.getElementById("groupDescription");
        if (groupDescriptionContainer) {
            groupDescriptionContainer.innerHTML = `
            <span id="groupDescText" class="text-lg">${group.description}</span>
        `;
        }

        // Si el usuario es administrador, agregar un botón "Edit Group" (en la parte inferior del header visual)
        if (isViewerAdmin) {
            const editGroupContainer = document.createElement("div");
            editGroupContainer.className = "mt-4 flex justify-center";
            editGroupContainer.innerHTML = `
            <button id="editGroupBtn" class="px-4 py-2 bg-[var(--color-dark)] text-white rounded hover:bg-opacity-90 text-sm font-titles">
                Edit Group
            </button>
        `;
            const displaySection = document.getElementById("groupHeaderDisplay");
            displaySection.appendChild(editGroupContainer);
            document.getElementById("editGroupBtn").addEventListener("click", () => {
                enterEditMode(group);
            });
        }

        // Renderizar la lista de miembros
        const membersContainer = document.getElementById("groupMembers");
        membersContainer.innerHTML = users.map(user => {
            const isCurrentUser = user.user_id === currentUserId;
            const isUserAdmin = user.is_admin;
            return `
          <div class="user-entry flex items-center justify-between p-2 border rounded bg-[var(--color-light)]">
            <span class="text-[var(--color-text)]">${isCurrentUser ? "Yo" : user.username}</span>
            ${isViewerAdmin && !isCurrentUser ? `
              <div class="flex space-x-2">
                <button class="removeUserBtn text-red-500" data-user-id="${user.user_id}">❌</button>
                ${!isUserAdmin ? `<button class="promoteUserBtn text-green-500" data-user-id="${user.user_id}">⬆️</button>` : ""}
              </div>
            ` : ""}
          </div>
        `;
        }).join('');

        // Agregar listeners para botones de remover y promover usuarios
        document.querySelectorAll(".removeUserBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const userId = e.target.dataset.userId;
                removeUserFromGroup(group_id, userId);
                e.target.closest(".user-entry").remove();
            });
        });

        document.querySelectorAll(".promoteUserBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const userId = e.target.dataset.userId;
                updateUserToAdmin(group_id, userId);
                e.target.closest(".promoteUserBtn").remove();
            });
        });

        // Listener para el botón "Close"
        const closeGroupOptionsBtn = document.getElementById("closeGroupOptionsBtn");
        closeGroupOptionsBtn.addEventListener("click", () => {
            closeChatWindow();
            document.getElementById("userListDiv").classList.remove("hidden");
            document.getElementById("chatList").classList.remove("hidden");
            chatWindow.classList.add("hidden");
        });

        // Listener para el botón "Leave Group"
        const leaveGroupBtn = document.getElementById("leaveGroupBtn");
        if (leaveGroupBtn) {
            leaveGroupBtn.addEventListener("click", async () => {
                await leaveGroup(group_id);
                location.reload();
            });
        }

    } catch (error) {
        console.error("Error loading group options:", error);
        chatWindow.innerHTML = `<p class="text-red-500">Error loading group options.</p>`;
    }
}

/**
 * Entra en modo edición: oculta la vista visual y muestra el formulario de edición
 * para modificar el nombre y la descripción del grupo.
 * Los cambios se guardan solo al pulsar "Save Changes".
 * @param {Object} group - Objeto con las propiedades del grupo (group_id o id, name, description).
 */
function enterEditMode(group) {
    const displaySection = document.getElementById("groupHeaderDisplay");
    const editSection = document.getElementById("groupHeaderEdit");
    if (!displaySection || !editSection) return;

    // Ocultar la vista visual y mostrar el formulario de edición
    displaySection.classList.add("hidden");
    editSection.classList.remove("hidden");

    // Pre-cargar los campos de edición con los valores actuales
    document.getElementById("editGroupName").value = group.name;
    document.getElementById("editGroupDescription").value = group.description;

    // Limpiar cualquier mensaje de error previo
    const errorDiv = document.getElementById("createGroupError");
    if (errorDiv) errorDiv.classList.add("hidden");

    // Configurar el botón "Cancel"
    document.getElementById("cancelEditGroupBtn").addEventListener("click", () => {
        editSection.classList.add("hidden");
        displaySection.classList.remove("hidden");
    });

    // Configurar el botón "Save Changes"
    document.getElementById("saveGroupBtn").addEventListener("click", async () => {
        const newName = document.getElementById("editGroupName").value.trim();
        const newDescription = document.getElementById("editGroupDescription").value.trim();
        if (!newName) {
            alert("El nombre del grupo es obligatorio.");
            return;
        }
        // Obtener el ID del grupo desde el data attribute del contenedor visual
        const groupId = document.getElementById("groupName").dataset.groupId;
        if (!groupId) {
            console.error("No se encontró el ID del grupo.");
            return;
        }
        try {
            await updateGroupName(groupId, newName);
            await updateGroupDescription(groupId, newDescription);
            // Actualiza la vista visual con los nuevos datos
            document.getElementById("groupName").innerHTML = `
          <span id="groupNameText" class="text-2xl font-bold">${newName}</span>
        `;
            document.getElementById("groupDescription").innerHTML = `
          <span id="groupDescText" class="text-lg">${newDescription}</span>
        `;
            // Vuelve a mostrar la vista visual y oculta el formulario de edición
            editSection.classList.add("hidden");
            displaySection.classList.remove("hidden");
        } catch (error) {
            console.error("Error saving group changes:", error);
            const errorDiv = document.getElementById("createGroupError");
            errorDiv.textContent = "Error saving changes. Please try again.";
            errorDiv.classList.remove("hidden");
        }
    });
}
