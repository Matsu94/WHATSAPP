import { fetchUsersFromGroup, removeUserFromGroup, updateUserToAdmin, leaveGroup, fetchGroupInfo, updateGroupDescription, updateGroupName } from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { currentUserId } from "../constants/const.js";
import { loadingGroupForm, getUsersForGroupsError } from "../errors/errors.js";

// Render group options UI
export async function openGroupOptions(group_id) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    try {
        const [group, users] = await Promise.all([
            fetchGroupInfo(group_id),
            fetchUsersFromGroup(group_id),
        ]);

        // Determine if current user is an admin
        const isViewerAdmin = users.some(user => user.user_id === currentUserId && user.is_admin);

        // Load the HTML structure
        const response = await fetch("/WHATSAPP/frontend/components/viewGroupOptions.html");
        const html = await response.text();
        chatWindow.innerHTML = html;

        // Hide chat list and show group options
        document.getElementById("userListDiv").classList.add("hidden");
        document.getElementById("chatList").classList.add("hidden");
        chatWindow.classList.remove("hidden");

        // Set group name and add edit button if user is admin
        const groupNameContainer = document.getElementById("groupName");
        if (groupNameContainer) {
            groupNameContainer.innerHTML = `
                <span id="groupNameText">${group.name}</span>
                ${isViewerAdmin ? '<button id="editGroupName" class="text-blue-500 ml-2">✏️</button>' : ''}
            `;

            if (isViewerAdmin) {
                document.getElementById("editGroupName").addEventListener("click", () => openEditField("groupName", group.name, group_id, "name"));
            }
        }

        // Set group description and add edit button if user is admin
        const groupDescriptionContainer = document.getElementById("groupDescription");
        if (groupDescriptionContainer) {
            groupDescriptionContainer.innerHTML = `
                <span id="groupDescText">${group.description}</span>
                ${isViewerAdmin ? '<button id="editGroupDesc" class="text-blue-500 ml-2">✏️</button>' : ''}
            `;

            if (isViewerAdmin) {
                document.getElementById("editGroupDesc").addEventListener("click", () => openEditField("groupDescription", group.description, group_id, "description"));
            }
        }

        // Populate the members list
        const membersContainer = document.getElementById("groupMembers");
        membersContainer.innerHTML = users.map(user => {
            const isCurrentUser = user.user_id === currentUserId;
            const isUserAdmin = user.is_admin;

            return `
                <div class="user-entry flex items-center justify-between p-2 border rounded bg-[var(--color-light)]">
                  <span class="text-[var(--color-text)]">${isCurrentUser ? "Me" : user.username}</span>
                  ${isViewerAdmin && !isCurrentUser ? `
                    <div class="flex space-x-2">
                      <button class="removeUserBtn text-red-500" data-user-id="${user.user_id}">❌</button>
                      ${!isUserAdmin ? `<button class="promoteUserBtn text-green-500" data-user-id="${user.user_id}">⬆️</button>` : ""}
                    </div>
                  ` : ""}
                </div>
            `;
        }).join('');

        // Add event listeners for remove and promote buttons
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

        // Close button event listener
        const closeGroupOptionsBtn = document.getElementById("closeGroupOptionsBtn");
        closeGroupOptionsBtn.addEventListener("click", () => {
            closeChatWindow();
            document.getElementById("userListDiv").classList.remove("hidden");
            document.getElementById("chatList").classList.remove("hidden");
            chatWindow.classList.add("hidden");
        });
        // Leave group button event listener
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

// Function to open an editable input field
function openEditField(elementId, currentValue, group_id, type) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // Create input/textarea
    const inputField = type === "name"
        ? `<input id="editField" type="text" value="${currentValue}" class="border rounded p-1 w-full focus:outline-none">`
        : `<textarea id="editField" class="border rounded p-1 w-full h-20 focus:outline-none">${currentValue}</textarea>`;

    container.innerHTML = inputField;

    const input = document.getElementById("editField");
    input.focus();

    // Save on Enter or clicking outside
    input.addEventListener("blur", () => saveEditField(elementId, group_id, type, input.value));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && type === "name") {
            e.preventDefault();
            input.blur();
        } else if (e.key === "Escape") {
            cancelEditField(elementId, currentValue, group_id, type);
        }
    });
}

// Function to save the new value
async function saveEditField(elementId, group_id, type, newValue) {
    if (!newValue.trim()) return;

    try {
        if (type === "name") {
            await updateGroupName(group_id, newValue); // ✅ Calls the fixed function
        } else {
            await updateGroupDescription(group_id, newValue); // ✅ Calls the fixed function
        }

        // Restore display with updated text
        const container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = `
                <span id="${type === 'name' ? 'groupNameText' : 'groupDescText'}">${newValue}</span>
                <button id="edit${type === 'name' ? 'GroupName' : 'GroupDesc'}" class="text-blue-500 ml-2">✏️</button>
            `;
            document.getElementById(`edit${type === 'name' ? 'GroupName' : 'GroupDesc'}`)
                .addEventListener("click", () => openEditField(elementId, newValue, group_id, type));
        }
    } catch (error) {
        console.error("Error saving edit:", error);
    }
}


// Function to cancel editing
function cancelEditField(elementId, currentValue, group_id, type) {
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = `
            <span id="${type === 'name' ? 'groupNameText' : 'groupDescText'}">${currentValue}</span>
            <button id="edit${type === 'name' ? 'GroupName' : 'GroupDesc'}" class="text-blue-500 ml-2">✏️</button>
        `;
        document.getElementById(`edit${type === 'name' ? 'GroupName' : 'GroupDesc'}`)
            .addEventListener("click", () => openEditField(elementId, currentValue, group_id, type));
    }
}
