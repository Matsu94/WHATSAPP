import { renderUserList } from "./utils/renderUserList.js";
import { searchUsers } from "./utils/searchUsers.js";
import { openCreateGroupForm } from "./utils/openCreateGroupForm.js";
import { getUsersError } from "./errors/errors.js";
import { fetchChats } from "./assets/fetching.js";
import { openChangeBackgroundGrid } from "./utils/openChangeBackgroundGrid.js";

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  async function init() {
    try {
      const chats = await fetchChats();
      renderUserList(chats);

      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const filtered = searchUsers(chats, e.target.value);
          renderUserList(filtered);
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

      // Menú desplegable
      const menuBtn = document.getElementById('menuBtn');
      const dropdownMenu = document.getElementById('dropdownMenu');

      menuBtn.addEventListener('click', () => {
          dropdownMenu.classList.toggle('hidden');
      });
      dropdownMenu.addEventListener('mouseleave', () => {
          dropdownMenu.classList.add('hidden');
      });

      // Implementación versión móvil
      const chatList = document.getElementById("chatList");
      const chatContainer = document.getElementById("chatContainer");
      const userListDiv = document.getElementById("userListDiv");

      document.querySelectorAll(".chat-item").forEach(chatItem => {
        chatItem.addEventListener("click", () => {
          userListDiv.classList.add("hidden");
          chatList.classList.add("hidden");
          chatContainer.classList.remove("hidden");
        });
      });

      const openCreateGroup = document.getElementById("createGroupBtn")
        openCreateGroup.addEventListener("click", () => {
          userListDiv.classList.add("hidden");
          chatList.classList.add("hidden");
        });

    } catch (error) {
      console.error(getUsersError, error);
    }
  }

  init();
});