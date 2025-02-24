import { fetchUsersFromGroup, removeUserFromGroup, updateUserToAdmin, leaveGroup, fetchGroupInfo, updateGroupDescription, updateGroupName, fetchUsersForGroup, addUsersToGroup } from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { currentUserId } from "../constants/const.js";
import * as errors from "../errors/errors.js";


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
            const groupId = group.group_id || group.id;
            groupNameContainer.dataset.groupId = groupId;
            groupNameContainer.innerHTML = `
            <span id="groupNameText" class="title-font font-bold">${group.name}</span>
        `;
        }
        const groupDescriptionContainer = document.getElementById("groupDescription");
        if (groupDescriptionContainer) {
            groupDescriptionContainer.innerHTML = `
            <span id="groupDescText" class="title-font">${group.description}</span>
        `;
        }

        // Si el usuario es administrador, agregar un botón "Edit Group"
        if (isViewerAdmin) {
            const editGroupContainer = document.createElement("div");
            editGroupContainer.className = "mt-4 flex justify-center";
            editGroupContainer.innerHTML = `
            <button id="editGroupBtn" class="flex items-center justify-center px-4 py-2 base-font-size font-medium leading-6 text--[var(--color-text)] whitespace-no-wrap bg-[var(--color-user)] border-2 border-[var(--color-dark)] rounded-full shadow-sm hover:bg-[var(--color-dark)]  hover:text-[var(--color-base)]  hover:border-[var(--color-base)] focus:outline-none font-titles">
                Editar Grupo
            </button>
        `;
            const displaySection = document.getElementById("groupHeaderDisplay");
            displaySection.appendChild(editGroupContainer);
            document.getElementById("editGroupBtn").addEventListener("click", () => {
                document.getElementById("addUsersBtn").classList.add("hidden");
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
                const response = await leaveGroup(group_id);
        
                if (response.ok) {
                    location.reload();  // Reload only if successful
                } else {
                    alert(response.data);  // Show specific error message
                }
            });
        }        

        if (isViewerAdmin) {
            const addUsersBtn = document.getElementById("addUsersBtn");
            addUsersBtn.classList.remove("hidden");
            addUsersBtn.addEventListener("click", () => {
                // Add event listener for the add users button
                addUsersBtn.classList.add("hidden");
                const addUsersForm = document.getElementById("addUsersForm");
                membersContainer.classList.add("hidden");
                groupDescriptionContainer.classList.add("hidden");
                document.getElementById("membersTitle").classList.add("hidden");
                closeGroupOptionsBtn.classList.add("hidden");
                leaveGroupBtn.classList.add("hidden");
                addUsersForm.classList.remove("hidden");
                fetchUsersForGroup()
                    .then(potentialUsers => {
                        // Create a Set of user IDs already in the group for fast lookup
                        const groupUserIds = new Set(users.map(user => user.user_id));
                        // Filter out users who are already in the group
                        const availableMembers = potentialUsers.filter(puser => !groupUserIds.has(puser.user_id));
                        // Insert the users into the form
                        const availableMembersContainer = document.getElementById("availableMembers");
                        availableMembersContainer.innerHTML = availableMembers.map(user => `
                            <div class="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="user-${user.user_id}" 
                                    value="${user.user_id}" 
                                    class="form-checkbox text-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded">
                                <label for="user-${user.user_id}" class="text-[var(--color-text)]">${user.username}</label>
                            </div>
                        `).join('');
                    })
                    .catch(error => console.error(`${errors.getUsersError}`, error));
                    
                const cancelAddUsersBtn = document.getElementById("cancelAddUsers");
                cancelAddUsersBtn.classList.remove("hidden");
                cancelAddUsersBtn.addEventListener("click", () => {
                    addUsersForm.classList.add("hidden");
                    membersContainer.classList.remove("hidden");
                    groupDescriptionContainer.classList.remove("hidden");
                    document.getElementById("membersTitle").classList.remove("hidden");
                    cancelAddUsersBtn.classList.add("hidden");
                    submitAddUsersBtn.classList.add("hidden");
                    addUsersBtn.classList.remove("hidden");
                    closeGroupOptionsBtn.classList.remove("hidden");
                    leaveGroupBtn.classList.remove("hidden");
                });
                const submitAddUsersBtn = document.getElementById("submitAddUsers");
                submitAddUsersBtn.classList.remove("hidden");
                submitAddUsersBtn.addEventListener("click", async () => {
                    const selectedUsers = Array.from(document.querySelectorAll("#availableMembers input:checked"))
                        .map(input => input.value);
                    await addUsersToGroup(group_id, selectedUsers);
                    addUsersForm.classList.add("hidden");
                    location.reload();
                });
            });
        }

    } catch (error) {
        console.error(`${errors.loadingGroupOptionsError}`, error);
        chatWindow.innerHTML = `<p class="text-red-500">${errors.loadingGroupOptionsError}</p>`;
    }
}

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
        document.getElementById("addUsersBtn").classList.remove("hidden");
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
            console.error(`${errors.groupIdError}`);
            return;
        }
        try {
            await updateGroupName(groupId, newName);
            await updateGroupDescription(groupId, newDescription);
            // Actualiza la vista visual con los nuevos datos
            document.getElementById("groupName").innerHTML = `
          <span id="groupNameText" class="title-font font-bold">${newName}</span>
        `;
            document.getElementById("groupDescription").innerHTML = `
          <span id="groupDescText" class="title-font">${newDescription}</span>
        `;
            // Vuelve a mostrar la vista visual y oculta el formulario de edición
            editSection.classList.add("hidden");
            displaySection.classList.remove("hidden");
            document.getElementById("addUsersBtn").classList.remove("hidden");
        } catch (error) {
            console.error(`${errors.saveGroupChangesError}`, error);
            const errorDiv = document.getElementById("createGroupError");
            errorDiv.textContent = `${errors.saveGroupChangesError}`;
            errorDiv.classList.remove("hidden");
        }
    });
}
