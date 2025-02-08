import { fetchUsersFromGroup, fetchRemoveUserFromGroup, fetchPromoteUserToAdmin, fetchLeaveGroup } from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { currentUserId } from "../constants/const.js";
import { loadingGroupForm, getUsersForGroupsError } from "../errors/errors.js";

// Render group options UI
export function openGroupOptions(group_id) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    const userListDiv = document.getElementById("userListDiv");
    const chatList = document.getElementById("chatList");

    // Fetch users in the group
    fetchUsersFromGroup(group_id)
        .then(users => {
            fetch("/WHATSAPP/frontend/components/viewGroupOptions.html")
                .then(response => response.text())
                .then(html => {
                    chatWindow.innerHTML = html;

                    // Hide chat list and show group options
                    userListDiv.classList.add("hidden");
                    chatList.classList.add("hidden");
                    chatWindow.classList.remove("hidden");

                    // Insert users into the group members list
                    const membersContainer = document.getElementById("groupMembers");
                    const isViewerAdmin = users.some(user => user.user_id === currentUserId && user.is_admin);

                    membersContainer.innerHTML = users.map(user => {
                      const isCurrentUser = user.user_id === currentUserId;
                      const isUserAdmin = user.is_admin; // Check if this user is already an admin

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


                    // Add event listeners for buttons
                    document.querySelectorAll(".removeUserBtn").forEach(btn => {
                        btn.addEventListener("click", (e) => {
                            const userId = e.target.dataset.userId;
                            fetchRemoveUserFromGroup(group_id, userId);
                            e.target.closest(".user-entry").remove(); 
                        });
                    });

                    document.querySelectorAll(".promoteUserBtn").forEach(btn => {
                        btn.addEventListener("click", (e) => {
                            const userId = e.target.dataset.userId;
                            fetchPromoteUserToAdmin(group_id, userId);
                            e.target.closest(".promoteUserBtn").remove(); 
                        });
                    });

                    // Event listener for Close button
                    const closeGroupOptionsBtn = document.getElementById("closeGroupOptionsBtn");
                    closeGroupOptionsBtn.addEventListener("click", () => {
                        closeChatWindow();
                        userListDiv.classList.remove("hidden");
                        chatList.classList.remove("hidden");
                        chatWindow.classList.add("hidden");
                    });

                    // Event listener for Leave Group button
                    const leaveGroupBtn = document.getElementById("leaveGroupBtn");
                    if (leaveGroupBtn) {
                        leaveGroupBtn.addEventListener("click", () => {
                            fetchLeaveGroup(group_id);
                            location.reload();
                        });
                    }
                })
                .catch(error => {
                    console.error(`${loadingGroupForm}`, error);
                    chatWindow.innerHTML = `<p class="text-red-500">${loadingGroupForm}.</p>`;
                });
        })
        .catch(error => {
            console.error(`${getUsersForGroupsError}`, error);
            chatWindow.innerHTML = `<p class="text-red-500">${getUsersForGroupsError}</p>`;
        });
}