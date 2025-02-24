import { renderUserList } from "./utils/renderUserList.js";
import { searchUsers, searchChats } from "./utils/searchUsers.js";
import { openCreateGroupForm } from "./utils/openCreateGroupForm.js";
import { getUsersError } from "./errors/errors.js";
import { fetchChats, fetchUsers, fetchUnreadMessages } from "./assets/fetching.js";
import { openChangeBackgroundGrid } from "./utils/openChangeBackgroundGrid.js";
import { showUsers } from "./utils/showAllUsers.js";
import { token } from "./constants/const.js";

// Inicialización
window.addEventListener("DOMContentLoaded", () => {

  async function init() {
    try {
      if (!token) {
        window.location.href = `/WHATSAPP/frontend/login/login.html`;
      }

      const chats = await fetchChats();
      
      let isSearching = false; // Track whether a search is happening

      if (chats.length === 0) {
        isSearching = true;
        const users = await fetchUsers();
        showUsers(users);
      } else {
        renderUserList(chats);
      }


      async function updateUserList() {
        if (isSearching) return; // Skip updating if a search is active
        try {
          const chats = await fetchChats();
          const unreadMessages = await fetchUnreadMessages();
    
          // Convert unreadMessages into a lookup object
          const unreadLookup = {};
          unreadMessages.forEach(msg => {
            unreadLookup[msg.chat_name] = msg.unread_messages;
          });
    
          renderUserList(chats, unreadLookup);
        } catch (error) {
          console.error("Error updating user list:", error);
        }
      }

      // Start periodic updates
      const intervalId = setInterval(updateUserList, 10000);

      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const query = e.target.value.trim();
          isSearching = query.length > 0; // Set isSearching to true if there's a search term

          const filtered = searchChats(chats, query);
          renderUserList(filtered);

          // If search is cleared, trigger an immediate refresh
          if (!isSearching) {
            updateUserList();
          }
        });
      }

      const createGroupBtn = document.getElementById("createGroupBtn");
      if (createGroupBtn) {
        createGroupBtn.addEventListener("click", () => {
          openCreateGroupForm();
        });
      }

      const changeBackgroundBtn = document.getElementById("changeBackgroundBtn");
      if (changeBackgroundBtn) {
        changeBackgroundBtn.addEventListener("click", () => {
          openChangeBackgroundGrid();
        });
      }

      const createNewChat = document.getElementById("createNewChat");
      if (createNewChat) {
        createNewChat.addEventListener("click", async () => {
          isSearching = true;
          try {
            const users = await fetchUsers();
            if (searchInput) {
              searchInput.addEventListener("input", (e) => {
                const usersFiltered = searchUsers(users, e.target.value);
                showUsers(usersFiltered);
              });
            }
            showUsers(users);
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        });
      }

      // Menú desplegable
      const menuBtn = document.getElementById("menuBtn");
      const dropdownMenu = document.getElementById("dropdownMenu");

      menuBtn.addEventListener("click", () => {
        dropdownMenu.classList.toggle("hidden");
      });
      dropdownMenu.addEventListener("mouseleave", () => {
        dropdownMenu.classList.add("hidden");
      });

      // Implementación versión móvil
      const chatList = document.getElementById("chatList");
      const chatContainer = document.getElementById("chatContainer");
      const userListDiv = document.getElementById("userListDiv");

      document.querySelectorAll(".chat-item").forEach((chatItem) => {
        chatItem.addEventListener("click", () => {
          userListDiv.classList.add("hidden");
          chatList.classList.add("hidden");
          chatContainer.classList.remove("hidden");
        });
      });

      const openCreateGroup = document.getElementById("createGroupBtn");
      openCreateGroup.addEventListener("click", () => {
        userListDiv.classList.add("hidden");
        chatList.classList.add("hidden");
      });

      changeBackgroundBtn.addEventListener("click", () => {
        userListDiv.classList.add("hidden");
        chatList.classList.add("hidden");
      });

    } catch (error) {
      console.error(getUsersError, error);
    }
  }

  init();
});
