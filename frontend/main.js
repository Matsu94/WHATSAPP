import { fetchUsers } from "./assets/fetching.js";
import { renderUserList } from "./utils/renderUserList.js";
import { searchUsers } from "./utils/searchUsers.js";
import { openCreateGroupForm } from "./utils/openCreateGroupForm.js";
import { getUsersError } from "./errors/errors.js";

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
    async function init() {
      try {
        const users = await fetchUsers();
        renderUserList(users);
  
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.addEventListener("input", (e) => {
            const filtered = searchUsers(users, e.target.value);
            renderUserList(filtered);
          });
        }
  
        const createGroupBtn = document.getElementById("createGroupBtn");
  if (createGroupBtn) {
    createGroupBtn.addEventListener("click", () => {
      openCreateGroupForm();
    });
  }
  
      } catch (error) {
        console.error(getUsersError, error);
        // Manejo de error si deseas
      }
    }
  
    init(); 
  });